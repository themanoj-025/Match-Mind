import { env } from './config/env'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import logger from './utils/logger'
import { app } from './app'
import { configurePassport } from './config/passport'
import { checkAuctionTimer } from './services/auctionEngine'
import { setupSocket } from './socket'
import { errorHandler } from './middleware/errorHandler'
import './workers'

// Initialize Postgres Database with Prisma
// Hardening: Enforce connection pooling limits and statement timeouts
const dbUrl = new URL(env.DATABASE_URL)
if (!dbUrl.searchParams.has('connection_limit')) dbUrl.searchParams.set('connection_limit', '20')
if (!dbUrl.searchParams.has('pool_timeout')) dbUrl.searchParams.set('pool_timeout', '10')
if (!dbUrl.searchParams.has('statement_timeout')) dbUrl.searchParams.set('statement_timeout', '10000') // 10s

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl.toString(),
    },
  },
})
let dbInitialized = false

async function initDatabase(): Promise<void> {
  try {
    await prisma.$connect()
    dbInitialized = true
    logger.info({ event: 'database.initialized', dbType: 'postgres' }, 'MatchMind Postgres Database initialized')
  } catch (err: any) {
    logger.error(
      { event: 'database.initialization_failed', err: err.message },
      'Failed to connect to Postgres Database',
    )
    process.exit(1)
  }
}

// Initialize Passport strategies
configurePassport(prisma)

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// Make prisma accessible
app.set('prisma', prisma)
app.set('io', io)

// Health check route (before error handler)
import { publicLimiter } from './middleware/rateLimiter'
app.get('/api/health', publicLimiter, async (req, res) => {
  const checks: Record<string, any> = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'ok', type: 'postgres' },
    },
  }

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`
  } catch {
    checks.checks.database.status = 'degraded'
    checks.checks.database.error = 'database connection failed'
    checks.status = 'degraded'
  }

  // Return 503 if degraded
  if (checks.status === 'degraded') {
    res.status(503).json(checks)
  } else {
    res.json(checks)
  }
})

// Error handler MUST be last
app.use(errorHandler)

// Setup Socket.io
setupSocket(io, prisma)

// Make prisma accessible to services for socket emission
;(prisma as any)._app = app

// ─── Auction Timer Expiry Check ────────────────────────────────────
const AUCTION_TICK_INTERVAL_MS = 2000
let auctionTimerInterval: ReturnType<typeof setInterval> | null = null

interface RoomWithId {
  id: string
  status: string
}

async function tickAuctionTimers(): Promise<void> {
  try {
    const rooms: RoomWithId[] = await prisma.room.findMany({
      where: { status: 'DRAFTING' },
      select: { id: true, status: true },
    })

    for (const room of rooms) {
      try {
        const beforeState = await prisma.auctionState.findUnique({ where: { roomId: room.id } })
        const result = await checkAuctionTimer(
          room.id,
          async (roomId: string) => {
            const state = await prisma.auctionState.findUnique({ where: { roomId } })
            return state ? (state as any) : null
          },
          async (roomId: string, state: any) => {
            const expectedVersion = state.version - 1
            const updateRes = await prisma.auctionState.updateMany({
              where: { roomId, version: expectedVersion },
              data: { ...state }
            })
            if (updateRes.count === 0) {
              throw new Error('OPTIMISTIC_CONCURRENCY_CONFLICT')
            }
          },
          async (roomId: string, userId: string, amount: number) => {
            await prisma.roomMember.update({
              where: { roomId_userId: { roomId, userId } },
              data: { remainingBudget: { increment: -amount } },
            })
          },
          async (entry: { roomId: string; userId: string; playerId: string; soldPrice: number }) => {
            await prisma.roster.create({
              data: {
                ...entry,
                acquiredAt: new Date().toISOString(),
                isCaptain: false,
                isViceCaptain: false,
              },
            })
          },
        )

        if (result) {
          const io_instance: any = app.get('io')
          if (io_instance) {
            if (result.action === 'SOLD_AND_NEXT') {
              io_instance.to(`room:${room.id}`).emit('PLAYER_SOLD', {
                roomId: room.id,
                playerId: beforeState?.currentPlayerId,
                buyerId: beforeState?.currentBidderId,
                price: beforeState?.currentBid,
              })
              logger.info({ event: 'auction.timer_sold', roomId: room.id })
            } else if (result.action === 'UNSOLD_AND_NEXT') {
              io_instance.to(`room:${room.id}`).emit('PLAYER_UNSOLD', {
                roomId: room.id,
                playerId: beforeState?.currentPlayerId,
              })
              logger.info({ event: 'auction.timer_unsold', roomId: room.id })
            } else if (result.action === 'FINISHED' || result.state?.phase === 'FINISHED') {
              await prisma.room.update({ where: { id: room.id }, data: { status: 'COMPLETED' } })
              io_instance.to(`room:${room.id}`).emit('AUCTION_FINISHED', { roomId: room.id })
              logger.info({ event: 'auction.timer_finished', roomId: room.id })
            } else if (result.state?.phase === 'RE_AUCTION') {
              io_instance
                .to(`room:${room.id}`)
                .emit('RE_AUCTION_STARTED', { roomId: room.id, poolQueue: result.state.poolQueue })
              logger.info({ event: 'auction.timer_re_auction', roomId: room.id })
            }
          }
        }
      } catch (roomErr: any) {
        logger.error({ event: 'auction.timer_room_error', roomId: room.id, err: roomErr.message })
      }
    }
  } catch (err: any) {
    logger.error({ event: 'auction.timer_error', err: err.message }, 'Auction timer tick error')
  }
}

function startAuctionTimer(): void {
  auctionTimerInterval = setInterval(tickAuctionTimers, AUCTION_TICK_INTERVAL_MS)
  logger.info({ event: 'auction.timer_started', intervalMs: AUCTION_TICK_INTERVAL_MS })
}

function stopAuctionTimer(): void {
  if (auctionTimerInterval) {
    clearInterval(auctionTimerInterval)
    auctionTimerInterval = null
    logger.info({ event: 'auction.timer_stopped' })
  }
}

const PORT = parseInt(env.PORT || '5000', 10)

// Start database then server
initDatabase().then(() => {
  httpServer.listen(PORT, () => {
    logger.info(
      { event: 'server.start', port: PORT, env: env.NODE_ENV || 'development' },
      `MatchMind API server running on port ${PORT}`,
    )
  })
  startAuctionTimer()
})

// Graceful shutdown
const shutdown = async (signal: string): Promise<void> => {
  logger.info({ event: 'server.shutdown', signal }, `${signal} received. Starting graceful shutdown...`)

  const forceExit = setTimeout(() => {
    logger.error({ event: 'server.shutdown_timeout' }, 'Graceful shutdown timed out after 10s. Force exiting.')
    process.exit(1)
  }, 10000)
  forceExit.unref()

  try {
    stopAuctionTimer()
    await new Promise<void>((resolve) => httpServer.close(() => resolve()))
    logger.info({ event: 'server.http_closed' }, 'HTTP server closed')
    await prisma.$disconnect()
    logger.info({ event: 'server.db_closed' }, 'MatchMind Database persisted and closed')
  } catch (err: any) {
    logger.error({ event: 'server.shutdown_error', err: err.message }, 'Error during graceful shutdown')
  }

  clearTimeout(forceExit)
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

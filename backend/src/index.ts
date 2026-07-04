// ─── Sentry instrumentation (must be first) ────────────────────────────
if (process.env.SENTRY_DSN) {
  await import('../instrument')
}

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { createJsonDatabase } from './lib/jsonDb'

// ─── Validate required environment variables ──────────────────────────
import logger from './utils/logger'

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'JWT_REFRESH_SECRET']
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    logger.fatal({ event: 'startup.env_missing', envVar }, `Required environment variable ${envVar} is not set.`)
    process.exit(1)
  }
}

// In production, JWT_RESET_SECRET must be distinct from JWT_SECRET
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_RESET_SECRET) {
    logger.fatal({ event: 'startup.env_missing' }, 'JWT_RESET_SECRET is required in production mode')
    process.exit(1)
  }
}

// Initialize JSON Database (AuctionXI production database)
const prisma = createJsonDatabase()
let dbInitialized = false

async function initDatabase(): Promise<void> {
  try {
    await prisma.initialize()
    dbInitialized = true
    logger.info({ event: 'database.initialized', dbType: 'json-file' }, 'AuctionXI JSON Database initialized')

    // Log record counts per model
    const counts: Record<string, number> = {}
    for (const [name, records] of Object.entries(prisma.data)) {
      if (Array.isArray(records)) counts[name] = records.length
    }
    logger.info({ event: 'database.stats', counts }, `Database loaded: ${Object.values(counts).reduce((a, b) => a + b, 0)} total records`)
  } catch (err: any) {
    logger.error({ event: 'database.initialization_failed', err: err.message }, 'Failed to initialize JSON Database')
    process.exit(1)
  }
}

// Initialize Passport strategies with shared database
import { configurePassport } from './config/passport'
configurePassport(prisma)

// ─── Import auction engine timer ────────────────────────────────────
import { checkAuctionTimer } from './services/auctionEngine'

// ─── Import Routes ───────────────────────────────────────────────────
import authRoutes from './routes/auth'
import tournamentRoutes from './routes/tournaments'
import playerRoutes from './routes/players'
import roomRoutes from './routes/rooms'
import auctionRoutes from './routes/auction'
import franchiseRoutes from './routes/franchises'
import fixtureRoutes from './routes/fixtures'
import leaderboardRoutes from './routes/leaderboard'
import userRoutes from './routes/users'
import messageRoutes from './routes/messages'
import searchRoutes from './routes/search'
import adminRoutes from './routes/admin'
import stripeRoutes from './routes/stripe'
import aiRoutes from './routes/ai'
import { setupSocket } from './socket'
import { globalLimiter, authLimiter, passwordResetLimiter } from './middleware/rateLimiter'

const app = express()

// ─── Global rate limiter (applied before everything) ──────────────────
app.use(globalLimiter)
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(pinoHttp({ logger } as any))

// Stripe webhook needs raw body BEFORE express.json() consumes it
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

// Make prisma accessible
app.set('prisma', prisma)
app.set('io', io)

// ─── API Routes ───────────────────────────────────────────────────────
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/signup', authLimiter)
app.use('/api/auth/forgot-password', passwordResetLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/players', playerRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/rooms', auctionRoutes)    // /api/rooms/:roomId/auction/*
app.use('/api/rooms', franchiseRoutes)  // /api/rooms/:roomId/franchises/*
app.use('/api/fixtures', fixtureRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/ai', aiRoutes)

// Health check (before error handler)
app.get('/api/health', (_req, res) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'ok', type: 'json-file' },
    },
  }
  res.json(checks)
})

// Error handler — must be last
import { errorHandler } from './middleware/errorHandler'
app.use(errorHandler)

// Setup Socket.io
setupSocket(io, prisma)

// Make prisma accessible to services for socket emission
;(prisma as any)._app = app

// ─── Auction Timer Expiry Check ────────────────────────────────────
// Runs every 2 seconds to auto-advance auctions when player timers expire.
// This is the server-authoritative timer mechanism — clients only render
// the countdown from timerEndsAt, never decide outcomes.
const AUCTION_TICK_INTERVAL_MS = 2000
let auctionTimerInterval: ReturnType<typeof setInterval> | null = null

interface RoomWithId { id: string; status: string }

async function tickAuctionTimers(): Promise<void> {
  try {
    // Get all rooms currently in DRAFTING status
    const rooms: RoomWithId[] = await prisma.room.findMany({
      where: { status: 'DRAFTING' },
      select: { id: true, status: true },
    })

    for (const room of rooms) {
      try {
        // Capture state before timer check (for socket emit details)
        const beforeState = await prisma.auctionState.findUnique({ where: { roomId: room.id } })
        const result = await checkAuctionTimer(
          room.id,
          async (roomId: string) => {
            const state = await prisma.auctionState.findUnique({ where: { roomId } })
            return state || null
          },
          async (roomId: string, state: any) => {
            await prisma.auctionState.update({ where: { roomId }, data: { ...state } })
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
            // Emit standard events per §8.2 so the frontend can react
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
              // Update room status to COMPLETED
              await prisma.room.update({ where: { id: room.id }, data: { status: 'COMPLETED' } })
              io_instance.to(`room:${room.id}`).emit('AUCTION_FINISHED', { roomId: room.id })
              logger.info({ event: 'auction.timer_finished', roomId: room.id })
            } else if (result.state?.phase === 'RE_AUCTION') {
              io_instance.to(`room:${room.id}`).emit('RE_AUCTION_STARTED', { roomId: room.id, poolQueue: result.state.poolQueue })
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

const PORT = parseInt(process.env.PORT || '4000', 10)

// Start database then server
initDatabase().then(() => {
  httpServer.listen(PORT, () => {
    logger.info({ event: 'server.start', port: PORT, env: process.env.NODE_ENV || 'development' }, `AuctionXI API server running on port ${PORT}`)
  })
  // Start auction timer expiry check
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
    // 0. Stop auction timer
    stopAuctionTimer()

    // 1. Stop accepting new connections
    await new Promise<void>((resolve) => httpServer.close(() => resolve()))
    logger.info({ event: 'server.http_closed' }, 'HTTP server closed')

    // 2. Persist JSON database (creates shutdown backup)
    await prisma.$disconnect()
    logger.info({ event: 'server.db_closed' }, 'AuctionXI Database persisted and closed')
  } catch (err: any) {
    logger.error({ event: 'server.shutdown_error', err: err.message }, 'Error during graceful shutdown')
  }

  clearTimeout(forceExit)
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

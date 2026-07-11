import { env } from './config/env'
// ─── Sentry instrumentation (must be first) ────────────────────────────
if (env.SENTRY_DSN) {
  require('../instrument')
}

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import pinoHttp from 'pino-http'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import swaggerUi from 'swagger-ui-express'
import { generateOpenAPI } from './config/openapi'
import { requestId } from './middleware/requestId'

// ─── Validate required environment variables ──────────────────────────
import logger from './utils/logger'

// Environment is validated automatically via import of `env`

// Verify all JWT secrets are distinct — fail fast on identical secrets
const jwtSecrets = {
  JWT_SECRET: env.JWT_SECRET,
  JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
  JWT_RESET_SECRET: env.JWT_RESET_SECRET,
}

const secretKeys = Object.keys(jwtSecrets) as (keyof typeof jwtSecrets)[]
for (let i = 0; i < secretKeys.length; i++) {
  for (let j = i + 1; j < secretKeys.length; j++) {
    const key1 = secretKeys[i]
    const key2 = secretKeys[j]
    if (key1 && key2 && jwtSecrets[key1] === jwtSecrets[key2]) {
      logger.fatal(
        { event: 'startup.env_invalid', key1, key2 },
        `CRITICAL SECURITY ERROR: ${key1} and ${key2} cannot be identical.`
      )
      process.exit(1)
    }
  }
}

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
import draftRoutes from './routes/draft'
import testQueueRoutes from './routes/testQueue'
import './workers'
import { setupSocket } from './socket'
import { globalLimiter, authLimiter, passwordResetLimiter, publicLimiter } from './middleware/rateLimiter'
import asyncHandler from './middleware/asyncHandler'

const app = express()

// ─── Request-ID MUST be first (available for every downstream log line) ───
app.use(requestId)

// ─── Response compression ───────────────────────────────────
app.use(compression())

// ─── CORS must be first so preflight OPTIONS requests are handled before any other middleware ───
const corsMiddleware = cors({ origin: env.FRONTEND_URL || 'http://localhost:3000', credentials: true })
app.use(corsMiddleware)

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// ─── Security headers (Helmet with explicit CSP) — after CORS ──────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://js.stripe.com',
          'https://www.googletagmanager.com',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        connectSrc: ["'self'", 'https://api.stripe.com', 'https://o*.sentry.io', 'https://sentry.io'],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
)

// ─── HTTPS redirect — before routes, before rate limiter, after CORS/Helmet ──
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  const proto = (req.headers['x-forwarded-proto'] as string) || ''
  if (proto === 'http' || proto.startsWith('http,')) {
    res.redirect(301, `https://${req.headers.host}${req.url}`)
  } else {
    next()
  }
})

// ─── Rate limiters — before pino-http to reduce noise ──────────────
app.use(globalLimiter)

app.use(
  pinoHttp({
    logger,
    // Include request ID in all pino-http log lines
    customProps: (req: any) => ({
      requestId: req.id,
    }),
  } as any),
)

// Stripe webhook needs raw body BEFORE express.json() consumes it
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

// ─── CSRF protection (double-submit cookie pattern) ────────────────
// Applied AFTER cookieParser so req.cookies is available.
// Skips GET/HEAD/OPTIONS and Bearer token requests automatically.
// Stripe webhook is exempted via path check inside the middleware.
import { csrfProtection } from './middleware/csrf'
app.use(csrfProtection)

// Make prisma accessible
app.set('prisma', prisma)
app.set('io', io)

// ─── API Documentation (OpenAPI / Swagger) ───────────────────
app.get('/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(generateOpenAPI())
})

if (env.NODE_ENV !== 'production') {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(generateOpenAPI()))
}

// ─── API Routes ───────────────────────────────────────────────────────
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/signup', authLimiter)
app.use('/api/auth/forgot-password', passwordResetLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/players', playerRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/rooms', auctionRoutes) // /api/rooms/:roomId/auction/*
app.use('/api/rooms', franchiseRoutes) // /api/rooms/:roomId/franchises/*
app.use('/api/fixtures', fixtureRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/draft', draftRoutes)
app.use('/api/test-queue', testQueueRoutes)

// Health check (before error handler, with public rate limiter)
app.get('/api/health', publicLimiter, async (req: express.Request, res: express.Response) => {
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

// Error handler — must be last
import { errorHandler } from './middleware/errorHandler'
app.use(errorHandler)

// Setup Socket.io
setupSocket(io, prisma)

// Make prisma accessible to services for socket emission
;(prisma as any)._app = app

// ─── Prometheus metrics endpoint ────────────────────────────────
import { metricsMiddleware, metricsEndpoint } from './middleware/metrics'
app.use(metricsMiddleware)
app.get(
  '/api/metrics',
  asyncHandler(async (_req: express.Request, res: express.Response) => {
    const metrics = await metricsEndpoint()
    res.setHeader('Content-Type', 'text/plain')
    res.send(metrics)
  }),
)

// ─── Auction Timer Expiry Check ────────────────────────────────────
// Runs every 2 seconds to auto-advance auctions when player timers expire.
// This is the server-authoritative timer mechanism — clients only render
// the countdown from timerEndsAt, never decide outcomes.
const AUCTION_TICK_INTERVAL_MS = 2000
let auctionTimerInterval: ReturnType<typeof setInterval> | null = null

interface RoomWithId {
  id: string
  status: string
}

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
            return state ? (state as any) : null
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

const PORT = parseInt(env.PORT || '4000', 10)

// Start database then server
initDatabase().then(() => {
  httpServer.listen(PORT, () => {
    logger.info(
      { event: 'server.start', port: PORT, env: env.NODE_ENV || 'development' },
      `MatchMind API server running on port ${PORT}`,
    )
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
    logger.info({ event: 'server.db_closed' }, 'MatchMind Database persisted and closed')
  } catch (err: any) {
    logger.error({ event: 'server.shutdown_error', err: err.message }, 'Error during graceful shutdown')
  }

  clearTimeout(forceExit)
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

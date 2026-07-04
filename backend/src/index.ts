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

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'DATABASE_URL']
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    logger.fatal({ event: 'startup.env_missing', envVar }, `Required environment variable ${envVar} is not set.`)
    logger.fatal({ event: 'startup.env_missing', envVar }, `Please set ${envVar} in your .env file or environment.`)
    process.exit(1)
  }
}

// Initialize JSON Database (replaces Prisma/PostgreSQL)
const prisma = createJsonDatabase()
let dbInitialized = false

async function initDatabase(): Promise<void> {
  try {
    await prisma.initialize()
    dbInitialized = true
    logger.info({ event: 'database.initialized', dbType: 'json-file' }, 'JSON Database initialized (replaces Prisma/PostgreSQL)')

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

import authRoutes from './routes/auth'
import matchRoutes from './routes/matches'
import predictionRoutes from './routes/predictions'
import leaderboardRoutes from './routes/leaderboard'
import userRoutes from './routes/users'
import leagueRoutes from './routes/leagues'
import squadRoutes from './routes/squads'
import highlightRoutes from './routes/highlights'
import aiRoutes from './routes/ai'
import stripeRoutes from './routes/stripe'
import adminRoutes from './routes/admin'
import teamRoutes from './routes/teams'
import playerRoutes from './routes/players'
import searchRoutes from './routes/search'
import messageRoutes from './routes/messages'
import simulationRoutes from './routes/simulation'
import { setupSocket } from './socket'
import { createWorkers } from './workers/scoringWorker'
import { queueWeeklyReset, queueMonthlyReset } from './workers/queue'
import { globalLimiter, authLimiter, passwordResetLimiter, predictionLimiter } from './middleware/rateLimiter'

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

// Routes with rate limiting
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/signup', authLimiter)
app.use('/api/auth/forgot-password', passwordResetLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/predictions', predictionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/users', userRoutes)
app.use('/api/leagues', leagueRoutes)
app.use('/api/squads', squadRoutes)
app.use('/api/highlights', highlightRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/players', playerRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/simulation', simulationRoutes)

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

// Make prisma accessible to workers for socket emission
;(prisma as any)._app = app

// Initialize BullMQ workers
let workers: any = null
let workersCreated = false
try {
  workers = createWorkers(prisma)
  workersCreated = true
  logger.info({ event: 'workers.initialized' }, 'BullMQ workers initialized (score-predictions, reset-leaderboards, recalculate-ranks)')

  // Safe setTimeout wrapper that avoids 32-bit signed integer overflow
  const safeSetTimeout = (fn: () => void, delay: number): NodeJS.Timeout => {
    const MAX_DELAY = 2147483647 // 2^31 - 1 (max safe for setTimeout)
    if (delay > MAX_DELAY) {
      // Split into chunks: poll every 24 hours until time is right
      return setTimeout(() => safeSetTimeout(fn, delay - 86400000), 86400000)
    }
    return setTimeout(fn, delay)
  }

  // Schedule weekly reset (every Monday at 00:00 UTC)
  const scheduleWeekly = (): void => {
    const now = new Date()
    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7))
    nextMonday.setHours(0, 0, 0, 0)
    const msTillMonday = nextMonday.getTime() - now.getTime()

    safeSetTimeout(async () => {
      try {
        await queueWeeklyReset()
        logger.info({ event: 'scheduler.weekly_queued' }, 'Weekly leaderboard reset queued')
      } catch (err: any) {
        logger.error({ event: 'scheduler.weekly_error', err: String(err) }, 'Weekly reset error')
      }
      scheduleWeekly()
    }, msTillMonday)
  }

  // Schedule monthly reset (1st of each month at 00:00 UTC)
  const scheduleMonthly = (): void => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const msTillNextMonth = nextMonth.getTime() - now.getTime()

    safeSetTimeout(async () => {
      try {
        await queueMonthlyReset()
        logger.info({ event: 'scheduler.monthly_queued' }, 'Monthly leaderboard snapshot queued')
      } catch (err: any) {
        logger.error({ event: 'scheduler.monthly_error', err: err.message }, 'Monthly reset error')
      }
      scheduleMonthly()
    }, msTillNextMonth)
  }

  scheduleWeekly()
  scheduleMonthly()
  logger.info({ event: 'scheduler.initialized' }, 'Leaderboard reset schedules initialized')
} catch (err: any) {
  logger.warn({ event: 'workers.unavailable', err: err.message }, 'BullMQ workers not available (Redis may not be running)')
  logger.warn({ event: 'workers.fallback' }, 'Scoring will need to be triggered directly via mode=direct')
}

const PORT = parseInt(process.env.PORT || '4000', 10)

// Start database then server
initDatabase().then(() => {
  httpServer.listen(PORT, () => {
    logger.info({ event: 'server.start', port: PORT, env: process.env.NODE_ENV || 'development' }, `MatchMind API server running on port ${PORT}`)
  })
})

import { closeWorkers } from './workers/scoringWorker'

// Graceful shutdown
const shutdown = async (signal: string): Promise<void> => {
  logger.info({ event: 'server.shutdown', signal }, `${signal} received. Starting graceful shutdown...`)

  const forceExit = setTimeout(() => {
    logger.error({ event: 'server.shutdown_timeout' }, 'Graceful shutdown timed out after 10s. Force exiting.')
    process.exit(1)
  }, 10000)
  forceExit.unref()

  try {
    // 1. Stop accepting new connections
    await new Promise<void>((resolve) => httpServer.close(() => resolve()))
    logger.info({ event: 'server.http_closed' }, 'HTTP server closed')

    // 2. Close BullMQ workers
    if (workers && workersCreated) {
      const workersToClose = workers
      workers = null
      await closeWorkers(workersToClose)
      logger.info({ event: 'server.workers_closed' }, 'Workers closed')
    }

    // 3. Persist JSON database
    await prisma.$disconnect()
    logger.info({ event: 'server.db_closed' }, 'JSON Database persisted and closed')
  } catch (err: any) {
    logger.error({ event: 'server.shutdown_error', err: err.message }, 'Error during graceful shutdown')
  }

  clearTimeout(forceExit)
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// ─── Sentry instrumentation (must be first) ────────────────────────────
// The instrument module is named instrument.js (not .ts) intentionally
// to keep it as the very first require.
if (process.env.SENTRY_DSN) {
  require('../instrument')
}

// @ts-nocheck — This file is in migration to TypeScript; new code should be .ts

require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const pinoHttp = require('pino-http')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')

// ─── Validate required environment variables ──────────────────────────
const logger = require('./utils/logger')

const REQUIRED_ENV_VARS = ['JWT_SECRET', 'DATABASE_URL']
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    logger.fatal({ event: 'startup.env_missing', envVar }, `Required environment variable ${envVar} is not set.`)
    logger.fatal({ event: 'startup.env_missing', envVar }, `Please set ${envVar} in your .env file or environment.`)
    process.exit(1)
  }
}

// Initialize Prisma with PostgreSQL driver adapter (Prisma 7)
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://matchmind:matchmind_pass@localhost:5433/matchmind',
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Export pool for graceful shutdown cleanup
prisma._pool = pool

// Initialize Passport strategies with shared PrismaClient
const { configurePassport } = require('./config/passport')
configurePassport(prisma)

const authRoutes = require('./routes/auth')
const matchRoutes = require('./routes/matches')
const predictionRoutes = require('./routes/predictions')
const leaderboardRoutes = require('./routes/leaderboard')
const userRoutes = require('./routes/users')
const leagueRoutes = require('./routes/leagues')
const squadRoutes = require('./routes/squads')
const highlightRoutes = require('./routes/highlights')
const aiRoutes = require('./routes/ai')
const stripeRoutes = require('./routes/stripe')
const adminRoutes = require('./routes/admin')
const teamRoutes = require('./routes/teams')
const playerRoutes = require('./routes/players')
const searchRoutes = require('./routes/search')
const messageRoutes = require('./routes/messages')
const simulationRoutes = require('./routes/simulation')
const { setupSocket } = require('./socket')
const { createWorkers } = require('./workers/scoringWorker')
const { queueWeeklyReset, queueMonthlyReset } = require('./workers/queue')
const { globalLimiter, authLimiter, passwordResetLimiter, predictionLimiter } = require('./middleware/rateLimiter')

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
// Structured HTTP request logging via pino-http (replaces morgan)
app.use(pinoHttp({ logger }))

// Stripe webhook needs raw body BEFORE express.json() consumes it
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))

app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

// Make prisma accessible
app.set('prisma', prisma)
app.set('io', io)

// Routes with rate limiting
// Note: Mount specific limiters BEFORE route groups to avoid stacking
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
app.get('/api/health', async (req, res) => {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {},
  }
  let degraded = false

  // Check Postgres
  try {
    await prisma.$queryRawUnsafe('SELECT 1')
    checks.checks.postgres = { status: 'ok' }
  } catch (err) {
    checks.checks.postgres = { status: 'error', message: err.message }
    degraded = true
  }

  // Check Redis using the shared client from rateLimiter (avoids creating new connections per request)
  const { isRedisConnected } = require('./middleware/rateLimiter')
  if (isRedisConnected()) {
    checks.checks.redis = { status: 'ok' }
  } else {
    checks.checks.redis = { status: 'degraded', message: 'Redis not available (fallback to in-memory)' }
    // Don't mark as degraded — Redis is optional (BullMQ falls back to direct scoring)
  }

  if (degraded) {
    checks.status = 'degraded'
    return res.status(503).json(checks)
  }

  res.json(checks)
})

// Error handler — must be last
const { errorHandler } = require('./middleware/errorHandler')
app.use(errorHandler)

// Setup Socket.io
setupSocket(io, prisma)

// Make prisma accessible to workers for socket emission
prisma._app = app

// Initialize BullMQ workers
let workers = null
let workersCreated = false
try {
  workers = createWorkers(prisma)
  workersCreated = true
  logger.info({ event: 'workers.initialized' }, 'BullMQ workers initialized (score-predictions, reset-leaderboards, recalculate-ranks)')

  // Schedule weekly reset (every Monday at 00:00 UTC)
  const scheduleWeekly = () => {
    const now = new Date()
    const nextMonday = new Date(now)
    nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7))
    nextMonday.setHours(0, 0, 0, 0)
    const msTillMonday = nextMonday.getTime() - now.getTime()

    setTimeout(async () => {
      try {
        await queueWeeklyReset()
        logger.info({ event: 'scheduler.weekly_queued' }, 'Weekly leaderboard reset queued')
      } catch (err) {
        logger.error({ event: 'scheduler.weekly_error', err: String(err) }, 'Weekly reset error')
      }
      scheduleWeekly() // Re-schedule for next week
    }, msTillMonday)
  }

  // Schedule monthly reset (1st of each month at 00:00 UTC)
  const scheduleMonthly = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const msTillNextMonth = nextMonth.getTime() - now.getTime()

    setTimeout(async () => {
      try {
        await queueMonthlyReset()
        logger.info({ event: 'scheduler.monthly_queued' }, 'Monthly leaderboard snapshot queued')
      } catch (err) {
        logger.error({ event: 'scheduler.monthly_error', err: err.message }, 'Monthly reset error')
      }
      scheduleMonthly() // Re-schedule for next month
    }, msTillNextMonth)
  }

  scheduleWeekly()
  scheduleMonthly()
  logger.info({ event: 'scheduler.initialized' }, 'Leaderboard reset schedules initialized')
} catch (err) {
  logger.warn({ event: 'workers.unavailable', err: err.message }, 'BullMQ workers not available (Redis may not be running)')
  logger.warn({ event: 'workers.fallback' }, 'Scoring will need to be triggered directly via mode=direct')
}

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  logger.info({ event: 'server.start', port: PORT, env: process.env.NODE_ENV || 'development' }, `MatchMind API server running on port ${PORT}`)
})

// Import closeWorkers at top level (not inside the signal handler)
const { closeWorkers } = require('./workers/scoringWorker')

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info({ event: 'server.shutdown', signal }, `${signal} received. Starting graceful shutdown...`)

  // Set a hard 10s timeout to force exit if shutdown hangs
  const forceExit = setTimeout(() => {
    logger.error({ event: 'server.shutdown_timeout' }, 'Graceful shutdown timed out after 10s. Force exiting.')
    process.exit(1)
  }, 10000)
  forceExit.unref()

  try {
    // 1. Stop accepting new connections
    await new Promise((resolve) => httpServer.close(resolve))
    logger.info({ event: 'server.http_closed' }, 'HTTP server closed')

    // 2. Close BullMQ workers
    if (workers && workersCreated) {
      const workersToClose = workers
      workers = null
      await closeWorkers(workersToClose)
      logger.info({ event: 'server.workers_closed' }, 'Workers closed')
    }

    // 3. Disconnect Prisma and close pool
    await prisma.$disconnect()
    if (prisma._pool) await prisma._pool.end()
    logger.info({ event: 'server.db_closed' }, 'Database connections closed')
  } catch (err) {
    logger.error({ event: 'server.shutdown_error', err: err.message }, 'Error during graceful shutdown')
  }

  clearTimeout(forceExit)
  process.exit(0)
})

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

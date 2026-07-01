require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')

// ─── Validate required environment variables ──────────────────────────
const REQUIRED_ENV_VARS = ['JWT_SECRET', 'DATABASE_URL']
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    console.error(`[FATAL] Required environment variable ${envVar} is not set.`)
    console.error(`Please set ${envVar} in your .env file or environment.`)
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
app.use(morgan('dev'))

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
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
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
try {
  workers = createWorkers(prisma)
  console.log('[Workers] BullMQ workers initialized (score-predictions, reset-leaderboards, recalculate-ranks)')

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
        console.log('[Scheduler] Weekly leaderboard reset queued')
      } catch (err) {
        console.error('[Scheduler] Weekly reset error:', err.message)
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
        console.log('[Scheduler] Monthly leaderboard snapshot queued')
      } catch (err) {
        console.error('[Scheduler] Monthly reset error:', err.message)
      }
      scheduleMonthly() // Re-schedule for next month
    }, msTillNextMonth)
  }

  scheduleWeekly()
  scheduleMonthly()
  console.log('[Scheduler] Leaderboard reset schedules initialized')
} catch (err) {
  console.warn('[Workers] BullMQ workers not available (Redis may not be running):', err.message)
  console.warn('[Workers] Scoring will need to be triggered directly via mode=direct')
}

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  console.log(`MatchMind API server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()        // Prisma releases connections first
  if (prisma._pool) await prisma._pool.end()  // then close the pool
  if (workers) {
    const { closeWorkers } = require('./workers/scoringWorker')
    await closeWorkers(workers)
  }
  httpServer.close()
  process.exit(0)
})

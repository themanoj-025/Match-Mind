import { env } from './config/env'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { prisma } from './lib/prisma'
import logger from './utils/logger'
import { app } from './app'
import { configurePassport } from './config/passport'
import { checkAuctionTimer } from './services/auctionEngine'
import { setupSocket } from './socket'
import { createAdapter } from '@socket.io/redis-adapter'
import { redis } from './lib/redis'
import { errorHandler } from './middleware/errorHandler'
import './workers'

// Initialize Postgres Database with Prisma
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
  adapter: createAdapter(redis, redis.duplicate())
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
      redis: { status: 'ok' },
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

  // Check Redis connectivity
  try {
    if (redis.status === 'ready' || redis.status === 'connect') {
      await redis.ping()
    } else {
      throw new Error('Redis not ready')
    }
  } catch {
    checks.checks.redis.status = 'degraded'
    checks.checks.redis.error = 'redis connection failed'
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
// Removed: (prisma as any)._app = app

// Auction timers are now handled by BullMQ workers (see src/workers/auctionWorker.ts)

const PORT = parseInt(env.PORT || '5000', 10)

// Start database then server
initDatabase().then(() => {
  httpServer.listen(PORT, () => {
    logger.info(
      { event: 'server.start', port: PORT, env: env.NODE_ENV || 'development' },
      `MatchMind API server running on port ${PORT}`,
    )
  })
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

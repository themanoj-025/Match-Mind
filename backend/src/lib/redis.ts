import { Redis } from 'ioredis'
import logger from '../utils/logger'

if (!process.env.REDIS_URL) {
  logger.fatal({ event: 'redis.missing_url' }, 'REDIS_URL is strictly required')
  process.exit(1)
}

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
})

redis.on('error', (err) => {
  logger.error({ event: 'redis.error', err: err.message }, 'Redis connection error')
})

redis.on('connect', () => {
  logger.info({ event: 'redis.connected' }, 'Connected to Redis')
})

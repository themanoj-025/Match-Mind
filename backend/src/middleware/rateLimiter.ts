/**
 * Rate limiting middleware using express-rate-limit.
 *
 * Tiers:
 * - Login/signup: 5 requests / 15 min / IP
 * - Password reset: 3 requests / hour / IP+email
 * - Predictions (POST only): 30 requests / min / user
 * - Global: 100 requests / min / IP
 * - AI prediction: 10 requests / hour / user
 *
 * Shares one Redis client across all limiters when available.
 * Falls back to in-memory store if Redis is unavailable.
 */
import rateLimit from 'express-rate-limit'
import type { Request, Response, NextFunction } from 'express'

let RedisStore: any = null
try {
  RedisStore = require('rate-limit-redis')
} catch {
  // Fall back to built-in memory store
}

// ─── Shared Redis client (created once, reused by all limiters) ─────

let sharedRedisClient: any = null
try {
  const redis = require('redis')
  sharedRedisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    enableReadyCheck: false,
  })
  sharedRedisClient.connect().catch(() => { sharedRedisClient = null })
} catch {
  sharedRedisClient = null
}

interface LimiterOptions {
  windowMs: number
  max: number
  message?: string
  prefix?: string
  keyGenerator?: (req: Request) => string
}

// ─── Factory: creates a rate limiter with optional Redis backing ─────

function createLimiter(options: LimiterOptions) {
  let store: any = undefined // default memory store

  if (RedisStore && sharedRedisClient) {
    try {
      store = new RedisStore({
        sendCommand: (...args: any[]) => sharedRedisClient.sendCommand(args),
        ...(options.prefix ? { prefix: options.prefix } : {}),
      })
    } catch {
      // fallback to memory store
    }
  }

  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: options.message || 'Too many requests, please try again later',
      },
    },
    store,
    ...(options.keyGenerator ? { keyGenerator: options.keyGenerator } : {}),
  })
}

// ─── Pre-configured limiters ────────────────────────────────

// Login / signup: 5 requests per 15 minutes per IP
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again after 15 minutes',
  prefix: 'rl:auth:',
})

// Password reset: 3 requests per hour per IP+email
export const passwordResetLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests, please try again after an hour',
  prefix: 'rl:reset:',
  keyGenerator: (req) => `${req.ip}:${req.body?.email || 'unknown'}`,
})

// Prediction submission: 30 per minute per user (POST only)
export const predictionLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Too many prediction submissions, please slow down',
  prefix: 'rl:pred:',
  keyGenerator: (req) => (req as any).userId || req.ip,
})

// Global API default: 100 per minute per IP
export const globalLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please slow down',
  prefix: 'rl:global:',
})

// AI prediction: 10 requests per hour per user (paid external API — Anthropic)
export const aiPredictionLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many AI prediction requests, please try again after an hour',
  prefix: 'rl:ai:',
  keyGenerator: (req) => (req as any).userId || req.ip,
})

export const isRedisConnected = () => sharedRedisClient !== null && sharedRedisClient.isOpen

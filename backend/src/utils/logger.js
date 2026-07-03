/**
 * Structured Logger — MatchMind
 *
 * Pino-based structured logging replacing all console.* calls.
 * Every log line includes an `event` field (e.g. `auth.signup`, `scoring.match_scored`)
 * and relevant IDs (userId, matchId, requestId) for filtering.
 *
 * Usage:
 *   const logger = require('./utils/logger')
 *   logger.info({ event: 'auth.signup', userId }, 'User signed up')
 *   logger.error({ event: 'scoring.error', matchId, err }, 'Scoring failed')
 */

const pino = require('pino')

// Determine log level from environment
const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

const logger = pino({
  level,
  // In development, pretty-print for readability
  ...(process.env.NODE_ENV !== 'production' && process.stdout.isTTY
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }
    : {}),
  // Always include a base event field
  base: {},
  // Redact sensitive fields
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'body.password', 'body.token', 'body.passwordHash'],
    censor: '[REDACTED]',
  },
})

module.exports = logger

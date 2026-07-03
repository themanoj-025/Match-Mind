/**
 * Centralized error handling middleware.
 *
 * Maps known error types (Prisma, JWT, validation) to consistent HTTP responses.
 * Logs errors server-side and never leaks stack traces to clients.
 *
 * Usage: add as the last middleware in Express:
 *   app.use(errorHandler)
 */

const logger = require('../utils/logger')

/**
 * Centralized Express error handler.
 * Must have 4 params so Express recognizes it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Structured error logging with request context
  logger.error({
    event: 'error.unhandled',
    err: { message: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined },
    requestId: req.id,
    method: req.method,
    url: req.originalUrl || req.url,
    userId: req.userId,
  }, err.message)

  // ─── JSON DB errors (unique constraint, not found) ───────────────────
  if (err.code === 'CONFLICT') {
    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: err.message || 'A record with that value already exists',
      },
    })
  }
  if (err.code === 'NOT_FOUND') {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: err.message || 'The requested record was not found',
      },
    })
  }

  // ─── JWT errors ────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Authentication token is invalid or expired',
      },
    })
  }

  // ─── Custom AppError ───────────────────────────────────────────────
  if (err.isAppError) {
    return res.status(err.statusCode || 400).json({
      error: {
        code: err.code || 'APP_ERROR',
        message: err.message,
      },
    })
  }

  // ─── Fallback: 500 Internal Server Error ──────────────────────────
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  })
}

module.exports = { errorHandler }

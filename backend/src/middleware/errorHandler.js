/**
 * Centralized error handling middleware.
 *
 * Maps known error types (Prisma, JWT, validation) to consistent HTTP responses.
 * Logs errors server-side and never leaks stack traces to clients.
 *
 * Usage: add as the last middleware in Express:
 *   app.use(errorHandler)
 */

const { Prisma } = require('@prisma/client')

/**
 * Centralized Express error handler.
 * Must have 4 params so Express recognizes it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Log the error server-side (structured logging will replace this later)
  console.error(`[Error] ${err.message}`)
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }

  // ─── Prisma known-request errors (e.g. unique constraint, not found) ──
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'A record with that value already exists',
            fields: err.meta?.target,
          },
        })
      case 'P2025': // Record not found
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'The requested record was not found',
          },
        })
      case 'P2003': // Foreign key constraint
        return res.status(400).json({
          error: {
            code: 'INVALID_REFERENCE',
            message: 'Referenced record does not exist',
          },
        })
      case 'P2014': // Required relation violation
        return res.status(400).json({
          error: {
            code: 'INVALID_RELATION',
            message: 'A required relation is missing',
          },
        })
      default:
        return res.status(400).json({
          error: {
            code: 'DATABASE_ERROR',
            message: 'A database error occurred',
          },
        })
    }
  }

  // ─── Prisma validation errors ──────────────────────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid data provided to database',
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

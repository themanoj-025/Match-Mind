/**
 * AppError — a custom error class for application-level errors.
 *
 * Usage:
 *   throw new AppError('MATCH_NOT_FOUND', 'Match not found', 404)
 *   throw new AppError('UNAUTHORIZED', 'Login required', 401)
 *
 * The centralized error handler (errorHandler.js) catches these and
 * returns a consistent JSON envelope.
 */
class AppError extends Error {
  /**
   * @param {string} code     — machine-readable error code (e.g. 'MATCH_NOT_FOUND')
   * @param {string} message  — human-readable description
   * @param {number} statusCode — HTTP status code (default 400)
   */
  constructor(code, message, statusCode = 400) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isAppError = true
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = { AppError }

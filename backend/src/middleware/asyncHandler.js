/**
 * Async route handler wrapper.
 *
 * Eliminates the `catch (err) { next(err) }` boilerplate on every route.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Support both direct require and destructured import
//   const asyncHandler = require('./asyncHandler')   → function
//   const { asyncHandler } = require('./asyncHandler') → function as well
module.exports = asyncHandler
module.exports.asyncHandler = asyncHandler

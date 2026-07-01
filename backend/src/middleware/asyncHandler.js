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

module.exports = { asyncHandler }

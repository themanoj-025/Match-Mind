/**
 * Async route handler wrapper.
 *
 * Eliminates the `catch (err) { next(err) }` boilerplate on every route.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
import type { Request, Response, NextFunction } from 'express'

type AsyncHandlerFn = (req: Request, res: Response, next: NextFunction) => Promise<any>

const asyncHandler = (fn: AsyncHandlerFn) => (req: Request, res: Response, next: NextFunction): void => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler

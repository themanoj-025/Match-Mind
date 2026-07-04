import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'

export interface AuthenticatedRequest extends Request {
  userId?: string
  user?: any
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  // Check Authorization header first, then fall back to accessToken cookie
  const authHeader = req.headers['authorization']
  let token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    token = req.cookies?.accessToken
  }

  if (!token) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    req.userId = decoded.userId
    next()
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' })
  }
}

export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      req.userId = decoded.userId
    } catch (err) {
      // Ignore invalid tokens for optional auth
    }
  }
  next()
}

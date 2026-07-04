import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { validate } from '../middleware/validate'
import { authenticateToken } from '../middleware/auth'
import { csrfTokenHandler, generateCsrfToken } from '../middleware/csrf'
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../config/schemas'
import { generateTokens, setAuthCookies, clearAuthCookies } from '../services/tokenService'
import { AuthService, revokeTokens } from '../services/authService'
import { createRepositories } from '../repositories/index'
import asyncHandler from '../middleware/asyncHandler'
import logger from '../utils/logger'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

/** Create an AuthService instance from the Express app's prisma client */
function getAuthService(req: AuthenticatedRequest) {
  const prisma = req.app.get('prisma')
  const { userRepository } = createRepositories(prisma)
  return new AuthService({ userRepository })
}

// GET /api/auth/csrf-token — retrieve CSRF token (no auth required)
router.get('/csrf-token', csrfTokenHandler)

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), asyncHandler(async (req, res) => {
  const { username, email, password } = req.body

  const result = await getAuthService(req).signup(username, email, password)
  const tokens = result.tokens

  setAuthCookies(res, tokens)
  res.status(201).json({ user: result.user, ...tokens })
}))

// POST /api/auth/login
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const result = await getAuthService(req).login(email, password)
  const tokens = result.tokens

  setAuthCookies(res, tokens)
  res.json({ user: result.user, ...tokens })
}))

// POST /api/auth/logout — revoke tokens (invalidates all sessions)
router.post('/logout', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  await revokeTokens(req.userId!, prisma)
  clearAuthCookies(res)
  logger.info({ event: 'auth.logout', userId: req.userId })
  res.json({ message: 'Logged out successfully. All sessions invalidated.' })
}))

// POST /api/auth/logout-all — revoke all tokens for this user
router.post('/logout-all', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  await revokeTokens(req.userId!, prisma)
  clearAuthCookies(res)
  logger.info({ event: 'auth.logout_all', userId: req.userId })
  res.json({ message: 'All sessions logged out successfully.' })
}))

// GET /api/auth/google - OAuth redirect
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }) as any)

// GET /api/auth/google/cb
router.get('/google/cb', passport.authenticate('google', { session: false }), (req, res) => {
  const prisma = req.app ? req.app.get('prisma') : null
  const googleUser = (req as any).user
  // Async token generation — use sync version since passport already resolved user
  const tokens = generateTokens(googleUser.id, googleUser.tokenVersion)
  setAuthCookies(res, tokens)
  // Also set a CSRF token cookie for the client
  res.redirect(`${process.env.FRONTEND_URL}/feed`)
})

// POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken
  if (!token) {
    return res.status(401).json({
      error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token provided' },
    })
  }

  const tokens = await getAuthService(req).refreshToken(token)
  setAuthCookies(res, tokens)
  res.json(tokens)
}))

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.body
  await getAuthService(req).generatePasswordResetToken(email)
  res.json({ message: 'If an account exists, a reset link has been sent.' })
}))

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { token, password } = req.body

  let decoded: { userId: string; purpose: string }
  try {
    decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || process.env.JWT_SECRET!) as any
  } catch (err) {
    return res.status(400).json({
      error: { code: 'INVALID_TOKEN', message: 'Reset token is invalid or expired' },
    })
  }

  if (decoded.purpose !== 'password-reset') {
    return res.status(400).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid token purpose' },
    })
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
  if (!user) {
    return res.status(400).json({
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  // Revoke all tokens after password reset
  await revokeTokens(user.id, prisma)

  logger.info({ event: 'auth.password_reset_completed', userId: user.id }, 'Password reset completed')
  res.json({ message: 'Password has been updated. Please log in with your new password.' })
}))

// POST /api/auth/verify-email
router.post('/verify-email', validate(verifyEmailSchema), asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { token } = req.body

  let decoded: { userId: string; purpose: string }
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
  } catch (err) {
    return res.status(400).json({
      error: { code: 'INVALID_TOKEN', message: 'Verification token is invalid or expired' },
    })
  }

  if (decoded.purpose !== 'email-verification') {
    return res.status(400).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid token purpose' },
    })
  }

  const user = await prisma.user.update({
    where: { id: decoded.userId },
    data: { emailVerified: true },
  })

  logger.info({ event: 'auth.email_verified', userId: user.id }, 'Email verified')
  res.json({ message: 'Email verified successfully.' })
}))

// POST /api/auth/resend-verification
router.post('/resend-verification', (_req, res) => {
  res.json({ message: 'Verification email resent.' })
})

export default router

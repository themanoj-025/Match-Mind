import { env } from '../config/env'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import { validate } from '../middleware/validate'
import { authenticateToken } from '../middleware/auth'
import { csrfTokenHandler } from '../middleware/csrf'
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../config/schemas'
import { generateTokens, setAuthCookies, clearAuthCookies } from '../services/tokenService'
import { AuthService, revokeTokens } from '../services/authService'
import { createRepositories } from '../repositories/index'
import asyncHandler from '../middleware/asyncHandler'
import logger from '../utils/logger'
import type { AuthenticatedRequest } from '../middleware/auth'
import { openapiRegistry } from "../config/openapi";

const router = express.Router()

/** Create an AuthService instance from the Express app's prisma client */
function getAuthService(req: AuthenticatedRequest) {
  const prisma = req.app.get('prisma')
  const { userRepository } = createRepositories(prisma)
  return new AuthService({ userRepository })
}

// GET /api/auth/csrf-token — retrieve CSRF token (no auth required)

openapiRegistry.registerPath({
  method: 'get',
  path: '/csrf-token',
  responses: { 200: { description: 'Success' } }
})
router.get('/csrf-token', csrfTokenHandler)

// POST /api/auth/signup

openapiRegistry.registerPath({
  method: 'post',
  path: '/signup',
  request: { body: { content: { 'application/json': { schema: signupSchema } } } },
  responses: { 200: { description: 'Success' } }
})
router.post('/signup', validate(signupSchema), asyncHandler(async (req, res) => {
  const { username, email, password } = req.body

  const result = await getAuthService(req).signup(username, email, password)
  const tokens = result.tokens

  setAuthCookies(res, tokens)
  res.status(201).json({ user: result.user, ...tokens })
}))

// POST /api/auth/login

openapiRegistry.registerPath({
  method: 'post',
  path: '/login',
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: { 200: { description: 'Success' } }
})
router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const result = await getAuthService(req).login(email, password)
  const tokens = result.tokens

  setAuthCookies(res, tokens)
  res.json({ user: result.user, ...tokens })
}))

// POST /api/auth/logout — revoke tokens (invalidates all sessions)

openapiRegistry.registerPath({
  method: 'post',
  path: '/logout',
  responses: { 200: { description: 'Success' } }
})
router.post('/logout', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  await revokeTokens(req.userId!, prisma)
  clearAuthCookies(res)
  logger.info({ event: 'auth.logout', userId: req.userId })
  res.json({ message: 'Logged out successfully. All sessions invalidated.' })
}))

// POST /api/auth/logout-all — revoke all tokens for this user

openapiRegistry.registerPath({
  method: 'post',
  path: '/logout-all',
  responses: { 200: { description: 'Success' } }
})
router.post('/logout-all', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  await revokeTokens(req.userId!, prisma)
  clearAuthCookies(res)
  logger.info({ event: 'auth.logout_all', userId: req.userId })
  res.json({ message: 'All sessions logged out successfully.' })
}))

// GET /api/auth/google - OAuth redirect

openapiRegistry.registerPath({
  method: 'get',
  path: '/google',
  responses: { 200: { description: 'Success' } }
})
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }) as any)

// GET /api/auth/google/cb

openapiRegistry.registerPath({
  method: 'get',
  path: '/google/cb',
  responses: { 200: { description: 'Success' } }
})
router.get('/google/cb', passport.authenticate('google', { session: false }), (req, res) => {
  const prisma = req.app ? req.app.get('prisma') : null
  const googleUser = (req as any).user
  // Async token generation — use sync version since passport already resolved user
  const tokens = generateTokens(googleUser.id, googleUser.tokenVersion)
  setAuthCookies(res, tokens)
  // Also set a CSRF token cookie for the client
  res.redirect(`${env.FRONTEND_URL}/lobby`)
})

// POST /api/auth/refresh

openapiRegistry.registerPath({
  method: 'post',
  path: '/refresh',
  responses: { 200: { description: 'Success' } }
})
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

openapiRegistry.registerPath({
  method: 'post',
  path: '/forgot-password',
  request: { body: { content: { 'application/json': { schema: forgotPasswordSchema } } } },
  responses: { 200: { description: 'Success' } }
})
router.post('/forgot-password', validate(forgotPasswordSchema), asyncHandler(async (req, res) => {
  const { email } = req.body
  await getAuthService(req).generatePasswordResetToken(email)
  res.json({ message: 'If an account exists, a reset link has been sent.' })
}))

// POST /api/auth/reset-password

openapiRegistry.registerPath({
  method: 'post',
  path: '/reset-password',
  request: { body: { content: { 'application/json': { schema: resetPasswordSchema } } } },
  responses: { 200: { description: 'Success' } }
})
router.post('/reset-password', validate(resetPasswordSchema), asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { token, password } = req.body

  let decoded: { userId: string; purpose: string }
  try {
    decoded = jwt.verify(token, env.JWT_RESET_SECRET!) as any
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

  const { userRepository } = createRepositories(prisma)
  const user = await userRepository.findById(decoded.userId)
  if (!user) {
    return res.status(400).json({
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const nextTokenVersion = (user.tokenVersion ?? 0) + 1
  await userRepository.update(user.id, {
    passwordHash,
    tokenVersion: nextTokenVersion,
  })

  logger.info({ event: 'auth.password_reset_completed', userId: user.id }, 'Password reset completed')
  res.json({ message: 'Password has been updated. Please log in with your new password.' })
}))

// POST /api/auth/verify-email

openapiRegistry.registerPath({
  method: 'post',
  path: '/verify-email',
  request: { body: { content: { 'application/json': { schema: verifyEmailSchema } } } },
  responses: { 200: { description: 'Success' } }
})
router.post('/verify-email', validate(verifyEmailSchema), asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { token } = req.body

  let decoded: { userId: string; purpose: string }
  try {
    decoded = jwt.verify(token, env.JWT_SECRET!) as any
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

  const { userRepository } = createRepositories(prisma)
  const user = await userRepository.update(decoded.userId, { emailVerified: true })

  logger.info({ event: 'auth.email_verified', userId: user.id }, 'Email verified')
  res.json({ message: 'Email verified successfully.' })
}))

// POST /api/auth/resend-verification

openapiRegistry.registerPath({
  method: 'post',
  path: '/resend-verification',
  responses: { 200: { description: 'Success' } }
})
router.post('/resend-verification', (_req, res) => {
  res.json({ message: 'Verification email resent.' })
})

export default router

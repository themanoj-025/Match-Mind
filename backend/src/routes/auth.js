const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const { validate } = require('../middleware/validate')
const { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } = require('../config/schemas')
const { generateTokens, setAuthCookies } = require('../services/tokenService')
const { AuthService } = require('../services/authService')
const { createRepositories } = require('../repositories/index')
const asyncHandler = require('../middleware/asyncHandler')
const logger = require('../utils/logger')

/** Create an AuthService instance from the Express app's prisma client */
function getAuthService(req) {
  const prisma = req.app.get('prisma')
  const { userRepository } = createRepositories(prisma)
  return new AuthService({ userRepository })
}

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

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken')
  res.json({ message: 'Logged out' })
})

// GET /api/auth/google - OAuth redirect
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

// GET /api/auth/google/cb
router.get('/google/cb', passport.authenticate('google', { session: false }), (req, res) => {
  const tokens = generateTokens(req.user.id)
  setAuthCookies(res, tokens)
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

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || process.env.JWT_SECRET)
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

  await prisma.session.deleteMany({
    where: { userId: user.id },
  })

  logger.info({ event: 'auth.password_reset_completed', userId: user.id }, 'Password reset completed')
  res.json({ message: 'Password has been updated. Please log in with your new password.' })
}))

// POST /api/auth/verify-email
router.post('/verify-email', validate(verifyEmailSchema), asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { token } = req.body

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
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
router.post('/resend-verification', async (req, res) => {
  res.json({ message: 'Verification email resent.' })
})

module.exports = router

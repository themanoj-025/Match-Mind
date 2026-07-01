const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const { validate } = require('../middleware/validate')
const { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } = require('../config/schemas')

const generateTokens = (userId) => ({
  accessToken: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' }),
})

// POST /api/auth/signup
router.post('/signup', validate(signupSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { username, email, password } = req.body

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (existing) {
      return res.status(409).json({
        error: { code: 'DUPLICATE_USER', message: 'A user with that email or username already exists' },
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { username, email, passwordHash, displayName: username },
    })

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId: user.id, purpose: 'email-verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    console.log(`[Auth] Signup: verification token for ${email}: ${verificationToken.substring(0, 12)}...`)
    // TODO: Send verification email with token

    const tokens = generateTokens(user.id)
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 })
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 })

    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, avatar: user.avatar, totalPoints: user.totalPoints, tier: user.tier }, ...tokens })
  } catch (err) { next(err) }
})

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      })
    }

    const tokens = generateTokens(user.id)
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 })
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 })

    res.json({ user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, avatar: user.avatar, totalPoints: user.totalPoints, tier: user.tier }, ...tokens })
  } catch (err) { next(err) }
})

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
  res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 })
  res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 })
  // Token is set via httpOnly cookie — no token in URL to prevent leakage
  res.redirect(`${process.env.FRONTEND_URL}/feed`)
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken
    if (!token) {
      return res.status(401).json({
        error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token provided' },
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const prisma = req.app.get('prisma')
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) {
      return res.status(401).json({
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      })
    }

    const tokens = generateTokens(user.id)
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 30 * 24 * 60 * 60 * 1000 })
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 })
    res.json(tokens)
  } catch (err) {
    return res.status(401).json({
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token is invalid or expired' },
    })
  }
})

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { email } = req.body
    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      // Generate password reset token (expires in 1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password-reset' },
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )
      // Store reset token in session or DB for single-use verification
      // In production, send email via Resend/SES/Postmark
      console.log(`[Auth] Password reset token generated for ${email}: ${resetToken.substring(0, 12)}...`)
      // TODO: Replace with actual email sending service
    }
    res.json({ message: 'If an account exists, a reset link has been sent.' })
  } catch (err) { next(err) }
})

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { token, password } = req.body

    // Verify the reset token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || process.env.JWT_SECRET)
    } catch (err) {
      return res.status(400).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Reset token is invalid or expired',
        },
      })
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token purpose',
        },
      })
    }

    // Find user and hash the new password
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) {
      return res.status(400).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    // Invalidate all existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id },
    })

    console.log(`[Auth] Password reset completed for user ${user.id}`)
    res.json({ message: 'Password has been updated. Please log in with your new password.' })
  } catch (err) { next(err) }
})

// POST /api/auth/verify-email
router.post('/verify-email', validate(verifyEmailSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { token } = req.body

    // Verify the email verification token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(400).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Verification token is invalid or expired',
        },
      })
    }

    if (decoded.purpose !== 'email-verification') {
      return res.status(400).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token purpose',
        },
      })
    }

    // Update user's emailVerified status
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { emailVerified: true },
    })

    console.log(`[Auth] Email verified for user ${user.id}`)
    res.json({ message: 'Email verified successfully.' })
  } catch (err) { next(err) }
})

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  // In production, resend verification email
  res.json({ message: 'Verification email resent.' })
})

module.exports = router

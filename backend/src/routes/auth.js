const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')

const generateTokens = (userId) => ({
  accessToken: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' }),
})

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { username, email, password } = req.body

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } })
    if (existing) return res.status(400).json({ message: 'User already exists' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { username, email, passwordHash, displayName: username },
    })

    const tokens = generateTokens(user.id)
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 })

    res.status(201).json({ user: { id: user.id, username: user.username, email: user.email, displayName: user.displayName, avatar: user.avatar, totalPoints: user.totalPoints, tier: user.tier }, ...tokens })
  } catch (err) { next(err) }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    const tokens = generateTokens(user.id)
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 })

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
  res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 })
  res.redirect(`${process.env.FRONTEND_URL}/feed?token=${tokens.accessToken}`)
})

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken
    if (!token) return res.status(401).json({ message: 'No refresh token' })

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const prisma = req.app.get('prisma')
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) return res.status(401).json({ message: 'User not found' })

    const tokens = generateTokens(user.id)
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 })
    res.json(tokens)
  } catch (err) { return res.status(401).json({ message: 'Invalid refresh token' }) }
})

module.exports = router

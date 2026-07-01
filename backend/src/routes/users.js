const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { updateProfileSchema } = require('../config/schemas')
const asyncHandler = require('../middleware/asyncHandler')

// GET /api/users/check-username
router.get('/check-username', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { username } = req.query
  if (!username || username.length < 3) {
    return res.json({ available: false })
  }
  const existing = await prisma.user.findUnique({ where: { username } })
  res.json({ available: !existing })
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, username: true, displayName: true, avatar: true, bio: true, countryCode: true, totalPoints: true, globalRank: true, predAccuracy: true, streakCurrent: true, tier: true, createdAt: true },
  })
  if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } })
  res.json(user)
}))

router.patch('/me', authenticateToken, validate(updateProfileSchema), asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { displayName, avatar, bio, favouriteSports, favouriteTeams } = req.body
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { displayName, avatar, bio },
    select: { id: true, username: true, displayName: true, avatar: true, bio: true, totalPoints: true, tier: true },
  })
  res.json(user)
}))

router.post('/:id/follow', authenticateToken, asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const follow = await prisma.follow.create({ data: { followerId: req.userId, followingId: req.params.id } })
  res.status(201).json(follow)
}))

router.delete('/:id/follow', authenticateToken, asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  await prisma.follow.deleteMany({ where: { followerId: req.userId, followingId: req.params.id } })
  res.json({ message: 'Unfollowed' })
}))

router.get('/me/notifications', authenticateToken, asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const notifications = await prisma.notification.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, take: 50 })
  res.json(notifications)
}))

router.patch('/me/notifications/read', authenticateToken, asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  await prisma.notification.updateMany({ where: { userId: req.userId, isRead: false }, data: { isRead: true } })
  res.json({ message: 'All notifications marked as read' })
}))

module.exports = router

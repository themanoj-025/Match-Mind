const express = require('express')
const router = express.Router()
const asyncHandler = require('../middleware/asyncHandler')

// GET /api/leaderboard/global
router.get('/global', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const users = await prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true, predAccuracy: true, streakCurrent: true, tier: true, countryCode: true },
    take: 100,
  })
  res.json(users.map((u, i) => ({ ...u, rank: i + 1, name: u.displayName || u.username, points: u.totalPoints, accuracy: u.predAccuracy, streak: u.streakCurrent })))
}))

// GET /api/leaderboard/sport/:sport
router.get('/sport/:sport', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const users = await prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    take: 100,
    select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true, predAccuracy: true, streakCurrent: true, tier: true },
  })
  res.json(users.map((u, i) => ({ ...u, rank: i + 1, name: u.displayName || u.username, points: u.totalPoints, accuracy: u.predAccuracy, streak: u.streakCurrent })))
}))

// GET /api/leaderboard/weekly
router.get('/weekly', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const users = await prisma.user.findMany({
    orderBy: { weeklyPoints: 'desc' },
    select: { id: true, username: true, displayName: true, avatar: true, weeklyPoints: true, predAccuracy: true, streakCurrent: true, tier: true, totalPoints: true },
    take: 100,
  })
  res.json(users.map((u, i) => ({ ...u, rank: i + 1, name: u.displayName || u.username, points: u.weeklyPoints, totalPoints: u.totalPoints, accuracy: u.predAccuracy, streak: u.streakCurrent })))
}))

// GET /api/leaderboard/history/:period
router.get('/history/:period', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const period = req.params.period.toUpperCase()
  if (period !== 'WEEKLY' && period !== 'MONTHLY') {
    return res.status(400).json({ error: { code: 'INVALID_PERIOD', message: 'Invalid period. Use WEEKLY or MONTHLY' } })
  }

  const snapshot = await prisma.leaderboardSnapshot.findFirst({
    where: { period },
    orderBy: { createdAt: 'desc' },
  })

  if (!snapshot) {
    return res.status(404).json({ error: { code: 'NO_SNAPSHOT', message: `No ${period} snapshot found` } })
  }

  res.json(snapshot)
}))

// GET /api/leaderboard/friends
router.get('/friends', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const users = await prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    take: 50,
    select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true, predAccuracy: true, streakCurrent: true, tier: true },
  })
  res.json(users.map((u, i) => ({ ...u, rank: i + 1, name: u.displayName || u.username, points: u.totalPoints, accuracy: u.predAccuracy, streak: u.streakCurrent })))
}))

module.exports = router

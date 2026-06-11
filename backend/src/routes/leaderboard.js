const express = require('express')
const router = express.Router()

// GET /api/leaderboard/global
router.get('/global', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const users = await prisma.user.findMany({
      orderBy: { totalPoints: 'desc' },
      select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true, predAccuracy: true, streakCurrent: true, tier: true, countryCode: true },
      take: 100,
    })
    res.json(users.map((u, i) => ({ ...u, rank: i + 1, name: u.displayName || u.username, points: u.totalPoints, accuracy: u.predAccuracy, streak: u.streakCurrent })))
  } catch (err) { next(err) }
})

// GET /api/leaderboard/sport/:sport
router.get('/sport/:sport', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const users = await prisma.user.findMany({
      orderBy: { totalPoints: 'desc' },
      take: 100,
      select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true, predAccuracy: true, streakCurrent: true, tier: true },
    })
    res.json(users.map((u, i) => ({ ...u, rank: i + 1, name: u.displayName || u.username, points: u.totalPoints, accuracy: u.predAccuracy, streak: u.streakCurrent })))
  } catch (err) { next(err) }
})

// GET /api/leaderboard/weekly
// Sorted by weeklyPoints (reset every Monday at 00:00 UTC)
router.get('/weekly', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const users = await prisma.user.findMany({
      orderBy: { weeklyPoints: 'desc' },
      select: { id: true, username: true, displayName: true, avatar: true, weeklyPoints: true, predAccuracy: true, streakCurrent: true, tier: true, totalPoints: true },
      take: 100,
    })
    res.json(users.map((u, i) => ({ ...u, rank: i + 1, name: u.displayName || u.username, points: u.weeklyPoints, totalPoints: u.totalPoints, accuracy: u.predAccuracy, streak: u.streakCurrent })))
  } catch (err) { next(err) }
})

// GET /api/leaderboard/history/:period
// Returns the latest leaderboard snapshot for a given period
router.get('/history/:period', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const period = req.params.period.toUpperCase()
    if (period !== 'WEEKLY' && period !== 'MONTHLY') {
      return res.status(400).json({ message: 'Invalid period. Use WEEKLY or MONTHLY' })
    }

    const snapshot = await prisma.leaderboardSnapshot.findFirst({
      where: { period },
      orderBy: { createdAt: 'desc' },
    })

    if (!snapshot) {
      return res.status(404).json({ message: `No ${period} snapshot found` })
    }

    res.json(snapshot)
  } catch (err) { next(err) }
})

// GET /api/leaderboard/friends
router.get('/friends', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const users = await prisma.user.findMany({
      orderBy: { totalPoints: 'desc' },
      take: 50,
      select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true, predAccuracy: true, streakCurrent: true, tier: true },
    })
    res.json(users.map((u, i) => ({ ...u, rank: i + 1, name: u.displayName || u.username, points: u.totalPoints, accuracy: u.predAccuracy, streak: u.streakCurrent })))
  } catch (err) { next(err) }
})

module.exports = router

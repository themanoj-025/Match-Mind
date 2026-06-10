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

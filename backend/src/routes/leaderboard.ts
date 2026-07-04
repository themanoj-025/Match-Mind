import express from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { toLeaderboardEntry } from '../services/leaderboardMapper'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

// GET /api/leaderboard/global
router.get('/global', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const users = await prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true, predAccuracy: true, streakCurrent: true, tier: true, countryCode: true },
    take: 100,
  })
  res.json(users.map((u: any, i: number) => toLeaderboardEntry(u, i + 1)))
}))

// GET /api/leaderboard/sport/:sport
router.get('/sport/:sport', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const users = await prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    take: 100,
    select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true, predAccuracy: true, streakCurrent: true, tier: true },
  })
  res.json(users.map((u: any, i: number) => toLeaderboardEntry(u, i + 1)))
}))

// GET /api/leaderboard/weekly
router.get('/weekly', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const users = await prisma.user.findMany({
    orderBy: { weeklyPoints: 'desc' },
    select: { id: true, username: true, displayName: true, avatar: true, weeklyPoints: true, predAccuracy: true, streakCurrent: true, tier: true, totalPoints: true },
    take: 100,
  })
  res.json(users.map((u: any, i: number) => toLeaderboardEntry(u, i + 1, { pointField: 'weeklyPoints' })))
}))

// GET /api/leaderboard/history/:period
router.get('/history/:period', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const period = String(req.params.period).toUpperCase()
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
router.get('/friends', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  // Only return users that the current user follows (if authenticated)
  if (!req.userId) {
    return res.json([])
  }
  const follows = await prisma.follow.findMany({
    where: { followerId: req.userId },
    include: {
      following: {
        select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true, predAccuracy: true, streakCurrent: true, tier: true },
      },
    },
  })
  const followedUsers = follows.map((f: any) => f.following)
  followedUsers.sort((a: any, b: any) => b.totalPoints - a.totalPoints)
  res.json(followedUsers.map((u: any, i: number) => toLeaderboardEntry(u, i + 1)))
}))

export default router

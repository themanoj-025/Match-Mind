const express = require('express')
const router = express.Router()
const asyncHandler = require('../middleware/asyncHandler')

// GET /api/search?q= — search across users, teams, players, and matches
router.get('/', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { q } = req.query
  if (!q || q.trim().length < 2) {
    return res.json({ users: [], teams: [], players: [], matches: [] })
  }

  const query = q.trim()

  // Run searches in parallel
  const [users, teams, players, matches] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        tier: true,
        totalPoints: true,
        predAccuracy: true,
      },
      take: 10,
    }),

    prisma.team.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 10,
    }),

    prisma.player.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      include: { team: { select: { id: true, name: true } } },
      take: 10,
    }),

    prisma.match.findMany({
      where: {
        OR: [
          { homeTeamName: { contains: query, mode: 'insensitive' } },
          { awayTeamName: { contains: query, mode: 'insensitive' } },
          { competition: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { scheduledAt: 'desc' },
      take: 10,
    }),
  ])

  res.json({ users, teams, players, matches })
}))

module.exports = router

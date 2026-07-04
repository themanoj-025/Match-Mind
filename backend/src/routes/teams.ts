import express from 'express'
import asyncHandler from '../middleware/asyncHandler'

const router = express.Router()

// GET /api/teams — list teams (optional sport filter)
router.get('/', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { sport } = req.query as { sport?: string }
  const where: Record<string, any> = {}
  if (sport && sport !== 'all') where.sport = sport.toUpperCase()
  const teams = await prisma.team.findMany({ where, orderBy: { name: 'asc' }, take: 50 })
  res.json(teams)
}))

// GET /api/teams/:id — full team profile with standings, recent matches, players
router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: {
      players: { orderBy: { name: 'asc' } },
      standings: {
        include: { competition: true },
        orderBy: { season: 'desc' },
        take: 1,
      },
    },
  })
  if (!team) return res.status(404).json({ error: { code: 'TEAM_NOT_FOUND', message: 'Team not found' } })

  // Fetch recent home/away matches
  const recentMatches = await prisma.match.findMany({
    where: {
      OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
    },
    orderBy: { scheduledAt: 'desc' },
    take: 10,
  })

  // Compute form from last 5 matches
  const last5 = recentMatches.slice(0, 5).reverse()
  const form = last5.map((m: any) => {
    if (m.status !== 'FINISHED') return '—'
    const isHome = m.homeTeamId === team.id
    const teamScore = isHome ? m.homeScore : m.awayScore
    const oppScore = isHome ? m.awayScore : m.homeScore
    if (teamScore > oppScore) return 'W'
    if (teamScore < oppScore) return 'L'
    return 'D'
  }).join('')

  res.json({
    ...team,
    recentMatches,
    form,
    squadSize: team.players.length,
  })
}))

export default router

import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import { finalizeMatch } from '../workflows/finalizeMatch'
import { validate } from '../middleware/validate'
import { finishMatchSchema } from '../config/schemas'
import asyncHandler from '../middleware/asyncHandler'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

// GET /api/matches
router.get('/', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { sport, date, status } = req.query as { sport?: string; date?: string; status?: string }
  const where: Record<string, any> = {}
  if (sport && sport !== 'all') where.sport = sport.toUpperCase()
  if (status) where.status = status.toUpperCase()
  if (date) {
    const d = new Date(date)
    where.scheduledAt = { gte: d, lt: new Date(d.getTime() + 86400000) }
  }
  const matches = await prisma.match.findMany({ where, orderBy: { scheduledAt: 'asc' }, take: 50 })
  res.json(matches)
}))

// GET /api/matches/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const match = await prisma.match.findUnique({ where: { id: req.params.id } })
  if (!match) return res.status(404).json({ error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' } })
  res.json(match)
}))

// GET /api/matches/:id/stats — REAL data from MatchEvent rows
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const match = await prisma.match.findUnique({ where: { id: req.params.id } })
  if (!match) return res.status(404).json({ error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' } })

  // Aggregate real events from MatchEvent table
  const events = await prisma.matchEvent.findMany({
    where: { matchId: req.params.id },
    orderBy: { minute: 'asc' },
  })

  const goalEvents = events.filter((e: any) => e.type === 'GOAL')
  const yellowCards = events.filter((e: any) => e.type === 'YELLOW_CARD')
  const redCards = events.filter((e: any) => e.type === 'RED_CARD')
  const possessionTicks = events.filter((e: any) => e.type === 'POSSESSION_TICK')

  // Compute average possession from ticks
  const avgHomePossession = possessionTicks.length > 0
    ? Math.round(possessionTicks.reduce((sum: number, e: any) => sum + (e.detail?.homePossession || 50), 0) / possessionTicks.length)
    : 50

  res.json({
    matchId: req.params.id,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    status: match.status,
    events: events.length,
    goals: goalEvents.map((e: any) => ({
      minute: e.minute,
      teamId: e.teamId,
      detail: e.detail,
    })),
    cards: {
      yellow: yellowCards.length,
      red: redCards.length,
    },
    possession: {
      home: avgHomePossession,
      away: 100 - avgHomePossession,
    },
    totalEvents: events.length,
    goalCount: goalEvents.length,
  })
}))

// GET /api/matches/:id/lineups — generate from Player pool or 501
router.get('/:id/lineups', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const match = await prisma.match.findUnique({ where: { id: req.params.id } })
  if (!match) return res.status(404).json({ error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' } })

  // Try to generate lineups from Player pool
  const homePlayers = await prisma.player.findMany({
    where: { teamId: match.homeTeamId },
    orderBy: { name: 'asc' },
    take: 11,
  })
  const awayPlayers = await prisma.player.findMany({
    where: { teamId: match.awayTeamId },
    orderBy: { name: 'asc' },
    take: 11,
  })

  if (homePlayers.length === 0 && awayPlayers.length === 0) {
    return res.status(501).json({
      error: { code: 'NOT_IMPLEMENTED', message: 'No player data available for lineups. Add players to teams first.' },
    })
  }

  res.json({
    matchId: req.params.id,
    home: { formation: '4-3-3', players: homePlayers },
    away: { formation: '4-3-3', players: awayPlayers },
  })
}))

// GET /api/matches/:id/h2h — REAL head-to-head from past simulated matches
router.get('/:id/h2h', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const match = await prisma.match.findUnique({ where: { id: req.params.id } })
  if (!match) return res.status(404).json({ error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' } })

  // Find past FINISHED matches between the same two teams
  const pastMatches = await prisma.match.findMany({
    where: {
      id: { not: match.id },
      status: 'FINISHED',
      OR: [
        { homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId },
        { homeTeamId: match.awayTeamId, awayTeamId: match.homeTeamId },
      ],
    },
    orderBy: { finishedAt: 'desc' },
    take: 10,
  })

  let homeWins = 0
  let awayWins = 0
  let draws = 0
  let totalHomeGoals = 0
  let totalAwayGoals = 0

  for (const m of pastMatches) {
    if (m.homeScore !== null && m.awayScore !== null) {
      // Normalize to current home team's perspective
      const isHome = m.homeTeamId === match.homeTeamId
      const teamGoals = isHome ? m.homeScore : m.awayScore
      const oppGoals = isHome ? m.awayScore : m.homeScore

      totalHomeGoals += teamGoals
      totalAwayGoals += oppGoals

      if (teamGoals > oppGoals) homeWins++
      else if (teamGoals < oppGoals) awayWins++
      else draws++
    }
  }

  res.json({
    matchId: req.params.id,
    homeTeamName: match.homeTeamName,
    awayTeamName: match.awayTeamName,
    totalMatches: pastMatches.length,
    homeWins,
    awayWins,
    draws,
    avgHomeGoals: pastMatches.length > 0 ? (totalHomeGoals / pastMatches.length).toFixed(1) : '0',
    avgAwayGoals: pastMatches.length > 0 ? (totalAwayGoals / pastMatches.length).toFixed(1) : '0',
    recentResults: pastMatches.slice(0, 5).map((m: any) => ({
      id: m.id,
      date: m.finishedAt,
      homeTeam: m.homeTeamName,
      awayTeam: m.awayTeamName,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
    })),
  })
}))

// POST /api/matches/:id/finish — manual finish (legacy, for admin override)
router.post('/:id/finish', authenticateToken, requireAdmin, validate(finishMatchSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { homeScore, awayScore } = req.body as { homeScore?: number; awayScore?: number }

  const match = await prisma.match.findUnique({ where: { id: req.params.id } })
  if (!match) {
    return res.status(404).json({ error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' } })
  }
  if (match.status === 'FINISHED') {
    return res.status(400).json({ error: { code: 'MATCH_ALREADY_FINISHED', message: 'Match already finished' } })
  }

  const data: Record<string, any> = { status: 'FINISHED', finishedAt: new Date(), minute: 90 }
  if (homeScore !== undefined) data.homeScore = homeScore
  if (awayScore !== undefined) data.awayScore = awayScore

  const updated = await prisma.match.update({ where: { id: req.params.id }, data })

  const scoring = await finalizeMatch(prisma, String(req.params.id), { mode: 'auto', io: req.app.get('io') })

  const io = req.app.get('io')
  if (io) {
    io.to(`match:${req.params.id}`).emit('SIM_FULLTIME', { matchId: req.params.id, homeScore: updated.homeScore, awayScore: updated.awayScore })
    io.to('global').emit('SIM_FULLTIME', { matchId: req.params.id, homeTeamName: updated.homeTeamName, awayTeamName: updated.awayTeamName, homeScore: updated.homeScore, awayScore: updated.awayScore })
  }

  res.json({ match: updated, scoring })
}))

// GET /api/matches/:id/timeline — real events from MatchEvent table
router.get('/:id/timeline', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const events = await prisma.matchEvent.findMany({
    where: { matchId: req.params.id },
    orderBy: { minute: 'asc' },
  })

  if (events.length === 0) {
    return res.status(404).json({ error: { code: 'NO_EVENTS', message: 'No events found for this match. The simulation may not have run yet.' } })
  }

  res.json({ matchId: req.params.id, events })
}))

export default router

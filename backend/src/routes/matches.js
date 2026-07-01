const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { queueScoreMatchPredictions, queueRecalculateRanks } = require('../workers/queue')
const { scoreMatchPredictions, recalculateRanks } = require('../services/scoring')
const { validate } = require('../middleware/validate')
const { finishMatchSchema } = require('../config/schemas')

/**
 * Middleware: require ADMIN or SUPERADMIN role
 */
async function requireAdmin(req, res, next) {
  try {
    const prisma = req.app.get('prisma')
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { role: true } })
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return res.status(403).json({ message: 'Admin access required' })
    }
    next()
  } catch (err) { next(err) }
}

// GET /api/matches
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { sport, date, status } = req.query
    const where = {}
    if (sport && sport !== 'all') where.sport = sport.toUpperCase()
    if (status) where.status = status.toUpperCase()
    if (date) {
      const d = new Date(date)
      where.scheduledAt = { gte: d, lt: new Date(d.getTime() + 86400000) }
    }
    const matches = await prisma.match.findMany({ where, orderBy: { scheduledAt: 'asc' }, take: 50 })
    res.json(matches)
  } catch (err) { next(err) }
})

// GET /api/matches/:id
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const match = await prisma.match.findUnique({ where: { id: req.params.id } })
    if (!match) return res.status(404).json({ message: 'Match not found' })
    res.json(match)
  } catch (err) { next(err) }
})

// GET /api/matches/:id/stats
router.get('/:id/stats', async (req, res) => {
  // TODO: Wire to a real match statistics data source
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Match statistics are not yet available. Coming soon with SportRadar integration.' },
  })
})

// GET /api/matches/:id/lineups
router.get('/:id/lineups', async (req, res) => {
  // TODO: Wire to a real lineups data source
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Lineups data is not yet available. Coming soon with SportRadar integration.' },
  })
})

// GET /api/matches/:id/h2h
router.get('/:id/h2h', async (req, res) => {
  // TODO: Wire to real head-to-head data from completed matches
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Head-to-head data is not yet available. Coming soon.' },
  })
})

/**
 * POST /api/matches/:id/finish
 * Marks a match as FINISHED and triggers scoring for all predictions.
 * Optionally accepts a score to set if not already set.
 * Can use BullMQ (async) or direct (sync) scoring via `mode` query param.
 */
router.post('/:id/finish', authenticateToken, requireAdmin, validate(finishMatchSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { homeScore, awayScore } = req.body
    const mode = req.query.mode || 'queue' // 'queue' | 'direct'

    const match = await prisma.match.findUnique({ where: { id: req.params.id } })
    if (!match) {
      return res.status(404).json({
        error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' },
      })
    }
    if (match.status === 'FINISHED') {
      return res.status(400).json({
        error: { code: 'MATCH_ALREADY_FINISHED', message: 'Match already finished' },
      })
    }

    // Update match with final score and status
    const data = {
      status: 'FINISHED',
      finishedAt: new Date(),
      minute: 90,
    }
    if (homeScore !== undefined) data.homeScore = homeScore
    if (awayScore !== undefined) data.awayScore = awayScore

    const updated = await prisma.match.update({
      where: { id: req.params.id },
      data,
    })

    // Lock all pending predictions
    await prisma.prediction.updateMany({
      where: { matchId: req.params.id, status: 'PENDING' },
      data: { status: 'LOCKED', lockedAt: new Date() },
    })

    // Trigger scoring
    let scoringResult = null
    if (mode === 'direct') {
      // Synchronous scoring (for smaller matches/testing)
      try {
        scoringResult = await scoreMatchPredictions(prisma, req.params.id)
        await recalculateRanks(prisma)
      } catch (err) {
        console.error('[Scoring] Direct scoring error:', err.message)
        scoringResult = { error: err.message }
      }
    } else {
      // Async scoring via BullMQ (default)
      try {
        await queueScoreMatchPredictions(req.params.id)
        await queueRecalculateRanks()
      } catch (err) {
        console.warn('[Scoring] BullMQ unavailable, falling back to direct scoring:', err.message)
        // Fallback to direct scoring if queue is unavailable
        scoringResult = await scoreMatchPredictions(prisma, req.params.id)
        await recalculateRanks(prisma)
      }
    }

    // Determine actual mode used (queue might fallback to direct)
    const actualMode = scoringResult ? 'direct' : mode

    // Log match finished
    await prisma.scoringLog.create({
      data: {
        matchId: req.params.id,
        type: 'match_finished',
        detail: { homeScore: updated.homeScore, awayScore: updated.awayScore, mode: actualMode },
      },
    })

    // Emit socket event
    const io = req.app.get('io')
    if (io) {
      io.to(`match:${req.params.id}`).emit('MATCH_FINISHED', {
        matchId: req.params.id,
        homeScore: updated.homeScore,
        awayScore: updated.awayScore,
      })
      io.to('global').emit('MATCH_FINISHED', {
        matchId: req.params.id,
        homeTeamName: updated.homeTeamName,
        awayTeamName: updated.awayTeamName,
        homeScore: updated.homeScore,
        awayScore: updated.awayScore,
      })
    }

    res.json({
      match: updated,
      scoring: actualMode === 'direct' ? (scoringResult?.error ? 'failed' : 'completed') : 'queued',
      ...(scoringResult?.error && { scoringError: scoringResult.error }),
      ...(scoringResult?.scored !== undefined && { scored: scoringResult.scored, usersAffected: scoringResult.usersAffected }),
    })
  } catch (err) { next(err) }
})

// GET /api/matches/:id/timeline
router.get('/:id/timeline', (req, res) => {
  // TODO: Wire to real match event data from MatchEvent table
  res.status(501).json({
    error: { code: 'NOT_IMPLEMENTED', message: 'Match timeline data is not yet available. Coming soon.' },
  })
})

module.exports = router

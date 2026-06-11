const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { scoreMatchPredictions } = require('../services/scoring')
const { queueScoreMatchPredictions, queueRecalculateRanks } = require('../workers/queue')

// POST /api/predictions
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { matchId, homeGoals, awayGoals, firstScorer, totalGoalsOU, btts } = req.body
    const prediction = await prisma.prediction.create({
      data: { userId: req.userId, matchId, homeGoals, awayGoals, firstScorer, totalGoalsOU, btts, status: 'PENDING' },
    })
    res.status(201).json(prediction)
  } catch (err) { next(err) }
})

// GET /api/predictions/mine
router.get('/mine', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const predictions = await prisma.prediction.findMany({
      where: { userId: req.userId },
      include: { match: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(predictions)
  } catch (err) { next(err) }
})

// GET /api/predictions/match/:matchId
router.get('/match/:matchId', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const predictions = await prisma.prediction.findMany({
      where: { matchId: req.params.matchId },
      include: { user: { select: { id: true, username: true, avatar: true } } },
    })
    res.json(predictions)
  } catch (err) { next(err) }
})

// POST /api/predictions/score/:matchId
// Score all predictions for a finished match (manual trigger)
router.post('/score/:matchId', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { mode } = req.query // 'queue' | 'direct'

    const match = await prisma.match.findUnique({ where: { id: req.params.matchId } })
    if (!match) return res.status(404).json({ message: 'Match not found' })
    if (match.status !== 'FINISHED') {
      return res.status(400).json({ message: 'Match must be FINISHED to score predictions' })
    }

    // Lock all pending predictions before scoring
    await prisma.prediction.updateMany({
      where: { matchId: req.params.matchId, status: 'PENDING' },
      data: { status: 'LOCKED', lockedAt: new Date() },
    })

    if (mode === 'direct') {
      const result = await scoreMatchPredictions(prisma, req.params.matchId)
      await queueRecalculateRanks()
      return res.json({ mode: 'direct', ...result })
    }

    await queueScoreMatchPredictions(req.params.matchId)
    await queueRecalculateRanks()
    res.json({ mode: 'queued', message: 'Scoring queued' })
  } catch (err) { next(err) }
})

// PATCH /api/predictions/:id/score
router.patch('/:id/score', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { pointsEarned, status } = req.body
    const prediction = await prisma.prediction.update({
      where: { id: req.params.id },
      data: { pointsEarned, status },
    })
    res.json(prediction)
  } catch (err) { next(err) }
})

module.exports = router

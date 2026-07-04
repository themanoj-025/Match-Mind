import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createPredictionSchema, scorePredictionSchema } from '../config/schemas'
import { predictionLimiter } from '../middleware/rateLimiter'
import { finalizeMatch } from '../workflows/finalizeMatch'
import asyncHandler from '../middleware/asyncHandler'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

// POST /api/predictions — rate limited to 30/min/user
router.post('/', authenticateToken, predictionLimiter, validate(createPredictionSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { matchId, homeGoals, awayGoals, firstScorer: firstScorerName, totalGoalsOU, totalGoalsLine, btts } = req.body as {
    matchId: string
    homeGoals: number
    awayGoals: number
    firstScorer?: string | null
    totalGoalsOU?: string | null
    totalGoalsLine?: number | null
    btts?: boolean | null
  }

  // Validate match exists and is SCHEDULED
  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) {
    return res.status(404).json({
      error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' },
    })
  }
  if (match.status !== 'SCHEDULED') {
    return res.status(400).json({
      error: { code: 'MATCH_NOT_SCHEDULED', message: 'Can only predict on scheduled matches' },
    })
  }

  // Check if user already predicted this match
  const existing = await prisma.prediction.findUnique({
    where: { userId_matchId: { userId: req.userId, matchId } },
  })
  if (existing) {
    return res.status(409).json({
      error: { code: 'DUPLICATE_PREDICTION', message: 'You have already predicted this match' },
    })
  }

  const prediction = await prisma.prediction.create({
    data: { userId: req.userId, matchId, homeGoals, awayGoals, firstScorerId: firstScorerName || null, totalGoalsOU, totalGoalsLine, btts, status: 'PENDING' },
  })
  res.status(201).json(prediction)
}))

// GET /api/predictions/mine
router.get('/mine', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const predictions = await prisma.prediction.findMany({
    where: { userId: req.userId },
    include: { match: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  res.json(predictions)
}))

// GET /api/predictions/match/:matchId
router.get('/match/:matchId', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const predictions = await prisma.prediction.findMany({
    where: { matchId: req.params.matchId },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  })
  res.json(predictions)
}))

// POST /api/predictions/score/:matchId
// Score all predictions for a finished match (manual trigger)
router.post('/score/:matchId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { mode } = req.query as { mode?: string }

  const match = await prisma.match.findUnique({ where: { id: req.params.matchId } })
  if (!match) return res.status(404).json({ error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' } })
  if (match.status !== 'FINISHED') {
    return res.status(400).json({ error: { code: 'MATCH_NOT_FINISHED', message: 'Match must be FINISHED to score predictions' } })
  }

  const result = await finalizeMatch(prisma, String(req.params.matchId), { mode: mode as 'queue' | 'direct' | 'auto' | undefined })
  res.json(result)
}))

// PATCH /api/predictions/:id/score
router.patch('/:id/score', validate(scorePredictionSchema), asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { pointsEarned, status } = req.body
  const prediction = await prisma.prediction.update({
    where: { id: req.params.id },
    data: { pointsEarned, status },
  })
  res.json(prediction)
}))

export default router

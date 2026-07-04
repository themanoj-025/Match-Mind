import express from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { TOURNAMENTS } from '../config/tournaments'

const router = express.Router()

// GET /api/tournaments — returns the 2 configured tournaments
router.get('/', asyncHandler(async (_req, res) => {
  res.json(TOURNAMENTS.map((t, i) => ({
    ...t,
    status: ['UPCOMING', 'UPCOMING'][i],
  })))
}))

// GET /api/tournaments/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const tournament = TOURNAMENTS.find((t) => t.id === req.params.id)
  if (!tournament) {
    return res.status(404).json({ error: { code: 'TOURNAMENT_NOT_FOUND', message: 'Tournament not found' } })
  }
  res.json(tournament)
}))

export default router

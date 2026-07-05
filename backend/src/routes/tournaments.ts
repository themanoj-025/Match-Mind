import express from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { getTournament, listLive, listAnnounced, listVisible } from '../config/tournaments'

const router = express.Router()

// GET /api/tournaments — returns LIVE + ANNOUNCED tournaments (visible to end users)
router.get('/', asyncHandler(async (_req, res) => {
  const tournaments = listVisible()
  res.json(tournaments)
}))

// GET /api/tournaments/live — returns only LIVE tournaments (for room creation, etc.)
router.get('/live', asyncHandler(async (_req, res) => {
  res.json(listLive())
}))

// GET /api/tournaments/announced — returns only ANNOUNCED tournaments (coming soon)
router.get('/announced', asyncHandler(async (_req, res) => {
  res.json(listAnnounced())
}))

// GET /api/tournaments/:id — returns a single tournament or 404
router.get('/:id', asyncHandler(async (req, res) => {
  const tournament = getTournament(req.params.id as string)
  if (!tournament) {
    return res.status(404).json({ error: { code: 'TOURNAMENT_NOT_FOUND', message: 'Tournament not found' } })
  }
  if (tournament.status === 'ANNOUNCED_NOT_CONFIRMED') {
    return res.status(404).json({ error: { code: 'TOURNAMENT_NOT_FOUND', message: 'Tournament not found' } })
  }
  res.json(tournament)
}))

export default router

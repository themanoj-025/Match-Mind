/**
 * Player Routes — AuctionXI
 *
 * Football-specific players scoped to tournamentId.
 * Removed multi-sport sport filter from MatchMind.
 */

import express from 'express'
import asyncHandler from '../middleware/asyncHandler'

const router = express.Router()

// GET /api/players — list players for a tournament (football only)
router.get('/', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { tournamentId } = req.query as { tournamentId?: string }

  const where: Record<string, any> = {}
  if (tournamentId) where.tournamentId = tournamentId

  const players = await prisma.player.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 100,
  })
  res.json(players)
}))

// GET /api/players/:id — player details
router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const player = await prisma.player.findUnique({ where: { id: req.params.id } })
  if (!player) {
    return res.status(404).json({ error: { code: 'PLAYER_NOT_FOUND', message: 'Player not found' } })
  }
  res.json(player)
}))

export default router

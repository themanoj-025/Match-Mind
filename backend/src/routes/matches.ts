/**
 * Match Routes — AuctionXI (Replacement)
 *
 * MatchMind's old multi-sport match/prediction system is removed.
 * Auctions use the fixture-based system (routes/fixtures.ts).
 * This file provides backward-compatible redirects.
 */

import express from 'express'
import asyncHandler from '../middleware/asyncHandler'

const router = express.Router()

// GET /api/matches — redirect to fixtures
router.get('/', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const fixtures = await prisma.fixture.findMany({
    orderBy: { scheduledAt: 'asc' },
    take: 50,
  })
  res.json(fixtures)
}))

// GET /api/matches/:id — redirect to fixture by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const fixture = await prisma.fixture.findUnique({ where: { id: req.params.id } })
  if (!fixture) {
    return res.status(404).json({ error: { code: 'FIXTURE_NOT_FOUND', message: 'Fixture not found' } })
  }
  res.json(fixture)
}))

export default router

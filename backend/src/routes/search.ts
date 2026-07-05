/**
 * Search Routes — AuctionXI
 *
 * Scoped to users and football players only.
 * Teams and matches removed (single-sport platform with fixture-based system).
 */

import express from 'express'
import asyncHandler from '../middleware/asyncHandler'

const router = express.Router()

// GET /api/search?q= — search users and players
router.get('/', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { q } = req.query as { q?: string }
  if (!q || q.trim().length < 2) {
    return res.json({ users: [], players: [] })
  }

  const query = q.trim()

  const [users, players] = await Promise.all([
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
      },
      take: 10,
    }),

    prisma.player.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 10,
    }),
  ])

  res.json({ users, players })
}))

export default router

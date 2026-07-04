import express from 'express'
import asyncHandler from '../middleware/asyncHandler'

const router = express.Router()

// GET /api/players — list players (optional sport filter)
router.get('/', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { sport } = req.query as { sport?: string }
  const where: Record<string, any> = {}
  if (sport && sport !== 'all') where.sport = sport.toUpperCase()
  const players = await prisma.player.findMany({
    where,
    include: { team: { select: { id: true, name: true, logo: true, sport: true } } },
    orderBy: { name: 'asc' },
    take: 50,
  })
  res.json(players)
}))

// GET /api/players/:id — player details with team info
router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
    include: {
      team: { select: { id: true, name: true, logo: true, sport: true } },
    },
  })
  if (!player) return res.status(404).json({ error: { code: 'PLAYER_NOT_FOUND', message: 'Player not found' } })
  res.json(player)
}))

export default router

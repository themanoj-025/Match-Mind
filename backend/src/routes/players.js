const express = require('express')
const router = express.Router()

// GET /api/players — list players (optional sport filter)
router.get('/', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { sport } = req.query
    const where = {}
    if (sport && sport !== 'all') where.sport = sport.toUpperCase()
    const players = await prisma.player.findMany({
      where,
      include: { team: { select: { id: true, name: true, logo: true, sport: true } } },
      orderBy: { name: 'asc' },
      take: 50,
    })
    res.json(players)
  } catch (err) { next(err) }
})

// GET /api/players/:id — player details with team info
router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const player = await prisma.player.findUnique({
      where: { id: req.params.id },
      include: {
        team: { select: { id: true, name: true, logo: true, sport: true } },
      },
    })
    if (!player) return res.status(404).json({ message: 'Player not found' })
    res.json(player)
  } catch (err) { next(err) }
})

module.exports = router

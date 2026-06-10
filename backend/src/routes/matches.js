const express = require('express')
const router = express.Router()

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
router.get('/:id/stats', (req, res) => {
  res.json({ home: { possession: 55, shots: 12, shotsOnTarget: 5, corners: 7, fouls: 10, yellowCards: 2, xg: 1.8 }, away: { possession: 45, shots: 8, shotsOnTarget: 3, corners: 4, fouls: 8, yellowCards: 1, xg: 1.2 } })
})

// GET /api/matches/:id/lineups
router.get('/:id/lineups', (req, res) => {
  res.json({ home: { formation: '4-3-3', players: ['Ederson', 'Walker', 'Dias', 'Aké', 'Gvardiol', 'Rodri', 'De Bruyne', 'Silva', 'Foden', 'Haaland', 'Alvarez'] }, away: { formation: '4-3-3', players: ['Raya', 'White', 'Saliba', 'Gabriel', 'Zinchenko', 'Rice', 'Ødegaard', 'Havertz', 'Saka', 'Jesus', 'Martinelli'] } })
})

// GET /api/matches/:id/h2h
router.get('/:id/h2h', (req, res) => {
  res.json({ homeWins: 12, draws: 5, awayWins: 8, lastMeetings: [{ date: 'Sep 2025', score: '2-2' }, { date: 'Mar 2025', score: '1-0' }, { date: 'Oct 2024', score: '2-1' }] })
})

// GET /api/matches/:id/timeline
router.get('/:id/timeline', (req, res) => {
  res.json({ events: [{ minute: 67, type: 'goal', team: 'home', scorer: 'J. Alvarez' }, { minute: 42, type: 'goal', team: 'away', scorer: 'M. Ødegaard' }] })
})

module.exports = router

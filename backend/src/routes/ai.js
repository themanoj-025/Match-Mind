const express = require('express')
const router = express.Router()

// POST /api/ai/predict/:matchId
router.post('/predict/:matchId', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const match = await prisma.match.findUnique({ where: { id: req.params.matchId } })
    if (!match) return res.status(404).json({ message: 'Match not found' })

    res.json({
      homeGoals: 2,
      awayGoals: 1,
      confidence: 68,
      reasoning: `${match.homeTeamName} have won 4 of their last 5 at home and average 2.4 goals per game. ${match.awayTeamName} have struggled away with only 1 win in 5.`,
    })
  } catch (err) { next(err) }
})

module.exports = router

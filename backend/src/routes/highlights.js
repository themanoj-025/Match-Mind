const express = require('express')
const router = express.Router()
const asyncHandler = require('../middleware/asyncHandler')

// GET /api/highlights — generate from real MatchEvent GOAL events
router.get('/', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { limit = 10 } = req.query

  // Get recent FINISHED matches with goal events
  const recentMatches = await prisma.match.findMany({
    where: { status: 'FINISHED' },
    orderBy: { finishedAt: 'desc' },
    take: parseInt(limit),
  })

  // Batch-fetch all goal events for all matches in a single query (fix N+1)
  const matchIds = recentMatches.map((m) => m.id)
  const allGoals = await prisma.matchEvent.findMany({
    where: { matchId: { in: matchIds }, type: 'GOAL' },
    orderBy: { minute: 'asc' },
  })

  // Group goals by matchId in memory
  const goalsByMatchId = new Map()
  for (const goal of allGoals) {
    if (!goalsByMatchId.has(goal.matchId)) {
      goalsByMatchId.set(goal.matchId, [])
    }
    goalsByMatchId.get(goal.matchId).push(goal)
  }

  const highlights = []
  for (const match of recentMatches) {
    const goals = goalsByMatchId.get(match.id) || []
    if (goals.length > 0) {
      highlights.push({
        matchId: match.id,
        homeTeamName: match.homeTeamName,
        awayTeamName: match.awayTeamName,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        competition: match.competition,
        finishedAt: match.finishedAt,
        goals: goals.map((g) => ({
          minute: g.minute,
          teamId: g.teamId,
          detail: g.detail,
        })),
        eventCount: goals.length,
      })
    }
  }

  res.json(highlights)
}))

module.exports = router

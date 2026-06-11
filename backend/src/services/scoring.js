/**
 * Scoring Engine — MatchMind
 *
 * Core scoring logic:
 * - scorePrediction: Calculate points for a single prediction against actual match result
 * - scoreMatchPredictions: Score all predictions for a finished match
 * - updateUserStreaks: Update current and best streaks after scoring
 * - checkTierProgression: Check and update user tier based on total points
 * - recalculateAccuracy: Recalculate prediction accuracy for a user
 * - recalculateRanks: Recalculate global ranks for all users
 * - snapshotLeaderboard: Create a leaderboard snapshot for archival
 * - resetWeeklyLeaderboard: Reset weeklyPoints for all users
 * - resetMonthlyLeaderboard: Reset monthly tracking
 */

const TIER_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 1500,
  PLATINUM: 3500,
  DIAMOND: 7000,
  LEGEND: 12000,
}

const TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGEND']

/**
 * Calculate points for a single prediction against the actual match result.
 *
 * Scoring rules:
 * - Exact score (both goals correct): 50 points
 * - Correct result + goal difference correct: 35 points
 * - Correct result (win/draw) only: 25 points
 * - Correct total goals OU and BTTS (if predicted): 10 points each bonus
 * - Base participation: 5 points (for a valid prediction, even if wrong)
 *
 * Returns { points, breakdown }
 */
function calculatePredictionPoints(prediction, match) {
  const homeScore = match.homeScore ?? 0
  const awayScore = match.awayScore ?? 0
  const predHome = prediction.homeGoals
  const predAway = prediction.awayGoals

  const actualResult = homeScore > awayScore ? 'home' : homeScore < awayScore ? 'away' : 'draw'
  const predResult = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw'

  const actualGD = homeScore - awayScore
  const predGD = predHome - predAway

  const breakdown = {}
  let points = 0

  // Base participation
  if (prediction.status !== 'VOID') {
    points += 5
    breakdown.base = 5
  }

  // Exact score (both goals match)
  if (predHome === homeScore && predAway === awayScore) {
    points += 50
    breakdown.exactScore = 50
    return { points, breakdown }
  }

  // Correct result + goal difference
  if (predResult === actualResult && predGD === actualGD) {
    points += 35
    breakdown.resultAndGD = 35
    return { points, breakdown }
  }

  // Correct result only
  if (predResult === actualResult) {
    points += 25
    breakdown.result = 25
  }

  // BTTS bonus
  if (prediction.btts !== null && prediction.btts !== undefined) {
    const bothScored = homeScore > 0 && awayScore > 0
    if (prediction.btts === bothScored) {
      points += 10
      breakdown.btts = 10
    }
  }

  // Over/Under bonus
  if (prediction.totalGoalsOU && prediction.totalGoalsLine) {
    const totalActual = homeScore + awayScore
    const actualOU = totalActual > prediction.totalGoalsLine ? 'over' : 'under'
    if (prediction.totalGoalsOU === actualOU) {
      points += 10
      breakdown.overUnder = 10
    }
  }

  return { points, breakdown }
}

/**
 * Score all predictions for a finished match.
 * Updates prediction scores + user stats + streaks + tiers in batch.
 */
async function scoreMatchPredictions(prisma, matchId) {
  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) throw new Error(`Match ${matchId} not found`)
  if (match.status !== 'FINISHED') throw new Error(`Match ${matchId} is not finished (${match.status})`)

  const predictions = await prisma.prediction.findMany({
    where: { matchId, status: 'LOCKED' },
  })

  if (predictions.length === 0) {
    console.log(`[Scoring] No predictions to score for match ${matchId}`)
    await prisma.scoringLog.create({
      data: { matchId, type: 'predictions_scored', detail: { count: 0 } },
    })
    return { scored: 0 }
  }

  let scored = 0
  const userUpdates = new Map() // userId -> { correct, incorrect, points }

  // Score each prediction
  for (const prediction of predictions) {
    const { points, breakdown } = calculatePredictionPoints(prediction, match)
    // Only count as "correct" for streaks if they got the actual result right
    const isCorrect = !!(breakdown.exactScore || breakdown.resultAndGD || breakdown.result)

    await prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        status: 'SCORED',
        pointsEarned: points,
        pointsBreakdown: breakdown,
        scoredAt: new Date(),
      },
    })

    // Accumulate user stats
    const existing = userUpdates.get(prediction.userId) || { correct: 0, total: 0, points: 0 }
    existing.total += 1
    existing.points += points
    if (isCorrect) existing.correct += 1
    userUpdates.set(prediction.userId, existing)

    scored++
  }

  // Batch update all affected users in a transaction
  const userUpdatePromises = []
  for (const [userId, stats] of userUpdates) {
    userUpdatePromises.push(
      (async () => {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return

        const newTotalPredictions = user.totalPredictions + stats.total
        const newCorrectPredictions = user.correctPredictions + stats.correct
        const newAccuracy = newTotalPredictions > 0 ? Math.round((newCorrectPredictions / newTotalPredictions) * 1000) / 10 : 0

        const wasCorrect = stats.correct > 0
        const newStreakCurrent = wasCorrect ? user.streakCurrent + stats.correct : 0
        const newStreakBest = Math.max(user.streakBest, newStreakCurrent)

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            totalPoints: { increment: stats.points },
            weeklyPoints: { increment: stats.points },
            totalPredictions: newTotalPredictions,
            correctPredictions: newCorrectPredictions,
            predAccuracy: newAccuracy,
            streakCurrent: newStreakCurrent,
            streakBest: newStreakBest,
          },
        })

        // Check tier progression (pass totalPoints directly to avoid extra query)
        await checkTierProgression(prisma, userId, updatedUser.totalPoints, updatedUser.tier)

        // Emit socket event for real-time updates
        const io = prisma._app?.get?.('io')
        if (io) {
          io.to(`user:${userId}`).emit('PREDICTION_SCORED', {
            matchId,
            pointsEarned: stats.points,
            totalPoints: updatedUser.totalPoints,
            streakCurrent: newStreakCurrent,
            breakdown: stats,
          })
        }
      })(),
    )
  }

  await Promise.all(userUpdatePromises)

  // Log the scoring
  await prisma.scoringLog.create({
    data: {
      matchId,
      type: 'predictions_scored',
      detail: { scored, usersAffected: userUpdates.size },
    },
  })

  console.log(`[Scoring] Scored ${scored} predictions for match ${matchId}, ${userUpdates.size} users affected`)
  return { scored, usersAffected: userUpdates.size }
}

/**
 * Update user streaks when a prediction result comes in.
 */
async function updateUserStreaks(prisma, userId, wasCorrect) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return

  const newStreakCurrent = wasCorrect ? user.streakCurrent + 1 : 0
  const newStreakBest = Math.max(user.streakBest, newStreakCurrent)

  await prisma.user.update({
    where: { id: userId },
    data: {
      streakCurrent: newStreakCurrent,
      streakBest: newStreakBest,
    },
  })
}

/**
 * Check and update user tier based on total points.
 */
async function checkTierProgression(prisma, userId, totalPoints, currentTier) {
  if (!currentTier) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } })
    if (!user) return
    currentTier = user.tier
  }

  let newTier = currentTier
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    const tier = TIER_ORDER[i]
    if (totalPoints >= TIER_THRESHOLDS[tier]) {
      newTier = tier
      break
    }
  }

  if (newTier !== currentTier) {
    await prisma.user.update({
      where: { id: userId },
      data: { tier: newTier },
    })

    // Emit tier upgrade event
    const io = prisma._app?.get?.('io')
    if (io) {
      io.to(`user:${userId}`).emit('TIER_UPGRADE', { tier: newTier, points: totalPoints })
    }

    console.log(`[Tier] ${userId} upgraded to ${newTier} (${totalPoints} pts)`)
  }
}

/**
 * Recalculate prediction accuracy for a specific user.
 */
async function recalculateAccuracy(prisma, userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPredictions: true, correctPredictions: true },
  })
  if (!user) return

  const accuracy = user.totalPredictions > 0
    ? Math.round((user.correctPredictions / user.totalPredictions) * 1000) / 10
    : 0

  await prisma.user.update({
    where: { id: userId },
    data: { predAccuracy: accuracy },
  })
}

/**
 * Recalculate global ranks for all users based on totalPoints.
 */
async function recalculateRanks(prisma) {
  const users = await prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    select: { id: true, totalPoints: true },
  })

  const updates = users.map((user, index) => {
    const newRank = index + 1
    return prisma.user.update({
      where: { id: user.id },
      data: { globalRank: newRank },
    })
  })

  await prisma.$transaction(updates)
  console.log(`[Scoring] Recalculated ranks for ${users.length} users`)
  return { users: users.length }
}

/**
 * Snapshot the current leaderboard for archival.
 */
async function snapshotLeaderboard(prisma, period) {
  const users = await prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    take: 1000,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      totalPoints: true,
      tier: true,
      predAccuracy: true,
      streakCurrent: true,
    },
  })

  const snapshotData = users.map((u, i) => ({
    userId: u.id,
    username: u.username,
    displayName: u.displayName,
    avatar: u.avatar,
    points: u.totalPoints,
    rank: i + 1,
    tier: u.tier,
    accuracy: u.predAccuracy,
    streak: u.streakCurrent,
  }))

  const now = new Date()
  const periodStart = period === 'WEEKLY'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
    : new Date(now.getFullYear(), now.getMonth(), 1)

  const periodEnd = period === 'WEEKLY'
    ? new Date(periodStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0)

  await prisma.leaderboardSnapshot.create({
    data: {
      period,
      periodStart,
      periodEnd,
      snapshot: snapshotData,
    },
  })

  console.log(`[Scoring] Snapshot created: ${period} leaderboard (${snapshotData.length} users)`)
  return { period, users: snapshotData.length }
}

/**
 * Reset weeklyPoints for all users (weekly leaderboard reset).
 * Snapshots the current state before reset.
 */
async function resetWeeklyLeaderboard(prisma) {
  // Snapshot before reset
  await snapshotLeaderboard(prisma, 'WEEKLY')

  // Reset weekly points
  await prisma.user.updateMany({
    data: { weeklyPoints: 0 },
  })

  await prisma.scoringLog.create({
    data: { matchId: 'system', type: 'leaderboard_reset', detail: { period: 'WEEKLY' } },
  })

  console.log('[Scoring] Weekly leaderboard reset complete')
  return { period: 'WEEKLY', reset: true }
}

/**
 * Reset monthly leaderboard (snapshot + archive).
 */
async function resetMonthlyLeaderboard(prisma) {
  await snapshotLeaderboard(prisma, 'MONTHLY')

  await prisma.scoringLog.create({
    data: { matchId: 'system', type: 'leaderboard_reset', detail: { period: 'MONTHLY' } },
  })

  console.log('[Scoring] Monthly leaderboard snapshot complete')
  return { period: 'MONTHLY', reset: true }
}

/**
 * Get tier name for a given point total.
 */
function getTierForPoints(points) {
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    if (points >= TIER_THRESHOLDS[TIER_ORDER[i]]) {
      return TIER_ORDER[i]
    }
  }
  return 'BRONZE'
}

module.exports = {
  calculatePredictionPoints,
  scoreMatchPredictions,
  updateUserStreaks,
  checkTierProgression,
  recalculateAccuracy,
  recalculateRanks,
  snapshotLeaderboard,
  resetWeeklyLeaderboard,
  resetMonthlyLeaderboard,
  getTierForPoints,
  TIER_THRESHOLDS,
  TIER_ORDER,
}

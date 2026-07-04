/**
 * Scoring Engine — MatchMind
 *
 * Core scoring logic:
 * - calculatePredictionPoints: Calculate points for a single prediction against actual match result
 * - scoreMatchPredictions: Score all predictions for a finished match
 * - updateUserStreaks: Update current and best streaks after scoring
 * - checkTierProgression: Check and update user tier based on total points
 * - recalculateAccuracy: Recalculate prediction accuracy for a user
 * - recalculateRanks: Recalculate global ranks for all users
 * - snapshotLeaderboard: Create a leaderboard snapshot for archival
 * - resetWeeklyLeaderboard: Reset weeklyPoints for all users
 * - resetMonthlyLeaderboard: Reset monthly tracking
 */

import logger from '../utils/logger'

// ─── Types ───────────────────────────────────────────────

interface Prediction {
  id: string
  userId: string
  matchId: string
  homeGoals: number
  awayGoals: number
  status: string
  pointsEarned?: number | null
  pointsBreakdown?: Record<string, number> | null
  btts?: boolean | null
  totalGoalsOU?: string | null
  totalGoalsLine?: number | null
  firstScorerId?: string | null
  lockedAt?: Date | null
  scoredAt?: Date | null
  createdAt?: Date
}

interface Match {
  id: string
  status: string
  homeScore?: number | null
  awayScore?: number | null
  homeTeamName?: string
  awayTeamName?: string
}

interface User {
  id: string
  username?: string
  displayName?: string
  totalPoints: number
  weeklyPoints: number
  totalPredictions: number
  correctPredictions: number
  predAccuracy: number
  streakCurrent: number
  streakBest: number
  tier: string
  role?: string
  globalRank?: number | null
}

type DatabaseClient = {
  [model: string]: {
    findUnique: (args: any) => Promise<any>
    findFirst: (args: any) => Promise<any>
    findMany: (args: any) => Promise<any[]>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    updateMany: (args: any) => Promise<{ count: number }>
    delete: (args: any) => Promise<any>
    count: (args?: any) => Promise<number>
  }
} & {
  $transaction: (ops: any[]) => Promise<any[]>
  _app?: { get?: (key: string) => any }
}

interface PointsBreakdown {
  base?: number
  exactScore?: number
  resultAndGD?: number
  result?: number
  btts?: number
  overUnder?: number
  [key: string]: number | undefined
}

interface ScoreResult {
  points: number
  breakdown: PointsBreakdown
}

interface ScoringOutput {
  scored: number
  usersAffected?: number
}

interface SnapshotOutput {
  period: string
  users: number
}

interface ResetOutput {
  period: string
  reset: boolean
}

// ─── Tiers ───────────────────────────────────────────────

export const TIER_THRESHOLDS: Record<string, number> = {
  BRONZE: 0,
  SILVER: 500,
  GOLD: 1500,
  PLATINUM: 3500,
  DIAMOND: 7000,
  LEGEND: 12000,
}

export const TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGEND']

// ─── Scoring Logic ──────────────────────────────────────

/**
 * Calculate points for a single prediction against the actual match result.
 */
export function calculatePredictionPoints(prediction: Prediction | { homeGoals: number; awayGoals: number; status?: string; btts?: boolean | null; totalGoalsOU?: string | null; totalGoalsLine?: number | null }, match: { homeScore?: number | null; awayScore?: number | null }): ScoreResult {
  const homeScore = match.homeScore ?? 0
  const awayScore = match.awayScore ?? 0
  const predHome = prediction.homeGoals
  const predAway = prediction.awayGoals

  const actualResult = homeScore > awayScore ? 'home' : homeScore < awayScore ? 'away' : 'draw'
  const predResult = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw'

  const actualGD = homeScore - awayScore
  const predGD = predHome - predAway

  const breakdown: PointsBreakdown = {}
  let points = 0

  // VOID predictions get no points at all
  if (prediction.status === 'VOID') {
    return { points: 0, breakdown: {} }
  }

  // Base participation
  points += 5
  breakdown.base = 5

  // Exact score (both goals match)
  if (predHome === homeScore && predAway === awayScore) {
    points += 50
    breakdown.exactScore = 50
    applyBonuses(prediction, match, homeScore, awayScore, breakdown)
    points += (breakdown.btts || 0) + (breakdown.overUnder || 0)
    return { points, breakdown }
  }

  // Correct result + goal difference
  if (predResult === actualResult && predGD === actualGD) {
    points += 35
    breakdown.resultAndGD = 35
    applyBonuses(prediction, match, homeScore, awayScore, breakdown)
    points += (breakdown.btts || 0) + (breakdown.overUnder || 0)
    return { points, breakdown }
  }

  // Correct result only
  if (predResult === actualResult) {
    points += 25
    breakdown.result = 25
  }

  // Bonuses for incorrect result predictions
  applyBonuses(prediction, match, homeScore, awayScore, breakdown)
  points += (breakdown.btts || 0) + (breakdown.overUnder || 0)

  return { points, breakdown }
}

/**
 * Calculate bonus points for BTTS and Over/Under.
 */
function applyBonuses(
  prediction: { btts?: boolean | null; totalGoalsOU?: string | null; totalGoalsLine?: number | null },
  _match: { homeScore?: number | null; awayScore?: number | null },
  homeScore: number,
  awayScore: number,
  breakdown: PointsBreakdown
): void {
  // BTTS bonus
  if (prediction.btts !== null && prediction.btts !== undefined) {
    const bothScored = homeScore > 0 && awayScore > 0
    if (prediction.btts === bothScored) {
      breakdown.btts = 10
    }
  }

  // Over/Under bonus
  if (prediction.totalGoalsOU && prediction.totalGoalsLine) {
    const totalActual = homeScore + awayScore
    const actualOU = totalActual > prediction.totalGoalsLine ? 'over' : 'under'
    if (prediction.totalGoalsOU === actualOU) {
      breakdown.overUnder = 10
    }
  }
}

// ─── Score All Predictions ──────────────────────────────

export async function scoreMatchPredictions(prisma: DatabaseClient, matchId: string): Promise<ScoringOutput> {
  const match = await prisma.match.findUnique({ where: { id: matchId } }) as Match | null
  if (!match) throw new Error(`Match ${matchId} not found`)
  if (match.status !== 'FINISHED') throw new Error(`Match ${matchId} is not finished (${match.status})`)

  const predictions = await prisma.prediction.findMany({
    where: { matchId, status: 'LOCKED' },
  }) as Prediction[]

  if (predictions.length === 0) {
    logger.info({ event: 'scoring.no_predictions', matchId }, `No predictions to score for match ${matchId}`)
    await prisma.scoringLog.create({
      data: { matchId, type: 'predictions_scored', detail: { count: 0 } },
    })
    return { scored: 0 }
  }

  let scored = 0
  const userUpdates = new Map<string, { correct: number; total: number; points: number }>()

  // Score each prediction
  for (const prediction of predictions) {
    const { points, breakdown } = calculatePredictionPoints(prediction, match)
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
  const userUpdatePromises: Promise<void>[] = []
  for (const [userId, stats] of userUpdates) {
    userUpdatePromises.push(
      (async () => {
        const user = await prisma.user.findUnique({ where: { id: userId } }) as User | null
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
        }) as User

        // Check tier progression
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

  logger.info({ event: 'scoring.completed', matchId, scored, usersAffected: userUpdates.size }, `Scored ${scored} predictions for match ${matchId}, ${userUpdates.size} users affected`)
  return { scored, usersAffected: userUpdates.size }
}

// ─── Streaks ────────────────────────────────────────────

export async function updateUserStreaks(prisma: DatabaseClient, userId: string, wasCorrect: boolean): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } }) as User | null
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

// ─── Tier Progression ───────────────────────────────────

export async function checkTierProgression(prisma: DatabaseClient, userId: string, totalPoints: number, currentTier?: string): Promise<void> {
  if (!currentTier) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { tier: true } }) as { tier: string } | null
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

    logger.info({ event: 'tier.upgrade', userId, tier: newTier, totalPoints }, `${userId} upgraded to ${newTier} (${totalPoints} pts)`)
  }
}

// ─── Accuracy ───────────────────────────────────────────

export async function recalculateAccuracy(prisma: DatabaseClient, userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalPredictions: true, correctPredictions: true },
  }) as { totalPredictions: number; correctPredictions: number } | null
  if (!user) return

  const accuracy = user.totalPredictions > 0
    ? Math.round((user.correctPredictions / user.totalPredictions) * 1000) / 10
    : 0

  await prisma.user.update({
    where: { id: userId },
    data: { predAccuracy: accuracy },
  })
}

// ─── Ranks ──────────────────────────────────────────────

export async function recalculateRanks(prisma: DatabaseClient): Promise<{ users: number }> {
  const users = await prisma.user.findMany({
    orderBy: { totalPoints: 'desc' },
    select: { id: true, totalPoints: true },
  }) as { id: string; totalPoints: number }[]

  const updates = users.map((user, index) => {
    const newRank = index + 1
    return prisma.user.update({
      where: { id: user.id },
      data: { globalRank: newRank },
    })
  })

  await prisma.$transaction(updates)
  logger.info({ event: 'scoring.ranks_recalculated', count: users.length }, `Recalculated ranks for ${users.length} users`)
  return { users: users.length }
}

// ─── Leaderboard Snapshot ───────────────────────────────

export async function snapshotLeaderboard(prisma: DatabaseClient, period: string): Promise<SnapshotOutput> {
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
  }) as { id: string; username: string; displayName: string | null; avatar: string | null; totalPoints: number; tier: string; predAccuracy: number; streakCurrent: number }[]

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

  logger.info({ event: 'scoring.snapshot_created', period, count: snapshotData.length }, `Snapshot created: ${period} leaderboard (${snapshotData.length} users)`)
  return { period, users: snapshotData.length }
}

// ─── Weekly Reset ───────────────────────────────────────

export async function resetWeeklyLeaderboard(prisma: DatabaseClient): Promise<ResetOutput> {
  await snapshotLeaderboard(prisma, 'WEEKLY')

  await prisma.user.updateMany({
    data: { weeklyPoints: 0 },
  } as any)

  await prisma.scoringLog.create({
    data: { matchId: 'system', type: 'leaderboard_reset', detail: { period: 'WEEKLY' } },
  })

  logger.info({ event: 'scoring.weekly_reset_complete' }, 'Weekly leaderboard reset complete')
  return { period: 'WEEKLY', reset: true }
}

// ─── Monthly Reset ──────────────────────────────────────

export async function resetMonthlyLeaderboard(prisma: DatabaseClient): Promise<ResetOutput> {
  await snapshotLeaderboard(prisma, 'MONTHLY')

  await prisma.scoringLog.create({
    data: { matchId: 'system', type: 'leaderboard_reset', detail: { period: 'MONTHLY' } },
  })

  logger.info({ event: 'scoring.monthly_snapshot_complete' }, 'Monthly leaderboard snapshot complete')
  return { period: 'MONTHLY', reset: true }
}

// ─── Get Tier ───────────────────────────────────────────

export function getTierForPoints(points: number): string {
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    if (points >= TIER_THRESHOLDS[TIER_ORDER[i]]) {
      return TIER_ORDER[i]
    }
  }
  return 'BRONZE'
}

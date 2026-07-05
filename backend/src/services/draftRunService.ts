/**
 * Draft Run Service — AuctionXI v4 §2
 *
 * Post-draft competitive phase: takes a committed squad through matchday
 * rounds where fantasy points are compared against a benchmark. Tracks
 * wins/losses/ties, enforces 3-loss elimination, and awards cosmetic
 * reward tiers for 5-win full clears.
 *
 * Matchday resolution flow:
 *   1. Admin finalizes a fixture → `playerMatchStat` records are created
 *   2. System detects completed fixtures for the squad's tournament
 *   3. Computes fantasy points for each squad player from real match stats
 *   4. Compares total squad fantasy points against a benchmark score
 *   5. Records win/loss/tie, advances the DraftRun state
 *
 * If no fixture data exists yet, the run returns a "WAITING_FOR_MATCHDAY"
 * status — the user polls later when real matches have been played.
 */

import { DRAFT } from '../config/constants'
import type { DraftSession, DraftPick, SquadPlayer } from './draftService'
import { computeSynergyScore } from './draftService'
import logger from '../utils/logger'

// ─── Types ───────────────────────────────────────────────

export type DraftRunStatus = 'IN_PROGRESS' | 'WAITING_FOR_MATCHDAY' | 'COMPLETE'
export type RunOutcome = 'WIN' | 'LOSS' | 'TIE'

export interface DraftRunResult {
  id: string
  draftSessionId: string
  userId: string
  tournamentId: string
  currentRound: number              // which matchday round (0-indexed)
  totalWins: number
  totalLosses: number
  totalTies: number
  status: DraftRunStatus
  rewards: string[]                 // cosmetic reward IDs earned
  eliminatedAt: string | null       // date when 3rd loss occurred
  clearedAt: string | null          // date when 5th win occurred
  createdAt: string
  updatedAt: string
}

export interface DraftRunRound {
  roundNumber: number
  matchdayId: string | null         // the fixture/matchday ID (null if no real match yet)
  matchdayName: string | null       // e.g. "Matchday 1"
  outcome: RunOutcome | null        // null if matchday not yet resolved
  userPoints: number
  benchmarkPoints: number
  breakdown: Record<string, number> // per-player fantasy point breakdown
}

export interface DraftRunState {
  result: DraftRunResult
  rounds: DraftRunRound[]
  squad: SquadPlayer[]
  currentRound: DraftRunRound | null
  isEliminated: boolean
  isFullClear: boolean
  nextMatchdayLabel: string | null
}

const BENCHMARK_SCORE_BASE = 45     // average fantasy points for a full squad
const BENCHMARK_VARIANCE = 15       // ± random variance

// ─── Reward Tiers (§2.4) ─────────────────────────────────

export interface RewardTier {
  id: string
  name: string
  description: string
  badgeColor: string
  minWins: number
}

export const RUN_REWARD_TIERS: RewardTier[] = [
  { id: 'participant', name: 'Participant', description: 'Entered your first Draft Run', badgeColor: '#6B7280', minWins: 0 },
  { id: 'bronze-run', name: 'Bronze Contender', description: 'Survived 1 matchday', badgeColor: '#CD7F32', minWins: 1 },
  { id: 'silver-run', name: 'Silver Challenger', description: 'Survived 2 matchdays', badgeColor: '#C0C0C0', minWins: 2 },
  { id: 'gold-run', name: 'Gold Warrior', description: 'Survived 3 matchdays', badgeColor: '#FFD700', minWins: 3 },
  { id: 'elite-run', name: 'Elite Tactician', description: 'Survived 4 matchdays', badgeColor: '#8B5CF6', minWins: 4 },
  { id: 'icon-run', name: 'Draft Icon 🏆', description: 'Full clear — 5 wins!', badgeColor: 'linear-gradient(135deg,#FFD700,#FFFFFF)', minWins: 5 },
] as const

// ─── Enter Run (§2.1) ───────────────────────────────────

export async function enterRun(
  prisma: any,
  sessionId: string,
  userId: string,
): Promise<{ success: boolean; result?: DraftRunResult; error?: string }> {
  const session = await prisma.draftSession.findUnique({ where: { id: sessionId } }) as DraftSession | null
  if (!session) return { success: false, error: 'Session not found' }
  if (session.userId !== userId) return { success: false, error: 'Not your draft session' }
  if (session.status !== 'SQUAD_COMPLETE') {
    return { success: false, error: `Session status must be SQUAD_COMPLETE to enter a run (current: ${session.status})` }
  }

  // Check if a run already exists for this session
  const existingRuns = await prisma.draftRunResult.findMany({
    where: { draftSessionId: sessionId },
  }) as DraftRunResult[]

  if (existingRuns.length > 0) {
    return { success: false, error: 'A Draft Run already exists for this session. Check run-status to continue.' }
  }

  // Create the Draft Run result
  const now = new Date().toISOString()
  const result = await prisma.draftRunResult.create({
    data: {
      draftSessionId: sessionId,
      userId,
      tournamentId: session.tournamentId,
      currentRound: 0,
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      status: 'WAITING_FOR_MATCHDAY',
      rewards: ['participant'],
      eliminatedAt: null,
      clearedAt: null,
      createdAt: now,
      updatedAt: now,
    },
  }) as DraftRunResult

  // Update session status
  await prisma.draftSession.update({
    where: { id: sessionId },
    data: { status: 'RUN_IN_PROGRESS' },
  })

  logger.info({
    event: 'draft_run.entered',
    sessionId,
    userId,
    tournamentId: session.tournamentId,
  })

  return { success: true, result }
}

// ─── Get Run Status (§2.3) ──────────────────────────────

export async function getRunStatus(
  prisma: any,
  sessionId: string,
  userId: string,
): Promise<{ success: boolean; state?: DraftRunState; error?: string }> {
  const session = await prisma.draftSession.findUnique({ where: { id: sessionId } }) as DraftSession | null
  if (!session) return { success: false, error: 'Session not found' }
  if (session.userId !== userId) return { success: false, error: 'Not your draft session' }

  const results = await prisma.draftRunResult.findMany({
    where: { draftSessionId: sessionId },
  }) as DraftRunResult[]

  if (results.length === 0) {
    return { success: false, error: 'No Draft Run found for this session. Enter a run first.' }
  }

  const result = results[0]

  // Get picks for squad info
  const picks = await prisma.draftPick.findMany({
    where: { draftSessionId: sessionId },
  }) as DraftPick[]

  const squad: SquadPlayer[] = picks
    .filter((p) => p.pickedPlayerId != null)
    .map((p) => ({
      playerId: p.pickedPlayerId!,
      position: p.position,
      slotIndex: p.slotIndex,
      isAutoPicked: p.autoPicked,
      rarityTier: p.offeredRarities[p.offeredPlayerIds.indexOf(p.pickedPlayerId!)] || 'BRONZE',
    }))

  // Check for completed fixtures that haven't been processed yet
  const processedRounds = result.currentRound
  const unresolvedFixtures = await findUnresolvedFixtures(prisma, session.tournamentId, processedRounds)

  if (unresolvedFixtures.length > 0 && result.status === 'WAITING_FOR_MATCHDAY') {
    // Process the next matchday round
    const outcome = await resolveNextRound(prisma, result, squad, sessionId, unresolvedFixtures[0])
    if (outcome) {
      result.currentRound = outcome.roundNumber
      result.totalWins = outcome.newWins
      result.totalLosses = outcome.newLosses
      result.totalTies = outcome.newTies
      result.status = outcome.newStatus
      result.updatedAt = new Date().toISOString()
      if (outcome.eliminatedAt) result.eliminatedAt = outcome.eliminatedAt
      if (outcome.clearedAt) result.clearedAt = outcome.clearedAt
      if (outcome.rewards.length > 0) result.rewards = [...new Set([...result.rewards, ...outcome.rewards])]
    }
  }

  const isEliminated = result.totalLosses >= DRAFT.MAX_LOSSES && result.status === 'COMPLETE'
  const isFullClear = result.totalWins >= DRAFT.MAX_WINS && result.status === 'COMPLETE'

  // Build current round info
  const allRounds = await prisma.draftRunRound?.findMany?.({ where: { draftRunId: result.id } }) || []

  let currentRound: DraftRunRound | null = null
  if (allRounds.length > 0) {
    const lastRound = allRounds[allRounds.length - 1]
    currentRound = {
      roundNumber: lastRound.roundNumber,
      matchdayId: lastRound.matchdayId,
      matchdayName: lastRound.matchdayName,
      outcome: lastRound.outcome,
      userPoints: lastRound.userPoints,
      benchmarkPoints: lastRound.benchmarkPoints,
      breakdown: lastRound.breakdown || {},
    }
  }

  // Next matchday label
  const nextMatchdayLabel = result.status === 'WAITING_FOR_MATCHDAY'
    ? `Waiting for Matchday ${result.currentRound + 1}`
    : null

  return {
    success: true,
    state: {
      result,
      rounds: allRounds.map((r: any) => ({
        roundNumber: r.roundNumber,
        matchdayId: r.matchdayId,
        matchdayName: r.matchdayName,
        outcome: r.outcome,
        userPoints: r.userPoints,
        benchmarkPoints: r.benchmarkPoints,
        breakdown: r.breakdown || {},
      })),
      squad,
      currentRound,
      isEliminated,
      isFullClear,
      nextMatchdayLabel,
    },
  }
}

// ─── Find Unresolved Fixtures ────────────────────────────

async function findUnresolvedFixtures(
  prisma: any,
  tournamentId: string,
  processedRoundCount: number,
): Promise<any[]> {
  // Find COMPLETED fixtures for this tournament that haven't been resolved yet
  const fixtures = await prisma.fixture.findMany({
    where: { tournamentId, status: 'COMPLETED' },
    orderBy: { scheduledAt: 'asc' },
    take: 10,
  })

  // Skip fixtures already processed (past the current round)
  return fixtures.slice(processedRoundCount)
}

// ─── Resolve Next Round ─────────────────────────────────

async function resolveNextRound(
  prisma: any,
  result: DraftRunResult,
  squad: SquadPlayer[],
  sessionId: string,
  fixture: any,
): Promise<{
  roundNumber: number
  newWins: number
  newLosses: number
  newTies: number
  newStatus: DraftRunStatus
  eliminatedAt: string | null
  clearedAt: string | null
  rewards: string[]
} | null> {
  try {
    // Get player match stats for this fixture
    const playerStats = await prisma.playerMatchStat.findMany({
      where: { fixtureId: fixture.id },
    })

    if (!playerStats || playerStats.length === 0) {
      logger.warn({
        event: 'draft_run.no_stats',
        fixtureId: fixture.id,
        sessionId,
      })
      return null
    }

    // Get all players for this tournament to look up positions
    const allPlayers = await prisma.player.findMany({
      where: { tournamentId: result.tournamentId },
    })
    const playerMap = new Map(allPlayers.map((p: any) => [p.id, p]))

    // Compute fantasy points for each squad player using real match stats
    const statsMap = new Map(playerStats.map((s: any) => [s.playerId, s]))
    
    // Also fetch fantasy points from the ledger if available
    let userSquadPoints = 0
    const breakdown: Record<string, number> = {}

    for (const sp of squad) {
      const stats = statsMap.get(sp.playerId)
      if (!stats) {
        // Player didn't play (no stats) — 0 points
        breakdown[sp.playerId] = 0
        continue
      }

      // Use the existing fantasy points engine if ledger entries exist
      const ledgerEntries = await prisma.fantasyPointsLedger.findMany({
        where: { playerId: sp.playerId, fixtureId: fixture.id },
      })

      if (ledgerEntries && ledgerEntries.length > 0) {
        const points = ledgerEntries.reduce((sum: number, e: any) => sum + e.totalPoints, 0)
        userSquadPoints += points
        breakdown[sp.playerId] = points
      } else {
        // Fallback: compute approximate fantasy points from raw stats
        const player = playerMap.get(sp.playerId)
        const position = player?.position || sp.position
        const points = computeApproximatePoints(stats, position)
        userSquadPoints += points
        breakdown[sp.playerId] = points
      }
    }

    // Apply synergy bonus as percentage boost
    const synergyScore = result.currentRound > 0
      ? (await prisma.draftSession.findUnique({ where: { id: sessionId } }))?.synergyScore ?? 0
      : 0
    const synergyMultiplier = 1 + (synergyScore / 100)
    userSquadPoints = Math.round(userSquadPoints * synergyMultiplier)

    // Generate benchmark score: base + variance
    const benchmarkPoints = BENCHMARK_SCORE_BASE + Math.round(
      (Math.random() * 2 - 1) * BENCHMARK_VARIANCE
    )

    // Determine outcome
    const margin = userSquadPoints - benchmarkPoints
    let outcome: RunOutcome
    if (margin > 5) {
      outcome = 'WIN'
    } else if (margin < -5) {
      outcome = 'LOSS'
    } else {
      outcome = 'TIE'
    }

    const newWins = result.totalWins + (outcome === 'WIN' ? 1 : 0)
    const newLosses = result.totalLosses + (outcome === 'LOSS' ? 1 : 0)
    const newTies = result.totalTies + (outcome === 'TIE' ? 1 : 0)

    // Check elimination / full clear
    let newStatus: DraftRunStatus = 'WAITING_FOR_MATCHDAY'
    let eliminatedAt: string | null = null
    let clearedAt: string | null = null

    if (newLosses >= DRAFT.MAX_LOSSES) {
      newStatus = 'COMPLETE'
      eliminatedAt = new Date().toISOString()
    } else if (newWins >= DRAFT.MAX_WINS) {
      newStatus = 'COMPLETE'
      clearedAt = new Date().toISOString()
    }

    // Compute rewards earned
    const earnedRewards = RUN_REWARD_TIERS
      .filter((t) => newWins >= t.minWins && result.totalWins < t.minWins)
      .map((t) => t.id)

    // Save round to DB
    const roundNumber = result.currentRound + 1
    const roundData = {
      draftRunId: result.id,
      roundNumber,
      matchdayId: fixture.id,
      matchdayName: fixture.name || `Matchday ${roundNumber}`,
      outcome,
      userPoints: userSquadPoints,
      benchmarkPoints,
      breakdown,
      resolvedAt: new Date().toISOString(),
    }

    // Save round record if the model exists
    if (prisma.draftRunRound) {
      await prisma.draftRunRound.create({ data: roundData })
    }

    // Update the DraftRunResult
    await prisma.draftRunResult.update({
      where: { id: result.id },
      data: {
        currentRound: roundNumber,
        totalWins: newWins,
        totalLosses: newLosses,
        totalTies: newTies,
        status: newStatus,
        rewards: [...new Set([...result.rewards, ...earnedRewards])],
        eliminatedAt,
        clearedAt,
        updatedAt: new Date().toISOString(),
      },
    })

    // If run is complete, update session status
    if (newStatus === 'COMPLETE') {
      await prisma.draftSession.update({
        where: { id: sessionId },
        data: { status: 'RUN_COMPLETE' },
      })
    }

    logger.info({
      event: 'draft_run.round_resolved',
      sessionId,
      roundNumber,
      outcome,
      userPoints: userSquadPoints,
      benchmarkPoints,
      newWins,
      newLosses,
      eliminated: !!eliminatedAt,
      cleared: !!clearedAt,
    })

    return {
      roundNumber,
      newWins,
      newLosses,
      newTies,
      newStatus,
      eliminatedAt,
      clearedAt,
      rewards: earnedRewards,
    }
  } catch (err: any) {
    logger.error({
      event: 'draft_run.resolve_error',
      sessionId,
      fixtureId: fixture?.id,
      error: err.message,
    })
    return null
  }
}

// ─── Approximate Fantasy Points (fallback) ──────────────

function computeApproximatePoints(stats: any, position: string): number {
  let points = 0

  // Minutes
  if (stats.minutesPlayed >= 60) points += 2
  else if (stats.minutesPlayed > 0) points += 1

  // Goals by position
  const goalPoints = position === 'FWD' ? 4 : position === 'MID' ? 5 : 6
  points += (stats.goals || 0) * goalPoints

  // Assists
  points += (stats.assists || 0) * 3

  // Clean sheet (DEF/GK only, played 60+)
  if (stats.cleanSheet && stats.minutesPlayed >= 60) {
    points += position === 'DEF' || position === 'GK' ? 4 : 1
  }

  // Saves (GK)
  if (stats.saves >= 3) points += Math.floor(stats.saves / 3)

  // Penalty saves
  points += (stats.penaltiesSaved || 0) * 5

  // Yellow/red cards
  points -= (stats.yellowCards || 0) * 1
  points -= (stats.redCards || 0) * 3

  // Penalty miss / own goal
  points -= (stats.penaltiesMissed || 0) * 2
  points -= (stats.ownGoals || 0) * 2

  // Goals conceded (DEF/GK)
  if ((position === 'DEF' || position === 'GK') && stats.minutesPlayed > 0 && stats.goalsConceded >= 2) {
    points -= Math.floor(stats.goalsConceded / 2)
  }

  return Math.max(points, 0)
}

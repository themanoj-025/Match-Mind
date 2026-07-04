/**
 * Finalize Match Workflow
 *
 * Consolidates the scoring pattern that was duplicated across
 * matches.js finish route and predictions.js score route.
 */
import logger from '../utils/logger'
import { scoreMatchPredictions, recalculateRanks } from '../services/scoring'
import { queueScoreMatchPredictions, queueRecalculateRanks } from '../workers/queue'

interface FinalizeResult {
  mode: string
  scored?: number
  usersAffected?: number
  error?: string
}

interface FinalizeOpts {
  mode?: 'queue' | 'direct' | 'auto'
  io?: any
}

export async function finalizeMatch(prisma: any, matchId: string, opts: FinalizeOpts = {}): Promise<FinalizeResult> {
  const { mode = 'auto', io } = opts

  // Lock all pending predictions before scoring
  await prisma.prediction.updateMany({
    where: { matchId, status: 'PENDING' },
    data: { status: 'LOCKED', lockedAt: new Date() },
  })

  let scoringResult: { scored: number; usersAffected?: number } | { error: string } | null = null

  if (mode === 'direct') {
    try {
      scoringResult = await scoreMatchPredictions(prisma, matchId)
      await recalculateRanks(prisma)
    } catch (err: any) {
      logger.error({ event: 'scoring.direct_error', matchId, err: err.message }, 'Direct scoring error')
      scoringResult = { error: err.message }
    }
  } else if (mode === 'queue') {
    try {
      await queueScoreMatchPredictions(matchId)
      await queueRecalculateRanks()
    } catch (err: any) {
      logger.warn({ event: 'scoring.bullmq_unavailable', matchId, err: err.message }, 'BullMQ unavailable, falling back to direct scoring')
      scoringResult = await scoreMatchPredictions(prisma, matchId)
      await recalculateRanks(prisma)
    }
  } else {
    // auto: try queue first, fallback to direct
    try {
      await queueScoreMatchPredictions(matchId)
      await queueRecalculateRanks()
    } catch (err: any) {
      logger.warn({ event: 'scoring.queue_unavailable', matchId, err: err.message }, 'Queue unavailable, falling back to direct')
      try {
        scoringResult = await scoreMatchPredictions(prisma, matchId)
        await recalculateRanks(prisma)
      } catch (innerErr: any) {
        logger.error({ event: 'scoring.direct_fallback_failed', matchId, err: innerErr.message }, 'Direct scoring fallback failed')
        scoringResult = { error: innerErr.message }
      }
    }
  }

  const actualMode = scoringResult ? 'direct' : (mode === 'auto' ? 'queue' : mode)

  // Emit socket events if io is provided
  if (io) {
    const match = await prisma.match.findUnique({ where: { id: matchId } })
    if (match) {
      io.to(`match:${matchId}`).emit('MATCH_SCORED', {
        matchId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      })
      io.to('global').emit('MATCH_SCORED', {
        matchId,
        homeTeamName: match.homeTeamName,
        awayTeamName: match.awayTeamName,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
      })
    }
  }

  // Log scoring event
  await prisma.scoringLog.create({
    data: {
      matchId,
      type: 'predictions_scored',
      detail: { mode: actualMode, ...(scoringResult && 'error' in scoringResult ? { error: scoringResult.error } : {}) },
    },
  })

  return {
    mode: actualMode,
    ...(scoringResult && 'error' in scoringResult
      ? { error: scoringResult.error }
      : { scored: (scoringResult as any)?.scored, usersAffected: (scoringResult as any)?.usersAffected }),
  }
}

/**
 * Finalize Match Workflow
 *
 * Consolidates the duplicated "queue score predictions + recalculate ranks"
 * pattern that was repeated in matches.js finish route and predictions.js
 * score route. Single place to call when a match needs to be scored.
 */

const logger = require('../utils/logger')
const { scoreMatchPredictions, recalculateRanks } = require('../services/scoring')
const { queueScoreMatchPredictions, queueRecalculateRanks } = require('../workers/queue')

/**
 * Score all predictions for a finished match and recalculate leaderboard ranks.
 *
 * @param {object} prisma - PrismaClient instance
 * @param {string} matchId - ID of the match to score
 * @param {object} [opts] - Optional overrides
 * @param {'queue'|'direct'|'auto'} [opts.mode='auto'] - Scoring mode
 * @param {object} [opts.io] - Socket.IO instance for real-time events
 * @returns {Promise<{mode: string, scored?: number, usersAffected?: number, error?: string}>}
 */
async function finalizeMatch(prisma, matchId, opts = {}) {
  const { mode = 'auto', io } = opts

  // Lock all pending predictions before scoring
  await prisma.prediction.updateMany({
    where: { matchId, status: 'PENDING' },
    data: { status: 'LOCKED', lockedAt: new Date() },
  })

  let scoringResult = null

  if (mode === 'direct') {
    // Synchronous scoring (for smaller matches / testing)
    try {
      scoringResult = await scoreMatchPredictions(prisma, matchId)
      await recalculateRanks(prisma)
    } catch (err) {
      logger.error({ event: 'scoring.direct_error', matchId, err: err.message }, 'Direct scoring error')
      scoringResult = { error: err.message }
    }
  } else if (mode === 'queue') {
    // Async scoring via BullMQ
    try {
      await queueScoreMatchPredictions(matchId)
      await queueRecalculateRanks()
    } catch (err) {
      logger.warn({ event: 'scoring.bullmq_unavailable', matchId, err: err.message }, 'BullMQ unavailable, falling back to direct scoring')
      scoringResult = await scoreMatchPredictions(prisma, matchId)
      await recalculateRanks(prisma)
    }
  } else {
    // auto: try queue first, fallback to direct
    try {
      await queueScoreMatchPredictions(matchId)
      await queueRecalculateRanks()
    } catch (err) {
      logger.warn({ event: 'scoring.queue_unavailable', matchId, err: err.message }, 'Queue unavailable, falling back to direct')
      try {
        scoringResult = await scoreMatchPredictions(prisma, matchId)
        await recalculateRanks(prisma)
      } catch (innerErr) {
        logger.error({ event: 'scoring.direct_fallback_failed', matchId, err: innerErr.message }, 'Direct scoring fallback failed')
        scoringResult = { error: innerErr.message }
      }
    }
  }

  // Determine actual mode used
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
      detail: { mode: actualMode, ...(scoringResult?.error && { error: scoringResult.error }) },
    },
  })

  return {
    mode: actualMode,
    ...(scoringResult?.error ? { error: scoringResult.error } : { scored: scoringResult?.scored, usersAffected: scoringResult?.usersAffected }),
  }
}

module.exports = { finalizeMatch }

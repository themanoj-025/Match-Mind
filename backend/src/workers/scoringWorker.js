/**
 * BullMQ Workers for MatchMind Scoring Engine
 *
 * Workers:
 * - scorePredictionsWorker: Processes score-match jobs
 * - resetLeaderboardsWorker: Processes weekly/monthly reset jobs
 * - recalculateRanksWorker: Processes rank recalculation jobs
 */

const { Worker } = require('bullmq')
const logger = require('../utils/logger')
const { scoreMatchPredictions, resetWeeklyLeaderboard, resetMonthlyLeaderboard, recalculateRanks } = require('../services/scoring')

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const connection = {
  url: REDIS_URL,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
}

/**
 * Create and return all workers.
 * @param {object} prisma - PrismaClient instance
 * @returns {object} { scorePredictionsWorker, resetLeaderboardsWorker, recalculateRanksWorker }
 */
function createWorkers(prisma) {
  const scorePredictionsWorker = new Worker(
    'score-predictions',
    async (job) => {
      const { matchId } = job.data
      logger.info({ event: 'worker.scoring_started', matchId }, `Scoring predictions for match ${matchId}`)

      const result = await scoreMatchPredictions(prisma, matchId)
      return result
    },
    { connection, concurrency: 5 }
  )

  const resetLeaderboardsWorker = new Worker(
    'reset-leaderboards',
    async (job) => {
      const { period } = job.data
      logger.info({ event: 'worker.leaderboard_reset', period }, `Resetting ${period} leaderboard`)

      if (period === 'WEEKLY') {
        return await resetWeeklyLeaderboard(prisma)
      } else if (period === 'MONTHLY') {
        return await resetMonthlyLeaderboard(prisma)
      }
      throw new Error(`Unknown period: ${period}`)
    },
    { connection, concurrency: 2 }
  )

  const recalculateRanksWorker = new Worker(
    'recalculate-ranks',
    async (job) => {
      logger.info({ event: 'worker.ranks_recalculating' }, 'Recalculating all ranks')
      return await recalculateRanks(prisma)
    },
    { connection, concurrency: 1 }
  )

  // Error handlers
  scorePredictionsWorker.on('failed', (job, err) => {
    logger.error({ event: 'worker.scoring_failed', jobId: job?.id, err: err.message }, 'score-predictions failed')
  })

  resetLeaderboardsWorker.on('failed', (job, err) => {
    logger.error({ event: 'worker.reset_failed', jobId: job?.id, err: err.message }, 'reset-leaderboards failed')
  })

  recalculateRanksWorker.on('failed', (job, err) => {
    logger.error({ event: 'worker.ranks_failed', jobId: job?.id, err: err.message }, 'recalculate-ranks failed')
  })

  scorePredictionsWorker.on('completed', (job) => {
    logger.info({ event: 'worker.scoring_completed', jobId: job?.id, result: job?.returnvalue }, 'score-predictions completed')
  })

  resetLeaderboardsWorker.on('completed', (job) => {
    logger.info({ event: 'worker.reset_completed', jobId: job?.id }, 'reset-leaderboards completed')
  })

  recalculateRanksWorker.on('completed', (job) => {
    logger.info({ event: 'worker.ranks_completed', jobId: job?.id }, 'recalculate-ranks completed')
  })

  return { scorePredictionsWorker, resetLeaderboardsWorker, recalculateRanksWorker }
}

/**
 * Gracefully close all workers.
 */
async function closeWorkers(workers) {
  const { scorePredictionsWorker, resetLeaderboardsWorker, recalculateRanksWorker } = workers
  await Promise.all([
    scorePredictionsWorker?.close(),
    resetLeaderboardsWorker?.close(),
    recalculateRanksWorker?.close(),
  ])
}

module.exports = { createWorkers, closeWorkers }

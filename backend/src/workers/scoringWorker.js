/**
 * BullMQ Workers for MatchMind Scoring Engine
 *
 * Workers:
 * - scorePredictionsWorker: Processes score-match jobs
 * - resetLeaderboardsWorker: Processes weekly/monthly reset jobs
 * - recalculateRanksWorker: Processes rank recalculation jobs
 */

const { Worker } = require('bullmq')
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
      console.log(`[Worker] Scoring predictions for match ${matchId}`)

      const result = await scoreMatchPredictions(prisma, matchId)
      return result
    },
    { connection, concurrency: 5 }
  )

  const resetLeaderboardsWorker = new Worker(
    'reset-leaderboards',
    async (job) => {
      const { period } = job.data
      console.log(`[Worker] Resetting ${period} leaderboard`)

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
      console.log(`[Worker] Recalculating all ranks`)
      return await recalculateRanks(prisma)
    },
    { connection, concurrency: 1 }
  )

  // Error handlers
  scorePredictionsWorker.on('failed', (job, err) => {
    console.error(`[Worker] score-predictions failed: ${job?.id}`, err.message)
  })

  resetLeaderboardsWorker.on('failed', (job, err) => {
    console.error(`[Worker] reset-leaderboards failed: ${job?.id}`, err.message)
  })

  recalculateRanksWorker.on('failed', (job, err) => {
    console.error(`[Worker] recalculate-ranks failed: ${job?.id}`, err.message)
  })

  scorePredictionsWorker.on('completed', (job) => {
    console.log(`[Worker] score-predictions completed: ${job?.id}`, JSON.stringify(job.returnvalue))
  })

  resetLeaderboardsWorker.on('completed', (job) => {
    console.log(`[Worker] reset-leaderboards completed: ${job?.id}`)
  })

  recalculateRanksWorker.on('completed', (job) => {
    console.log(`[Worker] recalculate-ranks completed: ${job?.id}`)
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

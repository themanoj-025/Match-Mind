/**
 * BullMQ Workers for MatchMind Scoring Engine
 */
import { Worker } from 'bullmq'
import logger from '../utils/logger'
import { scoreMatchPredictions, resetWeeklyLeaderboard, resetMonthlyLeaderboard, recalculateRanks } from '../services/scoring'

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const connection = {
  url: REDIS_URL,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
}

interface WorkerSet {
  scorePredictionsWorker: Worker
  resetLeaderboardsWorker: Worker
  recalculateRanksWorker: Worker
}

export function createWorkers(prisma: any): WorkerSet {
  const scorePredictionsWorker = new Worker(
    'score-predictions',
    async (job) => {
      const { matchId } = job.data as { matchId: string }
      logger.info({ event: 'worker.scoring_started', matchId }, `Scoring predictions for match ${matchId}`)
      return await scoreMatchPredictions(prisma, matchId)
    },
    { connection, concurrency: 5 }
  )

  const resetLeaderboardsWorker = new Worker(
    'reset-leaderboards',
    async (job) => {
      const { period } = job.data as { period: string }
      logger.info({ event: 'worker.leaderboard_reset', period }, `Resetting ${period} leaderboard`)
      if (period === 'WEEKLY') return await resetWeeklyLeaderboard(prisma)
      if (period === 'MONTHLY') return await resetMonthlyLeaderboard(prisma)
      throw new Error(`Unknown period: ${period}`)
    },
    { connection, concurrency: 2 }
  )

  const recalculateRanksWorker = new Worker(
    'recalculate-ranks',
    async () => {
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

export async function closeWorkers(workers: WorkerSet): Promise<void> {
  await Promise.all([
    workers.scorePredictionsWorker?.close(),
    workers.resetLeaderboardsWorker?.close(),
    workers.recalculateRanksWorker?.close(),
  ])
}

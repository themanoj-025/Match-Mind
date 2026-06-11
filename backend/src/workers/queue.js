/**
 * BullMQ Queue Setup
 *
 * Queues:
 * - score-predictions: Score predictions for a finished match
 * - reset-leaderboards: Weekly/monthly leaderboard resets
 * - recalculate-ranks: Recalculate all user global ranks
 */

const { Queue, QueueScheduler } = require('bullmq')

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

const connection = {
  url: REDIS_URL,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
}

// Queue definitions
const queues = {
  scorePredictions: new Queue('score-predictions', {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  }),
  resetLeaderboards: new Queue('reset-leaderboards', {
    connection,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: 10,
      removeOnFail: 10,
    },
  }),
  recalculateRanks: new Queue('recalculate-ranks', {
    connection,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 3000 },
      removeOnComplete: 10,
      removeOnFail: 10,
    },
  }),
}

/**
 * Add a job to score all predictions for a finished match.
 */
async function queueScoreMatchPredictions(matchId) {
  return queues.scorePredictions.add('score-match', { matchId }, {
    jobId: `score-match-${matchId}`,
  })
}

/**
 * Schedule a weekly leaderboard reset.
 */
async function queueWeeklyReset() {
  return queues.resetLeaderboards.add('weekly-reset', { period: 'WEEKLY' }, {
    jobId: `weekly-reset-${new Date().toISOString().slice(0, 10)}`,
  })
}

/**
 * Schedule a monthly leaderboard reset.
 */
async function queueMonthlyReset() {
  return queues.resetLeaderboards.add('monthly-reset', { period: 'MONTHLY' }, {
    jobId: `monthly-reset-${new Date().toISOString().slice(0, 7)}`,
  })
}

/**
 * Queue a full rank recalculation.
 */
async function queueRecalculateRanks() {
  return queues.recalculateRanks.add('recalculate', {}, {
    jobId: `recalculate-ranks-${Date.now()}`,
  })
}

module.exports = {
  queues,
  queueScoreMatchPredictions,
  queueWeeklyReset,
  queueMonthlyReset,
  queueRecalculateRanks,
}

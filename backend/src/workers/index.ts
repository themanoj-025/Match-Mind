import { Worker, Queue } from 'bullmq'
import { redis } from '../lib/redis'
import logger from '../utils/logger'

const QUEUE_NAME = 'test-queue'

// Export a queue instance so routes can enqueue jobs
export const testQueue = new Queue(QUEUE_NAME, {
  connection: redis,
})

// Create the worker
export const testWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    logger.info({ event: 'worker.job_started', jobId: job.id }, 'Processing test job')

    // Simulate some work
    await new Promise((resolve) => setTimeout(resolve, 1000))

    logger.info({ event: 'worker.job_completed', jobId: job.id, data: job.data }, 'Completed test job')

    return { success: true, processedAt: new Date().toISOString() }
  },
  {
    connection: redis,
  },
)

testWorker.on('failed', (job, err) => {
  logger.error({ event: 'worker.job_failed', jobId: job?.id, err: err.message }, 'Test job failed')
})

logger.info({ event: 'worker.started', queue: QUEUE_NAME }, 'Worker listening for jobs')

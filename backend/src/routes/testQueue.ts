import { Router } from 'express'
import { testQueue } from '../workers'
import { z } from 'zod'
import { openapiRegistry } from "../config/openapi";

const router = Router()

const schema = z.object({
  message: z.string().optional(),
})


openapiRegistry.registerPath({
  method: 'post',
  path: '/',
  responses: { 200: { description: 'Success' } }
})
router.post('/', async (req, res, next) => {
  try {
    const data = schema.parse(req.body)
    const job = await testQueue.add('test-job', data)

    res.json({ success: true, jobId: job.id, status: 'enqueued' })
  } catch (err) {
    next(err)
  }
})

export default router

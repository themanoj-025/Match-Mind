import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import { runSimulation } from '../services/simulation/simulationRunner'
import asyncHandler from '../middleware/asyncHandler'
import logger from '../utils/logger'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

/**
 * POST /api/matches/:id/start-simulation
 * Starts a simulation for a scheduled match.
 * Only admins can trigger simulations.
 * The simulation runs server-side and automatically marks the match FINISHED.
 */
router.post('/:id/start-simulation', authenticateToken, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')

  const match = await prisma.match.findUnique({ where: { id: req.params.id } })
  if (!match) {
    return res.status(404).json({ error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' } })
  }
  if (match.status !== 'SCHEDULED') {
    return res.status(400).json({
      error: { code: 'MATCH_NOT_SCHEDULED', message: `Cannot start simulation: match is ${match.status}, must be SCHEDULED` },
    })
  }

  // Run simulation asynchronously (don't block the response)
  const io = req.app.get('io')
  runSimulation(prisma, io, String(req.params.id), { skipDelay: false }).catch((err: any) => {
    logger.error({ event: 'simulation.start_failed', matchId: req.params.id, err: err.message }, `Simulation failed for match ${req.params.id}`)
  })

  res.json({ message: 'Simulation started', matchId: req.params.id })
}))

/**
 * POST /api/matches/:id/start-simulation-sync
 * Starts a simulation synchronously (for testing/small batches).
 * Blocks until the simulation completes.
 */
router.post('/:id/start-simulation-sync', authenticateToken, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')

  const match = await prisma.match.findUnique({ where: { id: req.params.id } })
  if (!match) {
    return res.status(404).json({ error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' } })
  }
  if (match.status !== 'SCHEDULED') {
    return res.status(400).json({
      error: { code: 'MATCH_NOT_SCHEDULED', message: `Cannot start simulation: match is ${match.status}, must be SCHEDULED` },
    })
  }

  const io = req.app.get('io')
  await runSimulation(prisma, io, String(req.params.id), { skipDelay: true })

  res.json({ message: 'Simulation completed', matchId: req.params.id })
}))

/**
 * GET /api/matches/:id/simulation-status
 * Returns the current simulation status and seed for replay.
 */
router.get('/:id/simulation-status', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')

  const match = await prisma.match.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      status: true,
      minute: true,
      homeScore: true,
      awayScore: true,
      simSeed: true,
      simSpeedMultiplier: true,
      simStartedAt: true,
      simEndsAt: true,
    },
  })

  if (!match) {
    return res.status(404).json({ error: { code: 'MATCH_NOT_FOUND', message: 'Match not found' } })
  }

  res.json(match)
}))

export default router

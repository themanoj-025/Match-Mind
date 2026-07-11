import express from 'express'
import { authenticateToken } from '../middleware/auth'
import asyncHandler from '../middleware/asyncHandler'
import { computeRoomLeaderboard } from '../services/leaderboardService'
import type { AuthenticatedRequest } from '../middleware/auth'
import logger from '../utils/logger'
import { openapiRegistry } from "../config/openapi";

const router = express.Router()

// GET /api/rooms/:roomId/leaderboard — per-room leaderboard from fantasyPointsLedger

openapiRegistry.registerPath({
  method: 'get',
  path: '/rooms/:roomId',
  responses: { 200: { description: 'Success' } }
})
router.get('/rooms/:roomId', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const roomId = req.params.roomId as string

  // Get the room to verify it exists
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { id: true, tournamentId: true },
  })
  if (!room) {
    return res.status(404).json({ error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' } })
  }

  // Fetch all fantasy points ledger entries for this room
  const ledger = await prisma.fantasyPointsLedger.findMany({
    where: { roomId },
  })

  // Fetch all roster entries for cost calculation
  const rosters = await prisma.roster.findMany({
    where: { roomId },
    select: { userId: true, soldPrice: true },
  })

  // Compute the leaderboard as a derived view
  const entries = computeRoomLeaderboard(ledger, roomId, rosters)

  res.json({
    roomId: room.id,
    tournamentId: room.tournamentId,
    entries,
    totalFixtures: ledger.length > 0
      ? new Set(ledger.map((l: any) => l.fixtureId)).size
      : 0,
  })
}))

// GET /api/leaderboard/global — deprecated, redirects to a default tournament

openapiRegistry.registerPath({
  method: 'get',
  path: '/global',
  responses: { 200: { description: 'Success' } }
})
router.get('/global', asyncHandler(async (req, res) => {
  res.json({ message: 'Use /api/rooms/:roomId/leaderboard for per-room leaderboards' })
}))

// DELETE /api/leaderboard/sport/:sport — removed (single-sport platform)

openapiRegistry.registerPath({
  method: 'get',
  path: '/sport/:sport',
  responses: { 200: { description: 'Success' } }
})
router.get('/sport/:sport', asyncHandler(async (_req, res) => {
  res.json({ message: 'Single-sport platform. Use /api/rooms/:roomId/leaderboard' })
}))

// DELETE /api/leaderboard/weekly — removed (prediction streaks no longer exist)

openapiRegistry.registerPath({
  method: 'get',
  path: '/weekly',
  responses: { 200: { description: 'Success' } }
})
router.get('/weekly', asyncHandler(async (_req, res) => {
  res.json({ message: 'Weekly ranking replaced by per-room fantasy leaderboard' })
}))

// DELETE /api/leaderboard/history/:period — removed (no more leaderboard snapshots from predictions)

openapiRegistry.registerPath({
  method: 'get',
  path: '/history/:period',
  responses: { 200: { description: 'Success' } }
})
router.get('/history/:period', asyncHandler(async (_req, res) => {
  res.json({ message: 'History not available. Fantasy points accumulate by fixture.' })
}))

// DELETE /api/leaderboard/friends — simplified to show all users in a room

openapiRegistry.registerPath({
  method: 'get',
  path: '/friends',
  responses: { 200: { description: 'Success' } }
})
router.get('/friends', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // For now, return empty. Future: show cross-room aggregate ranking
  res.json([])
}))

export default router

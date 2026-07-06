import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import asyncHandler from '../middleware/asyncHandler'
import { computeFantasyPoints } from '../services/fantasyPoints'
import type { AuthenticatedRequest } from '../middleware/auth'
import logger from '../utils/logger'

const router = express.Router()

// GET /api/fixtures — list fixtures for a tournament
router.get('/', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { tournamentId } = req.query as { tournamentId?: string }

  const where: Record<string, any> = {}
  if (tournamentId) where.tournamentId = tournamentId

  const fixtures = await prisma.fixture.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
    take: 100,
  })

  res.json(fixtures)
}))

// GET /api/fixtures/:id — single fixture with player stats
router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const fixture = await prisma.fixture.findUnique({
    where: { id: req.params.id },
    include: {
      playerMatchStats: {
        include: { player: { select: { id: true, name: true, position: true } } },
      },
    },
  })
  if (!fixture) {
    return res.status(404).json({ error: { code: 'FIXTURE_NOT_FOUND', message: 'Fixture not found' } })
  }
  res.json(fixture)
}))

// POST /api/admin/fixtures — create fixture (admin only)
router.post('/', authenticateToken, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const fixture = await prisma.fixture.create({ data: req.body })
  res.status(201).json(fixture)
}))

// POST /api/admin/fixtures/:id/player-stats — enter player match stats (admin)
router.post('/:id/player-stats', authenticateToken, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { playerStats } = req.body as {
    playerStats: Array<{
      playerId: string
      minutesPlayed: number
      goals: number
      assists: number
      cleanSheet: boolean
      saves: number
      penaltiesSaved: number
      yellowCards: number
      redCards: number
      penaltiesMissed: number
      ownGoals: number
      goalsConceded: number
    }>
  }

  const created = []
  for (const stat of playerStats) {
    const entry = await prisma.playerMatchStat.create({
      data: { fixtureId: req.params.id as string, ...stat },
    })
    created.push(entry)
  }

  logger.info({ event: 'admin.player_stats_entered', fixtureId: req.params.id, count: created.length })
  res.status(201).json(created)
}))

// POST /api/admin/fixtures/:id/finalize — lock stats, compute fantasy points, update leaderboards (admin)
router.post('/:id/finalize', authenticateToken, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')

  // Mark fixture as COMPLETED
  await prisma.fixture.update({
    where: { id: req.params.id },
    data: { status: 'COMPLETED' },
  })

  // Get all player match stats for this fixture
  const stats = await prisma.playerMatchStat.findMany({
    where: { fixtureId: req.params.id },
  })

  // Get all rosters across all rooms that have this fixture's tournament's players
  // For each room associated with this tournament, compute points
  const rooms = await prisma.room.findMany({
    where: { tournamentId: (await prisma.fixture.findUnique({ where: { id: req.params.id } }))?.tournamentId },
  })

  // ─── Batch-load all players referenced in stats ───────────────
  const playerIds = [...new Set(stats.map((s: any) => s.playerId))]
  const allPlayers = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, position: true, name: true },
  })
  const playerMap = new Map<string, { id: string; position: string; name: string }>(allPlayers.map((p: any) => [p.id, p]))

  // ─── Batch-load all rosters for all rooms ────────────────────
  const roomIds = rooms.map((r: any) => r.id)
  const allRosters = await prisma.roster.findMany({
    where: { roomId: { in: roomIds } },
  })
  const rostersByRoom = new Map<string, any[]>()
  for (const roster of allRosters) {
    const existing = rostersByRoom.get(roster.roomId) || []
    existing.push(roster)
    rostersByRoom.set(roster.roomId, existing)
  }

  // ─── Build player stats map (in-memory, no per-stat DB queries) ─
  const playerStatsMap: Record<string, any> = {}
  for (const stat of stats) {
    const player = playerMap.get(stat.playerId)
    if (player) {
      playerStatsMap[stat.playerId] = { stats: stat, position: player.position }
    }
  }

  let totalEntries = 0
  for (const room of rooms) {
    const rosters = rostersByRoom.get(room.id) || []
    if (rosters.length === 0) continue

    const fixtureId = req.params.id as string
    const results = await computeFantasyPoints(
      fixtureId,
      playerStatsMap,
      rosters,
      async () => null,
      async (entry) => {
        await prisma.fantasyPointsLedger.create({ data: entry })
        totalEntries++
      },
    )

    // Emit socket events for real-time updates
    const io = req.app.get('io')
    if (io) {
      for (const result of results) {
        io.to(`room:${room.id}`).emit('FANTASY_POINTS_UPDATE', {
          roomId: room.id,
          userId: result.userId,
          delta: result.totalPoints,
          playerId: result.playerId,
          fixtureId,
          breakdown: result.breakdown,
        })
      }
    }
  }

  logger.info({
    event: 'admin.fixture_finalized',
    fixtureId: req.params.id,
    rooms: rooms.length,
    entries: totalEntries,
  })

  // Log admin action
  await prisma.adminLog.create({
    data: {
      adminId: req.userId,
      action: 'FIXTURE_FINALIZED',
      targetId: req.params.id,
      targetType: 'fixture',
      detail: { rooms: rooms.length, fantasyEntries: totalEntries },
    },
  })

  res.json({ message: 'Fixture finalized', roomsProcessed: rooms.length, fantasyEntries: totalEntries })
}))

export default router

import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { z } from 'zod'
import asyncHandler from '../middleware/asyncHandler'
import { isValidTournamentId, DEFAULT_ROSTER_RULES, MAX_FREE_ROOMS_PER_USER } from '../config/tournaments'
import type { AuthenticatedRequest } from '../middleware/auth'
import logger from '../utils/logger'
import { computeRoomLeaderboard } from '../services/leaderboardService'
import { createRoomLimiter, joinRoomLimiter } from '../middleware/rateLimiter'
import { idempotent } from '../middleware/idempotency'

const router = express.Router()

// ─── Zod Schemas ─────────────────────────────────────────

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').max(100),
  tournamentId: z.string().refine(isValidTournamentId, { message: 'Invalid tournament ID' }),
  totalBudget: z.number().int().positive().default(500),
  rosterRules: z.object({
    GK: z.number().int().positive().default(2),
    DEF: z.number().int().positive().default(5),
    MID: z.number().int().positive().default(5),
    FWD: z.number().int().positive().default(3),
    total: z.number().int().positive().default(15),
  }).default(DEFAULT_ROSTER_RULES),
}).strict()

const joinRoomSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
}).strict()

// ─── Helper: Generate Invite Code ────────────────────────

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// ─── Routes ─────────────────────────────────────────────

// POST /api/rooms — create room (host, rate-limited, idempotent)
router.post('/', idempotent(), createRoomLimiter, authenticateToken, validate(createRoomSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { name, tournamentId, totalBudget, rosterRules } = req.body as z.infer<typeof createRoomSchema>

  // Check free tier limit
  const activeRooms = await prisma.room.count({
    where: { hostId: req.userId, status: { not: 'COMPLETED' } },
  })
  if (activeRooms >= MAX_FREE_ROOMS_PER_USER) {
    return res.status(403).json({
      error: { code: 'ROOM_LIMIT_REACHED', message: `Free tier limited to ${MAX_FREE_ROOMS_PER_USER} active rooms. Upgrade to Pro for unlimited rooms.` },
    })
  }

  // Generate unique invite code
  let inviteCode = generateInviteCode()
  let existing = await prisma.room.findUnique({ where: { inviteCode } })
  while (existing) {
    inviteCode = generateInviteCode()
    existing = await prisma.room.findUnique({ where: { inviteCode } })
  }

  const room = await prisma.room.create({
    data: {
      tournamentId,
      hostId: req.userId,
      name,
      inviteCode,
      totalBudget,
      rosterRules,
      status: 'LOBBY',
      bidIncrementRule: { base: 5 },
      antiSnipeSeconds: 5,
    },
  })

  // Add host as room member
  await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: req.userId,
      role: 'host',
      remainingBudget: totalBudget,
      isReady: true,
    },
  })

  // Create initial auction state
  await prisma.auctionState.create({
    data: {
      roomId: room.id,
      phase: 'IDLE',
      currentPlayerId: null,
      currentBid: 0,
      currentBidderId: null,
      timerEndsAt: null,
      poolQueue: [],
      unsoldPlayerIds: [],
      version: 1,
    },
  })

  logger.info({ event: 'room.created', roomId: room.id, tournamentId, hostId: req.userId })
  res.status(201).json(room)
}))

// GET /api/rooms/mine — list user's rooms
router.get('/mine', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const memberships = await prisma.roomMember.findMany({
    where: { userId: req.userId },
    include: { room: true },
    orderBy: { room: { createdAt: 'desc' } },
  })
  res.json(memberships.map((m: any) => ({
    ...m.room,
    membership: { role: m.role, remainingBudget: m.remainingBudget, isReady: m.isReady },
  })))
}))

// GET /api/rooms/:id — get single room with members and auction state
router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const roomId = req.params.id as string
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      members: {
        include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
      },
      auctionState: true,
    },
  })
  if (!room) {
    return res.status(404).json({ error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' } })
  }
  res.json(room)
}))

// GET /api/rooms/:id/members — list members with ready status
router.get('/:id/members', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const roomId = req.params.id as string
  const members = await prisma.roomMember.findMany({
    where: { roomId },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatar: true, tier: true } },
    },
    orderBy: { role: 'desc' },
  })
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { status: true, hostId: true },
  })
  res.json({
    members,
    roomStatus: room?.status || 'unknown',
    allReady: members.length > 0 && members.every((m: any) => m.isReady),
  })
}))

// POST /api/rooms/:id/join — join room via invite code
router.post('/:id/join', joinRoomLimiter, authenticateToken, validate(joinRoomSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const roomId = req.params.id as string
  const { inviteCode } = req.body as z.infer<typeof joinRoomSchema>

  const room = await prisma.room.findUnique({ where: { id: roomId } })
  if (!room) {
    return res.status(404).json({ error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' } })
  }
  if (room.inviteCode !== inviteCode) {
    return res.status(403).json({ error: { code: 'INVALID_INVITE_CODE', message: 'Invalid invite code' } })
  }
  if (room.status !== 'LOBBY') {
    return res.status(400).json({ error: { code: 'ROOM_NOT_LOBBY', message: 'Room is no longer accepting members' } })
  }

  // Check if already a member
  const existing = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId: room.id, userId: req.userId } },
  })
  if (existing) {
    return res.status(409).json({ error: { code: 'ALREADY_MEMBER', message: 'Already a member of this room' } })
  }

  const member = await prisma.roomMember.create({
    data: {
      roomId: room.id,
      userId: req.userId,
      role: 'member',
      remainingBudget: room.totalBudget,
      isReady: false,
    },
  })

  // Emit join event
  const io = req.app.get('io')
  if (io) {
    const fullMember = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: room.id, userId: req.userId } },
      include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
    })
    io.to(`room:${room.id}`).emit('MEMBER_JOINED', { roomId: room.id, member: fullMember })
  }

  logger.info({ event: 'room.joined', roomId: room.id, userId: req.userId })
  res.status(201).json(member)
}))

// PATCH /api/rooms/:id/ready — toggle ready status in lobby
router.patch('/:id/ready', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const roomId = req.params.id as string

  const member = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: req.userId } },
  })
  if (!member) {
    return res.status(404).json({ error: { code: 'NOT_MEMBER', message: 'You are not a member of this room' } })
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } })
  if (!room || room.status !== 'LOBBY') {
    return res.status(400).json({ error: { code: 'ROOM_NOT_LOBBY', message: 'Room is not in lobby state' } })
  }

  const updated = await prisma.roomMember.update({
    where: { roomId_userId: { roomId, userId: req.userId } },
    data: { isReady: !member.isReady },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatar: true } },
    },
  })

  // Emit ready status change to room
  const io = req.app.get('io')
  if (io) {
    io.to(`room:${roomId}`).emit('MEMBER_READY_CHANGED', {
      roomId,
      userId: req.userId,
      isReady: !member.isReady,
      member: updated,
    })
  }

  res.json({ isReady: !member.isReady, member: updated })
}))

// POST /api/rooms/:id/regenerate-invite — host regenerates invite code
router.post('/:id/regenerate-invite', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const roomId = req.params.id as string

  const room = await prisma.room.findUnique({ where: { id: roomId } })
  if (!room) {
    return res.status(404).json({ error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' } })
  }
  if (room.hostId !== req.userId) {
    return res.status(403).json({ error: { code: 'NOT_HOST', message: 'Only the host can regenerate the invite code' } })
  }

  // Generate unique invite code
  let inviteCode = generateInviteCode()
  let existing = await prisma.room.findUnique({ where: { inviteCode } })
  while (existing) {
    inviteCode = generateInviteCode()
    existing = await prisma.room.findUnique({ where: { inviteCode } })
  }

  await prisma.room.update({
    where: { id: room.id },
    data: { inviteCode },
  })

  logger.info({ event: 'room.invite_regenerated', roomId: room.id })
  res.json({ inviteCode })
}))

// GET /api/rooms/:id/leaderboard — per-room fantasy leaderboard (derived view)
router.get('/:id/leaderboard', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const roomId = req.params.id as string

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

export default router

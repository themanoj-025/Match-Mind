const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { v4: uuidv4 } = require('uuid')
const { validate } = require('../middleware/validate')
const { createLeagueSchema, joinLeagueSchema } = require('../config/schemas')
const asyncHandler = require('../middleware/asyncHandler')

router.post('/', authenticateToken, validate(createLeagueSchema), asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { name, sport, isPublic, description } = req.body
  const inviteCode = uuidv4().slice(0, 8).toUpperCase()
  const league = await prisma.league.create({
    data: { name, sport, isPublic, inviteCode, ownerId: req.userId },
  })
  await prisma.leagueMember.create({ data: { leagueId: league.id, userId: req.userId, points: 0, rank: 1 } })
  res.status(201).json(league)
}))

router.get('/mine', authenticateToken, asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const memberships = await prisma.leagueMember.findMany({
    where: { userId: req.userId },
    include: { league: true },
  })
  res.json(memberships.map(m => m.league))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const league = await prisma.league.findUnique({
    where: { id: req.params.id },
    include: { members: { include: { user: { select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true } } } } },
  })
  if (!league) return res.status(404).json({ error: { code: 'LEAGUE_NOT_FOUND', message: 'League not found' } })
  res.json(league)
}))

router.post('/:id/join', authenticateToken, validate(joinLeagueSchema), asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { inviteCode } = req.body
  const league = await prisma.league.findUnique({ where: { id: req.params.id } })
  if (!league || league.inviteCode !== inviteCode) {
    return res.status(400).json({ error: { code: 'INVALID_INVITE_CODE', message: 'Invalid invite code' } })
  }
  const member = await prisma.leagueMember.create({ data: { leagueId: league.id, userId: req.userId, points: 0 } })
  res.status(201).json(member)
}))

router.get('/:id/leaderboard', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const members = await prisma.leagueMember.findMany({
    where: { leagueId: req.params.id },
    include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
    orderBy: { points: 'desc' },
  })
  res.json(members.map((m, i) => ({ ...m, rank: i + 1, name: m.user.displayName || m.user.username })))
}))

module.exports = router

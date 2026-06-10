const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')
const { v4: uuidv4 } = require('uuid')

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { name, sport, isPublic } = req.body
    const inviteCode = uuidv4().slice(0, 8).toUpperCase()
    const league = await prisma.league.create({
      data: { name, sport, isPublic, inviteCode, ownerId: req.userId },
    })
    await prisma.leagueMember.create({ data: { leagueId: league.id, userId: req.userId, points: 0, rank: 1 } })
    res.status(201).json(league)
  } catch (err) { next(err) }
})

router.get('/mine', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const memberships = await prisma.leagueMember.findMany({
      where: { userId: req.userId },
      include: { league: true },
    })
    res.json(memberships.map(m => m.league))
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const league = await prisma.league.findUnique({
      where: { id: req.params.id },
      include: { members: { include: { user: { select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true } } } } },
    })
    if (!league) return res.status(404).json({ message: 'League not found' })
    res.json(league)
  } catch (err) { next(err) }
})

router.post('/:id/join', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { inviteCode } = req.body
    const league = await prisma.league.findUnique({ where: { id: req.params.id } })
    if (!league || league.inviteCode !== inviteCode) return res.status(400).json({ message: 'Invalid invite code' })
    const member = await prisma.leagueMember.create({ data: { leagueId: league.id, userId: req.userId, points: 0 } })
    res.status(201).json(member)
  } catch (err) { next(err) }
})

router.get('/:id/leaderboard', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const members = await prisma.leagueMember.findMany({
      where: { leagueId: req.params.id },
      include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } },
      orderBy: { points: 'desc' },
    })
    res.json(members.map((m, i) => ({ ...m, rank: i + 1, name: m.user.displayName || m.user.username })))
  } catch (err) { next(err) }
})

module.exports = router

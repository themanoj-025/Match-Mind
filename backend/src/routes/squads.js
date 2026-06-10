const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { name } = req.body
    const squad = await prisma.squad.create({ data: { name } })
    await prisma.squadMember.create({ data: { squadId: squad.id, userId: req.userId, role: 'owner' } })
    res.status(201).json(squad)
  } catch (err) { next(err) }
})

router.get('/mine', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const memberships = await prisma.squadMember.findMany({
      where: { userId: req.userId },
      include: { squad: { include: { members: true } } },
    })
    res.json(memberships.map(m => ({ ...m.squad, memberCount: m.squad.members.length })))
  } catch (err) { next(err) }
})

router.get('/:id', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const squad = await prisma.squad.findUnique({
      where: { id: req.params.id },
      include: { members: { include: { user: { select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true } } } } },
    })
    if (!squad) return res.status(404).json({ message: 'Squad not found' })
    res.json(squad)
  } catch (err) { next(err) }
})

router.post('/:id/members/invite', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { userId: inviteUserId } = req.body
    const member = await prisma.squadMember.create({ data: { squadId: req.params.id, userId: inviteUserId, role: 'member' } })
    res.status(201).json(member)
  } catch (err) { next(err) }
})

module.exports = router

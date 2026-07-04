import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { createSquadSchema, inviteSquadMemberSchema } from '../config/schemas'
import asyncHandler from '../middleware/asyncHandler'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

router.post('/', authenticateToken, validate(createSquadSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { name } = req.body as { name: string }
  const squad = await prisma.squad.create({ data: { name } })
  await prisma.squadMember.create({ data: { squadId: squad.id, userId: req.userId, role: 'owner' } })
  res.status(201).json(squad)
}))

router.get('/mine', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const memberships = await prisma.squadMember.findMany({
    where: { userId: req.userId },
    include: { squad: { include: { members: true } } },
  })
  res.json(memberships.map((m: any) => ({ ...m.squad, memberCount: m.squad.members.length })))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const squad = await prisma.squad.findUnique({
    where: { id: req.params.id },
    include: { members: { include: { user: { select: { id: true, username: true, displayName: true, avatar: true, totalPoints: true } } } } },
  })
  if (!squad) return res.status(404).json({ error: { code: 'SQUAD_NOT_FOUND', message: 'Squad not found' } })
  res.json(squad)
}))

router.post('/:id/members/invite', authenticateToken, validate(inviteSquadMemberSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { userId: inviteUserId } = req.body as { userId: string }
  const member = await prisma.squadMember.create({ data: { squadId: req.params.id, userId: inviteUserId, role: 'member' } })
  res.status(201).json(member)
}))

export default router

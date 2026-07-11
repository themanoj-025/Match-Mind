import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { updateProfileSchema } from '../config/schemas'
import asyncHandler from '../middleware/asyncHandler'
import type { AuthenticatedRequest } from '../middleware/auth'
import { openapiRegistry } from "../config/openapi";

const router = express.Router()

// GET /api/users/check-username

openapiRegistry.registerPath({
  method: 'get',
  path: '/check-username',
  responses: { 200: { description: 'Success' } }
})
router.get('/check-username', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const { username } = req.query as { username?: string }
  if (!username || username.length < 3) {
    return res.json({ available: false })
  }
  const existing = await prisma.user.findUnique({ where: { username } })
  res.json({ available: !existing })
}))


openapiRegistry.registerPath({
  method: 'get',
  path: '/:id',
  responses: { 200: { description: 'Success' } }
})
router.get('/:id', asyncHandler(async (req, res) => {
  const prisma = req.app.get('prisma')
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, username: true, displayName: true, avatar: true, bio: true, countryCode: true, totalPoints: true, globalRank: true, predAccuracy: true, streakCurrent: true, tier: true, createdAt: true },
  })
  if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } })
  res.json(user)
}))


openapiRegistry.registerPath({
  method: 'patch',
  path: '/me',
  request: { body: { content: { 'application/json': { schema: updateProfileSchema } } } },
  responses: { 200: { description: 'Success' } }
})
router.patch('/me', authenticateToken, validate(updateProfileSchema), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { displayName, avatar, bio, favouriteSports, favouriteTeams } = req.body as {
    displayName?: string
    avatar?: string | null
    bio?: string | null
    favouriteSports?: string[]
    favouriteTeams?: string[]
  }
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { displayName, avatar, bio },
    select: { id: true, username: true, displayName: true, avatar: true, bio: true, totalPoints: true, tier: true },
  })

  // Persist favouriteSports to UserSport join table
  if (favouriteSports !== undefined) {
    await prisma.userSport.deleteMany({ where: { userId: req.userId } })
    if (favouriteSports.length > 0) {
      await prisma.userSport.createMany({
        data: favouriteSports.map((sport: string) => ({ userId: req.userId, sport })),
      })
    }
  }

  // Persist favouriteTeams to UserTeam join table
  if (favouriteTeams !== undefined) {
    await prisma.userTeam.deleteMany({ where: { userId: req.userId } })
    if (favouriteTeams.length > 0) {
      await prisma.userTeam.createMany({
        data: favouriteTeams.map((teamId: string) => ({ userId: req.userId, teamId })),
      })
    }
  }

  res.json(user)
}))


openapiRegistry.registerPath({
  method: 'post',
  path: '/:id/follow',
  responses: { 200: { description: 'Success' } }
})
router.post('/:id/follow', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const follow = await prisma.follow.create({ data: { followerId: req.userId, followingId: req.params.id } })
  res.status(201).json(follow)
}))


openapiRegistry.registerPath({
  method: 'delete',
  path: '/:id/follow',
  responses: { 200: { description: 'Success' } }
})
router.delete('/:id/follow', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  await prisma.follow.deleteMany({ where: { followerId: req.userId, followingId: req.params.id } })
  res.json({ message: 'Unfollowed' })
}))


openapiRegistry.registerPath({
  method: 'get',
  path: '/me/notifications',
  responses: { 200: { description: 'Success' } }
})
router.get('/me/notifications', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const notifications = await prisma.notification.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' }, take: 50 })
  res.json(notifications)
}))


openapiRegistry.registerPath({
  method: 'patch',
  path: '/me/notifications/read',
  responses: { 200: { description: 'Success' } }
})
router.patch('/me/notifications/read', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  await prisma.notification.updateMany({ where: { userId: req.userId, isRead: false }, data: { isRead: true } })
  res.json({ message: 'All notifications marked as read' })
}))

export default router

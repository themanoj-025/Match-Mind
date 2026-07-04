import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import { AdminService } from '../services/adminService'
import { createRepositories } from '../repositories/index'
import asyncHandler from '../middleware/asyncHandler'
import logger from '../utils/logger'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

// All admin routes require auth + admin role
router.use(authenticateToken, requireAdmin)

/** Create an AdminService instance from the Express app's prisma client */
function getAdminService(req: AuthenticatedRequest) {
  const prisma = req.app.get('prisma')
  const { userRepository, matchRepository, reportRepository, adminLogRepository } = createRepositories(prisma)
  return new AdminService({
    userRepository,
    matchRepository,
    reportRepository,
    adminLogRepository,
    prisma: {
      prediction: { count: (opts?: any) => prisma.prediction.count(opts) },
      user: { count: (opts?: any) => prisma.user.count(opts) },
    },
  })
}

// ─── DASHBOARD STATS ─────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns aggregated dashboard metrics via AdminService
 */
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const stats = await getAdminService(req).getDashboardStats()

  res.json({
    ...stats,
    sportDistribution: [
      { name: 'Football', value: 45 },
      { name: 'Basketball', value: 25 },
      { name: 'NFL', value: 15 },
      { name: 'Tennis', value: 8 },
      { name: 'Cricket', value: 5 },
      { name: 'Hockey', value: 2 },
    ],
  })
}))

// ─── USER MANAGEMENT ─────────────────────────────────────

/**
 * GET /api/admin/users
 * List users with pagination and search
 */
router.get('/users', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const search = (req.query.search as string) || ''

  const where: Record<string, any> = search
    ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { displayName: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        avatar: true,
        role: true,
        tier: true,
        isPro: true,
        totalPoints: true,
        predAccuracy: true,
        createdAt: true,
        lastActiveAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  res.json({ users, total, page, totalPages: Math.ceil(total / limit) })
}))

/**
 * GET /api/admin/users/:id
 * Get detailed user info
 */
router.get('/users/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      subscription: true,
      _count: {
        select: {
          predictions: true,
          followers: true,
          following: true,
          leagues: true,
          squads: true,
          notifications: true,
        },
      },
    },
  })
  if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } })
  res.json({ user })
}))

/**
 * PATCH /api/admin/users/:id
 * Update user fields
 */
router.patch('/users/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { role, tier, username, email, displayName } = req.body as {
    role?: string
    tier?: string
    username?: string
    email?: string
    displayName?: string
  }

  const data: Record<string, any> = {}
  if (role) data.role = role
  if (tier) data.tier = tier
  if (username) data.username = username
  if (email) data.email = email
  if (displayName) data.displayName = displayName

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, username: true, email: true, role: true, tier: true },
  })

  res.json({ user })
}))

/**
 * DELETE /api/admin/users/:id
 * Soft-delete or permanently delete user
 */
router.delete('/users/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  // Cascade delete user data
  await prisma.user.delete({ where: { id: req.params.id } })
  getAdminService(req).logAction(req.userId!, 'USER_DELETED', String(req.params.id), 'user', {})
  res.json({ message: 'User deleted' })
}))

/**
 * POST /api/admin/users/:id/toggle-pro
 * Toggle Pro status for a user
 */
router.post('/users/:id/toggle-pro', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { isPro: true } })
  if (!user) return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } })

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      isPro: !user.isPro,
      proExpiresAt: user.isPro ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    select: { id: true, isPro: true, proExpiresAt: true },
  })

  getAdminService(req).logAction(req.userId!, 'PRO_TOGGLED', String(req.params.id), 'user', {
    wasPro: user.isPro,
    nowPro: !user.isPro,
  })
  res.json({ user: updated })
}))

// ─── MATCH MANAGEMENT ────────────────────────────────────

/**
 * GET /api/admin/matches
 * List all matches with pagination
 */
router.get('/matches', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const status = req.query.status as string | undefined

  const where = status ? { status } : {}

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      select: {
        id: true,
        sport: true,
        homeTeamName: true,
        awayTeamName: true,
        homeScore: true,
        awayScore: true,
        status: true,
        scheduledAt: true,
        competition: true,
        _count: { select: { predictions: true } },
      },
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.match.count({ where }),
  ])

  res.json({ matches, total, page, totalPages: Math.ceil(total / limit) })
}))

/**
 * PATCH /api/admin/matches/:id
 * Update match details (score, status)
 */
router.patch('/matches/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { homeScore, awayScore, status, minute } = req.body as {
    homeScore?: number
    awayScore?: number
    status?: string
    minute?: number
  }

  const data: Record<string, any> = {}
  if (homeScore !== undefined) data.homeScore = homeScore
  if (awayScore !== undefined) data.awayScore = awayScore
  if (status) data.status = status
  if (minute !== undefined) data.minute = minute

  const match = await prisma.match.update({
    where: { id: req.params.id },
    data,
    select: { id: true, homeTeamName: true, awayTeamName: true, homeScore: true, awayScore: true, status: true },
  })

  getAdminService(req).logAction(req.userId!, 'MATCH_UPDATED', String(req.params.id), 'match', { ...data })
  res.json({ match })
}))

// ─── REPORTS ─────────────────────────────────────────────

/**
 * GET /api/admin/reports
 * List reports with pagination and status filter
 */
router.get('/reports', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const status = (req.query.status as string) || 'pending'

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where: { status },
      include: {
        reporter: { select: { id: true, username: true, avatar: true } },
        message: { select: { id: true, text: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where: { status } }),
  ])

  res.json({ reports, total, page, totalPages: Math.ceil(total / limit) })
}))

/**
 * PATCH /api/admin/reports/:id
 * Resolve or dismiss a report
 */
router.patch('/reports/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { status } = req.body as { status?: string } // 'resolved' | 'dismissed'

  const report = await prisma.report.update({
    where: { id: req.params.id },
    data: { status: status || 'resolved' },
  })

  // If resolved and has a message, delete the message
  if (status === 'resolved' && report.messageId) {
    await prisma.chatMessage.update({
      where: { id: report.messageId },
      data: { isDeleted: true },
    })
  }

  getAdminService(req).logAction(req.userId!, status === 'resolved' ? 'REPORT_RESOLVED' : 'REPORT_DISMISSED', String(req.params.id), 'report', {
    reportStatus: status,
  })
  res.json({ report })
}))

// ─── ACTIVITY LOG ────────────────────────────────────────────

/**
 * GET /api/admin/activity-log
 * Returns recent admin actions with pagination
 */
router.get('/activity-log', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 50

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.adminLog.count(),
  ])

  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) })
}))

// ─── FEATURE FLAGS ───────────────────────────────────────

/**
 * GET /api/admin/settings
 * Get feature flags and system settings
 */
router.get('/settings', (_req, res) => {
  // Feature flags stored in env or a settings table; for now return defaults
  res.json({
    settings: [
      { flag: 'AI Hints', key: 'FLAG_AI_HINTS', enabled: process.env.FLAG_AI_HINTS !== 'false' },
      { flag: 'Pro Gate AI', key: 'FLAG_PRO_GATE_AI', enabled: process.env.FLAG_PRO_GATE_AI !== 'false' },
      { flag: 'Chat GIFs', key: 'FLAG_CHAT_GIFS', enabled: process.env.FLAG_CHAT_GIFS !== 'false' },
      { flag: 'Leaderboard Realtime', key: 'FLAG_LB_REALTIME', enabled: process.env.FLAG_LB_REALTIME === 'true' },
      { flag: 'Direct Messages', key: 'FLAG_DM', enabled: process.env.FLAG_DM === 'true' },
    ],
  })
})

export default router

import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/requireAdmin'
import { AdminService } from '../services/adminService'
import { createRepositories } from '../repositories/index'
import asyncHandler from '../middleware/asyncHandler'
import logger from '../utils/logger'
import type { AuthenticatedRequest } from '../middleware/auth'
import { validateTournamentDraftPool } from '../../scripts/validateDraftPoolLib'

const router = express.Router()

// All admin routes require auth + admin role
router.use(authenticateToken, requireAdmin)

/** Create an AdminService instance from the Express app's prisma client */
function getAdminService(req: AuthenticatedRequest) {
  const prisma = req.app.get('prisma')
  const { userRepository, reportRepository, adminLogRepository } = createRepositories(prisma)
  return new AdminService({
    userRepository,
    reportRepository,
    adminLogRepository,
    prisma: {
      user: { count: (opts?: any) => prisma.user.count(opts) },
      room: { count: (opts?: any) => prisma.room.count(opts) },
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
      { name: 'Football', value: 100 },
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
          followers: true,
          following: true,
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

// ─── FIXTURE MANAGEMENT ─────────────────────────────────

/**
 * GET /api/admin/fixtures
 * List all fixtures with pagination
 */
router.get('/fixtures', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 20
  const tournamentId = req.query.tournamentId as string | undefined

  const where: Record<string, any> = {}
  if (tournamentId) where.tournamentId = tournamentId

  const [fixtures, total] = await Promise.all([
    prisma.fixture.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.fixture.count({ where }),
  ])

  res.json({ fixtures, total, page, totalPages: Math.ceil(total / limit) })
}))

/**
 * PATCH /api/admin/fixtures/:id
 * Update fixture details (score, status)
 */
router.patch('/fixtures/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { homeScore, awayScore, status } = req.body as {
    homeScore?: number
    awayScore?: number
    status?: string
  }

  const data: Record<string, any> = {}
  if (homeScore !== undefined) data.homeScore = homeScore
  if (awayScore !== undefined) data.awayScore = awayScore
  if (status) data.status = status

  const fixture = await prisma.fixture.update({
    where: { id: req.params.id },
    data,
  })

  getAdminService(req).logAction(req.userId!, 'FIXTURE_UPDATED', String(req.params.id), 'fixture', { ...data })
  res.json({ fixture })
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
  // Parse draft-enabled tournaments from env (comma-separated ids, e.g. "fifa-wc-2026,uefa-ucl-2026-27")
  const draftEnabledRaw = process.env.DRAFT_ENABLED_TOURNAMENTS || ''
  const draftEnabledTournaments = draftEnabledRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  res.json({
    settings: [
      { flag: 'AI Hints', key: 'FLAG_AI_HINTS', enabled: process.env.FLAG_AI_HINTS !== 'false' },
      { flag: 'Pro Gate AI', key: 'FLAG_PRO_GATE_AI', enabled: process.env.FLAG_PRO_GATE_AI !== 'false' },
      { flag: 'Chat GIFs', key: 'FLAG_CHAT_GIFS', enabled: process.env.FLAG_CHAT_GIFS !== 'false' },
      { flag: 'Leaderboard Realtime', key: 'FLAG_LB_REALTIME', enabled: process.env.FLAG_LB_REALTIME === 'true' },
      { flag: 'Direct Messages', key: 'FLAG_DM', enabled: process.env.FLAG_DM === 'true' },
      { flag: 'Draft Mode', key: 'DRAFT_ENABLED_TOURNAMENTS', enabled: draftEnabledTournaments.length > 0, tournaments: draftEnabledTournaments },
    ],
  })
})

/**
 * POST /api/admin/settings/draft-mode/:tournamentId/:action
 * Enable or disable Draft Mode for a tournament.
 * Uses the shared validateDraftPoolLib module — no subprocess needed.
 * Refuses to enable if validation fails (§6.4).
 */
router.post('/settings/draft-mode/:tournamentId/:action', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const tournamentId = String(req.params.tournamentId)
  const action = String(req.params.action)

  const dataDir = req.app.get('prisma')?.data?.dataDir || undefined
  const validationResult = validateTournamentDraftPool(tournamentId, dataDir)

  if (action === 'enable') {
    if (!validationResult.passed) {
      return res.status(400).json({
        error: {
          code: 'DRAFT_POOL_INSUFFICIENT',
          message: 'Draft Mode cannot be enabled — player pool validation failed',
          details: validationResult,
        },
      })
    }

    // Add to env-controlled list (in production this would update a DB/config store)
    const current = (process.env.DRAFT_ENABLED_TOURNAMENTS || '').split(',').map((s) => s.trim()).filter(Boolean)
    if (!current.includes(tournamentId)) {
      current.push(tournamentId)
      process.env.DRAFT_ENABLED_TOURNAMENTS = current.join(',')
    }

    getAdminService(req).logAction(req.userId!, 'DRAFT_MODE_ENABLED', tournamentId, 'tournament', {
      validationPassed: true,
    })

    res.json({
      message: `Draft Mode enabled for ${tournamentId}`,
      tournamentId,
      validation: validationResult,
    })
  } else if (action === 'disable') {
    const current = (process.env.DRAFT_ENABLED_TOURNAMENTS || '').split(',').map((s) => s.trim()).filter(Boolean)
    process.env.DRAFT_ENABLED_TOURNAMENTS = current.filter((id) => id !== tournamentId).join(',')

    getAdminService(req).logAction(req.userId!, 'DRAFT_MODE_DISABLED', tournamentId, 'tournament', {})

    res.json({ message: `Draft Mode disabled for ${tournamentId}` })
  } else if (action === 'validate') {
    res.json({
      tournamentId,
      validation: validationResult,
      canEnable: validationResult.passed,
    })
  } else {
    res.status(400).json({ error: { code: 'INVALID_ACTION', message: 'Action must be enable, disable, or validate' } })
  }
}))

export default router

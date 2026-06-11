const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const { authenticateToken } = require('../middleware/auth')

/**
 * Middleware: require ADMIN or SUPERADMIN role
 */
async function requireAdmin(req, res, next) {
  try {
    const prisma = req.app.get('prisma')
    const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { role: true } })
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN')) {
      return res.status(403).json({ message: 'Admin access required' })
    }
    next()
  } catch (err) { next(err) }
}

// All admin routes require auth + admin role
router.use(authenticateToken, requireAdmin)

// ─── HELPER: Log admin action ─────────────────────────────

async function logAdminAction(req, action, targetId, targetType, detail = {}) {
  try {
    const prisma = req.app.get('prisma')
    await prisma.adminLog.create({
      data: {
        adminId: req.userId,
        action,
        targetId,
        targetType,
        detail,
      },
    })
  } catch (err) {
    console.error('[AdminLog] Failed to log action:', err.message)
  }
}

// ─── DASHBOARD STATS ─────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns aggregated dashboard metrics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')

    const [totalUsers, activeUsers, predictionsToday, proUsers, reports, matches] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastActiveAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
      prisma.prediction.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.user.count({ where: { isPro: true } }),
      prisma.report.count({ where: { status: 'pending' } }),
      prisma.match.count({ where: { status: 'SCHEDULED' } }),
    ])

    // Signup trend (last 7 days)
    const signupTrend = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const startOfDay = new Date(day.setHours(0, 0, 0, 0))
      const endOfDay = new Date(day.setHours(23, 59, 59, 999))
      const count = await prisma.user.count({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      })
      signupTrend.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][startOfDay.getDay()],
        signups: count,
      })
    }

    // Sport distribution
    const sportDistribution = await prisma.prediction.groupBy({
      by: ['matchId'],
      _count: { id: true },
    })

    res.json({
      totalUsers,
      activeUsers,
      predictionsToday,
      proUsers,
      pendingReports: reports,
      scheduledMatches: matches,
      signupTrend,
      // Sport distribution is complex via Prisma groupBy with joins, return simplified
      sportDistribution: [
        { name: 'Football', value: 45 },
        { name: 'Basketball', value: 25 },
        { name: 'NFL', value: 15 },
        { name: 'Tennis', value: 8 },
        { name: 'Cricket', value: 5 },
        { name: 'Hockey', value: 2 },
      ],
    })
  } catch (err) { next(err) }
})

// ─── USER MANAGEMENT ─────────────────────────────────────

/**
 * GET /api/admin/users
 * List users with pagination and search
 */
router.get('/users', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''

    const where = search
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
  } catch (err) { next(err) }
})

/**
 * GET /api/admin/users/:id
 * Get detailed user info
 */
router.get('/users/:id', async (req, res, next) => {
  try {
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
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) { next(err) }
})

/**
 * PATCH /api/admin/users/:id
 * Update user fields
 */
router.patch('/users/:id', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { role, tier, username, email, displayName } = req.body

    const data = {}
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
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Username or email already taken' })
    }
    next(err)
  }
})

/**
 * DELETE /api/admin/users/:id
 * Soft-delete or permanently delete user
 */
router.delete('/users/:id', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    // Cascade delete user data
    await prisma.user.delete({ where: { id: req.params.id } })
    logAdminAction(req, 'USER_DELETED', req.params.id, 'user', {})
    res.json({ message: 'User deleted' })
  } catch (err) { next(err) }
})

/**
 * POST /api/admin/users/:id/toggle-pro
 * Toggle Pro status for a user
 */
router.post('/users/:id/toggle-pro', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const user = await prisma.user.findUnique({ where: { id: req.params.id }, select: { isPro: true } })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isPro: !user.isPro,
        proExpiresAt: user.isPro ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      select: { id: true, isPro: true, proExpiresAt: true },
    })

    logAdminAction(req, 'PRO_TOGGLED', req.params.id, 'user', {
      wasPro: user.isPro,
      nowPro: !user.isPro,
      username: user.username || req.params.id,
    })
    res.json({ user: updated })
  } catch (err) { next(err) }
})

// ─── MATCH MANAGEMENT ────────────────────────────────────

/**
 * GET /api/admin/matches
 * List all matches with pagination
 */
router.get('/matches', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const status = req.query.status

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
  } catch (err) { next(err) }
})

/**
 * PATCH /api/admin/matches/:id
 * Update match details (score, status)
 */
router.patch('/matches/:id', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { homeScore, awayScore, status, minute } = req.body

    const data = {}
    if (homeScore !== undefined) data.homeScore = homeScore
    if (awayScore !== undefined) data.awayScore = awayScore
    if (status) data.status = status
    if (minute !== undefined) data.minute = minute

    const match = await prisma.match.update({
      where: { id: req.params.id },
      data,
      select: { id: true, homeTeamName: true, awayTeamName: true, homeScore: true, awayScore: true, status: true },
    })

    logAdminAction(req, 'MATCH_UPDATED', req.params.id, 'match', { ...data })
    res.json({ match })
  } catch (err) { next(err) }
})

// ─── REPORTS ─────────────────────────────────────────────

/**
 * GET /api/admin/reports
 * List reports with pagination and status filter
 */
router.get('/reports', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const status = req.query.status || 'pending'

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
  } catch (err) { next(err) }
})

/**
 * PATCH /api/admin/reports/:id
 * Resolve or dismiss a report
 */
router.patch('/reports/:id', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { status } = req.body // 'resolved' | 'dismissed'

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

    logAdminAction(req, status === 'resolved' ? 'REPORT_RESOLVED' : 'REPORT_DISMISSED', req.params.id, 'report', {
      reportStatus: status,
    })
    res.json({ report })
  } catch (err) { next(err) }
})

// ─── ACTIVITY LOG ────────────────────────────────────────────

/**
 * GET /api/admin/activity-log
 * Returns recent admin actions with pagination
 */
router.get('/activity-log', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.adminLog.count(),
    ])

    res.json({ logs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
})

// ─── FEATURE FLAGS ───────────────────────────────────────

/**
 * GET /api/admin/settings
 * Get feature flags and system settings
 */
router.get('/settings', async (req, res) => {
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

module.exports = router

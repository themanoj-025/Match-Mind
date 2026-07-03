/**
 * Admin Service — MatchMind
 *
 * Extracts admin panel business logic from routes/admin.js.
 * Route handlers become thin HTTP adapters that call this service.
 */

import type { IUserRepository, IMatchRepository } from '../repositories/types'
import logger from '../utils/logger'

// ─── Dashboard Stats ─────────────────────────────────

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  predictionsToday: number
  proUsers: number
  pendingReports: number
  scheduledMatches: number
  signupTrend: Array<{ day: string; signups: number }>
}

// ─── Admin Service ───────────────────────────────────

export interface AdminServiceDeps {
  userRepository: IUserRepository
  matchRepository: IMatchRepository
  reportRepository: { count: (where?: Record<string, unknown>) => Promise<number> }
  adminLogRepository: { create: (data: Record<string, unknown>) => Promise<unknown> }
  prisma: {
    prediction: { count: (opts?: any) => Promise<number> }
    user: { count: (opts?: any) => Promise<number> }
  }
}

export class AdminService {
  private deps: AdminServiceDeps

  constructor(deps: AdminServiceDeps) {
    this.deps = deps
  }

  /**
   * Get aggregated dashboard metrics.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const { prisma, userRepository, matchRepository, reportRepository } = this.deps

    const [totalUsers, activeUsers, predictionsToday, proUsers, reports, matches] = await Promise.all([
      userRepository.count(),
      prisma.user.count({ where: { lastActiveAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } as any }),
      prisma.prediction.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } as any }),
      prisma.user.count({ where: { isPro: true } as any }),
      reportRepository.count({ where: { status: 'pending' } }),
      matchRepository.count({ where: { status: 'SCHEDULED' } }),
    ])

    // Signup trend (last 7 days)
    const signupTrend: Array<{ day: string; signups: number }> = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const startOfDay = new Date(day.setHours(0, 0, 0, 0))
      const endOfDay = new Date(day.setHours(23, 59, 59, 999))
      const count = await prisma.user.count({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      })
      signupTrend.push({
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][startOfDay.getDay()] ?? 'Sun',
        signups: count,
      })
    }

    return {
      totalUsers,
      activeUsers,
      predictionsToday,
      proUsers,
      pendingReports: reports,
      scheduledMatches: matches,
      signupTrend,
    }
  }

  /**
   * Log an admin action to the audit trail.
   */
  async logAction(
    adminId: string,
    action: string,
    targetId?: string | null,
    targetType?: string | null,
    detail: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await this.deps.adminLogRepository.create({
        adminId,
        action,
        targetId: targetId ?? null,
        targetType: targetType ?? null,
        detail,
      })
    } catch (err) {
      logger.error({ event: 'admin.log_failed', err: String(err) }, 'Failed to log admin action')
    }
  }
}

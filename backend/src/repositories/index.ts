/**
 * Repository Implementations — Prisma-backed
 *
 * Each repository wraps Prisma operations behind the interface defined in types.ts.
 * Route/service code depends on the interface, making it testable without a live DB.
 */

import { PrismaClient } from '@prisma/client'
import type {
  IUserRepository,
  IMatchRepository,
  IPredictionRepository,
  ILeaderboardRepository,
  IReportRepository,
  IAdminLogRepository,
  UserData,
  MatchData,
  PredictionData,
  LeaderboardEntry,
} from './types'

// ─── User Repository ─────────────────────────────────────

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserData | null> {
    return this.prisma.user.findUnique({ where: { id } }) as unknown as UserData | null
  }

  async findByEmail(email: string): Promise<UserData | null> {
    return this.prisma.user.findUnique({ where: { email } }) as unknown as UserData | null
  }

  async findByUsername(username: string): Promise<UserData | null> {
    return this.prisma.user.findUnique({ where: { username } }) as unknown as UserData | null
  }

  async findByEmailOrUsername(email: string, username: string): Promise<UserData | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    }) as unknown as UserData | null
  }

  async create(data: {
    username: string
    email: string
    passwordHash?: string | null
    displayName?: string | null
  }): Promise<UserData> {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash ?? null,
        displayName: data.displayName ?? data.username,
      },
    }) as unknown as UserData
  }

  async update(id: string, data: Partial<UserData>): Promise<UserData> {
    return this.prisma.user.update({ where: { id }, data: data as any }) as unknown as UserData
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }

  async findMany(opts: {
    orderBy?: Record<string, 'asc' | 'desc'>
    take?: number
    skip?: number
    select?: Record<string, boolean>
    where?: Record<string, unknown>
  }): Promise<Partial<UserData>[]> {
    return this.prisma.user.findMany(opts) as unknown as Partial<UserData>[]
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.user.count({ where })
  }

  async updateMany(where: Record<string, unknown>, data: Partial<UserData>): Promise<{ count: number }> {
    return this.prisma.user.updateMany({ where, data: data as any })
  }
}

// ─── Match Repository ─────────────────────────────────────

export class PrismaMatchRepository implements IMatchRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<MatchData | null> {
    return this.prisma.match.findUnique({ where: { id } }) as unknown as MatchData | null
  }

  async findMany(opts: {
    where?: Record<string, unknown>
    orderBy?: Record<string, 'asc' | 'desc'>
    take?: number
    skip?: number
    select?: Record<string, unknown>
  }): Promise<Partial<MatchData>[]> {
    return this.prisma.match.findMany(opts) as unknown as Partial<MatchData>[]
  }

  async update(id: string, data: Partial<MatchData>): Promise<MatchData> {
    return this.prisma.match.update({ where: { id }, data: data as any }) as unknown as MatchData
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.match.count({ where })
  }
}

// ─── Prediction Repository ────────────────────────────────

export class PrismaPredictionRepository implements IPredictionRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<PredictionData | null> {
    return this.prisma.prediction.findUnique({ where: { id } }) as unknown as PredictionData | null
  }

  async findByUserAndMatch(userId: string, matchId: string): Promise<PredictionData | null> {
    return this.prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId } },
    }) as unknown as PredictionData | null
  }

  async findMany(opts: {
    where?: Record<string, unknown>
    orderBy?: Record<string, 'asc' | 'desc'>
    take?: number
    skip?: number
  }): Promise<PredictionData[]> {
    return this.prisma.prediction.findMany(opts) as unknown as PredictionData[]
  }

  async create(data: {
    userId: string
    matchId: string
    homeGoals: number
    awayGoals: number
    status?: string
    firstScorerId?: string | null
    totalGoalsOU?: string | null
    totalGoalsLine?: number | null
    btts?: boolean | null
  }): Promise<PredictionData> {
    return this.prisma.prediction.create({
      data: {
        userId: data.userId,
        matchId: data.matchId,
        homeGoals: data.homeGoals,
        awayGoals: data.awayGoals,
        status: (data.status ?? 'PENDING') as any,
        firstScorerId: data.firstScorerId ?? null,
        totalGoalsOU: data.totalGoalsOU ?? null,
        totalGoalsLine: data.totalGoalsLine ?? null,
        btts: data.btts ?? null,
      },
    }) as unknown as PredictionData
  }

  async update(id: string, data: Partial<PredictionData>): Promise<PredictionData> {
    return this.prisma.prediction.update({ where: { id }, data: data as any }) as unknown as PredictionData
  }

  async updateMany(
    where: { matchId?: string; status?: string },
    data: Partial<PredictionData>
  ): Promise<{ count: number }> {
    return this.prisma.prediction.updateMany({ where: where as any, data: data as any })
  }
}

// ─── Leaderboard Repository ───────────────────────────────

export class PrismaLeaderboardRepository implements ILeaderboardRepository {
  constructor(private prisma: PrismaClient) {}

  async getGlobalLeaderboard(take = 100): Promise<LeaderboardEntry[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { totalPoints: 'desc' },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        totalPoints: true,
        predAccuracy: true,
        streakCurrent: true,
        tier: true,
        countryCode: true,
      },
      take,
    })

    return users.map((u, i) => ({
      id: u.id,
      username: u.username,
      name: u.displayName || u.username,
      avatar: u.avatar,
      points: u.totalPoints,
      accuracy: u.predAccuracy,
      streak: u.streakCurrent,
      tier: u.tier,
      rank: i + 1,
      countryCode: u.countryCode ?? undefined,
    }))
  }

  async getWeeklyLeaderboard(take = 100): Promise<LeaderboardEntry[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { weeklyPoints: 'desc' },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        weeklyPoints: true,
        predAccuracy: true,
        streakCurrent: true,
        tier: true,
        totalPoints: true,
      },
      take,
    })

    return users.map((u, i) => ({
      id: u.id,
      username: u.username,
      name: u.displayName || u.username,
      avatar: u.avatar,
      points: u.weeklyPoints,
      totalPoints: u.totalPoints,
      accuracy: u.predAccuracy,
      streak: u.streakCurrent,
      tier: u.tier,
      rank: i + 1,
    }))
  }
}

// ─── Report Repository ─────────────────────────────────

export class PrismaReportRepository implements IReportRepository {
  constructor(private prisma: PrismaClient) {}

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.prisma.report.count({ where: where as any })
  }

  async findMany(opts: {
    where?: Record<string, unknown>
    orderBy?: Record<string, 'asc' | 'desc'>
    take?: number
    skip?: number
  }): Promise<unknown[]> {
    return this.prisma.report.findMany(opts as any)
  }

  async update(id: string, data: Record<string, unknown>): Promise<unknown> {
    return this.prisma.report.update({ where: { id }, data: data as any })
  }
}

// ─── Admin Log Repository ────────────────────────────

export class PrismaAdminLogRepository implements IAdminLogRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    adminId: string
    action: string
    targetId?: string | null
    targetType?: string | null
    detail?: Record<string, unknown>
  }): Promise<unknown> {
    return (this.prisma as any).adminLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        targetId: data.targetId ?? null,
        targetType: data.targetType ?? null,
        detail: data.detail ?? {},
      },
    })
  }

  async findMany(opts: {
    orderBy?: Record<string, 'asc' | 'desc'>
    take?: number
    skip?: number
  }): Promise<unknown[]> {
    return (this.prisma as any).adminLog.findMany(opts)
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return (this.prisma as any).adminLog.count({ where })
  }
}

// ─── Factory ──────────────────────────────────────────────

export function createRepositories(prisma: PrismaClient) {
  return {
    userRepository: new PrismaUserRepository(prisma),
    matchRepository: new PrismaMatchRepository(prisma),
    predictionRepository: new PrismaPredictionRepository(prisma),
    leaderboardRepository: new PrismaLeaderboardRepository(prisma),
    reportRepository: new PrismaReportRepository(prisma),
    adminLogRepository: new PrismaAdminLogRepository(prisma),
  }
}

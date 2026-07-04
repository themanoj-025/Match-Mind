/**
 * Repository Implementations — JSON DB backed
 *
 * Each repository wraps jsonDb operations.
 * Route/service code depends on the interface, making it testable without a live DB.
 */

// ─── User Repository ─────────────────────────────────────

class PrismaUserRepository {
  constructor(prisma) {
    this.prisma = prisma
  }

  async findById(id) {
    return this.prisma.user.findUnique({ where: { id } }) || null
  }

  async findByEmail(email) {
    return this.prisma.user.findUnique({ where: { email } }) || null
  }

  async findByUsername(username) {
    return this.prisma.user.findUnique({ where: { username } }) || null
  }

  async findByEmailOrUsername(email, username) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
        ],
      },
    }) || null
  }

  async create(data) {
    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash ?? null,
        displayName: data.displayName ?? data.username,
      },
    })
  }

  async update(id, data) {
    return this.prisma.user.update({ where: { id }, data })
  }

  async delete(id) {
    await this.prisma.user.delete({ where: { id } })
  }

  async findMany(opts) {
    return this.prisma.user.findMany(opts)
  }

  async count(where) {
    return this.prisma.user.count({ where })
  }

  async updateMany(where, data) {
    return this.prisma.user.updateMany({ where, data })
  }
}

// ─── Match Repository ─────────────────────────────────────

class PrismaMatchRepository {
  constructor(prisma) {
    this.prisma = prisma
  }

  async findById(id) {
    return this.prisma.match.findUnique({ where: { id } }) || null
  }

  async findMany(opts) {
    return this.prisma.match.findMany(opts)
  }

  async update(id, data) {
    return this.prisma.match.update({ where: { id }, data })
  }

  async count(where) {
    return this.prisma.match.count({ where })
  }
}

// ─── Prediction Repository ────────────────────────────────

class PrismaPredictionRepository {
  constructor(prisma) {
    this.prisma = prisma
  }

  async findById(id) {
    return this.prisma.prediction.findUnique({ where: { id } }) || null
  }

  async findByUserAndMatch(userId, matchId) {
    return this.prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId } },
    }) || null
  }

  async findMany(opts) {
    return this.prisma.prediction.findMany(opts)
  }

  async create(data) {
    return this.prisma.prediction.create({
      data: {
        userId: data.userId,
        matchId: data.matchId,
        homeGoals: data.homeGoals,
        awayGoals: data.awayGoals,
        status: data.status ?? 'PENDING',
        firstScorerId: data.firstScorerId ?? null,
        totalGoalsOU: data.totalGoalsOU ?? null,
        totalGoalsLine: data.totalGoalsLine ?? null,
        btts: data.btts ?? null,
      },
    })
  }

  async update(id, data) {
    return this.prisma.prediction.update({ where: { id }, data })
  }

  async updateMany(where, data) {
    return this.prisma.prediction.updateMany({ where, data })
  }
}

// ─── Leaderboard Repository ───────────────────────────────

class PrismaLeaderboardRepository {
  constructor(prisma) {
    this.prisma = prisma
  }

  async getGlobalLeaderboard(take = 100) {
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

  async getWeeklyLeaderboard(take = 100) {
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

class PrismaReportRepository {
  constructor(prisma) {
    this.prisma = prisma
  }

  async count(where) {
    return this.prisma.report.count({ where })
  }

  async findMany(opts) {
    return this.prisma.report.findMany(opts)
  }

  async update(id, data) {
    return this.prisma.report.update({ where: { id }, data })
  }
}

// ─── Admin Log Repository ────────────────────────────

class PrismaAdminLogRepository {
  constructor(prisma) {
    this.prisma = prisma
  }

  async create(data) {
    return this.prisma.adminLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        targetId: data.targetId ?? null,
        targetType: data.targetType ?? null,
        detail: data.detail ?? {},
      },
    })
  }

  async findMany(opts) {
    return this.prisma.adminLog.findMany(opts)
  }

  async count(where) {
    return this.prisma.adminLog.count({ where })
  }
}

// ─── Factory ──────────────────────────────────────────────

function createRepositories(prisma) {
  return {
    userRepository: new PrismaUserRepository(prisma),
    matchRepository: new PrismaMatchRepository(prisma),
    predictionRepository: new PrismaPredictionRepository(prisma),
    leaderboardRepository: new PrismaLeaderboardRepository(prisma),
    reportRepository: new PrismaReportRepository(prisma),
    adminLogRepository: new PrismaAdminLogRepository(prisma),
  }
}

module.exports = { createRepositories }

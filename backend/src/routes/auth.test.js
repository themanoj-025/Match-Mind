/**
 * Auth Route Tests — MatchMind
 *
 * Tests authentication endpoints using supertest.
 * Uses an in-memory Prisma mock for isolated testing without a real database.
 * Mocks the AuthService module since vitest can't resolve .ts files via CommonJS require().
 */

const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Set required env vars before importing routes
process.env.JWT_SECRET = 'test-jwt-secret-64-chars-minimum-for-testing-purposes-only'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-64-chars-minimum-for-testing-purposes'
process.env.JWT_RESET_SECRET = 'test-reset-secret-64-chars-minimum-for-testing-purposes-only'

// ─── Mock AuthService before any route imports ──────────
// vitest can't resolve .ts files via CommonJS require(), so we mock the service module
vi.mock('../services/authService', () => {
  class MockAuthError extends Error {
    constructor(message, code, statusCode) {
      super(message)
      this.name = 'AuthError'
      this.code = code
      this.statusCode = statusCode
      this.isAppError = true
    }
  }

  class MockAuthService {
    constructor(deps) {
      this.deps = deps
    }

    async signup(username, email, password) {
      const userRepository = this.deps.userRepository
      const existing = await userRepository.findByEmailOrUsername(email, username)
      if (existing) {
        throw new MockAuthError(
          'A user with that email or username already exists',
          'DUPLICATE_USER',
          409
        )
      }

      const bcrypt = require('bcryptjs')
      const user = await userRepository.create({
        username,
        email,
        passwordHash: await bcrypt.hash(password, 4),
        displayName: username,
      })

      const jwt = require('jsonwebtoken')
      const tokens = {
        accessToken: jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' }),
        refreshToken: jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' }),
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          totalPoints: user.totalPoints,
          tier: user.tier,
        },
        tokens,
      }
    }

    async login(email, password) {
      const userRepository = this.deps.userRepository
      const user = await userRepository.findByEmail(email)
      if (!user || !user.passwordHash) {
        throw new MockAuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401)
      }

      const bcrypt = require('bcryptjs')
      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        throw new MockAuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401)
      }

      const jwt = require('jsonwebtoken')
      const tokens = {
        accessToken: jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' }),
        refreshToken: jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' }),
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          totalPoints: user.totalPoints,
          tier: user.tier,
        },
        tokens,
      }
    }

    async refreshToken(refreshToken) {
      const jwt = require('jsonwebtoken')
      let decoded
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
      } catch {
        throw new MockAuthError('Invalid or expired refresh token', 'INVALID_TOKEN', 401)
      }

      const user = await this.deps.userRepository.findById(decoded.userId)
      if (!user) {
        throw new MockAuthError('User not found', 'USER_NOT_FOUND', 401)
      }

      return {
        accessToken: jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' }),
        refreshToken: jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' }),
      }
    }

    async generatePasswordResetToken(email) {
      const user = await this.deps.userRepository.findByEmail(email)
      // Always return success to prevent email enumeration
    }
  }

  return {
    AuthService: MockAuthService,
    AuthError: MockAuthError,
    generateTokens: (userId) => {
      const jwt = require('jsonwebtoken')
      return {
        accessToken: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' }),
        refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' }),
      }
    },
  }
})

// ─── Also mock repositories/index.ts ───────────────────
vi.mock('../repositories/index', () => {
  class MockUserRepository {
    constructor(prisma) {
      this.prisma = prisma
    }

    async findById(id) {
      try {
        const user = await this.prisma.user.findUnique({ where: { id } })
        return user
      } catch { return null }
    }

    async findByEmail(email) {
      try {
        const user = await this.prisma.user.findUnique({ where: { email } })
        return user
      } catch { return null }
    }

    async findByUsername(username) {
      try {
        const user = await this.prisma.user.findUnique({ where: { username } })
        return user
      } catch { return null }
    }

    async findByEmailOrUsername(email, username) {
      try {
        const user = await this.prisma.user.findFirst({
          where: { OR: [{ email }, { username }] },
        })
        return user
      } catch { return null }
    }

    async create(data) {
      return this.prisma.user.create({ data })
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

  return {
    createRepositories: (prisma) => ({
      userRepository: new MockUserRepository(prisma),
      matchRepository: {},
      predictionRepository: {},
      leaderboardRepository: {},
      reportRepository: { count: async () => 0 },
      adminLogRepository: { create: async () => ({}), findMany: async () => [], count: async () => 0 },
    }),
  }
})

// ─── Helpers ──────────────────────────────────────────

function createTestApp(prismaMock) {
  const app = express()
  app.use(express.json())
  app.use(cookieParser())

  // Override app.get('prisma') to return our mock
  app.use((req, res, next) => {
    req.app.get = (key) => {
      if (key === 'prisma') return prismaMock
      return null
    }
    next()
  })

  // Mount routes
  const authRoutes = require('./auth')
  app.use('/api/auth', authRoutes)

  // Error handler that mimics the real one
  app.use((err, req, res, _next) => {
    console.error('TEST ERROR HANDLER CAUGHT:', err)
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } })
    }
    if (err.isAppError) {
      return res.status(err.statusCode || 400).json({
        error: { code: err.code || 'APP_ERROR', message: err.message },
      })
    }
    res.status(500).json({ error: { code: 'TEST_ERROR', message: err.message } })
  })

  return app
}

function createMockPrisma() {
  const users = {}
  let nextId = 1

  return {
    user: {
      findUnique: async ({ where }) => {
        if (where.id) return users[where.id] || null
        if (where.email) return Object.values(users).find(u => u.email === where.email) || null
        return null
      },
      findFirst: async ({ where }) => {
        if (where.OR) {
          for (const condition of where.OR) {
            const match = Object.values(users).find(u => {
              for (const [key, val] of Object.entries(condition)) {
                if (u[key] === val) return true
              }
              return false
            })
            if (match) return match
          }
        }
        return null
      },
      create: async ({ data }) => {
        const id = `user-${nextId++}`
        const user = {
          id,
          username: data.username,
          email: data.email,
          passwordHash: data.passwordHash || null,
          displayName: data.displayName || data.username,
          avatar: null,
          totalPoints: 0,
          tier: 'BRONZE',
          isPro: false,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        users[id] = user
        return user
      },
      update: async ({ where, data }) => {
        if (where.id && users[where.id]) {
          Object.assign(users[where.id], data)
          return users[where.id]
        }
        throw new Error('User not found')
      },
    },
    session: {
      deleteMany: async () => ({ count: 0 }),
    },
  }
}

describe('Auth Routes', () => {
  // ─── SIGNUP ────────────────────────────────────────────
  describe('POST /api/auth/signup', () => {
    it('creates a new user and returns tokens', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'testuser', email: 'test@example.com', password: 'Password123!' })

      expect(res.status).toBe(201)
      expect(res.body.user).toBeDefined()
      expect(res.body.user.username).toBe('testuser')
      expect(res.body.user.email).toBe('test@example.com')
      expect(res.body.accessToken).toBeDefined()
      expect(res.body.refreshToken).toBeDefined()
    })

    it('rejects duplicate email', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      await request(app)
        .post('/api/auth/signup')
        .send({ username: 'user1', email: 'dupe@example.com', password: 'Password123!' })

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'user2', email: 'dupe@example.com', password: 'Password123!' })

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('DUPLICATE_USER')
    })

    it('rejects duplicate username', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      await request(app)
        .post('/api/auth/signup')
        .send({ username: 'dupeuser', email: 'first@example.com', password: 'Password123!' })

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'dupeuser', email: 'second@example.com', password: 'Password123!' })

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('DUPLICATE_USER')
    })

    it('rejects invalid email format', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'testuser', email: 'not-an-email', password: 'Password123!' })

      expect(res.status).toBe(400)
    })

    it('rejects short password', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const res = await request(app)
        .post('/api/auth/signup')
        .send({ username: 'testuser', email: 'test@example.com', password: '123' })

      expect(res.status).toBe(400)
    })
  })

  // ─── LOGIN ─────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      // Create user first
      const passwordHash = await bcrypt.hash('Password123!', 4)
      const user = await prisma.user.create({
        data: { username: 'loginuser', email: 'login@example.com', passwordHash },
      })
      expect(user).toBeDefined()

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'Password123!' })

      expect(res.status).toBe(200)
      expect(res.body.user).toBeDefined()
      expect(res.body.accessToken).toBeDefined()
      expect(res.body.refreshToken).toBeDefined()
    })

    it('rejects invalid password', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const passwordHash = await bcrypt.hash('Password123!', 4)
      await prisma.user.create({
        data: { username: 'loginuser2', email: 'login2@example.com', passwordHash },
      })

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login2@example.com', password: 'WrongPassword!' })

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
    })

    it('rejects non-existent email', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', password: 'Password123!' })

      expect(res.status).toBe(401)
    })
  })

  // ─── REFRESH TOKEN ─────────────────────────────────────
  describe('POST /api/auth/refresh', () => {
    it('refreshes tokens with valid refresh token', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const user = await prisma.user.create({
        data: { username: 'refreshtest', email: 'refresh@example.com' },
      })
      expect(user).toBeDefined()

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      )

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })

      expect(res.status).toBe(200)
      expect(res.body.accessToken).toBeDefined()
    })

    it('returns 401 with missing refresh token', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({})

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('NO_REFRESH_TOKEN')
    })

    it('returns 401 with invalid refresh token', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token-value' })

      expect(res.status).toBe(401)
    })
  })

  // ─── FORGOT / RESET PASSWORD ───────────────────────────
  describe('POST /api/auth/forgot-password', () => {
    it('returns success even for unknown email (no enumeration)', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'unknown@example.com' })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('reset link has been sent')
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('resets password with valid token', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const user = await prisma.user.create({
        data: { username: 'resettest', email: 'reset@example.com' },
      })
      expect(user).toBeDefined()

      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password-reset' },
        process.env.JWT_RESET_SECRET,
        { expiresIn: '1h' }
      )

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: resetToken, password: 'NewPassword456!' })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('Password has been updated')
    })

    it('rejects invalid reset token', async () => {
      const prisma = createMockPrisma()
      const app = createTestApp(prisma)

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid-token', password: 'NewPassword456!' })

      expect(res.status).toBe(400)
    })
  })
})

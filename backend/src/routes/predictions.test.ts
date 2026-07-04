/**
 * Prediction Route Tests — MatchMind
 *
 * Tests prediction creation and scoring endpoints using supertest.
 * Uses mocked Prisma to avoid needing a real database.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import jwt from 'jsonwebtoken'

process.env.JWT_SECRET = 'test-jwt-secret-64-chars-minimum-for-testing-purposes-only'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-64-chars-minimum-for-testing-purposes'

// ─── JWT helper ───────────────────────────────────────

function generateTestToken(userId = 'test-user-id'): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1h' })
}

// ─── Mock Prisma factory ──────────────────────────────

function createMockPrisma() {
  const predictions: any[] = []
  const matches: Record<string, any> = {
    'match-scheduled': { id: 'match-scheduled', status: 'SCHEDULED' },
    'match-finished': { id: 'match-finished', status: 'FINISHED', homeScore: 2, awayScore: 1 },
    'match-not-scheduled': { id: 'match-not-scheduled', status: 'CANCELLED' },
  }

  return {
    match: {
      findUnique: async ({ where }: { where: Record<string, any> }) => (matches as any)[where.id] || null,
    },
    prediction: {
      findUnique: async ({ where }: { where: Record<string, any> }) => {
        if (where.userId_matchId) {
          return predictions.find(
            (p) => p.userId === where.userId_matchId.userId && p.matchId === where.userId_matchId.matchId
          ) || null
        }
        if (where.id) {
          return predictions.find((p) => p.id === where.id) || null
        }
        return null
      },
      findMany: async ({ where }: { where?: Record<string, any> }) => {
        return predictions.filter((p) => {
          if (where?.matchId && p.matchId !== where.matchId) return false
          if (where?.userId && p.userId !== where.userId) return false
          if (where?.status && p.status !== where.status) return false
          return true
        })
      },
      create: async ({ data }: { data: Record<string, any> }) => {
        const prediction = {
          id: `pred-${predictions.length + 1}`,
          ...data,
          pointsEarned: null,
          pointsBreakdown: null,
          lockedAt: null,
          scoredAt: null,
          createdAt: new Date(),
        }
        predictions.push(prediction)
        return prediction
      },
      update: async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        const idx = predictions.findIndex((p) => p.id === where.id)
        if (idx === -1) throw new Error('Prediction not found')
        Object.assign(predictions[idx], data)
        return predictions[idx]
      },
      updateMany: async ({ where, data }: { where: Record<string, any>; data: Record<string, any> }) => {
        let count = 0
        for (const p of predictions) {
          if (where.matchId && p.matchId === where.matchId) {
            Object.assign(p, data)
            count++
          }
        }
        return { count }
      },
    },
    scoringLog: {
      create: async () => {},
    },
    user: {
      findUnique: async () => ({ id: 'test-user-id' }),
    },
    // Expose for assertions
    getPredictions: () => [...predictions],
  }
}

// ─── App factory ─────────────────────────────────────

async function createTestApp(prismaMock: any) {
  const app = express()
  app.use(express.json())

  // Mock req.app.get('prisma')
  app.use((req, _res, next) => {
    const originalGet = req.app.get.bind(req.app)
    req.app.get = (key: string) => {
      if (key === 'prisma') return prismaMock
      return originalGet(key)
    }
    next()
  })

  // Auth middleware mock
  app.use('/api/predictions', (req, _res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
        ;(req as any).userId = decoded.userId
      } catch {
        return (_res as any).status(401).json({ message: 'Invalid token' })
      }
    }
    next()
  })

  const { default: predictionRoutes } = await import('./predictions')
  app.use('/api/predictions', predictionRoutes)

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: { code: 'TEST_ERROR', message: err.message } })
  })

  return app
}

describe('Prediction Routes', () => {
  const token = generateTestToken()

  // ─── CREATE PREDICTION ──────────────────────────────────
  describe('POST /api/predictions', () => {
    it('creates a prediction for a scheduled match', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${token}`)
        .send({ matchId: 'match-scheduled', homeGoals: 2, awayGoals: 1 })

      expect(res.status).toBe(201)
      expect(res.body.matchId).toBe('match-scheduled')
      expect(res.body.homeGoals).toBe(2)
      expect(res.body.awayGoals).toBe(1)
      expect(res.body.status).toBe('PENDING')
    })

    it('creates a prediction with optional fields (btts, ou)', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          matchId: 'match-scheduled',
          homeGoals: 1,
          awayGoals: 1,
          btts: true,
          totalGoalsOU: 'over',
          totalGoalsLine: 2.5,
          firstScorer: 'Player Name',
        })

      expect(res.status).toBe(201)
      expect(res.body.btts).toBe(true)
      expect(res.body.totalGoalsOU).toBe('over')
    })

    it('rejects duplicate prediction for the same match', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${token}`)
        .send({ matchId: 'match-scheduled', homeGoals: 2, awayGoals: 1 })

      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${token}`)
        .send({ matchId: 'match-scheduled', homeGoals: 3, awayGoals: 0 })

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('DUPLICATE_PREDICTION')
    })

    it('rejects prediction for non-existent match', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${token}`)
        .send({ matchId: 'match-nonexistent', homeGoals: 1, awayGoals: 0 })

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('MATCH_NOT_FOUND')
    })

    it('rejects prediction for non-scheduled match', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${token}`)
        .send({ matchId: 'match-not-scheduled', homeGoals: 1, awayGoals: 0 })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('MATCH_NOT_SCHEDULED')
    })

    it('rejects prediction without authentication', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      const res = await request(app)
        .post('/api/predictions')
        .send({ matchId: 'match-scheduled', homeGoals: 2, awayGoals: 1 })

      expect(res.status).toBe(401)
    })

    it('rejects prediction with negative goals', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      const res = await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${token}`)
        .send({ matchId: 'match-scheduled', homeGoals: -1, awayGoals: 1 })

      expect(res.status).toBe(400)
    })
  })

  // ─── GET PREDICTIONS ────────────────────────────────────
  describe('GET /api/predictions/mine', () => {
    it('returns predictions for authenticated user', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      // Create a prediction first
      await request(app)
        .post('/api/predictions')
        .set('Authorization', `Bearer ${token}`)
        .send({ matchId: 'match-scheduled', homeGoals: 2, awayGoals: 1 })

      const res = await request(app)
        .get('/api/predictions/mine')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBe(1)
    })
  })

  // ─── SCORING MODES ──────────────────────────────────────
  describe('POST /api/predictions/score/:matchId', () => {
    it('returns 400 for non-finished match', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      const res = await request(app)
        .post('/api/predictions/score/match-scheduled')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('MATCH_NOT_FINISHED')
    })

    it('returns 404 for non-existent match', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      const res = await request(app)
        .post('/api/predictions/score/match-ghost')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
      expect(res.body.error.code).toBe('MATCH_NOT_FOUND')
    })

    it('triggers scoring with direct mode', async () => {
      const prisma = createMockPrisma()
      const app = await createTestApp(prisma)

      // Create a prediction for the finished match
      await prisma.prediction.create({
        data: {
          userId: 'test-user-id',
          matchId: 'match-finished',
          homeGoals: 2,
          awayGoals: 1,
          status: 'PENDING',
        },
      })

      const res = await request(app)
        .post('/api/predictions/score/match-finished')
        .query({ mode: 'direct' })
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.mode).toBe('direct')
    })
  })
})

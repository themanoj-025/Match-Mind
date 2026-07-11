import { describe, it, expect, vi } from 'vitest'
import express from 'express'
import request from 'supertest'
import cookieParser from 'cookie-parser'

process.env.JWT_SECRET = 'test-jwt-secret-64-chars-minimum-for-testing-purposes-only'

// Mock redis at the top so it's active for all imports in this test file
const mockCache = new Map<string, string>()
vi.mock('../lib/redis', () => {
  return {
    redis: {
      status: 'ready',
      get: vi.fn().mockImplementation((key) => Promise.resolve(mockCache.get(key) || null)),
      set: vi.fn().mockImplementation((key, val) => {
        mockCache.set(key, val)
        return Promise.resolve('OK')
      }),
      on: () => {},
    },
  }
})

describe('Remediation Phase 4 Tests — AI Hint Caching', () => {

  it('should hit the cache on subsequent requests with identical inputs', async () => {
    const app = express()
    app.use(express.json())
    app.use(cookieParser())

    // Mock prisma
    const prismaMock = {
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: 'user-1', isPro: true }),
      },
      roomMember: {
        findUnique: vi.fn().mockResolvedValue({ roomId: 'room-1', userId: 'user-1', remainingBudget: 100 }),
      },
      room: {
        findUnique: vi.fn().mockResolvedValue({ id: 'room-1', rosterRules: { GK: 1, DEF: 4, MID: 3, FWD: 3 } }),
      },
      roster: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      auctionState: {
        findUnique: vi.fn().mockResolvedValue({ poolQueue: ['player-1'], unsoldPlayerIds: [] }),
      },
      player: {
        findMany: vi.fn().mockResolvedValue([{ id: 'player-1', name: 'Messi', position: 'FWD', basePrice: 10 }]),
      },
    }

    app.use((req, _res, next) => {
      req.app.get = (key: string) => {
        if (key === 'prisma') return prismaMock
        return null
      }
      next()
    })

    const { default: aiRoutes } = await import('../routes/ai')
    app.use('/api/ai', aiRoutes)

    // Bypass authenticateToken middleware in test
    vi.mock('../middleware/auth', () => ({
      authenticateToken: (req: any, _res: any, next: any) => {
        req.userId = 'user-1'
        next()
      },
    }))

    // First request should result in cache miss and generate heuristic/anthropic response
    const res1 = await request(app)
      .post('/api/ai/auction-advice')
      .send({ roomId: 'room-1' })

    expect(res1.status).toBe(200)
    expect(res1.body.cacheHit).toBe(false)
    expect(res1.body.advice).toBeDefined()

    // Second request should result in cache hit since inputs are identical
    const res2 = await request(app)
      .post('/api/ai/auction-advice')
      .send({ roomId: 'room-1' })

    expect(res2.status).toBe(200)
    expect(res2.body.cacheHit).toBe(true)
    expect(res2.body.advice).toEqual(res1.body.advice)
  })
})

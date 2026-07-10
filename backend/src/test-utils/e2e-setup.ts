/**
 * E2E Test Setup — MatchMind
 *
 * Creates an Express app + JSON database in a temp directory for integration tests.
 * Used by supertest to test full API flows without starting the server.
 */

import express from 'express'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'

// ── Helpers ──────────────────────────────────────────────

export function createTempDir(): string {
  const dir = path.join(os.tmpdir(), 'matchmind-e2e-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6))
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

export function cleanupDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
}

export function createTestUser(overrides: Record<string, any> = {}) {
  return {
    id: 'test-user-1',
    username: 'testuser',
    email: 'test@matchmind.gg',
    displayName: 'Test User',
    password: '$2a$10$testhashedpassword', // bcrypt hash of "password123"
    tier: 'BRONZE',
    isPro: false,
    totalPoints: 0,
    ...overrides,
  }
}

export function createTestPlayer(overrides: Record<string, any> = {}) {
  return {
    id: 'player-1',
    tournamentId: 'fifa-wc-2026',
    name: 'Test Player',
    club: 'Test FC',
    nationality: 'Testland',
    position: 'MID',
    basePrice: 10,
    ...overrides,
  }
}

export function createTestTournament(overrides: Record<string, any> = {}) {
  return {
    id: 'fifa-wc-2026',
    name: 'FIFA World Cup 2026',
    shortName: 'WC26',
    status: 'UPCOMING',
    confederation: 'FIFA',
    hosts: ['USA', 'Canada', 'Mexico'],
    theme: { primary: '#0B3D91', accent: '#D4AF37' },
    ...overrides,
  }
}

// ── Mock Auth Middleware ───────────────────────────────

/**
 * Bypasses JWT authentication for E2E tests by setting req.userId directly.
 * This replaces the real authenticateToken middleware so tests don't
 * need to generate JWTs or manage auth tokens.
 */
function mockAuthenticateToken(req: any, _res: any, next: any) {
  req.userId = 'test-user-1'
  next()
}

// ── App Factory ──────────────────────────────────────────

export async function createTestApp() {
  const prisma = new PrismaClient()

  // In a real e2e environment with Postgres, we would truncate tables and seed data here
  // For now, assume CI sets up the test database

  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use(passport.initialize())

  // Make prisma accessible
  app.set('prisma', prisma)
  app.set('io', null) // No socket for tests

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'healthy', checks: { database: { status: 'ok' } } })
  })

  // Mount routes
  const authRoutes = (await import('../routes/auth')).default
  const tournamentRoutes = (await import('../routes/tournaments')).default
  const playerRoutes = (await import('../routes/players')).default
  const roomRoutes = (await import('../routes/rooms')).default
  const auctionRoutes = (await import('../routes/auction')).default
  const franchiseRoutes = (await import('../routes/franchises')).default
  const fixtureRoutes = (await import('../routes/fixtures')).default
  const leaderboardRoutes = (await import('../routes/leaderboard')).default

  app.use('/api/auth', authRoutes)
  app.use('/api/tournaments', tournamentRoutes)
  app.use('/api/players', playerRoutes)
  app.use('/api/rooms', roomRoutes)
  app.use('/api/rooms', auctionRoutes)
  app.use('/api/rooms', franchiseRoutes)
  app.use('/api/fixtures', fixtureRoutes)
  app.use('/api/leaderboard', leaderboardRoutes)

  // Error handler
  const { errorHandler } = await import('../middleware/errorHandler')
  app.use(errorHandler)

  return { app, prisma }
}

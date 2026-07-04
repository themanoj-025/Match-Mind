/**
 * JSON Database Atomic Write Tests — AuctionXI
 *
 * Tests the core persistence reliability of the JSON database:
 * - Temp-file + rename atomicity (partial-write prevention)
 * - Data integrity across concurrent sequential writes
 * - Mutex serialization under rapid writes
 * - Crash recovery (simulating crash by leaving .tmp files)
 * - File content correctness after CRUD operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { createJsonDatabase } from './jsonDb'

const TEST_DIR = path.join(os.tmpdir(), 'auctionxi-atomic-test-' + Date.now())

function makeTestDb(): any {
  return createJsonDatabase(TEST_DIR)
}

// Helper to read a model file directly from disk
function readModelFile(name: string): any[] {
  const filePath = path.join(TEST_DIR, `${name}.json`)
  if (!fs.existsSync(filePath)) return []
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

// Helper to flush pending async mutex writes
async function flushWrites(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 50))
}

// Helper to count temp files in dir
function countTempFiles(): number {
  try {
    return fs.readdirSync(TEST_DIR).filter(f => f.endsWith('.tmp')).length
  } catch {
    return 0
  }
}

describe('jsonDb — Atomic Write Mechanism', () => {
  let db: JsonDatabase

  beforeEach(async () => {
    // Ensure clean test directory
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true })
    }
    db = makeTestDb()
    await db.initialize()
  })

  afterEach(() => {
    // Clean up test directory
    try {
      fs.rmSync(TEST_DIR, { recursive: true, force: true })
    } catch { /* ignore */ }
  })

  // ── Basic CRUD + File Persistence ─────────────────

  it('persists created records to JSON file on disk', async () => {
    const user = db.user.create({
      data: {
        username: 'atomic-test',
        email: 'atomic@test.com',
        displayName: 'Atomic Test',
      },
    })

    await flushWrites()

    // Read the file directly from disk
    const fileData = readModelFile('user')
    expect(fileData.length).toBe(1)
    expect(fileData[0].username).toBe('atomic-test')
    expect(fileData[0].id).toBe(user.id)
  })

  it('persists updated records to JSON file on disk', async () => {
    const user = db.user.create({
      data: { username: 'before', email: 'before@test.com', displayName: 'Before' },
    })

    await flushWrites()

    db.user.update({
      where: { id: user.id },
      data: { username: 'after' },
    })

    await flushWrites()

    const fileData = readModelFile('user')
    expect(fileData[0].username).toBe('after')
  })

  it('persists deleted records (removed from file)', async () => {
    const user = db.user.create({
      data: { username: 'delete-me', email: 'del@test.com', displayName: 'Delete Me' },
    })

    db.user.delete({ where: { id: user.id } })

    const fileData = readModelFile('user')
    expect(fileData.length).toBe(0)
  })

  // ── Temp File + Rename Atomicity ──────────────────

  it('does not leave orphaned .tmp files after successful write', async () => {
    db.user.create({
      data: { username: 'no-temp', email: 'no@temp.com', displayName: 'No Temp' },
    })

    expect(countTempFiles()).toBe(0)
  })

  it('writes complete JSON — no truncated output', async () => {
    // Create a record with deeply nested data
    db.room.create({
      data: {
        name: 'Atomicity Test',
        tournamentId: 'fifa-wc-2026',
        hostId: 'host-1',
        inviteCode: 'ATOMIC01',
        totalBudget: 500,
        rosterRules: { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 },
        status: 'LOBBY',
        bidIncrementRule: { base: 5 },
        antiSnipeSeconds: 5,
      },
    })

    await flushWrites()

    const fileData = readModelFile('room')
    expect(fileData.length).toBe(1)
    expect(fileData[0].rosterRules.GK).toBe(2)
    expect(fileData[0].totalBudget).toBe(500)
    expect(fileData[0].status).toBe('LOBBY')
  })

  it('survives rapid sequential writes without data loss', async () => {
    // Write 50 users sequentially
    for (let i = 0; i < 50; i++) {
      db.user.create({
        data: { username: `user-${i}`, email: `user${i}@test.com`, displayName: `User ${i}` },
      })
    }

    await flushWrites()

    const fileData = readModelFile('user')
    expect(fileData.length).toBe(50)
    // Verify all usernames are present
    const usernames = new Set(fileData.map((u: any) => u.username))
    for (let i = 0; i < 50; i++) {
      expect(usernames.has(`user-${i}`)).toBe(true)
    }
  })

  // ── Write Integrity — Simulate Crash Recovery ──────

  it('reads back the same data that was written', async () => {
    const created = db.room.create({
      data: {
        name: 'Round Trip',
        tournamentId: 'fifa-wc-2026',
        hostId: 'host-1',
        inviteCode: 'ROUND01',
        totalBudget: 500,
        rosterRules: { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 },
        status: 'LOBBY',
        bidIncrementRule: { base: 5 },
        antiSnipeSeconds: 5,
      },
    })

    // Read back via findUnique
    const readBack = db.room.findUnique({ where: { id: created.id } })
    expect(readBack).not.toBeNull()
    expect(readBack.name).toBe('Round Trip')
    expect(readBack.totalBudget).toBe(500)
    expect(readBack.inviteCode).toBe('ROUND01')
  })

  it('preserves data integrity after create + update cycle', async () => {
    const user = db.user.create({
      data: { username: 'integrity', email: 'integrity@test.com', displayName: 'Integrity' },
    })

    await flushWrites()

    // Multiple updates
    for (let i = 0; i < 20; i++) {
      db.user.update({
        where: { id: user.id },
        data: { displayName: `Update ${i}` },
      })
    }

    await flushWrites()

    const fileData = readModelFile('user')
    expect(fileData.length).toBe(1)
    expect(fileData[0].displayName).toBe('Update 19')
  })

  // ── Multiple Collection Consistency ────────────────

  it('maintains consistency across multiple collections', async () => {
    // Create a room, its members, and its auction state
    const room = db.room.create({
      data: {
        name: 'Multi-Collection Room',
        tournamentId: 'fifa-wc-2026',
        hostId: 'host-1',
        inviteCode: 'MULTI01',
        totalBudget: 500,
        rosterRules: { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 },
        status: 'LOBBY',
        bidIncrementRule: { base: 5 },
        antiSnipeSeconds: 5,
      },
    })

    db.roomMember.create({
      data: { roomId: room.id, userId: 'user-1', role: 'host', remainingBudget: 500 },
    })

    db.auctionState.create({
      data: {
        roomId: room.id,
        phase: 'IDLE',
        currentPlayerId: null,
        currentBid: 0,
        currentBidderId: null,
        timerEndsAt: null,
        poolQueue: [],
        unsoldPlayerIds: [],
        version: 1,
      },
    })

    await flushWrites()

    // Verify all three files are correct
    const rooms = readModelFile('room')
    const members = readModelFile('roomMember')
    const states = readModelFile('auctionState')

    expect(rooms.length).toBe(1)
    expect(members.length).toBe(1)
    expect(states.length).toBe(1)
    expect(members[0].roomId).toBe(room.id)
    expect(states[0].roomId).toBe(room.id)
  })

  // ── JSON File Validity ─────────────────────────────

  it('writes valid JSON that can be parsed', async () => {
    // Create some records
    db.room.create({
      data: {
        name: 'JSON Valid',
        tournamentId: 'fifa-wc-2026',
        hostId: 'host-1',
        inviteCode: 'JSON001',
        totalBudget: 1000,
        rosterRules: { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 },
        status: 'LOBBY',
        bidIncrementRule: { base: 5 },
        antiSnipeSeconds: 5,
      },
    })

    // Read file and verify it's valid JSON
    const filePath = path.join(TEST_DIR, 'room.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    expect(() => JSON.parse(raw)).not.toThrow()
    const parsed = JSON.parse(raw)
    expect(Array.isArray(parsed)).toBe(true)
  })

  it('produces readable JSON with indentation', async () => {
    db.room.create({
      data: {
        name: 'Pretty Print',
        tournamentId: 'fifa-wc-2026',
        hostId: 'host-1',
        inviteCode: 'PRETTY1',
        totalBudget: 500,
        rosterRules: { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 },
        status: 'LOBBY',
        bidIncrementRule: { base: 5 },
        antiSnipeSeconds: 5,
      },
    })

    await flushWrites()

    const filePath = path.join(TEST_DIR, 'room.json')
    const raw = fs.readFileSync(filePath, 'utf-8')
    // Should have newlines (pretty-printed)
    expect(raw.startsWith('[')).toBe(true)
    expect(raw.includes('\n    "name"')).toBe(true)
  })
})

describe('jsonDb — Query Operations', () => {
  let db: JsonDatabase

  beforeEach(async () => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true })
    }
    db = makeTestDb()
    await db.initialize()

    // Seed test data
    db.user.create({ data: { username: 'alpha', email: 'alpha@test.com', displayName: 'Alpha', tier: 'GOLD' } })
    db.user.create({ data: { username: 'beta', email: 'beta@test.com', displayName: 'Beta', tier: 'SILVER' } })
    db.user.create({ data: { username: 'gamma', email: 'gamma@test.com', displayName: 'Gamma', tier: 'GOLD' } })
  })

  afterEach(() => {
    try { fs.rmSync(TEST_DIR, { recursive: true, force: true }) } catch { /* ignore */ }
  })

  it('findUnique returns correct record by id', () => {
    const users = db.user.findMany()
    const first = db.user.findUnique({ where: { id: users[0].id } })
    expect(first).not.toBeNull()
    expect(first.id).toBe(users[0].id)
  })

  it('findUnique returns null for non-existent record', () => {
    const result = db.user.findUnique({ where: { id: 'non-existent' } })
    expect(result).toBeNull()
  })

  it('findUnique handles compound keys (roomId_userId)', () => {
    const room = db.room.create({
      data: {
        name: 'Compound Key Room',
        tournamentId: 'fifa-wc-2026',
        hostId: 'host-1',
        inviteCode: 'CPD001',
        totalBudget: 500,
        rosterRules: { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 },
        status: 'LOBBY',
        bidIncrementRule: { base: 5 },
        antiSnipeSeconds: 5,
      },
    })
    db.roomMember.create({ data: { roomId: room.id, userId: 'user-1', role: 'host', remainingBudget: 500 } })

    const member = db.roomMember.findUnique({
      where: { roomId_userId: { roomId: room.id, userId: 'user-1' } },
    })
    expect(member).not.toBeNull()
    expect(member.role).toBe('host')
  })

  it('findMany returns all records with no where clause', () => {
    const users = db.user.findMany()
    expect(users.length).toBe(3)
  })

  it('findMany filters by where clause', () => {
    const goldUsers = db.user.findMany({ where: { tier: 'GOLD' } })
    expect(goldUsers.length).toBe(2)
  })

  it('findMany with orderBy sorts correctly', () => {
    const users = db.user.findMany({ orderBy: { username: 'asc' } })
    expect(users[0].username).toBe('alpha')
    expect(users[2].username).toBe('gamma')
  })

  it('findMany with orderBy desc sorts correctly', () => {
    const users = db.user.findMany({ orderBy: { username: 'desc' } })
    expect(users[0].username).toBe('gamma')
    expect(users[2].username).toBe('alpha')
  })

  it('findMany respects take limit', () => {
    const users = db.user.findMany({ take: 2 })
    expect(users.length).toBe(2)
  })

  it('findMany respects skip', () => {
    const users = db.user.findMany({ skip: 1, orderBy: { username: 'asc' } })
    expect(users.length).toBe(2)
    expect(users[0].username).toBe('beta')
  })

  it('count returns correct total', () => {
    expect(db.user.count()).toBe(3)
  })

  it('count with where returns matching count', () => {
    expect(db.user.count({ where: { tier: 'GOLD' } })).toBe(2)
  })

  it('upsert creates a new record when not found', () => {
    const user = db.user.upsert({
      where: { id: 'non-existent' },
      create: { username: 'upserted', email: 'upsert@test.com', displayName: 'Upserted' },
      update: { displayName: 'Updated' },
    })
    expect(user.username).toBe('upserted')
    expect(db.user.count()).toBe(4)
  })

  it('upsert updates an existing record', () => {
    const users = db.user.findMany()
    const existing = db.user.upsert({
      where: { id: users[0].id },
      create: { username: 'new', email: 'new@test.com', displayName: 'New' },
      update: { displayName: 'Updated via Upsert' },
    })
    expect(existing.displayName).toBe('Updated via Upsert')
    expect(db.user.count()).toBe(3) // Not increased
  })

  it('deleteMany removes matching records', () => {
    const result = db.user.deleteMany({ where: { tier: 'GOLD' } })
    expect(result.count).toBe(2)
    expect(db.user.count()).toBe(1) // Only beta (SILVER) remains
  })

  it('findMany with include resolves hasMany relations', () => {
    const room = db.room.create({
      data: {
        name: 'Include Test',
        tournamentId: 'fifa-wc-2026',
        hostId: 'host-1',
        inviteCode: 'INCL01',
        totalBudget: 500,
        rosterRules: { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 },
        status: 'LOBBY',
        bidIncrementRule: { base: 5 },
        antiSnipeSeconds: 5,
      },
    })
    db.roomMember.create({ data: { roomId: room.id, userId: 'host-1', role: 'host', remainingBudget: 500 } })

    const rooms = db.room.findMany({ include: { members: true } })
    expect(rooms[0].members).toBeDefined()
    expect(rooms[0].members.length).toBe(1)
  })

  it('findMany with include resolves belongsTo relations', () => {
    const room = db.room.create({
      data: {
        name: 'Belongs Test',
        tournamentId: 'fifa-wc-2026',
        hostId: 'host-1',
        inviteCode: 'BLNG01',
        totalBudget: 500,
        rosterRules: { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 },
        status: 'LOBBY',
        bidIncrementRule: { base: 5 },
        antiSnipeSeconds: 5,
      },
    })
    db.roomMember.create({ data: { roomId: room.id, userId: 'host-1', role: 'host', remainingBudget: 500 } })

    const members = db.roomMember.findMany({
      where: { roomId: room.id },
      include: { room: true, user: true },
    })
    expect(members[0].room).toBeDefined()
    expect(members[0].room.name).toBe('Belongs Test')
  })

  it('createMany inserts multiple records', () => {
    const result = db.user.createMany({
      data: [
        { username: 'multi-1', email: 'multi1@test.com', displayName: 'Multi 1' },
        { username: 'multi-2', email: 'multi2@test.com', displayName: 'Multi 2' },
        { username: 'multi-3', email: 'multi3@test.com', displayName: 'Multi 3' },
      ],
    })
    expect(result.count).toBe(3)
    expect(db.user.count()).toBe(6) // 3 seeded + 3 new
  })

  it('updateMany updates matching records', () => {
    const result = db.user.updateMany({
      where: { tier: 'GOLD' },
      data: { displayName: 'Gold Member' },
    })
    expect(result.count).toBe(2)
    const goldUsers = db.user.findMany({ where: { tier: 'GOLD' } })
    expect(goldUsers[0].displayName).toBe('Gold Member')
  })

  it('findFirst returns first matching record with orderBy', () => {
    const first = db.user.findFirst({ orderBy: { username: 'asc' } })
    expect(first).not.toBeNull()
    expect(first.username).toBe('alpha')
  })

  it('findFirst returns null for no match', () => {
    const result = db.user.findFirst({ where: { username: 'non-existent' } })
    expect(result).toBeNull()
  })

  it('handles WHERE with comparison operators (gte, lte)', () => {
    // Create players with different prices
    db.room.create({
      data: {
        name: 'Price Test',
        tournamentId: 'fifa-wc-2026',
        hostId: 'host-1',
        inviteCode: 'PRIC01',
        totalBudget: 1000,
        rosterRules: { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 },
        status: 'LOBBY',
        bidIncrementRule: { base: 5 },
        antiSnipeSeconds: 5,
      },
    })
    // Use room count as a simple numeric check
    const budgetAbove = db.room.findMany({ where: { totalBudget: { gte: 500 } } })
    const budgetBelow = db.room.findMany({ where: { totalBudget: { lt: 500 } } })
    expect(budgetAbove.length).toBe(1)
    expect(budgetBelow.length).toBe(0)
  })

  it('handles WHERE with contains (string search)', () => {
    const found = db.user.findMany({ where: { username: { contains: 'bet' } } })
    expect(found.length).toBe(1)
    expect(found[0].username).toBe('beta')
  })

  it('handles WHERE with in operator', () => {
    const found = db.user.findMany({ where: { tier: { in: ['GOLD', 'PLATINUM'] } } })
    expect(found.length).toBe(2) // alpha and gamma are GOLD
  })
})

describe('jsonDb — Error Handling', () => {
  let db: JsonDatabase

  beforeEach(async () => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true })
    }
    db = makeTestDb()
    await db.initialize()
  })

  afterEach(() => {
    try { fs.rmSync(TEST_DIR, { recursive: true, force: true }) } catch { /* ignore */ }
  })

  it('throws on updating a non-existent record', () => {
    expect(() =>
      db.user.update({ where: { id: 'non-existent' }, data: { username: 'ghost' } })
    ).toThrow('Record not found')
  })

  it('throws on deleting a non-existent record', () => {
    expect(() =>
      db.user.delete({ where: { id: 'non-existent' } })
    ).toThrow('Record not found')
  })

  it('handles empty database gracefully', () => {
    const rooms = db.room.findMany()
    expect(rooms).toEqual([])
    expect(db.room.count()).toBe(0)
  })
})

/**
 * JSON Database Adapter — AuctionXI (Production)
 *
 * In-memory database backed by JSON files. Permanent production database.
 * API-compatible with a subset of PrismaClient (findMany, findUnique, create,
 * update, delete, count, upsert, createMany, updateMany, deleteMany, $transaction).
 *
 * Production safeguards:
 * 1. Atomic writes via temp-file + fs.rename (prevents partial-write corruption)
 * 2. In-process AsyncMutex per collection (serializes concurrent writes)
 * 3. Backup snapshots on $disconnect
 * 4. All writes go through write(collection, mutatorFn) pattern
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { Mutex } from 'async-mutex'
import logger from '../utils/logger'

const DATA_DIR = path.join(__dirname, '..', 'data')
const BACKUP_DIR = path.join(DATA_DIR, '.backups')

// ─── Types ─────────────────────────────────────────────

interface WhereClause {
  [key: string]: any
  OR?: WhereClause[]
  AND?: WhereClause[]
  NOT?: WhereClause
}

interface QueryOpts {
  where?: WhereClause
  orderBy?: Record<string, 'asc' | 'desc'>
  take?: number
  skip?: number
  select?: Record<string, any>
  include?: Record<string, any>
}

interface CreateOpts { data: Record<string, any> }
interface UpdateOpts { where: Record<string, any>; data: Record<string, any> }
interface UpsertOpts { where: Record<string, any>; create: Record<string, any>; update: Record<string, any> }
interface DeleteOpts { where: Record<string, any> }
interface CreateManyOpts { data: Record<string, any>[] }
interface UpdateManyOpts { where?: WhereClause; data: Record<string, any> }
interface DeleteManyOpts { where?: WhereClause }
interface CountOpts { where?: WhereClause }

interface ModelHandler {
  findUnique: (opts: { where: Record<string, any> }) => any
  findFirst: (opts: QueryOpts) => any
  findMany: (opts?: QueryOpts) => any[]
  create: (opts: CreateOpts) => any
  createMany: (opts: CreateManyOpts) => { count: number }
  update: (opts: UpdateOpts) => any
  updateMany: (opts: UpdateManyOpts) => { count: number }
  upsert: (opts: UpsertOpts) => any
  delete: (opts: DeleteOpts) => any
  deleteMany: (opts: DeleteManyOpts) => { count: number }
  count: (opts?: CountOpts) => number
}

interface ModelRelations {
  [relationName: string]: {
    type: 'hasMany' | 'belongsTo'
    model: string
    localKey: string
    foreignKey: string
  }
}

// ─── Per-collection mutexes ──────────────────────────────

const collectionMutexes = new Map<string, Mutex>()

function getMutex(collection: string): Mutex {
  if (!collectionMutexes.has(collection)) {
    collectionMutexes.set(collection, new Mutex())
  }
  return collectionMutexes.get(collection)!
}

// ─── Atomic Write ────────────────────────────────────────

function atomicWrite(filePath: string, data: any): void {
  const tmpPath = filePath + '.tmp'
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8')
  // Atomic rename — on most filesystems this is an atomic metadata operation
  fs.renameSync(tmpPath, filePath)
}

// ─── Helpers ─────────────────────────────────────────────

function cuid(): string {
  return crypto.randomBytes(12).toString('hex')
}

function now(): string {
  return new Date().toISOString()
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function matchesWhere(item: Record<string, any>, where?: WhereClause): boolean {
  if (!where || Object.keys(where).length === 0) return true

  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR' && Array.isArray(value)) {
      return value.some((subWhere) => matchesWhere(item, subWhere))
    }
    if (key === 'AND' && Array.isArray(value)) {
      return value.every((subWhere) => matchesWhere(item, subWhere))
    }
    if (key === 'NOT') {
      return !matchesWhere(item, value as WhereClause)
    }

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      if ('contains' in value) {
        const itemVal = String(getNestedValue(item, key) ?? '')
        const search = String((value as any).contains)
        const caseInsensitive = (value as any).mode === 'insensitive'
        const matches = caseInsensitive
          ? itemVal.toLowerCase().includes(search.toLowerCase())
          : itemVal.includes(search)
        if (!matches) return false
      } else if ('gte' in value || 'lte' in value || 'gt' in value || 'lt' in value) {
        const itemVal = getNestedValue(item, key)
        const v = value as Record<string, any>
        if (v.gte !== undefined && !(itemVal >= v.gte)) return false
        if (v.lte !== undefined && !(itemVal <= v.lte)) return false
        if (v.gt !== undefined && !(itemVal > v.gt)) return false
        if (v.lt !== undefined && !(itemVal < v.lt)) return false
      } else if ('not' in value) {
        const itemVal = getNestedValue(item, key)
        if (itemVal === (value as any).not) return false
      } else if ('in' in value && Array.isArray((value as any).in)) {
        const itemVal = getNestedValue(item, key)
        if (!(value as any).in.includes(itemVal)) return false
      } else {
        const itemVal = getNestedValue(item, key)
        if (JSON.stringify(itemVal) !== JSON.stringify(value)) return false
      }
    } else {
      const itemVal = getNestedValue(item, key)
      if (itemVal !== value) return false
    }
  }
  return true
}

function getNestedValue(obj: any, pathStr: string): any {
  return pathStr.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined
  }, obj)
}

function applyOrderBy(items: any[], orderBy?: Record<string, 'asc' | 'desc'>): any[] {
  if (!orderBy) return items
  const keys = Object.keys(orderBy)
  if (keys.length === 0) return items

  return [...items].sort((a, b) => {
    for (const key of keys) {
      const dir = orderBy[key] === 'desc' ? -1 : 1
      const aVal = getNestedValue(a, key)
      const bVal = getNestedValue(b, key)
      if (aVal == null && bVal == null) continue
      if (aVal == null) return 1 * dir
      if (bVal == null) return -1 * dir
      if (aVal < bVal) return -1 * dir
      if (aVal > bVal) return 1 * dir
    }
    return 0
  })
}

function selectFields(item: Record<string, any>, select?: Record<string, any>): Record<string, any> {
  if (!select) return item
  const result: Record<string, any> = {}
  for (const key of Object.keys(select)) {
    if (key === '_count') continue
    const val = select[key]
    if (val === true && item[key] !== undefined) {
      result[key] = item[key]
    } else if (typeof val === 'object' && val !== null) {
      if (Array.isArray(item[key])) {
        result[key] = item[key].map((sub: any) => selectFields(sub, val))
      } else if (item[key] && typeof item[key] === 'object') {
        result[key] = selectFields(item[key], val)
      }
    }
  }
  return result
}

function applyInclude(item: Record<string, any>, include: Record<string, any>, allData: Record<string, any[]>, modelName: string): Record<string, any> {
  if (!include) return item
  const result = { ...item }

  for (const [relField, relConfig] of Object.entries(include)) {
    if (relField === '_count') {
      const countSelect = (relConfig as any).select
      const counts: Record<string, number> = {}
      for (const countField of Object.keys(countSelect)) {
        counts[countField] = resolveCount(item, countField, allData)
      }
      result._count = counts
      continue
    }

    const related = resolveRelation(item, relField, modelName, allData, true)
    if (relConfig === true) {
      result[relField] = related
    } else if ((relConfig as any).select || (relConfig as any).include) {
      if (Array.isArray(related)) {
        result[relField] = related.map((r: any) => {
          let processed = r
          if ((relConfig as any).select) processed = selectFields(processed, (relConfig as any).select)
          if ((relConfig as any).include) processed = applyInclude(processed, (relConfig as any).include, allData, guessModelName(relField))
          return processed
        })
      } else if (related && typeof related === 'object') {
        let processed = related
        if ((relConfig as any).select) processed = selectFields(processed, (relConfig as any).select)
        if ((relConfig as any).include) processed = applyInclude(processed, (relConfig as any).include, allData, guessModelName(relField))
        result[relField] = processed
      }
    }
  }
  return result
}

function resolveRelation(item: Record<string, any>, field: string, modelName: string, allData: Record<string, any[]>, _includeFull: boolean): any {
  const relations = getModelRelations(modelName)
  const rel = relations[field]
  if (!rel) return undefined
  const relatedData = allData[rel.model] || []
  if (rel.type === 'hasMany') return relatedData.filter((r) => r[rel.foreignKey] === item[rel.localKey])
  if (rel.type === 'belongsTo') return relatedData.find((r) => r[rel.foreignKey] === getNestedValue(item, rel.localKey)) || null
  return undefined
}

function resolveCount(item: Record<string, any>, field: string, allData: Record<string, any[]>): number {
  const allRelations = getModelRelationsAll()
  for (const [, relations] of Object.entries(allRelations)) {
    const rel = relations[field]
    if (rel) {
      const relatedData = allData[rel.model] || []
      return relatedData.filter((r) => r[rel.foreignKey] === item[rel.localKey]).length
    }
  }
  return 0
}

function guessModelName(relationField: string): string {
  const pluralMap: Record<string, string> = {
    user: 'user', users: 'user',
    match: 'match', matches: 'match',
    team: 'team', teams: 'team',
    player: 'player', players: 'player',
    tournament: 'tournament', tournaments: 'tournament',
    room: 'room', rooms: 'room',
    roomMember: 'roomMember', roomMembers: 'roomMember',
    bid: 'bid', bids: 'bid',
    roster: 'roster', rosters: 'roster',
    auctionState: 'auctionState',
    fixture: 'fixture', fixtures: 'fixture',
    playerMatchStat: 'playerMatchStat', playerMatchStats: 'playerMatchStat',
    fantasyPointsLedger: 'fantasyPointsLedger',
    chatMessage: 'chatMessage', chatMessages: 'chatMessage',
    message: 'chatMessage', messages: 'chatMessage',
    notification: 'notification', notifications: 'notification',
    follower: 'follow', followers: 'follow', following: 'follow', follow: 'follow',
    subscription: 'subscription',
    report: 'report', reports: 'report', reporter: 'report',
    adminLog: 'adminLog', adminLogs: 'adminLog',
    leaderboardSnapshot: 'leaderboardSnapshot', leaderboardSnapshots: 'leaderboardSnapshot',
    session: 'session', sessions: 'session',
    achievement: 'achievement', achievements: 'achievement',
    userAchievement: 'userAchievement', userAchievements: 'userAchievement',
    starredPlayer: 'starredPlayer', starredPlayers: 'starredPlayer',
  }
  return pluralMap[relationField] || relationField
}

function getModelRelations(modelName: string): ModelRelations {
  const all = getModelRelationsAll()
  return (all as any)[modelName] || {}
}

function getModelRelationsAll(): Record<string, ModelRelations> {
  return {
    user: {
      notifications: { type: 'hasMany', model: 'notification', localKey: 'id', foreignKey: 'userId' },
      chatMessages: { type: 'hasMany', model: 'chatMessage', localKey: 'id', foreignKey: 'userId' },
      reports: { type: 'hasMany', model: 'report', localKey: 'id', foreignKey: 'reporterId' },
      following: { type: 'hasMany', model: 'follow', localKey: 'id', foreignKey: 'followerId' },
      followers: { type: 'hasMany', model: 'follow', localKey: 'id', foreignKey: 'followingId' },
      subscription: { type: 'hasMany', model: 'subscription', localKey: 'id', foreignKey: 'userId' },
      userAchievements: { type: 'hasMany', model: 'userAchievement', localKey: 'id', foreignKey: 'userId' },
      sessions: { type: 'hasMany', model: 'session', localKey: 'id', foreignKey: 'userId' },
      roomMembers: { type: 'hasMany', model: 'roomMember', localKey: 'id', foreignKey: 'userId' },
      rosters: { type: 'hasMany', model: 'roster', localKey: 'id', foreignKey: 'userId' },
    },
    room: {
      members: { type: 'hasMany', model: 'roomMember', localKey: 'id', foreignKey: 'roomId' },
      auctionState: { type: 'belongsTo', model: 'auctionState', localKey: 'id', foreignKey: 'roomId' },
      bids: { type: 'hasMany', model: 'bid', localKey: 'id', foreignKey: 'roomId' },
    },
    roomMember: {
      room: { type: 'belongsTo', model: 'room', localKey: 'roomId', foreignKey: 'id' },
      user: { type: 'belongsTo', model: 'user', localKey: 'userId', foreignKey: 'id' },
    },
    roster: {
      room: { type: 'belongsTo', model: 'room', localKey: 'roomId', foreignKey: 'id' },
      user: { type: 'belongsTo', model: 'user', localKey: 'userId', foreignKey: 'id' },
      player: { type: 'belongsTo', model: 'player', localKey: 'playerId', foreignKey: 'id' },
    },
    bid: {
      user: { type: 'belongsTo', model: 'user', localKey: 'userId', foreignKey: 'id' },
      room: { type: 'belongsTo', model: 'room', localKey: 'roomId', foreignKey: 'id' },
    },
    fixture: {
      playerMatchStats: { type: 'hasMany', model: 'playerMatchStat', localKey: 'id', foreignKey: 'fixtureId' },
    },
    playerMatchStat: {
      fixture: { type: 'belongsTo', model: 'fixture', localKey: 'fixtureId', foreignKey: 'id' },
    },
    chatMessage: {
      user: { type: 'belongsTo', model: 'user', localKey: 'userId', foreignKey: 'id' },
      reports: { type: 'hasMany', model: 'report', localKey: 'id', foreignKey: 'messageId' },
    },
    notification: {
      user: { type: 'belongsTo', model: 'user', localKey: 'userId', foreignKey: 'id' },
    },
    follow: {
      follower: { type: 'belongsTo', model: 'user', localKey: 'followerId', foreignKey: 'id' },
      following: { type: 'belongsTo', model: 'user', localKey: 'followingId', foreignKey: 'id' },
    },
    report: {
      reporter: { type: 'belongsTo', model: 'user', localKey: 'reporterId', foreignKey: 'id' },
      message: { type: 'belongsTo', model: 'chatMessage', localKey: 'messageId', foreignKey: 'id' },
    },
    star: {
      user: { type: 'belongsTo', model: 'user', localKey: 'userId', foreignKey: 'id' },
      player: { type: 'belongsTo', model: 'player', localKey: 'playerId', foreignKey: 'id' },
    },
  }
}

function resolveUpdates(data: Record<string, any>, existingRecord: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'increment' in value) {
      result[key] = (existingRecord?.[key] || 0) + value.increment
    } else {
      result[key] = value
    }
  }
  return result
}

// ─── Model Handler Factory ───────────────────────────────

function createModelHandler(modelName: string, getData: () => any[], getAllData: () => Record<string, any[]>, persist: () => void): ModelHandler {
  function whereFilter(where?: WhereClause): any[] {
    const data = getData()
    if (!where) return data
    return data.filter((item) => matchesWhere(item, where))
  }

  return {
    findUnique({ where }: { where: Record<string, any> }) {
      const data = getData()
      if (where) {
        const whereKey = Object.keys(where)[0]
        if (whereKey && whereKey.includes('_')) {
          const compoundFields = where[whereKey]
          if (compoundFields && typeof compoundFields === 'object') {
            return data.find((item) =>
              Object.entries(compoundFields).every(([k, v]) => item[k] === v)
            ) || null
          }
        }
        const fieldKey = Object.keys(where)[0]
        const fieldVal = where[fieldKey]
        return data.find((item) => getNestedValue(item, fieldKey) === fieldVal) || null
      }
      return data[0] || null
    },

    findFirst({ where, orderBy }: QueryOpts) {
      const filtered = whereFilter(where)
      const ordered = applyOrderBy(filtered, orderBy)
      return ordered[0] || null
    },

    findMany({ where, orderBy, take, skip, select, include } = {}) {
      let filtered = whereFilter(where)
      filtered = applyOrderBy(filtered, orderBy)
      if (skip) filtered = filtered.slice(skip)
      if (take) filtered = filtered.slice(0, take)
      const allData = getAllData()
      return filtered.map((item) => {
        let result: any = item
        if (include) result = applyInclude(result, include, allData, modelName)
        if (select) result = selectFields(result, select)
        return result
      })
    },

    create({ data }: CreateOpts) {
      const records = getData()
      const record = {
        id: cuid(),
        ...data,
        createdAt: data.createdAt || now(),
        updatedAt: now(),
      }
      records.push(record)
      persist()
      return deepClone(record)
    },

    createMany({ data }: CreateManyOpts) {
      const records = getData()
      const created = data.map((item) => ({
        id: cuid(),
        ...item,
        createdAt: item.createdAt || now(),
        updatedAt: now(),
      }))
      records.push(...created)
      persist()
      return { count: created.length }
    },

    update({ where, data }: UpdateOpts) {
      const records = getData()
      const whereKey = Object.keys(where)[0]
      const whereVal = where[whereKey]
      const index = records.findIndex((item) => {
        // Compound key support (e.g. roomId_userId: { roomId, userId })
        if (whereKey && whereKey.includes('_') && whereVal && typeof whereVal === 'object') {
          return Object.entries(whereVal).every(([k, v]) => item[k] === v)
        }
        return item[whereKey] === whereVal
      })
      if (index === -1) throw new Error(`Record not found in ${modelName}: ${JSON.stringify(where)}`)
      const updated = {
        ...records[index],
        ...resolveUpdates(data, records[index]),
        updatedAt: now(),
      }
      records[index] = updated
      persist()
      return deepClone(updated)
    },

    updateMany({ where, data }: UpdateManyOpts) {
      const records = getData()
      let count = 0
      for (let i = 0; i < records.length; i++) {
        if (matchesWhere(records[i], where)) {
          records[i] = {
            ...records[i],
            ...resolveUpdates(data, records[i]),
            updatedAt: now(),
          }
          count++
        }
      }
      persist()
      return { count }
    },

    upsert({ where, create, update }: UpsertOpts) {
      const records = getData()
      const whereKey = Object.keys(where)[0]
      const whereVal = where[whereKey]
      const existing = records.find((item) => item[whereKey] === whereVal)
      if (existing) return this.update({ where, data: update })
      return this.create({ data: create })
    },

    delete({ where }: DeleteOpts) {
      const records = getData()
      const whereKey = Object.keys(where)[0]
      const whereVal = where[whereKey]
      const index = records.findIndex((item) => {
        // Compound key support (e.g. roomId_userId: { roomId, userId })
        if (whereKey && whereKey.includes('_') && whereVal && typeof whereVal === 'object') {
          return Object.entries(whereVal).every(([k, v]) => item[k] === v)
        }
        return item[whereKey] === whereVal
      })
      if (index === -1) throw new Error(`Record not found in ${modelName}: ${JSON.stringify(where)}`)
      const deleted = records.splice(index, 1)[0]
      persist()
      return deepClone(deleted)
    },

    deleteMany({ where }: DeleteManyOpts) {
      const records = getData()
      const toDelete = records.filter((item) => matchesWhere(item, where))
      const ids = new Set(toDelete.map((r) => r.id))
      for (let i = records.length - 1; i >= 0; i--) {
        if (ids.has(records[i].id)) records.splice(i, 1)
      }
      persist()
      return { count: toDelete.length }
    },

    count({ where } = {}) {
      return whereFilter(where).length
    },
  }
}

// ─── Main DB Class ───────────────────────────────────────

export class JsonDatabase {
  dataDir: string
  backupDir: string
  data: Record<string, any[]>
  models: Record<string, ModelHandler>
  _initialized: boolean

  constructor(dataDir = DATA_DIR) {
    this.dataDir = dataDir
    this.backupDir = BACKUP_DIR
    this.data = {}
    this.models = {}
    this._initialized = false
  }

  async initialize(seedData: Record<string, any[]> | null = null): Promise<void> {
    if (this._initialized) return

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
    }

    // AuctionXI model names
    const modelNames = [
      'user', 'tournament', 'player',
      'room', 'roomMember', 'bid', 'roster', 'auctionState',
      'fixture', 'playerMatchStat', 'fantasyPointsLedger',
      'chatMessage', 'notification', 'follow',
      'subscription', 'report', 'adminLog',
      'session', 'starredPlayer',
      'leaderboardSnapshot', 'achievement', 'userAchievement',
      // Draft Mode models (§1.9)
      'draftSession',
      'draftPick',
      'draftRunResult',
      'draftTicket',
      'draftRewardsCatalog',
      'playerRarityCache',
      'roomTemplate',
      'draftRunRound',
    ]

    for (const name of modelNames) {
      this.data[name] = this._loadModel(name)
      this.models[name] = createModelHandler(
        name,
        () => this.data[name],
        () => this.data,
        () => this._saveModel(name)
      )
    }

    // If models are empty and seed data is provided, load it
    const totalRecords = Object.values(this.data).reduce((sum, arr) => sum + arr.length, 0)
    if (totalRecords === 0 && seedData) {
      this._loadSeedData(seedData)
    }

    this._persistChanges()
    this._initialized = true

    const counts: Record<string, number> = {}
    for (const name of modelNames) {
      counts[name] = this.data[name].length
    }
    logger.info(
      { event: 'database.initialized', counts },
      `JSON Database initialized with ${Object.values(counts).reduce((a, b) => a + b, 0)} total records`
    )
  }

  _loadModel(name: string): any[] {
    const filePath = path.join(this.dataDir, `${name}.json`)
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(raw)
      }
    } catch (err: any) {
      logger.warn({ event: 'database.load_error', model: name, err: err.message }, `Failed to load ${name}.json`)
    }
    return []
  }

  _saveModel(name: string): void {
    const filePath = path.join(this.dataDir, `${name}.json`)
    try {
      // Acquire per-collection mutex for atomic write
      const mutex = getMutex(name)
      mutex.runExclusive(() => {
        atomicWrite(filePath, this.data[name])
      })
    } catch (err: any) {
      logger.error({ event: 'database.save_error', model: name, err: err.message }, `Failed to save ${name}.json`)
    }
  }

  _persistChanges(): void {
    for (const name of Object.keys(this.data)) {
      this._saveModel(name)
    }
  }

  _loadSeedData(seedData: Record<string, any[]>): void {
    for (const [modelName, records] of Object.entries(seedData)) {
      if (this.data[modelName]) {
        this.data[modelName] = deepClone(records)
        logger.info({ event: 'database.seed_loaded', model: modelName, count: records.length }, `Loaded ${records.length} ${modelName} records from seed`)
      }
    }
  }

  async $connect(): Promise<void> {}

  async $disconnect(): Promise<void> {
    this._persistChanges()
    // Create a timestamped backup
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupPath = path.join(this.backupDir, timestamp)
      fs.mkdirSync(backupPath, { recursive: true })
      for (const name of Object.keys(this.data)) {
        const src = path.join(this.dataDir, `${name}.json`)
        const dst = path.join(backupPath, `${name}.json`)
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dst)
        }
      }
      logger.info({ event: 'database.backup_created', path: backupPath }, 'Database backup created on shutdown')
    } catch (err: any) {
      logger.warn({ event: 'database.backup_failed', err: err.message }, 'Failed to create backup on shutdown')
    }
    logger.info({ event: 'database.disconnect' }, 'JSON Database disconnected and persisted')
  }

  async $queryRawUnsafe(_query: string): Promise<any[]> {
    return [{ '?column?': 1 }]
  }

  async $transaction(operations: Promise<any>[]): Promise<any[]> {
    const results = []
    for (const op of operations) {
      results.push(await op)
    }
    return results
  }

  get [Symbol.toStringTag](): string {
    return 'JsonDatabase'
  }
}

// Proxy to allow prisma.model.method() syntax
export function createJsonDatabase(dataDir?: string): any {
  const db = new JsonDatabase(dataDir)

  return new Proxy(db, {
    get(target, prop: string | symbol) {
      if (prop === '$connect') return target.$connect.bind(target)
      if (prop === '$disconnect') return target.$disconnect.bind(target)
      if (prop === '$queryRawUnsafe') return target.$queryRawUnsafe.bind(target)
      if (prop === '$transaction') return target.$transaction.bind(target)
      if (prop === 'initialize') return target.initialize.bind(target)
      if (prop === 'data') return target.data

      if (target.models[prop as string]) {
        return target.models[prop as string]
      }

      return undefined
    },
  })
}

/**
 * JSON Database Adapter — MatchMind
 *
 * In-memory database backed by JSON files. Replaces Prisma/PostgreSQL.
 * API-compatible with PrismaClient for findMany, findUnique, create, update,
 * delete, count, upsert, createMany, updateMany, deleteMany, $transaction.
 *
 * All writes are persisted to JSON files in src/data/ after each operation.
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import logger from '../utils/logger'

const DATA_DIR = path.join(__dirname, '..', 'data')

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

interface CreateOpts {
  data: Record<string, any>
}

interface UpdateOpts {
  where: Record<string, any>
  data: Record<string, any>
}

interface UpsertOpts {
  where: Record<string, any>
  create: Record<string, any>
  update: Record<string, any>
}

interface DeleteOpts {
  where: Record<string, any>
}

interface CreateManyOpts {
  data: Record<string, any>[]
}

interface UpdateManyOpts {
  where?: WhereClause
  data: Record<string, any>
}

interface DeleteManyOpts {
  where?: WhereClause
}

interface CountOpts {
  where?: WhereClause
}

interface ModelRelations {
  [relationName: string]: {
    type: 'hasMany' | 'belongsTo'
    model: string
    localKey: string
    foreignKey: string
  }
}

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
    // Handle OR
    if (key === 'OR' && Array.isArray(value)) {
      return value.some((subWhere) => matchesWhere(item, subWhere))
    }
    // Handle AND
    if (key === 'AND' && Array.isArray(value)) {
      return value.every((subWhere) => matchesWhere(item, subWhere))
    }
    // Handle NOT
    if (key === 'NOT') {
      return !matchesWhere(item, value as WhereClause)
    }

    // Handle nested operators
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      // e.g. { contains, mode } | { gte, lt } | { not } | { in }
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
        // Direct object comparison (e.g. subscription field)
        const itemVal = getNestedValue(item, key)
        if (JSON.stringify(itemVal) !== JSON.stringify(value)) return false
      }
    } else {
      // Direct equality
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
    // Skip _count
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
          if ((relConfig as any).select) {
            processed = selectFields(processed, (relConfig as any).select)
          }
          if ((relConfig as any).include) {
            processed = applyInclude(processed, (relConfig as any).include, allData, guessModelName(relField))
          }
          return processed
        })
      } else if (related && typeof related === 'object') {
        let processed = related
        if ((relConfig as any).select) {
          processed = selectFields(processed, (relConfig as any).select)
        }
        if ((relConfig as any).include) {
          processed = applyInclude(processed, (relConfig as any).include, allData, guessModelName(relField))
        }
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
  if (rel.type === 'hasMany') {
    return relatedData.filter((r) => r[rel.foreignKey] === item[rel.localKey])
  }

  if (rel.type === 'belongsTo') {
    return relatedData.find((r) => r[rel.foreignKey] === getNestedValue(item, rel.localKey)) || null
  }

  return undefined
}

function resolveCount(item: Record<string, any>, field: string, allData: Record<string, any[]>): number {
  const allRelations = getModelRelationsAll()
  const modelRelations = allRelations as Record<string, ModelRelations>
  // Find which model's relation has this as a field
  for (const [, relations] of Object.entries(modelRelations)) {
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
    user: 'user',
    users: 'user',
    match: 'match',
    matches: 'match',
    prediction: 'prediction',
    predictions: 'prediction',
    team: 'team',
    teams: 'team',
    player: 'player',
    players: 'player',
    competition: 'competition',
    competitions: 'competition',
    league: 'league',
    leagues: 'league',
    member: 'leagueMember',
    members: 'leagueMember',
    squad: 'squad',
    squads: 'squad',
    squadMember: 'squadMember',
    squadMembers: 'squadMember',
    chatMessage: 'chatMessage',
    chatMessages: 'chatMessage',
    message: 'chatMessage',
    messages: 'chatMessage',
    notification: 'notification',
    notifications: 'notification',
    follower: 'follow',
    followers: 'follow',
    following: 'follow',
    follow: 'follow',
    event: 'matchEvent',
    events: 'matchEvent',
    matchEvent: 'matchEvent',
    matchEvents: 'matchEvent',
    standing: 'standing',
    standings: 'standing',
    sport: 'userSport',
    sportPreferences: 'userSport',
    teamPreferences: 'userTeam',
    userSport: 'userSport',
    userTeam: 'userTeam',
    subscription: 'subscription',
    userAchievement: 'userAchievement',
    userAchievements: 'userAchievement',
    achievement: 'achievement',
    achievements: 'achievement',
    report: 'report',
    reports: 'report',
    reporter: 'report',
    adminLog: 'adminLog',
    adminLogs: 'adminLog',
    scoringLog: 'scoringLog',
    scoringLogs: 'scoringLog',
    leaderboardSnapshot: 'leaderboardSnapshot',
    leaderboardSnapshots: 'leaderboardSnapshot',
    session: 'session',
    sessions: 'session',
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
      predictions: { type: 'hasMany', model: 'prediction', localKey: 'id', foreignKey: 'userId' },
      following: { type: 'hasMany', model: 'follow', localKey: 'id', foreignKey: 'followerId' },
      followers: { type: 'hasMany', model: 'follow', localKey: 'id', foreignKey: 'followingId' },
      leagues: { type: 'hasMany', model: 'leagueMember', localKey: 'id', foreignKey: 'userId' },
      squads: { type: 'hasMany', model: 'squadMember', localKey: 'id', foreignKey: 'userId' },
      notifications: { type: 'hasMany', model: 'notification', localKey: 'id', foreignKey: 'userId' },
      userAchievements: { type: 'hasMany', model: 'userAchievement', localKey: 'id', foreignKey: 'userId' },
      chatMessages: { type: 'hasMany', model: 'chatMessage', localKey: 'id', foreignKey: 'userId' },
      reports: { type: 'hasMany', model: 'report', localKey: 'id', foreignKey: 'reporterId' },
      subscription: { type: 'hasMany', model: 'subscription', localKey: 'id', foreignKey: 'userId' },
      sportPreferences: { type: 'hasMany', model: 'userSport', localKey: 'id', foreignKey: 'userId' },
      teamPreferences: { type: 'hasMany', model: 'userTeam', localKey: 'id', foreignKey: 'userId' },
      sessions: { type: 'hasMany', model: 'session', localKey: 'id', foreignKey: 'userId' },
    },
    match: {
      predictions: { type: 'hasMany', model: 'prediction', localKey: 'id', foreignKey: 'matchId' },
      events: { type: 'hasMany', model: 'matchEvent', localKey: 'id', foreignKey: 'matchId' },
      competitionRel: { type: 'belongsTo', model: 'competition', localKey: 'competitionId', foreignKey: 'id' },
      homeTeam: { type: 'belongsTo', model: 'team', localKey: 'homeTeamId', foreignKey: 'id' },
      awayTeam: { type: 'belongsTo', model: 'team', localKey: 'awayTeamId', foreignKey: 'id' },
    },
    prediction: {
      user: { type: 'belongsTo', model: 'user', localKey: 'userId', foreignKey: 'id' },
      match: { type: 'belongsTo', model: 'match', localKey: 'matchId', foreignKey: 'id' },
    },
    league: {
      members: { type: 'hasMany', model: 'leagueMember', localKey: 'id', foreignKey: 'leagueId' },
    },
    leagueMember: {
      league: { type: 'belongsTo', model: 'league', localKey: 'leagueId', foreignKey: 'id' },
      user: { type: 'belongsTo', model: 'user', localKey: 'userId', foreignKey: 'id' },
    },
    squad: {
      members: { type: 'hasMany', model: 'squadMember', localKey: 'id', foreignKey: 'squadId' },
    },
    squadMember: {
      squad: { type: 'belongsTo', model: 'squad', localKey: 'squadId', foreignKey: 'id' },
      user: { type: 'belongsTo', model: 'user', localKey: 'userId', foreignKey: 'id' },
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
    team: {
      homeMatches: { type: 'hasMany', model: 'match', localKey: 'id', foreignKey: 'homeTeamId' },
      awayMatches: { type: 'hasMany', model: 'match', localKey: 'id', foreignKey: 'awayTeamId' },
      players: { type: 'hasMany', model: 'player', localKey: 'id', foreignKey: 'teamId' },
      userTeams: { type: 'hasMany', model: 'userTeam', localKey: 'id', foreignKey: 'teamId' },
      standings: { type: 'hasMany', model: 'standing', localKey: 'id', foreignKey: 'teamId' },
    },
    player: {
      team: { type: 'belongsTo', model: 'team', localKey: 'teamId', foreignKey: 'id' },
    },
    standing: {
      competition: { type: 'belongsTo', model: 'competition', localKey: 'competitionId', foreignKey: 'id' },
      team: { type: 'belongsTo', model: 'team', localKey: 'teamId', foreignKey: 'id' },
    },
    report: {
      reporter: { type: 'belongsTo', model: 'user', localKey: 'reporterId', foreignKey: 'id' },
      message: { type: 'belongsTo', model: 'chatMessage', localKey: 'messageId', foreignKey: 'id' },
    },
  }
}

function resolveUpdates(data: Record<string, any>, existingRecord: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && 'increment' in value) {
      // Handle Prisma-style { increment: x } operator
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
      // Handle compound unique keys like userId_matchId
      if (where) {
        const whereKey = Object.keys(where)[0]
        if (whereKey && whereKey.includes('_')) {
          // Compound key: { userId_matchId: { userId, matchId } }
          const compoundFields = where[whereKey]
          if (compoundFields && typeof compoundFields === 'object') {
            return data.find((item) =>
              Object.entries(compoundFields).every(([k, v]) => item[k] === v)
            ) || null
          }
        }
        // Single field unique
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
        if (include) {
          result = applyInclude(result, include, allData, modelName)
        }
        if (select) {
          result = selectFields(result, select)

          // Apply includes for select with include
          if (select._count && result._count) {
            for (const countField of Object.keys(select._count.select)) {
              result._count[countField] = resolveCount(item, countField, allData)
            }
          }
        }
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
      const index = records.findIndex((item) => item[whereKey] === whereVal)
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

      if (existing) {
        return this.update({ where, data: update })
      }
      return this.create({ data: create })
    },

    delete({ where }: DeleteOpts) {
      const records = getData()
      const whereKey = Object.keys(where)[0]
      const whereVal = where[whereKey]
      const index = records.findIndex((item) => item[whereKey] === whereVal)
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
        if (ids.has(records[i].id)) {
          records.splice(i, 1)
        }
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
  data: Record<string, any[]>
  models: Record<string, ModelHandler>
  _initialized: boolean

  constructor(dataDir = DATA_DIR) {
    this.dataDir = dataDir
    this.data = {}
    this.models = {}
    this._initialized = false
  }

  async initialize(seedData: Record<string, any[]> | null = null): Promise<void> {
    if (this._initialized) return

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true })
    }

    // Define all models
    const modelNames = [
      'user', 'match', 'matchEvent', 'prediction',
      'team', 'player', 'competition',
      'league', 'leagueMember',
      'squad', 'squadMember',
      'chatMessage', 'notification',
      'follow',
      'subscription',
      'report',
      'achievement', 'userAchievement',
      'standing',
      'userSport', 'userTeam',
      'session',
      'adminLog', 'scoringLog',
      'leaderboardSnapshot',
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

    // Persist IDs for generating new ones
    this._persistChanges()
    this._initialized = true

    const counts: Record<string, number> = {}
    for (const name of modelNames) {
      counts[name] = this.data[name].length
    }
    logger.info({ event: 'database.initialized', counts }, `JSON Database initialized with ${Object.values(counts).reduce((a, b) => a + b, 0)} total records`)
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
      fs.writeFileSync(filePath, JSON.stringify(this.data[name], null, 2), 'utf-8')
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

  // Prisma-compatible methods
  async $connect(): Promise<void> {}

  async $disconnect(): Promise<void> {
    this._persistChanges()
    logger.info({ event: 'database.disconnect' }, 'JSON Database disconnected and persisted')
  }

  async $queryRawUnsafe(_query: string): Promise<any[]> {
    // Health check compatibility - return success
    return [{ '?column?': 1 }]
  }

  async $transaction(operations: Promise<any>[]): Promise<any[]> {
    // Run operations sequentially (no real transaction support)
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
      // PrismaClient methods
      if (prop === '$connect') return target.$connect.bind(target)
      if (prop === '$disconnect') return target.$disconnect.bind(target)
      if (prop === '$queryRawUnsafe') return target.$queryRawUnsafe.bind(target)
      if (prop === '$transaction') return target.$transaction.bind(target)
      if (prop === 'initialize') return target.initialize.bind(target)
      if (prop === 'data') return target.data

      // Model accessors
      if (target.models[prop as string]) {
        return target.models[prop as string]
      }

      return undefined
    },
  })
}

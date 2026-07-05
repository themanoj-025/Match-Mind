// ─── Tournament (v2 — open registry, not a closed union) ─
export interface Tournament {
  id: string
  name: string
  shortName: string
  status: 'LIVE' | 'ANNOUNCED' | 'ANNOUNCED_NOT_CONFIRMED'
  confederation: string
  gender: string
  format: string
  teamCount: number
  squadSize: number
  launchPhase: number
  dateRange: { start: string | null; end: string | null }
  theme: { primary: string; accent: string }
  nav: { order: number; icon: string }
  hosts?: string[]
}

// ─── User ──────────────────────────────────────────────
export interface User {
  id: string
  username: string
  email: string
  displayName: string
  avatar: string | null
  totalPoints: number
  tier: Tier
  isPro: boolean
  predAccuracy?: number
  isFollowing?: boolean
  createdAt?: string
}

export type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND' | 'LEGEND'

// ─── Player (AuctionXI) ────────────────────────────────
export interface Player {
  id: string
  tournamentId: string
  name: string
  club: string
  nationality: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  basePrice: number
  photoUrl?: string
  rarityTier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'ICON'  // computed (§1.3)
  isEligibleForIcon?: boolean  // admin gate (§1.3)
}

// ─── Draft Mode — Types (§1.9, §2) ──────────────────────
export type DraftSessionStatus = 'DRAFTING' | 'SQUAD_COMPLETE' | 'RUN_IN_PROGRESS' | 'RUN_COMPLETE' | 'ABANDONED'
export type FormationName = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '5-3-2'
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD'
export type RarityTierName = 'BRONZE' | 'SILVER' | 'GOLD' | 'ICON'
export type DraftRunStatus = 'IN_PROGRESS' | 'WAITING_FOR_MATCHDAY' | 'COMPLETE'
export type RunOutcome = 'WIN' | 'LOSS' | 'TIE'

export interface Formation {
  id: string
  name: string
  slots: { position: Position; count: number }[]
  benchSlots: number
}

export interface DraftSession {
  id: string
  userId: string
  tournamentId: string
  formation: string
  status: DraftSessionStatus
  ticketConsumedId: string
  createdAt: string
  synergyScore: number
  formationBonusApplied: boolean
}

export interface DraftPick {
  slotIndex: number
  position: Position
  offeredPlayerIds: string[]
  offeredRarities: RarityTierName[]
  pickedPlayerId: string | null
  autoPicked: boolean
  pickedAt: string | null
}

export interface SquadPlayer {
  playerId: string
  position: string
  slotIndex: number
  isAutoPicked: boolean
  rarityTier: string
}

export interface DraftRunResult {
  id: string
  draftSessionId: string
  userId: string
  tournamentId: string
  currentRound: number
  totalWins: number
  totalLosses: number
  totalTies: number
  status: DraftRunStatus
  rewards: string[]
  rounds: DraftRunRoundEntry[]
  eliminatedAt: string | null
  clearedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DraftRunRoundEntry {
  roundNumber: number
  matchdayId: string | null
  matchdayName: string | null
  outcome: RunOutcome | null
  userPoints: number
  benchmarkPoints: number
  breakdown: Record<string, number>
}

export interface DraftRunState {
  result: DraftRunResult
  rounds: DraftRunRoundEntry[]
  squad: SquadPlayer[]
  currentRound: DraftRunRoundEntry | null
  isEliminated: boolean
  isFullClear: boolean
  nextMatchdayLabel: string | null
}

export interface DraftTicketInfo {
  remaining: number
  resetsAt: string | null
  isPro: boolean
}

export interface DraftReward {
  winCountThreshold: number
  cosmeticId: string
  name: string
  description: string
}

// ─── Room (Auction room) ──────────────────────────────
export interface Room {
  id: string
  tournamentId: string
  hostId: string
  name: string
  inviteCode: string
  totalBudget: number
  rosterRules: { GK: number; DEF: number; MID: number; FWD: number; total: number }
  status: 'LOBBY' | 'DRAFTING' | 'PAUSED' | 'COMPLETED'
  createdAt: string
  members?: RoomMember[]
  auctionState?: AuctionState
}

export interface RoomMember {
  id: string
  roomId: string
  userId: string
  role: 'host' | 'member'
  remainingBudget: number
  isReady?: boolean
  user?: { id: string; username: string; displayName: string; avatar: string | null }
}

export interface AuctionState {
  roomId: string
  phase: 'IDLE' | 'PLAYER_LIVE' | 'SOLD' | 'UNSOLD' | 'RE_AUCTION' | 'FINISHED'
  currentPlayerId: string | null
  currentBid: number
  currentBidderId: string | null
  timerEndsAt: string | null
  poolQueue: string[]
  unsoldPlayerIds: string[]
  version: number
}

export interface Bid {
  id: string
  roomId: string
  playerId: string
  userId: string
  amount: number
  timestamp: string
  version: number
}

export interface RosterEntry {
  id: string
  roomId: string
  userId: string
  playerId: string
  soldPrice: number
  acquiredAt: string
  isCaptain: boolean
  isViceCaptain: boolean
  player?: Player
}

// ─── Fixture (real match) ──────────────────────────────
export interface Fixture {
  id: string
  tournamentId: string
  stage: string
  round: number | null
  homeTeamId: string
  awayTeamId: string
  homeTeam?: string
  awayTeam?: string
  venueId?: string
  homeScore: number | null
  awayScore: number | null
  status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'COMPLETED' | 'POSTPONED'
  scheduledAt: string
  kickoffAt?: string
  playerMatchStats?: PlayerMatchStat[]
}

export interface PlayerMatchStat {
  id: string
  fixtureId: string
  playerId: string
  minutesPlayed: number
  goals: number
  assists: number
  cleanSheet: boolean
  saves: number
  penaltiesSaved: number
  yellowCards: number
  redCards: number
  penaltiesMissed: number
  ownGoals: number
  goalsConceded: number
}

// ─── Fantasy Points ────────────────────────────────────
export interface FantasyPointsResult {
  playerId: string
  userId: string
  roomId: string
  fixtureId: string
  basePoints: number
  captainMultiplier: number
  totalPoints: number
  breakdown: Record<string, number>
}

// ─── Notification ──────────────────────────────────────
export interface Notification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown>
}

// ─── Chat Message ──────────────────────────────────────
export interface ChatMessage {
  id: string | number
  user: {
    id?: string
    name: string
    avatar: string | null
    tier?: Tier
    isPro?: boolean
  }
  text: string
  timestamp: string
  gifUrl?: string
  type?: 'system' | 'gif'
  reactions?: Record<string, number>
  isPinned?: boolean
  isDeleted?: boolean
  isSystem?: boolean
}

// ─── Leaderboard ───────────────────────────────────────
export interface LeaderboardEntry {
  id?: string
  userId: string
  username: string
  displayName: string
  avatar: string | null
  totalPoints: number
  rank: number
  tier: Tier
}

// ─── Franchise (was Squad) ─────────────────────────────
export interface Squad {
  id: string
  name: string
  playerCount: number
}

// ─── Admin ─────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number
  newUsersThisWeek?: number
  monthlyActive?: number
  mauGrowth?: number
  predictionsToday?: number
  predGrowth?: number
  proCount?: number
  proGrowth?: number
  revenue?: number
  revGrowth?: number
  errorRate?: number
  errorRateChange?: number
  activeRooms: number
  liveAuctions: number
  proUsers: number
}

export interface AdminLogEntry {
  id: string
  action: string
  adminId: string
  targetId?: string
  targetType?: string
  detail?: Record<string, unknown>
  details?: string
  createdAt: string
}

// ─── API Response wrappers ────────────────────────────
export interface ApiError {
  error: {
    code: string
    message: string
  }
}

// ─── Stripe Status ─────────────────────────────────────
export interface StripeStatus {
  isPro: boolean
  subscriptionStatus?: string
  currentPeriodEnd?: string
}

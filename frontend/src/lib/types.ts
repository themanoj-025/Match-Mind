// ─── Tournament ────────────────────────────────────────
export type TournamentId = 'fifa-wc-2026' | 'uefa-ucl-2026-27'

export interface Tournament {
  id: TournamentId
  name: string
  shortName: string
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED'
  confederation: string
  hosts?: string[]
  theme: { primary: string; accent: string }
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
  tournamentId: TournamentId
  name: string
  club: string
  nationality: string
  position: 'GK' | 'DEF' | 'MID' | 'FWD'
  basePrice: number
  photoUrl?: string
}

// ─── Room (Auction room, replaces League) ──────────────
export interface Room {
  id: string
  tournamentId: TournamentId
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
  tournamentId: TournamentId
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: 'SCHEDULED' | 'LIVE' | 'HALFTIME' | 'COMPLETED'
  scheduledAt: string
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

// ─── Squad (friend group) → Franchise ──────────────────
export interface Squad {
  id: string
  name: string
  playerCount: number
}

// ─── Admin ─────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number
  activeRooms: number
  liveAuctions: number
  proUsers: number
}

export interface AdminLogEntry {
  id: string
  action: string
  adminId: string
  targetId?: string
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

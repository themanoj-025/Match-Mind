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

// ─── Match ─────────────────────────────────────────────
export interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  homeTeamLogo: string | null
  awayTeamLogo: string | null
  homeScore: number | null
  awayScore: number | null
  status: MatchStatus
  minute: number | null
  competition: string
  sport: Sport
  stadium: string | null
  scheduledAt: string | null
  viewersCount?: number
  homeTeamName?: string
  awayTeamName?: string
}

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'SIMULATING' | 'HALFTIME' | 'FINISHED' | 'COMPLETED' | 'FT' | 'scheduled'

export type Sport = 'football' | 'basketball' | 'american_football' | 'tennis' | 'cricket' | 'hockey'

// ─── Team ──────────────────────────────────────────────
export interface Team {
  id: string
  name: string
  logo: string | null
  sport: Sport
}

// ─── Player ────────────────────────────────────────────
export interface Player {
  id: string
  name: string
  team: string
  sport: Sport
  position?: string
  number?: number
}

// ─── Match Stats ───────────────────────────────────────
export interface MatchStats {
  possession: [number, number]
  shots: [number, number]
  shotsOnTarget: [number, number]
  corners: [number, number]
  fouls: [number, number]
  yellowCards: [number, number]
  xg: [number, number]
}

// ─── Lineups ───────────────────────────────────────────
export interface Lineup {
  formation: string
  players: string[]
}

export interface Lineups {
  home: Lineup
  away: Lineup
}

// ─── H2H ───────────────────────────────────────────────
export interface H2HMeeting {
  date: string
  score: string
}

export interface H2H {
  homeWins: number
  draws: number
  awayWins: number
  lastMeetings: H2HMeeting[]
}

// ─── Timeline Event ────────────────────────────────────
export interface TimelineEvent {
  minute: number
  type: 'goal' | 'yellow' | 'red' | 'substitution' | 'penalty'
  team: 'home' | 'away'
  description: string
  scorer?: string
}

// ─── Prediction ────────────────────────────────────────
export interface Prediction {
  id: string
  matchId: string
  userId: string
  homeGoals: number
  awayGoals: number
  firstScorer?: string
  totalGoalsOU?: string
  btts?: boolean
  pointsAwarded?: number
  status?: string
  createdAt?: string
}

export interface CreatePredictionInput {
  matchId: string
  homeGoals: number
  awayGoals: number
  firstScorer?: string
  totalGoalsOU?: string
  btts?: boolean
}

// ─── Leaderboard ───────────────────────────────────────
export interface LeaderboardEntry {
  id?: string
  userId: string
  username: string
  displayName: string
  name?: string
  avatar: string | null
  totalPoints: number
  points?: number
  accuracy?: number
  predAccuracy?: number
  streak?: number
  rank: number
  tier: Tier
}

// ─── League ────────────────────────────────────────────
export interface League {
  id: string
  name: string
  description?: string
  inviteCode?: string
  memberCount: number
  createdAt: string
}

// ─── Squad ─────────────────────────────────────────────
export interface Squad {
  id: string
  name: string
  sport: Sport
  playerCount: number
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

// ─── Admin ─────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number
  totalMatches: number
  totalPredictions: number
  activeUsers: number
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

// ─── Highlight ─────────────────────────────────────────
export interface Highlight {
  id: string
  matchId: string
  title: string
  videoUrl?: string
  thumbnailUrl?: string
  sport: Sport
  createdAt: string
}

// ─── Standings ─────────────────────────────────────────
export interface StandingEntry {
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  points: number
}

// ─── Stripe Status ─────────────────────────────────────
export interface StripeStatus {
  isPro: boolean
  subscriptionStatus?: string
  currentPeriodEnd?: string
}

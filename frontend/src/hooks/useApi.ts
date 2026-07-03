import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import type {
  Match,
  MatchStats,
  Lineups,
  H2H,
  TimelineEvent,
  Prediction,
  CreatePredictionInput,
  LeaderboardEntry,
  League,
  Squad,
  User,
  Notification,
  Highlight,
  AdminStats,
  AdminLogEntry,
  StandingEntry,
  StripeStatus,
  Team,
  Player,
} from '../lib/types'

const API = import.meta.env.VITE_API_URL || ''

// ─── Global token refresh state ────────────────────────
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function attemptTokenRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise
  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      return res.ok
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()
  return refreshPromise
}

// ─── Custom error class ─────────────────────────────────
export class ApiRequestError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

// ─── Helpers ─────────────────────────────────────────────
export async function fetchJSON<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const makeRequest = (): Promise<Response> => {
    const { headers: optHeaders, ...rest } = options
    return fetch(`${API}${url}`, {
      credentials: 'include',
      headers: { ...optHeaders, 'Content-Type': 'application/json' },
      ...rest,
    })
  }

  let res = await makeRequest()

  // Silent token refresh on 401
  if (res.status === 401) {
    const refreshed = await attemptTokenRefresh()
    if (refreshed) {
      res = await makeRequest()
    } else {
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new ApiRequestError('Session expired', 401)
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new ApiRequestError(err.message || `Request failed: ${res.status}`, res.status)
  }
  return res.json() as Promise<T>
}

function authedHeaders(): Record<string, string> {
  const token =
    typeof document !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((r) => r.startsWith('accessToken='))
          ?.split('=')[1]
      : undefined
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Filter types for query keys ───────────────────────
interface MatchFilters {
  sport?: string
  status?: string
  date?: string
}

interface AdminUserFilters {
  page?: number
  search?: string
}

interface AdminMatchFilters {
  page?: number
  status?: string
}

interface AdminReportFilters {
  page?: number
  status?: string
}

interface PlayerFilters {
  sport?: string
}

interface TeamFilters {
  sport?: string
}

// ─── Query Keys ──────────────────────────────────────────
export const keys = {
  matches: (filters?: MatchFilters): QueryKey => ['matches', filters],
  match: (id?: string): QueryKey => ['matches', id],
  matchStats: (id?: string): QueryKey => ['matches', id, 'stats'],
  matchLineups: (id?: string): QueryKey => ['matches', id, 'lineups'],
  matchH2H: (id?: string): QueryKey => ['matches', id, 'h2h'],
  matchTimeline: (id?: string): QueryKey => ['matches', id, 'timeline'],
  leaderboard: (period?: string): QueryKey => ['leaderboard', period],
  leaderboardSport: (sport?: string): QueryKey => ['leaderboard', 'sport', sport],
  leaderboardFriends: (): QueryKey => ['leaderboard', 'friends'],
  leaderboardHistory: (period?: string): QueryKey => ['leaderboard', 'history', period],
  myPredictions: (): QueryKey => ['predictions', 'mine'],
  matchPredictions: (id?: string): QueryKey => ['predictions', 'match', id],
  myLeagues: (): QueryKey => ['leagues', 'mine'],
  league: (id?: string): QueryKey => ['leagues', id],
  leagueLeaderboard: (id?: string): QueryKey => ['leagues', id, 'leaderboard'],
  mySquads: (): QueryKey => ['squads', 'mine'],
  squad: (id?: string): QueryKey => ['squads', id],
  highlights: (): QueryKey => ['highlights'],
  user: (id?: string): QueryKey => ['users', id],
  checkUsername: (username?: string): QueryKey => ['users', 'check-username', username],
  notifications: (): QueryKey => ['notifications'],
  adminStats: (): QueryKey => ['admin', 'stats'],
  adminUsers: (filters?: AdminUserFilters): QueryKey => ['admin', 'users', filters],
  adminMatches: (filters?: AdminMatchFilters): QueryKey => ['admin', 'matches', filters],
  adminReports: (filters?: AdminReportFilters): QueryKey => ['admin', 'reports', filters],
  adminSettings: (): QueryKey => ['admin', 'settings'],
  stripeStatus: (): QueryKey => ['stripe', 'status'],
  aiPredict: (matchId?: string): QueryKey => ['ai', 'predict', matchId],
  aiSummary: (matchId?: string): QueryKey => ['ai', 'summary', matchId],
  conversations: (): QueryKey => ['messages', 'conversations'],
  messages: (userId?: string): QueryKey => ['messages', userId],
  standings: (sport?: string): QueryKey => ['standings', sport],
  teams: (filters?: TeamFilters): QueryKey => ['teams', filters],
  team: (id?: string): QueryKey => ['teams', id],
  players: (filters?: PlayerFilters): QueryKey => ['players', filters],
  player: (id?: string): QueryKey => ['players', id],
  search: (q?: string): QueryKey => ['search', q],
}

// ─── Matches ─────────────────────────────────────────────
export function useMatches(filters: MatchFilters = {}) {
  const params = new URLSearchParams()
  if (filters.sport && filters.sport !== 'all') params.set('sport', filters.sport)
  if (filters.status) params.set('status', filters.status)
  if (filters.date) params.set('date', filters.date)
  const qs = params.toString()
  return useQuery<Match[]>({
    queryKey: keys.matches(filters),
    queryFn: () => fetchJSON<Match[]>(`/api/matches${qs ? `?${qs}` : ''}`),
    staleTime: 10000,
  })
}

export function useMatch(id?: string) {
  return useQuery<Match>({
    queryKey: keys.match(id),
    queryFn: () => fetchJSON<Match>(`/api/matches/${id}`),
    enabled: !!id,
    staleTime: 10000,
  })
}

export function useMatchStats(id?: string) {
  return useQuery<MatchStats>({
    queryKey: keys.matchStats(id),
    queryFn: () => fetchJSON<MatchStats>(`/api/matches/${id}/stats`),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useMatchLineups(id?: string) {
  return useQuery<Lineups>({
    queryKey: keys.matchLineups(id),
    queryFn: () => fetchJSON<Lineups>(`/api/matches/${id}/lineups`),
    enabled: !!id,
    staleTime: 60000,
  })
}

export function useMatchH2H(id?: string) {
  return useQuery<H2H>({
    queryKey: keys.matchH2H(id),
    queryFn: () => fetchJSON<H2H>(`/api/matches/${id}/h2h`),
    enabled: !!id,
    staleTime: 120000,
  })
}

export function useMatchTimeline(id?: string) {
  return useQuery<TimelineEvent[]>({
    queryKey: keys.matchTimeline(id),
    queryFn: () => fetchJSON<TimelineEvent[]>(`/api/matches/${id}/timeline`),
    enabled: !!id,
    staleTime: 15000,
  })
}

// ─── Predictions ─────────────────────────────────────────
export function useMyPredictions({ enabled }: { enabled?: boolean } = {}) {
  return useQuery<Prediction[]>({
    queryKey: keys.myPredictions(),
    queryFn: () => fetchJSON<Prediction[]>('/api/predictions/mine', { headers: authedHeaders() }),
    enabled,
  })
}

export function useMatchPredictions(matchId?: string) {
  return useQuery<Prediction[]>({
    queryKey: keys.matchPredictions(matchId),
    queryFn: () => fetchJSON<Prediction[]>(`/api/predictions/match/${matchId}`),
    enabled: !!matchId,
  })
}

export function useCreatePrediction() {
  const qc = useQueryClient()
  return useMutation<Prediction, Error, CreatePredictionInput>({
    mutationFn: (data) =>
      fetchJSON<Prediction>('/api/predictions', {
        method: 'POST',
        headers: authedHeaders(),
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['predictions'] })
    },
  })
}

// ─── Leaderboard ─────────────────────────────────────────
export function useLeaderboard(period: string = 'global') {
  const endpoint =
    period === 'week'
      ? '/api/leaderboard/weekly'
      : period === 'month'
        ? '/api/leaderboard/global'
        : `/api/leaderboard/${period}`
  return useQuery<LeaderboardEntry[]>({
    queryKey: keys.leaderboard(period),
    queryFn: () => fetchJSON<LeaderboardEntry[]>(endpoint),
    staleTime: 30000,
  })
}

export function useLeaderboardSport(sport?: string) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: keys.leaderboardSport(sport),
    queryFn: () => fetchJSON<LeaderboardEntry[]>(`/api/leaderboard/sport/${sport}`),
    enabled: !!sport,
    staleTime: 30000,
  })
}

export function useLeaderboardHistory(period?: string) {
  return useQuery({
    queryKey: keys.leaderboardHistory(period),
    queryFn: () => fetchJSON(`/api/leaderboard/history/${period}`),
    enabled: !!period,
    staleTime: 60000,
  })
}

// ─── Leagues ─────────────────────────────────────────────
export function useMyLeagues() {
  return useQuery<League[]>({
    queryKey: keys.myLeagues(),
    queryFn: () => fetchJSON<League[]>('/api/leagues/mine', { headers: authedHeaders() }),
  })
}

export function useLeague(id?: string) {
  return useQuery<League>({
    queryKey: keys.league(id),
    queryFn: () => fetchJSON<League>(`/api/leagues/${id}`),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useLeagueLeaderboard(id?: string) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: keys.leagueLeaderboard(id),
    queryFn: () => fetchJSON<LeaderboardEntry[]>(`/api/leagues/${id}/leaderboard`),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useCreateLeague() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; description?: string; sport?: string }) =>
      fetchJSON('/api/leagues', {
        method: 'POST',
        headers: authedHeaders(),
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leagues'] }),
  })
}

export function useJoinLeague() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leagueId, inviteCode }: { leagueId: string; inviteCode: string }) =>
      fetchJSON(`/api/leagues/${leagueId}/join`, {
        method: 'POST',
        headers: authedHeaders(),
        body: JSON.stringify({ inviteCode }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leagues'] }),
  })
}

// ─── Squads ──────────────────────────────────────────────
export function useMySquads() {
  return useQuery<Squad[]>({
    queryKey: keys.mySquads(),
    queryFn: () => fetchJSON<Squad[]>('/api/squads/mine', { headers: authedHeaders() }),
  })
}

export function useSquad(id?: string) {
  return useQuery<Squad>({
    queryKey: keys.squad(id),
    queryFn: () => fetchJSON<Squad>(`/api/squads/${id}`),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useCreateSquad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; sport: string }) =>
      fetchJSON('/api/squads', {
        method: 'POST',
        headers: authedHeaders(),
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['squads'] }),
  })
}

// ─── Users ───────────────────────────────────────────────
export function useUser(id?: string) {
  return useQuery<User>({
    queryKey: keys.user(id),
    queryFn: () => fetchJSON<User>(`/api/users/${id}`),
    enabled: !!id,
    staleTime: 30000,
  })
}

export function useCheckUsername(username?: string) {
  return useQuery<{ available: boolean }>({
    queryKey: keys.checkUsername(username),
    queryFn: () => fetchJSON<{ available: boolean }>(`/api/users/check-username?username=${encodeURIComponent(username!)}`),
    enabled: !!username && username.length >= 3,
    staleTime: 5000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<{ displayName: string; avatar: string }>) =>
      fetchJSON('/api/users/me', {
        method: 'PATCH',
        headers: authedHeaders(),
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useFollowUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      fetchJSON(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: authedHeaders(),
      }),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ['users'] })
      const previousData = qc.getQueriesData({ queryKey: ['users'] })
      qc.setQueriesData({ queryKey: ['users'] }, (old: unknown) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((u: User) =>
            u.id === userId ? { ...u, isFollowing: true } : u
          )
        }
        const u = old as User
        if (u.id === userId) {
          return { ...u, isFollowing: true }
        }
        return old
      })
      return { previousData }
    },
    onError: (_err, _userId, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          qc.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUnfollowUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      fetchJSON(`/api/users/${userId}/follow`, {
        method: 'DELETE',
        headers: authedHeaders(),
      }),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ['users'] })
      const previousData = qc.getQueriesData({ queryKey: ['users'] })
      qc.setQueriesData({ queryKey: ['users'] }, (old: unknown) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((u: User) =>
            u.id === userId ? { ...u, isFollowing: false } : u
          )
        }
        const u = old as User
        if (u.id === userId) {
          return { ...u, isFollowing: false }
        }
        return old
      })
      return { previousData }
    },
    onError: (_err, _userId, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          qc.setQueryData(key, data)
        }
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// ─── Notifications ───────────────────────────────────────
export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: keys.notifications(),
    queryFn: () => fetchJSON<Notification[]>('/api/users/me/notifications', { headers: authedHeaders() }),
    refetchInterval: 30000,
  })
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      fetchJSON('/api/users/me/notifications/read', {
        method: 'PATCH',
        headers: authedHeaders(),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

// ─── Highlights ──────────────────────────────────────────
export function useHighlights() {
  return useQuery<Highlight[]>({
    queryKey: keys.highlights(),
    queryFn: () => fetchJSON<Highlight[]>('/api/highlights'),
    staleTime: 60000,
  })
}

// ─── AI ───────────────────────────────────────────────────
export function useAIPrediction(matchId?: string) {
  return useQuery<{ prediction: string; confidence: number }>({
    queryKey: keys.aiPredict(matchId),
    queryFn: () =>
      fetchJSON<{ prediction: string; confidence: number }>(`/api/ai/predict/${matchId}`, {
        method: 'POST',
        headers: authedHeaders(),
      }),
    enabled: !!matchId,
    staleTime: 120000,
  })
}

// ─── Stripe ─────────────────────────────────────────────
export function useStripeStatus() {
  return useQuery<StripeStatus>({
    queryKey: keys.stripeStatus(),
    queryFn: () => fetchJSON<StripeStatus>('/api/stripe/status', { headers: authedHeaders() }),
    staleTime: 30000,
  })
}

// ─── Messages ────────────────────────────────────────────
export function useConversations() {
  return useQuery({
    queryKey: keys.conversations(),
    queryFn: () => fetchJSON('/api/messages/conversations', { headers: authedHeaders() }),
    refetchInterval: 10000,
  })
}

export function useMessages(otherUserId?: string) {
  return useQuery({
    queryKey: keys.messages(otherUserId),
    queryFn: () => fetchJSON(`/api/messages/${otherUserId}`, { headers: authedHeaders() }),
    enabled: !!otherUserId,
    refetchInterval: 5000,
  })
}

export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, text, gifUrl }: { userId: string; text: string; gifUrl?: string }) =>
      fetchJSON(`/api/messages/${userId}`, {
        method: 'POST',
        headers: authedHeaders(),
        body: JSON.stringify({ text, gifUrl }),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['messages', vars.userId] })
      qc.invalidateQueries({ queryKey: ['messages', 'conversations'] })
    },
  })
}

// ─── Admin ───────────────────────────────────────────────
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: keys.adminStats(),
    queryFn: () => fetchJSON<AdminStats>('/api/admin/stats', { headers: authedHeaders() }),
    staleTime: 30000,
  })
}

export function useAdminUsers(filters: AdminUserFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.search) params.set('search', filters.search)
  const qs = params.toString()
  return useQuery({
    queryKey: keys.adminUsers(filters),
    queryFn: () => fetchJSON(`/api/admin/users${qs ? `?${qs}` : ''}`, { headers: authedHeaders() }),
    staleTime: 15000,
  })
}

export function useAdminMatches(filters: AdminMatchFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.status) params.set('status', filters.status)
  const qs = params.toString()
  return useQuery({
    queryKey: keys.adminMatches(filters),
    queryFn: () => fetchJSON(`/api/admin/matches${qs ? `?${qs}` : ''}`, { headers: authedHeaders() }),
    staleTime: 15000,
  })
}

export function useAdminReports(filters: AdminReportFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.status) params.set('status', filters.status)
  const qs = params.toString()
  return useQuery({
    queryKey: keys.adminReports(filters),
    queryFn: () => fetchJSON(`/api/admin/reports${qs ? `?${qs}` : ''}`, { headers: authedHeaders() }),
    staleTime: 15000,
  })
}

export function useAdminActivityLog() {
  return useQuery<AdminLogEntry[]>({
    queryKey: ['admin', 'activity-log'],
    queryFn: () => fetchJSON<AdminLogEntry[]>('/api/admin/activity-log', { headers: authedHeaders() }),
    staleTime: 10000,
    refetchInterval: 30000,
  })
}

export function useAdminSettings() {
  return useQuery({
    queryKey: keys.adminSettings(),
    queryFn: () => fetchJSON('/api/admin/settings', { headers: authedHeaders() }),
    staleTime: 60000,
  })
}

export function useTogglePro() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      fetchJSON(`/api/admin/users/${userId}/toggle-pro`, {
        method: 'POST',
        headers: authedHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      fetchJSON(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authedHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })
}

export function useUpdateReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetchJSON(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: authedHeaders(),
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  })
}

export function useAdminUserDetail(id?: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => fetchJSON(`/api/admin/users/${id}`, { headers: authedHeaders() }),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useUpdateMatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      fetchJSON(`/api/admin/matches/${id}`, {
        method: 'PATCH',
        headers: authedHeaders(),
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'matches'] }),
  })
}

// ─── Teams ──────────────────────────────────────────────
export function useTeams(filters: TeamFilters = {}) {
  const params = new URLSearchParams()
  if (filters.sport && filters.sport !== 'all') params.set('sport', filters.sport)
  const qs = params.toString()
  return useQuery<Team[]>({
    queryKey: keys.teams(filters),
    queryFn: () => fetchJSON<Team[]>(`/api/teams${qs ? `?${qs}` : ''}`),
    staleTime: 30000,
  })
}

export function useTeam(id?: string) {
  return useQuery<Team>({
    queryKey: keys.team(id),
    queryFn: () => fetchJSON<Team>(`/api/teams/${id}`),
    enabled: !!id,
    staleTime: 15000,
  })
}

// ─── Players ────────────────────────────────────────────
export function usePlayers(filters: PlayerFilters = {}) {
  const params = new URLSearchParams()
  if (filters.sport && filters.sport !== 'all') params.set('sport', filters.sport)
  const qs = params.toString()
  return useQuery<Player[]>({
    queryKey: keys.players(filters),
    queryFn: () => fetchJSON<Player[]>(`/api/players${qs ? `?${qs}` : ''}`),
    staleTime: 30000,
  })
}

export function usePlayer(id?: string) {
  return useQuery<Player>({
    queryKey: keys.player(id),
    queryFn: () => fetchJSON<Player>(`/api/players/${id}`),
    enabled: !!id,
    staleTime: 15000,
  })
}

// ─── Search ────────────────────────────────────────────────
export function useSearch(query?: string) {
  return useQuery({
    queryKey: keys.search(query),
    queryFn: () => fetchJSON(`/api/search?q=${encodeURIComponent(query!)}`),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 5000,
  })
}

// ─── Standings ────────────────────────────────────────────
export function useStandings(sport?: string) {
  return useQuery<StandingEntry[] | null>({
    queryKey: keys.standings(sport),
    queryFn: () => fetchJSON<StandingEntry[]>(`/api/standings/${sport}`).catch(() => null),
    enabled: !!sport,
    staleTime: 60000,
  })
}

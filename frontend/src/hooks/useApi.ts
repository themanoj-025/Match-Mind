import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import type {
  Room,
  AuctionState,
  RosterEntry,
  Fixture,
  PlayerMatchStat,
  User,
  Notification,
  LeaderboardEntry,
  AdminStats,
  AdminLogEntry,
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

export function authedHeaders(): Record<string, string> {
  const token =
    typeof document !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((r) => r.startsWith('accessToken='))
          ?.split('=')[1]
      : undefined
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Query Keys ──────────────────────────────────────────
export const keys = {
  tournaments: (): QueryKey => ['tournaments'],
  players: (tournamentId?: string): QueryKey => ['players', tournamentId],
  player: (id?: string): QueryKey => ['players', id],
  rooms: (): QueryKey => ['rooms', 'mine'],
  room: (id?: string): QueryKey => ['rooms', id],
  auctionState: (roomId?: string): QueryKey => ['rooms', roomId, 'auction'],
  franchise: (roomId: string, userId?: string): QueryKey => ['rooms', roomId, 'franchise', userId],
  leaderboard: (roomId?: string): QueryKey => ['leaderboard', roomId],
  fixtures: (tournamentId?: string): QueryKey => ['fixtures', tournamentId],
  fixture: (id?: string): QueryKey => ['fixtures', id],
  user: (id?: string): QueryKey => ['users', id],
  checkUsername: (username?: string): QueryKey => ['users', 'check-username', username],
  notifications: (): QueryKey => ['notifications'],
  adminStats: (): QueryKey => ['admin', 'stats'],
  adminUsers: (): QueryKey => ['admin', 'users'],
  adminSettings: (): QueryKey => ['admin', 'settings'],
  stripeStatus: (): QueryKey => ['stripe', 'status'],
  conversations: (): QueryKey => ['messages', 'conversations'],
  messages: (userId?: string): QueryKey => ['messages', userId],
}

// ─── Tournaments ─────────────────────────────────────────
export function useTournaments() {
  return useQuery({
    queryKey: keys.tournaments(),
    queryFn: () => fetchJSON('/api/tournaments'),
    staleTime: 300000,
  })
}

// ─── Players ────────────────────────────────────────────
export function usePlayers(tournamentId?: string) {
  const params = tournamentId ? `?tournamentId=${tournamentId}` : ''
  return useQuery<Player[]>({
    queryKey: keys.players(tournamentId),
    queryFn: () => fetchJSON<Player[]>(`/api/players${params}`),
    staleTime: 60000,
  })
}

export function usePlayer(id?: string) {
  return useQuery<Player>({
    queryKey: keys.player(id),
    queryFn: () => fetchJSON<Player>(`/api/players/${id}`),
    enabled: !!id,
    staleTime: 60000,
  })
}

// ─── Rooms ───────────────────────────────────────────────
export function useMyRooms() {
  return useQuery<Room[]>({
    queryKey: keys.rooms(),
    queryFn: () => fetchJSON<Room[]>('/api/rooms/mine', { headers: authedHeaders() }),
  })
}

export function useRoom(id?: string) {
  return useQuery<Room>({
    queryKey: keys.room(id),
    queryFn: () => fetchJSON<Room>(`/api/rooms/${id}`),
    enabled: !!id,
    staleTime: 10000,
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      tournamentId: string
      name: string
      totalBudget: number
      rosterRules: { GK: number; DEF: number; MID: number; FWD: number; total: number }
    }) => fetchJSON('/api/rooms', {
      method: 'POST',
      headers: authedHeaders(),
      body: JSON.stringify(data),
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  })
}

export function useJoinRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, inviteCode }: { roomId: string; inviteCode: string }) =>
      fetchJSON(`/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: authedHeaders(),
        body: JSON.stringify({ inviteCode }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rooms'] }),
  })
}

// ─── Auction ─────────────────────────────────────────────
export function useAuctionState(roomId?: string) {
  return useQuery<AuctionState>({
    queryKey: keys.auctionState(roomId),
    queryFn: () => fetchJSON<AuctionState>(`/api/rooms/${roomId}/auction/state`, { headers: authedHeaders() }),
    enabled: !!roomId,
    staleTime: 5000,
    refetchInterval: 5000,
  })
}

// ─── Franchise ───────────────────────────────────────────
export function useFranchise(roomId: string, userId?: string) {
  return useQuery<RosterEntry[]>({
    queryKey: keys.franchise(roomId, userId),
    queryFn: () => fetchJSON<RosterEntry[]>(`/api/rooms/${roomId}/franchises/${userId || 'me'}`, { headers: authedHeaders() }),
    enabled: !!roomId,
    staleTime: 10000,
  })
}

export function useSetCaptain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roomId, playerId, isViceCaptain }: { roomId: string; playerId: string; isViceCaptain?: boolean }) =>
      fetchJSON(`/api/rooms/${roomId}/franchises/me/captain`, {
        method: 'PATCH',
        headers: authedHeaders(),
        body: JSON.stringify({ playerId, isViceCaptain }),
      }),
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ['rooms', vars.roomId, 'franchise'] }),
  })
}

// ─── Leaderboard ─────────────────────────────────────────
export function useRoomLeaderboard(roomId?: string) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: keys.leaderboard(roomId),
    queryFn: () => fetchJSON<LeaderboardEntry[]>(`/api/rooms/${roomId}/leaderboard`),
    enabled: !!roomId,
    staleTime: 15000,
  })
}

// ─── Fixtures ────────────────────────────────────────────
export function useFixtures(tournamentId?: string) {
  const params = tournamentId ? `?tournamentId=${tournamentId}` : ''
  return useQuery<Fixture[]>({
    queryKey: keys.fixtures(tournamentId),
    queryFn: () => fetchJSON<Fixture[]>(`/api/fixtures${params}`),
    staleTime: 30000,
  })
}

export function useFixture(id?: string) {
  return useQuery<Fixture>({
    queryKey: keys.fixture(id),
    queryFn: () => fetchJSON<Fixture>(`/api/fixtures/${id}`),
    enabled: !!id,
    staleTime: 15000,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
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

// ─── Admin API response shapes ────────────────────────────
interface AdminUsersResponse {
  users: any[]
  total: number
  totalPages: number
}

interface AdminReportResponse {
  reports: any[]
}

interface AdminMatchResponse {
  matches: any[]
  total: number
}

interface AdminSettingsResponse {
  settings: any[]
}

interface AdminActivityLogResponse {
  logs: AdminLogEntry[]
  total: number
}

interface AdminUserDetailResponse {
  user: any
}

// ─── Admin page stubs (legacy MatchMind admin) ────────────
export function useAdminReports(_opts?: { status?: string }) {
  return useQuery<AdminReportResponse>({
    queryKey: ['admin', 'reports', _opts?.status],
    queryFn: () => fetchJSON<AdminReportResponse>('/api/admin/reports'),
    enabled: false,
  })
}

export function useAdminMatches(_opts?: { status?: string }) {
  return useQuery<AdminMatchResponse>({
    queryKey: ['admin', 'matches', _opts?.status],
    queryFn: () => fetchJSON<AdminMatchResponse>('/api/admin/matches'),
    enabled: false,
  })
}

export function useUpdateReport() {
  return useMutation({
    mutationFn: (_data: any) => Promise.resolve({}),
  })
}

export function useUpdateMatch() {
  return useMutation({
    mutationFn: (_data: any) => Promise.resolve({}),
  })
}

// ─── Legacy MatchMind hooks (stubs — old pages use these) ─
export function useLeaderboard(_period?: string) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'legacy', _period],
    queryFn: () => fetchJSON<LeaderboardEntry[]>('/api/leaderboard/global'),
    staleTime: 15000,
  })
}

export function useLeaderboardSport(_sport?: string) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard', 'legacy-sport', _sport],
    queryFn: () => fetchJSON<LeaderboardEntry[]>('/api/leaderboard/global'),
    staleTime: 15000,
  })
}

export function useMyPredictions() {
  return useQuery({
    queryKey: ['predictions', 'mine'],
    queryFn: () => fetchJSON('/api/leaderboard/global'),
    staleTime: 60000,
  })
}

export function useMatches(_tournamentId?: string) {
  return useQuery({
    queryKey: ['fixtures', _tournamentId],
    queryFn: () => fetchJSON('/api/fixtures' + (_tournamentId ? `?tournamentId=${_tournamentId}` : '')),
    staleTime: 30000,
  })
}

export function useMatch(id?: string) {
  return useQuery({
    queryKey: ['fixtures', id],
    queryFn: () => fetchJSON(`/api/fixtures/${id}`),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useMatchStats(_id?: string) {
  return useQuery({
    queryKey: ['fixtures', _id, 'stats'],
    queryFn: () => fetchJSON(`/api/fixtures/${_id}`),
    enabled: !!_id,
    staleTime: 15000,
  })
}

export function useMatchLineups(_id?: string) {
  return useQuery({
    queryKey: ['fixtures', _id, 'lineups'],
    queryFn: () => fetchJSON(`/api/fixtures/${_id}`),
    enabled: !!_id,
    staleTime: 15000,
  })
}

export function useMatchH2H(_id?: string) {
  return useQuery({
    queryKey: ['fixtures', _id, 'h2h'],
    queryFn: () => fetchJSON(`/api/fixtures/${_id}`),
    enabled: !!_id,
    staleTime: 30000,
  })
}

export function useMatchTimeline(_id?: string) {
  return useQuery({
    queryKey: ['fixtures', _id, 'timeline'],
    queryFn: () => fetchJSON(`/api/fixtures/${_id}`),
    enabled: !!_id,
    staleTime: 10000,
  })
}

export function useCreatePrediction() {
  return useMutation({
    mutationFn: (_data: any) => Promise.resolve({}),
  })
}

export function useSearch(_query?: string) {
  return useQuery({
    queryKey: ['search', _query],
    queryFn: () => fetchJSON(`/api/search?q=${encodeURIComponent(_query || '')}`),
    enabled: !!_query && _query.length >= 2,
    staleTime: 30000,
  })
}

export function useFollowUser() {
  return useMutation({
    mutationFn: (_userId: string) => fetchJSON(`/api/users/${_userId}/follow`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
    }),
  })
}

export function useUnfollowUser() {
  return useMutation({
    mutationFn: (_userId: string) => fetchJSON(`/api/users/${_userId}/unfollow`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
    }),
  })
}

// ─── Stripe ─────────────────────────────────────────────
export function useStripeStatus() {
  return useQuery({
    queryKey: keys.stripeStatus(),
    queryFn: () => fetchJSON('/api/stripe/status', { headers: authedHeaders() }),
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

export function useAdminUsers() {
  return useQuery<AdminUsersResponse>({
    queryKey: keys.adminUsers(),
    queryFn: () => fetchJSON<AdminUsersResponse>('/api/admin/users', { headers: authedHeaders() }),
    staleTime: 15000,
  })
}

export function useAdminActivityLog() {
  return useQuery<AdminActivityLogResponse>({
    queryKey: ['admin', 'activity-log'],
    queryFn: () => fetchJSON<AdminActivityLogResponse>('/api/admin/activity-log', { headers: authedHeaders() }),
    staleTime: 10000,
    refetchInterval: 30000,
  })
}

export function useAdminSettings() {
  return useQuery<AdminSettingsResponse>({
    queryKey: keys.adminSettings(),
    queryFn: () => fetchJSON<AdminSettingsResponse>('/api/admin/settings', { headers: authedHeaders() }),
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

export function useAdminUserDetail(id?: string) {
  return useQuery<AdminUserDetailResponse>({
    queryKey: ['admin', 'users', id],
    queryFn: () => fetchJSON<AdminUserDetailResponse>(`/api/admin/users/${id}`, { headers: authedHeaders() }),
    enabled: !!id,
    staleTime: 15000,
  })
}

// ─── Admin Draft Mode ─────────────────────────────────────

export interface DraftPoolValidation {
  tournamentId: string
  tournamentName: string
  shortName: string
  status: string
  passed: boolean
  enabled: boolean
  iconCount: number
  playerCount: number
  errors: string[]
  warnings: string[]
  infos: string[]
}

export interface DraftPoolValidationResponse {
  tournaments: DraftPoolValidation[]
}

export function useAdminDraftPoolValidation() {
  return useQuery<DraftPoolValidationResponse>({
    queryKey: ['admin', 'draft', 'pool-validation'],
    queryFn: () => fetchJSON<DraftPoolValidationResponse>('/api/admin/draft/pool-validation', { headers: authedHeaders() }),
    staleTime: 30000,
  })
}

export interface DraftIconPlayer {
  id: string
  name: string
  tournamentId: string
  position: string
  club: string
  nationality: string
  basePrice: number
  rarityTier: string
  isEligibleForIcon: boolean
  photoUrl?: string
}

export interface DraftIconsResponse {
  players: DraftIconPlayer[]
}

export function useAdminDraftIcons() {
  return useQuery<DraftIconsResponse>({
    queryKey: ['admin', 'draft', 'icons'],
    queryFn: () => fetchJSON<DraftIconsResponse>('/api/admin/draft/icons', { headers: authedHeaders() }),
    staleTime: 30000,
  })
}

export function useToggleDraftMode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tournamentId, action }: { tournamentId: string; action: 'enable' | 'disable' }) =>
      fetchJSON(`/api/admin/settings/draft-mode/${tournamentId}/${action}`, {
        method: 'POST',
        headers: authedHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'draft', 'pool-validation'] })
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
  })
}

export function useToggleIconEligibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (playerId: string) =>
      fetchJSON(`/api/admin/draft/icons/${playerId}/toggle`, {
        method: 'POST',
        headers: authedHeaders(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'draft', 'icons'] })
    },
  })
}

export function useRevalidateDraftPool() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tournamentId?: string) =>
      fetchJSON<{ success: boolean; allPassed: boolean; results: any[] }>('/api/admin/draft/revalidate', {
        method: 'POST',
        headers: authedHeaders(),
        body: tournamentId ? JSON.stringify({ tournamentId }) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'draft', 'pool-validation'] })
      qc.invalidateQueries({ queryKey: ['admin', 'draft', 'icons'] })
    },
  })
}

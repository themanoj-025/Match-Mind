import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = import.meta.env.VITE_API_URL || ''

// ─── Helpers ─────────────────────────────────────────────
async function fetchJSON(url, options = {}) {
  const res = await fetch(`${API}${url}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || `Request failed: ${res.status}`)
  }
  return res.json()
}

function authedHeaders() {
  const token =
    typeof document !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((r) => r.startsWith('accessToken='))
          ?.split('=')[1]
      : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ─── Query Keys ──────────────────────────────────────────
export const keys = {
  matches: (filters) => ['matches', filters],
  match: (id) => ['matches', id],
  matchStats: (id) => ['matches', id, 'stats'],
  matchLineups: (id) => ['matches', id, 'lineups'],
  matchH2H: (id) => ['matches', id, 'h2h'],
  matchTimeline: (id) => ['matches', id, 'timeline'],
  leaderboard: (period) => ['leaderboard', period],
  leaderboardSport: (sport) => ['leaderboard', 'sport', sport],
  leaderboardFriends: () => ['leaderboard', 'friends'],
  leaderboardHistory: (period) => ['leaderboard', 'history', period],
  myPredictions: () => ['predictions', 'mine'],
  matchPredictions: (id) => ['predictions', 'match', id],
  myLeagues: () => ['leagues', 'mine'],
  league: (id) => ['leagues', id],
  leagueLeaderboard: (id) => ['leagues', id, 'leaderboard'],
  mySquads: () => ['squads', 'mine'],
  squad: (id) => ['squads', id],
  highlights: () => ['highlights'],
  user: (id) => ['users', id],
  checkUsername: (username) => ['users', 'check-username', username],
  notifications: () => ['notifications'],
  adminStats: () => ['admin', 'stats'],
  adminUsers: (filters) => ['admin', 'users', filters],
  adminMatches: (filters) => ['admin', 'matches', filters],
  adminReports: (filters) => ['admin', 'reports', filters],
  adminSettings: () => ['admin', 'settings'],
  stripeStatus: () => ['stripe', 'status'],
  aiPredict: (matchId) => ['ai', 'predict', matchId],
  aiSummary: (matchId) => ['ai', 'summary', matchId],
  conversations: () => ['messages', 'conversations'],
  messages: (userId) => ['messages', userId],
  standings: (sport) => ['standings', sport],
  teams: (filters) => ['teams', filters],
  team: (id) => ['teams', id],
  players: (filters) => ['players', filters],
  player: (id) => ['players', id],
  search: (q) => ['search', q],
}

// ─── Matches ─────────────────────────────────────────────
export function useMatches(filters = {}) {
  const params = new URLSearchParams()
  if (filters.sport && filters.sport !== 'all') params.set('sport', filters.sport)
  if (filters.status) params.set('status', filters.status)
  if (filters.date) params.set('date', filters.date)
  const qs = params.toString()
  return useQuery({
    queryKey: keys.matches(filters),
    queryFn: () => fetchJSON(`/api/matches${qs ? `?${qs}` : ''}`),
    staleTime: 10000,
  })
}

export function useMatch(id) {
  return useQuery({
    queryKey: keys.match(id),
    queryFn: () => fetchJSON(`/api/matches/${id}`),
    enabled: !!id,
    staleTime: 10000,
  })
}

export function useMatchStats(id) {
  return useQuery({
    queryKey: keys.matchStats(id),
    queryFn: () => fetchJSON(`/api/matches/${id}/stats`),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useMatchLineups(id) {
  return useQuery({
    queryKey: keys.matchLineups(id),
    queryFn: () => fetchJSON(`/api/matches/${id}/lineups`),
    enabled: !!id,
    staleTime: 60000,
  })
}

export function useMatchH2H(id) {
  return useQuery({
    queryKey: keys.matchH2H(id),
    queryFn: () => fetchJSON(`/api/matches/${id}/h2h`),
    enabled: !!id,
    staleTime: 120000,
  })
}

export function useMatchTimeline(id) {
  return useQuery({
    queryKey: keys.matchTimeline(id),
    queryFn: () => fetchJSON(`/api/matches/${id}/timeline`),
    enabled: !!id,
    staleTime: 15000,
  })
}

// ─── Predictions ─────────────────────────────────────────
export function useMyPredictions({ enabled } = {}) {
  return useQuery({
    queryKey: keys.myPredictions(),
    queryFn: () => fetchJSON('/api/predictions/mine', { headers: authedHeaders() }),
    enabled,
  })
}

export function useMatchPredictions(matchId) {
  return useQuery({
    queryKey: keys.matchPredictions(matchId),
    queryFn: () => fetchJSON(`/api/predictions/match/${matchId}`),
    enabled: !!matchId,
  })
}

export function useCreatePrediction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      fetchJSON('/api/predictions', {
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
export function useLeaderboard(period = 'global') {
  const endpoint =
    period === 'week'
      ? '/api/leaderboard/weekly'
      : period === 'month'
        ? '/api/leaderboard/global'
        : `/api/leaderboard/${period}`
  return useQuery({
    queryKey: keys.leaderboard(period),
    queryFn: () => fetchJSON(endpoint),
    staleTime: 30000,
  })
}

export function useLeaderboardSport(sport) {
  return useQuery({
    queryKey: keys.leaderboardSport(sport),
    queryFn: () => fetchJSON(`/api/leaderboard/sport/${sport}`),
    enabled: !!sport,
    staleTime: 30000,
  })
}

export function useLeaderboardHistory(period) {
  return useQuery({
    queryKey: keys.leaderboardHistory(period),
    queryFn: () => fetchJSON(`/api/leaderboard/history/${period}`),
    enabled: !!period,
    staleTime: 60000,
  })
}

// ─── Leagues ─────────────────────────────────────────────
export function useMyLeagues() {
  return useQuery({
    queryKey: keys.myLeagues(),
    queryFn: () => fetchJSON('/api/leagues/mine', { headers: authedHeaders() }),
  })
}

export function useLeague(id) {
  return useQuery({
    queryKey: keys.league(id),
    queryFn: () => fetchJSON(`/api/leagues/${id}`),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useLeagueLeaderboard(id) {
  return useQuery({
    queryKey: keys.leagueLeaderboard(id),
    queryFn: () => fetchJSON(`/api/leagues/${id}/leaderboard`),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useCreateLeague() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
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
    mutationFn: ({ leagueId, inviteCode }) =>
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
  return useQuery({
    queryKey: keys.mySquads(),
    queryFn: () => fetchJSON('/api/squads/mine', { headers: authedHeaders() }),
  })
}

export function useSquad(id) {
  return useQuery({
    queryKey: keys.squad(id),
    queryFn: () => fetchJSON(`/api/squads/${id}`),
    enabled: !!id,
    staleTime: 15000,
  })
}

export function useCreateSquad() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      fetchJSON('/api/squads', {
        method: 'POST',
        headers: authedHeaders(),
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['squads'] }),
  })
}

// ─── Users ───────────────────────────────────────────────
export function useUser(id) {
  return useQuery({
    queryKey: keys.user(id),
    queryFn: () => fetchJSON(`/api/users/${id}`),
    enabled: !!id,
    staleTime: 30000,
  })
}

export function useCheckUsername(username) {
  return useQuery({
    queryKey: keys.checkUsername(username),
    queryFn: () => fetchJSON(`/api/users/check-username?username=${encodeURIComponent(username)}`),
    enabled: username?.length >= 3,
    staleTime: 5000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) =>
      fetchJSON('/api/users/me', {
        method: 'PATCH',
        headers: authedHeaders(),
        body: JSON.stringify(data),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useFollowUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) =>
      fetchJSON(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: authedHeaders(),
      }),
    onMutate: async (userId) => {
      // Cancel any outgoing refetches to avoid overwrite
      await qc.cancelQueries({ queryKey: ['users'] })
      // Snapshot previous value for rollback
      const previousData = qc.getQueriesData({ queryKey: ['users'] })
      // Optimistically set isFollowing = true across all user queries
      qc.setQueriesData({ queryKey: ['users'] }, (old) => {
        if (!old) return old
        // Handle both array responses and single objects
        if (Array.isArray(old)) {
          return old.map((u) =>
            u && (u.id === userId || u._id === userId)
              ? { ...u, isFollowing: true }
              : u
          )
        }
        // Single object from useUser(id) — check ID match
        if (old.id === userId || old._id === userId) {
          return { ...old, isFollowing: true }
        }
        return old
      })
      return { previousData }
    },
    onError: (err, userId, context) => {
      // Roll back on error
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          qc.setQueryData(key, data)
        })
      }
    },
    onSettled: () => {
      // Always refetch to sync with server
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUnfollowUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId) =>
      fetchJSON(`/api/users/${userId}/follow`, {
        method: 'DELETE',
        headers: authedHeaders(),
      }),
    onMutate: async (userId) => {
      await qc.cancelQueries({ queryKey: ['users'] })
      const previousData = qc.getQueriesData({ queryKey: ['users'] })
      qc.setQueriesData({ queryKey: ['users'] }, (old) => {
        if (!old) return old
        if (Array.isArray(old)) {
          return old.map((u) =>
            u && (u.id === userId || u._id === userId)
              ? { ...u, isFollowing: false }
              : u
          )
        }
        // Single object from useUser(id) — check ID match
        if (old.id === userId || old._id === userId) {
          return { ...old, isFollowing: false }
        }
        return old
      })
      return { previousData }
    },
    onError: (err, userId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]) => {
          qc.setQueryData(key, data)
        })
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// ─── Notifications ───────────────────────────────────────
export function useNotifications() {
  return useQuery({
    queryKey: keys.notifications(),
    queryFn: () => fetchJSON('/api/users/me/notifications', { headers: authedHeaders() }),
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
  return useQuery({
    queryKey: keys.highlights(),
    queryFn: () => fetchJSON('/api/highlights'),
    staleTime: 60000,
  })
}

// ─── AI ───────────────────────────────────────────────────
export function useAIPrediction(matchId) {
  return useQuery({
    queryKey: keys.aiPredict(matchId),
    queryFn: () =>
      fetchJSON(`/api/ai/predict/${matchId}`, {
        method: 'POST',
        headers: authedHeaders(),
      }),
    enabled: !!matchId,
    staleTime: 120000,
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

export function useMessages(otherUserId) {
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
    mutationFn: ({ userId, text, gifUrl }) =>
      fetchJSON(`/api/messages/${userId}`, {
        method: 'POST',
        headers: authedHeaders(),
        body: JSON.stringify({ text, gifUrl }),
      }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['messages', vars.userId] })
      qc.invalidateQueries({ queryKey: ['messages', 'conversations'] })
    },
  })
}

// ─── Admin ───────────────────────────────────────────────
export function useAdminStats() {
  return useQuery({
    queryKey: keys.adminStats(),
    queryFn: () => fetchJSON('/api/admin/stats', { headers: authedHeaders() }),
    staleTime: 30000,
  })
}

export function useAdminUsers(filters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', filters.page)
  if (filters.search) params.set('search', filters.search)
  const qs = params.toString()
  return useQuery({
    queryKey: keys.adminUsers(filters),
    queryFn: () => fetchJSON(`/api/admin/users${qs ? `?${qs}` : ''}`, { headers: authedHeaders() }),
    staleTime: 15000,
  })
}

export function useAdminMatches(filters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', filters.page)
  if (filters.status) params.set('status', filters.status)
  const qs = params.toString()
  return useQuery({
    queryKey: keys.adminMatches(filters),
    queryFn: () => fetchJSON(`/api/admin/matches${qs ? `?${qs}` : ''}`, { headers: authedHeaders() }),
    staleTime: 15000,
  })
}

export function useAdminReports(filters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', filters.page)
  if (filters.status) params.set('status', filters.status)
  const qs = params.toString()
  return useQuery({
    queryKey: keys.adminReports(filters),
    queryFn: () => fetchJSON(`/api/admin/reports${qs ? `?${qs}` : ''}`, { headers: authedHeaders() }),
    staleTime: 15000,
  })
}

export function useAdminActivityLog() {
  return useQuery({
    queryKey: ['admin', 'activity-log'],
    queryFn: () => fetchJSON('/api/admin/activity-log', { headers: authedHeaders() }),
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
    mutationFn: (userId) =>
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
    mutationFn: (userId) =>
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
    mutationFn: ({ id, status }) =>
      fetchJSON(`/api/admin/reports/${id}`, {
        method: 'PATCH',
        headers: authedHeaders(),
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  })
}

export function useAdminUserDetail(id) {
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
    mutationFn: ({ id, ...data }) =>
      fetchJSON(`/api/admin/matches/${id}`, {
        method: 'PATCH',
        headers: authedHeaders(),
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'matches'] }),
  })
}

// ─── Teams ──────────────────────────────────────────────
export function useTeams(filters = {}) {
  const params = new URLSearchParams()
  if (filters.sport && filters.sport !== 'all') params.set('sport', filters.sport)
  const qs = params.toString()
  return useQuery({
    queryKey: keys.teams(filters),
    queryFn: () => fetchJSON(`/api/teams${qs ? `?${qs}` : ''}`),
    staleTime: 30000,
  })
}

export function useTeam(id) {
  return useQuery({
    queryKey: keys.team(id),
    queryFn: () => fetchJSON(`/api/teams/${id}`),
    enabled: !!id,
    staleTime: 15000,
  })
}

// ─── Players ────────────────────────────────────────────
export function usePlayers(filters = {}) {
  const params = new URLSearchParams()
  if (filters.sport && filters.sport !== 'all') params.set('sport', filters.sport)
  const qs = params.toString()
  return useQuery({
    queryKey: keys.players(filters),
    queryFn: () => fetchJSON(`/api/players${qs ? `?${qs}` : ''}`),
    staleTime: 30000,
  })
}

export function usePlayer(id) {
  return useQuery({
    queryKey: keys.player(id),
    queryFn: () => fetchJSON(`/api/players/${id}`),
    enabled: !!id,
    staleTime: 15000,
  })
}

// ─── Search ────────────────────────────────────────────────
export function useSearch(query) {
  return useQuery({
    queryKey: keys.search(query),
    queryFn: () => fetchJSON(`/api/search?q=${encodeURIComponent(query)}`),
    enabled: !!query && query.trim().length >= 2,
    staleTime: 5000, // short stale time for live search
  })
}

// ─── Standings ────────────────────────────────────────────
export function useStandings(sport) {
  return useQuery({
    queryKey: keys.standings(sport),
    queryFn: () => fetchJSON(`/api/standings/${sport}`).catch(() => null),
    enabled: !!sport,
    staleTime: 60000,
  })
}

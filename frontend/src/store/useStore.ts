import { create } from 'zustand'
import type { User, Match, Notification, Prediction, LeaderboardEntry, ChatMessage as ChatMessageType } from '../lib/types'

// ─── Store State Interface ──────────────────────────────

interface StoreState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void

  // UI State
  isNavOpen: boolean
  toggleNav: () => void
  closeNav: () => void

  // Live Matches
  liveMatches: Match[]
  setLiveMatches: (matches: Match[]) => void
  updateMatchScore: (matchId: string, homeScore: number, awayScore: number, minute: number) => void
  updateMatchStatus: (matchId: string, status: string, minute: number) => void
  addLiveMatch: (match: Match) => void

  // Chat
  chatMessages: Record<string, ChatMessageType[]>
  addChatMessage: (roomId: string, message: ChatMessageType) => void
  setChatMessages: (roomId: string, messages: ChatMessageType[]) => void
  addChatReaction: (roomId: string, messageId: string | number, emoji: string) => void

  // Viewer Counts
  viewerCounts: Record<string, number>
  setViewerCount: (matchId: string, count: number) => void

  // Notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAllRead: () => void
  markNotificationRead: (id: string) => void
  setNotifications: (notifications: Notification[]) => void

  // Predictions
  userPredictions: Prediction[]
  setUserPredictions: (predictions: Prediction[]) => void
  addPrediction: (prediction: Prediction) => void
  updatePrediction: (id: string, updates: Partial<Prediction>) => void

  // Leaderboard
  leaderboard: LeaderboardEntry[]
  myRank: number | null
  setLeaderboard: (data: LeaderboardEntry[]) => void
  setMyRank: (rank: number) => void

  // Viewport
  isMobile: boolean
  setIsMobile: (val: boolean) => void

  // Loading States
  loadingStates: Record<string, boolean>
  setLoading: (key: string, value: boolean) => void

  // Error States
  errors: Record<string, string | null>
  setError: (key: string, value: string | null) => void
  clearError: (key: string) => void
}

// ─── Store ──────────────────────────────────────────────

const useStore = create<StoreState>((set) => ({
  // ── Auth ──────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({
    user: null,
    isAuthenticated: false,
    userPredictions: [],
    notifications: [],
    unreadCount: 0,
  }),

  // ── UI State ──────────────────────────────────────
  isNavOpen: false,
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),

  // ── Live Matches ──────────────────────────────────
  liveMatches: [],
  setLiveMatches: (matches) => set({ liveMatches: matches }),
  updateMatchScore: (matchId, homeScore, awayScore, minute) =>
    set((state) => {
      const matches: Match[] = state.liveMatches.map((m) => {
        if (m.id !== matchId) return m
        return { ...m, homeScore, awayScore, minute, status: 'SIMULATING' } as Match
      })
      return { liveMatches: matches }
    }),
  updateMatchStatus: (matchId, status, minute) =>
    set((state) => {
      const matches: Match[] = state.liveMatches.map((m) => {
        if (m.id !== matchId) return m
        return { ...m, status, minute } as Match
      })
      return { liveMatches: matches }
    }),
  addLiveMatch: (match) =>
    set((state) => ({
      liveMatches: state.liveMatches.some(m => m.id === match.id)
        ? state.liveMatches
        : [...state.liveMatches, match],
    })),

  // ── Chat ──────────────────────────────────────────
  chatMessages: {},
  addChatMessage: (roomId, message) =>
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [roomId]: [...(state.chatMessages[roomId] || []), message],
      },
    })),
  setChatMessages: (roomId, messages) =>
    set((state) => ({
      chatMessages: { ...state.chatMessages, [roomId]: messages },
    })),
  addChatReaction: (_roomId, _messageId, _emoji) => {
    // Handled optimistically on the client
  },

  // ── Viewer Counts ─────────────────────────────────
  viewerCounts: {},
  setViewerCount: (matchId, count) =>
    set((state) => ({
      viewerCounts: { ...state.viewerCounts, [matchId]: count },
    })),

  // ── Notifications ─────────────────────────────────
  notifications: [],
  unreadCount: 0,
  addNotification: (notification) =>
    set((state) => ({
      notifications: [{ ...notification, isRead: false }, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  // ── Predictions ───────────────────────────────────
  userPredictions: [],
  setUserPredictions: (predictions) => set({ userPredictions: predictions }),
  addPrediction: (prediction) =>
    set((state) => ({
      userPredictions: [prediction, ...state.userPredictions],
    })),
  updatePrediction: (id, updates) =>
    set((state) => ({
      userPredictions: state.userPredictions.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  // ── Leaderboard ───────────────────────────────────
  leaderboard: [],
  myRank: null,
  setLeaderboard: (data) => set({ leaderboard: data }),
  setMyRank: (rank) => set({ myRank: rank }),

  // ── Viewport ──────────────────────────────────────
  isMobile: false,
  setIsMobile: (val) => set({ isMobile: val }),

  // ── Loading States ────────────────────────────────
  loadingStates: {},
  setLoading: (key, value) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: value },
    })),

  // ── Error States ──────────────────────────────────
  errors: {},
  setError: (key, value) =>
    set((state) => ({
      errors: { ...state.errors, [key]: value },
    })),
  clearError: (key) =>
    set((state) => {
      const { [key]: _removed, ...rest } = state.errors
      return { errors: rest }
    }),
}))

export default useStore

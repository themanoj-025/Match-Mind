import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Auth
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

  // UI State
  isNavOpen: false,
  toggleNav: () => set((s) => ({ isNavOpen: !s.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),

  // Live Matches
  liveMatches: [],
  setLiveMatches: (matches) => set({ liveMatches: matches }),
  updateMatchScore: (matchId, homeScore, awayScore, minute) =>
    set((state) => ({
      liveMatches: state.liveMatches.map((m) =>
        m.id === matchId ? { ...m, homeScore, awayScore, minute, status: 'LIVE' } : m
      ),
    })),
  updateMatchStatus: (matchId, status, minute) =>
    set((state) => ({
      liveMatches: state.liveMatches.map((m) =>
        m.id === matchId ? { ...m, status, minute } : m
      ),
    })),
  addLiveMatch: (match) =>
    set((state) => ({
      liveMatches: state.liveMatches.some(m => m.id === match.id)
        ? state.liveMatches
        : [...state.liveMatches, match],
    })),

  // Chat
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
  addChatReaction: (roomId, messageId, emoji) => {
    // Handled optimistically on the client
  },

  // Viewer Counts
  viewerCounts: {},
  setViewerCount: (matchId, count) =>
    set((state) => ({
      viewerCounts: { ...state.viewerCounts, [matchId]: count },
    })),

  // Notifications
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

  // Predictions
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

  // Leaderboard
  leaderboard: [],
  myRank: null,
  setLeaderboard: (data) => set({ leaderboard: data }),
  setMyRank: (rank) => set({ myRank: rank }),

  // Viewport
  isMobile: false,
  setIsMobile: (val) => set({ isMobile: val }),

  // Loading States
  loadingStates: {},
  setLoading: (key, value) =>
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: value },
    })),

  // Error States
  errors: {},
  setError: (key, value) =>
    set((state) => ({
      errors: { ...state.errors, [key]: value },
    })),
  clearError: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.errors
      return { errors: rest }
    }),
}))

export default useStore

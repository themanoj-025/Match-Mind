import { create } from 'zustand'
import type {
  User,
  Notification,
  Room,
  AuctionState,
  RosterEntry,
  LeaderboardEntry,
  ChatMessage as ChatMessageType,
  Player,
} from '../lib/types'

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

  // ── Tournament-scoped data (v2 §3.3 — keyed by tournamentId) ──
  playersByTournament: Record<string, Player[]>
  roomsByTournament: Record<string, Room[]>
  activeTournamentId: string | null
  setPlayersForTournament: (tournamentId: string, players: Player[]) => void
  setRoomsForTournament: (tournamentId: string, rooms: Room[]) => void
  setActiveTournamentId: (id: string | null) => void

  // Auction Rooms
  activeRooms: Room[]
  currentAuctionState: AuctionState | null
  setActiveRooms: (rooms: Room[]) => void
  setCurrentAuctionState: (state: AuctionState | null) => void
  updateAuctionBid: (playerId: string, amount: number, bidderId: string, timerEndsAt: string) => void
  updateAuctionPhase: (phase: AuctionState['phase']) => void

  // Roster
  myRoster: RosterEntry[]
  setMyRoster: (roster: RosterEntry[]) => void
  updateCaptain: (playerId: string | null, isViceCaptain?: boolean) => void

  // Chat
  chatMessages: Record<string, ChatMessageType[]>
  addChatMessage: (roomId: string, message: ChatMessageType) => void
  setChatMessages: (roomId: string, messages: ChatMessageType[]) => void
  addChatReaction: (roomId: string, messageId: string | number, emoji: string) => void

  // Notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Notification) => void
  markAllRead: () => void
  markNotificationRead: (id: string) => void
  setNotifications: (notifications: Notification[]) => void

  // Leaderboard
  leaderboard: LeaderboardEntry[]
  myRank: number | null
  setLeaderboard: (data: LeaderboardEntry[]) => void
  setMyRank: (rank: number) => void

  // Viewport
  isMobile: boolean
  setIsMobile: (val: boolean) => void

  // Viewer counts
  viewerCounts: Record<string, number>
  setViewerCount: (roomId: string, count: number) => void

  // Loading States
  loadingStates: Record<string, boolean>
  setLoading: (key: string, value: boolean) => void

  // Error States
  errors: Record<string, string | null>
  setError: (key: string, value: string | null) => void
  clearError: (key: string) => void
}

const useStore = create<StoreState>((set) => ({
  // ── Auth ──────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      activeRooms: [],
      currentAuctionState: null,
      myRoster: [],
      notifications: [],
      unreadCount: 0,
    }),

  // ── UI State ──────────────────────────────────────
  isNavOpen: false,
  toggleNav: () => set((state) => ({ isNavOpen: !state.isNavOpen })),
  closeNav: () => set({ isNavOpen: false }),

  // ── Tournament-scoped data (v2 §3.3) ─────────────
  playersByTournament: {},
  roomsByTournament: {},
  activeTournamentId: null,
  setPlayersForTournament: (tournamentId, players) =>
    set((state) => ({
      playersByTournament: { ...state.playersByTournament, [tournamentId]: players },
    })),
  setRoomsForTournament: (tournamentId, rooms) =>
    set((state) => ({
      roomsByTournament: { ...state.roomsByTournament, [tournamentId]: rooms },
    })),
  setActiveTournamentId: (id) => set({ activeTournamentId: id }),

  // ── Auction Rooms ─────────────────────────────────
  activeRooms: [],
  currentAuctionState: null,
  setActiveRooms: (rooms) => set({ activeRooms: rooms }),
  setCurrentAuctionState: (state) => set({ currentAuctionState: state }),
  updateAuctionBid: (playerId, amount, bidderId, timerEndsAt) =>
    set((state) => {
      if (!state.currentAuctionState) return state
      return {
        currentAuctionState: {
          ...state.currentAuctionState,
          currentBid: amount,
          currentBidderId: bidderId,
          timerEndsAt,
          version: state.currentAuctionState.version + 1,
        },
      }
    }),
  updateAuctionPhase: (phase) =>
    set((state) => {
      if (!state.currentAuctionState) return state
      return {
        currentAuctionState: { ...state.currentAuctionState, phase },
      }
    }),

  // ── Roster ────────────────────────────────────────
  myRoster: [],
  setMyRoster: (roster) => set({ myRoster: roster }),
  updateCaptain: (playerId, isViceCaptain = false) =>
    set((state) => ({
      myRoster: state.myRoster.map((entry) => {
        if (isViceCaptain) {
          return { ...entry, isViceCaptain: entry.playerId === playerId }
        }
        return { ...entry, isCaptain: entry.playerId === playerId, isViceCaptain: false }
      }),
    })),

  // ── Chat (capped at 500 messages per room) ────────
  chatMessages: {},
  addChatMessage: (roomId, message) =>
    set((state) => {
      const existing = state.chatMessages[roomId] || []
      const updated = [...existing, message]
      // FIFO eviction: keep only the most recent 500 messages
      if (updated.length > 500) {
        updated.splice(0, updated.length - 500)
      }
      return {
        chatMessages: {
          ...state.chatMessages,
          [roomId]: updated,
        },
      }
    }),
  setChatMessages: (roomId, messages) =>
    set((state) => ({
      chatMessages: { ...state.chatMessages, [roomId]: messages },
    })),
  addChatReaction: () => {},

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
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  // ── Leaderboard ───────────────────────────────────
  leaderboard: [],
  myRank: null,
  setLeaderboard: (data) => set({ leaderboard: data }),
  setMyRank: (rank) => set({ myRank: rank }),

  // ── Viewport ──────────────────────────────────────
  isMobile: false,
  setIsMobile: (val) => set({ isMobile: val }),

  // ── Viewer counts ─────────────────────────────────
  viewerCounts: {},
  setViewerCount: (roomId, count) => set((state) => ({ viewerCounts: { ...state.viewerCounts, [roomId]: count } })),

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

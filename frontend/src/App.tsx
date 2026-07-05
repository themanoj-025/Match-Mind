import React, { lazy, Suspense, useEffect, useState, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import LiveTicker from './components/LiveTicker'
import ErrorBoundary from './components/ErrorBoundary'
import CommandPalette from './components/CommandPalette'
import PremiumLoadingScreen from './components/PremiumLoadingScreen'
import GamificationStrip from './components/GamificationStrip'
import QuickChatFeed from './components/QuickChatFeed'
import useStore from './store/useStore'

// ─── Lazy-loaded pages ──────────────────────────────────

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))
const AboutPage = lazy(() => import('./pages/static/AboutPage'))
const FAQPage = lazy(() => import('./pages/static/FAQPage'))
const NotFoundPage = lazy(() => import('./pages/static/NotFoundPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const RoomWizardPage = lazy(() => import('./pages/RoomWizardPage'))
const RoomLobbyPage = lazy(() => import('./pages/RoomLobbyPage'))
const AuctionRoomPage = lazy(() => import('./pages/AuctionRoomPage'))
const FranchisePage = lazy(() => import('./pages/FranchisePage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const MatchCenterPage = lazy(() => import('./pages/MatchCenterPage'))
const PlayerProfilePage = lazy(() => import('./pages/PlayerProfilePage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const TournamentGuard = lazy(() => import('./components/TournamentGuard'))

// ─── Tournament-scoped pages ────────────────────────────

function TournamentDashboard() {
  return <TournamentGuard><DashboardPage /></TournamentGuard>
}

function TournamentRoomWizard() {
  return <TournamentGuard requireLive><RoomWizardPage /></TournamentGuard>
}

function TournamentRoomLobby() {
  return <TournamentGuard requireLive><RoomLobbyPage /></TournamentGuard>
}

function TournamentAuctionRoom() {
  return <TournamentGuard requireLive><AuctionRoomPage /></TournamentGuard>
}

function TournamentFranchise() {
  return <TournamentGuard><FranchisePage /></TournamentGuard>
}

function TournamentLeaderboard() {
  return <TournamentGuard><LeaderboardPage /></TournamentGuard>
}

// ─── Page transition wrapper ────────────────────────────

const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
}

function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}

const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-[var(--mm-accent-green)] border-t-transparent rounded-full animate-spin" />
      <span className="text-[var(--mm-text-muted)] body">Loading...</span>
    </div>
  </div>
)

// ─── App ────────────────────────────────────────────────

export default function App() {
  const setIsMobile = useStore((s) => s.setIsMobile)
  const isAuthenticated = useStore((s) => s.isAuthenticated)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const location = useLocation()

  // Listen for viewport resize to update isMobile state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  // ⌘K / Ctrl+K toggle
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCmdOpen((prev) => !prev)
    }
    if (e.key === 'Escape') {
      setCmdOpen(false)
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Turn off initial loading after first route resolves
  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Initial loading screen (only on first visit) */}
      <PremiumLoadingScreen isLoading={initialLoading} minDisplay={800} />

      {/* Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      <Navbar />
      <LiveTicker />

      {/* Gamification Strip — shows for logged-in users only */}
      {isAuthenticated && <GamificationStrip />}

      {/* Quick Chat Feed — global floating drawer */}
      <QuickChatFeed />

      <main className="flex-1">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingFallback />}>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<AnimatedRoute><LandingPage /></AnimatedRoute>} />
                <Route path="/login" element={<AnimatedRoute><LoginPage /></AnimatedRoute>} />
                <Route path="/signup" element={<AnimatedRoute><SignupPage /></AnimatedRoute>} />
                <Route path="/forgot-password" element={<AnimatedRoute><ForgotPasswordPage /></AnimatedRoute>} />
                <Route path="/reset-password" element={<AnimatedRoute><ResetPasswordPage /></AnimatedRoute>} />
                <Route path="/verify-email" element={<AnimatedRoute><VerifyEmailPage /></AnimatedRoute>} />
                <Route path="/about" element={<AnimatedRoute><AboutPage /></AnimatedRoute>} />
                <Route path="/faq" element={<AnimatedRoute><FAQPage /></AnimatedRoute>} />
                <Route path="/404" element={<AnimatedRoute><NotFoundPage /></AnimatedRoute>} />
                <Route path="*" element={<AnimatedRoute><NotFoundPage /></AnimatedRoute>} />
                {/* ── Legacy routes (redirect to /t/:id equivalents) ── */}
                <Route path="/dashboard" element={<AnimatedRoute><DashboardPage /></AnimatedRoute>} />
                <Route path="/rooms/new" element={<AnimatedRoute><RoomWizardPage /></AnimatedRoute>} />
                <Route path="/rooms/:roomId/lobby" element={<AnimatedRoute><RoomLobbyPage /></AnimatedRoute>} />
                <Route path="/rooms/:roomId/auction" element={<AnimatedRoute><AuctionRoomPage /></AnimatedRoute>} />
                <Route path="/rooms/:roomId/franchise/:userId" element={<AnimatedRoute><FranchisePage /></AnimatedRoute>} />
                <Route path="/leaderboard" element={<AnimatedRoute><LeaderboardPage /></AnimatedRoute>} />

                {/* ── Tournament-scoped routes (§3.4) ── */}
                <Route path="/t/:tournamentId" element={<AnimatedRoute><TournamentDashboard /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/dashboard" element={<AnimatedRoute><TournamentDashboard /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/rooms/new" element={<AnimatedRoute><TournamentRoomWizard /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/rooms/:roomId/lobby" element={<AnimatedRoute><TournamentRoomLobby /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/rooms/:roomId/auction" element={<AnimatedRoute><TournamentAuctionRoom /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/rooms/:roomId/franchise/me" element={<AnimatedRoute><TournamentFranchise /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/rooms/:roomId/franchise/:userId" element={<AnimatedRoute><TournamentFranchise /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/rooms/:roomId/leaderboard" element={<AnimatedRoute><TournamentLeaderboard /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/fixtures" element={<AnimatedRoute><TournamentDashboard /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/fixtures/:fixtureId" element={<AnimatedRoute><MatchCenterPage /></AnimatedRoute>} />
                <Route path="/t/:tournamentId/players/:playerId" element={<AnimatedRoute><PlayerProfilePage /></AnimatedRoute>} />
                <Route path="/matches/:matchId" element={<AnimatedRoute><MatchCenterPage /></AnimatedRoute>} />
                <Route path="/players/:playerId" element={<AnimatedRoute><PlayerProfilePage /></AnimatedRoute>} />
                <Route path="/profile/:userId" element={<AnimatedRoute><ProfilePage /></AnimatedRoute>} />
                <Route path="/profile/me" element={<AnimatedRoute><MyProfilePage /></AnimatedRoute>} />
                <Route path="/profile/me/settings" element={<AnimatedRoute><SettingsPage /></AnimatedRoute>} />
                <Route path="/profile/me/notifications" element={<AnimatedRoute><NotificationsPage /></AnimatedRoute>} />
                <Route path="/messages" element={<AnimatedRoute><MessagesPage /></AnimatedRoute>} />
                <Route path="/pricing" element={<AnimatedRoute><PricingPage /></AnimatedRoute>} />
                <Route path="/search" element={<AnimatedRoute><SearchPage /></AnimatedRoute>} />
                <Route path="/admin" element={<AnimatedRoute><AdminPage /></AnimatedRoute>} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  )
}

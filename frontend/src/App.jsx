import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import LiveTicker from './components/LiveTicker'
import ErrorBoundary from './components/ErrorBoundary'
import CommandPalette from './components/CommandPalette'
import PremiumLoadingScreen from './components/PremiumLoadingScreen'
import GamificationStrip from './components/GamificationStrip'
import QuickChatFeed from './components/QuickChatFeed'
import useStore from './store/useStore'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const AboutPage = lazy(() => import('./pages/static/AboutPage'))
const FAQPage = lazy(() => import('./pages/static/FAQPage'))
const NotFoundPage = lazy(() => import('./pages/static/NotFoundPage'))
const FeedPage = lazy(() => import('./pages/FeedPage'))
const LiveHubPage = lazy(() => import('./pages/LiveHubPage'))
const MatchRoomPage = lazy(() => import('./pages/MatchRoomPage'))
const ScoresPage = lazy(() => import('./pages/ScoresPage'))
const PredictionsPage = lazy(() => import('./pages/PredictionsPage'))
const MakePredictionPage = lazy(() => import('./pages/MakePredictionPage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const LeaguesPage = lazy(() => import('./pages/LeaguesPage'))
const CreateLeaguePage = lazy(() => import('./pages/CreateLeaguePage'))
const LeagueRoomPage = lazy(() => import('./pages/LeagueRoomPage'))
const SquadsPage = lazy(() => import('./pages/SquadsPage'))
const SquadPage = lazy(() => import('./pages/SquadPage'))
const ExplorePage = lazy(() => import('./pages/ExplorePage'))
const HighlightsPage = lazy(() => import('./pages/HighlightsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const StandingsPage = lazy(() => import('./pages/StandingsPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const PlayerPage = lazy(() => import('./pages/PlayerPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'))
const ActivityPage = lazy(() => import('./pages/ActivityPage'))
const MessagesPage = lazy(() => import('./pages/MessagesPage'))
const PricingPage = lazy(() => import('./pages/PricingPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

// ── Page transition wrapper ────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
}

function AnimatedRoute({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-[var(--mm-accent-green)] border-t-transparent rounded-full animate-spin" />
      <span className="text-[var(--mm-text-muted)] body">Loading...</span>
    </div>
  </div>
)

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
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((prev) => !prev)
      }
      if (e.key === 'Escape' && cmdOpen) {
        setCmdOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cmdOpen])

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
                <Route path="/onboarding" element={<AnimatedRoute><OnboardingPage /></AnimatedRoute>} />
                <Route path="/about" element={<AnimatedRoute><AboutPage /></AnimatedRoute>} />
                <Route path="/faq" element={<AnimatedRoute><FAQPage /></AnimatedRoute>} />
                <Route path="/404" element={<AnimatedRoute><NotFoundPage /></AnimatedRoute>} />
                <Route path="*" element={<AnimatedRoute><NotFoundPage /></AnimatedRoute>} />
                <Route path="/feed" element={<AnimatedRoute><FeedPage /></AnimatedRoute>} />
                <Route path="/live" element={<AnimatedRoute><LiveHubPage /></AnimatedRoute>} />
                <Route path="/live/:matchId" element={<AnimatedRoute><MatchRoomPage /></AnimatedRoute>} />
                <Route path="/scores" element={<AnimatedRoute><ScoresPage /></AnimatedRoute>} />
                <Route path="/scores/:sport" element={<AnimatedRoute><ScoresPage /></AnimatedRoute>} />
                <Route path="/predictions" element={<AnimatedRoute><PredictionsPage /></AnimatedRoute>} />
                <Route path="/predictions/new/:matchId" element={<AnimatedRoute><MakePredictionPage /></AnimatedRoute>} />
                <Route path="/leaderboard" element={<AnimatedRoute><LeaderboardPage /></AnimatedRoute>} />
                <Route path="/leaderboard/:leagueId" element={<AnimatedRoute><LeaderboardPage /></AnimatedRoute>} />
                <Route path="/leagues" element={<AnimatedRoute><LeaguesPage /></AnimatedRoute>} />
                <Route path="/leagues/create" element={<AnimatedRoute><CreateLeaguePage /></AnimatedRoute>} />
                <Route path="/leagues/:leagueId" element={<AnimatedRoute><LeagueRoomPage /></AnimatedRoute>} />
                <Route path="/squads" element={<AnimatedRoute><SquadsPage /></AnimatedRoute>} />
                <Route path="/squads/:squadId" element={<AnimatedRoute><SquadPage /></AnimatedRoute>} />
                <Route path="/explore" element={<AnimatedRoute><ExplorePage /></AnimatedRoute>} />
                <Route path="/highlights" element={<AnimatedRoute><HighlightsPage /></AnimatedRoute>} />
                <Route path="/profile/:userId" element={<AnimatedRoute><ProfilePage /></AnimatedRoute>} />
                <Route path="/profile/me" element={<AnimatedRoute><MyProfilePage /></AnimatedRoute>} />
                <Route path="/profile/me/settings" element={<AnimatedRoute><SettingsPage /></AnimatedRoute>} />
                <Route path="/profile/me/notifications" element={<AnimatedRoute><NotificationsPage /></AnimatedRoute>} />
                <Route path="/standings/:sport" element={<AnimatedRoute><StandingsPage /></AnimatedRoute>} />
                <Route path="/teams/:teamId" element={<AnimatedRoute><TeamPage /></AnimatedRoute>} />
                <Route path="/players/:playerId" element={<AnimatedRoute><PlayerPage /></AnimatedRoute>} />
                <Route path="/achievements" element={<AnimatedRoute><AchievementsPage /></AnimatedRoute>} />
                <Route path="/activity" element={<AnimatedRoute><ActivityPage /></AnimatedRoute>} />
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

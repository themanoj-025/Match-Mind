import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import LiveTicker from './components/LiveTicker'
import ErrorBoundary from './components/ErrorBoundary'
import useStore from './store/useStore'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
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
const AdminPage = lazy(() => import('./pages/AdminPage'))

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

  // Listen for viewport resize to update isMobile state
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <LiveTicker />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/live" element={<LiveHubPage />} />
              <Route path="/live/:matchId" element={<MatchRoomPage />} />
              <Route path="/scores" element={<ScoresPage />} />
              <Route path="/scores/:sport" element={<ScoresPage />} />
              <Route path="/predictions" element={<PredictionsPage />} />
              <Route path="/predictions/new/:matchId" element={<MakePredictionPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/leaderboard/:leagueId" element={<LeaderboardPage />} />
              <Route path="/leagues" element={<LeaguesPage />} />
              <Route path="/leagues/create" element={<CreateLeaguePage />} />
              <Route path="/leagues/:leagueId" element={<LeagueRoomPage />} />
              <Route path="/squads" element={<SquadsPage />} />
              <Route path="/squads/:squadId" element={<SquadPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/highlights" element={<HighlightsPage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/profile/me" element={<MyProfilePage />} />
              <Route path="/profile/me/settings" element={<SettingsPage />} />
              <Route path="/profile/me/notifications" element={<NotificationsPage />} />
              <Route path="/standings/:sport" element={<StandingsPage />} />
              <Route path="/teams/:teamId" element={<TeamPage />} />
              <Route path="/players/:playerId" element={<PlayerPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <BottomNav />
    </div>
  )
}

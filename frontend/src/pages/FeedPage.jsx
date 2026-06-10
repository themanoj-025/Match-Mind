import React from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react'
import useStore from '../store/useStore'
import MatchCard from '../components/MatchCard'

export default function FeedPage() {
  const { liveMatches } = useStore()

  const topPredictors = [
    { name: 'SportsKing', pts: 8420, rank: 1 },
    { name: 'GoalPredictor', pts: 7910, rank: 2 },
    { name: 'HoopsMaster', pts: 7650, rank: 3 },
  ]

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Welcome */}
            <div className="bg-[var(--gradient-hero)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8 mb-6">
              <h1 className="display-l mb-2">Welcome back!</h1>
              <p className="body-large text-[var(--mm-text-secondary)] mb-4">3 matches live now. Ready to make your predictions?</p>
              <Link to="/predictions/new/upcoming" className="inline-flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-6 py-2.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300">
                Quick Predict <Zap size={16} />
              </Link>
            </div>

            {/* Live Matches */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
                  Live Now
                </h2>
                <Link to="/live" className="caption text-[var(--mm-accent-green)] font-medium hover:underline">View all</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {liveMatches.filter(m => m.status === 'LIVE').slice(0, 4).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onEnterRoom={() => {}}
                    onPredict={() => {}}
                  />
                ))}
                {liveMatches.filter(m => m.status === 'LIVE').length === 0 && (
                  <div className="col-span-full text-center py-12 text-[var(--mm-text-muted)]">
                    <p className="body">No live matches right now</p>
                    <Link to="/live" className="text-[var(--mm-accent-green)] body font-medium mt-2 inline-block hover:underline">View upcoming matches</Link>
                  </div>
                )}
              </div>
            </section>

            {/* Upcoming */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-2">Upcoming Matches</h2>
                <Link to="/scores" className="caption text-[var(--mm-accent-green)] font-medium hover:underline">Scores & Fixtures</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <MatchCard
                    key={i}
                    match={{
                      id: `upcoming-${i}`,
                      homeTeam: `Team ${String.fromCharCode(64 + i)}`,
                      awayTeam: `Team ${String.fromCharCode(69 + i)}`,
                      homeScore: null,
                      awayScore: null,
                      status: 'SCHEDULED',
                      minute: 0,
                      competition: 'Premier League',
                      sport: 'football',
                      scheduledAt: new Date(Date.now() + (i * 3600000)).toISOString(),
                    }}
                    onEnterRoom={() => {}}
                    onPredict={() => {}}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            {/* My Stats */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 mb-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">My Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                  <span className="block font-bold font-[var(--font-display)] text-xl text-[var(--mm-accent-amber)]">0</span>
                  <span className="caption text-[var(--mm-text-muted)]">Points</span>
                </div>
                <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                  <span className="block font-bold font-[var(--font-display)] text-xl text-[var(--mm-accent-green)]">0%</span>
                  <span className="caption text-[var(--mm-text-muted)]">Accuracy</span>
                </div>
              </div>
            </div>

            {/* Top Predictors */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 mb-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Top Predictors</h3>
              <div className="flex flex-col gap-2">
                {topPredictors.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center caption font-bold text-[var(--mm-text-muted)]">{p.rank}</span>
                    <span className="body flex-1">{p.name}</span>
                    <span className="caption text-[var(--mm-accent-amber)]">🪙 {p.pts.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Link to="/leaderboard" className="flex items-center gap-1 mt-3 caption text-[var(--mm-accent-green)] font-medium hover:underline">
                Full leaderboard <ArrowRight size={12} />
              </Link>
            </div>

            {/* Trending */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Trending Rooms</h3>
              <div className="flex flex-col gap-3">
                {[
                  { match: 'Man City vs Arsenal', viewers: '1,247' },
                  { match: 'Lakers vs Celtics', viewers: '982' },
                  { match: 'Djokovic vs Alcaraz', viewers: '756' },
                ].map((room, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--mm-accent-green)]" />
                    <span className="body flex-1 truncate">{room.match}</span>
                    <span className="caption text-[var(--mm-text-muted)]">👥 {room.viewers}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

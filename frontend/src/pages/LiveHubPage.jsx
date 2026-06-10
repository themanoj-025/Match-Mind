import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import MatchCard from '../components/MatchCard'
import useStore from '../store/useStore'

const sports = [
  { id: 'all', label: 'All', icon: '🏆' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'american_football', label: 'NFL', icon: '🏈' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'hockey', label: 'Hockey', icon: '🏒' },
]

export default function LiveHubPage() {
  const [activeSport, setActiveSport] = useState('all')
  const [dateOffset, setDateOffset] = useState(0)
  const navigate = useNavigate()
  const { liveMatches } = useStore()

  const getTodayLabel = () => {
    if (dateOffset === -1) return 'Yesterday'
    if (dateOffset === 0) return 'Today'
    if (dateOffset === 1) return 'Tomorrow'
    const d = new Date(Date.now() + dateOffset * 86400000)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getFilteredMatches = (status) => {
    return liveMatches
      .filter((m) => activeSport === 'all' || m.sport === activeSport)
      .filter((m) => m.status === status)
  }

  const liveMatchList = getFilteredMatches('LIVE')
  const upcomingList = getFilteredMatches('SCHEDULED')
  const finishedList = getFilteredMatches('FINISHED')

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>Live Matches & Scores — Football, NBA, NFL, Tennis, Cricket, Hockey | MatchMind</title>
        <meta name="description" content={`Watch live sports matches in real-time. ${liveMatchList.length} matches live now across football, basketball, NFL, tennis, cricket, and hockey. Live scores, stats, and chat.`} />
        <meta property="og:title" content="Live Matches & Scores — MatchMind" />
        <meta property="og:description" content={`Watch live sports. ${liveMatchList.length} matches in play right now. ${upcomingList.length} upcoming fixtures. Predict, compete, and chat.`} />
        <meta property="og:image" content="https://matchmind.gg/og-live.jpg" />
        <meta property="og:image:alt" content="Live Matches — MatchMind" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/live" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Live Matches & Scores — MatchMind" />
        <meta name="twitter:description" content="Live scores, stats, and chat for all sports." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="heading-1">Matches</h1>
          <div className="flex items-center gap-2">
            <span className="caption text-[var(--mm-text-muted)]">👥 12,847 online</span>
          </div>
        </div>

        {/* Sport Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setActiveSport(sport.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all duration-200 ${
                activeSport === sport.id
                  ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                  : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)] hover:text-[var(--mm-text-primary)]'
              }`}
            >
              <span>{sport.icon}</span>
              <span>{sport.label}</span>
            </button>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDateOffset((d) => d - 1)} className="p-2 rounded-[var(--radius-md)] bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 bg-[var(--mm-bg-tertiary)] px-4 py-2 rounded-[var(--radius-md)]">
            <Calendar size={16} className="text-[var(--mm-accent-green)]" />
            <span className="body font-medium">{getTodayLabel()}</span>
          </div>
          <button onClick={() => setDateOffset((d) => d + 1)} className="p-2 rounded-[var(--radius-md)] bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Live Section */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
                <h2 className="heading-2 text-[var(--mm-accent-green)]">Happening Now</h2>
                <span className="caption text-[var(--mm-text-muted)]">({liveMatchList.length} matches)</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {liveMatchList.length > 0 ? liveMatchList.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onEnterRoom={() => navigate(`/live/${match.id}`)}
                    onPredict={() => navigate(`/predictions/new/${match.id}`)}
                  />
                )) : (
                  <div className="col-span-full text-center py-12 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
                    <p className="body text-[var(--mm-text-muted)]">No live matches right now</p>
                    <p className="caption text-[var(--mm-text-muted)] mt-1">Check back soon for action</p>
                  </div>
                )}
              </div>
            </section>

            {/* Upcoming Section */}
            <section className="mb-8">
              <h2 className="heading-2 mb-4">Coming Up</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {upcomingList.length > 0 ? upcomingList.slice(0, 6).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onEnterRoom={() => navigate(`/live/${match.id}`)}
                    onPredict={() => navigate(`/predictions/new/${match.id}`)}
                  />
                )) : (
                  <div className="col-span-full text-center py-8">
                    <p className="body text-[var(--mm-text-muted)]">No upcoming matches for this filter</p>
                  </div>
                )}
              </div>
            </section>

            {/* Finished Section */}
            {finishedList.length > 0 && (
              <section>
                <h2 className="heading-2 mb-4">Final Scores</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {finishedList.slice(0, 4).map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onEnterRoom={() => navigate(`/live/${match.id}`)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 mb-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Top Predictors Online</h3>
              {[
                { name: 'SportsKing', pts: 8420, acc: 78 },
                { name: 'GoalPredictor', pts: 7910, acc: 74 },
                { name: 'HoopsMaster', pts: 7650, acc: 71 },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <span className="caption text-[var(--mm-text-muted)] w-5">{i + 1}</span>
                  <span className="body flex-1">{p.name}</span>
                  <span className="caption text-[var(--mm-accent-amber)]">🪙{p.pts.toLocaleString()}</span>
                </div>
              ))}
              <Link to="/leaderboard" className="block mt-3 caption text-[var(--mm-accent-green)] font-medium hover:underline">View all</Link>
            </div>

            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Trending Rooms</h3>
              {[
                { match: 'Man City vs Arsenal', viewers: '1,247' },
                { match: 'Lakers vs Celtics', viewers: '982' },
                { match: 'Djokovic vs Alcaraz', viewers: '756' },
              ].map((room, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--mm-accent-green)]" />
                  <span className="body flex-1 truncate">{room.match}</span>
                  <span className="caption text-[var(--mm-text-muted)]">👥 {room.viewers}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

// @ts-nocheck
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, Clock, Zap, TrendingUp, Flame, Sparkles } from 'lucide-react'
import MatchCard from '../components/MatchCard'
import CommunityPollWidget from '../components/CommunityPollWidget'
import { useMatches, useLeaderboard } from '../hooks/useApi'
import type { Match, LeaderboardEntry } from '../lib/types'

const sports: { id: string; label: string; icon: string }[] = [
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

  const today = new Date(Date.now() + dateOffset * 86400000)
  const dateStr = today.toISOString().split('T')[0]

  const { data: liveMatches = [], isLoading: matchesLoading } = useMatches({
    sport: activeSport === 'all' ? undefined : activeSport,
  })
  const { data: topUsers = [] } = useLeaderboard('global')

  const getTodayLabel = (): string => {
    if (dateOffset === -1) return 'Yesterday'
    if (dateOffset === 0) return 'Today'
    if (dateOffset === 1) return 'Tomorrow'
    return today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const liveMatchList: Match[] = liveMatches.filter((m: Match) => m.status === 'SIMULATING')
  const upcomingList: Match[] = liveMatches.filter((m: Match) => m.status === 'SCHEDULED')
  const finishedList: Match[] = liveMatches.filter((m: Match) => m.status === 'FINISHED' || m.status === 'COMPLETED')

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
                  <div className="col-span-full text-center py-12 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden relative">
                    {/* Radar scanning animation */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                        <div className="absolute inset-0 rounded-full border border-[var(--mm-accent-green)]/20 animate-glow-pulse" />
                        <div className="absolute inset-4 rounded-full border border-[var(--mm-accent-green)]/15" />
                        <div className="absolute inset-8 rounded-full border border-[var(--mm-accent-green)]/10" />
                        <div className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-[var(--mm-accent-green)]/40 to-transparent origin-bottom animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                    </div>
                    <div className="relative z-10">
                      <span className="text-5xl block mb-4">📡</span>
                      <p className="body-large text-[var(--mm-text-secondary)] font-semibold">The pitches are quiet right now...</p>
                      <p className="body text-[var(--mm-text-muted)] mt-1">Scanning for upcoming action</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Happening Next - Major matches with countdown */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={18} className="text-[var(--mm-accent-blue)]" />
                <h2 className="heading-2">Happening Next</h2>
                <span className="caption text-[var(--mm-text-muted)]">({upcomingList.length} matches)</span>
              </div>
              {upcomingList.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {upcomingList.slice(0, 4).map((match) => {
                    const timeUntil = match.scheduledAt ? Math.floor((new Date(match.scheduledAt).getTime() - new Date().getTime()) / 3600000) : null
                    return (
                      <div key={match.id} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden hover:border-[var(--border-active)] transition-all group">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="caption text-[var(--mm-text-muted)]">{match.competition || 'Upcoming'}</span>
                            {timeUntil !== null && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)]">
                                <Clock size={12} className="text-[var(--mm-accent-amber)]" />
                                <span className="caption font-semibold text-[var(--mm-accent-amber)]">{timeUntil}h</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mm-accent-green)]/20 to-[var(--mm-accent-blue)]/20 flex items-center justify-center">
                                <span className="text-xs font-bold">{(match.homeTeamName || match.homeTeam || 'H').charAt(0)}</span>
                              </div>
                              <span className="body font-semibold">{match.homeTeamName || match.homeTeam}</span>
                            </div>
                            <span className="body text-[var(--mm-text-muted)] mx-2">vs</span>
                            <div className="flex items-center gap-2">
                              <span className="body font-semibold">{match.awayTeamName || match.awayTeam}</span>
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)]/20 to-[var(--mm-accent-purple)]/20 flex items-center justify-center">
                                <span className="text-xs font-bold">{(match.awayTeamName || match.awayTeam || 'A').charAt(0)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/predictions/new/${match.id}`)}
                              className="flex-1 bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)] body font-semibold py-2 rounded-[var(--radius-md)] hover:bg-[var(--mm-accent-green)] hover:text-[var(--mm-text-inverse)] transition-all"
                            >
                              Predict Now
                            </button>
                            <button
                              onClick={() => navigate(`/live/${match.id}`)}
                              className="px-3 py-2 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-all"
                            >
                              <Calendar size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
                  <p className="body text-[var(--mm-text-muted)]">No upcoming matches</p>
                </div>
              )}
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
                      onPredict={undefined}
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
              {topUsers.slice(0, 3).map((p: LeaderboardEntry, i: number) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <span className="caption text-[var(--mm-text-muted)] w-5">{i + 1}</span>
                  <span className="body flex-1">{p.name || p.displayName || p.username}</span>
                  <span className="caption text-[var(--mm-accent-amber)]">🪙{(p.points || p.totalPoints || 0).toLocaleString()}</span>
                </div>
              ))}
              {topUsers.length === 0 && !matchesLoading && (
                <div className="text-center py-4 text-[var(--mm-text-muted)] caption">No data yet</div>
              )}
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

            {/* Community Poll */}
            <div className="mb-4">
              <CommunityPollWidget />
            </div>

            {/* Hot Predictions */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Flame size={14} className="text-[var(--mm-accent-red)]" /> Hot Predictions</h3>
              <div className="flex flex-col gap-3">
                {upcomingList.length > 0 ? upcomingList.slice(0, 3).map((match, i) => (
                  <div key={match.id || i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center text-xs font-bold text-[var(--mm-text-muted)]">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <span className="body truncate block">{(match.homeTeamName || match.homeTeam)} vs {(match.awayTeamName || match.awayTeam)}</span>
                      <span className="caption text-[var(--mm-text-muted)]">🔥 {Math.floor(Math.random() * 200 + 50)} predictions</span>
                    </div>
                    <button
                      onClick={() => navigate(`/predictions/new/${match.id}`)}
                      className="px-2 py-1 text-[10px] font-semibold bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)] rounded-[var(--radius-sm)] hover:bg-[var(--mm-accent-green)] hover:text-[var(--mm-text-inverse)] transition-all"
                    >
                      Predict
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-3 text-[var(--mm-text-muted)] caption">No predictions data yet</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}


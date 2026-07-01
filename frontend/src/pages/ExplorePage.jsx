import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Flame, Users, ChevronRight, Zap, Trophy, ArrowUp, Eye } from 'lucide-react'
import { useMatches, useLeaderboard } from '../hooks/useApi'

const SPORT_EMOJI_MAP = {
  FOOTBALL: '⚽', BASKETBALL: '🏀', AMERICAN_FOOTBALL: '🏈',
  TENNIS: '🎾', CRICKET: '🏏', HOCKEY: '🏒',
}

function getSportEmoji(sport) {
  return SPORT_EMOJI_MAP[sport] || '⚽'
}

const SPORTS_GRID = [
  { icon: '⚽', name: 'Football', key: 'football', color: 'var(--sport-football)' },
  { icon: '🏀', name: 'Basketball', key: 'basketball', color: 'var(--sport-basketball)' },
  { icon: '🏈', name: 'NFL', key: 'american_football', color: 'var(--sport-american-fb)' },
  { icon: '🎾', name: 'Tennis', key: 'tennis', color: 'var(--sport-tennis)' },
  { icon: '🏏', name: 'Cricket', key: 'cricket', color: 'var(--sport-cricket)' },
  { icon: '🏒', name: 'Hockey', key: 'hockey', color: 'var(--sport-hockey)' },
]

const HOT_THIS_WEEK = [
  { title: 'El Clásico', emoji: '🔥', predCount: 1240, viewerCount: 3200 },
  { title: 'Premier League GW 28', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', predCount: 890, viewerCount: 2100 },
  { title: 'NBA Finals Game 7', emoji: '🏀', predCount: 760, viewerCount: 1800 },
]

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const { data: allMatches = [] } = useMatches()
  const { data: topUsers = [] } = useLeaderboard('global')

  const liveMatches = allMatches.filter(m => m.status === 'SIMULATING').slice(0, 4)
  const topPredictors = topUsers.slice(0, 5)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  const activityMeterHeights = useMemo(() =>
    liveMatches.map(() => ({
      height: 40 + Math.floor(Math.random() * 55),
      viewerCount: Math.floor(Math.random() * 500 + 50),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const sportsWithLive = useMemo(() =>
    SPORTS_GRID.map((s, i) => ({ ...s, live: [1, 2, 0, 1, 0, 0][i] })),
    []
  )

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-1">Explore</h1>
          <Link to="/search" className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-full)] text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] hover:border-[var(--border-active)] caption font-medium transition-all">
            <Search size={14} /> Advanced Search
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search matches, teams, players, leagues, users..."
              className="w-full bg-[var(--mm-bg-secondary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-xl)] pl-12 pr-4 py-4 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none focus:ring-[3px] focus:ring-[var(--mm-accent-green-glow)] transition-all"
            />
          </div>
        </form>

        {/* Trending Now — with activity meter */}
        <section className="mb-8">
          <h2 className="heading-2 flex items-center gap-2 mb-4">
            <Flame size={22} className="text-[var(--mm-accent-red)]" />
            Trending Now
            {liveMatches.length > 0 && (
              <span className="caption text-[var(--mm-text-muted)] font-normal">· {liveMatches.length} live</span>
            )}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {liveMatches.length > 0 ? liveMatches.map((match) => (
              <Link key={match.id} to={`/live/${match.id}`} className="group bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3 hover:border-[var(--border-active)] hover:shadow-[var(--shadow-card)] transition-all duration-300">
                {/* Activity meter bar */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-1 h-10 rounded-full bg-[var(--mm-bg-tertiary)] overflow-hidden relative">
                    <div
                      className="absolute bottom-0 w-full rounded-full"
                      style={{
                        height: `${activityMeterHeights[idx]?.height || 60}%`,
                        background: 'var(--gradient-live)',
                      }}
                    />
                  </div>
                  <span className="caption text-[10px] text-[var(--mm-text-muted)]">{match.viewersCount?.toLocaleString() || (activityMeterHeights[idx]?.viewerCount || 100).toLocaleString()}</span>
                </div>
                <span className="text-2xl shrink-0">{getSportEmoji(match.sport)}</span>
                <div className="flex-1 min-w-0">
                  <span className="body font-semibold block truncate">{match.homeTeamName || match.homeTeam} vs {match.awayTeamName || match.awayTeam}</span>
                  <span className="caption text-[var(--mm-text-muted)] block">{match.competition || 'Live event'}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {match.status === 'SIMULATING' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
                  )}
                  <ChevronRight size={16} className="text-[var(--mm-text-muted)] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )) : (
              <div className="col-span-2 text-center py-12 text-[var(--mm-text-muted)] bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
                <Eye size={32} className="mx-auto mb-2 opacity-50" />
                <p className="body">No live matches right now. Check upcoming fixtures.</p>
                <Link to="/scores" className="text-[var(--mm-accent-green)] body font-medium mt-2 inline-block hover:underline">View Scores →</Link>
              </div>
            )}
          </div>
        </section>

        {/* Hot This Week */}
        <section className="mb-8">
          <h2 className="heading-2 flex items-center gap-2 mb-4">
            <Zap size={20} className="text-[var(--mm-accent-amber)]" />
            Hot This Week
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {HOT_THIS_WEEK.map((item, i) => (
              <Link
                key={i}
                to="/live"
                className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] hover:shadow-[var(--shadow-card)] transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[var(--mm-accent-red)]" />
                    <span className="caption text-[var(--mm-accent-red)] font-semibold">Trending</span>
                  </div>
                  <ArrowUp size={14} className="text-[var(--mm-accent-green)]" />
                </div>
                <h4 className="body font-semibold mb-1">{item.title} {item.emoji}</h4>
                <div className="flex items-center gap-3">
                  <span className="caption text-[var(--mm-accent-amber)]">🪙 {item.predCount.toLocaleString()} predictions</span>
                  <span className="caption text-[var(--mm-text-muted)]">👥 {item.viewerCount.toLocaleString()} watching</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Sports Grid */}
        <section className="mb-8">
          <h2 className="heading-2 mb-4">Sports</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {sportsWithLive.map((sport) => (
              <Link key={sport.key} to={`/scores/${sport.key}`} className="relative bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center hover:border-[var(--border-active)] hover:shadow-[var(--shadow-card)] transition-all duration-300 group">
                {sport.live > 0 && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[var(--radius-full)] bg-[var(--mm-accent-green)]/10 text-[10px] font-semibold" style={{ color: 'var(--mm-accent-green)' }}>
                    <span className="w-1 h-1 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
                    {sport.live}
                  </span>
                )}
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform duration-300">{sport.icon}</span>
                <span className="body font-medium" style={{ color: sport.color }}>{sport.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Competitions & Predictors */}
        <div className="grid sm:grid-cols-2 gap-6">
          <section>
            <h2 className="heading-3 mb-3 flex items-center gap-2"><Trophy size={18} className="text-[var(--mm-accent-amber)]" /> Top Competitions</h2>
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              {[
                { name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', count: 1240 },
                { name: 'Champions League', icon: '⭐', count: 890 },
                { name: 'NBA', icon: '🏀', count: 760 },
                { name: 'NFL', icon: '🏈', count: 540 },
                { name: 'IPL', icon: '🏏', count: 320 },
              ].map((comp, i) => (
                <Link key={i} to={`/standings/${comp.name.toLowerCase().replace(/\s/g, '_')}`} className="flex items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)] -mx-2 px-2 rounded-[var(--radius-sm)] transition-colors">
                  <span className="text-xl">{comp.icon}</span>
                  <span className="body flex-1">{comp.name}</span>
                  <span className="caption text-[var(--mm-text-muted)]">{comp.count.toLocaleString()} predictions</span>
                </Link>
              ))}
            </div>
          </section>
          <section>
            <h2 className="heading-3 mb-3 flex items-center gap-2"><Trophy size={18} className="text-[var(--mm-accent-amber)]" /> Top Predictors</h2>
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              {topPredictors.length > 0 ? topPredictors.map((p, i) => (
                <Link key={p.id || i} to={`/profile/${p.id || i}`} className="flex items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)] -mx-2 px-2 rounded-[var(--radius-sm)] transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-[var(--mm-text-inverse)] ${i < 3 ? 'bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)]' : 'bg-[var(--mm-bg-tertiary)]'}`}>
                    {(p.displayName || p.username || p.name || 'U').charAt(0)}
                  </div>
                  <span className="body flex-1">{p.displayName || p.username || p.name}</span>
                  <span className="caption text-[var(--mm-accent-amber)]">🪙 {(p.totalPoints || p.points || 0).toLocaleString()}</span>
                </Link>
              )) : (
                <div className="text-center py-4 text-[var(--mm-text-muted)] caption">No data yet</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Flame, Users, ChevronRight } from 'lucide-react'

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="heading-1 mb-6">Explore</h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-xl">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search matches, teams, players, leagues, users..."
              className="w-full bg-[var(--mm-bg-secondary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-xl)] pl-12 pr-4 py-4 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none"
            />
          </div>
        </form>

        {/* Trending */}
        <section className="mb-8">
          <h2 className="heading-2 flex items-center gap-2 mb-4"><Flame size={22} className="text-[var(--mm-accent-red)]" /> Trending Now</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { match: 'Man City vs Arsenal', viewers: '1,247', sport: '⚽' },
              { match: 'Lakers vs Celtics', viewers: '982', sport: '🏀' },
              { match: 'Djokovic vs Alcaraz', viewers: '756', sport: '🎾' },
              { match: 'CSK vs MI', viewers: '634', sport: '🏏' },
            ].map((item, i) => (
              <Link key={i} to={`/live/${i}`} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3 hover:border-[var(--border-active)] transition-all">
                <span className="text-2xl">{item.sport}</span>
                <div className="flex-1">
                  <span className="body font-semibold">{item.match}</span>
                  <span className="caption text-[var(--mm-text-muted)] block">👥 {item.viewers} watching</span>
                </div>
                <ChevronRight size={18} className="text-[var(--mm-text-muted)]" />
              </Link>
            ))}
          </div>
        </section>

        {/* Sports Grid */}
        <section className="mb-8">
          <h2 className="heading-2 mb-4">Sports</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {[
              { icon: '⚽', name: 'Football', color: 'var(--sport-football)' },
              { icon: '🏀', name: 'Basketball', color: 'var(--sport-basketball)' },
              { icon: '🏈', name: 'NFL', color: 'var(--sport-american-fb)' },
              { icon: '🎾', name: 'Tennis', color: 'var(--sport-tennis)' },
              { icon: '🏏', name: 'Cricket', color: 'var(--sport-cricket)' },
              { icon: '🏒', name: 'Hockey', color: 'var(--sport-hockey)' },
            ].map((sport, i) => (
              <Link key={i} to={`/scores/${sport.name.toLowerCase()}`} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center hover:border-[var(--border-active)] transition-all group">
                <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{sport.icon}</span>
                <span className="body font-medium" style={{ color: sport.color }}>{sport.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Competitions & Predictors */}
        <div className="grid sm:grid-cols-2 gap-6">
          <section>
            <h2 className="heading-3 mb-3">Top Competitions</h2>
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              {['Premier League', 'Champions League', 'NBA', 'NFL', 'IPL'].map((comp, i) => (
                <Link key={i} to={`/standings/${comp.toLowerCase().replace(/\s/g, '_')}`} className="flex items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)] -mx-2 px-2 rounded-[var(--radius-sm)]">
                  <span className="text-xl">{['🏴󠁧󠁢󠁥󠁮󠁧󠁿', '⭐', '🏀', '🏈', '🏏'][i]}</span>
                  <span className="body">{comp}</span>
                </Link>
              ))}
            </div>
          </section>
          <section>
            <h2 className="heading-3 mb-3">Top Predictors</h2>
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              {[
                { name: 'SportsKing', pts: 8420 },
                { name: 'GoalPredictor', pts: 7910 },
                { name: 'HoopsMaster', pts: 7650 },
              ].map((p, i) => (
                <Link key={i} to={`/profile/user-${i}`} className="flex items-center gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)] -mx-2 px-2 rounded-[var(--radius-sm)]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center text-xs font-bold text-[var(--mm-text-inverse)]">{p.name.charAt(0)}</div>
                  <span className="body flex-1">{p.name}</span>
                  <span className="caption text-[var(--mm-accent-amber)]">🪙 {p.pts.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

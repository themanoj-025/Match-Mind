// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ArrowLeft, User, ChevronRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearch } from '../hooks/useApi'

const SUGGESTED_SEARCHES = [
  { label: 'Live Matches', path: '/live', icon: '⚽' },
  { label: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
  { label: 'NBA Standings', path: '/standings/nba', icon: '🏀' },
  { label: 'Champions League', path: '/live', icon: '⭐' },
  { label: 'Premier League', path: '/standings/premier_league', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { label: 'Pricing', path: '/pricing', icon: '✨' },
]

// Mock search results
const ITEM_TYPES = ['matches', 'users', 'teams', 'players']
const TYPE_LABELS = { matches: 'Matches', users: 'Users', teams: 'Teams', players: 'Players' }
const TYPE_ICONS = { matches: '⚽', users: '👤', teams: '🏟️', players: '🎽' }

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [activeTab, setActiveTab] = useState('all')
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  const { data: searchData } = useSearch(query.trim())

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleQueryChange = (value) => {
    setQuery(value)
    setSearchParams(value ? { q: value } : {}, { replace: true })
    setSelectedIdx(-1)
  }

  // Build results from API data
  const results = useMemo(() => {
    if (!query.trim() || !searchData) return null

    const mapped = [
      {
        type: 'matches',
        items: (searchData.matches || []).map(m => ({
          id: m.id, label: `${m.homeTeamName} vs ${m.awayTeamName}`, icon: '⚽',
          path: `/live/${m.id}`, meta: `${m.competition} · ${m.status === 'FINISHED' ? `${m.homeScore}-${m.awayScore}` : new Date(m.scheduledAt).toLocaleDateString()}`,
        })),
      },
      {
        type: 'users',
        items: (searchData.users || []).map(u => ({
          id: u.id, label: u.displayName || u.username, icon: User,
          path: `/profile/${u.id}`, meta: `${u.totalPoints || 0} pts · ${u.predAccuracy || 0}% acc`,
        })),
      },
      {
        type: 'teams',
        items: (searchData.teams || []).map(t => ({
          id: t.id, label: t.name, icon: '🏟️',
          path: `/teams/${t.id}`, meta: t.sport?.toLowerCase() || 'Sport',
        })),
      },
      {
        type: 'players',
        items: (searchData.players || []).map(p => ({
          id: p.id, label: p.name, icon: '🎽',
          path: `/players/${p.id}`, meta: p.team?.name || 'Free Agent',
        })),
      },
    ].filter(r => r.items.length > 0)

    return mapped
  }, [query, searchData])

  const totalResults = useMemo(() => {
    if (!results) return 0
    return results.reduce((sum, r) => sum + r.items.length, 0)
  }, [results])

  const filteredResults = useMemo(() => {
    if (!results) return []
    if (activeTab === 'all') return results
    return results.filter(r => r.type === activeTab)
  }, [results, activeTab])

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(prev => Math.min(prev + 1, totalResults - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>{query ? `Search: ${query} — MatchMind` : 'Search — MatchMind'}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Search Input */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-4 mb-6">
            <Link to="/explore" className="p-1 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search matches, teams, players, users, leagues..."
                className="w-full bg-[var(--mm-bg-secondary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-xl)] pl-11 pr-10 py-4 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-[3px] focus:ring-[var(--mm-accent-green-glow)] transition-all"
                autoComplete="off"
              />
              {query && (
                <button onClick={() => handleQueryChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--mm-text-muted)] hover:text-[var(--mm-text-primary)] transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Suggested Searches (no query) */}
        {!query.trim() && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <h2 className="heading-3 mb-3">Quick Search</h2>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SEARCHES.map((s, i) => (
                <Link
                  key={i}
                  to={s.path}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-full)] hover:border-[var(--border-active)] hover:bg-[var(--mm-bg-hover)] transition-all body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]"
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {query.trim() && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            {/* Type Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all ${
                  activeTab === 'all' ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold' : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
                }`}
              >
                All Results ({totalResults})
              </button>
              {results && results.map((r) => (
                <button
                  key={r.type}
                  onClick={() => setActiveTab(r.type)}
                  className={`px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all ${
                    activeTab === r.type ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold' : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
                  }`}
                >
                  {TYPE_LABELS[r.type]} ({r.items.length})
                </button>
              ))}
            </div>

            {/* Content */}
            {filteredResults.length > 0 ? (
              <div ref={resultsRef} className="space-y-4">
                {filteredResults.map((section) => (
                  <div key={section.type}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{TYPE_ICONS[section.type]}</span>
                      <h2 className="heading-3">{TYPE_LABELS[section.type]}</h2>
                      <span className="caption text-[var(--mm-text-muted)]">({section.items.length})</span>
                    </div>
                    <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
                      {section.items.map((item, i) => {
                        const ItemIcon = typeof item.icon === 'function' ? item.icon : null
                        return (
                          <Link
                            key={item.id}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)] transition-colors group"
                          >
                            {/* Icon */}
                            {ItemIcon ? (
                              <div className="w-9 h-9 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center shrink-0">
                                <ItemIcon size={16} className="text-[var(--mm-text-muted)]" />
                              </div>
                            ) : (
                              <span className="text-xl w-9 text-center shrink-0">{item.icon}</span>
                            )}

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                              <span className="body font-medium block truncate">{item.label}</span>
                              {item.meta && <span className="caption text-[var(--mm-text-muted)]">{item.meta}</span>}
                            </div>

                            <ChevronRight size={16} className="text-[var(--mm-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)]">
                <Search size={36} className="mx-auto mb-3 text-[var(--mm-text-muted)]" />
                <p className="body-large text-[var(--mm-text-muted)]">No results for "{query}"</p>
                <p className="body text-[var(--mm-text-muted)] mt-1">Try a different search term or browse suggested searches</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}


import React, { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, Clock, Filter, TrendingUp, Zap, Users, ThumbsUp, Minus, ThumbsDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MatchCard from '../components/MatchCard'
import SportBadge from '../components/SportBadge'
import { useMatches } from '../hooks/useApi'
import CommunityPollWidget from '../components/CommunityPollWidget'

const sports = [
  { id: 'all', label: 'All', icon: '🏆', color: '#FFFFFF' },
  { id: 'football', label: 'Football', icon: '⚽', color: '#2ECC40' },
  { id: 'basketball', label: 'Basketball', icon: '🏀', color: '#FF851B' },
  { id: 'american_football', label: 'NFL', icon: '🏈', color: '#B10DC9' },
  { id: 'tennis', label: 'Tennis', icon: '🎾', color: '#FFDC00' },
  { id: 'cricket', label: 'Cricket', icon: '🏏', color: '#7FDBFF' },
  { id: 'hockey', label: 'Hockey', icon: '🏒', color: '#01FF70' },
]

const cardVariants = {
  initial: { opacity: 0, y: 12 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.3, delay: i * 0.04 } }),
}

export default function ScoresPage() {
  const { sport: sportParam } = useParams()
  const navigate = useNavigate()
  const [activeSport, setActiveSport] = useState(sportParam || 'all')
  const [dateOffset, setDateOffset] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [quickVotes, setQuickVotes] = useState({})

  const today = new Date(Date.now() + dateOffset * 86400000)
  const dateStr = today.toISOString().split('T')[0]

  const { data: allMatches = [], isLoading } = useMatches({
    sport: activeSport === 'all' ? undefined : activeSport,
    date: dateOffset !== 0 ? dateStr : undefined,
  })

  const getDateLabel = () => {
    if (dateOffset === -1) return 'Yesterday'
    if (dateOffset === 0) return 'Today'
    if (dateOffset === 1) return 'Tomorrow'
    return today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  // Group matches by competition
  const byCompetition = useMemo(() => {
    const map = {}
    allMatches.forEach(m => {
      const key = m.competition || 'Other'
      if (!map[key]) map[key] = { name: key, matches: [], sportKey: (m.sport || '').toLowerCase() }
      map[key].matches.push(m)
    })
    return Object.values(map)
  }, [allMatches])

  // Quick stats
  const liveCount = allMatches.filter(m => m.status === 'SIMULATING').length
  const finishedCount = allMatches.filter(m => m.status === 'FINISHED' || m.status === 'COMPLETED').length
  const upcomingCount = allMatches.filter(m => m.status === 'SCHEDULED').length
  const predictCount = upcomingCount

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>Scores & Fixtures — MatchMind</title>
        <meta name="description" content="Live scores, fixtures, and results across all 6 sports on MatchMind." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-1 mb-1">Scores & Fixtures</h1>
            <p className="body text-[var(--mm-text-secondary)]">Live scores, results, and upcoming fixtures across all sports</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[var(--mm-text-muted)]">
            <Users size={14} />
            <span className="caption">12,847 online</span>
          </div>
        </motion.div>

        {/* Sport Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none"
        >
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setActiveSport(sport.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all duration-200 ${
                activeSport === sport.id
                  ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold shadow-[var(--shadow-glow-green)]'
                  : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)] hover:text-[var(--mm-text-primary)]'
              }`}
            >
              <span className="text-base">{sport.icon}</span>
              <span>{sport.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Date Navigator + Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <button
            onClick={() => setDateOffset((d) => d - 1)}
            className="p-2 rounded-[var(--radius-md)] bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)] transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 bg-[var(--mm-bg-tertiary)] px-4 py-2 rounded-[var(--radius-md)] min-w-[120px] justify-center">
            <Calendar size={16} className="text-[var(--mm-accent-green)]" />
            <span className="body font-medium">{getDateLabel()}</span>
          </div>
          <button
            onClick={() => setDateOffset((d) => d + 1)}
            className="p-2 rounded-[var(--radius-md)] bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)] transition-all"
          >
            <ChevronRight size={18} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] body transition-all ${
              filterOpen ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)]' : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
            }`}
          >
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </motion.div>

        {/* Filter Panel */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="caption font-medium text-[var(--mm-text-muted)]">Competitions</span>
                  <span className="caption text-[var(--mm-text-muted)]">Filter by league</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Premier League', 'La Liga', 'NBA', 'NFL', 'Champions League', 'IPL', 'NHL', 'Serie A'].map((league) => (
                    <label key={league} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-full)] cursor-pointer hover:bg-[var(--mm-bg-hover)] transition-colors">
                      <input type="checkbox" defaultChecked className="accent-[var(--mm-accent-green)] w-3.5 h-3.5" />
                      <span className="caption text-[var(--mm-text-secondary)]">{league}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
        >
          {[
            { label: 'Live Now', value: String(liveCount), icon: Zap, color: 'var(--mm-accent-green)' },
            { label: "Today's Matches", value: String(allMatches.length), icon: Calendar, color: 'var(--mm-accent-blue)' },
            { label: 'Finished', value: String(finishedCount), icon: Clock, color: 'var(--mm-text-muted)' },
            { label: 'Predictions Open', value: String(predictCount), icon: TrendingUp, color: 'var(--mm-accent-amber)' },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center" style={{ color: stat.color }}>
                  <Icon size={18} />
                </div>
                <div>
                  <span className="block heading-2" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="caption text-[var(--mm-text-muted)]">{stat.label}</span>
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Competition Sections */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="body text-[var(--mm-text-muted)]">Loading matches...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {byCompetition.map((comp, ci) => (
              <motion.section
                key={`${comp.sportKey}-${ci}`}
                initial="initial"
                animate="animate"
                variants={cardVariants}
                custom={ci}
              >
                {/* Competition Header */}
                <div className="flex items-center gap-2 mb-3 group">
                  <div className="w-8 h-8 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                    {comp.name.charAt(0)}
                  </div>
                  <h2 className="heading-3 flex-1">{comp.name}</h2>
                  <SportBadge sport={comp.sportKey} size="sm" showLabel={false} />
                  <span className="caption text-[var(--mm-text-muted)]">{comp.matches.length} matches</span>
                </div>

                {/* Match List */}
                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
                  {comp.matches.map((match) => {
                    const voted = quickVotes[match.id]
                    return (
                      <div
                        key={match.id}
                        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)] transition-colors group"
                      >
                        {/* Home Team */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mm-accent-green)]/20 to-[var(--mm-accent-blue)]/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[var(--mm-text-secondary)]">{(match.homeTeamName || match.homeTeam || 'H').charAt(0)}</span>
                          </div>
                          <span className="body font-medium truncate">{match.homeTeamName || match.homeTeam}</span>
                        </div>

                        {/* Quick-vote H/D/A (only for upcoming matches) */}
                        {match.status === 'SCHEDULED' && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); setQuickVotes(prev => ({ ...prev, [match.id]: 'H' })) }}
                              className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-xs font-bold transition-all ${
                                voted === 'H' ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)]' : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)] hover:bg-[var(--mm-accent-green)]/20 hover:text-[var(--mm-accent-green)]'
                              }`}
                            >H</button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setQuickVotes(prev => ({ ...prev, [match.id]: 'D' })) }}
                              className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-xs font-bold transition-all ${
                                voted === 'D' ? 'bg-[var(--mm-accent-amber)] text-[var(--mm-text-inverse)]' : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)] hover:bg-[var(--mm-accent-amber)]/20 hover:text-[var(--mm-accent-amber)]'
                              }`}
                            >D</button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setQuickVotes(prev => ({ ...prev, [match.id]: 'A' })) }}
                              className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center text-xs font-bold transition-all ${
                                voted === 'A' ? 'bg-[var(--mm-accent-red)] text-[var(--mm-text-inverse)]' : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)] hover:bg-[var(--mm-accent-red)]/20 hover:text-[var(--mm-accent-red)]'
                              }`}
                            >A</button>
                          </div>
                        )}

                        {/* Score / Time */}
                        <Link to={`/live/${match.id}`} className="flex items-center gap-2 min-w-[80px] justify-center hover:opacity-80">
                          {match.status === 'SIMULATING' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
                              <span className="body font-bold text-[var(--mm-accent-green)]">{match.homeScore ?? '?'} - {match.awayScore ?? '?'}</span>
                              <span className="caption text-[var(--mm-text-muted)]">{match.minute || ""}'</span>
                            </>
                          ) : match.status === 'FINISHED' || match.status === 'COMPLETED' ? (
                            <>
                              <span className="caption font-semibold text-[var(--mm-text-muted)] bg-[var(--mm-bg-tertiary)] px-2 py-0.5 rounded-[var(--radius-sm)]">FT</span>
                              <span className="body font-bold">{match.homeScore ?? '?'} - {match.awayScore ?? '?'}</span>
                            </>
                          ) : (
                            <span className="body text-[var(--mm-text-muted)]">
                              {match.scheduledAt ? new Date(match.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                            </span>
                          )}
                        </Link>

                        {/* Away Team */}
                        <Link to={`/live/${match.id}`} className="flex items-center gap-2 flex-1 min-w-0 justify-end hover:opacity-80">
                          <span className="body font-medium truncate">{match.awayTeamName || match.awayTeam}</span>
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)]/20 to-[var(--mm-accent-purple)]/20 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-[var(--mm-text-secondary)]">{(match.awayTeamName || match.awayTeam || 'A').charAt(0)}</span>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            ))}

            {byCompetition.length === 0 && (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">🏟️</span>
                <p className="body-large text-[var(--mm-text-muted)]">No matches found for this sport</p>
                <p className="body text-[var(--mm-text-muted)] mt-1">Check back later for upcoming fixtures</p>
              </div>
            )}
          </div>
        )}

        {/* Community Poll Sidebar - visible on larger screens */}
        <div className="hidden lg:block mt-8">
          <div className="max-w-xs ml-auto">
            <CommunityPollWidget />
          </div>
        </div>
      </div>
    </div>
  )
}

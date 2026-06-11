import React, { useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStandings } from '../hooks/useApi'

const SPORT_INFO = {
  football: { icon: '⚽', name: 'Football', color: '#2ECC40' },
  basketball: { icon: '🏀', name: 'Basketball', color: '#FF851B' },
  american_football: { icon: '🏈', name: 'NFL', color: '#B10DC9' },
  tennis: { icon: '🎾', name: 'Tennis', color: '#FFDC00' },
  cricket: { icon: '🏏', name: 'Cricket', color: '#7FDBFF' },
  hockey: { icon: '🏒', name: 'Hockey', color: '#01FF70' },
  premier_league: { icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', name: 'Premier League', color: '#2ECC40' },
  laliga: { icon: '🇪🇸', name: 'La Liga', color: '#FF851B' },
  nba: { icon: '🏀', name: 'NBA', color: '#FF851B' },
  nfl: { icon: '🏈', name: 'NFL', color: '#B10DC9' },
  ipl: { icon: '🏏', name: 'IPL', color: '#7FDBFF' },
}

// Generate realistic standings data (fallback if API unavailable)
function generateStandings(sport) {
  const teams = [
    'Manchester City', 'Arsenal', 'Liverpool', 'Aston Villa', 'Tottenham',
    'Manchester Utd', 'West Ham', 'Brighton', 'Wolves', 'Newcastle',
    'Chelsea', 'Fulham', 'Bournemouth', 'Crystal Palace', 'Brentford',
    'Everton', 'Nottm Forest', 'Luton Town', 'Burnley', 'Sheffield Utd',
  ]
  const isShort = ['nba', 'nfl', 'ipl'].includes(sport)
  const activeTeams = isShort ? teams.slice(0, 10) : teams

  return activeTeams.map((name, i) => {
    const played = 28 + Math.floor(Math.random() * 10)
    const wins = Math.floor(Math.random() * (played * 0.5))
    const draws = Math.floor(Math.random() * (played - wins) * 0.3)
    const losses = played - wins - draws
    const gf = Math.floor(Math.random() * played * 1.5)
    const ga = Math.floor(Math.random() * played * 1.1)
    const gd = gf - ga
    const pts = wins * 3 + draws
    const prevPos = i + Math.floor(Math.random() * 5) - 2
    const form = Array.from({ length: 5 }, () => {
      const r = Math.random()
      return r > 0.6 ? 'W' : r > 0.3 ? 'D' : 'L'
    })

    return {
      pos: i + 1,
      name,
      played,
      wins,
      draws,
      losses,
      gf,
      ga,
      gd,
      pts,
      prevPos: Math.max(1, Math.min(activeTeams.length, prevPos)),
      form,
    }
  }).sort((a, b) => b.pts - a.pts || b.gd - a.gd)
    .map((team, i) => ({ ...team, pos: i + 1 }))
}

const rowVariants = {
  initial: { opacity: 0, x: -10 },
  animate: (i) => ({ opacity: 1, x: 0, transition: { duration: 0.25, delay: i * 0.02 } }),
}

export default function StandingsPage() {
  const { sport } = useParams()
  const sportKey = sport?.toLowerCase().replace(/\s+/g, '_')
  const sportInfo = SPORT_INFO[sportKey] || { icon: '🏆', name: sport?.replace(/_/g, ' ') || 'Standings', color: '#FFFFFF' }
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('pts')
  const [sortDir, setSortDir] = useState('desc')

  // Try API, fall back to generated data
  const { data: apiStandings } = useStandings(sportKey)

  // Use locally generated standings since backend doesn't have a /api/standings endpoint yet
  const standings = useMemo(() => generateStandings(sportKey), [sportKey])

  const filtered = useMemo(() => {
    if (!searchQuery) return standings
    const q = searchQuery.toLowerCase()
    return standings.filter(t => t.name.toLowerCase().includes(q))
  }, [standings, searchQuery])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === 'desc' ? -1 : 1
      return a[sortBy] > b[sortBy] ? dir : -dir
    })
  }, [filtered, sortBy, sortDir])

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortDir(field === 'pts' || field === 'gd' ? 'desc' : 'asc')
    }
  }

  const getPosChange = (prevPos, currentPos) => {
    if (prevPos > currentPos) return { icon: TrendingUp, color: 'var(--mm-accent-green)', text: `+${prevPos - currentPos}` }
    if (prevPos < currentPos) return { icon: TrendingDown, color: 'var(--mm-accent-red)', text: `-${currentPos - prevPos}` }
    return { icon: Minus, color: 'var(--mm-text-muted)', text: '0' }
  }

  const getFormDot = (result) => {
    if (result === 'W') return { color: 'var(--mm-accent-green)', label: 'W' }
    if (result === 'D') return { color: 'var(--mm-accent-amber)', label: 'D' }
    return { color: 'var(--mm-accent-red)', label: 'L' }
  }

  const getPositionMedal = (pos) => {
    if (pos === 1) return <span className="text-lg">🥇</span>
    if (pos === 2) return <span className="text-lg">🥈</span>
    if (pos === 3) return <span className="text-lg">🥉</span>
    return null
  }

  const isCLZone = (pos) => pos <= 4
  const isELZone = (pos) => pos >= 5 && pos <= 6
  const isRelegation = (pos) => pos >= standings.length - 2

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>{sportInfo.name} Standings — MatchMind</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Explore
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl" style={{ color: sportInfo.color }}>
              {sportInfo.icon}
            </div>
            <div>
              <h1 className="heading-1">{sportInfo.name}</h1>
              <p className="body text-[var(--mm-text-secondary)]">{standings.length} teams · Season 2025/26</p>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-4">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams..."
              className="w-full bg-[var(--mm-bg-secondary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] pl-9 pr-3 py-2 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden"
        >
          {/* Table Header */}
          <div className="grid grid-cols-[32px_1fr_32px_40px_40px_40px_48px_48px_120px] gap-2 px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--mm-bg-tertiary)]/50 caption text-[var(--mm-text-muted)] font-medium">
            <span className="text-center">#</span>
            <span>Team</span>
            <span></span>
            <button onClick={() => toggleSort('played')} className={`text-center hover:text-[var(--mm-text-primary)] transition-colors ${sortBy === 'played' ? 'text-[var(--mm-accent-green)]' : ''}`}>P</button>
            <button onClick={() => toggleSort('wins')} className={`text-center hover:text-[var(--mm-text-primary)] transition-colors ${sortBy === 'wins' ? 'text-[var(--mm-accent-green)]' : ''}`}>W</button>
            <button onClick={() => toggleSort('draws')} className={`text-center hover:text-[var(--mm-text-primary)] transition-colors ${sortBy === 'draws' ? 'text-[var(--mm-accent-green)]' : ''}`}>D</button>
            <button onClick={() => toggleSort('losses')} className={`text-center hover:text-[var(--mm-text-primary)] transition-colors ${sortBy === 'losses' ? 'text-[var(--mm-accent-green)]' : ''}`}>L</button>
            <button onClick={() => toggleSort('gd')} className={`text-right hover:text-[var(--mm-text-primary)] transition-colors ${sortBy === 'gd' ? 'text-[var(--mm-accent-green)]' : ''}`}>GD</button>
            <button onClick={() => toggleSort('pts')} className={`text-right hover:text-[var(--mm-text-primary)] transition-colors ${sortBy === 'pts' ? 'text-[var(--mm-accent-green)]' : ''}`}>Pts</button>
            <span className="text-center hidden sm:block">Form</span>
          </div>

          {/* Table Body */}
          <AnimatePresence mode="popLayout">
            {sorted.map((team, idx) => {
              const posChange = getPosChange(team.prevPos, team.pos)
              const PosIcon = posChange.icon

              return (
                <motion.div
                  key={team.name}
                  layout
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  custom={idx}
                  exit={{ opacity: 0, x: -20 }}
                  className={`grid grid-cols-[32px_1fr_32px_40px_40px_40px_48px_48px_120px] gap-2 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)] transition-colors items-center ${
                    idx < 3 ? 'bg-[var(--mm-accent-green)]/[0.02]' : ''
                  }`}
                >
                  {/* Position */}
                  <div className="flex items-center justify-center">
                    {getPositionMedal(team.pos) || (
                      <span className={`body font-bold text-sm ${isCLZone(team.pos) ? 'text-[var(--mm-accent-green)]' : isRelegation(team.pos) ? 'text-[var(--mm-accent-red)]' : 'text-[var(--mm-text-muted)]'}`}>
                        {team.pos}
                      </span>
                    )}
                  </div>

                  {/* Team Name */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)]/30 to-[var(--mm-accent-purple)]/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[var(--mm-text-secondary)]">{team.name.charAt(0)}</span>
                    </div>
                    <Link
                      to={`/teams/${team.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="body font-medium truncate hover:text-[var(--mm-accent-green)] transition-colors"
                    >
                      {team.name}
                    </Link>
                    {isCLZone(team.pos) && <span className="caption text-[var(--mm-accent-blue)] hidden sm:inline">CL</span>}
                    {isELZone(team.pos) && <span className="caption text-[var(--mm-accent-amber)] hidden sm:inline">EL</span>}
                    {isRelegation(team.pos) && <span className="caption text-[var(--mm-accent-red)] hidden sm:inline">▼</span>}
                  </div>

                  {/* Position Change */}
                  <div className="flex items-center justify-center">
                    <PosIcon size={14} className={posChange.color} />
                  </div>

                  {/* Stats */}
                  <span className="body text-center text-[var(--mm-text-muted)]">{team.played}</span>
                  <span className="body text-center text-[var(--mm-text-primary)]">{team.wins}</span>
                  <span className="body text-center text-[var(--mm-text-muted)]">{team.draws}</span>
                  <span className="body text-center text-[var(--mm-text-primary)]">{team.losses}</span>
                  <span className={`body text-right font-medium ${team.gd > 0 ? 'text-[var(--mm-accent-green)]' : team.gd < 0 ? 'text-[var(--mm-accent-red)]' : 'text-[var(--mm-text-muted)]'}`}>
                    {team.gd > 0 ? '+' : ''}{team.gd}
                  </span>
                  <span className="body text-right font-bold font-[var(--font-display)] text-xl text-[var(--mm-accent-amber)]">{team.pts}</span>

                  {/* Form */}
                  <div className="hidden sm:flex items-center gap-1 justify-center">
                    {team.form.map((result, fi) => {
                      const dot = getFormDot(result)
                      return (
                        <span
                          key={fi}
                          className="w-4 h-4 rounded-sm flex items-center justify-center text-[9px] font-bold"
                          style={{ background: `${dot.color}20`, color: dot.color }}
                        >
                          {dot.label}
                        </span>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {sorted.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="body text-[var(--mm-text-muted)]">No teams matching "{searchQuery}"</p>
          </div>
        )}

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex items-center gap-4 justify-center sm:justify-start"
        >
          <div className="flex items-center gap-1.5 caption text-[var(--mm-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-blue)]" /> Champions League
          </div>
          <div className="flex items-center gap-1.5 caption text-[var(--mm-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-amber)]" /> Europa League
          </div>
          <div className="flex items-center gap-1.5 caption text-[var(--mm-text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-red)]" /> Relegation
          </div>
        </motion.div>
      </div>
    </div>
  )
}

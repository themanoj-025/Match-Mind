import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Users, Trophy, TrendingUp, BarChart3, Star, Clock, Plus, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MatchCard from '../components/MatchCard'
import { useTeam } from '../hooks/useApi'

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'fixtures', label: 'Fixtures', icon: Calendar },
  { id: 'results', label: 'Results', icon: Trophy },
  { id: 'stats', label: 'Stats', icon: TrendingUp },
  { id: 'squad', label: 'Squad', icon: Users },
]

const formColors = { W: 'var(--mm-accent-green)', D: 'var(--mm-accent-amber)', L: 'var(--mm-accent-red)' }

export default function TeamPage() {
  const { teamId } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [isFollowing, setIsFollowing] = useState(false)

  const { data: team, isLoading } = useTeam(teamId)

  const displayName = team?.name || (teamId?.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) || 'Team Name'
  const sport = team?.sport?.toLowerCase() || 'football'
  const sportIcon = sport === 'football' ? '⚽' : sport === 'basketball' ? '🏀' : sport === 'american_football' ? '🏈' : sport === 'tennis' ? '🎾' : sport === 'cricket' ? '🏏' : '🏒'

  const standing = team?.standings?.[0]
  const stats = [
    { label: 'Position', value: standing ? `${standing.position}${['th','st','nd','rd'][standing.position % 10 > 3 ? 0 : standing.position % 10] || 'th'}` : '—', color: 'var(--mm-accent-green)', suffix: standing?.competition?.name || 'League' },
    { label: 'Form', value: team?.form || '—', color: 'var(--mm-accent-amber)', suffix: 'Last 5' },
    { label: 'Goals For', value: standing?.goalsFor || '0', color: 'var(--mm-accent-green)', suffix: 'This season' },
    { label: 'Goals Against', value: standing?.goalsAgainst || '0', color: 'var(--mm-accent-red)', suffix: 'This season' },
    { label: 'Squad Size', value: String(team?.squadSize || team?.players?.length || '—'), color: 'var(--mm-accent-blue)', suffix: 'Players' },
    { label: 'Games Played', value: String(standing?.played || '0'), color: 'var(--mm-accent-amber)', suffix: standing ? `W${standing.won}-D${standing.drawn}-L${standing.lost}` : 'This season' },
  ]

  const recentFixtures = (team?.recentMatches || []).filter(m => m.status === 'FINISHED').slice(0, 5).map(m => ({
    home: m.homeTeamName,
    away: m.awayTeamName,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status: 'FT',
    date: m.scheduledAt,
    competition: m.competition,
    id: m.id,
  }))

  const upcomingFixtures = (team?.recentMatches || []).filter(m => m.status === 'SCHEDULED').slice(0, 5).map(m => ({
    home: m.homeTeamName,
    away: m.awayTeamName,
    homeScore: null,
    awayScore: null,
    status: 'SCHEDULED',
    date: m.scheduledAt,
    competition: m.competition,
    id: m.id,
  }))

  const formResults = (team?.form || '').split('').filter(Boolean).length > 0
    ? (team.form).split('')
    : ['W', 'W', 'D', 'L', 'W']

  const athleteCount = team?.squadSize || team?.players?.length || 25
  const fanCount = team?.followersCount?.toLocaleString() || '12,847'

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>{displayName} — Team Profile | MatchMind</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Explore
          </Link>
        </motion.div>

        {/* Team Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden mb-6"
        >
          {/* Cover */}
          <div className="h-28 sm:h-36 bg-gradient-to-r from-[var(--mm-accent-green)]/20 via-[var(--mm-accent-blue)]/20 to-[var(--mm-accent-purple)]/20 relative">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2300E676\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }} />
          </div>

          <div className="px-6 pb-6 -mt-10 sm:-mt-14">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center border-4 border-[var(--mm-bg-secondary)] text-2xl font-bold text-[var(--mm-text-inverse)] shadow-[var(--shadow-elevated)]">
                {displayName.charAt(0)}
              </div>
              <div className="pb-1 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="heading-2">{displayName}</h1>
                  <span className="px-2 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] text-[10px] font-bold text-[var(--mm-text-muted)]">⚽ Football</span>
                </div>
                <span className="caption text-[var(--mm-text-muted)]">Premier League · England</span>
              </div>
              <div className="pb-1">
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`flex items-center gap-1.5 body font-semibold px-4 py-2 rounded-[var(--radius-md)] transition-all ${
                    isFollowing
                      ? 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] border border-[var(--border-default)]'
                      : 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] hover:shadow-[var(--shadow-glow-green)]'
                  }`}
                >
                  <Plus size={16} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>

            {/* Form Strip */}
            <div className="flex items-center gap-3">
              <span className="caption text-[var(--mm-text-muted)]">Form:</span>
              {formResults.map((r, i) => (
                <span key={i} className="w-7 h-7 rounded-md flex items-center justify-center body font-bold" style={{ background: `${formColors[r]}20`, color: formColors[r] }}>
                  {r}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)]/30 transition-colors">
              <span className="caption text-[var(--mm-text-muted)] mb-1 block">{stat.label}</span>
              <span className="heading-3" style={{ color: stat.color }}>{stat.value}</span>
              <span className="caption text-[var(--mm-text-muted)] block">{stat.suffix}</span>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex gap-1 mb-6 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-md)] p-1 border border-[var(--border-subtle)] overflow-x-auto"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] body whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-medium' : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                  <h3 className="heading-3 mb-4">Recent Results</h3>
                  <div className="space-y-3">
                    {recentFixtures.map((f, i) => (
                      <Link key={i} to="/live/last-match" className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-colors">
                        <span className="caption text-[var(--mm-text-muted)] w-16">{new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="body flex-1 text-right">{f.home}</span>
                        <span className="body font-bold text-[var(--mm-accent-amber)]">{f.homeScore} - {f.awayScore}</span>
                        <span className="body flex-1">{f.away}</span>
                        <span className="caption text-[var(--mm-text-muted)]">{f.competition}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center">
                    <Users size={20} className="mx-auto mb-2 text-[var(--mm-accent-blue)]" />
                    <span className="heading-2 text-[var(--mm-accent-blue)]">{athleteCount}</span>
                    <span className="caption text-[var(--mm-text-muted)] block">Squad Size</span>
                  </div>
                  <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center">
                    <Star size={20} className="mx-auto mb-2 text-[var(--mm-accent-amber)]" />
                    <span className="heading-2 text-[var(--mm-accent-amber)]">{fanCount}</span>
                    <span className="caption text-[var(--mm-text-muted)] block">Fans Following</span>
                  </div>
                </div>
              </div>
            )}

            {/* Fixtures */}
            {activeTab === 'fixtures' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                <h3 className="heading-3 mb-4">Upcoming Fixtures</h3>
                {upcomingFixtures.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingFixtures.map((f, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] bg-[var(--mm-bg-tertiary)]/30">
                        <div className="flex items-center gap-1 caption text-[var(--mm-accent-green)]">
                          <Clock size={12} />
                          <span>{new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <span className="body flex-1 text-right">{f.home}</span>
                        <span className="body text-[var(--mm-text-muted)]">vs</span>
                        <span className="body flex-1">{f.away}</span>
                        <span className="caption text-[var(--mm-text-muted)]">{f.competition}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[var(--mm-text-muted)]">
                    <Calendar size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="body">No upcoming fixtures</p>
                  </div>
                )}

                <h3 className="heading-3 mb-4 mt-6">Recent Results</h3>
                <div className="space-y-3">
                  {recentFixtures.map((f, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-colors">
                      <span className="caption text-[var(--mm-accent-amber)] w-12 font-semibold">{f.status}</span>
                      <span className="body flex-1 text-right">{f.home}</span>
                      <span className="body font-bold">{f.homeScore} - {f.awayScore}</span>
                      <span className="body flex-1">{f.away}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {activeTab === 'results' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                <h3 className="heading-3 mb-4">Season Results</h3>
                <div className="text-center py-12 text-[var(--mm-text-muted)]">
                  <Trophy size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="body">All season results will appear here</p>
                  <p className="caption mt-1">Including competition, date, score, and match stats</p>
                </div>
              </div>
            )}

            {/* Stats */}
            {activeTab === 'stats' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                <h3 className="heading-3 mb-4">Team Statistics</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Goals per match', home: 1.8, away: 1.2, total: 1.5 },
                    { label: 'Shots per match', home: 14.2, away: 9.8, total: 12.0 },
                    { label: 'Possession %', home: 65, away: 58, total: 62 },
                    { label: 'Pass accuracy %', home: 88, away: 82, total: 85 },
                    { label: 'Clean sheets', home: 8, away: 4, total: 12 },
                  ].map((stat, i) => (
                    <div key={i} className="grid grid-cols-3 gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
                      <span className="body text-[var(--mm-text-muted)]">{stat.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--gradient-live)] rounded-full" style={{ width: `${(stat.home / Math.max(stat.home, stat.away)) * 100}%` }} />
                        </div>
                        <span className="body font-medium w-8 text-center">{stat.home}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--gradient-predict)] rounded-full" style={{ width: `${(stat.away / Math.max(stat.home, stat.away)) * 100}%` }} />
                        </div>
                        <span className="body font-medium w-8 text-center">{stat.away}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Squad */}
            {activeTab === 'squad' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                <h3 className="heading-3 mb-4">Current Squad</h3>
                <div className="text-center py-12 text-[var(--mm-text-muted)]">
                  <Users size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="body">Players will appear with stats and positions</p>
                  <p className="caption mt-1">Including appearances, goals, assists, and ratings</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

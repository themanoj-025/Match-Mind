import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Flag, Zap, TrendingUp, Target, Star, Activity, Medal, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '../hooks/useApi'

const tabs = [
  { id: 'overview', label: 'Overview', icon: Star },
  { id: 'stats', label: 'Career Stats', icon: TrendingUp },
  { id: 'form', label: 'Form Analysis', icon: Activity },
  { id: 'achievements', label: 'Achievements', icon: Medal },
]

export default function PlayerPage() {
  const { playerId } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: playerData } = usePlayer(playerId)

  const displayName = playerData?.name || (playerId?.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) || 'Player Name'
  const playerTeam = playerData?.team?.name || '—'
  const playerSport = playerData?.sport?.toLowerCase() || 'football'
  const nationality = playerData?.nationality || '—'
  const position = playerData?.position || '—'
  const playerNumber = playerData?.number || '—'

  const stats = [
    { label: 'Position', value: position, icon: Target, color: 'var(--mm-accent-green)' },
    { label: 'Number', value: String(playerNumber), icon: Star, color: 'var(--mm-accent-amber)' },
    { label: 'Nationality', value: nationality, icon: Flag, color: 'var(--mm-accent-blue)' },
    { label: 'Sport', value: playerSport.charAt(0).toUpperCase() + playerSport.slice(1), icon: Activity, color: 'var(--mm-accent-purple)' },
    { label: 'Team', value: playerTeam, icon: Zap, color: 'var(--mm-accent-amber)' },
    { label: 'Jersey', value: String(playerNumber), icon: Flame, color: 'var(--mm-accent-red)' },
  ]

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>{displayName} — Player Profile | MatchMind</title>
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Back */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/explore" className="inline-flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-4 transition-colors">
            <ArrowLeft size={16} /> Back
          </Link>
        </motion.div>

        {/* Player Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden mb-6"
        >
          <div className="h-28 sm:h-36 bg-gradient-to-r from-[var(--mm-accent-amber)]/20 via-[var(--mm-accent-purple)]/20 to-[var(--mm-accent-green)]/20" />
          <div className="px-6 pb-6 -mt-12 sm:-mt-16">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center border-4 border-[var(--mm-bg-secondary)] text-3xl font-bold text-[var(--mm-text-inverse)] shadow-[var(--shadow-elevated)]">
                {displayName.split(' ').map(n => n.charAt(0)).join('')}
              </div>
              <div className="pb-1 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="heading-2">{displayName}</h1>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] rounded-[var(--radius-sm)] text-[10px] font-bold text-white">ST</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="caption text-[var(--mm-text-muted)] flex items-center gap-1"><Flag size={12} /> England</span>
                  <span className="caption text-[var(--mm-text-muted)]">#9 · Forward</span>
                  <span className="caption text-[var(--mm-text-muted)]">Manchester City</span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-2.5 text-center hover:bg-[var(--mm-bg-hover)] transition-colors">
                    <Icon size={14} className="mx-auto mb-1" style={{ color: stat.color }} />
                    <span className="block font-[var(--font-display)] text-lg" style={{ color: stat.color }}>{stat.value}</span>
                    <span className="caption text-[var(--mm-text-muted)]">{stat.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
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
                {/* Recent Form */}
                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                  <h3 className="heading-3 mb-4">Recent Performances</h3>
                  <div className="space-y-3">
                    {recentForm.map((match, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-colors border border-[var(--border-subtle)]/50">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center body font-bold ${
                          match.result === 'W' ? 'bg-[var(--mm-accent-green)]/20 text-[var(--mm-accent-green)]' :
                          match.result === 'D' ? 'bg-[var(--mm-accent-amber)]/20 text-[var(--mm-accent-amber)]' :
                          'bg-[var(--mm-accent-red)]/20 text-[var(--mm-accent-red)]'
                        }`}>
                          {match.result}
                        </div>
                        <div className="flex-1">
                          <span className="body font-medium">{match.match}</span>
                          <span className="caption text-[var(--mm-text-muted)] ml-2">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="body text-[var(--mm-accent-amber)]">⚽ {match.goals}</span>
                          <span className="caption text-[var(--mm-text-muted)]">Rating</span>
                          <span className="body font-bold text-[var(--mm-accent-green)]">{match.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Attributes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
                    <h4 className="body font-semibold mb-3">Position</h4>
                    <div className="space-y-2">
                      {[
                        { pos: 'Striker', rating: 92 },
                        { pos: 'Left Wing', rating: 85 },
                        { pos: 'Right Wing', rating: 78 },
                        { pos: 'Attacking Mid', rating: 80 },
                      ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="body text-[var(--mm-text-secondary)]">{p.pos}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--gradient-live)] rounded-full" style={{ width: `${p.rating}%` }} />
                            </div>
                            <span className="caption font-bold text-[var(--mm-accent-green)]">{p.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
                    <h4 className="body font-semibold mb-3">Strengths</h4>
                    <div className="space-y-2">
                      {[
                        { skill: 'Finishing', value: 94 },
                        { skill: 'Pace', value: 88 },
                        { skill: 'Dribbling', value: 85 },
                        { skill: 'Heading', value: 82 },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="body text-[var(--mm-text-secondary)]">{s.skill}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--gradient-predict)] rounded-full" style={{ width: `${s.value}%` }} />
                            </div>
                            <span className="caption font-bold text-[var(--mm-accent-amber)]">{s.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Career Stats */}
            {activeTab === 'stats' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                <h3 className="heading-3 mb-4">Season by Season</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] caption text-[var(--mm-text-muted)]">
                        <th className="py-3 px-2 font-medium">Season</th>
                        <th className="py-3 px-2 font-medium text-center">Apps</th>
                        <th className="py-3 px-2 font-medium text-center">Goals</th>
                        <th className="py-3 px-2 font-medium text-center">Assists</th>
                        <th className="py-3 px-2 font-medium text-center">G+A</th>
                        <th className="py-3 px-2 font-medium text-center">Mins</th>
                        <th className="py-3 px-2 font-medium text-center">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seasonStats.map((s, i) => (
                        <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)]/30 transition-colors">
                          <td className="py-3 px-2 body font-medium">{s.season}</td>
                          <td className="py-3 px-2 body text-center text-[var(--mm-text-secondary)]">{s.apps}</td>
                          <td className="py-3 px-2 body text-center text-[var(--mm-accent-amber)] font-bold">{s.goals}</td>
                          <td className="py-3 px-2 body text-center text-[var(--mm-accent-blue)]">{s.assists}</td>
                          <td className="py-3 px-2 body text-center font-bold text-[var(--mm-accent-green)]">{s.goals + s.assists}</td>
                          <td className="py-3 px-2 body text-center text-[var(--mm-text-muted)]">{s.mins}</td>
                          <td className="py-3 px-2 body text-center">
                            <span className={`font-bold ${s.rating >= 8 ? 'text-[var(--mm-accent-green)]' : s.rating >= 7.5 ? 'text-[var(--mm-accent-amber)]' : 'text-[var(--mm-text-muted)]'}`}>
                              {s.rating}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Form Analysis */}
            {activeTab === 'form' && (
              <div className="space-y-4">
                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                  <h3 className="heading-3 mb-4">Last 5 Matches</h3>
                  <div className="space-y-3">
                    {recentForm.map((match, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-[var(--radius-md)] bg-[var(--mm-bg-tertiary)]/30">
                        <span className="body text-[var(--mm-text-muted)] w-8 text-center">{5 - i}</span>
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center body font-bold ${
                          match.result === 'W' ? 'bg-[var(--mm-accent-green)]/20 text-[var(--mm-accent-green)]' :
                          match.result === 'D' ? 'bg-[var(--mm-accent-amber)]/20 text-[var(--mm-accent-amber)]' :
                          'bg-[var(--mm-accent-red)]/20 text-[var(--mm-accent-red)]'
                        }`}>
                          {match.result}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="body font-medium truncate">{match.match}</span>
                          <span className="caption text-[var(--mm-text-muted)] ml-2">{match.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="caption text-[var(--mm-text-muted)]">Goals</span>
                          <span className="body font-bold text-[var(--mm-accent-amber)]">{match.goals}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="caption text-[var(--mm-text-muted)]">Rating</span>
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${match.rating >= 8 ? 'bg-[var(--mm-accent-green)]' : match.rating >= 7 ? 'bg-[var(--mm-accent-amber)]' : 'bg-[var(--mm-accent-red)]'}`}
                                style={{ width: `${(match.rating / 10) * 100}%` }} />
                            </div>
                            <span className="caption font-bold">{match.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                  <h3 className="heading-3 mb-4">Performance Trends</h3>
                  <div className="text-center py-8 text-[var(--mm-text-muted)]">
                    <Activity size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="body">Advanced form analysis chart coming soon</p>
                    <p className="caption mt-1">Goals, assists, rating trend over the season</p>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements */}
            {activeTab === 'achievements' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
                <h3 className="heading-3 mb-4">Career Achievements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { icon: '🏆', title: 'Premier League', subtitle: '2024/25 Champion', rarity: 'legendary' },
                    { icon: '⚽', title: 'Golden Boot', subtitle: '2024/25 Season', rarity: 'epic' },
                    { icon: '⭐', title: 'Team MVP', subtitle: '2024/25', rarity: 'rare' },
                    { icon: '🎯', title: 'Hat-trick Hero', subtitle: '3 hat-tricks', rarity: 'rare' },
                    { icon: '🏅', title: 'Player of Month', subtitle: 'Oct 2025', rarity: 'epic' },
                    { icon: '👑', title: 'Champions League', subtitle: 'Winner 2023/24', rarity: 'legendary' },
                  ].map((ach, i) => (
                    <div key={i} className={`bg-[var(--mm-bg-tertiary)] border rounded-[var(--radius-lg)] p-4 text-center hover:scale-[1.02] transition-transform ${
                      ach.rarity === 'legendary' ? 'border-[var(--mm-accent-amber)]/30' :
                      ach.rarity === 'epic' ? 'border-[var(--mm-accent-purple)]/30' :
                      'border-[var(--border-subtle)]'
                    }`}>
                      <span className="text-3xl block mb-2">{ach.icon}</span>
                      <span className="body font-semibold block">{ach.title}</span>
                      <span className="caption text-[var(--mm-text-muted)]">{ach.subtitle}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

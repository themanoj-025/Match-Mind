import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { Settings, Bell, Trophy, Target, TrendingUp, Flame, Star, Shield, Zap, Brain, Crown, Globe, Edit3, Users, ChevronRight, MapPin, Calendar, Loader } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import AchievementBadge from '../components/AchievementBadge'
import PredictionCard from '../components/PredictionCard'
import { useMyPredictions, useStripeStatus } from '../hooks/useApi'

const profileTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'predictions', label: 'Predictions' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'activity', label: 'Activity' },
]

export default function MyProfilePage() {
  const { user } = useStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: predictions = [] } = useMyPredictions()
  const { data: stripeStatus } = useStripeStatus()

  const isPro = stripeStatus?.isPro || user?.isPro || false
  const recentPredictions = predictions.slice(0, 4)

  const achievements = [
    { icon: '🎯', name: 'Sharpshooter', rarity: 'rare', unlocked: false, progress: '7/10 correct' },
    { icon: '🔥', name: 'On Fire', rarity: 'epic', unlocked: true, unlockedAt: 'Mar 2026' },
    { icon: '🌍', name: 'Global Fan', rarity: 'common', unlocked: true, unlockedAt: 'Jan 2026' },
    { icon: '💯', name: 'Century Club', rarity: 'legendary', unlocked: false, progress: '42/100 predictions' },
    { icon: '🧠', name: 'Big Brain', rarity: 'epic', unlocked: false, progress: '18/50 correct' },
    { icon: '⚡', name: 'Speed Guesser', rarity: 'rare', unlocked: false, progress: '3/10 early birds' },
    { icon: '👑', name: 'League Champ', rarity: 'legendary', unlocked: false, progress: '0/5 league wins' },
    { icon: '🏟️', name: 'Match Hero', rarity: 'rare', unlocked: false, progress: '2/20 correct' },
    { icon: '🛡️', name: 'Defense Expert', rarity: 'common', unlocked: false, progress: '5/10 cleansheets' },
    { icon: '🎪', name: 'Variety King', rarity: 'epic', unlocked: false, progress: '1/6 sports' },
  ]

  const stats = [
    { label: 'Accuracy', value: user?.predAccuracy ? `${user.predAccuracy}%` : '0%', color: 'var(--mm-accent-green)' },
    { label: 'Points', value: user?.totalPoints ? user.totalPoints.toLocaleString() : '0', color: 'var(--mm-accent-amber)' },
    { label: 'Global Rank', value: user?.globalRank ? `#${user.globalRank}` : '—', color: 'var(--mm-accent-blue)' },
    { label: 'Streak', value: user?.streakCurrent ? `🔥${user.streakCurrent}` : '0', color: 'var(--mm-accent-red)' },
  ]

  return (
    <motion.div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet><title>My Profile — MatchMind</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Actions */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Link to="/profile/me/notifications" className="p-2 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors" aria-label="Notifications"><Bell size={18} /></Link>
          <Link to="/profile/me/settings" className="p-2 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors" aria-label="Settings"><Settings size={18} /></Link>
        </div>

        {/* Profile Card */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden mb-6">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-[var(--mm-accent-green)]/20 via-[var(--mm-accent-blue)]/20 to-[var(--mm-accent-purple)]/20" />
          <div className="px-6 pb-6 -mt-12 sm:-mt-16">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center border-4 border-[var(--mm-bg-secondary)] text-3xl font-bold text-[var(--mm-text-inverse)] shadow-[var(--shadow-elevated)]">
                {user?.displayName?.charAt(0)?.toUpperCase() || 'Y'}
              </div>
              <div className="pb-1 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="heading-2">{user?.displayName || 'Your Name'}</h1>
                  {user?.isPro && <span className="px-2 py-0.5 bg-gradient-to-r from-[var(--mm-accent-purple)] to-[var(--mm-accent-blue)] rounded-[var(--radius-sm)] text-[10px] font-bold text-white">PRO</span>}
                </div>
                <span className="caption text-[var(--mm-text-muted)]">@{user?.username || 'username'}</span>
                {user?.bio && <p className="body text-[var(--mm-text-secondary)] mt-1 max-w-lg">{user.bio}</p>}
                <Link to="/profile/me/settings" className="inline-flex items-center gap-1 mt-2 caption text-[var(--mm-accent-green)] font-medium hover:underline">
                  <Edit3 size={12} /> Edit profile
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              {stats.map((stat, i) => (
                <div key={i} className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                  <span className="block font-[var(--font-display)] text-xl" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="caption text-[var(--mm-text-muted)]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-md)] p-1 border border-[var(--border-subtle)]">
          {profileTabs.map((tab) => (
            <button
              key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-[var(--radius-sm)] body text-center transition-all ${
                activeTab === tab.id ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold' : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                  <h3 className="heading-3 mb-4">Your Achievements</h3>
                  <div className="flex gap-3">
                    {achievements.filter(a => a.unlocked).slice(0, 6).map((badge, i) => (
                      <AchievementBadge key={i} icon={badge.icon} name={badge.name} rarity={badge.rarity} unlocked={true} />
                    ))}
                    <Link to="/profile/me" className="flex items-center text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)] transition-colors">
                      <span className="caption">+{achievements.filter(a => !a.unlocked).length} locked</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>

                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                  <h3 className="heading-3 mb-4">Recent Predictions</h3>
                  <div className="text-center py-8 text-[var(--mm-text-muted)]">
                    <Target size={28} className="mx-auto mb-2 opacity-50" />
                    <p className="body">Start predicting to see your history</p>
                    <button onClick={() => navigate('/live')} className="caption text-[var(--mm-accent-green)] font-medium mt-1 hover:underline">Browse live matches</button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Link to="/leagues" className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={16} className="text-[var(--mm-accent-amber)]" />
                      <span className="body font-semibold">Leagues</span>
                    </div>
                    <span className="caption text-[var(--mm-text-muted)]">0 active leagues</span>
                  </Link>
                  <Link to="/squads" className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-[var(--mm-accent-blue)]" />
                      <span className="body font-semibold">Squads</span>
                    </div>
                    <span className="caption text-[var(--mm-text-muted)]">0 squads</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h3 className="heading-3 mb-4">Prediction History</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {recentPredictions.length > 0 ? recentPredictions.map((pred, i) => (
                    <PredictionCard
                      key={pred.id || i}
                      match={{ homeTeam: pred.match?.homeTeam || `Team ${i}`, awayTeam: pred.match?.awayTeam || `Team ${i + 4}`, competition: pred.match?.competition || 'Premier League', sport: pred.match?.sport || 'football', scheduledAt: pred.match?.scheduledAt || new Date().toISOString() }}
                      prediction={{ homeGoals: pred.homeGoals, awayGoals: pred.awayGoals }}
                      result={{ status: pred.status === 'CORRECT' ? 'CORRECT' : 'MISSED', points: pred.pointsEarned || 0 }}
                    />
                  )) : (
                    <div className="col-span-2 text-center py-8 text-[var(--mm-text-muted)]">
                      <p className="body">No predictions yet</p>
                      <Link to="/live" className="caption text-[var(--mm-accent-green)] font-medium mt-1 inline-block hover:underline">Browse live matches</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="heading-3">Your Badges</h3>
                  <span className="caption text-[var(--mm-text-muted)]">{achievements.filter(a => a.unlocked).length}/{achievements.length} earned</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                  {achievements.map((badge, i) => (
                    <div key={i} className={`rounded-[var(--radius-lg)] p-3 text-center transition-all ${
                      badge.unlocked ? 'bg-[var(--mm-bg-tertiary)] border border-[var(--border-active)]/30' : 'bg-[var(--mm-bg-tertiary)]/50 border border-[var(--border-subtle)]'
                    }`}>
                      <span className={`text-3xl block mb-1 ${badge.unlocked ? '' : 'opacity-30 grayscale'}`}>{badge.unlocked ? badge.icon : '🔒'}</span>
                      <span className={`caption font-medium ${badge.unlocked ? 'text-[var(--mm-text-secondary)]' : 'text-[var(--mm-text-muted)]'}`}>{badge.name}</span>
                      <span className={`caption block mt-0.5 ${badge.unlocked ? 'text-[var(--mm-text-muted)]' : 'text-[var(--mm-text-muted)]'}`}>
                        {badge.unlocked ? badge.unlockedAt : badge.progress}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h3 className="heading-3 mb-4">Your Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'You earned +15 pts on prediction', time: '2h ago', icon: '🪙' },
                    { action: 'You predicted 2-1 Man City vs Arsenal', time: '3h ago', icon: '🎯' },
                    { action: 'You unlocked 🔥 On Fire badge', time: '1d ago', icon: '🏅' },
                    { action: 'You joined Premier League Fans league', time: '1w ago', icon: '👥' },
                    { action: 'Account created', time: 'Jan 2026', icon: '🎉' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <p className="body text-[var(--mm-text-secondary)]">{item.action}</p>
                        <span className="caption text-[var(--mm-text-muted)]">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

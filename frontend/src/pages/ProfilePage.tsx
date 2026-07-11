import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  Users,
  Trophy,
  Target,
  Flame,
  MessageCircle,
  MoreHorizontal,
  ChevronRight,
  Loader,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AchievementBadge from '../components/AchievementBadge'
import { cardStaggerItem } from '../lib/animation/variants'
import { useUser, useFollowUser, useUnfollowUser, useMyPredictions } from '../hooks/useApi'
import useStore from '../store/useStore'

const profileTabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'predictions', label: 'Predictions' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'activity', label: 'Activity' },
]

interface ProfileUserData {
  name: string
  username: string
  bio: string
  country: string
  joined: string
  accuracy: number
  points: number
  rank: number
  streak: number
  tier: string
  sports: string[]
  teams: string[]
  isPro: boolean
}

export default function ProfilePage() {
  const { userId } = useParams()
  const currentUser = useStore((s) => s.user)
  const [activeTab, setActiveTab] = useState('overview')

  const { data: profileData, isLoading } = useUser(userId || '')
  const { data: { predictions = [] } = {} as any, isLoading: loadingPreds } = useMyPredictions()
  const followMutation = useFollowUser()
  const unfollowMutation = useUnfollowUser()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isFollowing = (profileData as any)?.isFollowing || false

  const user: ProfileUserData = (profileData as unknown as ProfileUserData) || {
    name: 'SportsKing',
    username: 'sportsking',
    bio: 'Football & NBA fanatic. Premier League expert. 4x weekly leaderboard winner.',
    country: 'England',
    joined: 'Jan 2026',
    accuracy: 78,
    points: 8420,
    rank: 1,
    streak: 12,
    tier: 'DIAMOND',
    sports: ['⚽', '🏀', '🏈'],
    teams: ['Manchester City', 'LA Lakers'],
    isPro: false,
  }

  const handleFollow = () => {
    if (isFollowing) {
      unfollowMutation.mutate((userId || '') as string)
    } else {
      followMutation.mutate(userId as string)
    }
  }

  return (
    <motion.div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>
          {user.name} (@{user.username}) — Profile & Stats | MatchMind
        </title>
        <meta
          name="description"
          content={`${user.name} — ${user.accuracy}% accuracy, ${user.points.toLocaleString()} pts, #${user.rank} Global. View predictions, achievements, and stats.`}
        />
        <meta property="og:title" content={`${user.name} (@${user.username}) — MatchMind Profile`} />
        <meta
          property="og:description"
          content={`🎯 ${user.accuracy}% Accuracy • 🪙 ${user.points.toLocaleString()} pts • 🏆 #${user.rank} Global • 🔥 ${user.streak}-day streak`}
        />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`/profile/${userId}`} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cover & Profile Header */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden mb-6">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-[var(--mm-accent-green)]/20 via-[var(--mm-accent-blue)]/20 to-[var(--mm-accent-purple)]/20 relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300E676' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            />
          </div>
          <div className="px-6 pb-6 -mt-12 sm:-mt-16">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center border-4 border-[var(--mm-bg-secondary)] text-3xl font-bold text-[var(--mm-text-inverse)] shadow-[var(--shadow-elevated)]">
                {user.name.charAt(0)}
              </div>
              <div className="pb-1 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="heading-2">{user.name}</h1>
                  <span className="px-2 py-0.5 bg-gradient-to-r from-[var(--mm-accent-purple)] to-[var(--mm-accent-blue)] rounded-[var(--radius-sm)] text-[10px] font-bold text-white">
                    PRO
                  </span>
                </div>
                <span className="caption text-[var(--mm-text-muted)]">@{user.username}</span>
                <p className="body text-[var(--mm-text-secondary)] mt-1 max-w-lg">{user.bio}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="caption text-[var(--mm-text-muted)] flex items-center gap-1">
                    <MapPin size={12} /> {user.country}
                  </span>
                  <span className="caption text-[var(--mm-text-muted)] flex items-center gap-1">
                    <Calendar size={12} /> Joined {user.joined}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFollow}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  className={`body font-semibold px-5 py-2.5 rounded-[var(--radius-md)] transition-all ${
                    isFollowing
                      ? 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] border border-[var(--border-default)]'
                      : 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] hover:shadow-[var(--shadow-glow-green)]'
                  } disabled:opacity-50`}
                >
                  {followMutation.isPending || unfollowMutation.isPending ? (
                    <Loader size={16} className="animate-spin" />
                  ) : isFollowing ? (
                    'Following'
                  ) : (
                    '+ Follow'
                  )}
                </button>
                <button
                  className="p-2.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                <span className="block font-[var(--font-display)] text-xl text-[var(--mm-accent-green)]">
                  {user.accuracy}%
                </span>
                <span className="caption text-[var(--mm-text-muted)]">Accuracy</span>
              </div>
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                <span className="block font-[var(--font-display)] text-xl text-[var(--mm-accent-amber)]">
                  🪙{user.points.toLocaleString()}
                </span>
                <span className="caption text-[var(--mm-text-muted)]">Points</span>
              </div>
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                <span className="block font-[var(--font-display)] text-xl text-[var(--mm-accent-blue)]">
                  #{user.rank}
                </span>
                <span className="caption text-[var(--mm-text-muted)]">Global Rank</span>
              </div>
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                <span className="block font-[var(--font-display)] text-xl text-[var(--mm-accent-red)]">
                  🔥{user.streak}
                </span>
                <span className="caption text-[var(--mm-text-muted)]">Streak</span>
              </div>
            </div>

            {/* Favourite Sports & Teams */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <span className="caption text-[var(--mm-text-muted)]">Sports:</span>
                {user.sports.map((s, i) => (
                  <span key={i} className="text-lg">
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="caption text-[var(--mm-text-muted)]">Teams:</span>
                {user.teams.map((t, i) => (
                  <span key={i} className="caption text-[var(--mm-text-secondary)]">
                    {t}
                    {i < user.teams.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-md)] p-1 border border-[var(--border-subtle)]">
          {profileTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-[var(--radius-sm)] body text-center transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                  : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                  <h3 className="heading-3 mb-4">Recent Predictions</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🎯</span>
                          <span className="body font-semibold">Match Prediction</span>
                          <span className="px-2 py-0.5 bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)] rounded-[var(--radius-sm)] caption font-semibold">
                            ✅ Correct
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="caption text-[var(--mm-text-muted)]">Manchester City vs Arsenal</span>
                          <span className="body font-semibold text-[var(--mm-accent-amber)]">+50 pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                  <h3 className="heading-3 mb-4">Achievements</h3>
                  <div className="flex gap-3">
                    {['🎯', '🔥', '🌍', '💯', '🧠', '⚡'].map((icon, i) => {
                      const names = ['Sharpshooter', 'On Fire', 'Global Fan', 'Century', 'Big Brain', 'Speed Guesser']
                      const rarities = ['rare', 'epic', 'common', 'legendary', 'epic', 'rare'] as const
                      return (
                        <AchievementBadge
                          key={i}
                          icon={icon}
                          name={names[i] as any}
                          rarity={rarities[i] as any}
                          unlocked={i < 3}
                          size="md"
                        />
                      )
                    })}
                    <div className="flex items-center">
                      <span className="caption text-[var(--mm-text-muted)]">+{12 - 6} more</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h3 className="heading-3 mb-4">Prediction History</h3>
                <div className="text-center py-12 text-[var(--mm-text-muted)]">
                  <Target size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="body">All public predictions will appear here</p>
                  <p className="caption mt-1">Some predictions may be private</p>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h3 className="heading-3 mb-4">Earned Badges</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                  {[
                    { icon: '🎯', name: 'Sharpshooter', rarity: 'rare', unlocked: true },
                    { icon: '🔥', name: 'On Fire', rarity: 'epic', unlocked: true },
                    { icon: '🌍', name: 'Global Fan', rarity: 'common', unlocked: true },
                    { icon: '💯', name: 'Century Club', rarity: 'legendary', unlocked: false },
                    { icon: '🧠', name: 'Big Brain', rarity: 'epic', unlocked: false },
                    { icon: '⚡', name: 'Speed Guesser', rarity: 'rare', unlocked: false },
                    { icon: '👑', name: 'League Champ', rarity: 'legendary', unlocked: false },
                    { icon: '🏟️', name: 'Match Hero', rarity: 'rare', unlocked: false },
                    { icon: '🛡️', name: 'Defense Expert', rarity: 'common', unlocked: false },
                  ].map((badge, i) => (
                    <AchievementBadge
                      key={i}
                      icon={badge.icon}
                      name={badge.name}
                      rarity={badge.rarity as any}
                      unlocked={badge.unlocked}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h3 className="heading-3 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'predicted 2-1 Manchester City vs Arsenal', time: '2h ago', type: 'prediction' },
                    { action: 'earned +50 pts on Premier League match', time: '2h ago', type: 'points' },
                    { action: 'moved to #1 on weekly leaderboard', time: '1d ago', type: 'rank' },
                    { action: 'unlocked 🔥 On Fire badge', time: '3d ago', type: 'achievement' },
                    { action: 'joined Premier League Fans league', time: '1w ago', type: 'league' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center shrink-0 text-sm">
                        {item.type === 'prediction'
                          ? '🎯'
                          : item.type === 'points'
                            ? '🪙'
                            : item.type === 'rank'
                              ? '🏆'
                              : item.type === 'achievement'
                                ? '🏅'
                                : '👥'}
                      </div>
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

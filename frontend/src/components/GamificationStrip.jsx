import React from 'react'
import { Link } from 'react-router-dom'
import { Flame, Trophy, Zap, TrendingUp, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'

const tierMeta = {
  BRONZE: { label: 'Bronze Fan', icon: '🥉', color: 'var(--tier-bronze)', min: 0 },
  SILVER: { label: 'Silver Star', icon: '🥈', color: 'var(--tier-silver)', min: 500 },
  GOLD: { label: 'Gold Guru', icon: '🥇', color: 'var(--tier-gold)', min: 1500 },
  PLATINUM: { label: 'Platinum Pro', icon: '💎', color: 'var(--tier-platinum)', min: 3500 },
  DIAMOND: { label: 'Diamond Mind', icon: '💠', color: 'var(--tier-diamond)', min: 7000 },
  LEGEND: { label: 'Living Legend', icon: '👑', color: 'var(--tier-legend)', min: 12000 },
}

export default function GamificationStrip() {
  const { user } = useStore()

  if (!user) return null

  const totalPoints = user?.totalPoints || points || 0
  const streak = user?.streakCurrent || 0
  const bestStreak = user?.streakBest || 0
  const accuracy = user?.predAccuracy || 0
  const rank = user?.globalRank || '—'
  const tier = user?.tier || 'BRONZE'

  const currentTier = tierMeta[tier] || tierMeta.BRONZE
  const tierKeys = Object.keys(tierMeta)
  const currentIdx = tierKeys.indexOf(tier)
  const nextTier = currentIdx < tierKeys.length - 1 ? tierMeta[tierKeys[currentIdx + 1]] : null
  const progressToNext = nextTier
    ? Math.min(100, ((totalPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100)
    : 100

  return (
    <div className="bg-[var(--mm-bg-secondary)] border-b border-[var(--border-subtle)] px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Tier Badge */}
        <Link to="/profile/me" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
            {currentTier.icon}
          </div>
          <div className="hidden sm:block">
            <span className="body font-semibold text-[var(--mm-text-primary)]">{currentTier.label}</span>
            <span className="caption text-[var(--mm-text-muted)] block leading-tight">Rank #{rank}</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-8 w-px bg-[var(--border-subtle)] hidden sm:block" />

        {/* XP Progress Bar */}
        <div className="flex-1 hidden md:block max-w-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="caption text-[var(--mm-text-muted)]">
              {nextTier ? `${nextTier.icon} ${nextTier.label}` : '👑 Max Tier'}
            </span>
            <span className="caption text-[var(--mm-text-muted)]">{totalPoints.toLocaleString()} pts</span>
          </div>
          <div className="h-1.5 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${progressToNext}%`,
                background: nextTier
                  ? `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`
                  : 'var(--gradient-live)',
              }}
            />
          </div>
        </div>

        {/* Stat Items */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <Flame size={14} className="text-[var(--mm-accent-red)]" />
            <span className="body font-semibold text-[var(--mm-accent-red)]">{streak}</span>
            <span className="caption text-[var(--mm-text-muted)] hidden sm:inline">streak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-[var(--mm-accent-amber)]" />
            <span className="body font-semibold text-[var(--mm-accent-amber)]">{accuracy}%</span>
            <span className="caption text-[var(--mm-text-muted)] hidden sm:inline">acc</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-[var(--mm-accent-green)]" />
            <span className="body font-semibold text-[var(--mm-accent-green)]">{totalPoints.toLocaleString()}</span>
            <span className="caption text-[var(--mm-text-muted)] hidden sm:inline">pts</span>
          </div>
        </div>

        {/* Quick actions */}
        <Link
          to="/predictions"
          className="hidden lg:flex items-center gap-1 body font-semibold text-[var(--mm-accent-green)] hover:underline shrink-0"
        >
          Quick Predict <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}

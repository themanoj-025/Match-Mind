// @ts-nocheck
import React from 'react'
import { User, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface LeaderboardRowUser {
  avatar?: string
  name?: string
}

interface LeaderboardRowProps {
  rank: number
  user: LeaderboardRowUser
  points: number
  accuracy?: number
  streak?: number
  rankChange?: number
  isCurrentUser?: boolean
  tier?: string
}

const tierColors: Record<string, string> = {
  BRONZE: 'from-amber-700 to-amber-500',
  SILVER: 'from-gray-400 to-gray-200',
  GOLD: 'from-yellow-500 to-yellow-300',
  PLATINUM: 'from-cyan-500 to-cyan-300',
  DIAMOND: 'from-blue-500 to-purple-500',
  LEGEND: 'from-orange-500 to-red-500',
}

export default function LeaderboardRow({ rank, user, points, accuracy, streak, rankChange = 0, isCurrentUser = false, tier }: LeaderboardRowProps) {
  const isPodium = rank <= 3

  const RankChangeIcon = rankChange > 0 ? TrendingUp : rankChange < 0 ? TrendingDown : Minus
  const rankChangeColor = rankChange > 0 ? 'text-[var(--mm-accent-green)]' : rankChange < 0 ? 'text-[var(--mm-accent-red)]' : 'text-[var(--mm-text-muted)]'

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 px-4 py-3 rounded-[var(--radius-md)] transition-all duration-200 ${
        isCurrentUser
          ? 'bg-[var(--mm-accent-green)]/5 border border-[var(--border-active)]'
          : 'hover:bg-[var(--mm-bg-hover)] border border-transparent'
      }`}
    >
      {/* Rank */}
      <div className={`w-8 h-8 flex items-center justify-center ${
        isPodium ? 'font-bold' : 'body text-[var(--mm-text-muted)]'
      }`}>
        {isPodium ? (
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${tierColors[tier || ''] || 'from-gray-500 to-gray-400'} flex items-center justify-center text-xs font-bold text-[var(--mm-text-inverse)]`}>
            {rank}
          </div>
        ) : (
          <span className="body text-[var(--mm-text-muted)]">{rank}</span>
        )}
      </div>

      {/* Avatar & Name */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center overflow-hidden shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={16} className="text-[var(--mm-text-muted)]" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="body font-semibold truncate">{user?.name || 'Anonymous'}</span>
            {isCurrentUser && (
              <span className="caption text-[var(--mm-accent-green)] font-medium">(You)</span>
            )}
          </div>
          {accuracy !== undefined && (
            <span className="caption text-[var(--mm-text-muted)]">
              {accuracy}% accuracy
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6">
        {streak !== undefined && streak > 0 && (
          <div className="flex items-center gap-1">
            <span className="caption text-[var(--mm-accent-amber)]">🔥</span>
            <span className="caption text-[var(--mm-text-muted)]">{streak}</span>
          </div>
        )}
        <RankChangeIcon size={16} className={rankChangeColor} />
      </div>

      {/* Points */}
      <div className="text-right">
        <span className="font-bold font-[var(--font-display)] text-lg text-[var(--mm-accent-amber)]">{points.toLocaleString()}</span>
        <span className="caption text-[var(--mm-text-muted)] ml-1">pts</span>
      </div>
    </div>
  )
}


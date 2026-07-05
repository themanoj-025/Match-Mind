import React from 'react'
import { Link } from 'react-router-dom'
import { Trophy, TrendingUp, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'

export default function GamificationStrip() {
  const { user } = useStore()

  if (!user) return null

  const totalPoints = user?.totalPoints || 0
  const roomsActive = user?.roomsActive || 0

  return (
    <div className="bg-[var(--mm-bg-secondary)] border-b border-[var(--border-subtle)] px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Stat Items */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <Trophy size={14} className="text-[var(--mm-accent-green)]" />
            <span className="body font-semibold text-[var(--mm-accent-green)]">{totalPoints.toLocaleString()}</span>
            <span className="caption text-[var(--mm-text-muted)] hidden sm:inline">fantasy pts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={14} className="text-[var(--mm-accent-amber)]" />
            <span className="body font-semibold text-[var(--mm-accent-amber)]">{roomsActive}</span>
            <span className="caption text-[var(--mm-text-muted)] hidden sm:inline">rooms</span>
          </div>
        </div>

        {/* Quick actions */}
        <Link
          to="/rooms/new"
          className="hidden lg:flex items-center gap-1 body font-semibold text-[var(--mm-accent-green)] hover:underline shrink-0"
        >
          Create Auction Room <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  )
}

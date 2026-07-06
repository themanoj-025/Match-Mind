// @ts-nocheck
import React from 'react'
import { Trophy, TrendingUp } from 'lucide-react'
import useStore from '../store/useStore'

export default function GamificationStrip() {
  const { user } = useStore()

  if (!user) return null

  const totalPoints = (user as { totalPoints?: number }).totalPoints || 0
  const roomsActive = (user as { roomsActive?: number }).roomsActive || 0

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
      </div>
    </div>
  )
}


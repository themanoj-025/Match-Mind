import React from 'react'
import { Link } from 'react-router-dom'
import { Settings, Bell, Trophy, Target, TrendingUp, Flame, Star, Shield, Zap, Brain, Crown, Globe } from 'lucide-react'

export default function MyProfilePage() {
  const badges = [
    { icon: '🎯', name: 'Sharpshooter', unlocked: false },
    { icon: '🔥', name: 'On Fire', unlocked: true },
    { icon: '💯', name: 'Century', unlocked: false },
    { icon: '🧠', name: 'Big Brain', unlocked: false },
    { icon: '👑', name: 'League Champion', unlocked: false },
    { icon: '⚡', name: 'Speed Guesser', unlocked: false },
    { icon: '🌍', name: 'Global Fan', unlocked: true },
    { icon: '🏟️', name: 'Match Day Hero', unlocked: false },
  ]

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Actions */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <Link to="/profile/me/notifications" className="p-2 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]"><Bell size={18} /></Link>
          <Link to="/profile/me/settings" className="p-2 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]"><Settings size={18} /></Link>
        </div>

        {/* Profile Card */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden mb-6">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-[var(--mm-accent-green)]/20 to-[var(--mm-accent-purple)]/20" />
          <div className="px-6 pb-6 -mt-12 sm:-mt-16">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center border-4 border-[var(--mm-bg-secondary)] text-2xl font-bold text-[var(--mm-text-inverse)]">Y</div>
              <div className="pb-1">
                <h1 className="heading-2">Your Name</h1>
                <span className="caption text-[var(--mm-text-muted)]">@username</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center"><span className="block heading-2 text-[var(--mm-accent-green)]">0%</span><span className="caption text-[var(--mm-text-muted)]">Accuracy</span></div>
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center"><span className="block heading-2 text-[var(--mm-accent-amber)]">0</span><span className="caption text-[var(--mm-text-muted)]">Points</span></div>
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center"><span className="block heading-2 text-[var(--mm-text-muted)]">—</span><span className="caption text-[var(--mm-text-muted)]">Global Rank</span></div>
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center"><span className="block heading-2 text-[var(--mm-accent-red)]">0</span><span className="caption text-[var(--mm-text-muted)]">Streak</span></div>
            </div>
          </div>
        </div>

        {/* Tabs: Overview | Predictions | Achievements | Activity */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['Overview', 'Predictions', 'Achievements', 'Activity'].map((tab) => (
            <button key={tab} className="px-5 py-2.5 rounded-[var(--radius-md)] body bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold">{tab}</button>
          ))}
        </div>

        {/* Achievements */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
          <h2 className="heading-3 mb-4">Achievement Badges</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {badges.map((badge, i) => (
              <div key={i} className={`flex flex-col items-center gap-1.5 p-3 rounded-[var(--radius-md)] ${badge.unlocked ? 'bg-[var(--mm-bg-tertiary)]' : 'bg-[var(--mm-bg-tertiary)]/50 opacity-40'}`}>
                <span className="text-2xl">{badge.icon}</span>
                <span className="caption text-center text-[var(--mm-text-muted)]">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

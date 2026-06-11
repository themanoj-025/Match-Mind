import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Activity, Trophy, Target, Star, Users, Zap } from 'lucide-react'

const activityTabs = [
  { id: 'my', label: 'My Activity' },
  { id: 'following', label: 'Following' },
]

const myActivity = [
  { icon: '🎯', action: 'You predicted 2-1 Manchester City vs Arsenal', time: '2h ago' },
  { icon: '🪙', action: 'You earned +50 pts on Premier League match', time: '2h ago' },
  { icon: '🏆', action: 'You moved to #198 on global leaderboard', time: '1d ago' },
  { icon: '🏅', action: 'You unlocked 🔥 On Fire badge', time: '3d ago' },
  { icon: '👥', action: 'You joined Premier League Fans league', time: '1w ago' },
]

const followingActivity = [
  { user: 'SportsKing', action: 'predicted 3-1 Liverpool vs Chelsea', time: '10m ago', avatar: 'S' },
  { user: 'GoalPredictor', action: 'earned +50 pts on Arsenal match', time: '25m ago', avatar: 'G' },
  { user: 'HoopsMaster', action: 'unlocked 🧠 Big Brain badge', time: '1h ago', avatar: 'H' },
  { user: 'GridironGuru', action: 'moved to #15 on weekly leaderboard', time: '2h ago', avatar: 'G' },
]

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState('my')

  return (
    <motion.div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet><title>Activity — MatchMind</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="heading-1 mb-6">Activity</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-md)] p-1 border border-[var(--border-subtle)]">
          {activityTabs.map((tab) => (
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

        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
          {activeTab === 'my' && (
            <div className="space-y-3">
              {myActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0">
                  <span className="text-lg w-8 text-center">{item.icon}</span>
                  <div className="flex-1">
                    <p className="body text-[var(--mm-text-secondary)]">{item.action}</p>
                    <span className="caption text-[var(--mm-text-muted)]">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'following' && (
            <div className="space-y-3">
              {followingActivity.length > 0 ? followingActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[var(--border-subtle)] last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[var(--mm-text-inverse)]">{item.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="body"><span className="font-semibold">{item.user}</span> {item.action}</p>
                    <span className="caption text-[var(--mm-text-muted)]">{item.time}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 text-[var(--mm-text-muted)]">
                  <Users size={28} className="mx-auto mb-2 opacity-50" />
                  <p className="body">Follow people to see their activity</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// @ts-nocheck
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import AchievementBadge from '../components/AchievementBadge'
import { cardStaggerContainer, cardStaggerItem } from '../lib/animation/variants'

const rarityTabs = ['All', 'Common', 'Rare', 'Epic', 'Legendary']

const achievements = [
  { icon: '🎯', name: 'Sharpshooter', description: 'Get 10 predictions correct', rarity: 'rare', unlocked: false, progress: '7/10' },
  { icon: '🔥', name: 'On Fire', description: 'Achieve a 5-match win streak', rarity: 'epic', unlocked: true, unlockedAt: 'Mar 2026' },
  { icon: '🌍', name: 'Global Fan', description: 'Predict matches from 3 different sports', rarity: 'common', unlocked: true, unlockedAt: 'Jan 2026' },
  { icon: '💯', name: 'Century Club', description: 'Make 100 predictions', rarity: 'legendary', unlocked: false, progress: '42/100' },
  { icon: '🧠', name: 'Big Brain', description: 'Get 50 predictions correct', rarity: 'epic', unlocked: false, progress: '18/50' },
  { icon: '⚡', name: 'Speed Guesser', description: 'Make 10 predictions within 5 minutes of kickoff', rarity: 'rare', unlocked: false, progress: '3/10' },
  { icon: '👑', name: 'League Champ', description: 'Win a league competition', rarity: 'legendary', unlocked: false, progress: '0/1' },
  { icon: '🏟️', name: 'Match Hero', description: 'Get 20 predictions correct in a single day', rarity: 'rare', unlocked: false, progress: '2/20' },
  { icon: '🛡️', name: 'Defense Expert', description: 'Predict 10 clean sheets correctly', rarity: 'common', unlocked: false, progress: '5/10' },
  { icon: '🎪', name: 'Variety King', description: 'Predict matches in all 6 sports', rarity: 'epic', unlocked: false, progress: '1/6' },
  { icon: '💎', name: 'Diamond Hands', description: 'Reach Diamond tier', rarity: 'legendary', unlocked: false, progress: '3,500/10,000 pts' },
  { icon: '🚀', name: 'Rocket Start', description: 'Earn 500 points in your first week', rarity: 'rare', unlocked: true, unlockedAt: 'Jan 2026' },
]

export default function AchievementsPage() {
  const [activeRarity, setActiveRarity] = useState('All')

  const filtered = activeRarity === 'All'
    ? achievements
    : achievements.filter(a => a.rarity.toUpperCase() === activeRarity.toUpperCase())

  const earned = achievements.filter(a => a.unlocked).length

  return (
    <motion.div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet><title>Achievements & Badges — MatchMind</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-1">Your Badges</h1>
          <span className="caption text-[var(--mm-text-muted)]">{earned}/{achievements.length} earned</span>
        </div>

        {/* Progress summary */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="body font-semibold">Next badge to unlock</span>
            <span className="caption text-[var(--mm-text-muted)]">{achievements.find(a => !a.unlocked)?.name}</span>
          </div>
          <div className="h-2 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
            <div className="h-full bg-[var(--gradient-live)] rounded-full transition-all" style={{ width: `${(earned / achievements.length) * 100}%` }} />
          </div>
        </div>

        {/* Rarity tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {rarityTabs.map((tab) => (
            <button
              key={tab} onClick={() => setActiveRarity(tab)}
              className={`px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all ${
                activeRarity === tab ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold' : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Badge grid */}
        <motion.div variants={cardStaggerContainer} initial="initial" animate="animate" className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {filtered.map((badge, i) => (
            <motion.div key={i} variants={cardStaggerItem}>
              <AchievementBadge icon={badge.icon} name={badge.name} rarity={badge.rarity} unlocked={badge.unlocked} />
              <div className="mt-1 text-center">
                {!badge.unlocked && badge.progress && (
                  <span className="caption text-[var(--mm-text-muted)]">{badge.progress}</span>
                )}
                {badge.unlocked && badge.unlockedAt && (
                  <span className="caption text-[var(--mm-text-muted)]">Earned {badge.unlockedAt}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--mm-text-muted)]">
            <p className="body">No {activeRarity.toLowerCase()} badges</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}


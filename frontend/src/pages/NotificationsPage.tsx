// @ts-nocheck
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, Trophy, UserPlus, Zap, CheckCheck, Star, TrendingUp, MessageCircle, Swords } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cardStaggerContainer, cardStaggerItem } from '../lib/animation/variants'
import { useNotifications, useMarkNotificationsRead } from '../hooks/useApi'

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'predictions', label: 'Predictions' },
  { id: 'matches', label: 'Matches' },
  { id: 'social', label: 'Social' },
  { id: 'system', label: 'System' },
]

const FALLBACK_NOTIFS = [
  { id: '1', type: 'prediction', title: 'Prediction scored', message: 'You earned +50 pts on Man City vs Arsenal', time: '2m ago', isRead: false },
  { id: '2', type: 'rank', title: 'Rank changed', message: "You're now #198 globally", time: '15m ago', isRead: false },
  { id: '3', type: 'match', title: 'Match starting', message: 'Arsenal vs Chelsea kicks off in 30 min', time: '25m ago', isRead: false },
  { id: '4', type: 'social', title: 'New follower', message: 'SportsKing started following you', time: '1h ago', isRead: true },
  { id: '5', type: 'achievement', title: 'Achievement unlocked', message: 'You unlocked 🔥 On Fire badge', time: '3h ago', isRead: true },
  { id: '6', type: 'league', title: 'League update', message: 'Premier Minds leaderboard updated', time: '5h ago', isRead: true },
  { id: '7', type: 'system', title: 'Welcome to MatchMind!', message: 'Complete your profile to get started', time: '1d ago', isRead: true },
]

const typeIcons = {
  prediction: Zap, match: Trophy, social: UserPlus, system: Bell, rank: TrendingUp, achievement: Star, league: Swords,
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [localRead, setLocalRead] = useState(new Set())

  const { data: apiNotifs = [], isLoading } = useNotifications()
  const markAllReadMutation = useMarkNotificationsRead()

  // Use API data or fallback
  const allNotifs = apiNotifs.length > 0
    ? apiNotifs.map(n => ({
        id: n.id,
        type: n.type?.toLowerCase() || 'system',
        title: n.title || n.type,
        message: n.message || '',
        time: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : '',
        isRead: localRead.has(n.id) || n.read || false,
      }))
    : FALLBACK_NOTIFS.map(n => ({ ...n, isRead: localRead.has(n.id) || n.isRead }))

  const filteredItems = activeFilter === 'all'
    ? allNotifs
    : allNotifs.filter(n => n.type === activeFilter || (activeFilter === 'system' && ['system', 'achievement'].includes(n.type)))

  const unreadCount = allNotifs.filter(n => !n.isRead).length

  const handleMarkAllRead = () => {
    const ids = allNotifs.filter(n => !n.isRead).map(n => n.id)
    setLocalRead(prev => new Set([...prev, ...ids]))
    markAllReadMutation.mutate()
  }

  const handleMarkRead = (id) => {
    setLocalRead(prev => new Set([...prev, id]))
  }

  return (
    <motion.div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet><title>Notifications — MatchMind</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-1">Notifications</h1>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-1 caption text-[var(--mm-accent-green)] font-medium hover:underline">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id} onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                  : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            <motion.div variants={cardStaggerContainer} initial="initial" animate="animate" className="space-y-2">
              {filteredItems.map((notif) => {
                const Icon = typeIcons[notif.type] || Bell
                return (
                  <motion.div
                    key={notif.id} layout variants={cardStaggerItem}
                    onClick={() => handleMarkRead(notif.id)}
                    className={`flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border cursor-pointer transition-all ${
                      notif.isRead
                        ? 'bg-[var(--mm-bg-secondary)] border-[var(--border-subtle)]'
                        : 'bg-[var(--mm-bg-tertiary)] border-[var(--border-active)]/20'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--mm-bg-hover)] flex items-center justify-center shrink-0" style={{ color: notif.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body font-medium">{notif.title}</p>
                      <p className="body text-[var(--mm-text-secondary)] mt-0.5">{notif.message}</p>
                      <span className="caption text-[var(--mm-text-muted)] mt-1 block">{notif.time}</span>
                    </div>
                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--mm-accent-green)] mt-1.5 shrink-0 animate-live-pulse" />
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center">
                <Bell size={28} className="text-[var(--mm-text-muted)]" />
              </div>
              <p className="body text-[var(--mm-text-muted)]">You're all caught up!</p>
              <p className="caption text-[var(--mm-text-muted)] mt-1">No {activeFilter !== 'all' ? `${activeFilter} ` : ''}notifications</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}


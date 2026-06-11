import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Users, Trophy, Send, Activity, MessageCircle, UserPlus, Crown, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatMessage from '../components/ChatMessage'

const tabs = [
  { id: 'rankings', label: 'Rankings', icon: Trophy },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'members', label: 'Members', icon: Users },
]

export default function SquadPage() {
  const { squadId } = useParams()
  const [activeTab, setActiveTab] = useState('rankings')
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState([])
  const chatEndRef = useRef(null)

  const handleReact = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg
      const reactions = { ...(msg.reactions || {}) }
      reactions[emoji] = (reactions[emoji] || 0) + 1
      return { ...msg, reactions }
    }))
  }

  useEffect(() => {
    setMessages([
      { id: 1, user: { name: 'SportsKing', avatar: null, tier: 'GOLD' }, text: 'Great predictions this week team! 🎯', timestamp: '5m ago', reactions: { '🔥': 5 }, type: 'text' },
      { id: 2, user: { name: 'System', avatar: null }, text: 'GoalPredictor earned +50 pts on Man City vs Arsenal', timestamp: '1h ago', reactions: {}, type: 'system' },
    ])
  }, [squadId])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    setMessages(prev => [...prev, { id: Date.now(), user: { name: 'You', avatar: null, tier: 'BRONZE' }, text: messageInput.trim(), timestamp: 'now', reactions: {}, type: 'text' }])
    setMessageInput('')
  }

  const members = [
    { name: 'You', role: 'Owner', pts: 1250, rank: 1, isYou: true, isOnline: true },
    { name: 'SportsKing', role: 'Admin', pts: 1180, rank: 2, isOnline: true },
    { name: 'GoalPredictor', role: 'Member', pts: 1100, rank: 3, isOnline: false },
    { name: 'PremFan42', role: 'Member', pts: 980, rank: 4, isOnline: true },
    { name: 'FootyLover', role: 'Member', pts: 920, rank: 5, isOnline: false },
  ]

  const activities = [
    { user: 'SportsKing', action: 'predicted 2-1 Man City vs Arsenal', time: '10m ago', type: 'prediction' },
    { user: 'GoalPredictor', action: 'earned +50 pts', time: '25m ago', type: 'points' },
    { user: 'You', action: 'joined the squad', time: '2h ago', type: 'join' },
    { user: 'SportsKing', action: 'unlocked 🔥 On Fire badge', time: '1d ago', type: 'achievement' },
  ]

  return (
    <motion.div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet><title>The Undefeatables — Squad | MatchMind</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/squads" className="inline-flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-4 transition-colors">
          <ArrowLeft size={16} /> All Squads
        </Link>

        {/* Squad Header */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--mm-accent-purple)] to-[var(--mm-accent-blue)] flex items-center justify-center">
              <Users size={24} className="text-[var(--mm-text-inverse)]" />
            </div>
            <div>
              <h1 className="heading-2">{squadName}</h1>
              <div className="flex items-center gap-3">
                <span className="caption text-[var(--mm-text-muted)]">{memberCount} members</span>
                <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)]" />
                <span className="caption text-[var(--mm-accent-green)]">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-md)] p-1 border border-[var(--border-subtle)] overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] body whitespace-nowrap transition-all ${
                  activeTab === tab.id ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-medium' : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {/* Rankings Tab */}
            {activeTab === 'rankings' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h2 className="heading-3 mb-4">Squad Rankings</h2>
                <div className="space-y-1">
                  {members.map((m, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] ${m.isYou ? 'bg-[var(--mm-accent-green)]/5 border border-[var(--border-active)]' : 'hover:bg-[var(--mm-bg-hover)]'}`}>
                      <span className="body font-bold text-[var(--mm-accent-amber)] w-8">#{m.rank}</span>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--mm-text-inverse)]">{m.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <span className="body font-medium">{m.name} {m.isYou && <span className="caption text-[var(--mm-accent-green)]">(You)</span>}</span>
                        <span className="caption text-[var(--mm-text-muted)] ml-2">{m.role}</span>
                      </div>
                      <span className="body font-semibold text-[var(--mm-accent-amber)]">🪙 {m.pts.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                  <h3 className="body font-semibold flex items-center gap-2"><MessageCircle size={16} className="text-[var(--mm-accent-green)]" /> Squad Chat</h3>
                </div>
                <div className="h-[400px] overflow-y-auto py-2">
                  {messages.map((msg) => (<ChatMessage key={msg.id} message={msg} onReact={() => {}} onReport={() => {}} />))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="border-t border-[var(--border-subtle)] p-3">
                  <div className="flex items-center gap-2">
                    <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type a message..." className="flex-1 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-3 py-2.5 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none" />
                    <button type="submit" disabled={!messageInput.trim()} className="p-2.5 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] rounded-[var(--radius-md)] disabled:opacity-50 hover:shadow-[var(--shadow-glow-green)] transition-all"><Send size={18} /></button>
                  </div>
                </form>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h2 className="heading-3 mb-4">Squad Activity</h2>
                <div className="space-y-3">
                  {activities.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-[var(--border-subtle)] last:border-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[var(--mm-text-muted)]">{a.user.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="body"><span className="font-semibold">{a.user}</span> {a.action}</p>
                        <span className="caption text-[var(--mm-text-muted)]">{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h2 className="heading-3 mb-4">Members (8)</h2>
                <div className="space-y-1">
                  {members.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)]">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center">
                          <span className="text-sm font-bold text-[var(--mm-text-inverse)]">{m.name.charAt(0)}</span>
                        </div>
                        {m.isOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--mm-accent-green)] border-2 border-[var(--mm-bg-secondary)]" />}
                      </div>
                      <div className="flex-1">
                        <span className="body font-medium">{m.name} {m.isYou && <span className="caption text-[var(--mm-text-muted)]">(you)</span>}</span>
                        <div className="flex items-center gap-1">
                          {m.role === 'Owner' ? <Crown size={12} className="text-[var(--mm-accent-amber)]" /> : m.role === 'Admin' ? <Shield size={12} className="text-[var(--mm-accent-blue)]" /> : null}
                          <span className="caption text-[var(--mm-text-muted)]">{m.role}</span>
                        </div>
                      </div>
                      <span className="body text-[var(--mm-accent-amber)]">🪙 {m.pts.toLocaleString()}</span>
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

import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, Users, Trophy, Copy, Check, MessageCircle, BarChart3, Info, Send, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatMessage from '../components/ChatMessage'
import { useLeague, useLeagueLeaderboard } from '../hooks/useApi'

const tabs = [
  { id: 'standings', label: 'Standings', icon: Trophy },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'predictions', label: 'Predictions', icon: BarChart3 },
  { id: 'about', label: 'About', icon: Info },
]

export default function LeagueRoomPage() {
  const { leagueId } = useParams()
  const [activeTab, setActiveTab] = useState('standings')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [copied, setCopied] = useState(false)
  const chatEndRef = useRef(null)

  const { data: league, isLoading } = useLeague(leagueId)
  const { data: lbData = [] } = useLeagueLeaderboard(leagueId)

  const handleReact = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg
      const reactions = { ...(msg.reactions || {}) }
      reactions[emoji] = (reactions[emoji] || 0) + 1
      return { ...msg, reactions }
    }))
  }

  const inviteCode = league?.inviteCode || 'MM-' + (leagueId?.slice(0, 6).toUpperCase() || 'ABCDEF')

  // Build members from API data or fallback
  const members = lbData.length > 0 ? lbData.map((m, i) => ({
    name: m.name || m.user?.displayName || m.user?.username || 'Player ' + (i + 1),
    pts: m.points || 0,
    rank: m.rank || i + 1,
    isYou: false,
    avatar: m.user?.avatar || null,
  })) : [
    { name: 'You', pts: 1250, rank: 1, isYou: true, avatar: null },
    { name: 'SportsKing', pts: 1180, rank: 2, avatar: null },
    { name: 'GoalPredictor', pts: 1100, rank: 3, avatar: null },
    { name: 'PremFan42', pts: 980, rank: 4, avatar: null },
    { name: 'FootyLover', pts: 920, rank: 5, avatar: null },
  ]

  useEffect(() => {
    if (!league?.name) {
      setMessages([
        { id: 1, user: { name: 'SportsKing', avatar: null, tier: 'GOLD' }, text: 'Anyone watching the match tonight? 🔥', timestamp: '2m ago', reactions: { '🔥': 3 }, type: 'text' },
        { id: 2, user: { name: 'GoalPredictor', avatar: null, tier: 'SILVER' }, text: 'City are looking strong this season!', timestamp: '1m ago', reactions: { '👏': 2 }, type: 'text' },
        { id: 3, user: { name: 'System', avatar: null }, text: '🏆 League created by You', timestamp: '1w ago', reactions: {}, type: 'system' },
      ])
    }
  }, [leagueId, league?.name])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now(), user: { name: 'You', avatar: null, tier: 'BRONZE' }, text: message.trim(), timestamp: 'now', reactions: {}, type: 'text',
    }])
    setMessage('')
  }

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const leagueName = league?.name || 'League'
  const sport = league?.sport?.toLowerCase() || 'football'
  const memberCount = league?.members?.length || 0

  return (
    <motion.div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>{leagueName} — League Room | MatchMind</title>
      </Helmet>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/leagues" className="inline-flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-4 transition-colors">
          <ArrowLeft size={16} /> All Leagues
        </Link>

        {/* League Header */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--gradient-live)] flex items-center justify-center">
                <Trophy size={22} className="text-[var(--mm-text-inverse)]" />
              </div>
              <div>
                <h1 className="heading-2">{leagueName}</h1>
                <span className="caption text-[var(--mm-text-muted)]">{sport === 'football' ? '⚽' : sport === 'basketball' ? '🏀' : '🏆'} {sport.charAt(0).toUpperCase() + sport.slice(1)} League · {memberCount || 24} members</span>
              </div>

              {/* Invite Code */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] px-3 py-2 border border-[var(--border-subtle)]">
                  <Trophy size={14} className="text-[var(--mm-accent-amber)]" />
                  <span className="body font-mono text-[var(--mm-text-secondary)]">{inviteCode}</span>
                </div>
                <button onClick={copyCode} className="p-2 text-[var(--mm-text-muted)] hover:text-[var(--mm-accent-green)] transition-colors" aria-label="Copy invite code">
                  {copied ? <Check size={16} className="text-[var(--mm-accent-green)]" /> : <Copy size={16} />}
                </button>
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
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-sm)] body whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-medium'
                    : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
                }`}
              >
                <Icon size={16} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {/* Standings Tab */}
            {activeTab === 'standings' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h2 className="heading-3 mb-4">League Standings</h2>
                <div className="flex flex-col gap-1">
                  {members.map((member, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] transition-colors ${
                        member.isYou ? 'bg-[var(--mm-accent-green)]/5 border border-[var(--border-active)]' : 'hover:bg-[var(--mm-bg-hover)]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center body font-bold ${
                        member.rank <= 3 ? 'bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] text-[var(--mm-text-inverse)]' : 'text-[var(--mm-text-muted)]'
                      }`}>
                        {member.rank <= 3 ? ['🥇', '🥈', '🥉'][member.rank - 1] : `#${member.rank}`}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center">
                        <span className="text-xs font-bold text-[var(--mm-text-inverse)]">{member.name.charAt(0)}</span>
                      </div>
                      <span className="body flex-1">{member.name} {member.isYou && <span className="caption text-[var(--mm-accent-green)]">(You)</span>}</span>
                      <span className="body font-semibold text-[var(--mm-accent-amber)]">🪙 {member.pts.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
                <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <h3 className="body font-semibold flex items-center gap-2"><MessageCircle size={16} className="text-[var(--mm-accent-green)]" /> League Chat</h3>
                  <span className="caption text-[var(--mm-text-muted)]">5 online</span>
                </div>
                <div className="h-[400px] overflow-y-auto py-2">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} onReact={handleReact} onReport={() => {}} />
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="border-t border-[var(--border-subtle)] p-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-3 py-2.5 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-[3px] focus:ring-[var(--mm-accent-green-glow)]"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      className="p-2.5 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] rounded-[var(--radius-md)] disabled:opacity-50 hover:shadow-[var(--shadow-glow-green)] transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Predictions Tab */}
            {activeTab === 'predictions' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h2 className="heading-3 mb-4">Recent Predictions</h2>
                <div className="text-center py-12 text-[var(--mm-text-muted)]">
                  <BarChart3 size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="body">Member predictions will appear here</p>
                  <p className="caption mt-1">Predictions are revealed after kickoff</p>
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 sm:p-6">
                <h2 className="heading-3 mb-4">About this League</h2>
                <div className="space-y-4">
                  <div>
                    <span className="caption text-[var(--mm-text-muted)] block mb-1">Description</span>
                    <p className="body text-[var(--mm-text-secondary)]">A private league for Premier League enthusiasts. Compete to prove you know football best.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3">
                      <span className="caption text-[var(--mm-text-muted)] block">Sport</span>
                      <span className="body font-semibold">⚽ Football</span>
                    </div>
                    <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3">
                      <span className="caption text-[var(--mm-text-muted)] block">Members</span>
                      <span className="body font-semibold">24 / 50</span>
                    </div>
                    <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3">
                      <span className="caption text-[var(--mm-text-muted)] block">Scoring</span>
                      <span className="body font-semibold">Standard</span>
                    </div>
                    <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3">
                      <span className="caption text-[var(--mm-text-muted)] block">Created</span>
                      <span className="body font-semibold">Jan 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

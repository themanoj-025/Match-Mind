// @ts-nocheck
import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Users, BarChart3, Timer, Activity, ChevronLeft, Sparkles, Lock, Trophy, MessageCircle } from 'lucide-react'
import ScoreDisplay from '../components/ScoreDisplay'
import LiveBadge from '../components/LiveBadge'
import ChatMessage from '../components/ChatMessage'
import StatBar from '../components/StatBar'
import useStore from '../store/useStore'
import { useMatch, useMatchStats, useMatchLineups, useMatchH2H, useMatchTimeline } from '../hooks/useApi'
import type { Match, MatchStats, Lineups, H2H, TimelineEvent, ChatMessage as ChatMessageType } from '../lib/types'

const reactions = ['🔥', '😱', '👏', '😤', '⚽', '🏀']

// ── Animated xG Bar ───────────────────────────────────
function AnimatedXGBar({ label, home, away, homeColor = 'var(--mm-accent-green)', awayColor = 'var(--mm-accent-amber)' }: {
  label: string
  home: number
  away: number
  homeColor?: string
  awayColor?: string
}) {
  const max = Math.max(home, away, 0.1)
  const homePct = (home / max) * 100
  const awayPct = (away / max) * 100

  return (
    <div className="flex flex-col gap-1">
      <span className="caption text-[var(--mm-text-muted)] text-center">{label}</span>
      <div className="flex items-end gap-2 h-20">
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="caption font-bold" style={{ color: homeColor }}>{home.toFixed(1)}</span>
          <div
            className="w-full rounded-t-[var(--radius-sm)] transition-all duration-700"
            style={{ height: `${homePct}%`, background: `linear-gradient(180deg, ${homeColor}, ${homeColor}88)` }}
          />
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <span className="caption font-bold" style={{ color: awayColor }}>{away.toFixed(1)}</span>
          <div
            className="w-full rounded-t-[var(--radius-sm)] transition-all duration-700"
            style={{ height: `${awayPct}%`, background: `linear-gradient(180deg, ${awayColor}, ${awayColor}88)` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Spotlight Effect ──────────────────────────────────
function StadiumSpotlight() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Top-left spotlight */}
      <div
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-[0.04]"
        style={{
          background: 'radial-gradient(circle, var(--mm-accent-green) 0%, transparent 70%)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      {/* Top-right spotlight */}
      <div
        className="absolute -top-32 -right-20 w-80 h-80 rounded-full opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, var(--mm-accent-blue) 0%, transparent 70%)',
          animation: 'float 8s ease-in-out infinite 1s',
        }}
      />
      {/* Center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.02]"
        style={{
          background: 'radial-gradient(circle, var(--mm-accent-amber) 0%, transparent 60%)',
          animation: 'glow-pulse 4s ease-in-out infinite',
        }}
      />
    </div>
  )
}

export default function MatchRoomPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const { viewerCounts, setViewerCount } = useStore()
  const [activeTab, setActiveTab] = useState<string>('stats')
  const [mobilePanel, setMobilePanel] = useState<string>('chat')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [predHome, setPredHome] = useState(0)
  const [predAway, setPredAway] = useState(0)
  const [showGoalOverlay, setShowGoalOverlay] = useState(false)
  const [goalSequence, setGoalSequence] = useState(0)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { data: matchData } = useMatch(matchId)
  const { data: statsData } = useMatchStats(matchId)
  const { data: lineupsData } = useMatchLineups(matchId)
  const { data: h2hData } = useMatchH2H(matchId)
  const { data: timelineData } = useMatchTimeline(matchId)

  const handleReact = (messageId: string | number, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id !== messageId) return msg
      const reactionsData = { ...(msg.reactions || {}) }
      reactionsData[emoji] = (reactionsData[emoji] || 0) + 1
      return { ...msg, reactions: reactionsData }
    }))
  }

  // Build match from API data with graceful fallback
  const match: Match = matchData || {
    id: matchId!,
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    homeScore: 2,
    awayScore: 1,
    status: 'LIVE',
    minute: 67,
    competition: 'Premier League',
    sport: 'football',
    stadium: 'Etihad Stadium',
    homeTeamLogo: null,
    awayTeamLogo: null,
    scheduledAt: null,
  }

  const stats: MatchStats = statsData || {
    possession: [55, 45],
    shots: [12, 8],
    shotsOnTarget: [5, 3],
    corners: [7, 4],
    fouls: [10, 8],
    yellowCards: [2, 1],
    xg: [1.8, 1.2],
  }

  const timeline: TimelineEvent[] = timelineData || [
    { minute: 67, type: 'goal', team: 'home', description: 'J. Alvarez — Assisted by K. De Bruyne', scorer: 'J. Alvarez' },
    { minute: 42, type: 'goal', team: 'away', description: 'M. Ødegaard — Penalty', scorer: 'M. Ødegaard' },
    { minute: 28, type: 'goal', team: 'home', description: 'E. Haaland — Header from corner', scorer: 'E. Haaland' },
    { minute: 22, type: 'yellow', team: 'away', description: 'D. Rice' },
    { minute: 15, type: 'yellow', team: 'home', description: 'R. Dias' },
  ]

  const lineups: Lineups = lineupsData || {
    home: { formation: '4-3-3', players: ['Ederson', 'Walker', 'Dias', 'Aké', 'Gvardiol', 'Rodri', 'De Bruyne', 'Silva', 'Foden', 'Haaland', 'Alvarez'] },
    away: { formation: '4-3-3', players: ['Raya', 'White', 'Saliba', 'Gabriel', 'Zinchenko', 'Rice', 'Ødegaard', 'Havertz', 'Saka', 'Jesus', 'Martinelli'] },
  }

  const h2h: H2H = h2hData || { homeWins: 12, draws: 5, awayWins: 8, lastMeetings: [{ date: 'Sep 2025', score: '2-2' }, { date: 'Mar 2025', score: '1-0' }, { date: 'Oct 2024', score: '2-1' }, { date: 'Apr 2024', score: '0-0' }, { date: 'Jan 2024', score: '1-1' }] }

  // Socket sim: initial chat + goal effect
  useEffect(() => {
    setMessages([
      { id: 1, user: { name: 'SportsKing', avatar: null }, text: "Come on City!! 💪", timestamp: "66'", reactions: { '🔥': 12, '👏': 5 } },
      { id: 2, user: { name: 'GoalPredictor', avatar: null }, text: 'What a strike! 🚀', timestamp: "65'", reactions: { '😱': 8 } },
      { id: 3, user: { name: 'ArsenalFan4Life', avatar: null }, text: 'Still in this! COYG! 🔴', timestamp: "62'", reactions: { '👏': 6 } },
    ])

    // Simulate goal event after 3s
    const goalTimer = setTimeout(() => {
      setShowGoalOverlay(true)
      setGoalSequence(prev => prev + 1)
      setMessages(prev => [...prev, { id: Date.now(), user: { name: 'System', avatar: null }, text: '⚽ GOAL! Julian Alvarez (67\')', timestamp: "67'", isSystem: true }])
      setTimeout(() => setShowGoalOverlay(false), 1500)
    }, 3000)

    return () => clearTimeout(goalTimer)
  }, [matchId])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate viewer count updates
  useEffect(() => {
    setViewerCount(matchId!, 1247)
    const interval = setInterval(() => {
      setViewerCount(matchId!, Math.floor(1200 + Math.random() * 200))
    }, 10000)
    return () => clearInterval(interval)
  }, [matchId, setViewerCount])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: { name: 'You', avatar: null },
      text: message.trim(),
      timestamp: `${match.minute}'`,
      reactions: {},
    }])
    setMessage('')
  }

  const handleReaction = (emoji: string) => {
    // Simple reaction toggle
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: { name: 'System', avatar: null },
      isSystem: true,
      text: `Reacted with ${emoji}`,
      timestamp: `${match.minute}'`,
    }])
  }

  const statsTabs = [
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'lineups', label: 'Lineups', icon: Users },
    { id: 'h2h', label: 'H2H', icon: Timer },
  ]

  const mobilePanels = [
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'predict', label: 'Predict', icon: Trophy },
    { id: 'h2h', label: 'H2H', icon: Timer },
  ]

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>{match.homeTeam} vs {match.awayTeam} — Live {match.homeScore}-{match.awayScore} | MatchMind</title>
        <meta name="description" content={`Live: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam} — ${match.competition}. Stats, lineups, chat.`} />
        <meta property="og:title" content={`${match.homeTeam} vs ${match.awayTeam} — Live ${match.homeScore}-${match.awayScore}`} />
        <meta property="og:description" content={`${match.competition} ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam}. ${match.minute}' — ${match.stadium}.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`/live/${matchId}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SportsEvent',
            'name': `${match.homeTeam} vs ${match.awayTeam}`,
            'startDate': new Date().toISOString(),
            'location': { '@type': 'Place', 'name': match.stadium },
            'competitor': [
              { '@type': 'SportsTeam', 'name': match.homeTeam },
              { '@type': 'SportsTeam', 'name': match.awayTeam }
            ],
            'status': 'https://schema.org/EventActive'
          })}
        </script>
      </Helmet>

      {/* Goal Overlay */}
      <AnimatePresence>
        {showGoalOverlay && (
          <motion.div
            key={`goal-${goalSequence}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.3, ease: 'backOut' }}
            className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-[var(--mm-accent-green)]/95 text-[var(--mm-text-inverse)] px-10 py-8 rounded-[var(--radius-xl)] text-center shadow-[var(--shadow-elevated)] backdrop-blur-sm">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1.2, 1] }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-fluid-display mb-3"
              >
                ⚽
              </motion.div>
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="display-l">GOAL!</div>
                <div className="body-large font-semibold mt-1">Julian Alvarez · 67'</div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stadium Spotlights */}
      <StadiumSpotlight />

      {/* Match Header */}
      <div className="bg-[var(--mm-bg-secondary)] border-b border-[var(--border-subtle)] sticky top-16 z-[var(--z-sticky)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            {/* Back nav (mobile) */}
            <Link to="/live" className="md:hidden p-1 text-[var(--mm-text-secondary)]">
              <ChevronLeft size={20} />
            </Link>

            {/* Home Team */}
            <div className="flex flex-col items-center min-w-0 max-w-[100px] sm:max-w-[160px]">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center mb-1">
                <span className="font-bold text-sm sm:text-lg">{match.homeTeam.charAt(0)}</span>
              </div>
              <span className="caption sm:body font-semibold text-center truncate w-full">{match.homeTeam}</span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <ScoreDisplay home={match.homeScore} away={match.awayScore} status={match.status} size="xl" />
              <div className="flex items-center gap-2 mt-1">
                <LiveBadge minute={match.minute} />
                <span className="caption text-[var(--mm-text-muted)] hidden sm:inline">{match.stadium}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Users size={12} className="text-[var(--mm-text-muted)]" />
                <span className="caption text-[var(--mm-text-muted)]">{viewerCounts[matchId!]?.toLocaleString() || '1,247'} watching</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center min-w-0 max-w-[100px] sm:max-w-[160px]">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center mb-1">
                <span className="font-bold text-sm sm:text-lg">{match.awayTeam.charAt(0)}</span>
              </div>
              <span className="caption sm:body font-semibold text-center truncate w-full">{match.awayTeam}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Panel Switcher */}
      <div className="lg:hidden flex gap-1 px-4 py-2 bg-[var(--mm-bg-secondary)] border-b border-[var(--border-subtle)] overflow-x-auto">
        {mobilePanels.map((panel) => {
          const Icon = panel.icon
          return (
            <button
              key={panel.id}
              onClick={() => setMobilePanel(panel.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] body whitespace-nowrap transition-all ${
                mobilePanel === panel.id ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold' : 'text-[var(--mm-text-secondary)]'
              }`}
            >
              <Icon size={14} />
              {panel.label}
            </button>
          )
        })}
      </div>

      {/* Desktop: 3-Panel Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* LEFT: Stats Panel (40%) */}
          <div className={`flex-1 min-w-0 ${mobilePanel !== 'stats' ? 'hidden lg:block' : ''}`}>
            {/* Stats Tabs */}
            <div className="hidden lg:flex gap-1 mb-4 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-md)] p-1 border border-[var(--border-subtle)]">
              {statsTabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-[var(--radius-sm)] body transition-all ${
                      activeTab === tab.id ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-medium' : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Content */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 sm:p-6">
              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <motion.div
                  key={`stats-${goalSequence}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid gap-4"
                >
                  <h3 className="heading-3 mb-2">Match Statistics</h3>
                  <StatBar homeValue={stats.possession[0]} awayValue={stats.possession[1]} label="Possession" homeColor="var(--mm-accent-green)" awayColor="var(--mm-accent-amber)" />
                  
                  {/* Stat rows with hover effect */}
                  {[
                    { key: 'shots', label: 'Shots', home: stats.shots, away: stats.shots },
                    { key: 'shotsOT', label: 'Shots on Target', home: stats.shotsOnTarget, away: stats.shotsOnTarget },
                    { key: 'corners', label: 'Corners', home: stats.corners, away: stats.corners },
                    { key: 'fouls', label: 'Fouls', home: stats.fouls, away: stats.fouls },
                    { key: 'yellow', label: 'Yellow Cards', home: stats.yellowCards, away: stats.yellowCards },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.key}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex justify-between py-2 border-b border-[var(--border-subtle)] hover:bg-[var(--mm-bg-hover)]/50 px-2 -mx-2 rounded-[var(--radius-sm)] transition-colors"
                    >
                      <span className="body font-medium text-[var(--mm-accent-green)]">{stat.home[0]}</span>
                      <span className="caption text-[var(--mm-text-muted)]">{stat.label}</span>
                      <span className="body font-medium text-[var(--mm-accent-amber)]">{stat.away[1]}</span>
                    </motion.div>
                  ))}

                  {/* Animated xG Bars */}
                  <div className="pt-4 border-t border-[var(--border-subtle)]">
                    <AnimatedXGBar
                      label="Expected Goals (xG)"
                      home={stats.xg[0]}
                      away={stats.xg[1]}
                      homeColor="var(--mm-accent-green)"
                      awayColor="var(--mm-accent-amber)"
                    />
                  </div>
                </motion.div>
              )}

              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <div>
                  <h3 className="heading-3 mb-4">Match Timeline</h3>
                  <div className="relative pl-8">
                    <div className="absolute left-3.5 top-2 bottom-2 w-px bg-[var(--border-subtle)]" />
                    {timeline.map((event, i) => (
                      <div key={i} className="relative pb-5 last:pb-0">
                        <div className={`absolute -left-[18px] w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 border-[var(--mm-bg-secondary)] ${
                          event.type === 'goal' ? 'bg-[var(--mm-accent-green)]/20 text-[var(--mm-accent-green)]' : 'bg-[var(--mm-accent-amber)]/20 text-[var(--mm-accent-amber)]'
                        }`}>
                          {event.type === 'goal' ? '⚽' : '🟨'}
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="caption font-bold text-[var(--mm-text-muted)] min-w-[2rem]">{event.minute}'</span>
                          <div>
                            <p className="body text-[var(--mm-text-secondary)]">{event.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lineups Tab */}
              {activeTab === 'lineups' && (
                <div>
                  <h3 className="heading-3 mb-4">Starting Lineups</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="caption text-[var(--mm-text-muted)]">Formation:</span>
                    <span className="caption font-semibold text-[var(--mm-text-primary)]">{lineups.home.formation}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="body font-semibold mb-3 text-[var(--mm-accent-green)]">{match.homeTeam}</h4>
                      {lineups.home.players.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)] body text-[var(--mm-text-secondary)]">
                          <span className="caption text-[var(--mm-text-muted)] w-5 text-right">{i + 1}.</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="body font-semibold mb-3 text-[var(--mm-accent-amber)]">{match.awayTeam}</h4>
                      {lineups.away.players.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 py-1 px-2 rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)] body text-[var(--mm-text-secondary)]">
                          <span className="caption text-[var(--mm-text-muted)] w-5 text-right">{i + 1}.</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* H2H Tab */}
              {activeTab === 'h2h' && (
                <div>
                  <h3 className="heading-3 mb-4">Head to Head</h3>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                      <span className="block heading-2 text-[var(--mm-accent-green)]">{h2h.homeWins}</span>
                      <span className="caption text-[var(--mm-text-muted)]">{match.homeTeam}</span>
                    </div>
                    <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                      <span className="block heading-2 text-[var(--mm-text-muted)]">{h2h.draws}</span>
                      <span className="caption text-[var(--mm-text-muted)]">Draws</span>
                    </div>
                    <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                      <span className="block heading-2 text-[var(--mm-accent-amber)]">{h2h.awayWins}</span>
                      <span className="caption text-[var(--mm-text-muted)]">{match.awayTeam}</span>
                    </div>
                  </div>
                  <span className="caption text-[var(--mm-text-muted)] mb-3 block">Last 5 Meetings</span>
                  {h2h.lastMeetings.map((meeting, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                      <span className="caption text-[var(--mm-text-muted)]">{meeting.date}</span>
                      <span className="body font-semibold">{meeting.score}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Chat + Predictions (60% combined on desktop) */}
          <div className={`w-full lg:w-[480px] shrink-0 flex flex-col gap-4 ${mobilePanel === 'chat' ? '' : 'hidden lg:flex'}`}>
            {/* LIVE CHAT */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col h-[350px] sm:h-[420px]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
                <h3 className="body font-semibold flex items-center gap-2">
                  <MessageCircle size={16} className="text-[var(--mm-accent-green)]" />
                  Live Chat
                </h3>
                <div className="flex items-center gap-2">
                  <span className="caption text-[var(--mm-text-muted)]">🔥 234</span>
                </div>
              </div>

              {/* Messages - using enhanced ChatMessage component */}
              <div className="flex-1 overflow-y-auto py-2">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg as any} isOwn={false} onReact={handleReact} onReport={() => {}} onPin={undefined} />
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Reaction Bar */}
              <div className="flex items-center gap-1 px-4 py-1.5 border-t border-[var(--border-subtle)] bg-[var(--mm-bg-tertiary)]/30">
                {reactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className="px-2 py-1 rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)] transition-colors text-lg"
                    aria-label={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="border-t border-[var(--border-subtle)] p-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setShowGifPicker(!showGifPicker)} className="p-2 text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)] transition-colors" aria-label="Add GIF">
                    GIF
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-3 py-2 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none"
                    aria-label="Chat message"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="p-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] rounded-[var(--radius-md)] disabled:opacity-50 hover:shadow-[var(--shadow-glow-green)] transition-all"
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>

            {/* PREDICTION PANEL */}
            <div className={`bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 sm:p-5 ${mobilePanel === 'predict' ? '' : 'hidden lg:block'}`}>
              <h3 className="body font-semibold mb-4">🔮 What's the final score?</h3>

              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
                <span className="body font-medium text-center text-sm sm:text-base max-w-[80px] truncate">{match.homeTeam}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPredHome(p => Math.max(0, p - 1))} className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] flex items-center justify-center text-lg font-bold hover:bg-[var(--mm-bg-hover)]" aria-label="Decrease home score">−</button>
                  <span className="w-8 sm:w-10 text-center font-bold text-2xl sm:text-3xl font-[var(--font-display)] text-[var(--mm-accent-green)]">{predHome}</span>
                  <button onClick={() => setPredHome(p => Math.min(15, p + 1))} className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] flex items-center justify-center text-lg font-bold hover:bg-[var(--mm-bg-hover)]" aria-label="Increase home score">+</button>
                </div>
                <span className="text-[var(--mm-text-muted)] text-lg">:</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPredAway(p => Math.max(0, p - 1))} className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] flex items-center justify-center text-lg font-bold hover:bg-[var(--mm-bg-hover)]" aria-label="Decrease away score">−</button>
                  <span className="w-8 sm:w-10 text-center font-bold text-2xl sm:text-3xl font-[var(--font-display)] text-[var(--mm-accent-amber)]">{predAway}</span>
                  <button onClick={() => setPredAway(p => Math.min(15, p + 1))} className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] flex items-center justify-center text-lg font-bold hover:bg-[var(--mm-bg-hover)]" aria-label="Increase away score">+</button>
                </div>
                <span className="body font-medium text-center text-sm sm:text-base max-w-[80px] truncate">{match.awayTeam}</span>
              </div>

              {/* AI Hint */}
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 mb-3 border border-[var(--border-active)]/20">
                <div className="flex items-start gap-2">
                  <Sparkles size={16} className="text-[var(--mm-accent-green)] mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="caption font-semibold text-[var(--mm-accent-green)]">AI Suggestion</span>
                      <span className="caption px-1.5 py-0.5 bg-[var(--mm-bg-hover)] rounded-[var(--radius-sm)] text-[var(--mm-text-muted)]">2-1</span>
                    </div>
                    <p className="caption text-[var(--mm-text-muted)]">
                      {match.homeTeam} have won 4 of their last 5 at home. <span className="text-[var(--mm-accent-amber)]">68% confidence</span>
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-[var(--gradient-predict)] text-[var(--mm-text-inverse)] body font-semibold py-3 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-amber)] transition-all duration-300 flex items-center justify-center gap-2">
                <Lock size={16} />
                Lock In Prediction — 🪙 {predHome !== null && predAway !== null ? 50 + (predHome + predAway > 0 ? 10 : 0) : 0} pts at stake
              </button>
            </div>

            {/* Highlights Strip */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              <h3 className="body font-semibold mb-3">⚡ Match Clips</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {[
                  { time: "67'", label: 'GOAL! Alvarez', emoji: '⚽' },
                  { time: "42'", label: 'GOAL! Ødegaard', emoji: '⚽' },
                  { time: "28'", label: 'GOAL! Haaland', emoji: '⚽' },
                ].map((clip, i) => (
                  <div key={i} className="flex-shrink-0 w-36 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 cursor-pointer hover:bg-[var(--mm-bg-hover)] transition-colors">
                    <div className="text-2xl mb-1">{clip.emoji}</div>
                    <span className="caption font-bold text-[var(--mm-accent-green)]">{clip.time}</span>
                    <p className="caption text-[var(--mm-text-secondary)] truncate">{clip.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


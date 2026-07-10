import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, ChevronUp, Users, Sparkles } from 'lucide-react'

const CHAT_SNIPPETS = [
  {
    id: 1,
    room: 'Man City vs Arsenal',
    user: 'SportsKing',
    text: 'What a strike from Haaland! 🚀',
    emoji: '🔥',
    time: 'just now',
  },
  {
    id: 2,
    room: 'Lakers vs Celtics',
    user: 'HoopsMaster',
    text: 'LeBron still doing this at 40! Unreal.',
    emoji: '👑',
    time: '12s ago',
  },
  {
    id: 3,
    room: 'Djokovic vs Alcaraz',
    user: 'AcePredictor',
    text: 'Best match of the tournament so far',
    emoji: '🎾',
    time: '28s ago',
  },
  {
    id: 4,
    room: 'Man City vs Arsenal',
    user: 'GoalPredictor',
    text: '2-1 written all over this 🔮',
    emoji: '🎯',
    time: '45s ago',
  },
  {
    id: 5,
    room: 'NFL Draft Live',
    user: 'GridironGuru',
    text: 'Patriots on the clock! 👀',
    emoji: '🏈',
    time: '1m ago',
  },
  {
    id: 6,
    room: 'CSK vs MI',
    user: 'CricketKing',
    text: 'DHONI FINISHES OFF IN STYLE! 🏏',
    emoji: '💥',
    time: '1m ago',
  },
  {
    id: 7,
    room: 'Champions League',
    user: 'EuroFooty',
    text: 'What a night at the Bernabeu!',
    emoji: '⚽',
    time: '2m ago',
  },
  {
    id: 8,
    room: 'Real Madrid vs Barca',
    user: 'ElClasicoFan',
    text: 'Vamos! 3-0 up at halftime 🔥',
    emoji: '🔥',
    time: '2m ago',
  },
  {
    id: 9,
    room: 'Premier League',
    user: 'FootyLover',
    text: 'Title race is going to the wire!',
    emoji: '🏆',
    time: '3m ago',
  },
  {
    id: 10,
    room: 'NBA Playoffs',
    user: 'BallHandler',
    text: 'Game 7 energy is different 🏀',
    emoji: '💪',
    time: '3m ago',
  },
]

export default function QuickChatFeed() {
  const [isOpen, setIsOpen] = useState(false)
  const [snippets, setSnippets] = useState(CHAT_SNIPPETS.slice(0, 5))
  const feedRef = useRef(null)

  // Simulate new snippets coming in
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      const remaining = CHAT_SNIPPETS.filter((s) => !snippets.find((x) => x.id === s.id))
      if (remaining.length > 0) {
        const newSnippet = remaining[Math.floor(Math.random() * remaining.length)]
        setSnippets((prev) => [newSnippet, ...prev].slice(0, 8) as any)
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [isOpen, snippets])

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 right-4 z-[var(--z-drawer)] w-12 h-12 rounded-full flex items-center justify-center shadow-[var(--shadow-elevated)] transition-all duration-300 ${
          isOpen
            ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] scale-90'
            : 'bg-[var(--mm-bg-secondary)] text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)] animate-glow-pulse'
        }`}
        aria-label={isOpen ? 'Close chat feed' : 'Open sports bar feed'}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Floating drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={feedRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-36 right-4 z-[var(--z-drawer)] w-[360px] max-w-[calc(100vw-32px)] bg-[var(--mm-bg-secondary)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
                <h3 className="body font-semibold">Sports Bar Feed</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-[var(--mm-text-muted)]" />
                <span className="caption text-[var(--mm-text-muted)]">12.8k watching</span>
              </div>
            </div>

            {/* Feed items */}
            <div className="max-h-[420px] overflow-y-auto py-2">
              <AnimatePresence mode="sync">
                {snippets.map((snippet, i) => (
                  <motion.div
                    key={snippet.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="px-4 py-2.5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)]/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="caption font-semibold text-[var(--mm-accent-green)]">{snippet.user}</span>
                      <span className="caption text-[var(--mm-text-muted)]">in</span>
                      <span className="caption font-medium text-[var(--mm-text-secondary)] truncate">
                        {snippet.room}
                      </span>
                      <span className="caption text-[var(--mm-text-muted)] ml-auto shrink-0">{snippet.time}</span>
                    </div>
                    <p className="body text-[var(--mm-text-secondary)]">{snippet.text}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[var(--border-subtle)] bg-[var(--mm-bg-tertiary)]/50 flex items-center justify-between">
              <span className="caption text-[var(--mm-text-muted)] flex items-center gap-1">
                <Sparkles size={12} /> Live from active rooms
              </span>
              <span className="caption text-[var(--mm-accent-green)] font-medium">{snippets.length} messages</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, ThumbsUp, MessageCircle } from 'lucide-react'

const POLLS = [
  {
    id: 'haaland-hattrick',
    question: 'Will Haaland score a hat-trick tonight?',
    options: [
      { label: 'Yes 🎯', votes: 342, color: 'var(--mm-accent-green)' },
      { label: 'No ❌', votes: 587, color: 'var(--mm-accent-red)' },
      { label: 'Maybe 2 goals 🤔', votes: 221, color: 'var(--mm-accent-amber)' },
    ],
    totalVotes: 1150,
    category: 'Hot Debate',
  },
  {
    id: 'title-winner',
    question: 'Who wins the Premier League?',
    options: [
      { label: 'Man City 🔵', votes: 623, color: 'var(--mm-accent-blue)' },
      { label: 'Arsenal 🔴', votes: 491, color: 'var(--mm-accent-red)' },
      { label: 'Liverpool ❤️', votes: 387, color: 'var(--mm-accent-amber)' },
    ],
    totalVotes: 1501,
    category: 'Season Long',
  },
  {
    id: 'mvp-pick',
    question: 'NBA MVP this season?',
    options: [
      { label: 'Jokic 🃏', votes: 298, color: 'var(--mm-accent-green)' },
      { label: 'Giannis 🦌', votes: 212, color: 'var(--mm-accent-purple)' },
      { label: 'SGA ⚡', votes: 187, color: 'var(--mm-accent-blue)' },
      { label: 'Luka ✨', votes: 156, color: 'var(--mm-accent-amber)' },
    ],
    totalVotes: 853,
    category: 'NBA',
  },
]

export default function CommunityPollWidget({ compact = false }) {
  const [activePoll, setActivePoll] = useState(0)
  const [voted, setVoted] = useState(null)
  const [showResults, setShowResults] = useState(false)

  const poll = POLLS[activePoll]
  const pct = (votes) => (poll.totalVotes > 0 ? Math.round((votes / poll.totalVotes) * 100) : 0)

  const handleVote = (idx) => {
    setVoted(idx)
    setShowResults(true)
  }

  return (
    <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-[var(--mm-accent-green)]" />
          <h3 className="body font-semibold">Community Poll</h3>
        </div>
        <span className="caption px-2 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--mm-text-muted)]">
          {poll.category}
        </span>
      </div>

      {/* Poll body */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePoll}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <p className="body font-semibold mb-3">{poll.question}</p>

            <div className="space-y-2">
              {poll.options.map((opt, i) => {
                const percentage = pct(opt.votes)
                const isSelected = voted === i
                return (
                  <button
                    key={i}
                    onClick={() => handleVote(i)}
                    disabled={voted !== null}
                    className={`w-full text-left relative overflow-hidden rounded-[var(--radius-md)] border transition-all ${
                      isSelected
                        ? 'border-[var(--mm-accent-green)] bg-[var(--mm-accent-green)]/5'
                        : voted !== null
                          ? 'border-[var(--border-subtle)] opacity-60'
                          : 'border-[var(--border-subtle)] hover:border-[var(--border-active)] hover:bg-[var(--mm-bg-hover)]'
                    }`}
                  >
                    {/* Progress bar background */}
                    {(voted !== null || showResults) && (
                      <div
                        className="absolute inset-0 transition-all duration-700 rounded-[var(--radius-md)]"
                        style={{
                          width: `${percentage}%`,
                          background: `${opt.color}15`,
                        }}
                      />
                    )}
                    <div className="relative z-10 flex items-center justify-between px-3 py-2.5">
                      <span className="body font-medium">{opt.label}</span>
                      {(voted !== null || showResults) && (
                        <span className="body font-bold" style={{ color: opt.color }}>
                          {percentage}%
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="caption text-[var(--mm-text-muted)]">
                {poll.totalVotes.toLocaleString()} votes
              </span>
              {voted !== null && (
                <span className="caption text-[var(--mm-accent-green)] flex items-center gap-1">
                  <ThumbsUp size={12} /> Vote counted
                </span>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Poll navigation dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-[var(--border-subtle)]">
          {POLLS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActivePoll(i); setVoted(null); setShowResults(false) }}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activePoll ? 'bg-[var(--mm-accent-green)] w-5' : 'bg-[var(--mm-text-muted)] hover:bg-[var(--mm-text-secondary)]'
              }`}
              aria-label={`Poll ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

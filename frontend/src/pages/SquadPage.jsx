import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Users, Trophy } from 'lucide-react'

export default function SquadPage() {
  const { squadId } = useParams()
  const [message, setMessage] = useState('')

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/squads" className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Squads
        </Link>

        {/* Squad Header */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--mm-accent-purple)] to-[var(--mm-accent-blue)] flex items-center justify-center">
              <Users size={22} className="text-[var(--mm-text-inverse)]" />
            </div>
            <div>
              <h1 className="heading-2">The Undefeatables</h1>
              <span className="caption text-[var(--mm-text-muted)]">8 members</span>
            </div>
          </div>

          {/* Squad Leaderboard */}
          <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-4 mb-4">
            <h3 className="body font-semibold mb-3 flex items-center gap-2"><Trophy size={16} className="text-[var(--mm-accent-amber)]" /> Squad Rankings</h3>
            {[
              { name: 'You', pts: 1250, rank: 1 },
              { name: 'SportsKing', pts: 1180, rank: 2 },
              { name: 'GoalPredictor', pts: 1100, rank: 3 },
            ].map((m, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <span className="body font-bold text-[var(--mm-accent-amber)] w-6">#{m.rank}</span>
                <span className="body flex-1">{m.name}</span>
                <span className="body text-[var(--mm-accent-amber)]">🪙 {m.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Squad Chat */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <h3 className="body font-semibold">Squad Chat</h3>
          </div>
          <div className="h-64 overflow-y-auto p-4">
            <div className="text-center py-8 text-[var(--mm-text-muted)]">
              <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
              <p className="body">Chat with your squad</p>
            </div>
          </div>
          <div className="border-t border-[var(--border-subtle)] p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message..."
                className="flex-1 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-3 py-2 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none"
              />
              <button className="p-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] rounded-[var(--radius-md)]">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

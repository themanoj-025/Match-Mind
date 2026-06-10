import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, Trophy, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function LeagueRoomPage() {
  const { leagueId } = useParams()
  const [copied, setCopied] = useState(false)

  const inviteCode = 'MM-' + leagueId?.slice(0, 6).toUpperCase() || 'ABCDEF'

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Leagues
        </button>

        {/* League Header */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] flex items-center justify-center">
                <Trophy size={22} className="text-[var(--mm-text-inverse)]" />
              </div>
              <div>
                <h1 className="heading-2">Premier League Fans 2025</h1>
                <span className="caption text-[var(--mm-text-muted)]">⚽ Football League</span>
              </div>
            </div>
            <div className="caption text-[var(--mm-text-muted)]"><Users size={14} className="inline mr-1" />24 members</div>
          </div>

          {/* Invite Code */}
          <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 flex items-center justify-between">
            <div>
              <span className="caption text-[var(--mm-text-muted)]">Invite Code</span>
              <span className="body font-mono font-bold ml-3 text-[var(--mm-accent-green)]">{inviteCode}</span>
            </div>
            <button onClick={copyCode} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--mm-bg-hover)] rounded-[var(--radius-sm)] caption text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">
              {copied ? <Check size={14} className="text-[var(--mm-accent-green)]" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* League Leaderboard */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
          <h2 className="heading-3 mb-4">League Standings</h2>
          <div className="flex flex-col gap-1">
            {[
              { name: 'You', pts: 1250, rank: 1 },
              { name: 'SportsKing', pts: 1180, rank: 2 },
              { name: 'GoalPredictor', pts: 1100, rank: 3 },
              { name: 'PremFan42', pts: 980, rank: 4 },
              { name: 'FootyLover', pts: 920, rank: 5 },
            ].map((member, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] ${member.name === 'You' ? 'bg-[var(--mm-accent-green)]/5' : 'hover:bg-[var(--mm-bg-hover)]'}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center body font-bold ${member.rank <= 3 ? 'bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] text-[var(--mm-text-inverse)]' : 'text-[var(--mm-text-muted)]'}`}>
                  {member.rank}
                </span>
                <span className="body flex-1">{member.name} {member.name === 'You' && <span className="caption text-[var(--mm-accent-green)]">(You)</span>}</span>
                <span className="body font-semibold text-[var(--mm-accent-amber)]">🪙 {member.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

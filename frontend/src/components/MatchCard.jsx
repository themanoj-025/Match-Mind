import React from 'react'
import { Link } from 'react-router-dom'
import { Users, Clock } from 'lucide-react'
import SportBadge from './SportBadge'
import LiveBadge from './LiveBadge'

export default function MatchCard({ match, onEnterRoom, onPredict }) {
  const {
    id, homeTeam, awayTeam, homeTeamLogo, awayTeamLogo,
    homeScore, awayScore, status, minute, competition,
    viewersCount, sport, scheduledAt
  } = match

  const isLive = status === 'LIVE' || status === 'HALFTIME'
  const isFinished = status === 'FINISHED' || status === 'FT'
  const isScheduled = status === 'SCHEDULED' || status === 'scheduled'

  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className={`bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden transition-all duration-300 hover:border-[var(--border-active)] hover:shadow-[var(--shadow-card)] group ${
        isFinished ? 'opacity-60' : ''
      }`}
    >
      {/* Competition Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <SportBadge sport={sport} size="sm" />
          <span className="caption text-[var(--mm-text-muted)]">{competition}</span>
        </div>
        {isLive && <LiveBadge minute={minute} />}
        {isFinished && <span className="caption text-[var(--mm-text-muted)] font-semibold">FT</span>}
        {isScheduled && (
          <div className="flex items-center gap-1 text-[var(--mm-text-muted)]">
            <Clock size={12} />
            <span className="caption">{formatTime(scheduledAt)}</span>
          </div>
        )}
      </div>

      {/* Teams & Score */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center overflow-hidden">
              {homeTeamLogo ? (
                <img src={homeTeamLogo} alt={homeTeam} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-[var(--mm-text-muted)] font-bold text-lg">{homeTeam.charAt(0)}</span>
              )}
            </div>
            <span className="body text-[var(--mm-text-primary)] text-center truncate max-w-full">{homeTeam}</span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1">
            <div className={`flex items-center gap-2 ${isLive ? 'text-[var(--mm-accent-green)]' : 'text-[var(--mm-text-primary)]'}`}>
              <span className="font-bold text-3xl font-[var(--font-display)] tracking-tight">
                {homeScore ?? '-'}
              </span>
              <span className="text-[var(--mm-text-muted)] text-lg">:</span>
              <span className="font-bold text-3xl font-[var(--font-display)] tracking-tight">
                {awayScore ?? '-'}
              </span>
            </div>
            {isLive && (
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
                <span className="caption text-[var(--mm-accent-green)]">{minute}&apos;</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center overflow-hidden">
              {awayTeamLogo ? (
                <img src={awayTeamLogo} alt={awayTeam} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-[var(--mm-text-muted)] font-bold text-lg">{awayTeam.charAt(0)}</span>
              )}
            </div>
            <span className="body text-[var(--mm-text-primary)] text-center truncate max-w-full">{awayTeam}</span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border-subtle)] bg-[var(--mm-bg-tertiary)]/50">
        {viewersCount !== undefined && (
          <div className="flex items-center gap-1 text-[var(--mm-text-muted)]">
            <Users size={14} />
            <span className="caption">{viewersCount} watching</span>
          </div>
        )}
        <div className="flex-1" />
        {!isFinished && onPredict && (
          <button
            onClick={onPredict}
            className="caption font-semibold text-[var(--mm-accent-amber)] hover:text-[var(--mm-accent-green)] transition-colors px-3 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)]"
          >
            Predict
          </button>
        )}
        <button
          onClick={onEnterRoom}
          className="caption font-semibold bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] px-4 py-1.5 rounded-[var(--radius-sm)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300"
        >
          {isFinished ? 'Results' : isScheduled ? 'Set Reminder' : 'Enter Room'}
        </button>
      </div>
    </div>
  )
}

import React from 'react'
import { Link } from 'react-router-dom'

export default function LiveTicker() {
  // LiveTicker is now used for live football matches from the fixtures API
  // For now, return null until fixtures with LIVE status are available
  return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-[var(--mm-bg-secondary)] border-b border-[var(--border-subtle)] overflow-hidden h-10 backdrop-blur-sm">
      <div className="flex items-center h-full">
        {/* Live label */}
        <div className="flex items-center gap-1.5 px-3 h-full bg-[var(--mm-accent-green)]/10 border-r border-[var(--border-subtle)] shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
          <span className="caption font-bold text-[var(--mm-accent-green)] uppercase tracking-wider">LIVE</span>
        </div>

        {/* Scrolling matches */}
        <div className="flex animate-scroll-ticker gap-6 h-full items-center px-4 overflow-hidden">
          {[...liveMatchesList, ...liveMatchesList].map((match, idx) => (
            <Link
              key={`${match.id}-${idx}`}
              to={`/matches/${match.id}`}
              className="flex items-center gap-2 whitespace-nowrap text-xs hover:text-[var(--mm-accent-green)] transition-colors shrink-0 group/ticker"
            >
              <span className="opacity-60 group-hover/ticker:opacity-100 transition-opacity">⚽</span>
              <span className="font-medium">{match.homeTeam}</span>
              <span className="font-bold text-[var(--mm-accent-green)] tabular-nums">
                {match.homeScore} — {match.awayScore}
              </span>
              <span className="font-medium">{match.awayTeam}</span>
              <span className="text-[var(--mm-text-muted)] tabular-nums">{match.minute}&apos;</span>
              {match.viewersCount && (
                <span className="text-[var(--mm-text-muted)] hidden sm:inline">
                  👥 {(match.viewersCount > 1000 ? `${(match.viewersCount / 1000).toFixed(1)}k` : match.viewersCount)}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

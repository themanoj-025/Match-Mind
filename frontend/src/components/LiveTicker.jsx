import React from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'

export default function LiveTicker() {
  const { liveMatches } = useStore()
  const liveMatchesList = liveMatches.filter((m) => m.status === 'LIVE')

  if (liveMatchesList.length === 0) return null

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-[var(--mm-bg-secondary)] border-b border-[var(--border-subtle)] overflow-hidden h-10">
      <div className="flex animate-scroll-ticker gap-8 h-full items-center px-4">
        {[...liveMatchesList, ...liveMatchesList].map((match, idx) => (
          <Link
            key={`${match.id}-${idx}`}
            to={`/live/${match.id}`}
            className="flex items-center gap-2 whitespace-nowrap text-xs hover:text-[var(--mm-accent-green)] transition-colors shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
            <span className="font-medium">{match.homeTeam}</span>
            <span className="font-bold text-[var(--mm-accent-green)]">
              {match.homeScore} - {match.awayScore}
            </span>
            <span className="font-medium">{match.awayTeam}</span>
            <span className="text-[var(--mm-text-muted)]">{match.minute}&apos;</span>
            <span className="text-[var(--mm-text-muted)]">|</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

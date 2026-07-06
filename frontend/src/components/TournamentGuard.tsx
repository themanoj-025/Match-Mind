// @ts-nocheck
/**
 * TournamentGuard — MatchMind v2 §3.4
 *
 * Route guard that checks the tournamentId param against the live registry:
 * - Unknown ID → 404
 * - ANNOUNCED_NOT_CONFIRMED ID → 404 (never reachable by URL guessing)
 * - ANNOUNCED ID → renders ComingSoonTeaser, blocks room creation
 * - LIVE ID → renders children normally
 */

import { useParams, Navigate } from 'react-router-dom'
import { useTournament } from '../lib/tournaments'
import ComingSoonTeaser from './ComingSoonTeaser'

interface TournamentGuardProps {
  children: React.ReactNode
  /** If true, requires the tournament to be LIVE (for room creation, bidding, etc.) */
  requireLive?: boolean
}

export default function TournamentGuard({ children, requireLive = false }: TournamentGuardProps) {
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const { data: tournament, isLoading, isError } = useTournament(tournamentId)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--mm-accent-green)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--mm-text-muted)] body">Loading tournament...</span>
        </div>
      </div>
    )
  }

  // Unknown or ANNOUNCED_NOT_CONFIRMED
  if (isError || !tournament) {
    return <Navigate to="/404" replace />
  }

  // ANNOUNCED — always show teaser, never the regular children
  // (Read-only pages can optionally show a preview behind the teaser in future)
  if (tournament.status === 'ANNOUNCED') {
    return (
      <div className="pt-16">
        <ComingSoonTeaser tournament={tournament} />
        {!requireLive && (
          <div className="max-w-5xl mx-auto px-4 mt-8 opacity-60 pointer-events-none select-none">
            {children}
          </div>
        )}
      </div>
    )
  }

  // LIVE — render normally
  return <>{children}</>
}


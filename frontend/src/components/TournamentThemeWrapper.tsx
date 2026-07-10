// @ts-nocheck
import { type ReactNode, useMemo } from 'react'
import { useTournaments } from '../lib/tournaments'

interface Props {
  tournamentId?: string
  children: ReactNode
  className?: string
  /**
   * Optional inline theme for tournament-scoped pages where data is already fetched.
   * Falls back to looking up from useTournaments() if not provided.
   */
  theme?: { primary: string; accent: string }
}

/**
 * Wraps content with tournament-specific CSS variables for dynamic theming.
 * Accepts an optional `theme` prop for tournament-scoped pages where the parent
 * has already fetched the tournament data (avoids extra API call in presentational wrapper).
 * Falls back to lookup via useTournaments() if no theme prop is provided.
 *
 * Usage:
 *   <TournamentThemeWrapper tournamentId={room.tournamentId}>
 *     <PageContent />
 *   </TournamentThemeWrapper>
 */
export default function TournamentThemeWrapper({ tournamentId, children, className, theme: themeProp }: Props) {
  const { data: tournaments } = useTournaments()
  const theme = useMemo(() => {
    if (themeProp) return themeProp
    const tournament = tournaments?.find((t) => t.id === tournamentId)
    return tournament?.theme
  }, [themeProp, tournaments, tournamentId])

  return (
    <div
      className={className}
      data-tournament={tournamentId}
      style={
        theme
          ? ({
              '--tournament-primary': theme.primary,
              '--tournament-accent': theme.accent,
              '--tournament-primary-rgb': hexToRgb(theme.primary || ''),
              '--tournament-accent-rgb': hexToRgb(theme.accent || ''),
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  )
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0'
}

import { type ReactNode } from 'react'
import { useTournaments } from '../lib/tournaments'

interface Props {
  tournamentId?: string
  children: ReactNode
  className?: string
}

/**
 * Wraps content with tournament-specific CSS variables for dynamic theming.
 * Driven by the registry response, not hardcoded color lookups.
 * 
 * Usage:
 *   <TournamentThemeWrapper tournamentId={room.tournamentId}>
 *     <PageContent />
 *   </TournamentThemeWrapper>
 */
export default function TournamentThemeWrapper({ tournamentId, children, className }: Props) {
  const { data: tournaments } = useTournaments()
  const tournament = tournaments?.find((t) => t.id === tournamentId)
  const theme = tournament?.theme

  return (
    <div
      className={className}
      style={
        theme
          ? {
              '--tournament-primary': theme.primary,
              '--tournament-accent': theme.accent,
              '--tournament-primary-rgb': hexToRgb(theme.primary),
              '--tournament-accent-rgb': hexToRgb(theme.accent),
            } as React.CSSProperties
          : undefined
      }
    >
      {children}
    </div>
  )
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}

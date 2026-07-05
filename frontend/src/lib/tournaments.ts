/**
 * Tournament Configuration — Frontend (v2)
 * 
 * Fetch tournaments from the API/registry rather than hardcoding them.
 * This file provides the client-side helpers and defaults.
 */

import type { Tournament } from './types'

export const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'] as const
export type Position = (typeof POSITIONS)[number]

export const DEFAULT_ROSTER_RULES = {
  GK: 2,
  DEF: 5,
  MID: 5,
  FWD: 3,
  total: 15,
} as const

/**
 * useTournaments() — React Query hook
 * Fetches tournaments from GET /api/tournaments.
 * Everything downstream reads from this response — never hardcode IDs.
 */
import { useQuery } from '@tanstack/react-query'

export function useTournaments() {
  return useQuery<Tournament[]>({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const res = await fetch('/api/tournaments')
      if (!res.ok) throw new Error('Failed to fetch tournaments')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5 min — tournaments rarely change
  })
}

export function useTournament(id: string | undefined) {
  return useQuery<Tournament>({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${id}`)
      if (!res.ok) throw new Error('Tournament not found')
      return res.json()
    },
    enabled: !!id,
  })
}

/**
 * getTournamentTheme — applies tournament colors as CSS custom properties
 * via a data-tournament attribute on a root wrapper.
 */
export function getTournamentCSSVars(tournament?: Tournament): React.CSSProperties {
  if (!tournament) return {}
  return {
    '--tournament-primary': tournament.theme.primary,
    '--tournament-accent': tournament.theme.accent,
  } as React.CSSProperties
}

/**
 * formatDateRange — human-readable tournament date range
 */
export function formatDateRange(tournament: Tournament): string {
  if (!tournament.dateRange.start && !tournament.dateRange.end) return 'TBD'
  const start = tournament.dateRange.start
    ? new Date(tournament.dateRange.start + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''
  const end = tournament.dateRange.end
    ? new Date(tournament.dateRange.end + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : ''
  if (start && end) return `${start} – ${end}`
  return start || end
}

/**
 * Tournament icons map — lookup by nav.icon string.
 * Simple string-to-component mapping so the registry drives the icon choice.
 */
export const TOURNAMENT_ICONS: Record<string, string> = {
  trophy: '🏆',
  'star-ball': '⭐',
  'orange-ball': '⚽',
  'continent-africa': '🌍',
  'trophy-women': '🏆',
  'continent-samerica': '🌎',
}

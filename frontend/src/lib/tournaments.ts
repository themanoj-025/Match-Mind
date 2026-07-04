/**
 * Tournament Configuration — Frontend copy
 * Mirrors backend/src/config/tournaments.ts for client-side use.
 */

export const TOURNAMENTS = [
  {
    id: 'fifa-wc-2026' as const,
    name: 'FIFA World Cup 2026',
    shortName: 'WC26',
    confederation: 'FIFA',
    hosts: ['USA', 'Canada', 'Mexico'],
    theme: { primary: '#0B3D91', accent: '#D4AF37' },
  },
  {
    id: 'uefa-ucl-2026-27' as const,
    name: 'UEFA Champions League 2026/27',
    shortName: 'UCL',
    confederation: 'UEFA',
    theme: { primary: '#0E1E4A', accent: '#8E44FF' },
  },
] as const

export type TournamentId = (typeof TOURNAMENTS)[number]['id']

export const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'] as const
export type Position = (typeof POSITIONS)[number]

export const DEFAULT_ROSTER_RULES = {
  GK: 2,
  DEF: 5,
  MID: 5,
  FWD: 3,
  total: 15,
} as const

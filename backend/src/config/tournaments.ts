/**
 * Tournament Configuration — AuctionXI
 *
 * Source of truth for the two supported tournaments.
 * Adding a third tournament is a config change, not a code change.
 * Zod-validated to prevent free-text tournament IDs.
 */

export const TOURNAMENTS = [
  {
    id: 'fifa-wc-2026',
    name: 'FIFA World Cup 2026',
    shortName: 'WC26',
    confederation: 'FIFA',
    hosts: ['USA', 'Canada', 'Mexico'],
    theme: { primary: '#0B3D91', accent: '#D4AF37' },
  },
  {
    id: 'uefa-ucl-2026-27',
    name: 'UEFA Champions League 2026/27',
    shortName: 'UCL',
    confederation: 'UEFA',
    theme: { primary: '#0E1E4A', accent: '#8E44FF' },
  },
] as const

export type TournamentId = (typeof TOURNAMENTS)[number]['id']

export function getTournament(id: string): (typeof TOURNAMENTS)[number] | undefined {
  return TOURNAMENTS.find((t) => t.id === id)
}

export function isValidTournamentId(id: string): id is TournamentId {
  return TOURNAMENTS.some((t) => t.id === id)
}

// Allowed player positions
export const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'] as const
export type Position = (typeof POSITIONS)[number]

// Default roster rules
export const DEFAULT_ROSTER_RULES = {
  GK: 2,
  DEF: 5,
  MID: 5,
  FWD: 3,
  total: 15,
} as const

// Bid increment rules (scales with price)
export const BID_INCREMENTS = [
  { threshold: 0, increment: 5 },
  { threshold: 50, increment: 10 },
  { threshold: 100, increment: 25 },
  { threshold: 200, increment: 50 },
] as const

// Auction constants
export const AUCTION_DEFAULT_TIMER_SECONDS = 15
export const AUCTION_ANTI_SNIPE_SECONDS = 5
export const AUCTION_ANTI_SNIPE_RESET_SECONDS = 10
export const MAX_FREE_ROOMS_PER_USER = 3

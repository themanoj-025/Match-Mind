/**
 * tournamentSwitcher.test.tsx — MatchMind v2 §8
 *
 * Tests:
 * - Renders correct set of pills/dropdown based on mocked registry response
 * - ANNOUNCED items render as disabled pills
 * - `+` pill appears for multiple ANNOUNCED tournaments
 * - Dropdown fallback when >4 LIVE tournaments
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TournamentSwitcher from '../components/TournamentSwitcher'

// ─── Mock useTournaments ─────────────────────────────────
const mockUseTournaments = vi.fn()

vi.mock('../lib/tournaments', () => ({
  useTournaments: () => mockUseTournaments(),
  TOURNAMENT_ICONS: {
    trophy: '🏆',
    'star-ball': '⭐',
    'orange-ball': '⚽',
    'continent-africa': '🌍',
    'trophy-women': '🏆',
    'continent-samerica': '🌎',
  },
}))

const liveTournaments = [
  {
    id: 'fifa-wc-2026',
    name: 'FIFA World Cup 2026',
    shortName: 'WC26',
    status: 'LIVE',
    confederation: 'FIFA',
    gender: 'MEN',
    format: 'GROUP_KNOCKOUT',
    teamCount: 48,
    squadSize: 26,
    launchPhase: 1,
    dateRange: { start: '2026-06-11', end: '2026-07-19' },
    theme: { primary: '#0B3D91', accent: '#D4AF37' },
    nav: { order: 1, icon: 'trophy' },
  },
  {
    id: 'uefa-ucl-2026-27',
    name: 'UEFA Champions League 2026/27',
    shortName: 'UCL',
    status: 'LIVE',
    confederation: 'UEFA',
    gender: 'MEN',
    format: 'LEAGUE_KNOCKOUT',
    teamCount: 36,
    squadSize: 25,
    launchPhase: 1,
    dateRange: { start: '2026-09-16', end: '2027-05-30' },
    theme: { primary: '#0E1E4A', accent: '#8E44FF' },
    nav: { order: 2, icon: 'star-ball' },
  },
  {
    id: 'uefa-uel-2026-27',
    name: 'UEFA Europa League 2026/27',
    shortName: 'UEL',
    status: 'LIVE',
    confederation: 'UEFA',
    gender: 'MEN',
    format: 'LEAGUE_KNOCKOUT',
    teamCount: 36,
    squadSize: 25,
    launchPhase: 2,
    dateRange: { start: '2026-09-24', end: '2027-05-20' },
    theme: { primary: '#FF6600', accent: '#1B1B1B' },
    nav: { order: 3, icon: 'orange-ball' },
  },
]

const announcedTournaments = [
  {
    id: 'caf-afcon-2027',
    name: 'CAF Africa Cup of Nations PAMOJA 2027',
    shortName: 'AFCON',
    status: 'ANNOUNCED',
    confederation: 'CAF',
    gender: 'MEN',
    format: 'GROUP_KNOCKOUT',
    teamCount: 24,
    squadSize: 27,
    launchPhase: 3,
    dateRange: { start: '2027-06-19', end: '2027-07-17' },
    theme: { primary: '#006B3F', accent: '#FFB800' },
    nav: { order: 4, icon: 'continent-africa' },
  },
]

function renderWithRouter(path = '/t/fifa-wc-2026/dashboard') {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/t/:tournamentId/dashboard" element={<TournamentSwitcher />} />
      </Routes>
    </BrowserRouter>,
  )
}

describe('TournamentSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state when data is loading', () => {
    mockUseTournaments.mockReturnValue({ data: undefined, isLoading: true })
    const { container } = renderWithRouter()
    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeTruthy()
  })

  it('renders pills for LIVE tournaments when count ≤ 4', () => {
    mockUseTournaments.mockReturnValue({
      data: [...liveTournaments, ...announcedTournaments],
      isLoading: false,
    })
    renderWithRouter()

    // All 3 LIVE tournament short names should be rendered
    expect(screen.getByText('WC26')).toBeTruthy()
    expect(screen.getByText('UCL')).toBeTruthy()
    expect(screen.getByText('UEL')).toBeTruthy()

    // The [+1] affordance should show for announced count
    expect(screen.getByText('+1')).toBeTruthy()
  })

  it('highlights the active tournament from the URL param', () => {
    mockUseTournaments.mockReturnValue({
      data: liveTournaments,
      isLoading: false,
    })
    renderWithRouter('/t/fifa-wc-2026/dashboard')

    // WC26 button should have the accent background style
    const wc26Btn = screen.getByText('WC26').closest('button')
    expect(wc26Btn).toBeTruthy()
    expect(wc26Btn?.style.backgroundColor).toBe('#D4AF37')
  })

  it('renders a dropdown when >4 LIVE tournaments exist', () => {
    const manyLive = [...liveTournaments]
    // Add 2 more LIVE tournaments to make it 5
    for (let i = 0; i < 2; i++) {
      manyLive.push({
        ...liveTournaments[0],
        id: `extra-live-${i}`,
        name: `Extra Live ${i}`,
        shortName: `EXT${i}`,
        nav: { order: 10 + i, icon: 'trophy' },
      })
    }
    mockUseTournaments.mockReturnValue({
      data: manyLive,
      isLoading: false,
    })
    renderWithRouter()

    // Dropdown should be rendered instead of buttons
    const select = document.querySelector('select')
    expect(select).toBeTruthy()
  })

  it('handles empty tournaments gracefully', () => {
    mockUseTournaments.mockReturnValue({
      data: [],
      isLoading: false,
    })
    renderWithRouter()

    // Should render the segmented control with no buttons
    const buttons = screen.queryAllByRole('button')
    expect(buttons.length).toBe(0)
  })
})

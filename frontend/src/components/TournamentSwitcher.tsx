/**
 * TournamentSwitcher — MatchMind v2 §3.2
 *
 * Responsive tournament selector driven entirely by the registry response.
 * - Mobile: horizontally scrollable pill row with scroll-shadow affordance
 * - Desktop: segmented control if ≤4 LIVE tournaments, dropdown if >4
 * - ANNOUNCED tournaments render disabled with a badge
 * - Selected tournament is persisted in the URL, not Zustand
 */

import { useNavigate, useParams } from 'react-router-dom'
import { useTournaments, TOURNAMENT_ICONS } from '../lib/tournaments'
import { ChevronDown } from 'lucide-react'

export default function TournamentSwitcher() {
  const { data: tournaments, isLoading } = useTournaments()
  const { tournamentId: activeId } = useParams<{ tournamentId: string }>()
  const navigate = useNavigate()

  if (isLoading || !tournaments) {
    return <div className="h-10 w-32 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] animate-pulse" />
  }

  const liveTournaments = tournaments.filter((t) => t.status === 'LIVE')
  const announcedTournaments = tournaments.filter((t) => t.status === 'ANNOUNCED')

  // Desktop: segmented control if ≤4, dropdown if >4
  if (liveTournaments.length <= 4) {
    return (
      <div className="flex items-center gap-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-0.5 overflow-hidden">
        {liveTournaments.map((t) => {
          const isActive = t.id === activeId
          return (
            <button
              key={t.id}
              onClick={() => navigate(`/t/${t.id}/dashboard`)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)]'
                  : 'text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)]'
              }`}
              style={isActive ? { backgroundColor: t.theme.accent } : {}}
            >
              <span className="text-xs">{TOURNAMENT_ICONS[t.nav.icon] || '⚽'}</span>
              <span className="hidden sm:inline">{t.shortName}</span>
            </button>
          )
        })}
        {/* [+] affordance for "more coming" */}
        {announcedTournaments.length > 0 && (
          <button
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)] transition-colors cursor-default"
            title={`Coming soon: ${announcedTournaments.map((t) => t.name).join(', ')}`}
          >
            <span>+{announcedTournaments.length}</span>
          </button>
        )}
      </div>
    )
  }

  // Desktop: dropdown fallback for >4 LIVE tournaments
  return (
    <div className="relative">
      <select
        value={activeId || ''}
        onChange={(e) => {
          if (e.target.value) navigate(`/t/${e.target.value}/dashboard`)
        }}
        className="appearance-none bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] rounded-[var(--radius-md)] px-3 py-1.5 pr-8 text-sm border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--border-focus)] cursor-pointer"
      >
        <option value="" disabled>
          Select tournament
        </option>
        {liveTournaments.map((t) => (
          <option key={t.id} value={t.id}>
            {TOURNAMENT_ICONS[t.nav.icon] || '⚽'} {t.shortName} — {t.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)] pointer-events-none"
      />
    </div>
  )
}

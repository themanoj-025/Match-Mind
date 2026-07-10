/**
 * FormatSelector — Formation picker for starting a Draft
 *
 * Shows available formations as selectable cards with position
 * distribution summary. Used in the start-draft dialog.
 */

import { Check, Users } from 'lucide-react'

interface FormationOption {
  id: string
  name: string
  slots: Array<{ position: string; count: number }>
  benchSlots: number
}

interface FormatSelectorProps {
  formations: FormationOption[]
  selected: string | null
  onSelect: (id: string) => void
}

const POSITION_ICONS: Record<string, string> = {
  GK: '🧤',
  DEF: '🛡️',
  MID: '🎯',
  FWD: '⚽',
}

export default function FormatSelector({ formations, selected, onSelect }: FormatSelectorProps) {
  if (!formations || formations.length === 0) {
    return <div className="text-center py-6 text-[var(--mm-text-muted)] text-sm">Loading formations...</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {formations.map((formation) => {
        const isSelected = selected === formation.id
        const totalPlayers = formation.slots.reduce((sum, s) => sum + s.count, 0)
        const totalWithBench = totalPlayers + formation.benchSlots

        return (
          <button
            key={formation.id}
            onClick={() => onSelect(formation.id)}
            className={`
              relative text-left p-4 rounded-[var(--radius-lg)] border-2 transition-all duration-200
              ${
                isSelected
                  ? 'border-[var(--mm-accent-green)] bg-[var(--mm-accent-green)]/5 shadow-[var(--shadow-glow-green)]'
                  : 'border-[var(--border-subtle)] bg-[var(--mm-bg-secondary)] hover:border-[var(--border-default)] hover:bg-[var(--mm-bg-hover)]'
              }
            `}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--mm-accent-green)] rounded-full flex items-center justify-center">
                <Check size={12} className="text-[var(--mm-text-inverse)]" />
              </div>
            )}

            <h4 className="font-bold text-[var(--mm-text-primary)] text-sm mb-1">{formation.name}</h4>

            <div className="flex items-center gap-1.5 text-xs text-[var(--mm-text-secondary)] mb-2 flex-wrap">
              {formation.slots.map((slot) => (
                <span key={slot.position} className="flex items-center gap-0.5">
                  {POSITION_ICONS[slot.position] || '📍'} {slot.count}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[var(--mm-text-muted)]">
              <Users size={12} />
              <span>
                {totalPlayers} starters + {formation.benchSlots} bench = {totalWithBench} picks
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

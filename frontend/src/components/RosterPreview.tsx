// @ts-nocheck
/**
 * RosterPreview — Draft Mode squad preview
 *
 * Shows the current drafted players grouped by position (GK/DEF/MID/FWD)
 * with empty slots indicated as dashed placeholders.
 * Bench slots are shown separately below.
 */

import { Check, Clock, Gauge } from 'lucide-react'
import RarityBadge from './RarityBadge'

interface SquadEntry {
  slotIndex: number
  position: string
  playerId: string | null
  playerName?: string
  rarityTier?: string
  isAutoPicked?: boolean
}

interface RosterPreviewProps {
  formationName: string
  slots: Array<{ position: string; count: number }>
  benchSlots: number
  picks: Array<{
    slotIndex: number
    position: string
    pickedPlayerId: string | null
    autoPicked?: boolean
    player?: {
      name: string
      rarityTier?: string
      position: string
    } | null
  }>
  synergyScore?: number
  formationBonus?: boolean
}

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const
const POSITION_ICONS: Record<string, string> = {
  GK: '🧤',
  DEF: '🛡️',
  MID: '🎯',
  FWD: '⚽',
}

export default function RosterPreview({
  formationName,
  slots,
  benchSlots,
  picks,
  synergyScore = 0,
  formationBonus = false,
}: RosterPreviewProps) {
  // Build filled picks by slot index
  const filledMap = new Map<number, typeof picks[0]>()
  for (const p of picks) {
    filledMap.set(p.slotIndex, p)
  }

  // Calculate total formation slots (not bench)
  const totalFormationSlots = slots.reduce((sum, s) => sum + s.count, 0)
  const totalSlots = totalFormationSlots + benchSlots
  const filledCount = picks.filter((p) => p.pickedPlayerId != null).length

  // Build display slots: formation first, then bench
  const displaySlots: Array<{ slotIndex: number; position: string; isBench: boolean }> = []
  let slotIdx = 0
  for (const slot of slots) {
    for (let i = 0; i < slot.count; i++) {
      displaySlots.push({ slotIndex: slotIdx, position: slot.position, isBench: false })
      slotIdx++
    }
  }
  // Bench slots
  for (let i = 0; i < benchSlots; i++) {
    displaySlots.push({ slotIndex: slotIdx, position: 'BENCH', isBench: true })
    slotIdx++
  }

  return (
    <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-[var(--mm-text-primary)] text-sm">Your Squad</h3>
          <p className="text-xs text-[var(--mm-text-muted)]">
            {formationName} · {filledCount}/{totalSlots} filled
          </p>
        </div>
        {/* Synergy gauge */}
        {synergyScore > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-[var(--mm-accent-green)]/10 rounded-[var(--radius-sm)]">
            <Gauge size={14} className="text-[var(--mm-accent-green)]" />
            <span className="text-xs font-semibold text-[var(--mm-accent-green)]">+{synergyScore}%</span>
          </div>
        )}
      </div>

      {/* Formation slots */}
      <div className="space-y-2">
        {POSITION_ORDER.map((position) => {
          const posSlots = displaySlots.filter((s) => s.position === position && !s.isBench)
          if (posSlots.length === 0) return null

          const posFilled = posSlots.filter((s) => {
            const pick = filledMap.get(s.slotIndex)
            return pick?.pickedPlayerId != null
          }).length

          return (
            <div key={position}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs">{POSITION_ICONS[position]}</span>
                <span className="text-xs font-semibold text-[var(--mm-text-secondary)]">{position}</span>
                <span className="text-xs text-[var(--mm-text-muted)]">({posFilled}/{posSlots.length})</span>
              </div>
              <div className="space-y-1">
                {posSlots.map((s) => {
                  const pick = filledMap.get(s.slotIndex)
                  const isFilled = pick?.pickedPlayerId != null
                  const playerName = pick?.player?.name || pick?.pickedPlayerId || null

                  return (
                    <div
                      key={s.slotIndex}
                      className={`
                        flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-md)] text-xs
                        ${isFilled
                          ? 'bg-[var(--mm-bg-tertiary)] border border-[var(--border-subtle)]'
                          : 'border border-dashed border-[var(--border-subtle)] bg-transparent'
                        }
                      `}
                    >
                      {isFilled ? (
                        <>
                          <Check size={12} className="text-[var(--mm-accent-green)] shrink-0" />
                          <span className="truncate text-[var(--mm-text-primary)] font-medium flex-1">
                            {playerName}
                          </span>
                          {pick?.player?.rarityTier && (
                            <RarityBadge tier={pick.player.rarityTier} size="sm" />
                          )}
                          {pick?.autoPicked && (
                            <Clock size={10} className="text-[var(--mm-text-muted)] shrink-0" />
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 rounded-full border border-dashed border-[var(--border-subtle)]" />
                          <span className="text-[var(--mm-text-muted)] italic">Empty slot</span>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Bench section */}
        {benchSlots > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs">🪑</span>
              <span className="text-xs font-semibold text-[var(--mm-text-secondary)]">Bench</span>
              <span className="text-xs text-[var(--mm-text-muted)]">
                ({displaySlots.filter((s) => s.isBench && filledMap.get(s.slotIndex)?.pickedPlayerId != null).length}/{benchSlots})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {displaySlots.filter((s) => s.isBench).map((s) => {
                const pick = filledMap.get(s.slotIndex)
                const isFilled = pick?.pickedPlayerId != null

                return (
                  <div
                    key={s.slotIndex}
                    className={`
                      flex items-center gap-1.5 px-2 py-1.5 rounded-[var(--radius-md)] text-xs
                      ${isFilled
                        ? 'bg-[var(--mm-bg-tertiary)] border border-[var(--border-subtle)]'
                        : 'border border-dashed border-[var(--border-subtle)]'
                      }
                    `}
                  >
                    {isFilled ? (
                      <>
                        <Check size={10} className="text-[var(--mm-accent-green)] shrink-0" />
                        <span className="truncate text-[var(--mm-text-primary)] flex-1">
                          {pick?.player?.name || 'Player'}
                        </span>
                      </>
                    ) : (
                      <span className="text-[var(--mm-text-muted)] italic">Open</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Formation bonus indicator */}
      {formationBonus && (
        <div className="px-3 py-2 bg-[var(--mm-accent-amber)]/10 rounded-[var(--radius-md)] border border-[var(--mm-accent-amber)]/20">
          <span className="text-xs font-semibold text-[var(--mm-accent-amber)]">
            ✓ Formation Fill Bonus: +5%
          </span>
        </div>
      )}

      {/* Auto-pick indicator */}
      {picks.some((p) => p.autoPicked) && (
        <div className="px-3 py-2 bg-[var(--mm-accent-blue)]/10 rounded-[var(--radius-md)] border border-[var(--mm-accent-blue)]/20">
          <span className="text-xs font-medium text-[var(--mm-accent-blue)] flex items-center gap-1">
            <Clock size={12} />
            Some picks were auto-drafted (timer expired)
          </span>
        </div>
      )}
    </div>
  )
}


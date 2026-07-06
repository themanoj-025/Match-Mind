/**
 * BudgetTracker — MatchMind
 *
 * Displays remaining budget, minimum reserve for remaining slots,
 * and position-by-position roster breakdown.
 *
 * High-contrast: uses icons + text labels alongside colors to indicate state.
 */
import type { RosterEntry, Player } from '../lib/types'

interface BudgetTrackerProps {
  remainingBudget: number
  rosterRules: { GK: number; DEF: number; MID: number; FWD: number; total: number }
  roster: RosterEntry[]
  players: Record<string, Player>
  totalBudget: number
}

const POSITION_LABELS = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
} as const

const MIN_PLAYER_PRICE = 5

export default function BudgetTracker({
  remainingBudget,
  rosterRules,
  roster,
  players,
  totalBudget,
}: BudgetTrackerProps) {
  // Count filled positions
  const positionCounts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  for (const entry of roster) {
    const pos = players[entry.playerId]?.position
    if (pos && pos in positionCounts) positionCounts[pos]++
  }

  // Calculate remaining slots and minimum reserve
  let totalRemainingSlots = 0
  const positionDetails = (['GK', 'DEF', 'MID', 'FWD'] as const).map((pos) => {
    const filled = positionCounts[pos] || 0
    const limit = rosterRules[pos]
    const remaining = Math.max(0, limit - filled)
    totalRemainingSlots += remaining
    return { position: pos, label: POSITION_LABELS[pos], filled, limit, remaining }
  })

  const minimumReserve = totalRemainingSlots * MIN_PLAYER_PRICE
  const effectiveBudget = remainingBudget - minimumReserve
  const budgetPercent = (remainingBudget / totalBudget) * 100
  const isLowBudget = remainingBudget < minimumReserve
  const isCritical = remainingBudget < minimumReserve * 0.5

  return (
    <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
      <h3 className="heading-3 mb-3 flex items-center gap-2">
        🪙 Budget
      </h3>

      {/* Main budget display */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-1">
          <span className="display-l text-[var(--mm-accent-amber)]">
            🪙 ${remainingBudget.toLocaleString()}
          </span>
          <span className="caption text-[var(--mm-text-muted)]">
            of ${totalBudget.toLocaleString()}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCritical
                ? 'bg-[var(--mm-accent-red)]'
                : isLowBudget
                  ? 'bg-[var(--mm-accent-amber)]'
                  : 'bg-[var(--gradient-live)]'
            }`}
            style={{ width: `${Math.min(100, budgetPercent)}%` }}
            role="progressbar"
            aria-valuenow={remainingBudget}
            aria-valuemin={0}
            aria-valuemax={totalBudget}
            aria-label={`${budgetPercent.toFixed(0)}% of budget remaining`}
          />
        </div>
      </div>

      {/* Reserve warning */}
      {isLowBudget && (
        <div
          className={`flex items-center gap-2 p-2 rounded-[var(--radius-sm)] mb-3 caption ${
            isCritical
              ? 'bg-[var(--mm-accent-red)]/10 text-[var(--mm-accent-red)]'
              : 'bg-[var(--mm-accent-amber)]/10 text-[var(--mm-accent-amber)]'
          }`}
          role="alert"
        >
          <span className="text-lg">{isCritical ? '🚨' : '⚠️'}</span>
          <span>
            Need ${minimumReserve} reserve for {totalRemainingSlots} remaining slots
            {effectiveBudget < 0 ? ` — overspent by $${Math.abs(effectiveBudget)}` : ''}
          </span>
        </div>
      )}

      {/* Position breakdown */}
      <div className="space-y-2">
        {positionDetails.map(({ position, label, filled, limit, remaining }) => (
          <div key={position} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] caption font-semibold">
                {position}
              </span>
              <span className="caption text-[var(--mm-text-muted)]">{label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: limit }, (_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    i < filled
                      ? 'bg-[var(--mm-accent-green)]'
                      : 'bg-[var(--mm-bg-tertiary)]'
                  }`}
                  aria-label={i < filled ? 'Filled' : 'Empty'}
                />
              ))}
              <span className="caption text-[var(--mm-text-muted)] ml-1">
                {filled}/{limit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

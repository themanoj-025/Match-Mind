// @ts-nocheck
/**
 * RosterBoard — MatchMind
 *
 * Position-grouped grid (GK/DEF/MID/FWD) that displays the user's drafted roster
 * with captain (C) and vice-captain (VC) badges.
 *
 * Supports interactive mode for setting captain/VC when isOwn is true.
 */
import { Crown, Star } from 'lucide-react'
import type { RosterEntry, Player } from '../lib/types'

interface RosterBoardProps {
  roster: RosterEntry[]
  players: Record<string, Player>
  isOwn?: boolean
  onSetCaptain?: (playerId: string) => void
  onSetViceCaptain?: (playerId: string) => void
  rosterRules?: { GK: number; DEF: number; MID: number; FWD: number; total: number }
}

const POSITION_ORDER = ['GK', 'DEF', 'MID', 'FWD'] as const
const POSITION_ICONS: Record<string, string> = {
  GK: '🧤',
  DEF: '🛡️',
  MID: '🎯',
  FWD: '⚽',
}

export default function RosterBoard({
  roster,
  players,
  isOwn = false,
  onSetCaptain,
  onSetViceCaptain,
  rosterRules,
}: RosterBoardProps) {
  const grouped: Record<string, RosterEntry[]> = { GK: [], DEF: [], MID: [], FWD: [] }
  for (const entry of roster) {
    const pos = players[entry.playerId]?.position || 'MID'
    if (!grouped[pos]) grouped[pos] = []
    grouped[pos].push(entry)
  }

  return (
    <div className="space-y-4">
      {roster.length === 0 ? (
        <div className="text-center py-8 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
          <Crown size={40} className="mx-auto mb-3 text-[var(--mm-text-muted)] opacity-30" />
          <h3 className="heading-3 mb-1">Empty Roster</h3>
          <p className="caption text-[var(--mm-text-secondary)]">No players drafted yet.</p>
        </div>
      ) : (
        POSITION_ORDER.map((position) => {
          const entries = grouped[position] || []
          const limit = rosterRules?.[position] ?? 5
          if (entries.length === 0 && !rosterRules) return null

          return (
            <div key={position}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{POSITION_ICONS[position]}</span>
                <h4 className="body font-semibold text-[var(--mm-accent-green)]">
                  {position}
                </h4>
                {rosterRules && (
                  <span className="caption text-[var(--mm-text-muted)]">
                    ({entries.length}/{limit})
                  </span>
                )}
              </div>

              {/* Position dots */}
              {entries.length === 0 ? (
                <div className="flex gap-1.5 mb-3">
                  {Array.from({ length: limit }, (_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full bg-[var(--mm-bg-tertiary)] border border-[var(--border-subtle)]"
                      aria-label={`Empty ${position} slot`}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                  {entries.map((entry) => {
                    const player = players[entry.playerId]
                    return (
                      <div
                        key={entry.id}
                        className={`
                          bg-[var(--mm-bg-secondary)] rounded-[var(--radius-md)] p-3
                          border transition-all duration-200
                          ${entry.isCaptain
                            ? 'border-[var(--mm-accent-amber)] ring-1 ring-[var(--mm-accent-amber)]'
                            : entry.isViceCaptain
                              ? 'border-[var(--mm-accent-purple)] ring-1 ring-[var(--mm-accent-purple)]'
                              : 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="caption font-semibold truncate">
                              {player?.name || entry.playerId.slice(0, 8)}
                            </span>
                            {entry.isCaptain && (
                              <Crown size={14} className="text-[var(--mm-accent-amber)] shrink-0" />
                            )}
                            {entry.isViceCaptain && (
                              <Star size={14} className="text-[var(--mm-accent-purple)] shrink-0" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="caption text-[var(--mm-text-muted)]">
                            🪙 ${entry.soldPrice}
                          </span>
                          {isOwn && !entry.isCaptain && !entry.isViceCaptain && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => onSetCaptain?.(entry.playerId)}
                                className="px-1.5 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] caption text-[var(--mm-text-muted)] hover:text-[var(--mm-accent-amber)] transition-colors"
                                aria-label={`Set ${player?.name || entry.playerId} as captain`}
                                title="Set as Captain (×2 points)"
                              >
                                C
                              </button>
                              <button
                                onClick={() => onSetViceCaptain?.(entry.playerId)}
                                className="px-1.5 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] caption text-[var(--mm-text-muted)] hover:text-[var(--mm-accent-purple)] transition-colors"
                                aria-label={`Set ${player?.name || entry.playerId} as vice-captain`}
                                title="Set as Vice-Captain (×1.5 points, fallback if captain sits out)"
                              >
                                VC
                              </button>
                            </div>
                          )}
                          {(entry.isCaptain || entry.isViceCaptain) && isOwn && (
                            <span className="caption text-[var(--mm-text-muted)] italic">
                              {entry.isCaptain ? 'Captain' : 'Vice-Captain'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}


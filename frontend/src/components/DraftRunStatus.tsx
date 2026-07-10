/**
 * DraftRunStatus — Draft Run progress & rewards display
 *
 * Shows matchday round results, win/loss record, elimination status,
 * full-clear rewards, and the next matchday wait state.
 */

import { motion } from 'framer-motion'
import { Trophy, Skull, Target, ChevronRight, Clock, CheckCircle, XCircle, Minus } from 'lucide-react'
import type { DraftRunState, DraftRunRoundEntry } from '../lib/types'

interface DraftRunStatusProps {
  state: DraftRunState
  onResolveMatchday?: () => void
  resolving?: boolean
}

const OUTCOME_ICONS: Record<string, React.ReactNode> = {
  WIN: <CheckCircle size={16} className="text-[var(--mm-accent-green)]" />,
  LOSS: <XCircle size={16} className="text-[var(--mm-accent-red)]" />,
  TIE: <Minus size={16} className="text-[var(--mm-text-muted)]" />,
}

const OUTCOME_BG: Record<string, string> = {
  WIN: 'bg-[var(--mm-accent-green)]/10 border-[var(--mm-accent-green)]/20',
  LOSS: 'bg-[var(--mm-accent-red)]/10 border-[var(--mm-accent-red)]/20',
  TIE: 'bg-[var(--mm-bg-tertiary)] border-[var(--border-subtle)]',
}

const REWARD_COLORS: Record<string, string> = {
  participant: '#6B7280',
  'bronze-run': '#CD7F32',
  'silver-run': '#C0C0C0',
  'gold-run': '#FFD700',
  'elite-run': '#8B5CF6',
  'icon-run': 'linear-gradient(135deg,#FFD700,#FFFFFF)',
}

const REWARD_LABELS: Record<string, string> = {
  participant: 'Participant',
  'bronze-run': 'Bronze Contender',
  'silver-run': 'Silver Challenger',
  'gold-run': 'Gold Warrior',
  'elite-run': 'Elite Tactician',
  'icon-run': 'Draft Icon 🏆',
}

export default function DraftRunStatus({ state, onResolveMatchday, resolving }: DraftRunStatusProps) {
  const { result, rounds, isEliminated, isFullClear, nextMatchdayLabel } = state

  return (
    <div className="space-y-6">
      {/* Run header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading-2">Draft Run</h2>
          <p className="body text-[var(--mm-text-secondary)]">
            {isEliminated ? 'Eliminated' : isFullClear ? 'Full Clear!' : `${result.currentRound} rounds played`}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-[var(--mm-accent-green)] font-bold text-lg">{result.totalWins}W</span>
            <span className="text-[var(--mm-accent-red)] font-bold text-lg">{result.totalLosses}L</span>
            <span className="text-[var(--mm-text-muted)] font-bold text-lg">{result.totalTies}T</span>
          </div>
        </div>
      </div>

      {/* Win/Loss progress */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-[var(--mm-accent-amber)]" />
            <span className="text-sm font-semibold text-[var(--mm-text-primary)]">Wins to Clear</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((w) => (
              <div
                key={w}
                className={`flex-1 h-2 rounded-full transition-all ${
                  result.totalWins >= w ? 'bg-[var(--mm-accent-amber)]' : 'bg-[var(--mm-bg-tertiary)]'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--mm-text-muted)] mt-1">{Math.max(0, 5 - result.totalWins)} wins needed</p>
        </div>

        <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-2">
            <Skull size={16} className="text-[var(--mm-accent-red)]" />
            <span className="text-sm font-semibold text-[var(--mm-text-primary)]">Elimination</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3].map((l) => (
              <div
                key={l}
                className={`flex-1 h-2 rounded-full transition-all ${
                  result.totalLosses >= l ? 'bg-[var(--mm-accent-red)]' : 'bg-[var(--mm-bg-tertiary)]'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--mm-text-muted)] mt-1">
            {isEliminated ? 'Eliminated ❌' : `${Math.max(0, 3 - result.totalLosses)} losses until elimination`}
          </p>
        </div>
      </div>

      {/* Round history */}
      {rounds.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-[var(--mm-text-primary)]">Matchday Results</h3>
          <div className="space-y-2">
            {rounds.map((round, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`
                  flex items-center justify-between p-3 rounded-[var(--radius-md)] border
                  ${OUTCOME_BG[round.outcome || 'TIE'] || 'bg-[var(--mm-bg-secondary)]'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center text-xs font-bold text-[var(--mm-text-secondary)]">
                    {round.roundNumber}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--mm-text-primary)]">
                      {round.matchdayName || `Matchday ${round.roundNumber}`}
                    </p>
                    <p className="text-xs text-[var(--mm-text-muted)]">
                      Your squad: {round.userPoints} pts · Benchmark: {round.benchmarkPoints} pts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {OUTCOME_ICONS[round.outcome || 'TIE']}
                  <span
                    className={`text-xs font-bold ${
                      round.outcome === 'WIN'
                        ? 'text-[var(--mm-accent-green)]'
                        : round.outcome === 'LOSS'
                          ? 'text-[var(--mm-accent-red)]'
                          : 'text-[var(--mm-text-muted)]'
                    }`}
                  >
                    {round.outcome}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Rewards */}
      {result.rewards.length > 0 && (
        <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]">
          <h3 className="font-semibold text-sm text-[var(--mm-text-primary)] mb-2 flex items-center gap-1.5">
            <Target size={14} className="text-[var(--mm-accent-amber)]" />
            Rewards Earned
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.rewards.map((rewardId) => (
              <div
                key={rewardId}
                className="px-2.5 py-1 rounded-[var(--radius-full)] text-xs font-semibold text-[var(--mm-text-inverse)]"
                style={{
                  background: REWARD_COLORS[rewardId] || '#6B7280',
                }}
              >
                {REWARD_LABELS[rewardId] || rewardId}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status messages */}
      {isEliminated && (
        <div className="px-4 py-3 bg-[var(--mm-accent-red)]/10 rounded-[var(--radius-lg)] border border-[var(--mm-accent-red)]/20 text-center">
          <Skull size={24} className="mx-auto mb-1 text-[var(--mm-accent-red)]" />
          <p className="font-semibold text-[var(--mm-accent-red)]">Eliminated</p>
          <p className="text-xs text-[var(--mm-text-secondary)] mt-0.5">3 losses reached. Run is complete.</p>
        </div>
      )}

      {isFullClear && (
        <div className="px-4 py-3 bg-[var(--mm-accent-amber)]/10 rounded-[var(--radius-lg)] border border-[var(--mm-accent-amber)]/20 text-center">
          <Trophy size={24} className="mx-auto mb-1 text-[var(--mm-accent-amber)]" />
          <p className="font-semibold text-[var(--mm-accent-amber)]">Full Clear! 🏆</p>
          <p className="text-xs text-[var(--mm-text-secondary)] mt-0.5">5 wins achieved. Draft Icon reward earned!</p>
        </div>
      )}

      {nextMatchdayLabel && !isEliminated && !isFullClear && (
        <div className="text-center py-4">
          <Clock size={24} className="mx-auto mb-2 text-[var(--mm-text-muted)]" />
          <p className="text-sm text-[var(--mm-text-secondary)]">{nextMatchdayLabel}</p>
          <p className="text-xs text-[var(--mm-text-muted)] mt-1">
            Results will resolve once real matchday fixtures are completed.
          </p>
          {onResolveMatchday && (
            <button
              onClick={onResolveMatchday}
              disabled={resolving}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] rounded-[var(--radius-md)] text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {resolving ? 'Resolving...' : 'Check for Results'}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

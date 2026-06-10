import React from 'react'
import { Check, X, Minus, Clock } from 'lucide-react'
import SportBadge from './SportBadge'

export default function PredictionCard({ match, prediction, result }) {
  const { homeTeam, awayTeam, homeTeamLogo, awayTeamLogo, competition, sport, scheduledAt } = match
  const { homeGoals, awayGoals, firstScorer, totalGoalsOU, btts } = prediction || {}
  const { actual, points, status } = result || {}

  const isCorrect = status === 'CORRECT' || status === 'SCORED'
  const isPartial = status === 'PARTIAL'
  const isMissed = status === 'MISSED'
  const isPending = status === 'PENDING' || status === 'LOCKED'

  const getStatusIcon = () => {
    if (isCorrect) return <Check size={16} className="text-[var(--mm-accent-green)]" />
    if (isPartial) return <Minus size={16} className="text-[var(--mm-accent-amber)]" />
    if (isMissed) return <X size={16} className="text-[var(--mm-accent-red)]" />
    return <Clock size={16} className="text-[var(--mm-text-muted)]" />
  }

  const getStatusColor = () => {
    if (isCorrect) return 'border-[var(--mm-accent-green)]/30 bg-[var(--mm-accent-green)]/5'
    if (isPartial) return 'border-[var(--mm-accent-amber)]/30 bg-[var(--mm-accent-amber)]/5'
    if (isMissed) return 'border-[var(--mm-accent-red)]/30 bg-[var(--mm-accent-red)]/5'
    return 'border-[var(--border-subtle)]'
  }

  return (
    <div className={`bg-[var(--mm-bg-secondary)] border ${getStatusColor()} rounded-[var(--radius-lg)] overflow-hidden transition-all duration-300`}>
      {/* Match Info */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <SportBadge sport={sport} size="sm" />
          <span className="caption text-[var(--mm-text-muted)]">{competition}</span>
        </div>
        <span className="caption text-[var(--mm-text-muted)]">
          {new Date(scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Teams */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center">
              {homeTeamLogo ? <img src={homeTeamLogo} alt="" className="w-6 h-6 object-contain" /> : <span className="text-xs font-bold">{homeTeam.charAt(0)}</span>}
            </div>
            <span className="body font-medium">{homeTeam}</span>
          </div>
          <span className="font-bold text-xl font-[var(--font-display)]">{homeGoals} - {awayGoals}</span>
          <div className="flex items-center gap-2">
            <span className="body font-medium">{awayTeam}</span>
            <div className="w-8 h-8 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center">
              {awayTeamLogo ? <img src={awayTeamLogo} alt="" className="w-6 h-6 object-contain" /> : <span className="text-xs font-bold">{awayTeam.charAt(0)}</span>}
            </div>
          </div>
        </div>

        {/* Additional Markets */}
        {(firstScorer || totalGoalsOU || btts !== undefined) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {firstScorer && (
              <span className="caption px-2 py-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--mm-text-muted)]">
                1st scorer: {firstScorer}
              </span>
            )}
            {totalGoalsOU && (
              <span className="caption px-2 py-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--mm-text-muted)]">
                O/U: {totalGoalsOU}
              </span>
            )}
            {btts !== undefined && (
              <span className="caption px-2 py-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] text-[var(--mm-text-muted)]">
                BTTS: {btts ? 'Yes' : 'No'}
              </span>
            )}
          </div>
        )}

        {/* Result Status */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`caption font-medium ${
              isCorrect ? 'text-[var(--mm-accent-green)]' :
              isPartial ? 'text-[var(--mm-accent-amber)]' :
              isMissed ? 'text-[var(--mm-accent-red)]' :
              'text-[var(--mm-text-muted)]'
            }`}>
              {isPending ? 'Awaiting Result' : isCorrect ? 'Correct!' : isPartial ? 'Partial' : 'Missed'}
            </span>
          </div>
          {points !== undefined && points !== null && (
            <div className={`flex items-center gap-1 ${
              points > 0 ? 'text-[var(--mm-accent-green)]' : 'text-[var(--mm-accent-red)]'
            }`}>
              <span className="font-bold font-[var(--font-display)] text-lg">{points > 0 ? '+' : ''}{points}</span>
              <span className="caption">pts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

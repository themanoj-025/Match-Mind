import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Info, ChevronDown, ChevronUp, Sparkles, Loader } from 'lucide-react'
import { useMatch, useCreatePrediction } from '../hooks/useApi'

export default function MakePredictionPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const [homeGoals, setHomeGoals] = useState(0)
  const [awayGoals, setAwayGoals] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [firstScorer, setFirstScorer] = useState('')
  const [totalGoalsOU, setTotalGoalsOU] = useState('')
  const [btts, setBtts] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: matchData, isLoading } = useMatch(matchId)
  const createPrediction = useCreatePrediction()

  const match = matchData || {
    homeTeam: 'Manchester City',
    awayTeam: 'Arsenal',
    competition: 'Premier League',
    scheduledAt: new Date(Date.now() + 3600000).toISOString(),
    sport: 'football',
  }

  const adjustGoals = (team, delta) => {
    if (team === 'home') {
      setHomeGoals((g) => Math.max(0, Math.min(15, g + delta)))
    } else {
      setAwayGoals((g) => Math.max(0, Math.min(15, g + delta)))
    }
  }

  const calculatePoints = () => {
    let points = 0
    if (homeGoals !== null && awayGoals !== null) points += 50
    if (firstScorer) points += 20
    if (totalGoalsOU) points += 10
    if (btts !== null) points += 10
    return points
  }

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6 transition-colors">
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Match Overview */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="caption text-[var(--mm-text-muted)]">{match.competition}</span>
            <span className="caption text-[var(--mm-text-muted)]">
              {new Date(match.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center">
                <span className="font-bold text-lg">{match.homeTeam.charAt(0)}</span>
              </div>
              <span className="heading-3">{match.homeTeam}</span>
            </div>
            <span className="body text-[var(--mm-text-muted)]">vs</span>
            <div className="flex items-center gap-3">
              <span className="heading-3">{match.awayTeam}</span>
              <div className="w-12 h-12 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center">
                <span className="font-bold text-lg">{match.awayTeam.charAt(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Score Prediction */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 mb-6">
          <h2 className="heading-3 mb-6 text-center">Predict the Final Score</h2>

          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-3">
              <span className="body font-medium text-center">{match.homeTeam}</span>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => adjustGoals('home', 1)}
                  className="w-12 h-12 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] flex items-center justify-center text-2xl font-bold text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)] transition-colors"
                >
                  +
                </button>
                <span className="text-5xl sm:text-6xl font-bold font-[var(--font-display)] w-16 text-center text-[var(--mm-accent-green)]">
                  {homeGoals}
                </span>
                <button
                  onClick={() => adjustGoals('home', -1)}
                  className="w-12 h-12 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] flex items-center justify-center text-2xl font-bold text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)] transition-colors"
                >
                  -
                </button>
              </div>
            </div>

            <span className="text-3xl text-[var(--mm-text-muted)] font-light">:</span>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-3">
              <span className="body font-medium text-center">{match.awayTeam}</span>
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => adjustGoals('away', 1)}
                  className="w-12 h-12 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] flex items-center justify-center text-2xl font-bold text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)] transition-colors"
                >
                  +
                </button>
                <span className="text-5xl sm:text-6xl font-bold font-[var(--font-display)] w-16 text-center text-[var(--mm-accent-amber)]">
                  {awayGoals}
                </span>
                <button
                  onClick={() => adjustGoals('away', -1)}
                  className="w-12 h-12 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] flex items-center justify-center text-2xl font-bold text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)] transition-colors"
                >
                  -
                </button>
              </div>
            </div>
          </div>

          {/* AI Hint */}
          <div className="mt-6 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-4">
            <div className="flex items-start gap-2">
              <Sparkles size={18} className="text-[var(--mm-accent-green)] mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="caption font-semibold text-[var(--mm-accent-green)]">MatchMind AI Suggestion</span>
                  <span className="caption px-1.5 py-0.5 bg-[var(--mm-bg-hover)] rounded-[var(--radius-sm)] text-[var(--mm-text-muted)]">toggleable</span>
                </div>
                <p className="body text-[var(--mm-text-secondary)]">2-1 to {match.homeTeam} based on recent form (68% confidence). {match.homeTeam} have won 4 of their last 5 at home.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Markets */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] px-6 py-4 mb-4 hover:bg-[var(--mm-bg-hover)] transition-colors"
        >
          <span className="body font-semibold">Additional Markets</span>
          {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {showAdvanced && (
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 mb-6 animate-fade-in-up">
            <div className="flex flex-col gap-5">
              {/* First Goalscorer */}
              <div>
                <label className="caption font-medium text-[var(--mm-text-secondary)] mb-2 block">First Goalscorer</label>
                <input
                  type="text"
                  value={firstScorer}
                  onChange={(e) => setFirstScorer(e.target.value)}
                  placeholder="Search player..."
                  className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none"
                />
              </div>

              {/* Total Goals O/U */}
              <div>
                <label className="caption font-medium text-[var(--mm-text-secondary)] mb-2 block">Total Goals</label>
                <div className="flex gap-2">
                  {['Over 2.5', 'Under 2.5', 'Over 3.5', 'Under 3.5'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setTotalGoalsOU(option)}
                      className={`px-4 py-2.5 rounded-[var(--radius-md)] body transition-all duration-200 ${
                        totalGoalsOU === option
                          ? 'bg-[var(--mm-accent-amber)] text-[var(--mm-text-inverse)] font-semibold'
                          : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* BTTS */}
              <div>
                <label className="caption font-medium text-[var(--mm-text-secondary)] mb-2 block">Both Teams to Score</label>
                <div className="flex gap-2">
                  {['Yes', 'No'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setBtts(option === 'Yes' ? true : option === 'No' ? false : null)}
                      className={`px-6 py-2.5 rounded-[var(--radius-md)] body transition-all duration-200 ${
                        (option === 'Yes' && btts === true) || (option === 'No' && btts === false)
                          ? 'bg-[var(--mm-accent-amber)] text-[var(--mm-text-inverse)] font-semibold'
                          : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Points Preview */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 mb-6">
          <h3 className="heading-3 mb-4">Points Preview</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between py-1.5">
              <span className="body text-[var(--mm-text-secondary)]">Correct exact score</span>
              <span className="body font-semibold text-[var(--mm-accent-green)]">+50 pts</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="body text-[var(--mm-text-secondary)]">Correct result (W/D/W)</span>
              <span className="body font-semibold text-[var(--mm-accent-green)]">+15 pts</span>
            </div>
            {firstScorer && (
              <div className="flex justify-between py-1.5">
                <span className="body text-[var(--mm-text-secondary)]">First goalscorer</span>
                <span className="body font-semibold text-[var(--mm-accent-green)]">+20 pts</span>
              </div>
            )}
            {totalGoalsOU && (
              <div className="flex justify-between py-1.5">
                <span className="body text-[var(--mm-text-secondary)]">Total goals {totalGoalsOU}</span>
                <span className="body font-semibold text-[var(--mm-accent-green)]">+10 pts</span>
              </div>
            )}
            {btts !== null && (
              <div className="flex justify-between py-1.5">
                <span className="body text-[var(--mm-text-secondary)]">BTTS: {btts ? 'Yes' : 'No'}</span>
                <span className="body font-semibold text-[var(--mm-accent-green)]">+10 pts</span>
              </div>
            )}
            <div className="border-t border-[var(--border-subtle)] my-2" />
            <div className="flex justify-between">
              <span className="body font-semibold">Maximum Payout</span>
              <span className="heading-3 text-[var(--mm-accent-amber)]">🪙 {calculatePoints()} pts</span>
            </div>
          </div>
        </div>

        {/* Lock In */}
        <button
          onClick={async () => {
            if (isSubmitting) return
            setIsSubmitting(true)
            try {
              await createPrediction.mutateAsync({
                matchId,
                homeGoals,
                awayGoals,
                firstScorer: firstScorer || undefined,
                totalGoalsOU: totalGoalsOU || undefined,
                btts: btts !== null ? btts : undefined,
              })
              navigate(`/live/${matchId}`)
            } catch (err) {
              alert('Failed to submit prediction: ' + err.message)
            } finally {
              setIsSubmitting(false)
            }
          }}
          disabled={isSubmitting}
          className="w-full bg-[var(--gradient-predict)] text-[var(--mm-text-inverse)] body font-bold py-4 rounded-[var(--radius-lg)] hover:shadow-[var(--shadow-glow-amber)] transition-all duration-300 text-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2"><Loader size={18} className="animate-spin" /> Submitting...</span>
          ) : (
            'Lock In Prediction'
          )}
        </button>
      </div>
    </div>
  )
}

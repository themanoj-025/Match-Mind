import { useState, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Gavel } from 'lucide-react'
import { useTournaments, DEFAULT_ROSTER_RULES } from '../lib/tournaments'

const STEPS = ['Tournament', 'Budget & Rules', 'Review']

export default function RoomWizardPage() {
  const navigate = useNavigate()
  const { data: tournaments } = useTournaments()
  const liveTournaments = useMemo(
    () => (tournaments || []).filter((t) => t.status === 'LIVE'),
    [tournaments]
  )
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [tournamentId, setTournamentId] = useState<string>('')

  // Auto-select first live tournament once data loads
  useEffect(() => {
    if (!tournamentId && liveTournaments.length > 0) {
      setTournamentId(liveTournaments[0].id)
    }
  }, [tournamentId, liveTournaments])
  const [totalBudget, setTotalBudget] = useState(500)
  const [rosterRules, setRosterRules] = useState({ ...DEFAULT_ROSTER_RULES })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name.trim()) { setError('Room name is required'); return }
    if (!tournamentId) { setError('Please select a tournament'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), tournamentId, totalBudget, rosterRules }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error?.message || 'Failed to create room')
      }
      const room = await res.json()
      navigate(`/t/${tournamentId}/rooms/${room.id}/lobby`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-16 pb-20">
      <Helmet><title>Create Room — MatchMind</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--gradient-live)] flex items-center justify-center">
            <Gavel size={20} className="text-[var(--mm-text-inverse)]" />
          </div>
          <h1 className="heading-1">Create Auction Room</h1>
        </div>

        {/* Steps indicator */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1">
              <div className={`h-1 rounded-full ${i <= step ? 'bg-[var(--mm-accent-green)]' : 'bg-[var(--mm-bg-tertiary)]'}`} />
              <span className={`caption mt-1 block ${i <= step ? 'text-[var(--mm-accent-green)]' : 'text-[var(--mm-text-muted)]'}`}>{s}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Tournament */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="heading-2">Choose Tournament</h2>
            <div className="grid gap-3">
              {liveTournaments.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTournamentId(t.id)}
                  className={`p-4 rounded-[var(--radius-lg)] border text-left transition-all ${
                    tournamentId === t.id
                      ? 'border-[var(--border-active)] bg-[var(--mm-accent-green)]/5'
                      : 'border-[var(--border-subtle)] bg-[var(--mm-bg-secondary)] hover:border-[var(--border-default)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center text-lg font-bold" style={{ background: t.theme.primary }}>
                      {t.shortName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="heading-3">{t.name}</h3>
                      <p className="caption text-[var(--mm-text-secondary)]">{t.confederation} · {t.teamCount} teams</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="caption text-[var(--mm-text-secondary)] block mb-1">Room Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., World Cup Draft Night"
                className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Budget & Rules */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="heading-2">Budget & Roster Rules</h2>
            <div>
              <label className="caption text-[var(--mm-text-secondary)] block mb-1">Total Budget ($)</label>
              <input
                type="number" min={100} max={5000} step={50}
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['GK', 'DEF', 'MID', 'FWD'] as const).map((pos) => (
                <div key={pos}>
                  <label className="caption text-[var(--mm-text-secondary)] block mb-1">{pos}</label>
                  <input
                    type="number" min={1} max={8}
                    value={rosterRules[pos]}
                    onChange={(e) => setRosterRules({ ...rosterRules, [pos]: Number(e.target.value) })}
                    className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body text-center rounded-[var(--radius-md)] px-3 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-4">
              <span className="body">Total squad size: <strong>{Object.values(rosterRules).reduce((a, b) => a + b, 0)}</strong></span>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="heading-2">Review</h2>
            <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-subtle)] space-y-3">
              <div className="flex justify-between"><span className="text-[var(--mm-text-muted)]">Room Name</span><span>{name}</span></div>
              <div className="flex justify-between"><span className="text-[var(--mm-text-muted)]">Tournament</span><span>{liveTournaments.find(t => t.id === tournamentId)?.name}</span></div>
              <div className="flex justify-between"><span className="text-[var(--mm-text-muted)]">Budget</span><span>🪙 ${totalBudget}</span></div>
              <div className="flex justify-between"><span className="text-[var(--mm-text-muted)]">Roster</span><span>{Object.entries(rosterRules).map(([k, v]) => `${k}: ${v}`).join(' · ')}</span></div>
            </div>
            {error && <div className="bg-[var(--mm-accent-red)]/10 border border-[var(--border-error)] rounded-[var(--radius-md)] p-3 body text-[var(--mm-accent-red)]">{error}</div>}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate(-1)}
            className="px-4 py-2.5 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-all"
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 2 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-all"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={submitting}
              className="px-6 py-2.5 bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Room'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

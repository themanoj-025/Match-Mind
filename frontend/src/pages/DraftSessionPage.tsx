/**
 * DraftSessionPage — Draft Mode experience (§1)
 *
 * Full Draft Mode flow:
 *   1. Start draft (formation picker + ticket check)
 *   2. Choice round (3 player cards, timer, pick action)
 *   3. Squad preview + commit
 *   4. Draft Run (enter run, resolve matchdays, rewards)
 *
 * All states: DRAFTING → SQUAD_COMPLETE → RUN_IN_PROGRESS → RUN_COMPLETE
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import {
  ArrowLeft,
  Play,
  Check,
  Loader2,
  AlertCircle,
  Zap,
  Users,
  Gavel,
  Trophy,
} from 'lucide-react'
import {
  useDraftSession,
  useStartDraft,
  useFormations,
  useNextRound,
  useMakePick,
  useCommitSquad,
  useEnterRun,
  useRunStatus,
  useResolveMatchday,
  useDraftTickets,
  useMyDraftSessions,
} from '../hooks/useDraft'
import { useTournaments } from '../lib/tournaments'
import FormatSelector from '../components/FormatSelector'
import DraftPlayerCard from '../components/DraftPlayerCard'
import DraftTimer from '../components/DraftTimer'
import RosterPreview from '../components/RosterPreview'
import DraftRunStatus from '../components/DraftRunStatus'
import RarityBadge from '../components/RarityBadge'

export default function DraftSessionPage() {
  const { sessionId } = useParams<{ sessionId?: string }>()
  const navigate = useNavigate()

  // Data
  const { data: sessionData, isLoading: sessionLoading } = useDraftSession(sessionId)
  const { data: formations } = useFormations()
  const { data: nextRound, isLoading: roundLoading } = useNextRound(
    sessionData?.session?.status === 'DRAFTING' ? sessionData.session.id : undefined,
  )
  const { data: runState } = useRunStatus(
    sessionData?.session?.status === 'RUN_IN_PROGRESS' || sessionData?.session?.status === 'RUN_COMPLETE'
      ? sessionData.session.id
      : undefined,
  )
  const { data: mySessions } = useMyDraftSessions()

  // Mutations
  const startDraft = useStartDraft()
  const makePick = useMakePick()
  const commitSquad = useCommitSquad()
  const enterRun = useEnterRun()
  const resolveMatchday = useResolveMatchday()

  // Derived
  const session = sessionData?.session
  const picks = sessionData?.picks || []
  const squad = sessionData?.squad || []
  const isDrafting = session?.status === 'DRAFTING'
  const isSquadComplete = session?.status === 'SQUAD_COMPLETE'
  const isRunActive = session?.status === 'RUN_IN_PROGRESS' || session?.status === 'RUN_COMPLETE'

  // ── Auto-refresh next round when drafting ──
  const [autoPickTimer, setAutoPickTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleAutoPick = useCallback(() => {
    if (!nextRound?.round || !session?.id) return
    const players = nextRound.round.players
    if (players.length === 0) return
    // Auto-pick: highest rarity → highest price
    const tierOrder: Record<string, number> = { ICON: 0, GOLD: 1, SILVER: 2, BRONZE: 3 }
    const sorted = [...players].sort((a, b) => {
      const tierDiff = (tierOrder[a.rarityTier] ?? 99) - (tierOrder[b.rarityTier] ?? 99)
      if (tierDiff !== 0) return tierDiff
      return b.basePrice - a.basePrice
    })
    makePick.mutate({
      sessionId: session.id,
      slotIndex: nextRound.round.slotIndex,
      pickedPlayerId: sorted[0].id,
    })
  }, [nextRound, session?.id, makePick])

  // Auto-pick on timer expiry
  useEffect(() => {
    if (!nextRound?.round?.expiresAt || !isDrafting) return
    const expiresAt = new Date(nextRound.round.expiresAt).getTime()
    const now = Date.now()
    const timeLeft = Math.max(0, expiresAt - now)

    if (timeLeft <= 0 && nextRound.round) {
      handleAutoPick()
      return
    }

    const timer = setTimeout(() => {
      handleAutoPick()
    }, timeLeft + 500)

    setAutoPickTimer(timer)
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [nextRound?.round?.expiresAt, isDrafting, handleAutoPick])

  // ── Formation selection for new draft ──
  const [selectedFormation, setSelectedFormation] = useState<string | null>(null)
  const [showFormationPicker, setShowFormationPicker] = useState(false)

  // If no sessionId, show start-draft flow
  if (!sessionId) {
    return (
      <StartDraftFlow
        formations={formations || []}
        selectedFormation={selectedFormation}
        onSelectFormation={setSelectedFormation}
        onStart={() => {
          if (!selectedFormation) return
          // Find tournament from the first available one
          const tournamentId = new URLSearchParams(window.location.search).get('tournamentId')
          if (!tournamentId) return
          startDraft.mutate(
            { tournamentId, formation: selectedFormation },
            {
              onSuccess: (result) => {
                if (result?.session?.id) {
                  navigate(`/draft/${result.session.id}`)
                }
              },
            },
          )
        }}
        isStarting={startDraft.isPending}
      />
    )
  }

  // Loading
  if (sessionLoading) {
    return (
      <div className="min-h-screen pt-16 pb-20 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--mm-accent-green)]" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-[var(--mm-text-muted)]" />
          <h2 className="heading-2 mb-1">Session Not Found</h2>
          <p className="body text-[var(--mm-text-secondary)] mb-4">This draft session doesn't exist or you don't have access.</p>
          <Link to="/dashboard" className="text-[var(--mm-accent-green)] hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16 pb-20">
      <Helmet>
        <title>{isDrafting ? 'Drafting' : isSquadComplete ? 'Squad Complete' : 'Draft Run'} — AuctionXI</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back button & session header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-sm text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors"
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

          <div className="flex items-center gap-2">
            {session.synergyScore > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-[var(--mm-accent-green)]/10 rounded-[var(--radius-full)] text-xs font-semibold text-[var(--mm-accent-green)]">
                <Zap size={12} />
                Synergy +{session.synergyScore}%
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-full)] text-xs font-medium">
              <span className="text-[var(--mm-text-secondary)]">{session.formation}</span>
              <span className="text-[var(--mm-text-muted)]">·</span>
              <span className={`font-semibold ${
                isDrafting ? 'text-[var(--mm-accent-green)]' :
                isSquadComplete ? 'text-[var(--mm-accent-amber)]' :
                isRunActive ? 'text-[var(--mm-accent-purple)]' :
                'text-[var(--mm-text-muted)]'
              }`}>
                {session.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* ── DRAFTING: Choice Round ── */}
            {isDrafting && (
              <>
                {/* Timer + pick info */}
                {nextRound?.round && (
                  <div className="flex items-center justify-between bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center text-lg">
                        {['🧤', '🛡️', '🎯', '⚽'][{ GK: 0, DEF: 1, MID: 2, FWD: 3 }[nextRound.round.position] ?? 2]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--mm-text-primary)]">
                          Pick {nextRound.round.slotIndex + 1} — {nextRound.round.position}
                        </p>
                        <p className="text-xs text-[var(--mm-text-muted)]">
                          Round {nextRound.round.slotIndex + 1} of {nextRound.round.players.length > 0 ? `${sessionData?.picks?.length || 0 + 1} picks made` : '?'}
                        </p>
                      </div>
                    </div>
                    <DraftTimer
                      expiresAt={nextRound.round.expiresAt}
                      totalSeconds={20}
                      onExpired={handleAutoPick}
                    />
                  </div>
                )}

                {/* Player cards grid */}
                {roundLoading ? (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-64 skeleton rounded-[var(--radius-xl)]" />
                    ))}
                  </div>
                ) : nextRound?.round ? (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {nextRound.round.players.map((player, i) => (
                      <DraftPlayerCard
                        key={player.id}
                        player={player}
                        slotIndex={i}
                        onPick={(playerId) => {
                          if (!session?.id) return
                          makePick.mutate({
                            sessionId: session.id,
                            slotIndex: nextRound.round!.slotIndex,
                            pickedPlayerId: playerId,
                          })
                        }}
                        disabled={makePick.isPending}
                      />
                    ))}
                  </div>
                ) : nextRound?.complete ? (
                  <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 text-center">
                    <Check size={48} className="mx-auto mb-3 text-[var(--mm-accent-green)]" />
                    <h2 className="heading-2 mb-1">All Picks Complete!</h2>
                    <p className="body text-[var(--mm-text-secondary)] mb-4">
                      You've filled all slots. Review your squad and commit to save it.
                    </p>
                    <button
                      onClick={() => commitSquad.mutate(session.id!)}
                      disabled={commitSquad.isPending}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {commitSquad.isPending ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Check size={18} />
                      )}
                      Commit Squad
                    </button>
                  </div>
                ) : (
                  <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 text-center">
                    <Loader2 size={32} className="mx-auto mb-3 animate-spin text-[var(--mm-accent-green)]" />
                    <p className="text-[var(--mm-text-secondary)]">Preparing next round...</p>
                  </div>
                )}

                {/* Pick feedback */}
                {makePick.isPending && (
                  <div className="px-4 py-2 bg-[var(--mm-accent-blue)]/10 rounded-[var(--radius-md)] text-center text-sm text-[var(--mm-accent-blue)]">
                    Processing your pick...
                  </div>
                )}

                {makePick.isError && (
                  <div className="px-4 py-2 bg-[var(--mm-accent-red)]/10 rounded-[var(--radius-md)] text-center text-sm text-[var(--mm-accent-red)]">
                    Pick failed. Please try again.
                  </div>
                )}

                {commitSquad.isError && (
                  <div className="px-4 py-2 bg-[var(--mm-accent-red)]/10 rounded-[var(--radius-md)] text-center text-sm text-[var(--mm-accent-red)]">
                    Failed to commit squad. Ensure all formation slots are filled.
                  </div>
                )}
              </>
            )}

            {/* ── SQUAD_COMPLETE: Commit & Run ── */}
            {isSquadComplete && (
              <div className="space-y-6">
                <div className="bg-[var(--mm-bg-secondary)] border border-[var(--mm-accent-green)]/30 rounded-[var(--radius-xl)] p-8 text-center">
                  <Trophy size={48} className="mx-auto mb-3 text-[var(--mm-accent-amber)]" />
                  <h2 className="heading-1 mb-1">Squad Complete!</h2>
                  <p className="body text-[var(--mm-text-secondary)] mb-2">
                    Your squad is locked and ready for the Draft Run.
                  </p>
                  {session.synergyScore > 0 && (
                    <p className="text-sm text-[var(--mm-accent-green)] mb-4">
                      Synergy Bonus: +{session.synergyScore}% · Formation Bonus: {session.formationBonusApplied ? '+5%' : 'None'}
                    </p>
                  )}

                  <button
                    onClick={() => enterRun.mutate(session.id!)}
                    disabled={enterRun.isPending}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-all disabled:opacity-50 shadow-lg"
                  >
                    {enterRun.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Play size={18} />
                    )}
                    Enter Draft Run
                  </button>
                </div>

                {enterRun.isError && (
                  <div className="px-4 py-3 bg-[var(--mm-accent-red)]/10 rounded-[var(--radius-md)] text-center text-sm text-[var(--mm-accent-red)]">
                    Failed to enter Draft Run. {enterRun.error?.message || ''}
                  </div>
                )}

                {/* Show roster in complete state too */}
                <RosterPreview
                  formationName={session.formation}
                  slots={nextRound?.round ? [] : formations?.find((f) => f.id === session.formation)?.slots || []}
                  benchSlots={formations?.find((f) => f.id === session.formation)?.benchSlots || 7}
                  picks={picks.map((p) => ({
                    ...p,
                    player: squad.find((s) => s.slotIndex === p.slotIndex)?.player || null,
                  }))}
                  synergyScore={session.synergyScore}
                  formationBonus={session.formationBonusApplied}
                />
              </div>
            )}

            {/* ── RUN_IN_PROGRESS / RUN_COMPLETE ── */}
            {isRunActive && runState && (
              <DraftRunStatus
                state={runState}
                onResolveMatchday={() => resolveMatchday.mutate(session.id!)}
                resolving={resolveMatchday.isPending}
              />
            )}
          </div>

          {/* Sidebar (1/3): Roster Preview */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Player count summary */}
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-[var(--mm-text-primary)]">Draft Summary</h3>
                  <span className="text-xs text-[var(--mm-text-muted)]">{picks.filter((p) => p.pickedPlayerId).length} / {picks.length} slots</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {['GK', 'DEF', 'MID', 'FWD'].map((pos) => {
                    const count = picks.filter((p) => p.position === pos && p.pickedPlayerId).length
                    return (
                      <div key={pos} className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-2">
                        <div className="text-lg">{['🧤', '🛡️', '🎯', '⚽'][['GK', 'DEF', 'MID', 'FWD'].indexOf(pos)]}</div>
                        <div className="text-xs font-bold text-[var(--mm-text-primary)]">{count}</div>
                        <div className="text-[10px] text-[var(--mm-text-muted)]">{pos}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <RosterPreview
                formationName={session.formation}
                slots={formations?.find((f) => f.id === session.formation)?.slots || [
                  { position: 'GK', count: 1 },
                  { position: 'DEF', count: 4 },
                  { position: 'MID', count: 4 },
                  { position: 'FWD', count: 2 },
                ]}
                benchSlots={formations?.find((f) => f.id === session.formation)?.benchSlots || 7}
                picks={picks.map((p) => ({
                  ...p,
                  player: squad.find((s) => s.slotIndex === p.slotIndex)?.player || null,
                }))}
                synergyScore={session.synergyScore}
                formationBonus={session.formationBonusApplied}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Start Draft Flow Component ─────────────────────────

function StartDraftFlow({
  formations,
  selectedFormation,
  onSelectFormation,
  onStart,
  isStarting,
}: {
  formations: Array<{ id: string; name: string; slots: Array<{ position: string; count: number }>; benchSlots: number }>
  selectedFormation: string | null
  onSelectFormation: (id: string) => void
  onStart: () => void
  isStarting: boolean
}) {
  return (
    <div className="min-h-screen pt-16 pb-20 flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-4">
        <Helmet>
          <title>Start Draft — AuctionXI</title>
        </Helmet>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] flex items-center justify-center">
            <Gavel size={28} className="text-[var(--mm-text-inverse)]" />
          </div>
          <h1 className="display-s mb-2">Start a New Draft</h1>
          <p className="body text-[var(--mm-text-secondary)]">
            Choose a formation to build your squad. Each formation has different slot distributions.
          </p>
        </div>

        <FormatSelector
          formations={formations}
          selected={selectedFormation}
          onSelect={onSelectFormation}
        />

        <button
          onClick={onStart}
          disabled={!selectedFormation || isStarting}
          className="mt-6 w-full py-3 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isStarting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Play size={18} />
          )}
          {isStarting ? 'Starting Draft...' : selectedFormation ? `Start ${selectedFormation} Draft` : 'Select a Formation'}
        </button>
      </div>
    </div>
  )
}

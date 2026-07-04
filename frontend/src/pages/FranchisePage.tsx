import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Crown, Star } from 'lucide-react'
import useStore from '../store/useStore'
import type { RosterEntry, Player } from '../lib/types'

export default function FranchisePage() {
  const { roomId, userId } = useParams<{ roomId: string; userId: string }>()
  const navigate = useNavigate()
  const currentUser = useStore((s) => s.user)
  const isMyFranchise = !userId || userId === 'me' || userId === currentUser?.id
  const effectiveUserId = isMyFranchise ? currentUser?.id : userId

  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [players, setPlayers] = useState<Record<string, Player>>({})
  const [additionalInfo, setAdditionalInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!roomId || !effectiveUserId) return
    Promise.all([
      fetch(`/api/rooms/${roomId}/franchises/${effectiveUserId}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/players?tournamentId=`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([rosterData, playersData]) => {
      setRoster(rosterData.roster || [])
      setAdditionalInfo({ remainingBudget: rosterData.remainingBudget, rosterSize: rosterData.rosterSize })
      const pm: Record<string, Player> = {}
      ;(Array.isArray(playersData) ? playersData : []).forEach((p: Player) => { pm[p.id] = p })
      setPlayers(pm)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [roomId, effectiveUserId])

  const setCaptain = async (playerId: string, isViceCaptain: boolean = false) => {
    if (!isMyFranchise) return
    const res = await fetch(`/api/rooms/${roomId}/franchises/me/captain`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ playerId, isViceCaptain }),
    })
    if (res.ok) {
      const updated = await res.json()
      setRoster(updated)
    }
  }

  const groupedRoster: Record<string, RosterEntry[]> = { GK: [], DEF: [], MID: [], FWD: [] }
  for (const entry of roster) {
    const pos = players[entry.playerId]?.position || 'MID'
    if (!groupedRoster[pos]) groupedRoster[pos] = []
    groupedRoster[pos].push(entry)
  }

  return (
    <div className="min-h-screen pt-16 pb-20">
      <Helmet><title>{isMyFranchise ? 'My Franchise' : 'Franchise'} — AuctionXI</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-1">{isMyFranchise ? 'My Franchise' : `Franchise: ${userId?.slice(0, 8)}`}</h1>
            <p className="body text-[var(--mm-text-secondary)] mt-1">{roster.length} players · 🪙 ${additionalInfo.remainingBudget || 0} remaining</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 skeleton rounded-[var(--radius-lg)]" />)}
          </div>
        ) : roster.length === 0 ? (
          <div className="text-center py-16 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)]">
            <Crown size={48} className="mx-auto mb-4 text-[var(--mm-text-muted)] opacity-30" />
            <h2 className="heading-2 mb-2">Empty Roster</h2>
            <p className="body text-[var(--mm-text-secondary)]">No players drafted yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(['GK', 'DEF', 'MID', 'FWD'] as const).map((position) => {
              const entries = groupedRoster[position] || []
              if (entries.length === 0) return null
              return (
                <div key={position}>
                  <h3 className="heading-3 mb-3 text-[var(--mm-accent-green)]">{position} ({entries.length})</h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {entries.map((entry) => {
                      const player = players[entry.playerId]
                      return (
                        <div key={entry.id} className={`bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] p-4 border ${
                          entry.isCaptain ? 'border-[var(--mm-accent-amber)] ring-1 ring-[var(--mm-accent-amber)]' :
                          entry.isViceCaptain ? 'border-[var(--mm-accent-purple)] ring-1 ring-[var(--mm-accent-purple)]' :
                          'border-[var(--border-subtle)]'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="body font-semibold">{player?.name || entry.playerId.slice(0, 8)}</span>
                                {entry.isCaptain && <span className="text-[var(--mm-accent-amber)]"><Crown size={16} /></span>}
                                {entry.isViceCaptain && <span className="text-[var(--mm-accent-purple)]"><Star size={16} /></span>}
                              </div>
                              <span className="caption text-[var(--mm-text-muted)]">{player?.club || ''} · Sold: 🪙 ${entry.soldPrice}</span>
                            </div>
                            {isMyFranchise && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setCaptain(entry.playerId)}
                                  className={`px-2 py-1 caption rounded-[var(--radius-sm)] ${
                                    entry.isCaptain ? 'bg-[var(--mm-accent-amber)] text-[var(--mm-text-inverse)]' : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)] hover:text-[var(--mm-accent-amber)]'
                                  }`}
                                >
                                  C
                                </button>
                                <button
                                  onClick={() => setCaptain(entry.playerId, true)}
                                  className={`px-2 py-1 caption rounded-[var(--radius-sm)] ${
                                    entry.isViceCaptain ? 'bg-[var(--mm-accent-purple)] text-[var(--mm-text-inverse)]' : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)] hover:text-[var(--mm-accent-purple)]'
                                  }`}
                                >
                                  VC
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

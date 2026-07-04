import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Player, PlayerMatchStat } from '../lib/types'

export default function PlayerProfilePage() {
  const { playerId } = useParams<{ playerId: string }>()
  const navigate = useNavigate()
  const [player, setPlayer] = useState<Player | null>(null)
  const [stats, setStats] = useState<PlayerMatchStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!playerId) return
    Promise.all([
      fetch(`/api/players/${playerId}`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([playerData]) => {
      setPlayer(playerData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [playerId])

  if (loading) return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[var(--mm-accent-green)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-16 pb-20">
      <Helmet><title>{player?.name || 'Player'} — AuctionXI</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {player ? (
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] flex items-center justify-center text-3xl font-bold text-[var(--mm-text-inverse)]">
                {player.name.charAt(0)}
              </div>
              <div>
                <h1 className="heading-1">{player.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="caption px-3 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-full)] font-semibold">{player.position}</span>
                  <span className="caption text-[var(--mm-text-secondary)]">{player.club}</span>
                  <span className="caption text-[var(--mm-text-muted)]">{player.nationality}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-4 text-center">
                <div className="caption text-[var(--mm-text-muted)]">Base Price</div>
                <div className="heading-2 text-[var(--mm-accent-amber)]">🪙 ${player.basePrice}</div>
              </div>
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-4 text-center">
                <div className="caption text-[var(--mm-text-muted)]">Matches</div>
                <div className="heading-2">{stats.length}</div>
              </div>
              <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-4 text-center">
                <div className="caption text-[var(--mm-text-muted)]">Position</div>
                <div className="heading-2">{player.position}</div>
              </div>
            </div>

            {stats.length > 0 && (
              <div>
                <h3 className="heading-3 mb-3">Match History</h3>
                <div className="overflow-x-auto caption">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[var(--mm-text-muted)] border-b border-[var(--border-subtle)]">
                        <th className="text-left py-2 pr-4">Match</th>
                        <th className="text-center py-2 px-2">Min</th>
                        <th className="text-center py-2 px-2">G</th>
                        <th className="text-center py-2 px-2">A</th>
                        <th className="text-center py-2 px-2">CS</th>
                        <th className="text-center py-2 px-2">YC</th>
                        <th className="text-center py-2 px-2">RC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.map((stat) => (
                        <tr key={stat.id} className="border-b border-[var(--border-subtle)]">
                          <td className="py-2 pr-4">{stat.fixtureId?.slice(0, 10)}</td>
                          <td className="text-center py-2 px-2">{stat.minutesPlayed}'</td>
                          <td className="text-center py-2 px-2">{stat.goals}</td>
                          <td className="text-center py-2 px-2">{stat.assists}</td>
                          <td className="text-center py-2 px-2">{stat.cleanSheet ? '✓' : '-'}</td>
                          <td className="text-center py-2 px-2">{stat.yellowCards}</td>
                          <td className="text-center py-2 px-2">{stat.redCards}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)]">
            <h2 className="heading-2 mb-2">Player not found</h2>
          </div>
        )}
      </div>
    </div>
  )
}

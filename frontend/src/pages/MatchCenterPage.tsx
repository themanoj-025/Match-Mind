// @ts-nocheck
import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import type { Fixture } from '../lib/types'

export default function MatchCenterPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const [fixture, setFixture] = useState<Fixture | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return
    fetch(`/api/fixtures/${matchId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => { setFixture(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [matchId])

  if (loading) return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[var(--mm-accent-green)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-16 pb-20">
      <Helmet><title>{fixture ? `${fixture.homeTeam} vs ${fixture.awayTeam}` : 'Match Center'} — MatchMind</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        {fixture ? (
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8">
            <div className="flex items-center justify-center gap-6 sm:gap-12 mb-8">
              <div className="text-center flex-1">
                <h2 className="heading-1 text-[var(--mm-text-primary)]">{fixture.homeTeam}</h2>
              </div>
              <div className="text-center flex-shrink-0">
                <div className="text-5xl font-bold text-[var(--mm-accent-green)]">
                  {fixture.homeScore ?? '-'} : {fixture.awayScore ?? '-'}
                </div>
                <span className={`caption mt-2 inline-block px-3 py-1 rounded-full ${
                  fixture.status === 'LIVE' ? 'bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)] animate-live-pulse' :
                  fixture.status === 'COMPLETED' ? 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)]' :
                  'bg-[var(--mm-accent-blue)]/10 text-[var(--mm-accent-blue)]'
                }`}>{fixture.status}</span>
              </div>
              <div className="text-center flex-1">
                <h2 className="heading-1 text-[var(--mm-text-primary)]">{fixture.awayTeam}</h2>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 caption text-[var(--mm-text-muted)] mb-6">
              <span className="flex items-center gap-1"><Calendar size={14} /> {fixture.scheduledAt?.slice(0, 10)}</span>
            </div>

            {fixture.status === 'COMPLETED' && fixture.playerMatchStats && fixture.playerMatchStats.length > 0 && (
              <div>
                <h3 className="heading-3 mb-4">Player Stats</h3>
                <div className="overflow-x-auto">
                  <table className="w-full caption">
                    <thead>
                      <tr className="text-[var(--mm-text-muted)] border-b border-[var(--border-subtle)]">
                        <th className="text-left py-2 pr-4">Player</th>
                        <th className="text-center py-2 px-2">G</th>
                        <th className="text-center py-2 px-2">A</th>
                        <th className="text-center py-2 px-2">CS</th>
                        <th className="text-center py-2 px-2">YC</th>
                        <th className="text-center py-2 px-2">RC</th>
                        <th className="text-center py-2 px-2">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fixture.playerMatchStats.map((stat: any) => (
                        <tr key={stat.id} className="border-b border-[var(--border-subtle)] last:border-0">
                          <td className="py-2 pr-4 text-[var(--mm-text-primary)]">{stat.playerId?.slice(0, 8)}</td>
                          <td className="text-center py-2 px-2">{stat.goals || 0}</td>
                          <td className="text-center py-2 px-2">{stat.assists || 0}</td>
                          <td className="text-center py-2 px-2">{stat.cleanSheet ? '✓' : '-'}</td>
                          <td className="text-center py-2 px-2">{stat.yellowCards || 0}</td>
                          <td className="text-center py-2 px-2">{stat.redCards || 0}</td>
                          <td className="text-center py-2 px-2 font-semibold text-[var(--mm-accent-green)]">{stat.goals * 6 + stat.assists * 3 + (stat.cleanSheet ? 4 : 0) - stat.yellowCards - stat.redCards * 3}</td>
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
            <Calendar size={48} className="mx-auto mb-4 text-[var(--mm-text-muted)] opacity-30" />
            <h2 className="heading-2 mb-2">Fixture not found</h2>
          </div>
        )}
      </div>
    </div>
  )
}


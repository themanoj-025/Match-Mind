import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, Gavel, Swords, ArrowRight, Zap } from 'lucide-react'
import { useTournaments } from '../lib/tournaments'
import { useMyDraftSessions } from '../hooks/useDraft'
import type { DraftSession } from '../lib/types'

export default function DashboardPage() {
  const { data: tournaments } = useTournaments()
  const liveTournaments = (tournaments || []).filter((t) => t.status === 'LIVE')
  const [activeTournament, setActiveTournament] = useState<string>('all')
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Draft Mode sessions
  const { data: draftSessions } = useMyDraftSessions()
  const pendingSessions = (draftSessions || []).filter(
    (s: DraftSession) => s.status === 'DRAFTING' || s.status === 'SQUAD_COMPLETE',
  )
  const activeRuns = (draftSessions || []).filter(
    (s: DraftSession) => s.status === 'RUN_IN_PROGRESS',
  )

  useEffect(() => {
    fetch('/api/rooms/mine', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredRooms = activeTournament === 'all'
    ? rooms
    : rooms.filter((r: any) => r.tournamentId === activeTournament)

  // Find first live tournament for Draft Mode entry
  const firstLiveTournament = liveTournaments[0]

  return (
    <div className="min-h-screen pt-16 pb-20">
      <Helmet>
        <title>Dashboard — MatchMind</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Draft Mode Hero Section ── */}
        {firstLiveTournament && (
          <div className="mb-8 bg-gradient-to-r from-[var(--mm-accent-green)]/10 via-[var(--mm-accent-blue)]/5 to-[var(--mm-bg-secondary)] border border-[var(--mm-accent-green)]/20 rounded-[var(--radius-xl)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] flex items-center justify-center shrink-0">
                  <Swords size={24} className="text-[var(--mm-text-inverse)]" />
                </div>
                <div>
                  <h2 className="heading-2 mb-0.5">Draft Mode</h2>
                  <p className="body text-[var(--mm-text-secondary)]">
                    Build your fantasy squad through packs, compete in Draft Runs, and earn cosmetic rewards.
                  </p>
                  {pendingSessions.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <Zap size={14} className="text-[var(--mm-accent-amber)]" />
                      <span className="text-xs text-[var(--mm-accent-amber)] font-medium">
                        {pendingSessions.length} incomplete draft{pendingSessions.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {activeRuns.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)] animate-pulse" />
                      <span className="text-xs text-[var(--mm-accent-green)] font-medium">
                        {activeRuns.length} active Draft Run{activeRuns.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {pendingSessions.length > 0 && (
                  <button
                    onClick={() => navigate(`/draft/${pendingSessions[0]?.id}`)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--mm-accent-amber)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-all text-sm"
                  >
                    <ArrowRight size={16} />
                    Continue Draft
                  </button>
                )}
                <Link
                  to={`/draft/new?tournamentId=${firstLiveTournament.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-all text-sm"
                >
                  <Plus size={16} />
                  New Draft
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="heading-1">My Rooms</h1>
            <p className="body text-[var(--mm-text-secondary)] mt-1">Manage your auction rooms</p>
          </div>
          <Link
            to="/rooms/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-all text-sm"
          >
            <Plus size={18} />
            Create Room
          </Link>
        </div>

        {/* Tournament Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setActiveTournament('all')}
            className={`px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all ${
              activeTournament === 'all'
                ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
            }`}
          >
            All Rooms
          </button>
          {liveTournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTournament(t.id)}
              className={`px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all ${
                activeTournament === t.id
                  ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                  : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
              }`}
            >
              {t.shortName}
            </button>
          ))}
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 skeleton rounded-[var(--radius-lg)]" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] border border-[var(--border-subtle)]">
            <Gavel size={48} className="mx-auto mb-4 text-[var(--mm-text-muted)] opacity-30" />
            <h2 className="heading-2 mb-2">No rooms yet</h2>
            <p className="body text-[var(--mm-text-secondary)] mb-6">
              Create your first auction room and invite your friends
            </p>
            <Link
              to="/rooms/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:opacity-90 transition-all"
            >
              <Plus size={18} />
              Create Your First Room
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room: any) => (
              <div
                key={room.id}
                className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--mm-accent-green)]/40 transition-all cursor-pointer group relative overflow-hidden"
                style={{
                  '--tournament-primary': tournaments?.find((tr: any) => tr.id === room.tournamentId)?.theme?.primary || '#0B3D91',
                  '--tournament-accent': tournaments?.find((tr: any) => tr.id === room.tournamentId)?.theme?.accent || '#D4AF37',
                } as any}
                onClick={() => {
                  const path = room.status === 'LOBBY'
                    ? `/rooms/${room.id}/lobby`
                    : room.status === 'DRAFTING' || room.status === 'PAUSED'
                      ? `/rooms/${room.id}/auction`
                      : `/rooms/${room.id}/franchise/me`
                  navigate(path)
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="heading-3">{room.name}</h3>
                  <span className={`caption px-2 py-0.5 rounded-[var(--radius-sm)] font-medium ${
                    room.status === 'LOBBY' ? 'bg-[var(--mm-accent-blue)]/10 text-[var(--mm-accent-blue)]' :
                    room.status === 'DRAFTING' ? 'bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)]' :
                    'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)]'
                  }`}>
                    {room.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[var(--mm-text-secondary)] caption mb-3">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    Invite: <span className="font-mono text-[var(--mm-accent-green)]">{room.inviteCode}</span>
                  </span>
                  <span>🪙 ${room.totalBudget}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


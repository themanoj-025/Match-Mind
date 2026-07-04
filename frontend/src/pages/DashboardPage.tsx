import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Users, Gavel } from 'lucide-react'
import { TOURNAMENTS } from '../lib/tournaments'
import TournamentThemeWrapper from '../components/TournamentThemeWrapper'

export default function DashboardPage() {
  const [activeTournament, setActiveTournament] = useState<string>('all')
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen pt-16 pb-20">
      <Helmet>
        <title>Dashboard — AuctionXI</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          {TOURNAMENTS.map((t) => (
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
                  '--tournament-primary': room.tournamentId === 'fifa-wc-2026' ? '#0B3D91' : '#0E1E4A',
                  '--tournament-accent': room.tournamentId === 'fifa-wc-2026' ? '#D4AF37' : '#8E44FF',
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

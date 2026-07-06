import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Copy, Check, Play } from 'lucide-react'
import useStore from '../store/useStore'
import type { Room, RoomMember } from '../lib/types'

export default function RoomLobbyPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!roomId) return
    fetch(`/api/rooms/${roomId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setRoom(data); setLoading(false) })
      .catch(() => { setLoading(false); setError('Failed to load room') })
  }, [roomId])

  const copyInviteCode = () => {
    if (room?.inviteCode) {
      navigator.clipboard.writeText(room.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const startAuction = async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/auction/start`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to start')
      navigate(`/rooms/${roomId}/auction`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const isHost = room?.hostId === user?.id

  if (loading) return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[var(--mm-accent-green)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen pt-16 pb-20">
      <Helmet><title>{room?.name || 'Lobby'} — MatchMind</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="heading-1">{room?.name}</h1>
              <p className="body text-[var(--mm-text-secondary)] mt-1">Waiting for players to join...</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)]">
              <button onClick={copyInviteCode} className="flex items-center gap-1.5 body text-[var(--mm-accent-green)] hover:underline">
                {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> {room?.inviteCode}</>}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-[var(--mm-accent-red)]/10 border border-[var(--border-error)] rounded-[var(--radius-md)] p-3 body text-[var(--mm-accent-red)]">{error}</div>
          )}

          {/* Members */}
          <div className="mb-6">
            <h3 className="heading-3 flex items-center gap-2 mb-3">
              <Users size={18} /> Members ({room?.members?.length || 0})
            </h3>
            <div className="space-y-2">
              {room?.members?.map((member: any) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] flex items-center justify-center text-[var(--mm-text-inverse)] font-bold text-sm">
                    {member.user?.displayName?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <span className="body font-medium">{member.user?.displayName || member.user?.username}</span>
                    {member.role === 'host' && (
                      <span className="caption ml-2 px-2 py-0.5 bg-[var(--mm-accent-purple)]/10 text-[var(--mm-accent-purple)] rounded-[var(--radius-sm)]">Host</span>
                    )}
                  </div>
                  <span className="caption text-[var(--mm-text-muted)]">🪙 ${member.remainingBudget}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start button (host only) */}
          {isHost && room?.status === 'LOBBY' && (
            <button
              onClick={startAuction}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] font-bold text-lg rounded-[var(--radius-lg)] hover:opacity-90 transition-all"
            >
              <Play size={20} /> Start Auction
            </button>
          )}

          {!isHost && (
            <div className="text-center py-4 text-[var(--mm-text-muted)] caption">
              Waiting for the host to start the auction...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

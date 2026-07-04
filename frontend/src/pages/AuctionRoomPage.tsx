import { useState, useEffect, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Gavel, Users, Timer } from 'lucide-react'
import io from 'socket.io-client'
import useStore from '../store/useStore'
import TournamentThemeWrapper from '../components/TournamentThemeWrapper'
import type { AuctionState, Player, RoomMember } from '../lib/types'

export default function AuctionRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const { currentAuctionState, setCurrentAuctionState } = useStore()

  const [room, setRoom] = useState<any>(null)
  const [players, setPlayers] = useState<Record<string, Player>>({})
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [myBudget, setMyBudget] = useState(0)
  const [myRoster, setMyRoster] = useState<any[]>([])
  const [bidHistory, setBidHistory] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Keep a ref to the latest auction state to avoid stale closures in WebSocket handlers
  const auctionStateRef = useRef(currentAuctionState)
  auctionStateRef.current = currentAuctionState

  // Helper to update auction state from partial updates (reads from ref, not closure)
  const patchAuctionState = useCallback((patch: Partial<AuctionState>) => {
    const state = auctionStateRef.current
    setCurrentAuctionState(state ? { ...state, ...patch } : null)
  }, [])

  const socketRef = useRef<any>(null)

  // Load room + players
  useEffect(() => {
    if (!roomId) return
    Promise.all([
      fetch(`/api/rooms/${roomId}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/players?tournamentId=`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([roomData, playersData]) => {
      setRoom(roomData)
      const playerMap: Record<string, Player> = {}
      ;(Array.isArray(playersData) ? playersData : []).forEach((p: Player) => { playerMap[p.id] = p })
      setPlayers(playerMap)

      if (roomData.auctionState) {
        setCurrentAuctionState(roomData.auctionState)
        if (roomData.auctionState.currentPlayerId) {
          setCurrentPlayer(playerMap[roomData.auctionState.currentPlayerId] || null)
        }
      }

      // Find my membership
      if (user && roomData.members) {
        const myMembership = roomData.members.find((m: RoomMember) => m.userId === user.id)
        if (myMembership) setMyBudget(myMembership.remainingBudget)
      }

      setLoading(false)
    }).catch(() => setLoading(false))
  }, [roomId])

  // Load my roster
  useEffect(() => {
    if (!roomId || !user) return
    fetch(`/api/rooms/${roomId}/franchises/${user.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setMyRoster(data.roster || []) })
      .catch(() => {})
  }, [roomId, user])

  // WebSocket connection
  useEffect(() => {
    if (!roomId) return
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    
    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:4000', {
      auth: { token },
    })

    socket.on('connect', () => {
      socket.emit('JOIN_ROOM', { roomId: `room:${roomId}` })
    })

    socket.on('ROOM_STATE_SYNC', (data: { auctionState: AuctionState }) => {
      setCurrentAuctionState(data.auctionState)
      if (data.auctionState.currentPlayerId) {
        setCurrentPlayer(players[data.auctionState.currentPlayerId] || null)
      }
    })

    socket.on('NEW_BID', (data: any) => {
      patchAuctionState({
        currentBid: data.amount,
        currentBidderId: data.bidderId,
        timerEndsAt: data.timerEndsAt,
        version: data.version,
      })
      
      setBidHistory(h => [{
        playerId: data.playerId,
        amount: data.amount,
        bidderId: data.bidderId,
        timestamp: new Date().toISOString(),
      }, ...h].slice(0, 50))
    })

    socket.on('PLAYER_SOLD', (_data: any) => {
      patchAuctionState({ phase: 'SOLD' as const })
      // Refresh roster after a moment
      setTimeout(() => {
        if (user) {
          fetch(`/api/rooms/${roomId}/franchises/${user.id}`, { credentials: 'include' })
            .then(r => r.json())
            .then(d => setMyRoster(d.roster || []))
            .catch(() => {})
        }
      }, 500)
    })

    socket.on('PLAYER_UNSOLD', () => {
      patchAuctionState({ phase: 'UNSOLD' as const })
    })

    socket.on('AUCTION_PHASE_CHANGE', (data: any) => {
      setCurrentAuctionState(data.state)
      if (data.state.currentPlayerId) {
        setCurrentPlayer(players[data.state.currentPlayerId] || null)
      }
    })

    socket.on('AUCTION_FINISHED', () => {
      patchAuctionState({ phase: 'FINISHED' as const })
    })

    socket.on('BID_REJECTED', (data: any) => {
      setError(data.message || 'Bid rejected')
      setTimeout(() => setError(''), 3000)
    })

    socketRef.current = socket
    return () => { socket.disconnect() }
  }, [roomId])

  // Timer countdown
  useEffect(() => {
    if (!currentAuctionState?.timerEndsAt) return
    const interval = setInterval(() => {
      const endsAt = currentAuctionState.timerEndsAt!
      const diff = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000))
      setTimeLeft(diff)
    }, 200)
    return () => clearInterval(interval)
  }, [currentAuctionState?.timerEndsAt])

  const placeBid = useCallback((amount: number) => {
    if (!socketRef.current || !currentAuctionState || !currentPlayer) return
    socketRef.current.emit('PLACE_BID', {
      roomId,
      playerId: currentPlayer.id,
      amount,
      expectedVersion: currentAuctionState.version,
    })
  }, [roomId, currentAuctionState, currentPlayer])

  const isMyBid = currentAuctionState?.currentBidderId === user?.id

  if (loading) return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[var(--mm-accent-green)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <TournamentThemeWrapper tournamentId={room?.tournamentId} className="min-h-screen pt-16 pb-20">
      <Helmet><title>{room?.name || 'Auction'} — AuctionXI</title></Helmet>
      
      {/* Top bar */}
      <div className="bg-[var(--mm-bg-secondary)] border-b border-[var(--border-subtle)] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/rooms/${roomId}/lobby`)} className="p-1.5 rounded-[var(--radius-sm)] text-[var(--mm-text-muted)] hover:text-[var(--mm-text-primary)]">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="heading-3">{room?.name || 'Auction Room'}</h2>
              <span className="caption text-[var(--mm-text-muted)]">
                Phase: <span className="text-[var(--mm-accent-green)]">{currentAuctionState?.phase || 'IDLE'}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="caption text-[var(--mm-text-secondary)] flex items-center gap-1">
              <Users size={14} /> {room?.members?.length || 0}
            </span>
            <span className="caption text-[var(--mm-accent-amber)] flex items-center gap-1">
              🪙 ${myBudget}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-6">
        {/* Main: Player Under Hammer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Player Card */}
          {currentAuctionState?.phase === 'PLAYER_LIVE' && currentPlayer ? (
            <div className="bg-[var(--mm-bg-secondary)] border-2 border-[var(--border-active)] rounded-[var(--radius-xl)] p-8 text-center relative overflow-hidden">
              {/* Timer */}
              <div className="absolute top-4 right-4">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-full)] ${
                  timeLeft <= 5 ? 'bg-[var(--mm-accent-red)]/20 text-[var(--mm-accent-red)] animate-glow-pulse' :
                  'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)]'
                }`}>
                  <Timer size={16} />
                  <span className="font-bold text-lg font-[var(--font-mono)]">{timeLeft}s</span>
                </div>
              </div>

              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] flex items-center justify-center text-3xl font-bold text-[var(--mm-text-inverse)]">
                {currentPlayer.name.charAt(0)}
              </div>
              <h1 className="display-l mb-1">{currentPlayer.name}</h1>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-full)] caption font-semibold">
                  {currentPlayer.position}
                </span>
                <span className="caption text-[var(--mm-text-secondary)]">{currentPlayer.club}</span>
                <span className="caption text-[var(--mm-text-muted)]">{currentPlayer.nationality}</span>
              </div>
              <div className="caption text-[var(--mm-text-muted)] mb-6">Base: 🪙 ${currentPlayer.basePrice}</div>

              {/* Current Bid */}
              <div className="text-4xl font-bold text-[var(--mm-accent-amber)] mb-2">
                🪙 ${currentAuctionState.currentBid || currentPlayer.basePrice}
              </div>
              {isMyBid ? (
                <div className="text-[var(--mm-accent-green)] font-semibold animate-glow-pulse">You are the highest bidder!</div>
              ) : currentAuctionState.currentBidderId ? (
                <div className="text-[var(--mm-text-secondary)]">Highest bidder: User #{currentAuctionState.currentBidderId.slice(0, 6)}</div>
              ) : (
                <div className="text-[var(--mm-text-muted)]">No bids yet</div>
              )}

              {/* Bid Buttons */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => placeBid((currentAuctionState.currentBid || currentPlayer.basePrice) + 5)}
                  disabled={currentAuctionState.currentBidderId === user?.id}
                  className="px-8 py-4 bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] font-bold text-lg rounded-[var(--radius-lg)] hover:opacity-90 transition-all disabled:opacity-40"
                >
                  Bid 🪙 ${(currentAuctionState.currentBid || currentPlayer.basePrice) + 5}
                </button>
              </div>

              {/* Error toast */}
              {error && (
                <div className="mt-4 bg-[var(--mm-accent-red)]/10 border border-[var(--border-error)] rounded-[var(--radius-md)] p-3 body text-[var(--mm-accent-red)]">
                  {error}
                </div>
              )}
            </div>
          ) : currentAuctionState?.phase === 'SOLD' ? (
            <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="heading-1 text-[var(--mm-accent-green)] mb-2">SOLD!</h2>
              <p className="body text-[var(--mm-text-secondary)]">Waiting for next player...</p>
            </div>
          ) : currentAuctionState?.phase === 'FINISHED' ? (
            <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] p-8 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="heading-1 text-[var(--mm-accent-amber)] mb-2">Auction Complete!</h2>
              <p className="body text-[var(--mm-text-secondary)] mb-4">All players have been drafted.</p>
              <button
                onClick={() => navigate(`/rooms/${roomId}/franchise/me`)}
                className="px-6 py-3 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)]"
              >
                View My Franchise
              </button>
            </div>
          ) : (
            <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] p-8 text-center">
              <Gavel size={48} className="mx-auto mb-4 text-[var(--mm-text-muted)] opacity-30" />
              <h2 className="heading-2 mb-2">Waiting for Auction</h2>
              <p className="body text-[var(--mm-text-secondary)]">The host will start the auction shortly.</p>
            </div>
          )}

          {/* My Roster Summary */}
          <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]">
            <h3 className="heading-3 mb-3">My Roster ({myRoster.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['GK', 'DEF', 'MID', 'FWD'] as const).map((pos) => (
                <div key={pos} className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-2 text-center">
                  <span className="caption text-[var(--mm-text-muted)]">{pos}</span>
                  <div className="heading-3">{myRoster.filter((r: any) => {
                    const p = players[r.playerId]
                    return p?.position === pos
                  }).length}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Bid History */}
        <div className="space-y-4">
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
            <h3 className="heading-3 mb-3">Bid Activity</h3>
            {bidHistory.length === 0 ? (
              <div className="text-center py-8 text-[var(--mm-text-muted)] caption">
                No bids placed yet
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {bidHistory.map((bid, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                    <span className="caption text-[var(--mm-text-secondary)]">
                      {players[bid.playerId]?.name || bid.playerId.slice(0, 8)}
                    </span>
                    <span className="caption font-semibold text-[var(--mm-accent-amber)]">
                      🪙 ${bid.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
            <h3 className="heading-3 mb-3">Budget</h3>
            <div className="text-3xl font-bold text-[var(--mm-accent-amber)]">🪙 ${myBudget}</div>
            <div className="caption text-[var(--mm-text-muted)] mt-1">remaining</div>
          </div>
        </div>
      </div>
    </TournamentThemeWrapper>
  )
}

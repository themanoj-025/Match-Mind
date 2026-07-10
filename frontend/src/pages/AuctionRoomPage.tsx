import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, MessageSquare, Gavel } from 'lucide-react'
import useStore from '../store/useStore'
import TournamentThemeWrapper from '../components/TournamentThemeWrapper'
import PlayerAuctionCard from '../components/PlayerAuctionCard'
import AuctionActivityFeed from '../components/AuctionActivityFeed'
import RosterBoard from '../components/RosterBoard'
import { useAuctionSocket } from '../hooks/useAuctionSocket'
import type { AuctionState, Player, RoomMember, Bid, Room } from '../lib/types'

export default function AuctionRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const user = useStore((s) => s.user)
  const { currentAuctionState, setCurrentAuctionState } = useStore()

  // ─── Local state ───────────────────────────────────────
  const [room, setRoom] = useState<Room | null>(null)
  const [players, setPlayers] = useState<Record<string, Player>>({})
  const [myBudget, setMyBudget] = useState(0)
  const [myRoster, setMyRoster] = useState<any[]>([])
  const [bidHistory, setBidHistory] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [starredPlayers, setStarredPlayers] = useState<Set<string>>(new Set())
  const [isPaused, setIsPaused] = useState(false)
  let bidCounter = 0

  // ─── Derived values ────────────────────────────────────
  const currentPlayerId = currentAuctionState?.currentPlayerId
  const currentPlayer = currentPlayerId ? players[currentPlayerId] || null : null
  const rosterRules = room?.rosterRules || { GK: 2, DEF: 5, MID: 5, FWD: 3, total: 15 }

  // ─── Load room + players on mount ─────────────────────
  useEffect(() => {
    if (!roomId) return
    Promise.all([
      fetch(`/api/rooms/${roomId}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/players`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([roomData, playersData]) => {
      setRoom(roomData)
      const playerMap: Record<string, Player> = {}
      ;(Array.isArray(playersData) ? playersData : []).forEach((p: Player) => { playerMap[p.id] = p })
      setPlayers(playerMap)

      if (roomData.auctionState) {
        setCurrentAuctionState(roomData.auctionState)
      }

      // Find my membership
      if (user && roomData.members) {
        const myMembership = roomData.members.find((m: RoomMember) => m.userId === user.id)
        if (myMembership) setMyBudget(myMembership.remainingBudget)
      }

      setLoading(false)
    }).catch(() => setLoading(false))
  }, [roomId])

  // ─── Load my roster ────────────────────────────────────
  const loadMyRoster = useCallback(() => {
    if (!roomId || !user) return
    fetch(`/api/rooms/${roomId}/franchises/${user.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setMyRoster(data.roster || []) })
      .catch(() => {})
  }, [roomId, user])

  useEffect(() => {
    loadMyRoster()
  }, [loadMyRoster])

  // ─── Set Captain/VC ────────────────────────────────────
  const setCaptain = async (playerId: string, isViceCaptain: boolean = false) => {
    if (!roomId) return
    const res = await fetch(`/api/rooms/${roomId}/franchises/me/captain`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ playerId, isViceCaptain }),
    })
    if (res.ok) {
      const updated = await res.json()
      setMyRoster(updated)
    }
  }

  // ─── Socket callbacks ─────────────────────────────────
  const onStateSync = useCallback((state: AuctionState) => {
    setCurrentAuctionState(state)
  }, [])

  const onNewBid = useCallback((data: any) => {
    setCurrentAuctionState(((prev: any) => prev ? {
      ...prev,
      currentBid: data.amount,
      currentBidderId: data.bidderId,
      timerEndsAt: data.timerEndsAt,
      version: data.version,
    } : null) as any)

    setBidHistory(h => [{
      id: `${data.playerId}-${Date.now()}-${++bidCounter}`,
      roomId: roomId || '',
      playerId: data.playerId,
      userId: data.bidderId,
      amount: data.amount,
      timestamp: new Date().toISOString(),
      version: data.version,
    }, ...h].slice(0, 50))
  }, [roomId])

  const onPlayerSold = useCallback((data: any) => {
    setCurrentAuctionState(((prev: any) => prev ? { ...prev, phase: 'SOLD' } : null) as any)
    // Refresh budget and roster after sale
    if (data.buyerId === user?.id) {
      setMyBudget(prev => prev - (data.price || 0))
    }
    setTimeout(() => loadMyRoster(), 500)
  }, [user, loadMyRoster])

  const onPlayerUnsold = useCallback(() => {
    setCurrentAuctionState(((prev: any) => prev ? { ...prev, phase: 'UNSOLD' } : null) as any)
  }, [])

  const onAuctionPhaseChange = useCallback((data: any) => {
    setCurrentAuctionState(data.state)
  }, [])

  const onAuctionFinished = useCallback(() => {
    setCurrentAuctionState(((prev: any) => prev ? { ...prev, phase: 'FINISHED' } : null) as any)
  }, [])

  const onReAuctionStarted = useCallback(() => {
    setCurrentAuctionState(((prev: any) => prev ? { ...prev, phase: 'RE_AUCTION' } : null) as any)
  }, [])

  const onAuctionPaused = useCallback(() => {
    setIsPaused(true)
  }, [])

  const onAuctionResumed = useCallback(() => {
    setIsPaused(false)
    loadMyRoster()
  }, [loadMyRoster])

  const onBidRejected = useCallback((data: { code: string; message: string }) => {
    setError(data.message || 'Bid rejected')
    setTimeout(() => setError(''), 3000)
  }, [])

  // ─── Connect WebSocket via hook ────────────────────────
  const { placeBid, toggleStar: socketToggleStar } = useAuctionSocket(roomId, {
    onStateSync,
    onNewBid,
    onPlayerSold,
    onPlayerUnsold,
    onAuctionPhaseChange,
    onAuctionFinished,
    onReAuctionStarted,
    onAuctionPaused,
    onAuctionResumed,
    onBidRejected,
  })

  // ─── Bid handler ───────────────────────────────────────
  const handleBid = useCallback((amount: number) => {
    if (!currentPlayerId || !currentAuctionState) return
    placeBid(currentPlayerId, amount, currentAuctionState.version)
  }, [currentPlayerId, currentAuctionState, placeBid])

  // ─── Star toggle ───────────────────────────────────────
  const handleToggleStar = useCallback(() => {
    if (!currentPlayerId) return
    socketToggleStar(currentPlayerId)
    setStarredPlayers(prev => {
      const next = new Set(prev)
      if (next.has(currentPlayerId)) next.delete(currentPlayerId)
      else next.add(currentPlayerId)
      return next
    })
  }, [currentPlayerId, socketToggleStar])

  // ─── Loading state ────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[var(--mm-accent-green)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <TournamentThemeWrapper tournamentId={room?.tournamentId} className="min-h-screen pt-16 pb-20">
      <Helmet><title>{room?.name || 'Auction'} — MatchMind</title></Helmet>

      {/* ── Top bar ─────────────────────────────────────── */}
      <div className="bg-[var(--mm-bg-secondary)] border-b border-[var(--border-subtle)] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/rooms/${roomId}/lobby`)}
              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--mm-text-muted)] hover:text-[var(--mm-text-primary)] transition-colors"
              aria-label="Back to lobby"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="heading-3">{room?.name || 'Auction Room'}</h2>
              <span className="caption text-[var(--mm-text-muted)]">
                Phase:{' '}
                <span className={`font-semibold ${
                  currentAuctionState?.phase === 'PLAYER_LIVE'
                    ? 'text-[var(--mm-accent-green)]'
                    : currentAuctionState?.phase === 'FINISHED'
                      ? 'text-[var(--mm-accent-amber)]'
                      : 'text-[var(--mm-text-secondary)]'
                }`}>
                  {currentAuctionState?.phase || 'IDLE'}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="caption text-[var(--mm-text-secondary)] flex items-center gap-1">
              <Users size={14} /> {room?.members?.length || 0}
            </span>
            <span className={`caption flex items-center gap-1 font-semibold ${
              myBudget < 50 ? 'text-[var(--mm-accent-red)]' : 'text-[var(--mm-accent-amber)]'
            }`}>
              🪙 ${myBudget}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-3 gap-6">
        {/* Left column: Player card + Roster */}
        <div className="lg:col-span-2 space-y-4">
          {/* Inline error toast */}
          {error && (
            <div
              className="bg-[var(--mm-accent-red)]/10 border border-[var(--border-error)] rounded-[var(--radius-md)] p-3 body text-[var(--mm-accent-red)] flex items-center gap-2"
              role="alert"
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Waiting state */}
          {(!currentAuctionState || currentAuctionState.phase === 'IDLE') && (
            <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] p-12 text-center border border-[var(--border-subtle)]">
              <Gavel size={48} className="mx-auto mb-4 text-[var(--mm-text-muted)] opacity-30" />
              <h2 className="heading-2 mb-2">Waiting for Auction</h2>
              <p className="body text-[var(--mm-text-secondary)]">
                The host will start the auction shortly.
              </p>
            </div>
          )}

          {/* Paused overlay banner */}
          {isPaused && (
            <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] p-8 text-center border-2 border-[var(--mm-accent-amber)] animate-glow-pulse">
              <div className="text-5xl mb-3">⏸️</div>
              <h2 className="heading-1 text-[var(--mm-accent-amber)] mb-2">Auction Paused</h2>
              <p className="body text-[var(--mm-text-secondary)]">
                The host has paused the auction. It will resume shortly.
              </p>
            </div>
          )}

          {/* Player Auction Card (PLAYER_LIVE, SOLD, UNSOLD, FINISHED) */}
          {currentAuctionState && currentAuctionState.phase !== 'IDLE' && currentPlayer && !isPaused && (
            <PlayerAuctionCard
              player={currentPlayer}
              auctionState={currentAuctionState}
              myBudget={myBudget}
              myUserId={user?.id}
              isStarred={starredPlayers.has(currentPlayerId || '')}
              rosterRules={rosterRules}
              roster={myRoster}
              players={players}
              totalBudget={room?.totalBudget || 500}
              onBid={handleBid}
              onToggleStar={handleToggleStar}
            />
          )}

          {/* Finished state (when no current player) */}
          {currentAuctionState?.phase === 'FINISHED' && !currentPlayer && (
            <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] p-12 text-center border border-[var(--border-subtle)]">
              <div className="text-fluid-display mb-4">🏆</div>
              <h2 className="heading-1 text-[var(--mm-accent-amber)] mb-2">Auction Complete!</h2>
              <p className="body text-[var(--mm-text-secondary)] mb-6">All players have been drafted.</p>
              <button
                onClick={() => navigate(`/rooms/${roomId}/franchise/me`)}
                className="px-6 py-3 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300"
              >
                View My Franchise
              </button>
            </div>
          )}

          {/* Re-auction state */}
          {currentAuctionState?.phase === 'RE_AUCTION' && (
            <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] p-8 text-center border border-[var(--mm-accent-purple)]">
              <h2 className="heading-2 text-[var(--mm-accent-purple)] mb-2">🔄 Re-Auction Round</h2>
              <p className="body text-[var(--mm-text-secondary)]">
                Unsold players are back in the pool with reduced base prices.
              </p>
            </div>
          )}

          {/* Roster Board */}
          <div className="bg-[var(--mm-bg-secondary)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]">
            <h3 className="heading-3 mb-3 flex items-center gap-2">
              My Roster
              <span className="caption text-[var(--mm-text-muted)] font-normal">({myRoster.length} players)</span>
            </h3>
            <RosterBoard
              roster={myRoster}
              players={players}
              isOwn={true}
              onSetCaptain={(playerId) => setCaptain(playerId)}
              onSetViceCaptain={(playerId) => setCaptain(playerId, true)}
              rosterRules={rosterRules}
            />
          </div>
        </div>

        {/* Right sidebar: Activity Feed */}
        <div className="space-y-4">
          <AuctionActivityFeed
            bids={bidHistory}
            players={players}
          />

          {/* Quick chat area */}
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
            <h3 className="heading-3 flex items-center gap-2 mb-3">
              <MessageSquare size={16} className="text-[var(--mm-accent-blue)]" />
              Room Chat
            </h3>
            <p className="caption text-[var(--mm-text-muted)] text-center py-4">
              Chat with other bidders during the auction
            </p>
          </div>
        </div>
      </div>
    </TournamentThemeWrapper>
  )
}


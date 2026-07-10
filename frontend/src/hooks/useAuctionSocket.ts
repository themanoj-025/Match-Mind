/**
 * useAuctionSocket — MatchMind
 *
 * Custom hook for real-time auction WebSocket events.
 * Handles connection lifecycle, event subscriptions, and cleanup.
 */
import { useEffect, useRef, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'
import type { AuctionState } from '../lib/types'

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000'

interface AuctionSocketCallbacks {
  onStateSync?: (state: AuctionState) => void
  onNewBid?: (data: { playerId: string; amount: number; bidderId: string; timerEndsAt: string; version: number }) => void
  onPlayerSold?: (data: { roomId: string; playerId: string; buyerId: string; price: number }) => void
  onPlayerUnsold?: (data: { roomId: string; playerId: string }) => void
  onAuctionPhaseChange?: (data: { roomId: string; state: AuctionState }) => void
  onAuctionFinished?: (data: { roomId: string }) => void
  onReAuctionStarted?: (data: { roomId: string; poolQueue: string[] }) => void
  onAuctionPaused?: (data: { roomId: string }) => void
  onAuctionResumed?: (data: { roomId: string }) => void
  onBidRejected?: (data: { code: string; message: string }) => void
  onChatMessage?: (message: any) => void
}

export function useAuctionSocket(
  roomId: string | undefined,
  callbacks: AuctionSocketCallbacks,
) {
  const socketRef = useRef<Socket | null>(null)
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  useEffect(() => {
    if (!roomId) return

    // Get auth token from cookie
    const getToken = () => {
      const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/)
      return match?.[1] || undefined
    }

    const socket = io(WS_URL, {
      auth: { token: getToken() },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      socket.emit('JOIN_ROOM', { roomId: `room:${roomId}` })
    })

    socket.on('ROOM_STATE_SYNC', (data: { auctionState: AuctionState }) => {
      callbacksRef.current.onStateSync?.(data.auctionState)
    })

    socket.on('NEW_BID', (data: any) => {
      callbacksRef.current.onNewBid?.(data)
    })

    socket.on('PLAYER_SOLD', (data: any) => {
      callbacksRef.current.onPlayerSold?.(data)
    })

    socket.on('PLAYER_UNSOLD', (data: any) => {
      callbacksRef.current.onPlayerUnsold?.(data)
    })

    socket.on('AUCTION_PHASE_CHANGE', (data: any) => {
      callbacksRef.current.onAuctionPhaseChange?.(data)
    })

    socket.on('AUCTION_FINISHED', (data: any) => {
      callbacksRef.current.onAuctionFinished?.(data)
    })

    socket.on('RE_AUCTION_STARTED', (data: any) => {
      callbacksRef.current.onReAuctionStarted?.(data)
    })

    socket.on('AUCTION_PAUSED', (data: any) => {
      callbacksRef.current.onAuctionPaused?.(data)
    })

    socket.on('AUCTION_RESUMED', (data: any) => {
      callbacksRef.current.onAuctionResumed?.(data)
    })

    socket.on('BID_REJECTED', (data: any) => {
      callbacksRef.current.onBidRejected?.(data)
    })

    socket.on('CHAT_MESSAGE', (message: any) => {
      callbacksRef.current.onChatMessage?.(message)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [roomId])

  const placeBid = useCallback((playerId: string, amount: number, expectedVersion: number) => {
    if (!socketRef.current || !roomId) return
    socketRef.current.emit('PLACE_BID', { roomId, playerId, amount, expectedVersion })
  }, [roomId])

  const sendChat = useCallback((text: string, gifUrl?: string) => {
    if (!socketRef.current || !roomId) return
    socketRef.current.emit('SEND_MESSAGE', { roomId: `room:${roomId}`, text, gifUrl })
  }, [roomId])

  const toggleStar = useCallback((playerId: string) => {
    if (!socketRef.current || !roomId) return
    socketRef.current.emit('TOGGLE_STAR', { roomId, playerId })
  }, [roomId])

  return { placeBid, sendChat, toggleStar }
}


// @ts-nocheck
/**
 * AuctionActivityFeed — MatchMind
 *
 * Virtualized scrolling bid log with ARIA live region announcements.
 * Shows the latest bid activity with player names, amounts, and timestamps.
 */
import { useRef, useEffect } from 'react'
import { Clock, DollarSign, User } from 'lucide-react'
import type { Bid, Player } from '../lib/types'

interface AuctionActivityFeedProps {
  bids: Bid[]
  players: Record<string, Player>
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - date.getTime()

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return date.toLocaleDateString()
}

export default function AuctionActivityFeed({ bids, players }: AuctionActivityFeedProps) {
  const feedRef = useRef<HTMLDivElement>(null)
  const prevBidsLength = useRef(bids.length)

  // Auto-scroll to top on new bid
  useEffect(() => {
    if (bids.length > prevBidsLength.current && feedRef.current) {
      feedRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
    prevBidsLength.current = bids.length
  }, [bids.length])

  return (
    <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
      <h3 className="heading-3 flex items-center gap-2 mb-3">
        <DollarSign size={16} className="text-[var(--mm-accent-amber)]" />
        Bid Activity
        {bids.length > 0 && (
          <span className="caption text-[var(--mm-text-muted)] font-normal">({bids.length})</span>
        )}
      </h3>

      <div
        ref={feedRef}
        className="space-y-1 max-h-80 overflow-y-auto scrollbar-none"
        role="log"
        aria-live="polite"
        aria-label="Recent bid activity"
      >
        {bids.length === 0 ? (
          <div className="text-center py-8 text-[var(--mm-text-muted)] caption">
            <Clock size={24} className="mx-auto mb-2 opacity-30" />
            No bids placed yet
          </div>
        ) : (
          bids.map((bid, i) => {
            const player = players[bid.playerId]
            return (
              <div
                key={`${bid.timestamp}-${i}`}
                className="flex items-center justify-between py-2 px-2 rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)] transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center shrink-0">
                    <User size={12} className="text-[var(--mm-text-muted)]" />
                  </div>
                  <div className="min-w-0">
                    <span className="caption font-medium truncate block">
                      {player?.name || bid.playerId.slice(0, 8)}
                    </span>
                    <span className="caption text-[var(--mm-text-muted)]">
                      {formatTime(bid.timestamp)}
                    </span>
                  </div>
                </div>
                <span className="caption font-semibold text-[var(--mm-accent-amber)] shrink-0 ml-2">
                  🪙 ${bid.amount}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}


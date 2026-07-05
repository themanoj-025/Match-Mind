/**
 * BidButton — AuctionXI
 *
 * Large, thumb-friendly bid button that shows the next minimum bid.
 * Disables client-side as a hint when budget/roster rule would be violated.
 * Server is the authority — client-side disable is display-only.
 *
 * Accessibility:
 * - Keyboard shortcut: Spacebar = place minimum next bid
 * - aria-label for screen readers
 */
import { useCallback, useEffect } from 'react'

interface BidButtonProps {
  currentBid: number
  basePrice: number
  remainingBudget: number
  minBidIncrement: number
  isHighestBidder: boolean
  phase: string
  disabled: boolean
  onBid: (amount: number) => void
}

export default function BidButton({
  currentBid,
  basePrice,
  remainingBudget,
  minBidIncrement = 5,
  isHighestBidder,
  phase,
  disabled: externalDisabled,
  onBid,
}: BidButtonProps) {
  const nextMinBid = Math.max(currentBid || basePrice, basePrice) + minBidIncrement
  const canAfford = remainingBudget >= nextMinBid
  const disabled = phase !== 'PLAYER_LIVE' || isHighestBidder || !canAfford || externalDisabled

  const handleBid = useCallback(() => {
    if (!disabled) onBid(nextMinBid)
  }, [disabled, nextMinBid, onBid])

  // Keyboard shortcut: Spacebar to bid
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === 'Space' && !disabled) {
        e.preventDefault()
        handleBid()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, handleBid])

  if (phase === 'FINISHED') return null

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleBid}
        disabled={disabled}
        aria-label={`Place bid of $${nextMinBid}`}
        className={`
          relative px-10 py-5 rounded-[var(--radius-xl)] font-bold text-xl
          transition-all duration-200 select-none
          ${disabled
            ? 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)] cursor-not-allowed opacity-50'
            : 'bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] hover:shadow-[var(--shadow-glow-green)] hover:scale-[1.02] active:scale-95 cursor-pointer'
          }
        `}
      >
        <span className="flex items-center gap-2">
          Bid 🪙 ${nextMinBid}
        </span>
      </button>

      {isHighestBidder && (
        <span className="caption text-[var(--mm-accent-green)] font-semibold animate-glow-pulse">
          You are the highest bidder
        </span>
      )}

      {!canAfford && phase === 'PLAYER_LIVE' && !isHighestBidder && (
        <span className="caption text-[var(--mm-accent-red)]">
          Insufficient budget for minimum bid
        </span>
      )}

      <span className="caption text-[var(--mm-text-muted)]">
        Press <kbd className="px-1.5 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] font-mono text-xs">Space</kbd> to quick-bid
      </span>
    </div>
  )
}

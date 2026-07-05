/**
 * PlayerAuctionCard — AuctionXI
 *
 * Displays the player currently under the hammer in the live auction.
 * Shows photo/avatar, name, club, nationality, position, base price,
 * current bid, and star toggle.
 */
import { Gavel, Star } from 'lucide-react'
import type { Player } from '../lib/types'
import AuctionTimer from './AuctionTimer'
import BidButton from './BidButton'
import BudgetTracker from './BudgetTracker'
import SoldStamp from './SoldStamp'

interface PlayerAuctionCardProps {
  player: Player
  auctionState: {
    phase: string
    currentBid: number
    currentBidderId: string | null
    timerEndsAt: string | null
    version: number
  }
  myBudget: number
  myUserId: string | undefined
  isStarred?: boolean
  rosterRules: { GK: number; DEF: number; MID: number; FWD: number; total: number }
  roster: any[]
  players: Record<string, Player>
  totalBudget: number
  onBid: (amount: number) => void
  onToggleStar: () => void
  onTimerExpired?: () => void
}

export default function PlayerAuctionCard({
  player,
  auctionState,
  myBudget,
  myUserId,
  isStarred = false,
  rosterRules,
  roster,
  players,
  totalBudget,
  onBid,
  onToggleStar,
  onTimerExpired,
}: PlayerAuctionCardProps) {
  const isMyBid = auctionState.currentBidderId === myUserId
  const minBidIncrement = auctionState.currentBid < 50 ? 5
    : auctionState.currentBid < 100 ? 10
    : auctionState.currentBid < 200 ? 25 : 50

  return (
    <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-active)] rounded-[var(--radius-xl)] p-6 sm:p-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--mm-accent-green)]/5 to-transparent pointer-events-none" />

      {/* Star toggle */}
      <button
        onClick={onToggleStar}
        className={`absolute top-4 left-4 p-2 rounded-full transition-all z-10 ${
          isStarred
            ? 'text-[var(--mm-accent-amber)] bg-[var(--mm-accent-amber)]/10'
            : 'text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
        }`}
        aria-label={isStarred ? 'Unstar player' : 'Star player'}
      >
        <Star size={18} fill={isStarred ? 'currentColor' : 'none'} />
      </button>

      {/* Timer */}
      <div className="absolute top-4 right-4 z-10">
        <AuctionTimer
          timerEndsAt={auctionState.timerEndsAt}
          phase={auctionState.phase}
          onExpired={onTimerExpired}
        />
      </div>

      {/* Player identity */}
      <div className="text-center pt-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] flex items-center justify-center text-3xl font-bold text-[var(--mm-text-inverse)] shadow-[var(--shadow-glow-green)]">
          {player.name.charAt(0)}
        </div>

        <h1 className="display-l mb-1">{player.name}</h1>

        <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
          <span className="px-3 py-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-full)] caption font-semibold text-[var(--mm-accent-green)]">
            {player.position}
          </span>
          <span className="caption text-[var(--mm-text-secondary)]">{player.club}</span>
          <span className="caption text-[var(--mm-text-muted)]">{player.nationality}</span>
        </div>

        <div className="caption text-[var(--mm-text-muted)] mb-4">
          Base price: 🪙 ${player.basePrice}
        </div>
      </div>

      {/* Current bid section */}
      {auctionState.phase === 'PLAYER_LIVE' && (
        <div className="text-center mb-6">
          <div className="text-4xl sm:text-5xl font-bold text-[var(--mm-accent-amber)] mb-2 animate-number-roll">
            🪙 ${auctionState.currentBid || player.basePrice}
          </div>

          {isMyBid ? (
            <div className="text-[var(--mm-accent-green)] font-semibold animate-glow-pulse">
              You are the highest bidder!
            </div>
          ) : auctionState.currentBidderId ? (
            <div className="text-[var(--mm-text-secondary)] caption">
              Highest bidder
            </div>
          ) : (
            <div className="text-[var(--mm-text-muted)] caption">
              Opening bid — be the first!
            </div>
          )}
        </div>
      )}

      {/* Sold state */}
      {auctionState.phase === 'SOLD' && (
        <div className="text-center mb-6">
          <SoldStamp playerName={player.name} price={auctionState.currentBid} buyerId={auctionState.currentBidderId} />
        </div>
      )}

      {/* Unsold state */}
      {auctionState.phase === 'UNSOLD' && (
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⏳</div>
          <h2 className="heading-2 text-[var(--mm-text-muted)] mb-1">Unsold</h2>
          <p className="caption text-[var(--mm-text-secondary)]">Player went unsold — may return in re-auction</p>
        </div>
      )}

      {/* Finished state */}
      {auctionState.phase === 'FINISHED' && (
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏆</div>
          <h2 className="heading-1 text-[var(--mm-accent-amber)] mb-1">Auction Complete!</h2>
          <p className="body text-[var(--mm-text-secondary)]">All players have been drafted.</p>
        </div>
      )}

      {/* Bid button */}
      {auctionState.phase === 'PLAYER_LIVE' && (
        <BidButton
          currentBid={auctionState.currentBid}
          basePrice={player.basePrice}
          remainingBudget={myBudget}
          minBidIncrement={minBidIncrement}
          isHighestBidder={isMyBid}
          phase={auctionState.phase}
          disabled={false}
          onBid={onBid}
        />
      )}

      {/* Budget tracker */}
      {auctionState.phase === 'PLAYER_LIVE' && (
        <div className="mt-6">
          <BudgetTracker
            remainingBudget={myBudget}
            rosterRules={rosterRules}
            roster={roster}
            players={players}
            totalBudget={totalBudget}
          />
        </div>
      )}
    </div>
  )
}

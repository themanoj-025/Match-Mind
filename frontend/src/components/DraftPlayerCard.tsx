/**
 * DraftPlayerCard — Choice round player card
 *
 * Displays a single offered player with rarity badge, position,
 * club, nationality, base price, and a pick button.
 * Highlights on hover and shows a shimmer on ICON rarity.
 */

import { motion } from 'framer-motion'
import RarityBadge from './RarityBadge'

interface DraftPlayerCardProps {
  player: {
    id: string
    name: string
    position: string
    club: string
    nationality: string
    basePrice: number
    rarityTier: string
    photoUrl?: string
  }
  slotIndex: number
  onPick: (playerId: string) => void
  disabled?: boolean
  picked?: boolean
}

const POSITION_ICONS: Record<string, string> = {
  GK: '🧤',
  DEF: '🛡️',
  MID: '🎯',
  FWD: '⚽',
}

function getFlagEmoji(nationality: string): string {
  const codePoints = nationality
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

export default function DraftPlayerCard({
  player,
  slotIndex,
  onPick,
  disabled = false,
  picked = false,
}: DraftPlayerCardProps) {
  const isIcon = player.rarityTier === 'ICON'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: slotIndex * 0.1, duration: 0.3 }}
      className={`
        relative bg-[var(--mm-bg-secondary)] rounded-[var(--radius-xl)] border-2 overflow-hidden
        transition-all duration-300
        ${
          picked
            ? 'border-[var(--mm-accent-green)] opacity-80 scale-95'
            : disabled
              ? 'border-[var(--border-subtle)] opacity-50 cursor-not-allowed'
              : 'border-[var(--border-subtle)] hover:border-[var(--mm-accent-green)] hover:shadow-[var(--shadow-glow-green)] cursor-pointer'
        }
        ${isIcon ? 'ring-1 ring-amber-400/30' : ''}
      `}
      onClick={() => {
        if (!disabled && !picked) onPick(player.id)
      }}
      whileHover={!disabled && !picked ? { scale: 1.02 } : {}}
      whileTap={!disabled && !picked ? { scale: 0.98 } : {}}
      layout
    >
      {/* ICON shimmer gradient */}
      {isIcon && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-purple-500/5 to-transparent pointer-events-none" />
      )}

      <div className="p-5 relative z-10">
        {/* Rarity badge - top left */}
        <div className="absolute top-3 left-3">
          <RarityBadge tier={player.rarityTier} size="sm" />
        </div>

        {/* Player avatar */}
        <div className="flex justify-center pt-4 pb-3">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={player.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border-subtle)]"
              loading="lazy"
            />
          ) : (
            <div
              className={`
                w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold
                ${
                  isIcon
                    ? 'bg-gradient-to-br from-amber-500 to-purple-600'
                    : 'bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)]'
                }
                text-[var(--mm-text-inverse)] shadow-lg
              `}
            >
              {player.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Player name */}
        <h3 className="text-center font-bold text-[var(--mm-text-primary)] text-sm sm:text-base truncate mb-1">
          {player.name}
        </h3>

        {/* Club & Nationality */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xs text-[var(--mm-text-secondary)] truncate max-w-[120px]">{player.club}</span>
          <span className="text-xs" title={player.nationality}>
            {getFlagEmoji(player.nationality)}
          </span>
        </div>

        {/* Position badge */}
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <span className="text-base">{POSITION_ICONS[player.position] || '📍'}</span>
          <span className="px-2.5 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-full)] text-xs font-semibold text-[var(--mm-accent-green)]">
            {player.position}
          </span>
          <span className="text-xs text-[var(--mm-text-muted)]">🪙 ${player.basePrice}</span>
        </div>

        {/* Pick button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!disabled && !picked) onPick(player.id)
          }}
          disabled={disabled || picked}
          className={`
            w-full py-2.5 rounded-[var(--radius-md)] font-semibold text-sm transition-all duration-200
            ${
              picked
                ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] cursor-default'
                : disabled
                  ? 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-muted)]'
                  : isIcon
                    ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white hover:opacity-90 shadow-md active:scale-95'
                    : 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] hover:opacity-90 active:scale-95'
            }
          `}
        >
          {picked ? '✓ Drafted' : disabled ? 'Selecting...' : `Pick ${player.name.split(' ').pop() || ''}`}
        </button>
      </div>
    </motion.div>
  )
}

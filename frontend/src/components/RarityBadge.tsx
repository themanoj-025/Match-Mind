/**
 * RarityBadge — Draft Mode rarity tier badge
 *
 * Displays BRONZE, SILVER, GOLD, or ICON with distinct visual styling.
 */

interface RarityBadgeProps {
  tier: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const config: Record<string, { label: string; bg: string; text: string; border: string; icon: string }> = {
  BRONZE: {
    label: 'Bronze',
    bg: 'bg-gradient-to-r from-amber-800/40 to-amber-600/30',
    text: 'text-amber-300',
    border: 'border-amber-700/40',
    icon: '◆',
  },
  SILVER: {
    label: 'Silver',
    bg: 'bg-gradient-to-r from-slate-500/40 to-slate-300/30',
    text: 'text-slate-200',
    border: 'border-slate-500/40',
    icon: '◇',
  },
  GOLD: {
    label: 'Gold',
    bg: 'bg-gradient-to-r from-yellow-600/40 to-yellow-400/30',
    text: 'text-yellow-300',
    border: 'border-yellow-500/50',
    icon: '✦',
  },
  ICON: {
    label: 'Icon',
    bg: 'bg-gradient-to-r from-purple-700/40 via-amber-500/30 to-purple-700/40',
    text: 'text-amber-200',
    border: 'border-amber-400/50',
    icon: '⭐',
  },
}

export default function RarityBadge({ tier, size = 'sm', showLabel = true }: RarityBadgeProps) {
  const c = config[tier] || config['BRONZE']!
  const sizeClasses =
    size === 'lg' ? 'px-3 py-1 text-sm' : size === 'md' ? 'px-2.5 py-0.5 text-xs' : 'px-2 py-0.5 text-[10px]'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-full)] font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border} ${sizeClasses}`}
    >
      <span className="text-[0.8em]">{c.icon}</span>
      {showLabel && <span>{c.label}</span>}
    </span>
  )
}

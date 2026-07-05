import React from 'react'

interface TierBadgeProps {
  tier?: string
  size?: 'sm' | 'lg'
  showLabel?: boolean
}

interface TierConfig {
  label: string
  gradient: string
  color: string | null
}

const tierConfig: Record<string, TierConfig> = {
  BRONZE: { label: 'Bronze', gradient: 'from-amber-700 to-amber-500', color: 'var(--tier-bronze)' },
  SILVER: { label: 'Silver', gradient: 'from-gray-400 to-gray-200', color: 'var(--tier-silver)' },
  GOLD: { label: 'Gold', gradient: 'from-yellow-500 to-yellow-300', color: 'var(--tier-gold)' },
  PLATINUM: { label: 'Platinum', gradient: 'from-cyan-500 to-cyan-300', color: 'var(--tier-platinum)' },
  DIAMOND: { label: 'Diamond', gradient: 'from-blue-500 to-purple-500', color: 'var(--tier-diamond)' },
  LEGEND: { label: 'Legend', gradient: 'from-orange-500 to-red-500', color: null },
}

export default function TierBadge({ tier = 'BRONZE', size = 'sm', showLabel = true }: TierBadgeProps) {
  const config = tierConfig[tier] || tierConfig.BRONZE
  const sizeClasses = size === 'lg' ? 'text-sm px-3 py-1' : 'text-[10px] px-2 py-0.5'

  if (tier === 'LEGEND') {
    return (
      <div
        className={`inline-flex items-center gap-1 rounded-[var(--radius-full)] font-bold uppercase tracking-wider ${sizeClasses}`}
        style={{ background: 'var(--tier-legend)', color: 'var(--mm-text-inverse)' }}
      >
        <span>⭐</span>
        {showLabel && <span>{config.label}</span>}
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-[var(--radius-full)] bg-gradient-to-r ${config.gradient} font-bold uppercase tracking-wider ${sizeClasses}`}
      style={{ color: 'var(--mm-text-inverse)' }}
    >
      <span>◆</span>
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}

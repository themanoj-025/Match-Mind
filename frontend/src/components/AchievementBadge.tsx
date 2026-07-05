import React from 'react'

const rarityColors = {
  common: { bg: 'bg-[var(--mm-bg-tertiary)]', border: 'border-[var(--border-subtle)]' },
  rare: { bg: 'bg-blue-900/20', border: 'border-blue-500/30' },
  epic: { bg: 'bg-purple-900/20', border: 'border-purple-500/30' },
  legendary: { bg: 'bg-orange-900/20', border: 'border-orange-500/30' },
}

export default function AchievementBadge({ icon, name, rarity = 'common', unlocked = false, size = 'md' }) {
  const colors = rarityColors[rarity] || rarityColors.common
  const sizeClasses = size === 'lg' ? 'w-16 h-16 text-3xl' : 'w-12 h-12 text-2xl'

  return (
    <div className="flex flex-col items-center gap-1.5 group">
      <div
        className={`${sizeClasses} rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center transition-all duration-300 ${
          unlocked ? 'group-hover:scale-110 group-hover:shadow-[var(--shadow-glow-green)]' : 'opacity-40 grayscale'
        }`}
        title={unlocked ? `${name} - ${rarity}` : `🔒 ${name}`}
      >
        {unlocked ? <span>{icon}</span> : <span>🔒</span>}
      </div>
      {name && (
        <span className={`caption text-center ${unlocked ? 'text-[var(--mm-text-secondary)]' : 'text-[var(--mm-text-muted)]'}`}>
          {name}
        </span>
      )}
    </div>
  )
}

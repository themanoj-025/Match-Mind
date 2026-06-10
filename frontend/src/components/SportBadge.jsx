import React from 'react'

const sportConfig = {
  football: { icon: '⚽', color: 'var(--sport-football)', label: 'Football' },
  basketball: { icon: '🏀', color: 'var(--sport-basketball)', label: 'Basketball' },
  american_football: { icon: '🏈', color: 'var(--sport-american-fb)', label: 'NFL' },
  tennis: { icon: '🎾', color: 'var(--sport-tennis)', label: 'Tennis' },
  cricket: { icon: '🏏', color: 'var(--sport-cricket)', label: 'Cricket' },
  hockey: { icon: '🏒', color: 'var(--sport-hockey)', label: 'Hockey' },
}

export default function SportBadge({ sport, size = 'md', showLabel = true }) {
  const config = sportConfig[sport] || { icon: '⚽', color: 'var(--text-muted)', label: sport }
  const sizeClasses = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'

  return (
    <div className="flex items-center gap-1.5" style={{ color: config.color }}>
      <span className={sizeClasses}>{config.icon}</span>
      {showLabel && (
        <span className="caption font-medium" style={{ color: 'var(--mm-text-muted)' }}>
          {config.label}
        </span>
      )}
    </div>
  )
}

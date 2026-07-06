// @ts-nocheck
import React from 'react'

interface SportBadgeProps {
  sport: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const sportConfig: Record<string, { icon: string; color: string; label: string }> = {
  football: { icon: '⚽', color: 'var(--sport-football)', label: 'Football' },
}

export default function SportBadge({ sport, size = 'md', showLabel = true }: SportBadgeProps) {
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


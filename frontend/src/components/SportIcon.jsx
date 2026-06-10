import React from 'react'

const sportIcons = {
  football: '⚽',
  basketball: '🏀',
  american_football: '🏈',
  tennis: '🎾',
  cricket: '🏏',
  hockey: '🏒',
}

const sportColors = {
  football: 'var(--sport-football)',
  basketball: 'var(--sport-basketball)',
  american_football: 'var(--sport-american-fb)',
  tennis: 'var(--sport-tennis)',
  cricket: 'var(--sport-cricket)',
  hockey: 'var(--sport-hockey)',
}

export default function SportIcon({ sport, size = 'md', className = '' }) {
  const icon = sportIcons[sport] || '⚽'
  const sizeClasses = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl'

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses} ${className}`}
      role="img"
      aria-label={sport?.replace('_', ' ') || 'Sport'}
      style={{ color: sportColors[sport] || 'var(--mm-text-muted)' }}
    >
      {icon}
    </span>
  )
}

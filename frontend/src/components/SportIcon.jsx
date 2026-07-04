import React from 'react'

const sportIcons = {
  football: '⚽',
}

const sportColors = {
  football: 'var(--sport-football)',
}

export default function SportIcon({ sport, size = 'md', className = '' }) {
  const icon = sportIcons[sport] || '⚽'
  const sizeClasses = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-xl'

  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses} ${className}`}
      role="img"
      aria-label="Football"
      style={{ color: sportColors[sport] || 'var(--mm-text-muted)' }}
    >
      {icon}
    </span>
  )
}

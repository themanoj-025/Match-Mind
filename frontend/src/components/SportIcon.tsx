import React from 'react'

interface SportIconProps {
  sport: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sportIcons: Record<string, string> = {
  football: '⚽',
}

const sportColors: Record<string, string> = {
  football: 'var(--sport-football)',
}

export default function SportIcon({ sport, size = 'md', className = '' }: SportIconProps) {
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

import React from 'react'
import { User } from 'lucide-react'

const tierRingColors = {
  BRONZE: 'ring-amber-700',
  SILVER: 'ring-gray-400',
  GOLD: 'ring-yellow-500',
  PLATINUM: 'ring-cyan-500',
  DIAMOND: 'ring-blue-500',
  LEGEND: 'ring-orange-500',
}

export default function UserAvatar({ src, name, tier, isOnline = false, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
  }

  const ringColor = tierRingColors[tier] || 'ring-gray-500'
  const sizeClass = sizeClasses[size] || sizeClasses.md

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      <div className={`${sizeClass} rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center overflow-hidden ring-2 ${ringColor} ring-offset-2 ring-offset-[var(--mm-bg-primary)]`}>
        {src ? (
          <img src={src} alt={name || 'User'} className="w-full h-full object-cover" />
        ) : (
          <User size={size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 22 : 30} className="text-[var(--mm-text-muted)]" />
        )}
      </div>
      {isOnline && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--mm-accent-green)] border-2 border-[var(--mm-bg-primary)] rounded-full" />
      )}
    </div>
  )
}

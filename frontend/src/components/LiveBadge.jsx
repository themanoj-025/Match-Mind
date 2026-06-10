import React from 'react'

export default function LiveBadge({ minute, size = 'md' }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <div className={`rounded-full bg-[var(--mm-accent-green)] ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
        <div className={`absolute inset-0 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
      </div>
      <span className={`font-semibold text-[var(--mm-accent-green)] ${size === 'sm' ? 'caption' : 'caption'}`}>LIVE</span>
      {minute !== undefined && (
        <span className="caption text-[var(--mm-text-muted)]">{minute}&apos;</span>
      )}
    </div>
  )
}

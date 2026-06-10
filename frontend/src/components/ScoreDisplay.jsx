import React, { useEffect, useState } from 'react'

export default function ScoreDisplay({ home, away, status, animate = true, size = 'default' }) {
  const [flash, setFlash] = useState({ home: false, away: false })
  const [prevHome, setPrevHome] = useState(home)
  const [prevAway, setPrevAway] = useState(away)

  useEffect(() => {
    if (animate && home !== prevHome) {
      setFlash({ home: true, away: false })
      setPrevHome(home)
      setTimeout(() => setFlash({ home: false, away: false }), 600)
    }
    if (animate && away !== prevAway) {
      setFlash({ home: false, away: true })
      setPrevAway(away)
      setTimeout(() => setFlash({ home: false, away: false }), 600)
    }
  }, [home, away, animate, prevHome, prevAway])

  const sizeClasses = size === 'large'
    ? 'text-5xl sm:text-6xl'
    : size === 'xl'
      ? 'text-6xl sm:text-7xl'
      : 'text-2xl sm:text-3xl'

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span
        className={`font-bold ${sizeClasses} font-[var(--font-display)] tracking-tight transition-all duration-300 ${
          flash.home ? 'text-[var(--mm-accent-green)] scale-110' : 'text-[var(--mm-text-primary)]'
        }`}
      >
        {home ?? '-'}
      </span>
      <span className={`text-[var(--mm-text-muted)] ${size === 'large' ? 'text-2xl' : 'text-lg'}`}>:</span>
      <span
        className={`font-bold ${sizeClasses} font-[var(--font-display)] tracking-tight transition-all duration-300 ${
          flash.away ? 'text-[var(--mm-accent-green)] scale-110' : 'text-[var(--mm-text-primary)]'
        }`}
      >
        {away ?? '-'}
      </span>
    </div>
  )
}

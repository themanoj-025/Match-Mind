/**
 * DraftTimer — Pick timer countdown
 *
 * Displays the remaining time for the current choice round.
 * Uses a circular progress bar that turns red under 5 seconds.
 * Server-authoritative: reads expiresAt from the API response.
 */

import { useState, useEffect, useRef } from 'react'

interface DraftTimerProps {
  expiresAt: string | null
  onExpired?: () => void
  totalSeconds?: number
}

export default function DraftTimer({ expiresAt, onExpired, totalSeconds = 20 }: DraftTimerProps) {
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [progress, setProgress] = useState(100)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft(totalSeconds)
      setProgress(100)
      expiredRef.current = false
      return
    }

    const updateTimer = () => {
      const endsAt = new Date(expiresAt).getTime()
      const diff = Math.max(0, Math.floor((endsAt - Date.now()) / 1000))
      setTimeLeft(diff)
      setProgress((diff / totalSeconds) * 100)

      if (diff <= 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpired?.()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 200)
    return () => clearInterval(interval)
  }, [expiresAt, totalSeconds, onExpired])

  const isUrgent = timeLeft <= 5
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="timer"
      aria-live="assertive"
      aria-label={`${timeLeft} seconds remaining for this pick`}
    >
      <svg width="68" height="68" className="transform -rotate-90">
        <circle cx="34" cy="34" r="28" fill="none" stroke="var(--mm-bg-tertiary)" strokeWidth="4" />
        <circle
          cx="34"
          cy="34"
          r="28"
          fill="none"
          stroke={isUrgent ? 'var(--mm-accent-red)' : 'var(--mm-accent-green)'}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-200 ${isUrgent ? 'animate-glow-pulse' : ''}`}
          style={{ transition: 'stroke-dashoffset 0.2s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-bold text-lg font-mono ${
            isUrgent ? 'text-[var(--mm-accent-red)]' : 'text-[var(--mm-text-primary)]'
          }`}
        >
          {timeLeft}
        </span>
      </div>
    </div>
  )
}

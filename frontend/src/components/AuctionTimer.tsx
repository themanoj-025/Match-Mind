/**
 * AuctionTimer — MatchMind
 *
 * Circular countdown timer that reads timerEndsAt from ROOM_STATE_SYNC.
 * Server is the single source of truth for timerEndsAt; client only renders
 * countdown from the value it's given.
 *
 * Features:
 * - Circular SVG progress ring
 * - Pulses red under anti-snipe threshold (≤5s)
 * - ARIA live region for screen readers
 * - Respects prefers-reduced-motion
 */
import { useState, useEffect, useRef } from 'react'

interface AuctionTimerProps {
  timerEndsAt: string | null
  phase: string
  totalSeconds?: number
  onExpired?: () => void
}

export default function AuctionTimer({
  timerEndsAt,
  phase,
  totalSeconds = 15,
  onExpired,
}: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [progress, setProgress] = useState(100)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (!timerEndsAt || phase !== 'PLAYER_LIVE') {
      setTimeLeft(0)
      setProgress(100)
      expiredRef.current = false
      return
    }

    const updateTimer = () => {
      const endsAt = new Date(timerEndsAt).getTime()
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
  }, [timerEndsAt, phase, totalSeconds, onExpired])

  if (phase !== 'PLAYER_LIVE') return null

  const isUrgent = timeLeft <= 5
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative flex items-center gap-2" role="timer" aria-live="assertive" aria-label={`${timeLeft} seconds remaining`}>
      {/* Circular SVG */}
      <svg width="80" height="80" className="transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="var(--mm-bg-tertiary)"
          strokeWidth="4"
        />
        <circle
          cx="40"
          cy="40"
          r="36"
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

      {/* Center number */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-bold text-xl font-mono ${
            isUrgent ? 'text-[var(--mm-accent-red)]' : 'text-[var(--mm-text-primary)]'
          }`}
        >
          {timeLeft}
        </span>
      </div>

      {/* Label */}
      <span className="caption text-[var(--mm-text-muted)] sr-only">seconds</span>
    </div>
  )
}

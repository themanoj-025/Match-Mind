// @ts-nocheck
/**
 * ComingSoonTeaser — MatchMind v2 §3.5
 *
 * Hero section for ANNOUNCED tournaments showing tournament branding,
 * countdown timer, and "Notify me" button.
 */

import { useState, useEffect } from 'react'
import { Bell, Calendar, Users, MapPin } from 'lucide-react'
import type { Tournament } from '../lib/types'

interface ComingSoonTeaserProps {
  tournament: Tournament
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const target = new Date(targetDate + 'T00:00:00Z').getTime()

    const tick = () => {
      const now = Date.now()
      const diff = target - now
      if (diff <= 0) { setTimeLeft('Starts soon!'); return }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft(`${days}d ${hours}h ${minutes}m`)
    }

    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [targetDate])

  return <span className="tabular-nums">{timeLeft}</span>
}

export default function ComingSoonTeaser({ tournament }: ComingSoonTeaserProps) {
  const [notified, setNotified] = useState(false)

  const handleNotify = async () => {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tournamentId: tournament.id }),
      })
      setNotified(true)
    } catch {
      // silently fail
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)]"
      style={{
        background: `linear-gradient(135deg, ${tournament.theme.primary}22 0%, ${tournament.theme.primary}44 100%)`,
        borderColor: tournament.theme.accent + '44',
      }}
    >
      {/* Decorative gradient orb */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${tournament.theme.accent}, transparent)` }}
      />

      <div className="relative z-10 p-8 sm:p-12">
        {/* Badge */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-full)] text-xs font-semibold mb-4"
          style={{
            background: tournament.theme.accent + '22',
            color: tournament.theme.accent,
            border: `1px solid ${tournament.theme.accent}44`,
          }}
        >
          <Calendar size={12} /> Coming Soon
        </span>

        {/* Tournament name */}
        <h1
          className="text-3xl sm:text-4xl font-bold mb-2"
          style={{ color: tournament.theme.primary }}
        >
          {tournament.name}
        </h1>
        <p className="text-lg text-[var(--mm-text-secondary)] mb-6">
          {tournament.confederation} · {tournament.gender === 'MEN' ? "Men's" : "Women's"} · {tournament.format.replace('_', ' ')}
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-6 mb-8">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[var(--mm-text-muted)]" />
            <span className="body text-[var(--mm-text-primary)]">{tournament.teamCount} teams</span>
          </div>
          {tournament.dateRange.start && (
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[var(--mm-text-muted)]" />
              <span className="body text-[var(--mm-text-primary)]">
                {new Date(tournament.dateRange.start + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                {tournament.dateRange.end && (
                  <> – {new Date(tournament.dateRange.end + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
                )}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[var(--mm-text-muted)]" />
            <span className="body text-[var(--mm-text-primary)]">{tournament.gender === 'WOMEN' ? 'Brazil' : 'Multi-host'}</span>
          </div>
        </div>

        {/* Countdown + Notify */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {tournament.dateRange.start && (
            <div
              className="px-5 py-3 rounded-[var(--radius-lg)] text-2xl font-bold font-[var(--font-display)]"
              style={{
                background: tournament.theme.accent + '15',
                color: tournament.theme.accent,
                border: `1px solid ${tournament.theme.accent}33`,
              }}
            >
              <Countdown targetDate={tournament.dateRange.start} />
            </div>
          )}

          <button
            onClick={handleNotify}
            disabled={notified}
            className={`flex items-center gap-2 px-5 py-3 rounded-[var(--radius-md)] font-semibold transition-all ${
              notified
                ? 'bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)] cursor-default'
                : 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] hover:shadow-[var(--shadow-glow-green)]'
            }`}
          >
            <Bell size={16} />
            {notified ? "We'll notify you!" : 'Notify me when drafting opens'}
          </button>
        </div>
      </div>
    </div>
  )
}


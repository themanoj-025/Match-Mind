import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, Trophy, UserPlus, Zap, CheckCheck } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/profile/me" className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body transition-colors">
            <ArrowLeft size={16} /> Notifications
          </Link>
          <button className="flex items-center gap-1 caption text-[var(--mm-accent-green)] font-medium hover:underline">
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { icon: Trophy, text: 'You moved up to #234 on the global leaderboard!', time: '2m ago', color: 'text-[var(--mm-accent-amber)]' },
            { icon: Zap, text: 'Prediction locked: Man City vs Arsenal', time: '15m ago', color: 'text-[var(--mm-accent-green)]' },
            { icon: UserPlus, text: 'SportsKing started following you', time: '1h ago', color: 'text-[var(--mm-accent-blue)]' },
          ].map((notif, i) => {
            const Icon = notif.icon
            return (
              <div key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-start gap-3 hover:bg-[var(--mm-bg-hover)] transition-colors">
                <div className={`w-9 h-9 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center ${notif.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="body">{notif.text}</p>
                  <span className="caption text-[var(--mm-text-muted)]">{notif.time}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

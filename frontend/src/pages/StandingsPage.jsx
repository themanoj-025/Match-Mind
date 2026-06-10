import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function StandingsPage() {
  const { sport } = useParams()
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/explore" className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6"><ArrowLeft size={16} /> Back</Link>
        <h1 className="heading-1 mb-6 capitalize">{sport?.replace(/_/g, ' ')} Standings</h1>
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pos) => (
            <div key={pos} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)]">
              <span className="body font-bold text-[var(--mm-text-muted)] w-6">{pos}</span>
              <div className="w-7 h-7 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center text-xs font-bold">T</div>
              <span className="body flex-1">Team {pos}</span>
              <span className="body text-[var(--mm-text-muted)]">P {pos + 18}</span>
              <span className="body text-[var(--mm-accent-green)]">+{45 - pos}</span>
              <span className="body font-bold">{60 - pos * 2}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PlayerPage() {
  const { playerId } = useParams()
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/explore" className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6"><ArrowLeft size={16} /> Back</Link>
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center text-2xl font-bold text-[var(--mm-text-inverse)]">P</div>
            <div><h1 className="heading-2">Player Name</h1><span className="caption text-[var(--mm-text-muted)]">#10 • Forward • Team Name</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Users } from 'lucide-react'

export default function TeamPage() {
  const { teamId } = useParams()
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/explore" className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6"><ArrowLeft size={16} /> Back</Link>
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center text-xl font-bold">T</div>
            <div><h1 className="heading-2">Team Name</h1><span className="caption text-[var(--mm-text-muted)]">Premier League • Football</span></div>
          </div>
          <div className="flex items-center gap-4"><Users size={16} className="text-[var(--mm-text-muted)]" /><span className="body text-[var(--mm-text-secondary)]">3,421 fans following</span></div>
        </div>
        <h2 className="heading-3 mb-4">Upcoming Fixtures</h2>
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">Team schedule will appear here</div>
      </div>
    </div>
  )
}

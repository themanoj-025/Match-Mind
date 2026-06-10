import React from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Search, Users, Trophy } from 'lucide-react'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/explore" className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6"><ArrowLeft size={16} /> Back</Link>
        <h1 className="heading-1 mb-2">Search Results</h1>
        <p className="body text-[var(--mm-text-secondary)] mb-6">Showing results for "{query}"</p>
        {query && (
          <div className="flex flex-col gap-3">
            <section className="mb-4"><h2 className="heading-3 mb-3">Matches</h2><div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center text-[var(--mm-text-muted)]"><p className="body">No matches found</p></div></section>
            <section className="mb-4"><h2 className="heading-3 mb-3">Users</h2><div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center text-[var(--mm-text-muted)]"><p className="body">No users found</p></div></section>
            <section><h2 className="heading-3 mb-3">Teams</h2><div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center text-[var(--mm-text-muted)]"><p className="body">No teams found</p></div></section>
          </div>
        )}
      </div>
    </div>
  )
}

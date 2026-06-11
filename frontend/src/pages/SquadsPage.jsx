import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users } from 'lucide-react'
import { useMySquads } from '../hooks/useApi'

export default function SquadsPage() {
  const { data: mySquads = [], isLoading } = useMySquads()

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-1">Squads</h1>
          <button className="flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-4 py-2.5 rounded-[var(--radius-md)]">
            <Plus size={18} /> Create Squad
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-[var(--mm-text-muted)]">
            <p className="body">Loading squads...</p>
          </div>
        ) : mySquads.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySquads.map((squad) => (
              <Link key={squad.id} to={`/squads/${squad.id}`} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--mm-accent-purple)] to-[var(--mm-accent-blue)] flex items-center justify-center">
                    <Users size={18} className="text-[var(--mm-text-inverse)]" />
                  </div>
                  <div>
                    <span className="body font-semibold">{squad.name}</span>
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-[var(--mm-text-muted)]" />
                      <span className="caption text-[var(--mm-text-muted)]">{squad.memberCount || squad.members?.length || 0} members</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)]">
            <Users size={32} className="mx-auto mb-3 text-[var(--mm-text-muted)] opacity-50" />
            <p className="body text-[var(--mm-text-muted)]">No squads yet</p>
            <p className="caption text-[var(--mm-text-muted)] mt-1">Create a squad to compete with friends</p>
          </div>
        )}
      </div>
    </div>
  )
}

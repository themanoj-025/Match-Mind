import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, MessageCircle, TrendingUp } from 'lucide-react'

export default function SquadsPage() {
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-1">Squads</h1>
          <button className="flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-4 py-2.5 rounded-[var(--radius-md)]">
            <Plus size={18} /> Create Squad
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'The Undefeatables', members: 8, activity: 'Very active' },
            { name: 'Weekend Warriors', members: 5, activity: 'Active' },
            { name: 'Fantasy Kings', members: 12, activity: 'Active' },
          ].map((squad, i) => (
            <Link key={i} to={`/squads/squad-${i}`} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--mm-accent-purple)] to-[var(--mm-accent-blue)] flex items-center justify-center">
                  <Users size={18} className="text-[var(--mm-text-inverse)]" />
                </div>
                <div>
                  <span className="body font-semibold">{squad.name}</span>
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-[var(--mm-text-muted)]" />
                    <span className="caption text-[var(--mm-text-muted)]">{squad.members} members</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${squad.activity === 'Very active' ? 'bg-[var(--mm-accent-green)]' : 'bg-[var(--mm-accent-amber)]'}`} />
                <span className="caption text-[var(--mm-text-muted)]">{squad.activity}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

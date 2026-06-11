import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Users, Trophy, Lock, Globe } from 'lucide-react'
import { useMyLeagues } from '../hooks/useApi'

export default function LeaguesPage() {
  const { data: myLeagues = [], isLoading } = useMyLeagues()

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="heading-1">Leagues</h1>
          <Link to="/leagues/create" className="flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-4 py-2.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300">
            <Plus size={18} />
            Create League
          </Link>
        </div>

        {/* My Leagues */}
        <section className="mb-8">
          <h2 className="heading-2 mb-4">My Leagues</h2>
          {isLoading ? (
            <div className="text-center py-8 text-[var(--mm-text-muted)]">
              <p className="body">Loading leagues...</p>
            </div>
          ) : myLeagues.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {myLeagues.map((league, i) => (
                <Link key={league.id || i} to={`/leagues/${league.id}`} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--mm-accent-green)] to-[var(--mm-accent-blue)] flex items-center justify-center">
                        <Trophy size={18} className="text-[var(--mm-text-inverse)]" />
                      </div>
                      <div>
                        <span className="body font-semibold">{league.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="caption text-[var(--mm-text-muted)]">{league.isPublic ? <Globe size={12} /> : <Lock size={12} />}</span>
                          <span className="caption text-[var(--mm-text-muted)]">{league.sport?.toLowerCase() || 'mixed'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="caption text-[var(--mm-text-muted)]"><Users size={14} className="inline mr-1" />{league.members?.length || league._count?.members || 0} members</span>
                    {league.members?.find(m => m.userId === 'you')?.rank && (
                      <span className="caption font-medium text-[var(--mm-accent-amber)]">Rank #{league.members.find(m => m.userId === 'you').rank}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)]">
              <Trophy size={32} className="mx-auto mb-3 text-[var(--mm-text-muted)] opacity-50" />
              <p className="body text-[var(--mm-text-muted)]">No leagues yet</p>
              <p className="caption text-[var(--mm-text-muted)] mt-1">Create or join a league to start competing</p>
            </div>
          )}
        </section>

        {/* Discover Public Leagues - placeholder until backend supports discovery */}
        <section>
          <h2 className="heading-2 mb-4">Discover Public Leagues</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { name: 'Champions League Special', members: 156, sport: 'football' },
              { name: 'NBA 2025 Season', members: 89, sport: 'basketball' },
              { name: 'Tennis Grand Slam Club', members: 45, sport: 'tennis' },
            ].map((league, i) => (
              <div key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="body font-semibold">{league.name}</span>
                    <span className="caption text-[var(--mm-text-muted)] block">{league.sport}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="caption text-[var(--mm-text-muted)]"><Users size={14} className="inline mr-1" />{league.members} members</span>
                  <button className="caption font-semibold text-[var(--mm-accent-green)] hover:underline">Join</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

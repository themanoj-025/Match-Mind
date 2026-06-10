import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import SportBadge from '../components/SportBadge'

const sports = [
  { id: 'all', label: 'All', icon: '🏆' },
  { id: 'football', label: 'Football', icon: '⚽' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'american_football', label: 'NFL', icon: '🏈' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
  { id: 'cricket', label: 'Cricket', icon: '🏏' },
  { id: 'hockey', label: 'Hockey', icon: '🏒' },
]

const competitions = {
  football: [
    { name: 'Premier League', logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'La Liga', logo: '🇪🇸' },
    { name: 'Serie A', logo: '🇮🇹' },
    { name: 'Bundesliga', logo: '🇩🇪' },
    { name: 'Champions League', logo: '⭐' },
  ],
  basketball: [{ name: 'NBA', logo: '🏀' }, { name: 'NCAA', logo: '🏀' }],
}

export default function ScoresPage() {
  const { sport: sportParam } = useParams()
  const [activeSport, setActiveSport] = useState(sportParam || 'all')
  const [dateOffset, setDateOffset] = useState(0)

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h1 className="heading-1 mb-6">Scores & Fixtures</h1>

        {/* Sport Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {sports.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setActiveSport(sport.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all duration-200 ${
                activeSport === sport.id
                  ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                  : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
              }`}
            >
              <span>{sport.icon}</span>
              <span>{sport.label}</span>
            </button>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setDateOffset((d) => d - 1)} className="p-2 rounded-[var(--radius-md)] bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-2 bg-[var(--mm-bg-tertiary)] px-4 py-2 rounded-[var(--radius-md)]">
            <Calendar size={16} className="text-[var(--mm-accent-green)]" />
            <span className="body font-medium">
              {dateOffset === 0 ? 'Today' : dateOffset === 1 ? 'Tomorrow' : new Date(Date.now() + dateOffset * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <button onClick={() => setDateOffset((d) => d + 1)} className="p-2 rounded-[var(--radius-md)] bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Competition Sections */}
            {Object.entries(competitions).map(([sportKey, comps]) => (
              (activeSport === 'all' || activeSport === sportKey) && comps.map((comp, ci) => (
                <section key={`${sportKey}-${ci}`} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{comp.logo}</span>
                    <h2 className="heading-3">{comp.name}</h2>
                    <SportBadge sport={sportKey} size="sm" showLabel={false} />
                  </div>

                  <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Link
                        key={i}
                        to={`/live/match-${sportKey}-${ci}-${i}`}
                        className="flex items-center gap-3 sm:gap-4 px-4 py-3.5 border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--mm-bg-hover)] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold">H</span>
                          </div>
                          <span className="body font-medium truncate">Home Team {i}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {i === 1 ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
                              <span className="body font-bold text-[var(--mm-accent-green)]">2 - 1</span>
                              <span className="caption text-[var(--mm-text-muted)]">67'</span>
                            </>
                          ) : i === 2 ? (
                            <span className="caption font-semibold text-[var(--mm-text-muted)] bg-[var(--mm-bg-tertiary)] px-2 py-0.5 rounded-[var(--radius-sm)]">FT</span>
                          ) : (
                            <span className="body font-medium text-[var(--mm-text-muted)]">{18 + (i * 2)}:00</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                          <span className="body font-medium truncate">Away Team {i}</span>
                          <div className="w-7 h-7 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold">A</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))
            ))}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Competitions</h3>
              {['Premier League', 'La Liga', 'NBA', 'NFL', 'Champions League'].map((league) => (
                <label key={league} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-[var(--mm-bg-hover)] rounded-[var(--radius-sm)] px-2 -mx-2">
                  <input type="checkbox" defaultChecked className="accent-[var(--mm-accent-green)] w-4 h-4" />
                  <span className="body">{league}</span>
                </label>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

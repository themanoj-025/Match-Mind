import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Globe, Lock } from 'lucide-react'

export default function CreateLeaguePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', sports: [], isPublic: true })

  const sports = ['football', 'basketball', 'american_football', 'tennis', 'cricket', 'hockey']

  const toggleSport = (sport) => {
    setForm((f) => ({
      ...f,
      sports: f.sports.includes(sport) ? f.sports.filter((s) => s !== sport) : [...f.sports, sport],
    }))
  }

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="heading-1 mb-6">Create League</h1>

        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8">
          <div className="flex flex-col gap-5">
            {/* League Name */}
            <div>
              <label className="caption font-medium text-[var(--mm-text-secondary)] mb-1.5 block">League Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Enter league name..."
                className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none"
              />
            </div>

            {/* Sport Focus */}
            <div>
              <label className="caption font-medium text-[var(--mm-text-secondary)] mb-2 block">Sport Focus (multi-select)</label>
              <div className="grid grid-cols-2 gap-2">
                {sports.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => toggleSport(sport)}
                    className={`px-4 py-2.5 rounded-[var(--radius-md)] body text-left transition-all duration-200 ${
                      form.sports.includes(sport)
                        ? 'bg-[var(--mm-accent-green)]/10 border border-[var(--border-active)] text-[var(--mm-accent-green)]'
                        : 'bg-[var(--mm-bg-tertiary)] border border-[var(--border-subtle)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
                    }`}
                  >
                    {sport === 'football' && '⚽ '}
                    {sport === 'basketball' && '🏀 '}
                    {sport === 'american_football' && '🏈 '}
                    {sport === 'tennis' && '🎾 '}
                    {sport === 'cricket' && '🏏 '}
                    {sport === 'hockey' && '🏒 '}
                    {sport.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Public/Private */}
            <div>
              <label className="caption font-medium text-[var(--mm-text-secondary)] mb-2 block">League Type</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setForm((f) => ({ ...f, isPublic: true }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-md)] body transition-all duration-200 ${
                    form.isPublic
                      ? 'bg-[var(--mm-accent-green)]/10 border border-[var(--border-active)] text-[var(--mm-accent-green)]'
                      : 'bg-[var(--mm-bg-tertiary)] border border-[var(--border-subtle)] text-[var(--mm-text-secondary)]'
                  }`}
                >
                  <Globe size={18} /> Public
                </button>
                <button
                  onClick={() => setForm((f) => ({ ...f, isPublic: false }))}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-[var(--radius-md)] body transition-all duration-200 ${
                    !form.isPublic
                      ? 'bg-[var(--mm-accent-green)]/10 border border-[var(--border-active)] text-[var(--mm-accent-green)]'
                      : 'bg-[var(--mm-bg-tertiary)] border border-[var(--border-subtle)] text-[var(--mm-text-secondary)]'
                  }`}
                >
                  <Lock size={18} /> Private
                </button>
              </div>
            </div>

            {/* Scoring Rules */}
            <div>
              <label className="caption font-medium text-[var(--mm-text-secondary)] mb-2 block">Scoring Rules</label>
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 rounded-[var(--radius-md)] body bg-[var(--mm-accent-green)]/10 border border-[var(--border-active)] text-[var(--mm-accent-green)]">
                  Standard
                </button>
                <button className="flex-1 px-4 py-3 rounded-[var(--radius-md)] body bg-[var(--mm-bg-tertiary)] border border-[var(--border-subtle)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]">
                  Custom
                </button>
              </div>
            </div>

            <button className="w-full bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] body font-semibold py-3.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300 mt-2">
              Create League
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

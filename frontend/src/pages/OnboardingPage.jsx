import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, Check } from 'lucide-react'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedSports, setSelectedSports] = useState([])
  const navigate = useNavigate()

  const sports = [
    { id: 'football', label: 'Football', icon: '⚽' },
    { id: 'basketball', label: 'Basketball', icon: '🏀' },
    { id: 'american_football', label: 'NFL', icon: '🏈' },
    { id: 'tennis', label: 'Tennis', icon: '🎾' },
    { id: 'cricket', label: 'Cricket', icon: '🏏' },
    { id: 'hockey', label: 'Hockey', icon: '🏒' },
  ]

  const toggleSport = (id) => {
    setSelectedSports((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  const handleComplete = () => {
    navigate('/feed')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 h-1 rounded-full bg-[var(--mm-bg-tertiary)] overflow-hidden">
              <div className={`h-full bg-[var(--mm-accent-green)] transition-all duration-500 ${s <= step ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="text-center">
            <h1 className="display-l mb-4">Choose your sports</h1>
            <p className="body-large text-[var(--mm-text-secondary)] mb-8">Select the sports you follow</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {sports.map((sport) => (
                <button key={sport.id} onClick={() => toggleSport(sport.id)} className={`p-4 rounded-[var(--radius-lg)] border transition-all duration-200 ${
                  selectedSports.includes(sport.id) ? 'bg-[var(--mm-accent-green)]/10 border-[var(--border-active)]' : 'bg-[var(--mm-bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-active)]'
                }`}>
                  <span className="text-3xl block mb-2">{sport.icon}</span>
                  <span className="body font-medium">{sport.label}</span>
                  {selectedSports.includes(sport.id) && <Check size={16} className="text-[var(--mm-accent-green)] mx-auto mt-1" />}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-8 py-3.5 rounded-[var(--radius-md)] inline-flex items-center gap-2">
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <h1 className="display-l mb-4">Pick your teams</h1>
            <p className="body-large text-[var(--mm-text-secondary)] mb-8">Search and select your favourite teams</p>
            <input type="text" placeholder="Search teams..." className="w-full bg-[var(--mm-bg-secondary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-lg)] px-4 py-3 mb-8 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none" />
            <button onClick={() => setStep(3)} className="bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-8 py-3.5 rounded-[var(--radius-md)] inline-flex items-center gap-2">
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <h1 className="display-l mb-4">Set up your profile</h1>
            <p className="body-large text-[var(--mm-text-secondary)] mb-8">Choose your username and avatar</p>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center text-3xl font-bold text-[var(--mm-text-inverse)]">Y</div>
            <input type="text" placeholder="Username" className="w-full bg-[var(--mm-bg-secondary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-lg)] px-4 py-3 mb-8 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none" />
            <button onClick={() => setStep(4)} className="bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-8 py-3.5 rounded-[var(--radius-md)] inline-flex items-center gap-2">
              Continue <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <h1 className="display-l mb-4">Follow top predictors</h1>
            <p className="body-large text-[var(--mm-text-secondary)] mb-8">Get inspired by the best</p>
            {[
              { name: 'SportsKing', pts: 8420 },
              { name: 'GoalPredictor', pts: 7910 },
              { name: 'HoopsMaster', pts: 7650 },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center text-sm font-bold text-[var(--mm-text-inverse)]">{p.name.charAt(0)}</div>
                <span className="body flex-1">{p.name}</span>
                <span className="caption text-[var(--mm-accent-amber)]">🪙 {p.pts.toLocaleString()}</span>
                <button className="caption font-semibold text-[var(--mm-accent-green)] px-3 py-1 rounded-[var(--radius-sm)] bg-[var(--mm-accent-green)]/10">Follow</button>
              </div>
            ))}
            <button onClick={handleComplete} className="mt-6 bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] body font-semibold px-8 py-3.5 rounded-[var(--radius-md)] inline-flex items-center gap-2">
              Start Predicting <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

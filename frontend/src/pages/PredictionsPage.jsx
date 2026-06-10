import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Zap, Trophy, Flame } from 'lucide-react'
import PredictionCard from '../components/PredictionCard'

export default function PredictionsPage() {
  const [activeTab, setActiveTab] = useState('open')

  const tabs = [
    { id: 'open', label: 'Open Predictions' },
    { id: 'results', label: 'Results' },
    { id: 'all', label: 'All Time' },
  ]

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Header Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={18} className="text-[var(--mm-accent-green)]" />
            </div>
            <span className="heading-2 text-[var(--mm-accent-green)]">0%</span>
            <span className="caption text-[var(--mm-text-muted)] block">Accuracy</span>
          </div>
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={18} className="text-[var(--mm-accent-amber)]" />
            </div>
            <span className="heading-2 text-[var(--mm-accent-amber)]">0</span>
            <span className="caption text-[var(--mm-text-muted)] block">Total Points</span>
          </div>
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={18} className="text-[var(--mm-accent-red)]" />
            </div>
            <span className="heading-2 text-[var(--mm-accent-red)]">0</span>
            <span className="caption text-[var(--mm-text-muted)] block">Streak</span>
          </div>
          <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy size={18} className="text-[var(--mm-accent-purple)]" />
            </div>
            <span className="heading-2 text-[var(--mm-accent-purple)]">—</span>
            <span className="caption text-[var(--mm-text-muted)] block">Rank</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-[var(--radius-md)] body transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                  : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'open' && (
              <section>
                <h2 className="heading-2 mb-4">Open to Predict</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Link key={i} to={`/predictions/new/${i}`} className="block">
                      <PredictionCard
                        match={{
                          homeTeam: `Home Team ${i}`,
                          awayTeam: `Away Team ${i}`,
                          competition: 'Premier League',
                          sport: 'football',
                          scheduledAt: new Date(Date.now() + (i * 7200000)).toISOString(),
                        }}
                        prediction={null}
                        result={{ status: 'PENDING' }}
                      />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'results' && (
              <section>
                <h2 className="heading-2 mb-4">Recent Results</h2>
                <div className="flex flex-col gap-3">
                  <div className="text-center py-12 text-[var(--mm-text-muted)]">
                    <p className="body">No predictions have been scored yet</p>
                    <p className="caption mt-1">Start predicting to see your results here</p>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'all' && (
              <section>
                <h2 className="heading-2 mb-4">All Predictions</h2>
                <div className="text-center py-12 text-[var(--mm-text-muted)]">
                  <p className="body">Your prediction history will appear here</p>
                  <Link to="/live" className="text-[var(--mm-accent-green)] body font-medium mt-2 inline-block hover:underline">Browse live matches</Link>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            {/* Accuracy Chart */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 mb-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Monthly Accuracy</h3>
              <div className="h-32 flex items-end gap-2">
                {[40, 55, 35, 60, 45, 50, 65, 70, 55, 60, 50, 45].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[var(--gradient-live)] rounded-t-[var(--radius-sm)] transition-all duration-500"
                      style={{ height: `${val}%` }}
                    />
                    <span className="caption text-[var(--mm-text-muted)]">
                      {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Predict */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Next 24h</h3>
              <div className="flex flex-col gap-2">
                {[
                  { match: 'Chelsea vs Liverpool', time: '20:00' },
                  { match: 'Real Madrid vs Barcelona', time: '21:00' },
                ].map((item, i) => (
                  <Link key={i} to={`/predictions/new/${i + 1}`} className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-colors">
                    <span className="body">{item.match}</span>
                    <span className="caption text-[var(--mm-accent-amber)] font-medium">{item.time}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

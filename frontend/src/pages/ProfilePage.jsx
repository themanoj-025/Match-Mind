import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { MapPin, Calendar, Users, Trophy, Target, Flame } from 'lucide-react'
import PredictionCard from '../components/PredictionCard'

export default function ProfilePage() {
  const { userId } = useParams()

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>SportsKing (@sportsking) — Profile & Stats | MatchMind</title>
        <meta name="description" content="SportsKing — 78% accuracy, 8,420 pts, #1 Global. View prediction history, achievements, and stats on MatchMind." />
        <meta property="og:title" content="SportsKing (@sportsking) — MatchMind Profile" />
        <meta property="og:description" content="🎯 78% Accuracy • 🪙 8,420 pts • 🏆 #1 Global • 🔥 12-day streak" />
        <meta property="og:image" content="https://matchmind.gg/og-profile.jpg" />
        <meta property="og:image:alt" content="SportsKing — MatchMind Profile" />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`/profile/${userId}`} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="SportsKing (@sportsking) — MatchMind Profile" />
        <meta name="twitter:description" content="Top predictor on MatchMind with 8,420 points and 78% accuracy." />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cover & Avatar */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden mb-6">
          <div className="h-32 sm:h-48 bg-gradient-to-r from-[var(--mm-accent-green)]/20 to-[var(--mm-accent-blue)]/20" />
          <div className="px-6 pb-6 -mt-12 sm:-mt-16">
            <div className="flex items-end gap-4 mb-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center border-4 border-[var(--mm-bg-secondary)] text-2xl font-bold text-[var(--mm-text-inverse)]">
                S
              </div>
              <div className="pb-1 flex-1">
                <h1 className="heading-2">SportsKing</h1>
                <span className="caption text-[var(--mm-text-muted)]">@sportsking</span>
              </div>
              <button className="bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-5 py-2 rounded-[var(--radius-md)]">Follow</button>
            </div>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <span className="body text-[var(--mm-text-secondary)]">🎯 78% Accuracy</span>
              <span className="body text-[var(--mm-accent-amber)]">🪙 8,420 pts</span>
              <span className="body text-[var(--mm-text-secondary)]">🏆 #1 Global</span>
              <span className="body text-[var(--mm-text-secondary)]">🔥 12-day streak</span>
            </div>
          </div>
        </div>

        {/* Recent Predictions */}
        <h2 className="heading-3 mb-4">Recent Predictions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <PredictionCard
              key={i}
              match={{ homeTeam: `Team ${i}`, awayTeam: `Team ${i + 4}`, competition: 'Premier League', sport: 'football', scheduledAt: new Date().toISOString() }}
              prediction={{ homeGoals: 2, awayGoals: 1 }}
              result={{ status: i % 2 === 0 ? 'CORRECT' : 'MISSED', points: i % 2 === 0 ? 50 : 0 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

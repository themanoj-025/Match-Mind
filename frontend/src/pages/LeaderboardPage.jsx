import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Trophy, TrendingUp, Users, Crown } from 'lucide-react'
import LeaderboardRow from '../components/LeaderboardRow'
import { useLeaderboard, useLeaderboardSport } from '../hooks/useApi'

const tiers = {
  BRONZE: { label: 'Bronze', color: 'from-amber-700 to-amber-500', min: 0 },
  SILVER: { label: 'Silver', color: 'from-gray-400 to-gray-200', min: 500 },
  GOLD: { label: 'Gold', color: 'from-yellow-500 to-yellow-300', min: 2000 },
  PLATINUM: { label: 'Platinum', color: 'from-cyan-500 to-cyan-300', min: 5000 },
  DIAMOND: { label: 'Diamond', color: 'from-blue-500 to-purple-500', min: 10000 },
  LEGEND: { label: 'Legend', color: 'from-orange-500 to-red-500', min: 25000 },
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState('week')

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Time' },
    { id: 'sport', label: 'By Sport' },
  ]

  const { data: topUsers = [] } = useLeaderboard(
    period === 'week' ? 'week' : period === 'month' ? 'global' : 'global'
  )
  const { data: sportUsers = [] } = useLeaderboardSport(
    period === 'sport' ? 'football' : null
  )

  const displayUsers = period === 'sport' ? sportUsers : topUsers

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <Helmet>
        <title>Leaderboard — Top Predictors This Week | MatchMind</title>
        <meta name="description" content="Global prediction leaderboard. SportsKing leads with 8,420 pts and 78% accuracy. Compare your stats and climb the ranks." />
        <meta property="og:title" content="Leaderboard — Top Predictors | MatchMind" />
        <meta property="og:description" content="Top predictors: SportsKing (8,420 pts), GoalPredictor (7,910 pts), HoopsMaster (7,650 pts). Can you beat them?" />
        <meta property="og:image" content="https://matchmind.gg/og-leaderboard.jpg" />
        <meta property="og:image:alt" content="Leaderboard — MatchMind" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/leaderboard" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Leaderboard — Top Predictors | MatchMind" />
        <meta name="twitter:description" content="Compete with the world's best sports predictors." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-5 py-2.5 rounded-[var(--radius-md)] body whitespace-nowrap transition-all duration-200 ${
                period === p.id
                  ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                  : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* My Rank Card */}
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--gradient-predict)] flex items-center justify-center">
            <span className="font-bold text-[var(--mm-text-inverse)] text-lg">Y</span>
          </div>
          <div className="flex-1">
            <span className="body font-semibold">Your Rank</span>
            <div className="flex items-center gap-3">
              <span className="display-l text-[var(--mm-accent-green)]">—</span>
              <div className="flex items-center gap-2">
                <span className="caption text-[var(--mm-text-muted)]">🪙 0 pts</span>
                <span className="caption text-[var(--mm-text-muted)]">🎯 0% acc</span>
              </div>
            </div>
          </div>
          <Link to="/predictions" className="body text-[var(--mm-accent-green)] font-medium hover:underline">View predictions</Link>
        </div>

        {/* TOP 3 Podium */}
        <div className="flex items-end justify-center gap-3 sm:gap-6 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-200 flex items-center justify-center relative">
              <span className="font-bold text-2xl text-[var(--mm-text-inverse)]">2</span>
              <span className="absolute -top-1 -right-1 text-lg">🥈</span>
            </div>
            <span className="body font-semibold">GoalPredictor</span>
            <span className="caption text-[var(--mm-accent-amber)]">🪙 7,910</span>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center gap-2 -mt-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-300 flex items-center justify-center relative animate-glow-pulse">
              <span className="font-bold text-3xl text-[var(--mm-text-inverse)]">1</span>
              <span className="absolute -top-1 -right-1 text-2xl">👑</span>
            </div>
            <span className="heading-3">SportsKing</span>
            <span className="body text-[var(--mm-accent-amber)]">🪙 8,420</span>
            <span className="caption text-[var(--mm-text-muted)]">🔥 12 streak</span>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-700 to-amber-500 flex items-center justify-center relative">
              <span className="font-bold text-2xl text-[var(--mm-text-inverse)]">3</span>
              <span className="absolute -top-1 -right-1 text-lg">🥉</span>
            </div>
            <span className="body font-semibold">HoopsMaster</span>
            <span className="caption text-[var(--mm-accent-amber)]">🪙 7,650</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Table */}
          <div className="flex-1">
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden">
              <div className="flex flex-col gap-0.5 p-2">
                {displayUsers.slice(0, 10).map((user, i) => (
                  <LeaderboardRow
                    key={user.id || user.username || i}
                    rank={user.rank || i + 1}
                    user={{ name: user.displayName || user.name || user.username, avatar: user.avatar }}
                    points={user.points || user.totalPoints || 0}
                    accuracy={user.accuracy || user.predAccuracy || 0}
                    streak={user.streak || user.streakCurrent || 0}
                    rankChange={i < 3 ? i + 1 : i === 4 ? -1 : i === 5 ? 2 : 0}
                    isCurrentUser={false}
                    tier={user.tier || 'BRONZE'}
                  />
                ))}
                {displayUsers.length === 0 && (
                  <div className="text-center py-8 text-[var(--mm-text-muted)]">
                    <p className="body">No leaderboard data available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            {/* Friends Leaderboard */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-[var(--mm-accent-blue)]" />
                <h3 className="body font-semibold">Friends Leaderboard</h3>
              </div>
              <div className="text-center py-6 text-[var(--mm-text-muted)]">
                <p className="body">Follow friends to compare</p>
                <Link to="/explore" className="caption text-[var(--mm-accent-green)] font-medium mt-1 inline-block hover:underline">Discover users</Link>
              </div>
            </div>

            {/* Tier Info */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              <h3 className="body font-semibold mb-3">Tiers</h3>
              <div className="flex flex-col gap-1.5">
                {Object.entries(tiers).map(([key, tier]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${tier.color}`} />
                      <span className="body">{tier.label}</span>
                    </div>
                    <span className="caption text-[var(--mm-text-muted)]">{tier.min.toLocaleString()}+ pts</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy, Zap, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import MatchCard from '../components/MatchCard'
import { useMatches, useLeaderboard, useMyPredictions } from '../hooks/useApi'
import useStore from '../store/useStore'

export default function FeedPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useStore()

  const { data: allMatches = [] } = useMatches()
  const { data: topUsers = [] } = useLeaderboard('global')
  const { data: myPredictions } = useMyPredictions({ enabled: isAuthenticated })

  const pendingPredictions = myPredictions?.filter(p => p.status === 'PENDING')?.length || 0

  const liveMatches = allMatches.filter(m => m.status === 'LIVE')
  const upcomingMatches = allMatches.filter(m => m.status === 'SCHEDULED')

  const topPredictors = topUsers.slice(0, 3).map((u, i) => ({
    name: u.displayName || u.username || `User ${i + 1}`,
    pts: u.totalPoints || u.points || 0,
    rank: u.rank || i + 1,
  }))

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Welcome / Hero Banner */}
            <div className="bg-[var(--gradient-hero)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8 mb-6">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="display-l">Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!</h1>
                    {pendingPredictions > 0 && (
                      <Link to="/predictions" className="flex items-center gap-1 px-2.5 py-1 bg-[var(--mm-accent-amber)]/10 text-[var(--mm-accent-amber)] caption font-semibold rounded-[var(--radius-full)] animate-glow-pulse">
                        <Sparkles size={12} /> {pendingPredictions} pending
                      </Link>
                    )}
                  </div>
                  <p className="body-large text-[var(--mm-text-secondary)] mb-4">
                    {liveMatches.length} {liveMatches.length === 1 ? 'match is' : 'matches are'} live now.
                    {pendingPredictions > 0 ? ` You have ${pendingPredictions} ${pendingPredictions === 1 ? 'prediction' : 'predictions'} waiting.` : ' Ready to make new picks?'}
                  </p>
                  <div className="flex items-center gap-3">
                    <Link to="/live" className="inline-flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-6 py-2.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300">
                      {liveMatches.length > 0 ? 'Enter Live Rooms' : 'See Scores'} <Zap size={16} />
                    </Link>
                    {pendingPredictions > 0 && (
                      <Link to="/predictions" className="inline-flex items-center gap-2 border border-[var(--border-subtle)] text-[var(--mm-text-primary)] body font-medium px-6 py-2.5 rounded-[var(--radius-md)] hover:border-[var(--border-active)] transition-all duration-300">
                        View Predictions
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h1 className="display-l mb-2">The Internet's Sports Bar</h1>
                  <p className="body-large text-[var(--mm-text-secondary)] mb-4">
                    Live scores, real predictions, global leaderboards. Join the conversation.
                  </p>
                  <div className="flex items-center gap-3">
                    <Link to="/signup" className="inline-flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-6 py-2.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300">
                      Join for Free <Sparkles size={16} />
                    </Link>
                    <Link to="/live" className="inline-flex items-center gap-2 border border-[var(--border-subtle)] text-[var(--mm-text-primary)] body font-medium px-6 py-2.5 rounded-[var(--radius-md)] hover:border-[var(--border-active)] transition-all duration-300">
                      Watch Live
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Live Matches */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
                  Live Now
                </h2>
                <Link to="/live" className="caption text-[var(--mm-accent-green)] font-medium hover:underline">View all</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {liveMatches.slice(0, 4).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onEnterRoom={() => navigate(`/live/${match.id}`)}
                    onPredict={() => navigate(`/predictions/new/${match.id}`)}
                  />
                ))}
                {liveMatches.length === 0 && (
                  <div className="col-span-full text-center py-12 text-[var(--mm-text-muted)]">
                    <p className="body">No live matches right now</p>
                    <Link to="/live" className="text-[var(--mm-accent-green)] body font-medium mt-2 inline-block hover:underline">View upcoming matches</Link>
                  </div>
                )}
              </div>
            </section>

            {/* Upcoming */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="heading-2">Upcoming Matches</h2>
                <Link to="/scores" className="caption text-[var(--mm-accent-green)] font-medium hover:underline">Scores & Fixtures</Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {upcomingMatches.slice(0, 4).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onEnterRoom={() => navigate(`/live/${match.id}`)}
                    onPredict={() => navigate(`/predictions/new/${match.id}`)}
                  />
                ))}
                {upcomingMatches.length === 0 && (
                  <div className="col-span-full text-center py-8 text-[var(--mm-text-muted)]">
                    <p className="body">No upcoming matches</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            {/* My Stats / Quick Links */}
            {isAuthenticated ? (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 mb-4">
                <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">My Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                    <span className="block font-bold font-[var(--font-display)] text-xl text-[var(--mm-accent-amber)]">{(user?.totalPoints || 0).toLocaleString()}</span>
                    <span className="caption text-[var(--mm-text-muted)]">Points</span>
                  </div>
                  <div className="bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-md)] p-3 text-center">
                    <span className="block font-bold font-[var(--font-display)] text-xl text-[var(--mm-accent-green)]">{user?.predAccuracy || 0}%</span>
                    <span className="caption text-[var(--mm-text-muted)]">Accuracy</span>
                  </div>
                </div>
                <Link to="/profile/me" className="flex items-center gap-1 mt-3 caption text-[var(--mm-accent-green)] font-medium hover:underline">
                  View full profile <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 mb-4">
                <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Quick Links</h3>
                <div className="flex flex-col gap-2">
                  <Link to="/signup" className="flex items-center gap-2 py-1.5 text-[var(--mm-accent-green)] body hover:underline">Sign up for free →</Link>
                  <Link to="/leaderboard" className="flex items-center gap-2 py-1.5 text-[var(--mm-text-secondary)] body hover:text-[var(--mm-text-primary)] transition-colors">Leaderboard</Link>
                  <Link to="/scores" className="flex items-center gap-2 py-1.5 text-[var(--mm-text-secondary)] body hover:text-[var(--mm-text-primary)] transition-colors">Scores & Fixtures</Link>
                  <Link to="/pricing" className="flex items-center gap-2 py-1.5 text-[var(--mm-text-secondary)] body hover:text-[var(--mm-text-primary)] transition-colors">Pro Plan</Link>
                </div>
              </div>
            )}

            {/* Top Predictors */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 mb-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Top Predictors</h3>
              <div className="flex flex-col gap-2">
                {topPredictors.length > 0 ? topPredictors.map((p, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center caption font-bold text-[var(--mm-text-muted)]">{p.rank}</span>
                    <span className="body flex-1">{p.name}</span>
                    <span className="caption text-[var(--mm-accent-amber)]">🪙 {p.pts.toLocaleString()}</span>
                  </div>
                )) : (
                  <div className="text-center py-4 text-[var(--mm-text-muted)] caption">No data yet</div>
                )}
              </div>
              <Link to="/leaderboard" className="flex items-center gap-1 mt-3 caption text-[var(--mm-accent-green)] font-medium hover:underline">
                Full leaderboard <ArrowRight size={12} />
              </Link>
            </div>

            {/* Trending */}
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
              <h3 className="caption font-semibold text-[var(--mm-text-muted)] uppercase tracking-wider mb-3">Trending Rooms</h3>
              <div className="flex flex-col gap-3">
                {liveMatches.slice(0, 3).map((match) => (
                  <div key={match.id} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--mm-accent-green)]" />
                    <span className="body flex-1 truncate">{match.homeTeamName || match.homeTeam} vs {match.awayTeamName || match.awayTeam}</span>
                    <span className="caption text-[var(--mm-text-muted)]">👥 {match.viewersCount ?? '—'}</span>
                  </div>
                ))}
                {liveMatches.length === 0 && (
                  <div className="text-center py-4 text-[var(--mm-text-muted)] caption">No live matches</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

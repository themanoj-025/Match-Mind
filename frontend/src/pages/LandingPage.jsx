import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowRight, Eye, Zap, Trophy, MessageCircle, Users, TrendingUp, Star, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'
import MatchCard from '../components/MatchCard'

export default function LandingPage() {
  const { liveMatches } = useStore()
  const [onlineCount] = useState('12,847')
  const [predictionsToday] = useState('84,291')
  const [testimonialIdx, setTestimonialIdx] = useState(0)

  const features = [
    { icon: <Eye size={28} />, title: 'WATCH', desc: 'Follow live scores, stats, and streams in synchronized viewing rooms.', gradient: 'from-[#00E676] to-[#00BFA5]' },
    { icon: <Zap size={28} />, title: 'PREDICT', desc: 'Make pre-match and in-play predictions. Earn points for every correct call.', gradient: 'from-[#FFB300] to-[#FF6D00]' },
    { icon: <Trophy size={28} />, title: 'COMPETE', desc: 'Climb global, sport, and friend-group leaderboards. Prove you know best.', gradient: 'from-[#CE93D8] to-[#AB47BC]' },
    { icon: <MessageCircle size={28} />, title: 'TALK', desc: 'Real-time chat rooms for every match. The Internet\'s Sports Bar, at your fingertips.', gradient: 'from-[#4FC3F7] to-[#0288D1]' },
  ]

  const testimonials = [
    '"MatchMind turned every game into an event. The chat rooms are electric!" — @footyfanatic',
    '"I\'ve never been this invested in mid-table matches. The predictions make everything matter." — @hoopdreamer',
    '"The leaderboard keeps me coming back. Trying to catch my friends is addictive." — @gridiron_guru',
    '"Best sports community I\'ve been part of. It\'s like being at the bar with 10,000 friends." — @sportsjunkie',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>MatchMind — The Internet's Sports Bar</title>
        <meta name="description" content="Watch live sports, predict scores, compete on leaderboards, and chat with fans in real-time. MatchMind - The Internet's Sports Bar." />
        <meta property="og:title" content="MatchMind — The Internet's Sports Bar" />
        <meta property="og:description" content="Watch live. Predict scores. Compete with the world." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MatchMind — The Internet's Sports Bar" />
        <meta name="twitter:description" content="Watch live. Predict scores. Compete with the world." />
      </Helmet>
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {['⚽', '🏀', '🏈', '🎾', '🏏', '🏒'].map((icon, i) => (
            <span
              key={i}
              className="absolute text-3xl sm:text-4xl opacity-[0.04] animate-float"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            >
              {icon}
            </span>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
              <span className="caption text-[var(--mm-accent-green)] font-semibold tracking-wider">LIVE NOW — {liveMatches.length} MATCHES IN PLAY</span>
            </div>
            <h1 className="display-xl text-[var(--mm-text-primary)] mb-4 sm:mb-6 leading-none">
              THE INTERNET'S<br />
              <span className="text-[var(--mm-accent-green)]">SPORTS BAR</span>
            </h1>
            <p className="body-large text-[var(--mm-text-secondary)] mb-8 sm:mb-10 max-w-xl">
              Watch live. Predict scores. Compete with the world.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-8 py-3.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300 group"
              >
                JOIN FOR FREE
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/live"
                className="inline-flex items-center gap-2 border border-[var(--border-subtle)] text-[var(--mm-text-primary)] body font-medium px-8 py-3.5 rounded-[var(--radius-md)] hover:border-[var(--mm-text-muted)] transition-all duration-300"
              >
                WATCH LIVE NOW
              </Link>
            </div>
          </div>

          {/* Live match ticker strip */}
          <div className="mt-12 sm:mt-16 flex items-center gap-4 overflow-hidden">
            <span className="overline text-[var(--mm-accent-green)] shrink-0">LIVE</span>
            <div className="h-px flex-1 bg-[var(--border-subtle)]" />
            <div className="flex gap-6 overflow-hidden">
              <div className="flex gap-6 animate-scroll-ticker">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[var(--mm-text-muted)] whitespace-nowrap">
                    <span className="font-medium">Team A</span>
                    <span className="text-[var(--mm-accent-green)] font-bold">2 - 1</span>
                    <span className="font-medium">Team B</span>
                    <span className="text-[var(--mm-text-muted)]">67'</span>
                    <span className="text-[var(--mm-text-muted)]">|</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-24 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="display-l text-center mb-4">HOW IT WORKS</h2>
          <p className="body-large text-[var(--mm-text-secondary)] text-center mb-12 sm:mb-16 max-w-xl mx-auto">
            Four simple steps to the ultimate sports experience
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-[var(--radius-lg)] bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-[var(--mm-text-inverse)]">{feature.icon}</div>
                </div>
                <h3 className="heading-3 mb-2">{feature.title}</h3>
                <p className="body text-[var(--mm-text-secondary)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section className="py-16 sm:py-24 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div>
              <h2 className="display-l">TOP PREDICTORS</h2>
              <p className="body-large text-[var(--mm-text-secondary)]">This Week's Best Minds</p>
            </div>
            <Link to="/signup" className="hidden sm:flex items-center gap-1 text-[var(--mm-accent-green)] body font-medium hover:underline">
              CAN YOU BEAT THEM? <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'SportsKing', pts: 8420, acc: 78, avatar: null },
              { name: 'GoalPredictor', pts: 7910, acc: 74, avatar: null },
              { name: 'HoopsMaster', pts: 7650, acc: 71, avatar: null },
              { name: 'GridironGuru', pts: 7320, acc: 69, avatar: null },
              { name: 'AcePredictor', pts: 7040, acc: 72, avatar: null },
            ].map((p, i) => (
              <div key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 text-center hover:border-[var(--border-active)] transition-all duration-300">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center">
                  <span className="font-bold text-[var(--mm-text-inverse)]">{p.name.charAt(0)}</span>
                </div>
                <p className="body font-semibold mb-1">{p.name}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="caption text-[var(--mm-accent-amber)]">🪙 {p.pts.toLocaleString()}</span>
                  <span className="caption text-[var(--mm-text-muted)]">🎯 {p.acc}%</span>
                </div>
              </div>
            ))}
          </div>
          <Link to="/signup" className="sm:hidden flex items-center justify-center gap-1 text-[var(--mm-accent-green)] body font-medium mt-6">
            CAN YOU BEAT THEM? <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* SPORTS COVERAGE */}
      <section className="py-16 sm:py-24 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="display-l text-center mb-4">SPORTS WE COVER</h2>
          <p className="body-large text-[var(--mm-text-secondary)] text-center mb-12">From the pitch to the court, we've got you covered</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 sm:gap-6">
            {[
              { icon: '⚽', name: 'Football', color: 'var(--sport-football)' },
              { icon: '🏀', name: 'Basketball', color: 'var(--sport-basketball)' },
              { icon: '🏈', name: 'NFL', color: 'var(--sport-american-fb)' },
              { icon: '🎾', name: 'Tennis', color: 'var(--sport-tennis)' },
              { icon: '🏏', name: 'Cricket', color: 'var(--sport-cricket)' },
              { icon: '🏒', name: 'Hockey', color: 'var(--sport-hockey)' },
            ].map((sport, i) => (
              <Link
                key={i}
                to={`/scores/${sport.name.toLowerCase()}`}
                className="group flex flex-col items-center gap-3 p-6 sm:p-8 bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] hover:border-[var(--border-active)] transition-all duration-300"
              >
                <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">{sport.icon}</span>
                <span className="body font-medium" style={{ color: sport.color }}>{sport.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 mb-12">
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Users size={24} className="text-[var(--mm-accent-green)]" />
                <span className="display-l text-[var(--mm-accent-green)]">{onlineCount}</span>
              </div>
              <p className="body text-[var(--mm-text-secondary)]">fans online right now</p>
            </div>
            <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Zap size={24} className="text-[var(--mm-accent-amber)]" />
                <span className="display-l text-[var(--mm-accent-amber)]">{predictionsToday}</span>
              </div>
              <p className="body text-[var(--mm-text-secondary)]">predictions made today</p>
            </div>
          </div>
          <div className="max-w-xl mx-auto">
            <p className="body-large text-[var(--mm-text-secondary)] italic mb-4 transition-all duration-500" key={testimonialIdx}>
              {testimonials[testimonialIdx]}
            </p>
            <div className="flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${i === testimonialIdx ? 'bg-[var(--mm-accent-green)] w-6' : 'bg-[var(--mm-text-muted)]'}`}
                  onClick={() => setTestimonialIdx(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border-subtle)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--gradient-live)] flex items-center justify-center">
                  <span className="text-[var(--mm-text-inverse)] font-bold text-sm">MM</span>
                </div>
                <span className="display-l text-2xl">MatchMind</span>
              </div>
              <p className="body text-[var(--mm-text-secondary)]">The Internet's Sports Bar</p>
            </div>
            <div>
              <h4 className="body font-semibold mb-3">Platform</h4>
              <div className="flex flex-col gap-2">
                <Link to="/live" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Live</Link>
                <Link to="/scores" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Scores</Link>
                <Link to="/leaderboard" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Leaderboard</Link>
              </div>
            </div>
            <div>
              <h4 className="body font-semibold mb-3">Company</h4>
              <div className="flex flex-col gap-2">
                <span className="body text-[var(--mm-text-secondary)]">About</span>
                <span className="body text-[var(--mm-text-secondary)]">Blog</span>
                <span className="body text-[var(--mm-text-secondary)]">Privacy</span>
                <span className="body text-[var(--mm-text-secondary)]">Terms</span>
              </div>
            </div>
            <div>
              <h4 className="body font-semibold mb-3">Community</h4>
              <div className="flex flex-col gap-2">
                <span className="body text-[var(--mm-text-secondary)]">Twitter</span>
                <span className="body text-[var(--mm-text-secondary)]">Discord</span>
                <span className="body text-[var(--mm-text-secondary)]">Contact</span>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[var(--border-subtle)] text-center">
            <p className="caption text-[var(--mm-text-muted)]">&copy; 2026 MatchMind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

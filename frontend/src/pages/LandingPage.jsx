import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, Zap, Trophy, MessageCircle, Users, TrendingUp, Star, ChevronRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import MatchCard from '../components/MatchCard'
import HeroScene from '../components/three/HeroScene'
import { animateCountUp, useScrollReveal, killAllScrollTriggers } from '../lib/animation/gsap'
import { cardStaggerContainer, cardStaggerItem, fadeUpVariants } from '../lib/animation/variants'

export default function LandingPage() {
  const { liveMatches } = useStore()
  const [onlineCount] = useState('12,847')
  const [predictionsToday] = useState('84,291')
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const leaderboardRef = useRef(null)
  const sportsRef = useRef(null)
  const navigate = useNavigate()

  const features = [
    { icon: <Eye size={28} />, title: 'WATCH', desc: 'Follow live scores, stats, and streams in synchronized viewing rooms.', gradient: 'from-[#00E676] to-[#00BFA5]' },
    { icon: <Zap size={28} />, title: 'PREDICT', desc: 'Make pre-match and in-play predictions. Earn points for every correct call.', gradient: 'from-[#FFB300] to-[#FF6D00]' },
    { icon: <Trophy size={28} />, title: 'COMPETE', desc: 'Climb global, sport, and friend-group leaderboards. Prove you know best.', gradient: 'from-[#CE93D8] to-[#AB47BC]' },
    { icon: <MessageCircle size={28} />, title: 'TALK', desc: "Real-time chat rooms for every match. The Internet's Sports Bar, at your fingertips.", gradient: 'from-[#4FC3F7] to-[#0288D1]' },
  ]

  const testimonials = [
    { text: '"MatchMind turned every game into an event. The chat rooms are electric!"', author: '@footyfanatic' },
    { text: '"I\'ve never been this invested in mid-table matches. The predictions make everything matter."', author: '@hoopdreamer' },
    { text: '"The leaderboard keeps me coming back. Trying to catch my friends is addictive."', author: '@gridiron_guru' },
    { text: '"Best sports community I\'ve been part of. It\'s like being at the bar with 10,000 friends."', author: '@sportsjunkie' },
  ]

  const sports = [
    { icon: '⚽', name: 'Football', color: 'var(--sport-football)', leagues: 'PL · UCL · La Liga · Serie A' },
    { icon: '🏀', name: 'Basketball', color: 'var(--sport-basketball)', leagues: 'NBA · NCAA' },
    { icon: '🏈', name: 'American Football', color: 'var(--sport-american-fb)', leagues: 'NFL · NCAA' },
    { icon: '🎾', name: 'Tennis', color: 'var(--sport-tennis)', leagues: 'Grand Slams · ATP' },
    { icon: '🏏', name: 'Cricket', color: 'var(--sport-cricket)', leagues: 'IPL · T20 · Test' },
    { icon: '🏒', name: 'Ice Hockey', color: 'var(--sport-hockey)', leagues: 'NHL' },
  ]

  const topPredictors = [
    { name: 'SportsKing', pts: 8420, acc: 78, rank: 1 },
    { name: 'GoalPredictor', pts: 7910, acc: 74, rank: 2 },
    { name: 'HoopsMaster', pts: 7650, acc: 71, rank: 3 },
    { name: 'GridironGuru', pts: 7320, acc: 69, rank: 4 },
    { name: 'AcePredictor', pts: 7040, acc: 72, rank: 5 },
  ]

  // Stable sparkle positions for CTA banner
  const sparkles = useMemo(() =>
    [...Array(12)].map((_, i) => ({
      top: 10 + (i * 7 + 3) % 81,
      left: 5 + (i * 13 + 7) % 91,
      size: 12 + (i * 4 + 1) % 16,
      symbol: ['✦', '✧', '◆', '◇', '⬡', '△'][i % 6],
      delay: (i * 0.4) % 3,
      duration: 3 + (i % 4),
    })), [])

  // GSAP scroll reveal on sections
  useEffect(() => {
    const reveals = []
    if (featuresRef.current) reveals.push(useScrollReveal(featuresRef.current.querySelectorAll('.feature-card')))
    if (leaderboardRef.current) reveals.push(useScrollReveal(leaderboardRef.current.querySelectorAll('.leader-card')))
    if (sportsRef.current) reveals.push(useScrollReveal(sportsRef.current.querySelectorAll('.sport-tile')))

    return () => {
      reveals.forEach((r) => r.kill())
      killAllScrollTriggers()
    }
  }, [])

  // GSAP count-up for stats
  useEffect(() => {
    if (!statsRef.current) return
    const counters = statsRef.current.querySelectorAll('[data-countup]')
    if (!counters.length) return

    const tweens = []
    counters.forEach((counter) => {
      const target = parseInt(counter.dataset.target, 10)
      const tween = animateCountUp(counter, target, 2)
      tweens.push(tween)
    })

    return () => tweens.forEach((t) => t.kill())
  }, [])

  // Scroll listener for navbar transition
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Testimonial auto-rotation
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
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MatchMind — The Internet's Sports Bar" />
        <meta name="twitter:description" content="Watch live. Predict scores. Compete with the world." />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'MatchMind',
            description: "The Internet's Sports Bar — Watch live. Predict scores. Compete with the world.",
            applicationCategory: 'SportsApplication',
            url: 'https://matchmind.gg',
          })}
        </script>
      </Helmet>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Three.js Hero Scene */}
        <HeroScene />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--mm-bg-primary)]/80 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
              <span className="caption text-[var(--mm-accent-green)] font-semibold tracking-wider">
                THE INTERNET'S SPORTS BAR
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="display-xl text-[var(--mm-text-primary)] mb-4 sm:mb-6 leading-none"
            >
              WATCH. PREDICT.<br />
              <span className="text-[var(--mm-accent-green)]">COMPETE.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="body-large text-[var(--mm-text-secondary)] mb-8 sm:mb-10 max-w-xl"
            >
              Live scores, real predictions, global leaderboards — all in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-[var(--gradient-live)] text-[var(--mm-text-inverse)] body font-semibold px-8 py-3.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300 group"
              >
                JOIN FOR FREE
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/live"
                className="inline-flex items-center gap-2 border border-[var(--border-subtle)] text-[var(--mm-text-primary)] body font-medium px-8 py-3.5 rounded-[var(--radius-md)] hover:border-[var(--mm-text-muted)] hover:bg-[var(--mm-bg-hover)] transition-all duration-300"
              >
                WATCH LIVE
              </Link>
            </motion.div>

            {/* Sport icons strip — clickable */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-10 flex items-center gap-4 sm:gap-6"
            >
              {[
                { icon: '⚽', slug: 'football' },
                { icon: '🏀', slug: 'basketball' },
                { icon: '🏈', slug: 'american_football' },
                { icon: '🎾', slug: 'tennis' },
                { icon: '🏏', slug: 'cricket' },
                { icon: '🏒', slug: 'hockey' },
              ].map((s, i) => (
                <Link
                  key={i}
                  to={`/scores/${s.slug}`}
                  className="text-2xl sm:text-3xl opacity-50 hover:opacity-100 transition-all duration-300 hover:scale-125"
                  style={{ animation: `float 3s ease-in-out ${i * 0.3}s infinite` }}
                  aria-label={`View ${s.slug} scores`}
                >
                  {s.icon}
                </Link>
              ))}
            </motion.div>

            {/* Live ticker — real matches from store */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-12 sm:mt-16 flex items-center gap-4 overflow-hidden"
            >
              <span className="overline text-[var(--mm-accent-green)] shrink-0">LIVE</span>
              <div className="h-px flex-1 bg-[var(--border-subtle)]" />
              <div className="flex gap-6 overflow-hidden">
                <Link to="/live" className="flex gap-6 animate-scroll-ticker hover:opacity-80 transition-opacity">
                  {(liveMatches.length > 0
                    ? [...liveMatches, ...liveMatches]
                    : [
                        { homeTeam: 'Liverpool', awayTeam: 'Arsenal', homeScore: 2, awayScore: 1, minute: 67 },
                        { homeTeam: 'Lakers', awayTeam: 'Celtics', homeScore: 89, awayScore: 82, minute: 4 },
                        { homeTeam: 'Chiefs', awayTeam: '49ers', homeScore: 17, awayScore: 14, minute: 3 },
                      ].flatMap((m) => [m, m])
                  ).map((match, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-[var(--mm-text-muted)] whitespace-nowrap">
                      <span className="font-medium text-[var(--mm-text-secondary)]">{match.homeTeam}</span>
                      <span className="text-[var(--mm-accent-green)] font-bold">{match.homeScore} — {match.awayScore}</span>
                      <span className="font-medium text-[var(--mm-text-secondary)]">{match.awayTeam}</span>
                      <span className="text-[var(--mm-text-muted)]">{match.minute}&apos;</span>
                    </div>
                  ))}
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF STRIP */}
      <section ref={statsRef} className="py-12 sm:py-16 bg-[var(--mm-bg-secondary)] border-y border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="display-l text-[var(--mm-accent-green)]" data-countup data-target="12847">0</div>
              <p className="body text-[var(--mm-text-secondary)] mt-1">fans online right now</p>
            </div>
            <div className="text-center">
              <div className="display-l text-[var(--mm-accent-amber)]" data-countup data-target="83200">0</div>
              <p className="body text-[var(--mm-text-secondary)] mt-1">predictions made today</p>
            </div>
            <div className="text-center">
              <div className="display-l text-[var(--mm-accent-blue)]" data-countup data-target="6">0</div>
              <p className="body text-[var(--mm-text-secondary)] mt-1">sports covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={featuresRef} className="py-16 sm:py-24 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="display-l mb-4">HOW IT WORKS</h2>
            <p className="body-large text-[var(--mm-text-secondary)] max-w-xl mx-auto">
              Four simple steps to the ultimate sports experience
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={cardStaggerItem}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="feature-card group text-center relative"
              >
                {/* Step number background */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 font-[var(--font-display)] text-[96px] text-[var(--mm-accent-green)]/10 select-none pointer-events-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className={`w-16 h-16 mx-auto mb-4 rounded-[var(--radius-lg)] bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                  <div className="text-[var(--mm-text-inverse)]">{feature.icon}</div>
                </div>
                <h3 className="heading-3 mb-2 relative z-10">{feature.title}</h3>
                <p className="body text-[var(--mm-text-secondary)] relative z-10">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW */}
      <section ref={leaderboardRef} className="py-16 sm:py-24 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-8 sm:mb-12"
          >
            <div>
              <h2 className="display-l">TOP PREDICTORS</h2>
              <p className="body-large text-[var(--mm-text-secondary)]">This Week's Best Minds</p>
            </div>
            <Link to="/signup" className="hidden sm:flex items-center gap-1 text-[var(--mm-accent-green)] body font-medium hover:underline">
              THINK YOU CAN BEAT THEM? <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {topPredictors.map((p, i) => (
              <motion.div
                key={i}
                variants={cardStaggerItem}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className={`leader-card bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 sm:p-5 text-center hover:border-[var(--border-active)] hover:shadow-[var(--shadow-card)] transition-all duration-300 ${
                  i === 0 ? 'ring-1 ring-[var(--mm-accent-amber)]/30' : ''
                }`}
              >
                <div className="relative inline-block">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center ${
                    i === 0 ? 'ring-2 ring-[var(--tier-gold)]' : ''
                  }`}>
                    <span className="font-bold text-lg text-[var(--mm-text-inverse)]">{p.name.charAt(0)}</span>
                  </div>
                  {i === 0 && (
                    <span className="absolute -top-1 -right-1 text-lg" role="img" aria-label="crown">👑</span>
                  )}
                </div>
                <p className="body font-semibold mb-1">{p.name}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="caption text-[var(--mm-accent-amber)]">🪙 {p.pts.toLocaleString()}</span>
                  <span className="caption text-[var(--mm-text-muted)]">🎯 {p.acc}%</span>
                </div>
                {i === 0 && <div className="mt-2 caption text-[var(--mm-accent-amber)] font-semibold">#1 PREDICTOR</div>}
              </motion.div>
            ))}
          </div>

          <Link to="/signup" className="sm:hidden flex items-center justify-center gap-1 text-[var(--mm-accent-green)] body font-medium mt-6">
            THINK YOU CAN BEAT THEM? <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* LIVE MATCH PREVIEW */}
      {liveMatches.length > 0 && (
        <section className="py-16 sm:py-24 border-b border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)] animate-live-pulse" />
              <h2 className="display-l">HAPPENING RIGHT NOW</h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMatches.filter(m => m.status === 'SIMULATING').slice(0, 3).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onEnterRoom={() => navigate(`/live/${match.id}`)}
                  onPredict={() => navigate(`/predictions/new/${match.id}`)}
                />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to="/live" className="inline-flex items-center gap-1 text-[var(--mm-accent-green)] body font-medium hover:underline">
                SEE ALL LIVE MATCHES →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SPORTS COVERAGE */}
      <section ref={sportsRef} className="py-16 sm:py-24 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="display-l mb-4">6 SPORTS COVERED</h2>
            <p className="body-large text-[var(--mm-text-secondary)]">From the pitch to the court, we've got you covered</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {sports.map((sport, i) => {
              const liveCounts = [4, 3, 1, 2, 1, 0]
              const liveCount = liveCounts[i]
              return (
                <motion.div
                  key={i}
                  variants={cardStaggerItem}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  className="sport-tile group relative overflow-hidden bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8 hover:scale-[1.03] transition-all duration-300 cursor-pointer"
                  style={{
                    '--sport-color': sport.color,
                    '--sport-color-glow': `${sport.color}22`,
                  }}
                  onClick={() => navigate(`/scores/${sport.name.toLowerCase()}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/scores/${sport.name.toLowerCase()}`)}
                >
                  {/* Hover glow effect */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[var(--radius-xl)]"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${sport.color}15 0%, transparent 70%)`,
                      boxShadow: `inset 0 0 40px ${sport.color}10`,
                    }}
                  />
                  {/* Animated border glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-[var(--radius-xl)]"
                    style={{
                      border: `1.5px solid ${sport.color}40`,
                    }}
                  />
                  {/* Live count badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-[var(--radius-full)] text-[11px] font-semibold"
                      style={{
                        background: `${sport.color}18`,
                        color: sport.color,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-live-pulse" style={{ background: sport.color }} />
                      {liveCount} Live
                    </div>
                  </div>
                  <div className="relative z-10 text-center">
                    <span className="text-4xl sm:text-5xl block mb-3 group-hover:scale-125 transition-all duration-300" style={{ filter: 'drop-shadow(0 0 8px var(--sport-color-glow))' }}>
                      {sport.icon}
                    </span>
                    <h3 className="heading-3 mb-1" style={{ color: sport.color }}>{sport.name}</h3>
                    <p className="caption text-[var(--mm-text-muted)]">{sport.leagues}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 sm:py-24 border-b border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="display-l mb-8">WHAT FANS SAY</h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="min-h-[100px]"
            >
              <p className="body-large text-[var(--mm-text-secondary)] italic mb-4">
                {testimonials[testimonialIdx].text}
              </p>
              <p className="body font-semibold text-[var(--mm-accent-green)]">
                — {testimonials[testimonialIdx].author}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === testimonialIdx ? 'bg-[var(--mm-accent-green)] w-6' : 'bg-[var(--mm-text-muted)] hover:bg-[var(--mm-text-secondary)]'
                }`}
                onClick={() => setTestimonialIdx(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="relative py-20 sm:py-28 overflow-hidden" style={{ background: 'var(--gradient-live)' }}>
        {/* Floating sparkle particles */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {sparkles.map((s, i) => (
            <span
              key={i}
              className="absolute text-white/20 pointer-events-none select-none"
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                fontSize: `${s.size}px`,
                animation: `float ${s.duration}s ease-in-out ${s.delay}s infinite`,
              }}
            >
              {s.symbol}
            </span>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="display-l text-[var(--mm-text-inverse)] mb-4">
              READY TO PROVE YOU KNOW SPORT?
            </h2>
            <p className="body-large text-[var(--mm-text-inverse)]/80 mb-8">
              No credit card. No downloads. Just sport.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-[var(--mm-text-inverse)] text-[var(--mm-accent-green)] body font-bold px-10 py-4 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 group"
            >
              JOIN FOR FREE — IT TAKES 30 SECONDS
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[var(--mm-bg-secondary)] border-t border-[var(--border-subtle)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--gradient-live)] flex items-center justify-center">
                  <span className="text-[var(--mm-text-inverse)] font-bold text-sm">MM</span>
                </div>
                <span className="display-l text-2xl">MatchMind</span>
              </div>
              <p className="body text-[var(--mm-text-secondary)] mb-4">The Internet's Sports Bar</p>
              <div className="flex items-center gap-3">
                {['Twitter', 'Discord', 'Instagram', 'YouTube'].map((social) => (
                  <span key={social} className="w-8 h-8 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center caption text-[var(--mm-text-muted)] hover:bg-[var(--mm-bg-hover)] hover:text-[var(--mm-text-secondary)] transition-all cursor-default">
                    {social.charAt(0)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="body font-semibold mb-3">Product</h4>
              <div className="flex flex-col gap-2">
                <Link to="/live" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Live</Link>
                <Link to="/scores" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Scores</Link>
                <Link to="/leaderboard" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Leaderboard</Link>
                <Link to="/predictions" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Predictions</Link>
              </div>
            </div>
            <div>
              <h4 className="body font-semibold mb-3">Community</h4>
              <div className="flex flex-col gap-2">
                <Link to="/leagues" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Leagues</Link>
                <Link to="/squads" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Squads</Link>
                <Link to="/explore" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Explore</Link>
              </div>
            </div>
            <div>
              <h4 className="body font-semibold mb-3">Company</h4>
              <div className="flex flex-col gap-2">
                <Link to="/about" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">About</Link>
                <Link to="/faq" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">FAQ</Link>
                <span className="body text-[var(--mm-text-secondary)] cursor-default">Privacy</span>
                <span className="body text-[var(--mm-text-secondary)] cursor-default">Terms</span>
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

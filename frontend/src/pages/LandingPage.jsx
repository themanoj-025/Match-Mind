import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, Zap, Trophy, MessageCircle, ChevronRight, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/useStore'
import MatchCard from '../components/MatchCard'
import HeroScene from '../components/three/HeroScene'
import { animateCountUp, useScrollReveal, killAllScrollTriggers } from '../lib/animation/gsap'
import { cardStaggerItem } from '../lib/animation/variants'
import {
  KineticNumber,
  Marquee,
  GridGap,
} from '../components/kinetic'
import {
  kineticStaggerContainer,
  kineticStaggerItem,
  kineticWordVariants,
  kineticCharVariants,
  splitIntoChars,
  splitIntoWords,
  prefersReducedMotion,
} from '../lib/kinetic'

// ── Kinetic Text Reveal Sub-component ──────────────────

function KineticRevealText({ text, as: Tag = 'h1', className = '', mode = 'word', delay = 0, style }) {
  const reduced = prefersReducedMotion()
  const elements = mode === 'char' ? splitIntoChars(text) : splitIntoWords(text)
  const variants = mode === 'char' ? kineticCharVariants : kineticWordVariants

  if (reduced) {
    return <Tag className={className} style={style}>{text}</Tag>
  }

  return (
    <Tag className={className} style={{ overflow: 'hidden', display: 'block', ...style }}>
      <motion.span
        style={{ display: 'inline-flex', flexWrap: 'wrap', gap: mode === 'word' ? '0.15em' : '0' }}
        variants={kineticStaggerContainer}
        initial="hidden"
        animate="visible"
      >
        {elements.map((el, i) => (
          <motion.span
            key={`${el}-${i}`}
            custom={i + delay * 40}
            variants={variants}
            style={{ display: 'inline-block', whiteSpace: mode === 'word' ? 'pre' : 'pre-wrap' }}
          >
            {el}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  )
}

// ── Gradient Text Component ────────────────────────────

function GradientText({ children, gradient = 'var(--gradient-live)', className = '', as: Tag = 'span', style }) {
  return (
    <Tag
      className={`kinetic-text ${className}`}
      style={{
        background: gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}

// ── Kinetic Glow Badge ─────────────────────────────────

function KineticGlowBadge({ children, color = 'var(--mm-accent-green)' }) {
  return (
    <motion.div
      className="kinetic-glow-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        background: `${color}12`,
        border: `1px solid ${color}25`,
        color,
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
      }}
      whileHover={{ scale: 1.05, background: `${color}20` }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }}
        animate={{ opacity: [1, 0.4, 1], scale: [1, 0.8, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {children}
    </motion.div>
  )
}

// ── Kinetic Feature Step ───────────────────────────────

function KineticFeatureStep({ icon, title, desc, gradient, index }) {
  return (
    <motion.div
      className="kinetic-feature-step"
      variants={kineticStaggerItem}
      style={{
        position: 'relative',
        textAlign: 'center',
        padding: '32px 20px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--mm-bg-secondary)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      whileHover={{
        borderColor: 'var(--border-active)',
        boxShadow: 'var(--shadow-card)',
        y: -4,
        transition: { duration: 0.2 },
      }}
    >
      {/* Step number — kinetic large */}
      <div
        className="kinetic-text"
        style={{
          position: 'absolute',
          top: 4,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '80px',
          lineHeight: 0.85,
          opacity: 0.06,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Icon bubble */}
      <motion.div
        style={{
          width: 64,
          height: 64,
          margin: '0 auto 16px',
          borderRadius: 'var(--radius-lg)',
          background: `linear-gradient(135deg, ${gradient})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
        }}
        whileHover={{ scale: 1.12, rotate: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <span style={{ color: 'var(--mm-text-inverse)' }}>{icon}</span>
      </motion.div>

      <h3
        className="kinetic-text"
        style={{ fontSize: 'var(--kinetic-text-sm)', marginBottom: 8, position: 'relative', zIndex: 1 }}
      >
        {title}
      </h3>
      <p
        className="body"
        style={{ color: 'var(--mm-text-secondary)', position: 'relative', zIndex: 1 }}
      >
        {desc}
      </p>
    </motion.div>
  )
}

// ── Main Landing Page ──────────────────────────────────

export default function LandingPage() {
  const { liveMatches } = useStore()
  const [onlineCount] = useState(12847)
  const [predictionsToday] = useState(84291)
  const [sportsCount] = useState(6)
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const statsRef = useRef(null)
  const featuresRef = useRef(null)
  const leaderboardRef = useRef(null)
  const sportsRef = useRef(null)
  const navigate = useNavigate()

  const features = [
    { icon: <Eye size={28} />, title: 'WATCH', desc: 'Follow live scores, stats, and streams in synchronized viewing rooms.', gradient: '#00E676, #00BFA5' },
    { icon: <Zap size={28} />, title: 'PREDICT', desc: 'Make pre-match and in-play predictions. Earn points for every correct call.', gradient: '#FFB300, #FF6D00' },
    { icon: <Trophy size={28} />, title: 'COMPETE', desc: 'Climb global, sport, and friend-group leaderboards. Prove you know best.', gradient: '#CE93D8, #AB47BC' },
    { icon: <MessageCircle size={28} />, title: 'TALK', desc: "Real-time chat rooms for every match. The Internet's Sports Bar, at your fingertips.", gradient: '#4FC3F7, #0288D1' },
  ]

  const testimonials = [
    { text: '"MatchMind turned every game into an event. The chat rooms are electric!"', author: '@footyfanatic' },
    { text: '"I\'ve never been this invested in mid-table matches. The predictions make everything matter."', author: '@hoopdreamer' },
    { text: '"The leaderboard keeps me coming back. Trying to catch my friends is addictive."', author: '@gridiron_guru' },
    { text: '"Best sports community I\'ve been part of. It\'s like being at the bar with 10,000 friends."', author: '@sportsjunkie' },
  ]

  const sports = [
    { icon: '⚽', name: 'Football', color: 'var(--sport-football)', leagues: 'PL · UCL · La Liga · Serie A', slug: 'football' },
    { icon: '🏀', name: 'Basketball', color: 'var(--sport-basketball)', leagues: 'NBA · NCAA', slug: 'basketball' },
    { icon: '🏈', name: 'American Football', color: 'var(--sport-american-fb)', leagues: 'NFL · NCAA', slug: 'american_football' },
    { icon: '🎾', name: 'Tennis', color: 'var(--sport-tennis)', leagues: 'Grand Slams · ATP', slug: 'tennis' },
    { icon: '🏏', name: 'Cricket', color: 'var(--sport-cricket)', leagues: 'IPL · T20 · Test', slug: 'cricket' },
    { icon: '🏒', name: 'Ice Hockey', color: 'var(--sport-hockey)', leagues: 'NHL', slug: 'hockey' },
  ]

  const topPredictors = [
    { name: 'SportsKing', pts: 8420, acc: 78, rank: 1 },
    { name: 'GoalPredictor', pts: 7910, acc: 74, rank: 2 },
    { name: 'HoopsMaster', pts: 7650, acc: 71, rank: 3 },
    { name: 'GridironGuru', pts: 7320, acc: 69, rank: 4 },
    { name: 'AcePredictor', pts: 7040, acc: 72, rank: 5 },
  ]

  // Marquee ticker items
  const tickerItems = useMemo(() => {
    const matches = liveMatches.length > 0
      ? liveMatches
      : [
          { homeTeam: 'Liverpool', awayTeam: 'Arsenal', homeScore: 2, awayScore: 1, minute: 67 },
          { homeTeam: 'Lakers', awayTeam: 'Celtics', homeScore: 89, awayScore: 82, minute: 4 },
          { homeTeam: 'Chiefs', awayTeam: '49ers', homeScore: 17, awayScore: 14, minute: 3 },
          { homeTeam: 'Barcelona', awayTeam: 'Real Madrid', homeScore: 1, awayScore: 1, minute: 42 },
          { homeTeam: 'Heat', awayTeam: 'Nuggets', homeScore: 105, awayScore: 98, minute: 8 },
        ]
    return matches.map((m) => ({
      id: m.id || Math.random(),
      content: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <span className="body" style={{ fontWeight: 600, color: 'var(--mm-text-secondary)' }}>{m.homeTeam}</span>
          <span style={{
            padding: '1px 8px',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--mm-accent-green)',
            color: 'var(--mm-text-inverse)',
            fontWeight: 700,
            fontSize: 13,
          }}>
            {m.homeScore} – {m.awayScore}
          </span>
          <span className="body" style={{ fontWeight: 600, color: 'var(--mm-text-secondary)' }}>{m.awayTeam}</span>
          <span className="caption" style={{ color: 'var(--mm-text-muted)' }}>{m.minute}&apos;</span>
        </span>
      ),
    }))
  }, [liveMatches])

  // Marquee items for sport icons strip
  const sportIconItems = useMemo(() =>
    sports.map((s) => ({
      id: s.slug,
      content: (
        <Link
          to={`/scores/${s.slug}`}
          style={{
            fontSize: 28,
            opacity: 0.5,
            transition: 'all 0.3s ease',
            display: 'inline-block',
          }}
          className="kinetic-marquee-icon"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1'
            e.currentTarget.style.transform = 'scale(1.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.5'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          aria-label={`View ${s.name} scores`}
        >
          {s.icon}
        </Link>
      ),
    })), [sports])

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
    if (featuresRef.current) reveals.push(useScrollReveal(featuresRef.current.querySelectorAll('.kinetic-feature-step'), { duration: 0.5 }))
    if (leaderboardRef.current) reveals.push(useScrollReveal(leaderboardRef.current.querySelectorAll('.leader-card'), { duration: 0.4 }))
    if (sportsRef.current) reveals.push(useScrollReveal(sportsRef.current.querySelectorAll('.kinetic-sport-tile'), { duration: 0.4 }))

    return () => {
      reveals.forEach((r) => r.kill())
      killAllScrollTriggers()
    }
  }, [])

  // GSAP count-up for stats (backup for non-TSX environments)
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
    <div className="min-h-screen" style={{ overflow: 'hidden' }}>
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

      {/* ═══════════════════════════════════════════════════
          HERO SECTION — Kinetic Typography First
          ═══════════════════════════════════════════════════ */}
      <section
        className="kinetic-hero"
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'var(--gradient-hero)',
        }}
      >
        {/* Three.js Hero Scene */}
        <HeroScene />

        {/* Gradient overlay for readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, transparent 40%, var(--mm-bg-primary) 90%)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating kinetic particles — subtle */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[1, 2, 3].map((n) => (
            <motion.div
              key={n}
              className="kinetic-text"
              style={{
                position: 'absolute',
                fontSize: 'clamp(6rem, 20vw, 16rem)',
                lineHeight: 0.85,
                opacity: 0.02,
                color: 'var(--mm-accent-green)',
                top: `${10 + n * 25}%`,
                left: `${5 + n * 15}%`,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, n % 2 === 0 ? -3 : 3, 0],
              }}
              transition={{
                duration: 6 + n,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: n * 0.5,
              }}
            >
              {n === 1 ? '24/7' : n === 2 ? 'GOAL' : 'WIN'}
            </motion.div>
          ))}
        </div>

        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '80px 24px 40px',
            zIndex: 10,
          }}
        >
          <div style={{ maxWidth: 720 }}>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              style={{ marginBottom: 24 }}
            >
              <KineticGlowBadge color="var(--mm-accent-green)">
                THE INTERNET'S SPORTS BAR
              </KineticGlowBadge>
            </motion.div>

            {/* Kinetic headline — word reveal */}
            <KineticRevealText
              text="WATCH. PREDICT."
              as="h1"
              className="kinetic-text"
              style={{ fontSize: 'var(--kinetic-text-3xl)', lineHeight: 'var(--kinetic-leading-tight)', marginBottom: 0 }}
              mode="word"
              delay={0.2}
            />

            {/* Gradient sub-headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <GradientText
                as="h1"
                className="kinetic-text"
                gradient="var(--gradient-live)"
                style={{ fontSize: 'var(--kinetic-text-3xl)', lineHeight: 'var(--kinetic-leading-tight)', marginBottom: 16 }}
              >
                COMPETE.
              </GradientText>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              style={{
                fontSize: 'var(--kinetic-text-sm)',
                color: 'var(--mm-text-secondary)',
                marginBottom: 32,
                maxWidth: 520,
                lineHeight: 1.6,
              }}
            >
              Live scores, real predictions, global leaderboards — all in one place.
              The most electric sports community on the internet.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}
            >
              <Link
                to="/signup"
                className="kinetic-cta-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--gradient-live)',
                  color: 'var(--mm-text-inverse)',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '14px 32px',
                  borderRadius: 'var(--radius-md)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.03)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow-green)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                JOIN FOR FREE
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowRight size={18} />
                </motion.span>
              </Link>

              <Link
                to="/live"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '14px 28px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--mm-text-primary)',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--mm-text-muted)'
                  e.currentTarget.style.background = 'var(--mm-bg-hover)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                WATCH LIVE
                <Eye size={16} />
              </Link>
            </motion.div>

            {/* Sport icons Marquee */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              style={{ marginTop: 40 }}
            >
              <Marquee
                items={sportIconItems}
                speed={20}
                direction="left"
                gap={32}
                pauseOnHover
                className="kinetic-sport-icons"
              />
            </motion.div>

            {/* Live score ticker — Marquee */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              style={{ marginTop: 16 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0' }}>
                <KineticGlowBadge color="var(--mm-accent-green)">
                  <Flame size={12} /> LIVE
                </KineticGlowBadge>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              </div>
              <Marquee
                items={tickerItems}
                speed={28}
                direction="left"
                gap={40}
                pauseOnHover
                style={{ padding: '4px 0' }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS SECTION — Kinetic Counters
          ═══════════════════════════════════════════════════ */}
      <section
        ref={statsRef}
        className="kinetic-stats"
        style={{
          padding: '48px 0',
          background: 'var(--mm-bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {/* Stat 1 */}
            <motion.div
              className="kinetic-stat"
              style={{ textAlign: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <KineticNumber
                value={onlineCount}
                mode="count"
                duration={1.2}
                as="div"
                className="kinetic-text"
                style={{
                  fontSize: 'var(--kinetic-text-2xl)',
                  color: 'var(--mm-accent-green)',
                  lineHeight: 'var(--kinetic-leading-compact)',
                }}
              />
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 13, marginTop: 4 }}>
                fans online right now
              </p>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              style={{ textAlign: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <KineticNumber
                value={predictionsToday}
                mode="count"
                duration={1.4}
                as="div"
                className="kinetic-text"
                style={{
                  fontSize: 'var(--kinetic-text-2xl)',
                  color: 'var(--mm-accent-amber)',
                  lineHeight: 'var(--kinetic-leading-compact)',
                }}
              />
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 13, marginTop: 4 }}>
                predictions made today
              </p>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              style={{ textAlign: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <KineticNumber
                value={sportsCount}
                mode="count"
                duration={0.8}
                as="div"
                className="kinetic-text"
                style={{
                  fontSize: 'var(--kinetic-text-2xl)',
                  color: 'var(--mm-accent-blue)',
                  lineHeight: 'var(--kinetic-leading-compact)',
                }}
              />
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 13, marginTop: 4 }}>
                sports covered
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS — Kinetic Feature Steps + GridGap
          ═══════════════════════════════════════════════════ */}
      <section
        ref={featuresRef}
        className="kinetic-features"
        style={{
          padding: '80px 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          {/* Section header with kinetic reveal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', marginBottom: 48 }}
          >
            <KineticRevealText
              text="HOW IT WORKS"
              as="h2"
              mode="char"
              className="kinetic-text"
              style={{
                fontSize: 'var(--kinetic-text-xl)',
                marginBottom: 12,
                color: 'var(--mm-text-primary)',
              }}
            />
            <p style={{ color: 'var(--mm-text-secondary)', fontSize: 'var(--kinetic-text-sm)' }}>
              Four simple steps to the ultimate sports experience
            </p>
          </motion.div>

          {/* Kinetic Feature Grid */}
          <GridGap
            columns={{ default: 1, sm: 2, lg: 4 }}
            gap="var(--kinetic-grid-gap-md)"
            mode="stagger"
          >
            {features.map((feature, i) => (
              <KineticFeatureStep
                key={i}
                icon={feature.icon}
                title={feature.title}
                desc={feature.desc}
                gradient={feature.gradient}
                index={i}
              />
            ))}
          </GridGap>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          LEADERBOARD PREVIEW — KineticNumbers + InvertCard
          ═══════════════════════════════════════════════════ */}
      <section
        ref={leaderboardRef}
        className="kinetic-leaderboard"
        style={{
          padding: '80px 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 40,
            }}
          >
            <div>
              <KineticRevealText
                text="TOP PREDICTORS"
                as="h2"
                mode="char"
                className="kinetic-text"
                style={{
                  fontSize: 'var(--kinetic-text-xl)',
                  lineHeight: 'var(--kinetic-leading-compact)',
                  marginBottom: 8,
                }}
              />
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 'var(--kinetic-text-sm)' }}>
                This Week's Best Minds
              </p>
            </div>
            <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
              <Link
                to="/signup"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--mm-accent-green)',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
                className="sm:flex"
              >
                THINK YOU CAN BEAT THEM? <ChevronRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Leaderboard grid with KineticNumbers for scores */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
            }}
          >
            {topPredictors.map((p, i) => (
              <motion.div
                key={i}
                className="leader-card"
                variants={kineticStaggerItem}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                style={{
                  background: 'var(--mm-bg-secondary)',
                  border: `1px solid ${i === 0 ? 'var(--border-active)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
                whileHover={{
                  y: -4,
                  borderColor: 'var(--border-active)',
                  boxShadow: 'var(--shadow-card)',
                  transition: { duration: 0.2 },
                }}
              >
                {/* Rank badge — kinetic */}
                <div
                  className="kinetic-text"
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 12,
                    fontSize: 32,
                    lineHeight: 0.85,
                    opacity: i === 0 ? 0.15 : 0.08,
                    color: i === 0 ? 'var(--tier-gold)' : 'var(--mm-text-muted)',
                  }}
                >
                  #{p.rank}
                </div>

                {/* Avatar */}
                <motion.div
                  style={{
                    width: 52,
                    height: 52,
                    margin: '0 auto 12px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${
                      i === 0 ? 'var(--tier-gold), var(--mm-accent-amber)' : 'var(--mm-accent-amber), var(--mm-accent-purple)'
                    })`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--mm-text-inverse)' }}>
                    {p.name.charAt(0)}
                  </span>
                  {i === 0 && (
                    <span style={{ position: 'absolute', top: -6, right: -6, fontSize: 16 }}>👑</span>
                  )}
                </motion.div>

                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{p.name}</p>

                {/* Kinetic points */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                  <KineticNumber
                    value={p.pts}
                    mode="roll"
                    duration={0.5}
                    prefix="🪙 "
                    as="span"
                    className="kinetic-text-mono"
                    style={{ fontSize: 14, color: 'var(--mm-accent-amber)' }}
                  />
                  <span style={{ fontSize: 12, color: 'var(--mm-text-muted)' }}>
                    🎯 {p.acc}%
                  </span>
                </div>

                {i === 0 && (
                  <motion.div
                    className="kinetic-text"
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      letterSpacing: '1.5px',
                      color: 'var(--mm-accent-amber)',
                    }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    #1 PREDICTOR
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mobile CTA link */}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
              <Link
                to="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--mm-accent-green)',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                THINK YOU CAN BEAT THEM? <ChevronRight size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          LIVE MATCH PREVIEW
          ═══════════════════════════════════════════════════ */}
      {liveMatches.length > 0 && (
        <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}
            >
              <KineticGlowBadge color="var(--mm-accent-green)">
                <Flame size={12} /> LIVE NOW
              </KineticGlowBadge>
              <h2
                className="kinetic-text"
                style={{ fontSize: 'var(--kinetic-text-lg)', lineHeight: 'var(--kinetic-leading-compact)' }}
              >
                HAPPENING RIGHT NOW
              </h2>
            </motion.div>

            <GridGap
              columns={{ default: 1, sm: 2, lg: 3 }}
              gap="var(--kinetic-grid-gap-sm)"
              mode="stagger"
            >
              {liveMatches.filter((m) => m.status === 'SIMULATING').slice(0, 3).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onEnterRoom={() => navigate(`/live/${match.id}`)}
                  onPredict={() => navigate(`/predictions/new/${match.id}`)}
                />
              ))}
            </GridGap>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link
                to="/live"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  color: 'var(--mm-accent-green)',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  transition: 'opacity 0.2s',
                }}
              >
                SEE ALL LIVE MATCHES →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          SPORTS COVERAGE — GridGap + Kinetic tiles
          ═══════════════════════════════════════════════════ */}
      <section
        ref={sportsRef}
        className="kinetic-sports"
        style={{
          padding: '80px 0',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{ textAlign: 'center', marginBottom: 40 }}
          >
            <KineticRevealText
              text="6 SPORTS COVERED"
              as="h2"
              mode="char"
              className="kinetic-text"
              style={{
                fontSize: 'var(--kinetic-text-xl)',
                marginBottom: 12,
              }}
            />
            <p style={{ color: 'var(--mm-text-secondary)', fontSize: 'var(--kinetic-text-sm)' }}>
              From the pitch to the court, we've got you covered
            </p>
          </motion.div>

          <GridGap
            columns={{ default: 2, sm: 3 }}
            gap="var(--kinetic-grid-gap-sm)"
            mode="stagger"
          >
            {sports.map((sport, i) => {
              const liveCounts = [4, 3, 1, 2, 1, 0]
              const liveCount = liveCounts[i]
              return (
                <motion.div
                  key={i}
                  className="kinetic-sport-tile"
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'var(--mm-bg-secondary)',
                    border: `1px solid var(--border-subtle)`,
                    borderRadius: 'var(--radius-xl)',
                    padding: '32px 24px',
                    cursor: 'pointer',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                  }}
                  whileHover={{
                    scale: 1.03,
                    borderColor: sport.color,
                    boxShadow: `0 0 32px ${sport.color}20`,
                    transition: { duration: 0.2 },
                  }}
                  onClick={() => navigate(`/scores/${sport.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/scores/${sport.slug}`)}
                >
                  {/* Hover glow */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--radius-xl)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      background: `radial-gradient(circle at 50% 50%, ${sport.color}15 0%, transparent 70%)`,
                    }}
                    className="kinetic-sport-glow"
                  />

                  {/* Live count badge */}
                  <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: `${sport.color}18`,
                        color: sport.color,
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      <motion.span
                        style={{ width: 6, height: 6, borderRadius: '50%', background: sport.color, display: 'inline-block' }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      {liveCount} Live
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <motion.span
                      style={{ fontSize: 40, display: 'block', marginBottom: 12 }}
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      {sport.icon}
                    </motion.span>
                    <h3
                      className="kinetic-text"
                      style={{ fontSize: 'var(--kinetic-text-sm)', color: sport.color, marginBottom: 4 }}
                    >
                      {sport.name}
                    </h3>
                    <p style={{ color: 'var(--mm-text-muted)', fontSize: 11 }}>{sport.leagues}</p>
                  </div>
                </motion.div>
              )
            })}
          </GridGap>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TESTIMONIALS — Kinetic rotation
          ═══════════════════════════════════════════════════ */}
      <section style={{ padding: '80px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <KineticRevealText
            text="WHAT FANS SAY"
            as="h2"
            mode="char"
            className="kinetic-text"
            style={{ fontSize: 'var(--kinetic-text-xl)', marginBottom: 32 }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -24, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              style={{ minHeight: 100 }}
            >
              <p
                style={{
                  fontSize: 'var(--kinetic-text-sm)',
                  color: 'var(--mm-text-secondary)',
                  fontStyle: 'italic',
                  marginBottom: 16,
                  lineHeight: 1.6,
                }}
              >
                {testimonials[testimonialIdx].text}
              </p>
              <p style={{ fontWeight: 600, color: 'var(--mm-accent-green)' }}>
                — {testimonials[testimonialIdx].author}
              </p>
            </motion.div>
          </AnimatePresence>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {testimonials.map((_, i) => (
              <motion.button
                key={i}
                style={{
                  height: 8,
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  cursor: 'pointer',
                  background: i === testimonialIdx ? 'var(--mm-accent-green)' : 'var(--mm-text-muted)',
                  width: i === testimonialIdx ? 24 : 8,
                  transition: 'all 0.3s ease',
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTestimonialIdx(i)}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA BANNER — Kinetic energy
          ═══════════════════════════════════════════════════ */}
      <section
        className="kinetic-cta-banner"
        style={{
          position: 'relative',
          padding: '96px 0',
          overflow: 'hidden',
          background: 'var(--gradient-live)',
        }}
      >
        {/* Floating sparkle particles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {sparkles.map((s, i) => (
            <motion.span
              key={i}
              style={{
                position: 'absolute',
                top: `${s.top}%`,
                left: `${s.left}%`,
                fontSize: `${s.size}px`,
                color: 'rgba(255,255,255,0.2)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: s.delay,
              }}
            >
              {s.symbol}
            </motion.span>
          ))}
        </div>

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2
              className="kinetic-text"
              style={{
                fontSize: 'var(--kinetic-text-2xl)',
                color: 'var(--mm-text-inverse)',
                marginBottom: 12,
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              READY TO PROVE YOU KNOW SPORT?
            </h2>
            <p style={{ fontSize: 'var(--kinetic-text-sm)', color: 'rgba(0,0,0,0.7)', marginBottom: 32 }}>
              No credit card. No downloads. Just sport.
            </p>

            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ display: 'inline-block' }}
            >
              <Link
                to="/signup"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'var(--mm-text-inverse)',
                  color: 'var(--mm-accent-green)',
                  fontWeight: 700,
                  fontSize: 14,
                  padding: '16px 40px',
                  borderRadius: 'var(--radius-md)',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  transition: 'box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                JOIN FOR FREE — IT TAKES 30 SECONDS
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ArrowRight size={20} />
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════ */}
      <footer
        style={{
          background: 'var(--mm-bg-secondary)',
          borderTop: '1px solid var(--border-subtle)',
          padding: '48px 0',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32 }}>
            {/* Brand column */}
            <div style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--gradient-live)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: 'var(--mm-text-inverse)', fontWeight: 700, fontSize: 14 }}>MM</span>
                </div>
                <span
                  className="kinetic-text"
                  style={{ fontSize: 'var(--kinetic-text-md)', lineHeight: 'var(--kinetic-leading-compact)' }}
                >
                  MatchMind
                </span>
              </div>
              <p style={{ color: 'var(--mm-text-secondary)', fontSize: 13, marginBottom: 16 }}>
                The Internet's Sports Bar
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['Twitter', 'Discord', 'Instagram', 'YouTube'].map((social) => (
                  <motion.span
                    key={social}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--mm-bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      color: 'var(--mm-text-muted)',
                      cursor: 'default',
                    }}
                    whileHover={{
                      background: 'var(--mm-bg-hover)',
                      color: 'var(--mm-text-secondary)',
                      scale: 1.1,
                    }}
                  >
                    {social.charAt(0)}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              { title: 'Product', links: [{ label: 'Live', to: '/live' }, { label: 'Scores', to: '/scores' }, { label: 'Leaderboard', to: '/leaderboard' }, { label: 'Predictions', to: '/predictions' }] },
              { title: 'Community', links: [{ label: 'Leagues', to: '/leagues' }, { label: 'Squads', to: '/squads' }, { label: 'Explore', to: '/explore' }] },
              { title: 'Company', links: [{ label: 'About', to: '/about' }, { label: 'FAQ', to: '/faq' }, { label: 'Privacy', to: '#' }, { label: 'Terms', to: '#' }] },
            ].map((col, i) => (
              <div key={i}>
                <h4 style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>{col.title}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {col.links.map((link, j) => (
                    <Link
                      key={j}
                      to={link.to}
                      style={{
                        fontSize: 13,
                        color: 'var(--mm-text-secondary)',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 40,
              paddingTop: 24,
              borderTop: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 11, color: 'var(--mm-text-muted)' }}>
              &copy; 2026 MatchMind. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

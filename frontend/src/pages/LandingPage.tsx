import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Trophy, Timer, Shield, Star, ChevronDown } from 'lucide-react'
import { motion, useAnimation, useInView } from 'framer-motion'
import { gsap } from '../lib/animation/gsap'
import { useTournaments } from '../lib/tournaments'

function AnimatedCountUp({ value, suffix = '', duration = 2 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView && ref.current) {
      gsap.fromTo(ref.current, { textContent: 0 }, { textContent: value, duration, snap: { textContent: 1 }, ease: 'power2.out' })
    }
  }, [isInView, value, duration])

  return <span ref={ref}>{value}</span>
}

const TOURNAMENT_ICONS: Record<string, string> = {
  trophy: '🏆',
  'star-ball': '⭐',
  'orange-ball': '⚽',
  'continent-africa': '🌍',
  'trophy-women': '🏆',
  'continent-samerica': '🌎',
}

export default function LandingPage() {
  const { data: tournaments } = useTournaments()
  const heroRef = useRef(null)

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelectorAll('.hero-anim'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out' })
    }
  }, [])

  return (
    <div className="min-h-screen">
      {/* ── HERO ───────────────────────────────────── */}

      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[var(--mm-bg-primary)] via-[var(--mm-bg-secondary)] to-[var(--mm-bg-primary)]">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 75% 75%, #8E44FF 0%, transparent 50%)' }} />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--mm-accent-green)]/10 border border-[var(--mm-accent-green)]/20 rounded-[var(--radius-full)] text-sm font-semibold text-[var(--mm-accent-green)]">
              ⚽ Football Fantasy Auctions
            </span>
          </motion.div>

          <h1 className="hero-anim text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--mm-text-primary)] mb-6">
            Draft Your XI.
            <br />
            <span className="bg-gradient-to-r from-[var(--mm-accent-green)] to-[var(--mm-accent-amber)] bg-clip-text text-transparent">
              Conquer the Tournament.
            </span>
          </h1>

          <p className="hero-anim text-lg md:text-xl text-[var(--mm-text-secondary)] max-w-2xl mx-auto mb-10">
            Create private auction rooms, draft real footballers from FIFA World Cup 2026 and
            UEFA Champions League 2026/27, then track your franchise's rise through the leaderboard.
          </p>

          <div className="hero-anim flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-8 py-3.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300 flex items-center gap-2">
              Start Your Auction <ArrowRight size={18} />
            </Link>
            <Link to="/how-it-works" className="bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body font-semibold px-8 py-3.5 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-all duration-300 flex items-center gap-2 border border-[var(--border-subtle)]">
              How Auctions Work <ChevronDown size={18} />
            </Link>
          </div>

          {/* Tournament Cards */}
          {tournaments && tournaments.filter(t => t.status === 'LIVE' || t.status === 'ANNOUNCED').length > 0 && (
            <div className="hero-anim mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {(tournaments).filter(t => t.status === 'LIVE' || t.status === 'ANNOUNCED').map((t) => (
                <div key={t.id} className="p-6 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--mm-bg-secondary)] hover:shadow-lg transition-all"
                  style={{ borderColor: t.theme.accent + '30' }}
                >
                  <div className="text-3xl mb-3">{TOURNAMENT_ICONS[t.nav.icon] || '⚽'}</div>
                  <h3 className="text-lg font-bold text-[var(--mm-text-primary)] mb-1">{t.name}</h3>
                  <p className="text-sm text-[var(--mm-text-muted)]">{t.confederation} · {t.teamCount} teams{t.status === 'ANNOUNCED' ? ' · Coming soon' : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown size={24} className="text-[var(--mm-text-muted)]" />
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────── */}

      <section className="py-20 bg-[var(--mm-bg-secondary)] border-y border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: '⚽', value: tournaments?.filter(t => t.status === 'LIVE').length || 0, suffix: ' Tournaments', label: 'Live' },
            { icon: '🏃', value: 500, suffix: '+', label: 'Players to Draft' },
            { icon: '👥', value: 1000, suffix: '+', label: 'Active Players' },
            { icon: '🏆', value: tournaments?.filter(t => t.status === 'LIVE').length || 0, suffix: ' Leagues', label: 'Supported' },
          ].map((stat) => (
            <div key={stat.label} className="hero-anim">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-[var(--mm-text-primary)]">
                <AnimatedCountUp value={stat.value} />{stat.suffix}
              </div>
              <div className="text-sm text-[var(--mm-text-muted)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────── */}

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--mm-text-primary)] mb-16">How Auctions Work</h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: <Users size={28} />, title: 'Create Room', desc: 'Pick your tournament (WC26 or UCL), set budget & roster rules, and share the invite code.' },
              { step: '02', icon: <Timer size={28} />, title: 'Live Auction', desc: 'Host runs the auction. Bid on players under the hammer — last-second bids trigger anti-sniping protection.' },
              { step: '03', icon: <Shield size={28} />, title: 'Build Your Squad', desc: 'Set captain (×2) and vice-captain (×1.5). Fill your starting XI across GK, DEF, MID, FWD.' },
              { step: '04', icon: <Star size={28} />, title: 'Track & Win', desc: 'Players score fantasy points from real match performances. The room leaderboard updates live.' },
            ].map((step) => (
              <div key={step.step} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--gradient-live)] flex items-center justify-center text-[var(--mm-text-inverse)] group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="text-sm font-bold text-[var(--mm-accent-green)] mb-2">{step.step}</div>
                <h3 className="text-lg font-bold text-[var(--mm-text-primary)] mb-2">{step.title}</h3>
                <p className="text-sm text-[var(--mm-text-muted)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}

      <section className="py-20 bg-gradient-to-r from-[var(--mm-accent-green)]/5 to-[var(--mm-accent-purple)]/5 border-t border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--mm-text-primary)] mb-4">Ready to Draft Your Dream XI?</h2>
          <p className="text-lg text-[var(--mm-text-secondary)] mb-8">No money down. Just bring your football knowledge and competitive spirit.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-8 py-3.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}

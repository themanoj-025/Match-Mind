// @ts-nocheck
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, Trophy, Timer, Shield, Star, ChevronDown } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
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
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.querySelectorAll('.hero-anim'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power3.out' })
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      {/* ── METADATA HEADER ───────────────────────── */}
      <div className="border-b-4 border-[#111111] py-2 px-4 max-w-screen-xl mx-auto flex justify-between items-center font-mono text-xs uppercase tracking-widest text-[#111111]">
        <span>Vol. 1</span>
        <span>The Daily Draft</span>
        <span>Global Edition</span>
      </div>

      {/* ── HERO ───────────────────────────────────── */}
      <section ref={heroRef} className="max-w-screen-xl mx-auto px-4 md:px-8 pt-12 pb-24 border-b-2 border-[#111111]">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Headline (8 cols) */}
          <div className="lg:col-span-8 lg:border-r-2 lg:border-[#111111] lg:pr-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="mb-6">
              <span className="font-mono text-xs uppercase tracking-widest text-[#CC0000] border border-[#CC0000] px-3 py-1 sharp-corners font-bold">
                Fantasy Football
              </span>
            </motion.div>

            <h1 className="hero-anim text-fluid-hero text-[#111111] mb-8 uppercase break-words">
              Draft Your XI. Conquer It All.
            </h1>

            <p className="hero-anim font-body text-lg md:text-xl text-[#525252] mb-10 max-w-2xl leading-relaxed text-justify">
              <span className="float-left text-fluid-hero leading-none mr-3 mt-1">C</span>reate private auction rooms, draft real footballers from the World's biggest tournaments, and track your franchise's rise through the leaderboard. Absolute authority in fantasy drafting.
            </p>

            <div className="hero-anim flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="bg-[#111111] text-[#F9F9F7] border border-transparent hover:bg-white hover:text-[#111111] hover:border-[#111111] sharp-corners px-8 py-4 font-mono text-sm uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 group w-full sm:w-auto">
                Start Your Auction <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/how-it-works" className="bg-transparent text-[#111111] border border-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7] sharp-corners px-8 py-4 font-mono text-sm uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 w-full sm:w-auto">
                Read The Rules
              </Link>
            </div>
          </div>

          {/* Side Column (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-8 hero-anim">
            <h3 className="font-mono text-xs uppercase tracking-widest border-b border-[#111111] pb-2 font-bold text-[#111111]">
              Live Tournaments
            </h3>
            
            {tournaments && tournaments.filter(t => t.status === 'LIVE' || t.status === 'ANNOUNCED').length > 0 ? (
              <div className="flex flex-col gap-6">
                {(tournaments).filter(t => t.status === 'LIVE' || t.status === 'ANNOUNCED').map((t) => (
                  <div key={t.id} className="border border-[#111111] bg-white p-6 sharp-corners hover:bg-neutral-100 transition-colors hard-shadow-hover relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 grayscale group-hover:grayscale-0 transition-all opacity-20 text-6xl">
                      {TOURNAMENT_ICONS[t.nav.icon] || '⚽'}
                    </div>
                    <div className="relative z-10">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-[#CC0000] mb-2 font-bold">{t.status}</div>
                      <h3 className="font-serif text-2xl font-black text-[#111111] mb-2">{t.name}</h3>
                      <p className="font-mono text-xs text-[#525252] uppercase tracking-wider">{t.confederation} • {t.teamCount} Teams</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-[#111111] p-6 bg-neutral-100 sharp-corners text-center font-mono text-xs uppercase tracking-widest text-[#737373]">
                No live tournaments
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── STATS (MARQUEE STYLE) ───────────────────── */}
      <section className="border-b-2 border-[#111111] bg-[#111111] text-[#F9F9F7] overflow-hidden py-3">
        <div className="flex items-center gap-8 whitespace-nowrap animate-scroll-ticker font-mono text-sm uppercase tracking-widest">
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-[#CC0000] font-bold">● LIVE STATS</span>
              <span><AnimatedCountUp value={tournaments?.filter(t => t.status === 'LIVE').length ?? 2} /> Tournaments</span>
              <span><AnimatedCountUp value={500} />+ Players to Draft</span>
              <span><AnimatedCountUp value={1000} />+ Active Managers</span>
              <span><AnimatedCountUp value={2} /> Supported Leagues</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS (INVERTED GRID) ────────────── */}
      <section className="bg-[#111111] text-[#F9F9F7] py-24 newsprint-texture border-b-4 border-[#111111]">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="border-b border-[#333333] pb-6 mb-12 flex items-end justify-between">
            <h2 className="text-fluid-display uppercase">The Blueprint</h2>
            <span className="font-mono text-xs uppercase tracking-widest text-[#CC0000] hidden sm:block">Fig 1. Auction Rules</span>
          </div>

          <div className="grid md:grid-cols-4 gap-0 border border-[#333333]">
            {[
              { step: '01', icon: <Users className="w-8 h-8 shrink-0" strokeWidth={1.5} />, title: 'Create Room', desc: 'Pick your tournament, set budget rules, and invite rivals.' },
              { step: '02', icon: <Timer className="w-8 h-8 shrink-0" strokeWidth={1.5} />, title: 'Live Auction', desc: 'Bid on players under the hammer. Beware the anti-sniping clock.' },
              { step: '03', icon: <Shield className="w-8 h-8 shrink-0" strokeWidth={1.5} />, title: 'Build Squad', desc: 'Set captain (×2) and vice-captain (×1.5). Fill your starting XI.' },
              { step: '04', icon: <Star className="w-8 h-8 shrink-0" strokeWidth={1.5} />, title: 'Track & Win', desc: 'Players score fantasy points from real match performances.' },
            ].map((step, idx) => (
              <div key={step.step} className={`p-8 border-[#333333] hover:bg-[#1a1a1a] transition-colors ${idx !== 3 ? 'md:border-r border-b md:border-b-0' : 'border-b md:border-b-0'}`}>
                <div className="text-[#CC0000] mb-6 flex justify-between items-start">
                  {step.icon}
                  <span className="font-mono text-lg font-bold">{step.step}</span>
                </div>
                <h3 className="font-serif text-2xl font-bold mb-4">{step.title}</h3>
                <p className="font-body text-[#A3A3A3] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="py-24 max-w-screen-md mx-auto px-4 text-center">
        <h2 className="text-fluid-hero uppercase text-[#111111] mb-6 leading-none">Take The Pitch.</h2>
        <p className="font-body text-xl text-[#525252] mb-10 leading-relaxed">No money down. Absolute bragging rights. Bring your football knowledge to the auction table.</p>
        <Link to="/signup" className="inline-flex items-center gap-3 bg-[#CC0000] text-white border border-[#CC0000] hover:bg-white hover:text-[#CC0000] sharp-corners px-10 py-5 font-mono text-sm uppercase tracking-widest font-bold transition-all duration-200">
          Subscribe Now <ArrowRight size={20} />
        </Link>
      </section>
      
      {/* ── METADATA FOOTER ───────────────────────── */}
      <div className="border-t-2 border-[#111111] py-4 px-4 max-w-screen-xl mx-auto flex justify-between items-center font-mono text-[10px] uppercase tracking-widest text-[#737373]">
        <span>© 2026 MatchMind</span>
        <span>Printed in Cyberspace</span>
      </div>
    </div>
  )
}


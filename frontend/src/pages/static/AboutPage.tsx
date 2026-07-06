// @ts-nocheck
import React, { useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Users, Zap, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useScrollReveal, animateCountUp, killAllScrollTriggers } from '../../lib/animation/gsap'
import { cardStaggerContainer, cardStaggerItem } from '../../lib/animation/variants'

const team = [
  { name: 'Alex Chen', role: 'CEO & Founder', emoji: '👨‍💻' },
  { name: 'Sarah Johnson', role: 'CTO', emoji: '👩‍💻' },
  { name: 'Marcus Williams', role: 'Head of Product', emoji: '👨‍🎨' },
  { name: 'Priya Patel', role: 'Head of Engineering', emoji: '👩‍🔬' },
  { name: 'James Rodriguez', role: 'Sports Director', emoji: '👨‍🏫' },
  { name: 'Emma Thompson', role: 'Community Lead', emoji: '👩‍👧' },
]

const values = [
  { icon: Target, title: 'Accuracy', desc: 'Every prediction matters. We reward precision.' },
  { icon: Users, title: 'Community', desc: 'Built by fans, for fans. The Internet\'s Sports Bar.' },
  { icon: Zap, title: 'Real-Time', desc: 'Live scores, instant updates, zero delay.' },
  { icon: Shield, title: 'Fair Play', desc: 'Level playing field for every predictor.' },
]

export default function AboutPage() {
  const statsRef = useRef(null)
  const valuesRef = useRef(null)

  useEffect(() => {
    const reveals = []
    if (valuesRef.current) {
      reveals.push(useScrollReveal(valuesRef.current.querySelectorAll('.value-card')))
    }
    if (statsRef.current) {
      const counters = statsRef.current.querySelectorAll('[data-countup]')
      const tweens = []
      counters.forEach((counter) => {
        const target = parseInt(counter.dataset.target, 10)
        tweens.push(animateCountUp(counter, target, 2))
      })
      reveals.push({ kill: () => tweens.forEach((t) => t.kill()) })
    }
    return () => {
      reveals.forEach((r) => r.kill())
      killAllScrollTriggers()
    }
  }, [])

  return (
    <motion.div className="min-h-screen">
      <Helmet>
        <title>About MatchMind — The Internet's Sports Bar</title>
      </Helmet>

      {/* Hero */}
      <section className="py-20 sm:py-28" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-fluid-display mb-4">WELCOME TO MATCHMIND</h1>
          <p className="body-large text-[var(--mm-text-secondary)] max-w-2xl mx-auto">
            We're building the world's most exciting social sports prediction network.
            Watch live. Predict scores. Compete with millions.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-16 bg-[var(--mm-bg-secondary)] border-y border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {[
              { target: 12847, label: 'Users Online', color: 'var(--mm-accent-green)' },
              { target: 83200, label: 'Predictions Today', color: 'var(--mm-accent-amber)' },
              { target: 6, label: 'Sports Covered', color: 'var(--mm-accent-blue)' },
              { target: 47, label: 'Countries', color: 'var(--mm-accent-purple)' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-fluid-display" style={{ color: stat.color }} data-countup data-target={stat.target}>0</div>
                <p className="body text-[var(--mm-text-secondary)] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4">
        <h2 className="text-fluid-display mb-6">OUR STORY</h2>
        <div className="space-y-4 body-large text-[var(--mm-text-secondary)]">
          <p>
            MatchMind was born in a sports bar in Manchester, where a group of friends
            argued endlessly about who truly knew sport best. The idea was simple:
            what if every match became a chance to prove it?
          </p>
          <p>
            From that spark, we built a platform where millions of fans watch live sports,
            predict outcomes, compete on leaderboards, and talk sport together in real-time.
          </p>
          <p>
            Today, MatchMind covers 6 sports across 47 countries, with thousands of
            predictions made every minute. And we're just getting started.
          </p>
        </div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="py-16 sm:py-24 bg-[var(--mm-bg-secondary)] border-y border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-fluid-display text-center mb-12">WHAT WE BELIEVE</h2>
          <motion.div variants={cardStaggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} variants={cardStaggerItem} className="value-card bg-[var(--mm-bg-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 text-center hover:border-[var(--border-active)] transition-all">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--gradient-live)] flex items-center justify-center">
                  <v.icon size={24} className="text-[var(--mm-text-inverse)]" />
                </div>
                <h3 className="heading-3 mb-2">{v.title}</h3>
                <p className="body text-[var(--mm-text-secondary)]">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4">
        <h2 className="text-fluid-display text-center mb-12">MEET THE TEAM</h2>
        <motion.div variants={cardStaggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <motion.div key={i} variants={cardStaggerItem} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6 text-center hover:border-[var(--border-active)] transition-all">
              <div className="text-5xl mb-3">{member.emoji}</div>
              <h3 className="body font-semibold">{member.name}</h3>
              <p className="caption text-[var(--mm-text-muted)]">{member.role}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-[var(--gradient-live)]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-fluid-display text-[var(--mm-text-inverse)] mb-4">JOIN THE MOVEMENT</h2>
          <p className="body-large text-[var(--mm-text-inverse)]/80 mb-8">Be part of the Internet's Sports Bar.</p>
          <Link to="/signup" className="inline-flex items-center gap-2 bg-[var(--mm-text-inverse)] text-[var(--mm-accent-green)] body font-bold px-8 py-4 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-elevated)] transition-all group">
            Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </motion.div>
  )
}


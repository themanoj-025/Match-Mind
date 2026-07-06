// @ts-nocheck
import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Sparkles, ArrowRight, Zap, Brain, BarChart3, Shield, Users, Bell, Download, Star } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: { monthly: '$0', annual: '$0' },
    description: 'Get started with the basics',
    features: [
      'Unlimited score predictions',
      'Live match rooms & chat',
      'Global leaderboard',
      'Up to 3 private leagues',
      'Basic profile & achievements',
    ],
    cta: 'Get Started Free',
    ctaLink: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: { monthly: '$4.99', annual: '$3.33' },
    period: { monthly: '/month', annual: '/month' },
    description: 'Unlock the full MatchMind experience',
    features: [
      'Everything in Free',
      '🤖 AI Prediction Insights',
      '📊 Advanced Prediction Analytics',
      '🚫 Ad-free experience',
      '📥 Export predictions (CSV/PDF)',
      '✨ Exclusive Pro badges (animated)',
      '🎨 Custom profile themes',
      '♾️ Unlimited private leagues',
      '🔔 Priority notifications',
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/api/stripe/checkout',
    highlighted: true,
  },
]

const faqs = [
  { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime from Settings → Billing. You keep Pro benefits until the end of your billing period.' },
  { q: 'Is there a free trial?', a: 'We offer a 14-day no-questions-asked refund policy. Try Pro risk-free.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit cards via Stripe. Apple Pay is available on iOS.' },
  { q: 'Can I switch from monthly to annual?', a: 'Yes, you can switch anytime. The annual plan saves you 33%.' },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const handleCheckout = async (planName) => {
    setSelectedPlan(planName)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: isAnnual ? 'annual' : 'monthly' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setSelectedPlan(null)
    }
  }

  return (
    <motion.div className="min-h-screen pt-16 pb-20">
      <Helmet>
        <title>Pricing — MatchMind Pro</title>
        <meta name="description" content="MatchMind Pro — $4.99/month or $39.99/year. Unlock AI predictions, advanced analytics, exclusive badges, and more." />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="display-l mb-3">BECOME A MATCHMIND PRO</h1>
            <p className="body-large text-[var(--mm-text-secondary)] max-w-xl mx-auto">
              Unlock AI predictions, advanced analytics, and exclusive badges
            </p>
          </motion.div>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`body font-medium ${!isAnnual ? 'text-[var(--mm-text-primary)]' : 'text-[var(--mm-text-muted)]'}`}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isAnnual ? 'bg-[var(--mm-accent-green)]' : 'bg-[var(--mm-bg-tertiary)]'}`}
            role="switch"
            aria-checked={isAnnual}
            aria-label="Toggle annual billing"
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
          <span className={`body font-medium ${isAnnual ? 'text-[var(--mm-text-primary)]' : 'text-[var(--mm-text-muted)]'}`}>
            Annual <span className="caption text-[var(--mm-accent-green)] font-semibold">Save 33%</span>
          </span>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative rounded-[var(--radius-xl)] p-6 sm:p-8 transition-all ${
                plan.highlighted
                  ? 'bg-[var(--mm-bg-secondary)] border-2 border-[var(--border-pro)] shadow-[var(--shadow-glow-purple)]'
                  : 'bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)]'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--gradient-pro)] text-white caption font-semibold">
                  Most Popular
                </div>
              )}

              <h2 className="heading-2 mb-1">{plan.name}</h2>
              <p className="caption text-[var(--mm-text-secondary)] mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="display-l">{isAnnual ? plan.price.annual : plan.price.monthly}</span>
                {plan.period && <span className="body text-[var(--mm-text-muted)] ml-1">{isAnnual ? plan.period.annual : plan.period.monthly}</span>}
                {isAnnual && plan.highlighted && (
                  <span className="block caption text-[var(--mm-accent-green)] font-medium mt-1">$39.99/year — Save 33%</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    {plan.highlighted ? (
                      <Sparkles size={16} className="text-[var(--mm-accent-purple)] mt-0.5 shrink-0" />
                    ) : (
                      <Check size={16} className="text-[var(--mm-accent-green)] mt-0.5 shrink-0" />
                    )}
                    <span className="body text-[var(--mm-text-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.highlighted ? (
                <button
                  onClick={() => handleCheckout(plan.name)}
                  disabled={selectedPlan === plan.name}
                  className="w-full bg-[var(--gradient-pro)] text-white body font-bold py-3.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-purple)] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {selectedPlan === plan.name ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                  ) : (
                    <><Sparkles size={18} /> {plan.cta}</>
                  )}
                </button>
              ) : (
                <Link
                  to={plan.ctaLink}
                  className="w-full block text-center bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body font-semibold py-3.5 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-all"
                >
                  {plan.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <div className="text-center mt-8">
          <p className="body text-[var(--mm-text-secondary)]">14-day no-questions-asked refund</p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h2 className="display-l text-center mb-8">QUESTIONS?</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] group">
                <summary className="px-5 py-4 body font-medium cursor-pointer list-none flex items-center justify-between group-open:text-[var(--mm-accent-green)]">
                  {faq.q}
                  <span className="text-[var(--mm-text-muted)] group-open:rotate-180 transition-transform duration-200">▼</span>
                </summary>
                <div className="px-5 pb-4 body text-[var(--mm-text-secondary)] border-t border-[var(--border-subtle)] pt-3">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}


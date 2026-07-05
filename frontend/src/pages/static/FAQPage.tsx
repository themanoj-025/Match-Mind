import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'

const categories = [
  { id: 'general', label: 'General' },
  { id: 'predictions', label: 'Predictions' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'leagues', label: 'Leagues' },
  { id: 'account', label: 'Account' },
  { id: 'pro', label: 'MatchMind Pro' },
]

const faqs = {
  general: [
    { q: 'What is MatchMind?', a: 'MatchMind is a real-time social sports prediction network. Watch live matches, predict scores, compete on leaderboards, and chat with fans — all in one place.' },
    { q: 'Is MatchMind free?', a: 'Yes! MatchMind is free to use. We offer a Pro subscription with additional features like AI predictions, advanced analytics, and exclusive badges.' },
    { q: 'What sports are covered?', a: 'We cover Football (Premier League, La Liga, UCL, etc.), Basketball (NBA, NCAA), American Football (NFL, NCAA), Tennis (Grand Slams), Cricket (IPL, T20), and Ice Hockey (NHL).' },
    { q: 'Can I play with friends?', a: 'Absolutely! Create private leagues, form squads, and compete directly with friends. Share your invite code and challenge them to beat your predictions.' },
  ],
  predictions: [
    { q: 'How do predictions work?', a: 'Before a match kicks off (and during for in-play), you predict the final score. Earn points for correct results and bonus points for exact scores.' },
    { q: 'When can I make predictions?', a: 'Pre-match predictions open when fixtures are published. In-play predictions lock when the match kicks off.' },
    { q: 'How is scoring calculated?', a: 'Correct result (win/draw/loss): +15 pts. Exact score: +50 pts. First goalscorer: +20 pts. Early bird bonus: +5 pts. Streak bonuses also apply.' },
    { q: 'What happens if a match is postponed?', a: 'Predictions for postponed matches are voided and no points are earned or lost.' },
  ],
  leaderboard: [
    { q: 'How is the leaderboard ranked?', a: 'By total points earned. In case of ties, accuracy percentage is used as a tiebreaker.' },
    { q: 'When does the leaderboard reset?', a: 'The weekly leaderboard resets every Monday at 00:00 UTC. Monthly resets on the 1st. All-time never resets.' },
    { q: 'What are tiers?', a: 'Tiers (Bronze → Silver → Gold → Platinum → Diamond → Legend) are based on total points earned. Higher tiers unlock exclusive features and recognition.' },
  ],
  leagues: [
    { q: 'How do I create a league?', a: 'Go to Leagues → Create League. Set a name, choose your sport focus, set privacy, and invite friends using the generated code.' },
    { q: 'Can I join an existing league?', a: 'Yes! Browse public leagues or enter an invite code shared by a friend.' },
    { q: 'Is there a limit on leagues?', a: 'Free users can join up to 3 leagues. Pro users get unlimited league access.' },
  ],
  account: [
    { q: 'How do I reset my password?', a: 'Go to Login → Forgot Password. Enter your email and we\'ll send a reset link.' },
    { q: 'Can I delete my account?', a: 'Yes, from Settings → Connections. Account deletion has a 30-day grace period.' },
    { q: 'How do I change my username?', a: 'Go to Settings → Account. Username changes are limited to once every 30 days.' },
  ],
  pro: [
    { q: 'What is MatchMind Pro?', a: 'Pro is our premium subscription ($4.99/month or $39.99/year) that unlocks AI prediction insights, advanced analytics, exclusive badges, and more.' },
    { q: 'What AI features come with Pro?', a: 'AI-powered match predictions with confidence scores, personalized insights, form analysis, and smart recommendations.' },
    { q: 'Can I cancel my subscription?', a: 'Yes, anytime from Settings → Billing. You keep Pro benefits until the end of your billing period.' },
  ],
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('general')
  const [openItem, setOpenItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const currentFaqs = faqs[activeCategory] || []
  const filteredFaqs = searchQuery
    ? Object.values(faqs).flat().filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : currentFaqs

  return (
    <motion.div className="min-h-screen pt-16 pb-20">
      <Helmet>
        <title>FAQ — MatchMind Help Center</title>
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="display-l mb-2 text-center">FREQUENTLY ASKED QUESTIONS</h1>
        <p className="body-large text-[var(--mm-text-secondary)] text-center mb-8">Everything you need to know about MatchMind</p>

        {/* Search */}
        <div className="relative mb-8">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-[var(--mm-bg-secondary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-lg)] pl-11 pr-4 py-3.5 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-[3px] focus:ring-[var(--mm-accent-green-glow)] transition-all"
          />
        </div>

        {/* Category tabs */}
        {!searchQuery && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setOpenItem(null) }}
                className={`px-4 py-2 rounded-[var(--radius-full)] body whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] font-semibold'
                    : 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] hover:bg-[var(--mm-bg-hover)]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* FAQ items */}
        <div className="space-y-2">
          {filteredFaqs.map((faq, i) => (
            <div key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
              <button
                onClick={() => setOpenItem(openItem === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[var(--mm-bg-hover)] transition-colors"
              >
                <span className="body font-medium pr-4">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-[var(--mm-text-muted)] shrink-0 transition-transform duration-300 ${
                    openItem === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openItem === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 body text-[var(--mm-text-secondary)] border-t border-[var(--border-subtle)] pt-3">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="body text-[var(--mm-text-muted)]">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

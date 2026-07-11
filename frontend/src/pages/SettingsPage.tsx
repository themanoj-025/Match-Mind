import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Moon,
  Trash2,
  Sparkles,
  CreditCard,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader,
} from 'lucide-react'
import { useStripeStatus } from '../hooks/useApi'

export default function SettingsPage() {
  const [portalLoading, setPortalLoading] = useState(false)
  const { data: proStatus, isLoading: loading } = useStripeStatus()

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      console.error('Portal error:', err)
    } finally {
      setPortalLoading(false)
    }
  }

  const sections = [
    {
      icon: User,
      label: 'Profile',
      desc: 'Avatar, display name, bio, favourite sports',
      link: '/profile/me',
    },
    {
      icon: Mail,
      label: 'Account',
      desc: 'Email, password, connected accounts',
      link: null,
    },
    {
      icon: Bell,
      label: 'Notifications',
      desc: 'Push/email toggles per event type',
      link: '/profile/me/notifications',
    },
    {
      icon: Shield,
      label: 'Privacy',
      desc: 'Public/private profile, prediction history',
      link: null,
    },
    {
      icon: Moon,
      label: 'Appearance',
      desc: 'Theme: Dark / Light / AMOLED Black',
      link: null,
    },
    {
      icon: Trash2,
      label: 'Danger Zone',
      desc: 'Delete account permanently',
      link: null,
    },
  ]

  return (
    <motion.div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Link
          to="/profile/me"
          className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <h1 className="heading-1 mb-6">Settings</h1>

        {/* Pro Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--mm-bg-secondary)] border border-[var(--border-pro)]/40 rounded-[var(--radius-xl)] p-5 mb-6 relative overflow-hidden"
        >
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--gradient-pro)]" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--gradient-pro)] flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="heading-3">MatchMind Pro</h3>
                {loading ? (
                  <div className="flex items-center gap-2 caption text-[var(--mm-text-muted)]">
                    <Loader size={12} className="animate-spin" /> Checking status...
                  </div>
                ) : (proStatus as any)?.isPro ? (
                  <div className="flex items-center gap-1.5 caption">
                    <CheckCircle size={12} className="text-[var(--mm-accent-green)]" />
                    <span className="text-[var(--mm-accent-green)] font-semibold">Active</span>
                    {(proStatus as any)?.subscription && (
                      <span className="text-[var(--mm-text-muted)]">
                        · {(proStatus as any).subscription.plan === 'annual' ? 'Annual' : 'Monthly'} plan
                        {(proStatus as any).subscription.cancelAtPeriodEnd ? ' · Cancels at period end' : ''}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 caption">
                    <XCircle size={12} className="text-[var(--mm-text-muted)]" />
                    <span className="text-[var(--mm-text-muted)]">Free tier</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(proStatus as any)?.isPro ? (
                <button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  className="flex items-center gap-1.5 body font-semibold text-[var(--mm-accent-purple)] hover:text-[var(--mm-accent-green)] transition-colors px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)]"
                >
                  {portalLoading ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <>
                      <ExternalLink size={14} /> Manage
                    </>
                  )}
                </button>
              ) : (
                <Link
                  to="/pricing"
                  className="flex items-center gap-1.5 bg-[var(--gradient-pro)] text-white body font-semibold px-4 py-2 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-purple)] transition-all duration-300"
                >
                  <Sparkles size={14} /> Upgrade
                </Link>
              )}
            </div>
          </div>

          {/* Pro expiry */}
          {(proStatus as any)?.proExpiresAt && (
            <p className="caption text-[var(--mm-text-muted)] mt-2 ml-[52px]">
              Expires{' '}
              {new Date((proStatus as any).proExpiresAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </motion.div>

        {/* Settings Sections */}
        <div className="flex flex-col gap-3">
          {sections.map((section, i) => {
            const Icon = section.icon
            const content = (
              <div className="flex items-center gap-3" key={i}>
                <Icon size={20} className="text-[var(--mm-text-secondary)] shrink-0" />
                <div>
                  <span className="body font-semibold">{section.label}</span>
                  <span className="caption text-[var(--mm-text-muted)] block">{section.desc}</span>
                </div>
              </div>
            )

            if (section.link) {
              return (
                <Link
                  key={i}
                  to={section.link}
                  className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] transition-all duration-200 hover:bg-[var(--mm-bg-hover)]"
                >
                  {content}
                </Link>
              )
            }

            return (
              <div
                key={i}
                className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] transition-all duration-200 cursor-pointer hover:bg-[var(--mm-bg-hover)]"
              >
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

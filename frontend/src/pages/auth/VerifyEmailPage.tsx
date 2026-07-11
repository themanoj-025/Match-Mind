import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Mail, RefreshCw, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [status, setStatus] = useState(token ? 'verifying' : 'pending') // verifying | verified | error | pending
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (token) {
      verifyToken()
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const res = await fetch(`/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) throw new Error('Invalid or expired verification link')
      setStatus('verified')
      setTimeout(() => navigate('/onboarding'), 2500)
    } catch (err) {
      setStatus('error')
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    try {
      await fetch('/api/auth/resend-verification', { method: 'POST' })
      setCooldown(30)
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      // silent
    }
  }

  return (
    <motion.div className="min-h-screen flex items-center justify-center px-4">
      <Helmet>
        <title>Verify Email — MatchMind</title>
      </Helmet>

      <div className="w-full max-w-[420px]">
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--gradient-live)] flex items-center justify-center">
              <span className="text-[var(--mm-text-inverse)] font-bold text-lg">MM</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'verifying' && (
              <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center">
                  <span className="w-8 h-8 border-2 border-[var(--mm-accent-green)] border-t-transparent rounded-full animate-spin" />
                </div>
                <h1 className="heading-2 mb-2">Verifying Your Email</h1>
                <p className="body text-[var(--mm-text-secondary)]">Please wait a moment...</p>
              </motion.div>
            )}

            {status === 'verified' && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mm-accent-green)]/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-[var(--mm-accent-green)]" />
                </div>
                <h1 className="heading-2 mb-2">Email Verified! 🎉</h1>
                <p className="body text-[var(--mm-text-secondary)]">Redirecting to set up your profile...</p>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mm-accent-red)]/10 flex items-center justify-center">
                  <AlertCircle size={32} className="text-[var(--mm-accent-red)]" />
                </div>
                <h1 className="heading-2 mb-2">Invalid Link</h1>
                <p className="body text-[var(--mm-text-secondary)] mb-6">
                  This verification link is invalid or has expired.
                </p>
                <Link to="/signup" className="text-[var(--mm-accent-green)] body font-medium hover:underline">
                  Sign up again
                </Link>
              </motion.div>
            )}

            {status === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mm-accent-amber)]/10 flex items-center justify-center">
                  <Mail size={32} className="text-[var(--mm-accent-amber)]" />
                </div>
                <h1 className="heading-2 mb-2">Check Your Inbox</h1>
                <p className="body text-[var(--mm-text-secondary)] mb-2">
                  We sent a verification email. Click the link to activate your account.
                </p>
                <p className="caption text-[var(--mm-text-muted)] mb-6">Didn't receive it? Check your spam folder.</p>
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="inline-flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-6 py-3 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] disabled:opacity-50 transition-all duration-300"
                >
                  <RefreshCw size={16} className={cooldown > 0 ? 'animate-spin' : ''} />
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Email'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

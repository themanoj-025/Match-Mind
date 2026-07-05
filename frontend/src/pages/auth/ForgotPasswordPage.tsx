import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (!res.ok) throw new Error('Something went wrong. Please try again.')
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4"
    >
      <Helmet>
        <title>Forgot Password — MatchMind</title>
      </Helmet>

      <div className="w-full max-w-[420px]">
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--gradient-live)] flex items-center justify-center">
              <span className="text-[var(--mm-text-inverse)] font-bold text-lg">MM</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mm-accent-green)]/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-[var(--mm-accent-green)]" />
                </div>
                <h1 className="heading-2 mb-2">Check Your Inbox</h1>
                <p className="body text-[var(--mm-text-secondary)] mb-6">
                  If an account exists for <strong className="text-[var(--mm-text-primary)]">{email}</strong>,
                  we've sent a password reset link.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-[var(--mm-accent-green)] body font-medium hover:underline"
                >
                  <ArrowLeft size={16} /> Back to login
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className="heading-2 mb-2 text-center">Forgot Password</h1>
                <p className="body text-[var(--mm-text-secondary)] text-center mb-6">
                  Enter your email and we'll send you a reset link.
                </p>

                {status === 'error' && (
                  <div className="flex items-center gap-2 bg-[var(--mm-accent-red)]/10 border border-[var(--border-error)] rounded-[var(--radius-md)] p-3 mb-4">
                    <AlertCircle size={16} className="text-[var(--mm-accent-red)] shrink-0" />
                    <span className="caption text-[var(--mm-text-error)]">{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="caption font-medium text-[var(--mm-text-secondary)] block mb-1.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-[3px] focus:ring-[var(--mm-accent-green-glow)] transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className="w-full bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold py-3 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-[var(--mm-text-inverse)] border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="caption text-[var(--mm-accent-green)] font-medium hover:underline">
                    Back to login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

// @ts-nocheck
import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState(token ? 'idle' : 'invalid') // idle | loading | success | error | invalid
  const [errorMsg, setErrorMsg] = useState('')

  const getStrength = (pwd) => {
    if (!pwd) return 0
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strength = getStrength(password)
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', 'var(--mm-accent-red)', 'var(--mm-accent-amber)', 'var(--mm-accent-blue)', 'var(--mm-accent-green)']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match')
      return
    }
    if (strength < 2) {
      setErrorMsg('Password is too weak')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (!res.ok) throw new Error('Invalid or expired reset link')
      setStatus('success')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4"
    >
      <Helmet>
        <title>Reset Password — MatchMind</title>
      </Helmet>

      <div className="w-full max-w-[420px]">
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--gradient-live)] flex items-center justify-center">
              <span className="text-[var(--mm-text-inverse)] font-bold text-lg">MM</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {status === 'invalid' && (
              <motion.div key="invalid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mm-accent-red)]/10 flex items-center justify-center">
                  <AlertCircle size={32} className="text-[var(--mm-accent-red)]" />
                </div>
                <h1 className="heading-2 mb-2">Invalid Link</h1>
                <p className="body text-[var(--mm-text-secondary)] mb-6">This password reset link is invalid or has expired.</p>
                <Link to="/forgot-password" className="text-[var(--mm-accent-green)] body font-medium hover:underline">Request a new link</Link>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--mm-accent-green)]/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-[var(--mm-accent-green)]" />
                </div>
                <h1 className="heading-2 mb-2">Password Updated</h1>
                <p className="body text-[var(--mm-text-secondary)] mb-6">Redirecting to login...</p>
              </motion.div>
            )}

            {(status === 'idle' || status === 'loading' || status === 'error') && (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="heading-2 mb-2 text-center">Set New Password</h1>
                <p className="body text-[var(--mm-text-secondary)] text-center mb-6">Must be at least 8 characters.</p>

                {status === 'error' && (
                  <div className="flex items-center gap-2 bg-[var(--mm-accent-red)]/10 border border-[var(--border-error)] rounded-[var(--radius-md)] p-3 mb-4">
                    <AlertCircle size={16} className="text-[var(--mm-accent-red)] shrink-0" />
                    <span className="caption text-[var(--mm-text-error)]">{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="caption font-medium text-[var(--mm-text-secondary)] block mb-1.5">New password</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-4 py-3 pr-10 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-[3px] focus:ring-[var(--mm-accent-green-glow)] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)]"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{ background: strength >= level ? strengthColors[strength] : 'var(--mm-bg-tertiary)' }}
                            />
                          ))}
                        </div>
                        <span className="caption" style={{ color: strengthColors[strength] || 'var(--mm-text-muted)' }}>
                          {strengthLabels[strength]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="caption font-medium text-[var(--mm-text-secondary)] block mb-1.5">Confirm password</label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      autoComplete="new-password"
                      className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] px-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-focus)] focus:outline-none focus:ring-[3px] focus:ring-[var(--mm-accent-green-glow)] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading' || !password || !confirmPassword}
                    className="w-full bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold py-3 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {status === 'loading' ? (
                      <><span className="w-4 h-4 border-2 border-[var(--mm-text-inverse)] border-t-transparent rounded-full animate-spin" /> Updating...</>
                    ) : (
                      <><Lock size={16} /> Update Password</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}


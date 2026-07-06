// @ts-nocheck
import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'
export default function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null) // null | true | false
  const { setUser } = useStore()
  const navigate = useNavigate()

  const usernameTimerRef = useRef(null)

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  // Password strength
  const getStrength = (pwd) => {
    if (!pwd) return 0
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }
  const strength = getStrength(form.password)
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['', 'var(--mm-accent-red)', 'var(--mm-accent-amber)', 'var(--mm-accent-blue)', 'var(--mm-accent-green)']

  // Username availability check (debounced)
  const checkUsername = async (username) => {
    if (username.length < 3) { setUsernameAvailable(null); return }
    try {
      const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      setUsernameAvailable(data.available)
    } catch { setUsernameAvailable(null) }
  }

  const handleUsernameChange = (value) => {
    updateField('username', value)
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)
    usernameTimerRef.current = setTimeout(() => checkUsername(value), 500)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all fields')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Signup failed')
      localStorage.setItem('accessToken', data.accessToken)
      setUser(data.user)
      navigate('/verify-email')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4 py-20"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[var(--gradient-live)] flex items-center justify-center">
              <span className="text-[var(--mm-text-inverse)] font-bold text-lg">MM</span>
            </div>
          </Link>
          <h1 className="heading-1 mb-2">Join MatchMind</h1>
          <p className="body text-[var(--mm-text-secondary)]">Create your account and start predicting</p>
        </div>

        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-[var(--mm-accent-red)]/10 border border-[var(--mm-accent-red)]/20 rounded-[var(--radius-md)] px-4 py-3">
                <span className="caption text-[var(--mm-accent-red)]">{error}</span>
              </div>
            )}

            <div>
              <label className="caption font-medium text-[var(--mm-text-secondary)] mb-1.5 block">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="yourname"
                  autoComplete="username"
                  className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] pl-10 pr-10 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none transition-colors"
                />
                {form.username.length >= 3 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameAvailable === true ? (
                      <Check size={16} className="text-[var(--mm-accent-green)]" />
                    ) : usernameAvailable === false ? (
                      <X size={16} className="text-[var(--mm-accent-red)]" />
                    ) : (
                      <span className="w-4 h-4 border-2 border-[var(--mm-text-muted)] border-t-transparent rounded-full animate-spin" />
                    )}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="caption font-medium text-[var(--mm-text-secondary)] mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] pl-10 pr-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="caption font-medium text-[var(--mm-text-secondary)] mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] pl-10 pr-10 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {form.password && (
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
              <label className="caption font-medium text-[var(--mm-text-secondary)] mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] pl-10 pr-4 py-3 border border-[var(--border-subtle)] focus:border-[var(--border-active)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[var(--gradient-predict)] text-[var(--mm-text-inverse)] body font-semibold py-3 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-amber)] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--mm-bg-secondary)] px-4 caption text-[var(--mm-text-muted)]">or continue with</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body font-medium py-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] hover:bg-[var(--mm-bg-hover)] transition-all duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <p className="text-center mt-6 body text-[var(--mm-text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--mm-accent-green)] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </motion.div>
  )
}


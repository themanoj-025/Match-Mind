import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Mail, Lock, User } from 'lucide-react'

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, showToast } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
    const payload = isLogin ? { email, password } : { username, email, password }

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        showToast(data.error?.message || 'Authentication failed', 'error')
      } else {
        login(data.token, data.user)
        showToast(isLogin ? 'Welcome back!' : 'Account created successfully!', 'success')
        navigate('/lobby')
      }
    } catch (err: any) {
      showToast('Connection to server failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05060a] relative px-6 overflow-hidden">
      {/* Stadium Grid Overlay */}
      <div className="absolute inset-0 bg-grid-overlay opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Floating Action Header */}
      <div className="absolute top-6 left-6 z-20">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border border-white/10 bg-[#12141c]/50 text-foreground-muted hover:text-white hover:border-white/20 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Pitch
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-6">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-accent fill-none stroke-current stroke-2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
              <circle cx="12" cy="12" r="3" className="fill-accent/20" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">MatchMind <span className="text-accent">Drafts</span></h1>
          <p className="text-xs text-foreground-muted mt-1 uppercase tracking-widest font-mono">Arena Command Center</p>
        </div>

        <Card className="w-full p-8 border border-white/[0.05] bg-[#0c0d13]/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold tracking-tight text-gradient mb-1">
                {isLogin ? 'Access Arena' : 'Join the League'}
              </h2>
              <p className="text-xs text-foreground-muted mb-6">
                {isLogin ? 'Sign in to access your live auction draft rooms' : 'Create an account to start drafting and climb standings'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-muted block mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-foreground-muted">
                        <User className="w-4 h-4" />
                      </span>
                      <Input
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 h-11 text-xs border-white/[0.06] bg-white/[0.02]"
                        required
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-muted block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-foreground-muted">
                      <Mail className="w-4 h-4" />
                    </span>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 text-xs border-white/[0.06] bg-white/[0.02]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-muted block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-foreground-muted">
                      <Lock className="w-4 h-4" />
                    </span>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 text-xs border-white/[0.06] bg-white/[0.02]"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-5 text-xs font-semibold uppercase tracking-wider bg-accent hover:bg-accent-bright text-white cursor-pointer mt-6"
                  disabled={loading}
                >
                  {loading ? 'Entering Tunnel...' : isLogin ? 'Log In to Arena' : 'Confirm Registration'}
                </Button>
              </form>

              {/* Social Login option */}
              <div className="relative flex items-center justify-center my-6">
                <span className="absolute inset-x-0 border-t border-white/[0.05]" />
                <span className="relative px-3 bg-[#0c0d13]/90 text-[10px] font-mono uppercase tracking-wider text-foreground-muted">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-2.5 px-4 rounded-lg border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] text-xs font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Google Account
              </button>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-xs text-accent-bright hover:underline cursor-pointer"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                </button>
              </div>

            </motion.div>
          </AnimatePresence>

        </Card>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050506] relative px-6">
      <div className="absolute inset-0 bg-grid-overlay opacity-10 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-accent/15 blur-[120px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md p-8 relative z-10 border border-white/10 bg-white/[0.02] backdrop-blur-2xl">
        <h2 className="text-3xl font-semibold tracking-tight text-gradient-accent text-center mb-2">
          {isLogin ? 'MatchMind Portal' : 'Create Account'}
        </h2>
        <p className="text-sm text-foreground-muted text-center mb-8">
          {isLogin ? 'Enter your credentials to access draft rooms' : 'Register to start drafts and join leagues'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block mb-1">Username</label>
              <Input
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block mb-1">Email</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-foreground-muted block mb-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full py-6 mt-6 font-semibold" disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-accent-bright hover:underline cursor-pointer"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </Card>
    </div>
  )
}

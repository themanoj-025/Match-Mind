import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search, User, Menu, X, LogIn, Trophy, Swords, Newspaper, Home } from 'lucide-react'
import useStore from '../store/useStore'

export default function Navbar() {
  const { isAuthenticated, user, unreadCount, isNavOpen, toggleNav } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  if (!isAuthenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--mm-bg-primary)]/95 backdrop-blur-lg border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--gradient-live)] flex items-center justify-center">
                <span className="text-[var(--mm-text-inverse)] font-bold text-sm">MM</span>
              </div>
              <span className="display-l text-2xl tracking-tight">MatchMind</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/live" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Live</Link>
              <Link to="/scores" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Scores</Link>
              <Link to="/explore" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">Explore</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/login" className="body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors px-4 py-2">Log In</Link>
              <Link to="/signup" className="bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-5 py-2 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300">
                Join Free
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--mm-bg-primary)]/95 backdrop-blur-lg border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={toggleNav} className="md:hidden p-2 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)]">
                {isNavOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <Link to="/feed" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[var(--gradient-live)] flex items-center justify-center">
                  <span className="text-[var(--mm-text-inverse)] font-bold text-sm">MM</span>
                </div>
                <span className="display-l text-2xl tracking-tight hidden sm:block">MatchMind</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/feed" className="flex items-center gap-1.5 body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">
                <Home size={16} /> Feed
              </Link>
              <Link to="/live" className="flex items-center gap-1.5 body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">
                <Trophy size={16} /> Live
              </Link>
              <Link to="/predictions" className="flex items-center gap-1.5 body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">
                <Swords size={16} /> Predict
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-1.5 body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">
                <Newspaper size={16} /> Leaderboard
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mm-text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-primary)] body rounded-[var(--radius-md)] pl-9 pr-3 py-2 w-44 focus:w-56 transition-all border border-transparent focus:border-[var(--border-active)] focus:outline-none"
                  />
                </div>
              </form>
              <Link to="/profile/me/notifications" className="relative p-2 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--mm-accent-red)] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link to="/profile/me" className="flex items-center gap-2 p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] transition-colors">
                <div className="w-8 h-8 rounded-full bg-[var(--gradient-predict)] flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-[var(--mm-text-inverse)]" />
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Side Nav */}
      {isNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={toggleNav}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute top-16 left-0 w-72 bg-[var(--mm-bg-secondary)] h-full border-r border-[var(--border-subtle)] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-2">
              <Link to="/feed" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                <Home size={18} /> Feed
              </Link>
              <Link to="/live" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                <Trophy size={18} /> Live Matches
              </Link>
              <Link to="/scores" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                <Newspaper size={18} /> Scores
              </Link>
              <Link to="/predictions" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                <Swords size={18} /> Predictions
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                <Trophy size={18} /> Leaderboard
              </Link>
              <Link to="/leagues" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                <Swords size={18} /> Leagues
              </Link>
              <Link to="/squads" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                <User size={18} /> Squads
              </Link>
              <Link to="/explore" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                <Search size={18} /> Explore
              </Link>
              <div className="border-t border-[var(--border-subtle)] my-4" />
              <Link to="/profile/me" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                <User size={18} /> My Profile
              </Link>
              <Link to="/profile/me/settings" className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--mm-bg-hover)] body" onClick={toggleNav}>
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

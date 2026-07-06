// @ts-nocheck
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Search, User, Menu, X, Trophy, Swords, Home } from 'lucide-react'
import useStore from '../store/useStore'
import TournamentSwitcher from './TournamentSwitcher'

export default function Navbar() {
  const { isAuthenticated, user, unreadCount, isNavOpen, toggleNav } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const logoBlock = (
    <Link to="/" className="flex items-center gap-3 group">
      <div className="w-10 h-10 bg-[#111111] text-[#F9F9F7] flex items-center justify-center sharp-corners group-hover:bg-white group-hover:text-[#111111] border border-[#111111] transition-colors">
        <span className="font-serif font-black text-xl italic leading-none pt-1">M</span>
      </div>
      <span className="font-serif text-3xl font-black tracking-tighter">MatchMind.</span>
    </Link>
  )

  if (!isAuthenticated) {
    return (
      <nav className="sticky top-0 z-50 bg-[#F9F9F7] border-b-2 border-[#111111] newsprint-texture">
        <div className="container">
          <div className="flex items-center justify-between h-20">
            {logoBlock}

            <div className="hidden md:flex items-center gap-8">
              <Link to="/how-it-works" className="font-mono text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4 decoration-2 decoration-[#CC0000]">How It Works</Link>
              <Link to="/pricing" className="font-mono text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4 decoration-2 decoration-[#CC0000]">Pricing</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="font-mono text-xs uppercase tracking-widest text-[#111111] hover:underline underline-offset-4 decoration-2 decoration-[#CC0000] px-4 py-2">Log In</Link>
              <Link to="/signup" className="bg-[#111111] text-[#F9F9F7] border border-transparent hover:bg-white hover:text-[#111111] hover:border-[#111111] sharp-corners px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all duration-200">
                Subscribe
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="sticky top-0 z-50 bg-[#F9F9F7] border-b-2 border-[#111111] newsprint-texture">
        <div className="container">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <button onClick={toggleNav} className="md:hidden p-2 text-[#111111] border border-transparent hover:border-[#111111] sharp-corners transition-colors">
                {isNavOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
              </button>
              <div className="hidden sm:block">
                {logoBlock}
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <TournamentSwitcher />
              <Link to="/dashboard" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#111111] hover:bg-neutral-100 px-3 py-2 sharp-corners transition-colors">
                <Home size={16} strokeWidth={1.5} /> Dashboard
              </Link>
              <Link to="/rooms/new" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#111111] hover:bg-neutral-100 px-3 py-2 sharp-corners transition-colors">
                <Swords size={16} strokeWidth={1.5} /> Create
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#111111] hover:bg-neutral-100 px-3 py-2 sharp-corners transition-colors">
                <Trophy size={16} strokeWidth={1.5} /> Leaders
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative group">
                  <Search size={16} strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-[#111111]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH..."
                    className="border-b-2 border-[#111111] bg-transparent pl-8 pr-3 py-2 font-mono text-sm focus-visible:bg-[#F0F0F0] focus-visible:outline-none sharp-corners w-44 focus:w-56 transition-all placeholder:text-neutral-400"
                  />
                </div>
              </form>
              
              <Link to="/profile/me/notifications" className="relative p-2 text-[#111111] border border-transparent hover:border-[#111111] sharp-corners transition-colors">
                <Bell size={24} strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#CC0000] text-white flex items-center justify-center font-mono text-[10px] sharp-corners font-bold border border-[#111111]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              
              <Link to="/profile/me" className="flex items-center justify-center w-10 h-10 border border-[#111111] bg-white hover:bg-black hover:text-white sharp-corners transition-colors group">
                {(user as { avatar?: string })?.avatar ? (
                  <img src={(user as { avatar?: string }).avatar || ''} alt="" className="w-full h-full object-cover grayscale group-hover:sepia-[50%]" />
                ) : (
                  <User size={20} strokeWidth={1.5} />
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Side Nav */}
      {isNavOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={toggleNav}>
          <div className="absolute inset-0 bg-[#F9F9F7]/90 backdrop-blur-sm" />
          <div className="absolute top-20 left-0 w-80 bg-[#F9F9F7] h-[calc(100%-5rem)] border-r-2 border-[#111111] p-8 newsprint-texture" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex flex-col gap-4">
              <Link to="/dashboard" className="flex items-center gap-4 px-4 py-4 border border-transparent hover:border-[#111111] hover:bg-white font-mono text-sm uppercase tracking-widest sharp-corners transition-colors" onClick={toggleNav}>
                <Home size={20} strokeWidth={1.5} /> Dashboard
              </Link>
              <Link to="/rooms/new" className="flex items-center gap-4 px-4 py-4 border border-transparent hover:border-[#111111] hover:bg-white font-mono text-sm uppercase tracking-widest sharp-corners transition-colors" onClick={toggleNav}>
                <Swords size={20} strokeWidth={1.5} /> Create Room
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-4 px-4 py-4 border border-transparent hover:border-[#111111] hover:bg-white font-mono text-sm uppercase tracking-widest sharp-corners transition-colors" onClick={toggleNav}>
                <Trophy size={20} strokeWidth={1.5} /> Leaderboard
              </Link>
              <div className="border-t-2 border-[#111111] my-4" />
              <Link to="/profile/me" className="flex items-center gap-4 px-4 py-4 border border-transparent hover:border-[#111111] hover:bg-white font-mono text-sm uppercase tracking-widest sharp-corners transition-colors" onClick={toggleNav}>
                <User size={20} strokeWidth={1.5} /> My Profile
              </Link>
              <Link to="/profile/me/settings" className="flex items-center gap-4 px-4 py-4 border border-transparent hover:border-[#111111] hover:bg-white font-mono text-sm uppercase tracking-widest sharp-corners transition-colors" onClick={toggleNav}>
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


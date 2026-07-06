import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Trophy, Swords, User } from 'lucide-react'
import useStore from '../store/useStore'

const navItems = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/rooms/new', label: 'Auction', icon: Swords },
  { path: '/leaderboard', label: 'Rank', icon: Trophy },
  { path: '/profile/me', label: 'Profile', icon: User },
]

export default function BottomNav() {
  const location = useLocation()
  const { isAuthenticated } = useStore()

  if (!isAuthenticated) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#F9F9F7] border-t-2 border-[#111111] md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors sharp-corners border-r-2 border-[#111111] last:border-r-0 ${
                isActive
                  ? 'bg-[#111111] text-[#F9F9F7]'
                  : 'bg-transparent text-[#111111] hover:bg-neutral-200'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="font-mono text-[10px] uppercase tracking-widest">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

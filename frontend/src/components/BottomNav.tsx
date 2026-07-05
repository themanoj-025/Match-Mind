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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--mm-bg-secondary)]/95 backdrop-blur-lg border-t border-[var(--border-subtle)] md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[var(--radius-md)] transition-colors ${
                isActive
                  ? 'text-[var(--mm-accent-green)]'
                  : 'text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)]'
              }`}
            >
              <Icon size={20} />
              <span className="caption">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

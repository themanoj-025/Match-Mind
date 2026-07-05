import React, { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import useStore from '../store/useStore'
import { Link } from 'react-router-dom'

export default function NotificationBell() {
  const { unreadCount, notifications, markAllRead } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const recentNotifs = notifications?.slice(0, 5) || []

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[var(--mm-accent-red)] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--mm-bg-secondary)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-elevated)] z-[var(--z-drawer)] animate-fade-in-up overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
            <span className="body font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="caption text-[var(--mm-accent-green)] font-medium hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {recentNotifs.length > 0 ? recentNotifs.map((notif, i) => (
              <div key={notif.id || i} className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--mm-bg-hover)] transition-colors border-b border-[var(--border-subtle)] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="body text-[var(--mm-text-primary)] truncate">{notif.title}</p>
                  {notif.message && <p className="caption text-[var(--mm-text-muted)] truncate">{notif.message}</p>}
                </div>
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[var(--mm-accent-green)] mt-1.5 shrink-0" />
                )}
              </div>
            )) : (
              <div className="text-center py-8">
                <Bell size={20} className="mx-auto text-[var(--mm-text-muted)] mb-2" />
                <p className="caption text-[var(--mm-text-muted)]">No notifications yet</p>
              </div>
            )}
          </div>

          <Link
            to="/profile/me/notifications"
            onClick={() => setOpen(false)}
            className="block text-center px-4 py-2.5 border-t border-[var(--border-subtle)] caption text-[var(--mm-accent-green)] font-medium hover:bg-[var(--mm-bg-hover)] transition-colors"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  )
}

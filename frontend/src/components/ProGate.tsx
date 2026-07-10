import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Lock } from 'lucide-react'

interface ProGateProps {
  children: React.ReactNode
  isPro?: boolean
  showLockIcon?: boolean
  fallback?: React.ReactNode
}

/**
 * ProGate — Wraps Pro-only content
 * Free users: children blurred (CSS filter: blur(4px)) + overlay CTA
 * Pro users: children rendered normally
 * Content is NOT removed from DOM for SEO + accessibility
 */
export default function ProGate({ children, isPro = false, showLockIcon = true, fallback }: ProGateProps) {
  if (isPro) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return (
    <div className="relative group">
      {/* Blurred content */}
      <div
        className="relative overflow-hidden"
        style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}
      >
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--mm-bg-secondary)]/40 rounded-[var(--radius-md)]">
        <div className="text-center px-6 py-4">
          {showLockIcon && (
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center">
              <Lock size={20} className="text-[var(--mm-accent-purple)]" />
            </div>
          )}
          <p className="body font-semibold mb-1 text-[var(--mm-text-primary)]">🔓 Pro Feature</p>
          <p className="caption text-[var(--mm-text-secondary)] mb-3">Upgrade to unlock AI predictions & more</p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 bg-[var(--gradient-pro)] text-white body font-semibold px-5 py-2.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-purple)] transition-all duration-300"
          >
            <Sparkles size={16} />
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { X } from 'lucide-react'

export default function Chip({ label, variant = 'default', size = 'sm', onRemove, className = '' }) {
  const variants = {
    default: 'bg-[var(--mm-bg-tertiary)] text-[var(--mm-text-secondary)] border-[var(--border-subtle)]',
    green: 'bg-[var(--mm-accent-green)]/10 text-[var(--mm-accent-green)] border-[var(--border-active)]',
    amber: 'bg-[var(--mm-accent-amber)]/10 text-[var(--mm-accent-amber)] border-[var(--mm-accent-amber)]/20',
    red: 'bg-[var(--mm-accent-red)]/10 text-[var(--mm-accent-red)] border-[var(--mm-accent-red)]/20',
    blue: 'bg-[var(--mm-accent-blue)]/10 text-[var(--mm-accent-blue)] border-[var(--mm-accent-blue)]/20',
    purple: 'bg-[var(--mm-accent-purple)]/10 text-[var(--mm-accent-purple)] border-[var(--mm-accent-purple)]/20',
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 caption' : 'px-3 py-1 body-sm'

  return (
    <span className={`inline-flex items-center gap-1 border rounded-[var(--radius-full)] ${variants[variant] || variants.default} ${sizeClasses} ${className}`}>
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-[var(--mm-text-primary)] transition-colors" aria-label={`Remove ${label}`}>
          <X size={12} />
        </button>
      )}
    </span>
  )
}

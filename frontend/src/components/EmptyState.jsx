import React from 'react'
import { Link } from 'react-router-dom'

export default function EmptyState({ icon, title, message, actionLabel, actionLink, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center mb-4">
        {icon ? (
          <span className="text-3xl">{icon}</span>
        ) : (
          <span className="text-3xl">📭</span>
        )}
      </div>
      {title && <h3 className="heading-3 mb-2">{title}</h3>}
      {message && <p className="body text-[var(--mm-text-secondary)] mb-6 max-w-sm">{message}</p>}
      {actionLabel && (actionLink ? (
        <Link to={actionLink} className="inline-flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-5 py-2.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300">
          {actionLabel}
        </Link>
      ) : onAction ? (
        <button onClick={onAction} className="inline-flex items-center gap-2 bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-5 py-2.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300">
          {actionLabel}
        </button>
      ) : null)}
    </div>
  )
}

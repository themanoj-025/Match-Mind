import React from 'react'

export default function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--mm-accent-red)]/10 flex items-center justify-center mb-4">
        <span className="text-3xl">😔</span>
      </div>
      <h3 className="heading-3 mb-2">Error</h3>
      <p className="body text-[var(--mm-text-secondary)] mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-5 py-2.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

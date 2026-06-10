import React, { useEffect, useState } from 'react'

export default function PointsToast({ points, message, onComplete }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  const isPositive = points >= 0

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-fade-in-up">
      <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 shadow-2xl flex flex-col items-center gap-3">
        <div className={`text-5xl ${isPositive ? 'text-[var(--mm-accent-green)]' : 'text-[var(--mm-accent-red)]'}`}>
          {isPositive ? '+' : ''}{points}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isPositive ? '🎉' : '😔'}</span>
          <span className="heading-3 text-[var(--mm-text-primary)]">{message || (isPositive ? 'Points Earned!' : 'Points Lost')}</span>
        </div>
        <div className="w-16 h-1 rounded-full bg-[var(--mm-bg-tertiary)] overflow-hidden">
          <div className="h-full bg-[var(--mm-accent-green)] rounded-full animate-shrink" />
        </div>
      </div>
    </div>
  )
}

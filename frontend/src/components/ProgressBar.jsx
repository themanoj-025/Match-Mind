import React from 'react'

export default function ProgressBar({ value = 0, max = 100, label, showValue = true, color = 'var(--mm-accent-green)', size = 'md', className = '' }) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const height = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="caption text-[var(--mm-text-muted)]">{label}</span>}
          {showValue && (
            <span className="caption font-medium" style={{ color }}>
              {value}{max > 0 ? `/${max}` : ''}
            </span>
          )}
        </div>
      )}
      <div className={`${height} bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

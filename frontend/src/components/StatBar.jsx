import React from 'react'

export default function StatBar({ homeValue, awayValue, label, homeColor = 'var(--mm-accent-green)', awayColor = 'var(--mm-accent-amber)', showValues = true }) {
  const total = homeValue + awayValue
  const homePercent = total > 0 ? (homeValue / total) * 100 : 50

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="caption text-[var(--mm-text-muted)] text-center">{label}</span>}
      <div className="flex items-center gap-2">
        {showValues && (
          <span className="body font-semibold min-w-[2rem] text-right" style={{ color: homeColor }}>{homeValue}</span>
        )}
        <div className="flex-1 h-2 bg-[var(--mm-bg-tertiary)] rounded-full overflow-hidden">
          <div className="flex h-full" style={{ direction: 'rtl' }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${homePercent}%`, backgroundColor: homeColor }}
            />
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${100 - homePercent}%`, backgroundColor: awayColor }}
            />
          </div>
        </div>
        {showValues && (
          <span className="body font-semibold min-w-[2rem]" style={{ color: awayColor }}>{awayValue}</span>
        )}
      </div>
    </div>
  )
}

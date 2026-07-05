import React, { useState } from 'react'

export default function Tooltip({ content, children, position = 'top' }) {
  const [visible, setVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={`absolute z-[var(--z-tooltip)] ${positionClasses[position] || positionClasses.top} px-2.5 py-1.5 bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-sm)] shadow-[var(--shadow-elevated)] whitespace-nowrap caption text-[var(--mm-text-primary)] animate-fade-in-up pointer-events-none`}
        >
          {content}
        </div>
      )}
    </div>
  )
}

import React from 'react'

export default function SkeletonCard({ variant = 'default' }) {
  if (variant === 'compact') {
    return (
      <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 skeleton rounded" />
            <div className="h-3 w-16 skeleton rounded" />
          </div>
          <div className="h-6 w-12 skeleton rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full skeleton" />
          <div className="h-3 w-24 skeleton rounded" />
        </div>
        <div className="h-4 w-12 skeleton rounded" />
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 rounded-full skeleton" />
            <div className="h-3 w-20 skeleton rounded" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 skeleton rounded" />
              <div className="h-4 w-2 skeleton rounded" />
              <div className="h-8 w-8 skeleton rounded" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 rounded-full skeleton" />
            <div className="h-3 w-20 skeleton rounded" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border-subtle)]">
        <div className="h-3 w-24 skeleton rounded" />
        <div className="flex-1" />
        <div className="h-7 w-20 skeleton rounded" />
      </div>
    </div>
  )
}

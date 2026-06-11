import React from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock } from 'lucide-react'
import { useHighlights } from '../hooks/useApi'

export default function HighlightsPage() {
  const { data: highlightsData, isLoading } = useHighlights()
  const highlights = highlightsData?.highlights || []

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="heading-1 mb-6">Highlights</h1>
        {isLoading ? (
          <div className="text-center py-16 text-[var(--mm-text-muted)]">
            <p className="body">Loading highlights...</p>
          </div>
        ) : highlights.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((item) => (
              <div key={item.id} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden group cursor-pointer">
                <div className="aspect-video bg-[var(--mm-bg-tertiary)] flex items-center justify-center relative">
                  <div className="w-14 h-14 rounded-full bg-[var(--mm-accent-green)]/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play size={24} className="text-[var(--mm-text-inverse)] ml-1" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white caption px-2 py-0.5 rounded-[var(--radius-sm)]">{item.duration}</span>
                </div>
                <div className="p-3">
                  <span className="body font-semibold block truncate">{item.title}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span>{item.sport === 'FOOTBALL' ? '⚽' : item.sport === 'BASKETBALL' ? '🏀' : item.sport === 'AMERICAN_FOOTBALL' ? '🏈' : '🎯'}</span>
                    <span className="caption text-[var(--mm-text-muted)]">{item.competition}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Play size={36} className="mx-auto mb-3 text-[var(--mm-text-muted)]" />
            <p className="body text-[var(--mm-text-muted)]">No highlights available</p>
          </div>
        )}
      </div>
    </div>
  )
}

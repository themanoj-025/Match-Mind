import React from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock } from 'lucide-react'

export default function HighlightsPage() {
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="heading-1 mb-6">Highlights</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Haaland Hat-trick vs Ipswich', comp: 'Premier League', sport: '⚽', duration: '3:42' },
            { title: 'LeBron Game-Winner vs Celtics', comp: 'NBA', sport: '🏀', duration: '2:18' },
            { title: 'Mahomes 4th Quarter Comeback', comp: 'NFL', sport: '🏈', duration: '5:01' },
          ].map((item, i) => (
            <div key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden group cursor-pointer">
              <div className="aspect-video bg-[var(--mm-bg-tertiary)] flex items-center justify-center relative">
                <div className="w-14 h-14 rounded-full bg-[var(--mm-accent-green)]/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={24} className="text-[var(--mm-text-inverse)] ml-1" />
                </div>
                <span className="absolute bottom-2 right-2 bg-black/70 text-white caption px-2 py-0.5 rounded-[var(--radius-sm)]">{item.duration}</span>
              </div>
              <div className="p-3">
                <span className="body font-semibold block truncate">{item.title}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span>{item.sport}</span>
                  <span className="caption text-[var(--mm-text-muted)]">{item.comp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

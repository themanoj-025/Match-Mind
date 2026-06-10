import React from 'react'
import { Users, Trophy, BarChart3, Activity } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="heading-1 mb-6">Admin Dashboard</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: '12,847', icon: Users, change: '+12%' },
            { label: 'Active Matches', value: '24', icon: Activity, change: '+3' },
            { label: 'Predictions Today', value: '84,291', icon: Trophy, change: '+18%' },
            { label: 'Revenue', value: '$12,400', icon: BarChart3, change: '+8%' },
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
                <div className="flex items-center justify-between mb-2"><Icon size={18} className="text-[var(--mm-text-muted)]" /><span className="caption text-[var(--mm-accent-green)]">{stat.change}</span></div>
                <span className="heading-2">{stat.value}</span>
                <span className="caption text-[var(--mm-text-muted)] block">{stat.label}</span>
              </div>
            )
          })}
        </div>
        <div className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
          <h2 className="heading-3 mb-4">Recent Activity</h2>
          <div className="text-center py-12 text-[var(--mm-text-muted)]"><p className="body">Admin panel activity feed</p></div>
        </div>
      </div>
    </div>
  )
}

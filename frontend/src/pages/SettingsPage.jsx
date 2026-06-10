import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Lock, Bell, Shield, Moon, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <Link to="/profile/me" className="flex items-center gap-1.5 text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] body mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Profile
        </Link>
        <h1 className="heading-1 mb-6">Settings</h1>
        <div className="flex flex-col gap-6">
          {[
            { icon: User, label: 'Profile', desc: 'Avatar, display name, bio, favourite sports', items: [] },
            { icon: Mail, label: 'Account', desc: 'Email, password, connected accounts', items: [] },
            { icon: Bell, label: 'Notifications', desc: 'Push/email toggles per event type', items: [] },
            { icon: Shield, label: 'Privacy', desc: 'Public/private profile, prediction history', items: [] },
            { icon: Moon, label: 'Appearance', desc: 'Theme: Dark / Light / AMOLED Black', items: [] },
            { icon: Trash2, label: 'Danger Zone', desc: 'Delete account permanently', items: [] },
          ].map((section, i) => (
            <div key={i} className="bg-[var(--mm-bg-secondary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 hover:border-[var(--border-active)] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <section.icon size={20} className="text-[var(--mm-text-secondary)]" />
                <div>
                  <span className="body font-semibold">{section.label}</span>
                  <span className="caption text-[var(--mm-text-muted)] block">{section.desc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

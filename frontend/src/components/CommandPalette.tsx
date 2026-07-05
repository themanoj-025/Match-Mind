import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Trophy, Users, User, Zap, Star, X, Command, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Types ─────────────────────────────────────────────

interface SectionItem {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number }> | string
  path?: string
  shortcut?: string
  meta?: string
}

interface Section {
  id: string
  label: string
  items: SectionItem[]
}

// ── Search Data ───────────────────────────────────────

const SECTIONS: Section[] = [
  {
    id: 'quick',
    label: 'Quick Actions',
    items: [
      { id: 'go-dashboard', label: 'Go to Dashboard', icon: Trophy, path: '/dashboard', shortcut: 'G then D' },
      { id: 'go-new-room', label: 'Create Auction Room', icon: Zap, path: '/rooms/new', shortcut: 'G then N' },
      { id: 'go-leaderboard', label: 'Go to Leaderboard', icon: Star, path: '/leaderboard', shortcut: 'G then B' },
      { id: 'go-pricing', label: 'Go to Pricing', icon: Sparkles, path: '/pricing', shortcut: 'G then P' },
    ],
  },
]

// ── Suggestion Chips ──────────────────────────────────

interface SuggestionChipProps {
  text: string
  onClick: () => void
  icon?: React.ReactNode
}

function SuggestionChip({ text, onClick, icon }: SuggestionChipProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--mm-bg-tertiary)] hover:bg-[var(--mm-bg-hover)] border border-[var(--border-subtle)] rounded-[var(--radius-full)] body text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] transition-all whitespace-nowrap"
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span className="caption">{text}</span>
    </button>
  )
}

// ── Command Palette ───────────────────────────────────

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Flatten all items for keyboard navigation
  const allItems = useMemo(() => {
    return SECTIONS.flatMap(s => s.items)
  }, [])

  // Filter items based on query
  const filteredSections = useMemo(() => {
    if (!query.trim()) return SECTIONS

    const q = query.toLowerCase()
    return SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.label.toLowerCase().includes(q) ||
        (item.meta && item.meta.toLowerCase().includes(q))
      ),
    })).filter(s => s.items.length > 0)
  }, [query])

  const filteredItems = useMemo(() => {
    return filteredSections.flatMap(s => s.items)
  }, [filteredSections])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIdx(0)
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(prev => Math.min(prev + 1, filteredItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIdx]) {
        handleSelect(filteredItems[selectedIdx])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }, [filteredItems, selectedIdx, onClose])

  const handleSelect = useCallback((item: SectionItem) => {
    if (item.path) navigate(item.path)
    onClose()
  }, [navigate, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]')
      if (selected) selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIdx])

  if (!isOpen) return null

  // Build flat index -> section mapping for keyboard nav
  let flatIdx = 0

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Palette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[var(--mm-bg-secondary)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border-subtle)]">
          <Search size={18} className="text-[var(--mm-text-muted)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search rooms, players, pages..."
            className="flex-1 bg-transparent text-[var(--mm-text-primary)] body outline-none placeholder:text-[var(--mm-text-muted)]"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] caption text-[var(--mm-text-muted)]">
            <Command size={12} />K
          </kbd>
          <button onClick={onClose} className="p-1 text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)] transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Suggestions (when no query) */}
        {!query.trim() && (
          <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <SuggestionChip text="Dashboard" icon="🏠" onClick={() => { navigate('/dashboard'); onClose() }} />
              <SuggestionChip text="New Room" icon="⚽" onClick={() => { navigate('/rooms/new'); onClose() }} />
              <SuggestionChip text="Leaderboard" icon="🏆" onClick={() => { navigate('/leaderboard'); onClose() }} />
              <SuggestionChip text="Pricing" icon="✨" onClick={() => { navigate('/pricing'); onClose() }} />
            </div>
          </div>
        )}

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => {
              return (
                <div key={section.id}>
                  <div className="px-5 py-1.5 caption text-[var(--mm-text-muted)] font-medium flex items-center gap-2">
                    <span>{section.label}</span>
                    <span className="text-[10px] text-[var(--mm-text-muted)]">({section.items.length})</span>
                  </div>
                  {section.items.map((item) => {
                    const currentIdx = flatIdx++
                    const isSelected = currentIdx === selectedIdx
                    const ItemIcon = typeof item.icon === 'function' ? item.icon : null

                    return (
                      <button
                        key={item.id}
                        data-selected={isSelected}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIdx(currentIdx)}
                        className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                          isSelected ? 'bg-[var(--mm-accent-green)]/10 border-l-2 border-[var(--mm-accent-green)]' : 'border-l-2 border-transparent hover:bg-[var(--mm-bg-hover)]'
                        }`}
                      >
                        {/* Icon */}
                        {ItemIcon ? (
                          <ItemIcon size={16} className="text-[var(--mm-text-secondary)] shrink-0" />
                        ) : (
                          <span className="text-base w-5 text-center shrink-0">{item.icon as string}</span>
                        )}

                        {/* Label */}
                        <span className="body flex-1 truncate">{item.label}</span>

                        {/* Path hint */}
                        <span className="caption text-[var(--mm-text-muted)] opacity-50">
                          <ArrowRight size={12} />
                        </span>
                      </button>
                    )
                  })}
                  {filteredSections.indexOf(section) < filteredSections.length - 1 && (
                    <div className="mx-5 my-1 border-t border-[var(--border-subtle)]" />
                  )}
                </div>
              )
            })
          ) : (
            <div className="px-5 py-12 text-center">
              <Search size={28} className="mx-auto mb-3 text-[var(--mm-text-muted)]" />
              <p className="body text-[var(--mm-text-muted)]">No results for "{query}"</p>
              <p className="caption text-[var(--mm-text-muted)] mt-1">Try a different search term</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-[var(--border-subtle)] flex items-center gap-4">
          <div className="flex items-center gap-1.5 caption text-[var(--mm-text-muted)]">
            <kbd className="px-1.5 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] text-[10px]">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1.5 caption text-[var(--mm-text-muted)]">
            <kbd className="px-1.5 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] text-[10px]">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1.5 caption text-[var(--mm-text-muted)]">
            <kbd className="px-1.5 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] text-[10px]">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

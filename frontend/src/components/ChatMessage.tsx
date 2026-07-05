import React from 'react'
import { User, Pin, Flag } from 'lucide-react'
import TierBadge from './TierBadge'

const reactionEmojis = ['🔥', '😱', '👏', '😤', '⚽', '🏀']

export default function ChatMessage({ message, isOwn, onReact, onReport, onPin }) {
  const { id, user, text, gifUrl, type, timestamp, reactions, isPinned, isDeleted } = message

  if (type === 'system') {
    return (
      <div className="flex items-center justify-center py-1.5 px-4" data-event>
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--mm-bg-tertiary)]/50 rounded-[var(--radius-full)]">
          <span className="caption text-[var(--mm-text-muted)] italic">{text}</span>
        </div>
      </div>
    )
  }

  if (isDeleted) return null

  return (
    <div className={`flex gap-2.5 px-4 py-2 hover:bg-[var(--mm-bg-hover)]/30 transition-colors group ${isPinned ? 'bg-[var(--mm-accent-amber)]/5 border-l-2 border-[var(--mm-accent-amber)]' : ''}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--mm-accent-amber)] to-[var(--mm-accent-purple)] flex items-center justify-center overflow-hidden shrink-0">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-[var(--mm-text-inverse)]">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="body font-semibold text-[var(--mm-text-primary)]">{user?.name || 'Anonymous'}</span>
          {user?.tier && <TierBadge tier={user.tier} size="sm" />}
          {user?.isPro && (
            <span className="caption px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[var(--mm-accent-purple)] border border-[var(--border-pro)] font-medium" style={{ fontSize: '10px' }}>PRO</span>
          )}
          <span className="caption text-[var(--mm-text-muted)]">{timestamp}</span>
          {isPinned && <Pin size={12} className="text-[var(--mm-accent-amber)]" />}
        </div>

        {/* Message content */}
        {type === 'gif' && gifUrl ? (
          <img src={gifUrl} alt="GIF" className="mt-1 max-w-[200px] rounded-[var(--radius-md)]" loading="lazy" />
        ) : (
          <p className="body text-[var(--mm-text-secondary)] mt-0.5 break-words">{text}</p>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-1.5 mt-1.5">
          {/* Existing reactions */}
          {reactions && Object.keys(reactions).length > 0 && Object.entries(reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact?.(id, emoji)}
              className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] caption text-[var(--mm-text-muted)] hover:bg-[var(--mm-bg-hover)] hover:text-[var(--mm-text-secondary)] transition-all"
            >
              {emoji} <span className="font-medium">{count}</span>
            </button>
          ))}

          {/* Quick react button */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            {reactionEmojis.filter(e => !reactions?.[e]).slice(0, 3).map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReact?.(id, emoji)}
                className="px-1 py-0.5 rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)] text-sm transition-colors"
                aria-label={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {onPin && (
              <button onClick={() => onPin(id)} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)] text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)]" aria-label="Pin message">
                <Pin size={12} />
              </button>
            )}
            <button onClick={() => onReport?.(id)} className="p-1 rounded-[var(--radius-sm)] hover:bg-[var(--mm-bg-hover)] text-[var(--mm-text-muted)] hover:text-[var(--mm-text-secondary)]" aria-label="Report message">
              <Flag size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

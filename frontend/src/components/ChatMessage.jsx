import React from 'react'
import { User } from 'lucide-react'

export default function ChatMessage({ user, text, timestamp, reactions, isSystem }) {
  if (isSystem) {
    return (
      <div className="flex items-center justify-center py-1.5">
        <span className="caption text-[var(--mm-text-muted)] italic">{text}</span>
      </div>
    )
  }

  return (
    <div className="flex gap-2.5 px-4 py-2 hover:bg-[var(--mm-bg-hover)]/30 transition-colors group">
      <div className="w-8 h-8 rounded-full bg-[var(--mm-bg-tertiary)] flex items-center justify-center overflow-hidden shrink-0">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={14} className="text-[var(--mm-text-muted)]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="body font-semibold text-[var(--mm-text-primary)]">{user?.name || 'Anonymous'}</span>
          <span className="caption text-[var(--mm-text-muted)]">{timestamp}</span>
        </div>
        <p className="body text-[var(--mm-text-secondary)] mt-0.5 break-words">{text}</p>
        {reactions && Object.keys(reactions).length > 0 && (
          <div className="flex items-center gap-1.5 mt-1">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button key={emoji} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[var(--mm-bg-tertiary)] rounded-[var(--radius-sm)] caption text-[var(--mm-text-muted)] hover:bg-[var(--mm-bg-hover)] transition-colors">
                {emoji} {count}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

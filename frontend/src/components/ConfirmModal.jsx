import React, { useEffect, useRef } from 'react'

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'default', loading = false }) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      confirmRef.current?.focus()
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && isOpen) onClose?.() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isDanger = variant === 'danger'
  const confirmColor = isDanger ? 'var(--mm-accent-red)' : 'var(--mm-accent-green)'

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="absolute inset-0 bg-[var(--mm-bg-overlay)]" />
      <div
        className="relative bg-[var(--mm-bg-secondary)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 max-w-md w-full shadow-[var(--shadow-elevated)] animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 id="confirm-modal-title" className="heading-3 mb-2">{title}</h3>}
        {message && <p className="body text-[var(--mm-text-secondary)] mb-6">{message}</p>}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-[var(--radius-md)] body font-medium text-[var(--mm-text-secondary)] hover:text-[var(--mm-text-primary)] hover:bg-[var(--mm-bg-hover)] transition-all duration-200 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded-[var(--radius-md)] body font-semibold text-[var(--mm-text-inverse)] transition-all duration-200 disabled:opacity-50"
            style={{ backgroundColor: confirmColor }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

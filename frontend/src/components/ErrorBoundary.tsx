// @ts-nocheck
import React from 'react'
import { Link } from 'react-router-dom'
import * as Sentry from '@sentry/react'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, { extra: errorInfo })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="heading-2 mb-2">Something went wrong</h2>
            <p className="body text-[var(--mm-text-secondary)] mb-6">
              {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-[var(--mm-accent-green)] text-[var(--mm-text-inverse)] body font-semibold px-6 py-2.5 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-glow-green)] transition-all duration-300"
              >
                Try Again
              </button>
              <Link
                to="/"
                className="border border-[var(--border-subtle)] text-[var(--mm-text-primary)] body font-medium px-6 py-2.5 rounded-[var(--radius-md)] hover:border-[var(--mm-text-muted)] transition-all duration-300"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}


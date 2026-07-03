/**
 * Sentry Instrumentation — MatchMind Frontend
 *
 * Initializes Sentry for error monitoring in the React app.
 * Must be imported before any other module in main.jsx.
 */

import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: import.meta.env.MODE || 'development',
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // No PII beyond user ID
  beforeSend(event) {
    if (event.user) {
      event.user = { id: event.user.id }
    }
    return event
  },
})

export default Sentry

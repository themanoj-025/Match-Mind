/**
 * Application Constants
 *
 * Magic numbers and configuration values extracted from route handlers
 * and scoring logic. Single source of truth for scoring points,
 * pagination defaults, retry configs, and rate-limit tiers.
 */

// ─── Scoring Points ────────────────────────────────────
export const SCORING = {
  BASE: 5,
  EXACT_SCORE: 50,
  RESULT_AND_GD: 35,
  RESULT_ONLY: 25,
  WRONG_RESULT: 0,
  BTTS: 10,
  OVER_UNDER: 10,
} as const

// ─── Pagination Defaults ───────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// ─── Rate-Limit Tiers ──────────────────────────────────
export const RATE_LIMIT = {
  AUTH_WINDOW_MS: 15 * 60 * 1000,       // 15 minutes
  AUTH_MAX: 5,
  PASSWORD_RESET_WINDOW_MS: 60 * 60 * 1000, // 1 hour
  PASSWORD_RESET_MAX: 3,
  PREDICTION_WINDOW_MS: 60 * 1000,      // 1 minute
  PREDICTION_MAX: 30,
  GLOBAL_WINDOW_MS: 60 * 1000,          // 1 minute
  GLOBAL_MAX: 100,
} as const

// ─── BullMQ Retry Config ──────────────────────────────
export const BULLMQ = {
  SCORE_ATTEMPTS: 3,
  SCORE_BACKOFF_DELAY: 2000,
  SCORE_REMOVE_ON_COMPLETE: 100,
  SCORE_REMOVE_ON_FAIL: 50,
  RESET_ATTEMPTS: 2,
  RESET_BACKOFF_DELAY: 5000,
  RESET_REMOVE_ON_COMPLETE: 10,
  RESET_REMOVE_ON_FAIL: 10,
  RANK_ATTEMPTS: 2,
  RANK_BACKOFF_DELAY: 3000,
} as const

// ─── Match Scoring ─────────────────────────────────────
export const MATCH = {
  LOCK_STATUSES: ['PENDING', 'LOCKED'] as const,
  LOCKED_AT: new Date(),
  FINISHED_MINUTE: 90,
} as const

// ─── Chat Limits ───────────────────────────────────────
export const CHAT = {
  MAX_TEXT_LENGTH: 500,
} as const

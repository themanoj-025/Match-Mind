/**
 * Token Service
 *
 * Extracts token generation and cookie-setting logic that was duplicated
 * across signup, login, Google OAuth callback, and refresh routes in auth.js.
 */

const jwt = require('jsonwebtoken')

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '30d'
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000 // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 days

/**
 * Generate an access/refresh token pair for a given user ID.
 */
function generateTokens(userId) {
  return {
    accessToken: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY }),
    refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY }),
  }
}

/**
 * Set httpOnly auth cookies on the response.
 * Called once per auth flow (signup, login, Google OAuth, refresh).
 */
function setAuthCookies(res, tokens) {
  const isProd = process.env.NODE_ENV === 'production'

  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_MAX_AGE,
  })

  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_MAX_AGE,
  })
}

module.exports = { generateTokens, setAuthCookies }

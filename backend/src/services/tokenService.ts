/**
 * Token Service
 *
 * Extracts token generation and cookie-setting logic that was duplicated
 * across signup, login, Google OAuth callback, and refresh routes.
 */
import jwt from 'jsonwebtoken'
import type { Response } from 'express'

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '30d'
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export function generateTokens(userId: string): TokenPair {
  return {
    accessToken: jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY }),
    refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRY }),
  }
}

export function setAuthCookies(res: Response, tokens: TokenPair): void {
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

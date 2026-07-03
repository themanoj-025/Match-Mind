/**
 * Auth Service — MatchMind
 *
 * Authentication business logic: signup, login, token refresh, password reset.
 * Extracted from routes/auth.js route handlers.
 *
 * This is a plain JavaScript file that re-exports from authService.ts at runtime.
 * For test environments that can't load TypeScript, the implementation is inlined.
 */

// @ts-nocheck

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')

// ─── Token Generation ─────────────────────────────────

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '30d'

function generateTokens(userId) {
  return {
    accessToken: jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY }),
    refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY }),
  }
}

// ─── Auth Error ───────────────────────────────────────

class AuthError extends Error {
  constructor(message, code, statusCode) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.statusCode = statusCode
    this.isAppError = true
  }
}

// ─── Auth Service ─────────────────────────────────────

class AuthService {
  constructor(deps) {
    this.deps = deps
  }

  /**
   * Sign up a new user.
   * Throws AuthError if email or username already exists.
   */
  async signup(username, email, password) {
    const userRepository = this.deps.userRepository

    // Check for existing user by email or username
    const existing = await userRepository.findByEmailOrUsername(email, username)
    if (existing) {
      throw new AuthError('A user with that email or username already exists', 'DUPLICATE_USER', 409)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await userRepository.create({
      username,
      email,
      passwordHash,
      displayName: username,
    })

    // Generate verification token (logged for now, email sending TBD)
    const verificationToken = jwt.sign(
      { userId: user.id, purpose: 'email-verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )
    logger.info({ event: 'auth.signup', userId: user.id }, `Signup: verification token generated for ${email}`)

    const tokens = generateTokens(user.id)

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        tier: user.tier,
      },
      tokens,
    }
  }

  /**
   * Log in an existing user.
   * Throws AuthError if credentials are invalid.
   */
  async login(email, password) {
    const userRepository = this.deps.userRepository

    const user = await userRepository.findByEmail(email)
    if (!user || !user.passwordHash) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401)
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401)
    }

    const tokens = generateTokens(user.id)

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        tier: user.tier,
      },
      tokens,
    }
  }

  /**
   * Refresh an expired access token using a valid refresh token.
   */
  async refreshToken(refreshToken) {
    const refreshSecret = process.env.JWT_REFRESH_SECRET
    if (!refreshSecret) {
      throw new AuthError('Refresh token secret not configured', 'CONFIG_ERROR', 500)
    }

    let decoded
    try {
      decoded = jwt.verify(refreshToken, refreshSecret)
    } catch {
      throw new AuthError('Invalid or expired refresh token', 'INVALID_TOKEN', 401)
    }

    const user = await this.deps.userRepository.findById(decoded.userId)
    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND', 401)
    }

    return generateTokens(user.id)
  }

  /**
   * Generate a password reset token for a user.
   * Always returns success to prevent email enumeration.
   */
  async generatePasswordResetToken(email) {
    const user = await this.deps.userRepository.findByEmail(email)
    if (user) {
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password-reset' },
        process.env.JWT_RESET_SECRET || process.env.JWT_SECRET,
        { expiresIn: '1h' }
      )
      logger.info({ event: 'auth.password_reset_token', userId: user.id }, `Password reset token generated for ${email}`)
    }
    // Always return success to prevent email enumeration
  }
}

module.exports = { AuthService, AuthError, generateTokens }

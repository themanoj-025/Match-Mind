/**
 * Auth Service — MatchMind
 *
 * Extracts authentication business logic from routes/auth.js route handlers.
 * Route handlers become pure HTTP adapters that call this service.
 */

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { IUserRepository } from '../repositories/types'
import logger from '../utils/logger'
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService'

// ─── Token Generation ─────────────────────────────────

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '30d'

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Generate JWT token pair (access + refresh).
 * Includes tokenVersion in the payload for revocation support.
 * The version is looked up from the user record on each verify call.
 */
export function generateTokens(userId: string, tokenVersion?: number): TokenPair {
  const jwtSecret = process.env.JWT_SECRET
  const refreshSecret = process.env.JWT_REFRESH_SECRET

  if (!jwtSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured')
  }

  return {
    accessToken: jwt.sign(
      { userId, tokenVersion: tokenVersion ?? 0 },
      jwtSecret,
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    ),
    refreshToken: jwt.sign(
      { userId, tokenVersion: tokenVersion ?? 0 },
      refreshSecret,
      { expiresIn: REFRESH_TOKEN_EXPIRY },
    ),
  }
}

/**
 * Get the current tokenVersion for a user.
 */
export async function getTokenVersion(userId: string, prisma: any): Promise<number> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenVersion: true },
    })
    return user?.tokenVersion ?? 0
  } catch (err) {
    logger.error({ event: 'auth.token_version_error', userId, err: String(err) }, 'Failed to get token version — denying access')
    return 0
  }
}

/**
 * Invalidate all tokens for a user by incrementing tokenVersion.
 * Returns the new version number.
 */
export async function revokeTokens(userId: string, prisma: any): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenVersion: true },
  })
  const newVersion = (user?.tokenVersion ?? 0) + 1
  await prisma.user.update({
    where: { id: userId },
    data: { tokenVersion: newVersion },
  })
  return newVersion
}

// ─── Auth Service ─────────────────────────────────────

export interface AuthServiceDeps {
  userRepository: IUserRepository
}

export interface SignupResult {
  user: {
    id: string
    username: string
    email: string
    displayName: string | null
    avatar: string | null
    totalPoints: number
    tier: string
  }
  tokens: TokenPair
}

export interface LoginResult {
  user: {
    id: string
    username: string
    email: string
    displayName: string | null
    avatar: string | null
    totalPoints: number
    tier: string
  }
  tokens: TokenPair
}

export class AuthService {
  private deps: AuthServiceDeps

  constructor(deps: AuthServiceDeps) {
    this.deps = deps
  }

  /**
   * Sign up a new user.
   * Throws if email or username already exists.
   * Uses single query to check both email and username simultaneously.
   */
  async signup(username: string, email: string, password: string): Promise<SignupResult> {
    const userRepository = this.deps.userRepository

    // Single query — check both email and username at once
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

    // Generate and send verification email
    const verificationToken = jwt.sign(
      { userId: user.id, purpose: 'email-verification' },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )
    await sendVerificationEmail(email, verificationToken)

    const tokenVersion = await getTokenVersion(user.id, this.deps.userRepository)
    const tokens = generateTokens(user.id, tokenVersion)

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
   * Throws if credentials are invalid.
   */
  async login(email: string, password: string): Promise<LoginResult> {
    const userRepository = this.deps.userRepository

    const user = await userRepository.findByEmail(email)
    if (!user || !user.passwordHash) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401)
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS', 401)
    }

    const tokenVersion = await getTokenVersion(user.id, this.deps.userRepository)
    const tokens = generateTokens(user.id, tokenVersion)

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
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET
    if (!refreshSecret) {
      throw new AuthError('Refresh token secret not configured', 'CONFIG_ERROR', 500)
    }

    let decoded: { userId: string }
    try {
      decoded = jwt.verify(refreshToken, refreshSecret) as { userId: string }
    } catch {
      throw new AuthError('Invalid or expired refresh token', 'INVALID_TOKEN', 401)
    }

    const user = await this.deps.userRepository.findById(decoded.userId)
    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND', 401)
    }

    const tokenVersion = await getTokenVersion(user.id, this.deps.userRepository)
    return generateTokens(user.id, tokenVersion)
  }

  /**
   * Generate a password reset token for a user.
   */
  async generatePasswordResetToken(email: string): Promise<void> {
    if (!process.env.JWT_RESET_SECRET) {
      logger.error({ event: 'auth.password_reset_secret_missing' }, 'JWT_RESET_SECRET not configured — cannot generate reset tokens')
      return
    }
    const user = await this.deps.userRepository.findByEmail(email)
    if (user) {
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password-reset' },
        process.env.JWT_RESET_SECRET,
        { expiresIn: '1h' }
      )
      await sendPasswordResetEmail(email, resetToken)
    }
    // Always return success to prevent email enumeration
  }
}

// ─── Auth Error ───────────────────────────────────────

export class AuthError extends Error {
  public code: string
  public statusCode: number
  public isAppError: boolean

  constructor(message: string, code: string, statusCode: number) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.statusCode = statusCode
    this.isAppError = true
  }
}

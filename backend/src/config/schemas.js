/**
 * Zod validation schemas for all API request bodies.
 *
 * Every POST / PATCH / PUT route's expected body is defined here.
 * Schemas are imported and used with the validate() middleware.
 */
const { z } = require('zod')

// ─── Auth ───────────────────────────────────────────────

const email = z.string().email('Invalid email format').max(255)
const password = z.string().min(8, 'Password must be at least 8 characters').max(128)
const username = z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')

const signupSchema = z.object({
  username,
  email,
  password,
}).strict()

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
}).strict()

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
}).strict()

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password,
}).strict()

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
}).strict()

// ─── Predictions ────────────────────────────────────────

const nonNegativeInt = z.number().int('Must be a whole number').min(0, 'Cannot be negative')

const createPredictionSchema = z.object({
  matchId: z.string().min(1, 'matchId is required'),
  homeGoals: nonNegativeInt,
  awayGoals: nonNegativeInt,
  firstScorer: z.string().max(100).optional().nullable(),
  totalGoalsOU: z.enum(['over', 'under']).optional().nullable(),
  totalGoalsLine: z.number().positive().optional().nullable(),
  btts: z.boolean().optional().nullable(),
}).strict()

const scorePredictionSchema = z.object({
  pointsEarned: z.number().int().optional(),
  status: z.enum(['SCORED', 'VOID', 'LOCKED', 'PENDING']).optional(),
}).strict()

// ─── Matches ────────────────────────────────────────────

const finishMatchSchema = z.object({
  homeScore: nonNegativeInt.optional(),
  awayScore: nonNegativeInt.optional(),
}).strict()

const updateMatchSchema = z.object({
  homeScore: nonNegativeInt.optional(),
  awayScore: nonNegativeInt.optional(),
  status: z.enum(['SCHEDULED', 'LIVE', 'HALFTIME', 'FINISHED', 'POSTPONED', 'CANCELLED']).optional(),
  minute: nonNegativeInt.optional(),
}).strict()

// ─── Leagues ────────────────────────────────────────────

const createLeagueSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  sport: z.enum(['FOOTBALL', 'BASKETBALL', 'AMERICAN_FOOTBALL', 'TENNIS', 'CRICKET', 'HOCKEY']).optional().nullable(),
  isPublic: z.boolean().optional(),
  description: z.string().max(500).optional().nullable(),
}).strict()

const joinLeagueSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
}).strict()

// ─── Squads ─────────────────────────────────────────────

const createSquadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
}).strict()

const inviteSquadMemberSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
}).strict()

// ─── Users ──────────────────────────────────────────────

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  avatar: z.string().url('Invalid avatar URL').max(500).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  favouriteSports: z.array(z.string()).optional(),
  favouriteTeams: z.array(z.string()).optional(),
}).strict()

// ─── Stripe ────────────────────────────────────────────

const createCheckoutSchema = z.object({
  plan: z.enum(['monthly', 'annual']),
}).strict()

// ─── Messages ──────────────────────────────────────────

const sendMessageSchema = z.object({
  text: z.string().max(1000, 'Message must be under 1000 characters').optional().nullable(),
  gifUrl: z.string().url('Invalid GIF URL').max(500).optional().nullable(),
}).strict().refine(
  (data) => data.text?.trim() || data.gifUrl,
  { message: 'Message text or GIF URL is required' }
)

// ─── AI ─────────────────────────────────────────────────

const aiPredictSchema = z.object({}).strict() // No body needed for now

// ─── Admin ──────────────────────────────────────────────

const adminUpdateUserSchema = z.object({
  role: z.enum(['USER', 'MODERATOR', 'ADMIN', 'SUPERADMIN']).optional(),
  tier: z.enum(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGEND']).optional(),
  username: username.optional(),
  email: email.optional(),
  displayName: z.string().min(1).max(100).optional(),
}).strict()

const adminUpdateReportSchema = z.object({
  status: z.enum(['resolved', 'dismissed']),
}).strict()

// ─── Query Schemas ─────────────────────────────────────

const matchesQuerySchema = z.object({
  sport: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
})

const searchQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters').max(100),
})

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
})

module.exports = {
  // Auth
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,

  // Predictions
  createPredictionSchema,
  scorePredictionSchema,

  // Matches
  finishMatchSchema,
  updateMatchSchema,

  // Leagues
  createLeagueSchema,
  joinLeagueSchema,

  // Squads
  createSquadSchema,
  inviteSquadMemberSchema,

  // Users
  updateProfileSchema,

  // Stripe
  createCheckoutSchema,

  // Messages
  sendMessageSchema,

  // AI
  aiPredictSchema,

  // Admin
  adminUpdateUserSchema,
  adminUpdateReportSchema,

  // Query
  matchesQuerySchema,
  searchQuerySchema,
  paginationQuerySchema,
}

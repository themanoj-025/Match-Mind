const passport = require('passport')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// JWT Strategy — authenticate API requests via Bearer token
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
}

passport.use(new JwtStrategy(jwtOpts, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return done(null, false)
    return done(null, user)
  } catch (err) {
    return done(err, false)
  }
}))

// Google OAuth Strategy — signup/login via Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/cb`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value
      if (!email) return done(new Error('No email from Google'), null)

      let user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            username: `google_${profile.id}`,
            displayName: profile.displayName || profile.name?.givenName || 'Google User',
            avatar: profile.photos?.[0]?.value || null,
          },
        })
      }
      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }))
} else {
  console.warn('⚠️  Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars')
}

// Serialization (not used with JWT, but required for sessions if ever needed)
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

module.exports = passport

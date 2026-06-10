require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const { createServer } = require('http')
const { Server } = require('socket.io')
const { PrismaClient } = require('@prisma/client')

// Initialize Passport strategies (Google OAuth + JWT)
require('./config/passport')

const authRoutes = require('./routes/auth')
const matchRoutes = require('./routes/matches')
const predictionRoutes = require('./routes/predictions')
const leaderboardRoutes = require('./routes/leaderboard')
const userRoutes = require('./routes/users')
const leagueRoutes = require('./routes/leagues')
const squadRoutes = require('./routes/squads')
const highlightRoutes = require('./routes/highlights')
const aiRoutes = require('./routes/ai')
const { setupSocket } = require('./socket')

const prisma = new PrismaClient()
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})

// Middleware
app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

// Make prisma accessible
app.set('prisma', prisma)
app.set('io', io)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/matches', matchRoutes)
app.use('/api/predictions', predictionRoutes)
app.use('/api/leaderboard', leaderboardRoutes)
app.use('/api/users', userRoutes)
app.use('/api/leagues', leagueRoutes)
app.use('/api/squads', squadRoutes)
app.use('/api/highlights', highlightRoutes)
app.use('/api/ai', aiRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// Setup Socket.io
setupSocket(io, prisma)

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  console.log(`MatchMind API server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  httpServer.close()
  process.exit(0)
})

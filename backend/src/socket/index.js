/**
 * Socket.IO event handlers — MatchMind
 *
 * Now enforces JWT authentication for ALL connections.
 * Chat messages are validated, sanitized, and persisted to the database before emitting.
 * Room joins are validated against allowed room types.
 *
 * Simulation events use SIM_* prefix for clarity.
 */
const jwt = require('jsonwebtoken')

// Allowed room types for authorization checks
const ALLOWED_ROOM_TYPES = ['match', 'squad', 'sport']

const setupSocket = (io, prisma) => {
  // Auth middleware for socket connections — REQUIRED, not optional
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error('Authentication required'))
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.userId
      next()
    } catch (err) {
      return next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user: ${socket.userId})`)

    // Join user-specific room for targeted events
    socket.join(`user:${socket.userId}`)

    // ─── Room Management ─────────────────────────────────

    socket.on('JOIN_ROOM', ({ roomId }) => {
      if (!roomId || typeof roomId !== 'string') return

      const roomPrefix = roomId.split(':')[0]
      if (!ALLOWED_ROOM_TYPES.includes(roomPrefix)) return

      socket.join(roomId)
      if (roomId.startsWith('match:')) {
        const matchId = roomId.replace('match:', '')
        const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 1
        io.to(roomId).emit('VIEWER_COUNT', { matchId, count: roomSize })
      }
    })

    socket.on('LEAVE_ROOM', ({ roomId }) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.leave(roomId)
      if (roomId.startsWith('match:')) {
        const matchId = roomId.replace('match:', '')
        const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0
        io.to(roomId).emit('VIEWER_COUNT', { matchId, count: roomSize })
      }
    })

    // ─── Chat Messages (VALIDATED + PERSISTED) ────────────

    socket.on('SEND_MESSAGE', async ({ roomId, text, gifUrl }) => {
      try {
        if (!roomId || typeof roomId !== 'string') return
        const cleanText = typeof text === 'string' ? text.trim().slice(0, 1000) : ''
        const cleanGifUrl = typeof gifUrl === 'string' ? gifUrl.trim().slice(0, 500) : null

        if (!cleanText && !cleanGifUrl) return

        const roomType = roomId.split(':')[0]
        if (!ALLOWED_ROOM_TYPES.includes(roomType)) return

        const message = await prisma.chatMessage.create({
          data: {
            roomType,
            roomId,
            userId: socket.userId,
            text: cleanText || null,
            gifUrl: cleanGifUrl,
            type: cleanGifUrl ? 'gif' : 'text',
          },
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatar: true, tier: true },
            },
          },
        })

        io.to(roomId).emit('CHAT_MESSAGE', message)
      } catch (err) {
        console.error('[Socket] SEND_MESSAGE error:', err.message)
        socket.emit('CHAT_ERROR', { message: 'Failed to send message' })
      }
    })

    // ─── Reactions ────────────────────────────────────────

    socket.on('SEND_REACTION', ({ roomId, emoji }) => {
      if (!roomId || typeof roomId !== 'string') return
      if (!emoji || typeof emoji !== 'string') return
      io.to(roomId).emit('REACTION_UPDATE', { roomId, emoji, userId: socket.userId })
    })

    // ─── Simulation Events (SIM_* prefix) ─────────────────

    socket.on('SIM_STATUS_UPDATE', (data) => {
      if (!data?.matchId) return
      io.to(`match:${data.matchId}`).emit('SIM_STATUS_UPDATE', data)
      io.to('global').emit('SIM_STATUS_UPDATE', data)
    })

    socket.on('SIM_GOAL_EVENT', (data) => {
      if (!data?.matchId) return
      io.to(`match:${data.matchId}`).emit('SIM_GOAL_EVENT', data)
      io.to('global').emit('SIM_GOAL_EVENT', data)
    })

    socket.on('SIM_CARD_EVENT', (data) => {
      if (!data?.matchId) return
      io.to(`match:${data.matchId}`).emit('SIM_CARD_EVENT', data)
    })

    socket.on('SIM_SUB_EVENT', (data) => {
      if (!data?.matchId) return
      io.to(`match:${data.matchId}`).emit('SIM_SUB_EVENT', data)
    })

    // ─── Direct Messages ─────────────────────────────────

    socket.on('DM_TYPING', ({ roomId }) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.to(roomId).emit('DM_TYPING', { roomId, userId: socket.userId })
    })

    socket.on('DM_STOP_TYPING', ({ roomId }) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.to(roomId).emit('DM_STOP_TYPING', { roomId, userId: socket.userId })
    })

    socket.on('JOIN_DM', ({ roomId }) => {
      if (!roomId || typeof roomId !== 'string') return
      if (!roomId.startsWith('dm:')) return
      const participants = roomId.replace('dm:', '').split(':')
      if (!participants.includes(socket.userId)) return
      socket.join(roomId)
    })

    socket.on('LEAVE_DM', ({ roomId }) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.leave(roomId)
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (user: ${socket.userId})`)
    })
  })
}

module.exports = { setupSocket }

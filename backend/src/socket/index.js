/**
 * Socket.IO event handlers
 *
 * Now enforces JWT authentication for ALL connections.
 * Chat messages are validated, sanitized, and persisted to the database before emitting.
 * Room joins are validated against allowed room types.
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

    // Handle joining match/chat rooms
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

    // Handle leaving rooms
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
        // Validate inputs
        if (!roomId || typeof roomId !== 'string') return
        const cleanText = typeof text === 'string' ? text.trim().slice(0, 1000) : ''
        const cleanGifUrl = typeof gifUrl === 'string' ? gifUrl.trim().slice(0, 500) : null

        if (!cleanText && !cleanGifUrl) return

        // Determine and validate room type
        const roomType = roomId.split(':')[0]
        if (!ALLOWED_ROOM_TYPES.includes(roomType)) return

        // Persist to database first
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

        // Then broadcast the persisted message with a real DB id
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

    // ─── Score & Match Events ─────────────────────────────

    socket.on('SCORE_UPDATE', (data) => {
      if (!data?.matchId) return
      io.to(`match:${data.matchId}`).emit('SCORE_UPDATE', data)
      io.to('global').emit('SCORE_UPDATE', data)
    })

    socket.on('GOAL_EVENT', (data) => {
      if (!data?.matchId) return
      io.to(`match:${data.matchId}`).emit('GOAL_EVENT', data)
    })

    socket.on('MATCH_STATUS', (data) => {
      if (!data?.matchId) return
      io.to(`match:${data.matchId}`).emit('MATCH_STATUS', data)
      io.to('global').emit('MATCH_STATUS', data)
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
      // Verify user is a participant in this DM
      const participants = roomId.replace('dm:', '').split(':')
      if (!participants.includes(socket.userId)) return
      socket.join(roomId)
    })

    socket.on('LEAVE_DM', ({ roomId }) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.leave(roomId)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (user: ${socket.userId})`)
    })
  })
}

module.exports = { setupSocket }

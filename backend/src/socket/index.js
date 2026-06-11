const jwt = require('jsonwebtoken')

const setupSocket = (io, prisma) => {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.userId = decoded.userId
      } catch (err) {
        // Allow unauthenticated connections for viewing
      }
    }
    next()
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}${socket.userId ? ` (user: ${socket.userId})` : ''}`)

    // Join global room
    socket.join('global')

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`)
    }

    // Handle joining match rooms
    socket.on('JOIN_ROOM', ({ roomId }) => {
      socket.join(roomId)
      if (roomId.startsWith('match:')) {
        const matchId = roomId.replace('match:', '')
        io.to(roomId).emit('VIEWER_COUNT', { matchId, count: io.sockets.adapter.rooms.get(roomId)?.size || 1 })
      }
    })

    // Handle leaving rooms
    socket.on('LEAVE_ROOM', ({ roomId }) => {
      socket.leave(roomId)
      if (roomId.startsWith('match:')) {
        const matchId = roomId.replace('match:', '')
        io.to(roomId).emit('VIEWER_COUNT', { matchId, count: io.sockets.adapter.rooms.get(roomId)?.size || 0 })
      }
    })

    // Handle chat messages
    socket.on('SEND_MESSAGE', async ({ roomId, text }) => {
      if (!text?.trim()) return

      const message = {
        id: Date.now().toString(),
        userId: socket.userId,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      }

      io.to(roomId).emit('CHAT_MESSAGE', message)
    })

    // Handle reactions
    socket.on('SEND_REACTION', ({ roomId, emoji }) => {
      io.to(roomId).emit('REACTION_UPDATE', { roomId, emoji, userId: socket.userId })
    })

    // Handle score updates (from admin/internal)
    socket.on('SCORE_UPDATE', (data) => {
      io.to(`match:${data.matchId}`).emit('SCORE_UPDATE', data)
      io.to('global').emit('SCORE_UPDATE', data)
    })

    // Handle goal events
    socket.on('GOAL_EVENT', (data) => {
      io.to(`match:${data.matchId}`).emit('GOAL_EVENT', data)
    })

    // Handle match status changes
    socket.on('MATCH_STATUS', (data) => {
      io.to(`match:${data.matchId}`).emit('MATCH_STATUS', data)
      io.to('global').emit('MATCH_STATUS', data)
    })

    // ─── Direct Messages ─────────────────────────────────

    // User is typing in a DM conversation
    socket.on('DM_TYPING', ({ roomId }) => {
      socket.to(roomId).emit('DM_TYPING', { roomId, userId: socket.userId })
    })

    // User stopped typing
    socket.on('DM_STOP_TYPING', ({ roomId }) => {
      socket.to(roomId).emit('DM_STOP_TYPING', { roomId, userId: socket.userId })
    })

    // Join a DM room (called when user opens a DM conversation)
    socket.on('JOIN_DM', ({ roomId }) => {
      socket.join(roomId)
    })

    // Leave a DM room
    socket.on('LEAVE_DM', ({ roomId }) => {
      socket.leave(roomId)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })
}

module.exports = { setupSocket }

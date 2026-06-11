const express = require('express')
const router = express.Router()
const { authenticateToken } = require('../middleware/auth')

/**
 * Helper: build a deterministic DM room ID from two user IDs.
 * Always sorted alphabetically so both users share the same room.
 */
function getDMRoomId(a, b) {
  return `dm:${[a, b].sort().join(':')}`
}

/**
 * GET /api/messages/conversations
 * List all users the current user has DMed with, with the latest message preview.
 */
router.get('/conversations', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const userId = req.userId

    // Get all DM rooms this user is part of
    // Since roomId = "dm:userA:userB", we can search with LIKE
    const messages = await prisma.chatMessage.findMany({
      where: {
        roomType: 'dm',
        roomId: { contains: userId },
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true, tier: true },
        },
      },
    })

    // Group by roomId and get latest message per conversation
    const roomMap = new Map()
    for (const msg of messages) {
      if (!roomMap.has(msg.roomId)) {
        // Find the OTHER participant's ID from the roomId
        const participants = msg.roomId.replace('dm:', '').split(':')
        const otherUserId = participants.find((id) => id !== userId) || msg.userId

        roomMap.set(msg.roomId, {
          roomId: msg.roomId,
          otherUserId,
          lastMessage: msg,
          messageCount: 0,
        })
      }
      roomMap.get(msg.roomId).messageCount++
    }

    // Fetch user info for conversation partners
    const otherUserIds = [...roomMap.values()].map((c) => c.otherUserId)
    const users = await prisma.user.findMany({
      where: { id: { in: otherUserIds } },
      select: { id: true, username: true, displayName: true, avatar: true, tier: true, isPro: true },
    })
    const userMap = new Map(users.map((u) => [u.id, u]))

    // Count unread messages per conversation (messages where user is NOT the sender)
    const unreadCounts = {}
    for (const msg of messages) {
      if (msg.userId !== userId && !msg.isRead) {
        unreadCounts[msg.roomId] = (unreadCounts[msg.roomId] || 0) + 1
      }
    }

    const conversations = [...roomMap.values()]
      .map((c) => ({
        ...c,
        otherUser: userMap.get(c.otherUserId) || null,
        unreadCount: unreadCounts[c.roomId] || 0,
        lastMessage: {
          id: c.lastMessage.id,
          text: c.lastMessage.text,
          gifUrl: c.lastMessage.gifUrl,
          type: c.lastMessage.type,
          createdAt: c.lastMessage.createdAt,
          isOwn: c.lastMessage.userId === userId,
        },
      }))
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))

    res.json(conversations)
  } catch (err) {
    next(err)
  }
})

/**
 * GET /api/messages/:userId
 * Get direct messages between current user and another user.
 */
router.get('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const roomId = getDMRoomId(req.userId, req.params.userId)

    // Verify the other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true, username: true, displayName: true, avatar: true, tier: true, isPro: true, isOnline: true },
    })
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        roomType: 'dm',
        roomId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true, tier: true },
        },
      },
    })

    res.json({ messages, otherUser })
  } catch (err) {
    next(err)
  }
})

/**
 * POST /api/messages/:userId
 * Send a direct message to another user.
 */
router.post('/:userId', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const { text, gifUrl } = req.body
    const roomId = getDMRoomId(req.userId, req.params.userId)

    if (!text?.trim() && !gifUrl) {
      return res.status(400).json({ message: 'Message text or GIF required' })
    }

    // Validate message length
    if (text && text.length > 1000) {
      return res.status(400).json({ message: 'Message must be under 1000 characters' })
    }

    // Validate recipient is not self
    if (req.userId === req.params.userId) {
      return res.status(400).json({ message: 'Cannot message yourself' })
    }

    // Verify the recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { id: true },
    })
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' })
    }

    const message = await prisma.chatMessage.create({
      data: {
        roomType: 'dm',
        roomId,
        userId: req.userId,
        text: text?.trim() || null,
        gifUrl: gifUrl || null,
        type: gifUrl ? 'gif' : 'text',
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true, tier: true, isPro: true },
        },
      },
    })

    // Emit real-time event to both users
    const io = req.app.get('io')
    if (io) {
      // Send to both participants' user rooms
      io.to(`user:${req.userId}`).to(`user:${req.params.userId}`).emit('DM_MESSAGE', {
        message,
        roomId,
        fromUserId: req.userId,
      })
    }

    res.status(201).json(message)
  } catch (err) {
    next(err)
  }
})

/**
 * PATCH /api/messages/read/:userId
 * Mark all messages from a specific user as read.
 */
router.patch('/read/:userId', authenticateToken, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma')
    const roomId = getDMRoomId(req.userId, req.params.userId)

    await prisma.chatMessage.updateMany({
      where: {
        roomType: 'dm',
        roomId,
        userId: req.params.userId, // messages FROM the other user
        isRead: false,
      },
      data: { isRead: true },
    })

    res.json({ message: 'Marked as read' })
  } catch (err) {
    next(err)
  }
})

module.exports = router

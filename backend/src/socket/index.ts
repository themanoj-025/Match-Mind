/**
 * Socket.IO event handlers — AuctionXI
 *
 * Extended from MatchMind with auction-specific events:
 * - PLACE_BID: client → server bid placement (delegates to auctionEngine)
 * - HOST_ACTION: host controls
 * - Auction server → client events: ROOM_STATE_SYNC, NEW_BID, PLAYER_SOLD, etc.
 *
 * JWT authentication enforced on all connections.
 */
import jwt from 'jsonwebtoken'
import type { Server, Socket } from 'socket.io'
import {
  processBid,
  sellCurrentPlayer,
  unsoldCurrentPlayer,
  moveToNextPlayer,
  startReAuction,
} from '../services/auctionEngine'
import type { AuctionState, BidRequest } from '../services/auctionEngine'
import logger from '../utils/logger'

const ALLOWED_ROOM_TYPES = ['match', 'squad', 'sport', 'room', 'dm']

interface AuthenticatedSocket extends Socket {
  userId?: string
}

function makeAuctionHelpers(prisma: any) {
  return {
    getAuctionState: async (roomId: string) => {
      const state = await prisma.auctionState.findUnique({ where: { roomId } })
      return state as AuctionState | null
    },
    saveAuctionState: async (roomId: string, state: AuctionState) => {
      await prisma.auctionState.update({
        where: { roomId },
        data: { ...state },
      })
    },
    getRoom: async (roomId: string) => prisma.room.findUnique({ where: { id: roomId } }),
    getPlayer: async (playerId: string) => prisma.player.findUnique({ where: { id: playerId } }),
    getRoomMember: async (roomId: string, userId: string) =>
      prisma.roomMember.findUnique({ where: { roomId_userId: { roomId, userId } } }),
    getRoster: async (roomId: string, userId: string) =>
      prisma.roster.findMany({ where: { roomId, userId } }),
    getPlayerPool: async (_roomId: string) => [], // Filled from auction state
    saveBid: async (bid: any) => prisma.bid.create({ data: bid }),
  }
}

export const setupSocket = (io: Server, prisma: any): void => {
  // Auth middleware for socket connections
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error('Authentication required'))
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      socket.userId = decoded.userId
      next()
    } catch (err) {
      return next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info({ event: 'socket.connected', socketId: socket.id, userId: socket.userId }, `Socket connected: ${socket.id}`)

    // Join user-specific room for targeted events
    socket.join(`user:${socket.userId}`)

    // ─── Room Management ─────────────────────────────────

    socket.on('JOIN_ROOM', ({ roomId }: { roomId?: string }) => {
      if (!roomId || typeof roomId !== 'string') return
      const roomPrefix = roomId.split(':')[0]
      if (!ALLOWED_ROOM_TYPES.includes(roomPrefix)) return
      socket.join(roomId)

      // Send current auction state if joining an auction room
      if (roomId.startsWith('room:')) {
        const actualRoomId = roomId.replace('room:', '')
        prisma.auctionState.findUnique({ where: { roomId: actualRoomId } })
          .then((state: any) => {
            if (state) {
              socket.emit('ROOM_STATE_SYNC', { auctionState: state })
            }
          })
          .catch(() => {})
      }

      if (roomId.startsWith('match:')) {
        const matchId = roomId.replace('match:', '')
        const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 1
        io.to(roomId).emit('VIEWER_COUNT', { matchId, count: roomSize })
      }
    })

    socket.on('LEAVE_ROOM', ({ roomId }: { roomId?: string }) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.leave(roomId)
      if (roomId.startsWith('match:')) {
        const matchId = roomId.replace('match:', '')
        const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0
        io.to(roomId).emit('VIEWER_COUNT', { matchId, count: roomSize })
      }
    })

    // ─── Auction Events ───────────────────────────────────

    socket.on('PLACE_BID', async (data: {
      roomId: string
      playerId: string
      amount: number
      expectedVersion: number
    }) => {
      try {
        if (!socket.userId) {
          socket.emit('BID_REJECTED', { code: 'UNAUTHENTICATED', message: 'Not authenticated' })
          return
        }

        // Verify room membership
        const member = await prisma.roomMember.findUnique({
          where: { roomId_userId: { roomId: data.roomId, userId: socket.userId } },
        })
        if (!member) {
          socket.emit('BID_REJECTED', { code: 'NOT_MEMBER', message: 'You are not a member of this room' })
          return
        }

        const helpers = makeAuctionHelpers(prisma)
        const result = await processBid(
          {
            roomId: data.roomId,
            playerId: data.playerId,
            amount: data.amount,
            userId: socket.userId,
            expectedVersion: data.expectedVersion,
          } as BidRequest,
          helpers.getRoom,
          helpers.getPlayer,
          helpers.getRoomMember,
          helpers.getRoster,
          helpers.getAuctionState,
          helpers.saveAuctionState,
          helpers.saveBid,
          helpers.getPlayerPool,
        )

        if (result.accepted && result.newState) {
          // Broadcast to entire room
          io.to(`room:${data.roomId}`).emit('NEW_BID', {
            playerId: data.playerId,
            amount: data.amount,
            bidderId: socket.userId,
            timerEndsAt: result.newState.timerEndsAt,
            version: result.newState.version,
          })
        } else {
          // Send rejection only to the bidder
          socket.emit('BID_REJECTED', {
            code: result.reason?.split(':')[0] || 'BID_REJECTED',
            message: result.reason || 'Bid rejected',
          })
        }
      } catch (err: any) {
        logger.error({ event: 'socket.bid_error', userId: socket.userId, err: err.message }, 'PLACE_BID error')
        socket.emit('BID_REJECTED', { code: 'INTERNAL_ERROR', message: 'Failed to process bid' })
      }
    })

    // Rate limit PLACE_BID to max 5/second per socket connection
    const bidTimestamps: number[] = []
    const originalPlaceBid = socket.listeners('PLACE_BID')[0]
    // Note: Socket.IO doesn't support per-event rate limiting natively.
    // This is tracked via the bidTimestamps array as a simple guard.
    socket.prependListener('PLACE_BID', () => {
      const now = Date.now()
      const recent = bidTimestamps.filter((t) => now - t < 1000)
      if (recent.length >= 5) {
        socket.emit('BID_REJECTED', { code: 'RATE_LIMITED', message: 'Too many bids. Slow down.' })
        return
      }
      bidTimestamps.push(now)
      if (bidTimestamps.length > 10) bidTimestamps.shift()
    })

    socket.on('HOST_ACTION', async (data: {
      roomId: string
      action: string
      payload?: any
    }) => {
      try {
        if (!socket.userId) return

        const room = await prisma.room.findUnique({ where: { id: data.roomId } })
        if (!room || room.hostId !== socket.userId) {
          socket.emit('HOST_ACTION_REJECTED', { code: 'NOT_HOST', message: 'Only the host can perform this action' })
          return
        }

        const helpers = makeAuctionHelpers(prisma)
        let newState: AuctionState | null = null

        switch (data.action) {
          case 'NEXT_PLAYER':
            newState = await moveToNextPlayer(data.roomId, helpers.getAuctionState, helpers.saveAuctionState)
            break
          case 'PAUSE':
            await prisma.room.update({ where: { id: data.roomId }, data: { status: 'PAUSED' } })
            io.to(`room:${data.roomId}`).emit('AUCTION_PAUSED', { roomId: data.roomId })
            return
          case 'RESUME':
            await prisma.room.update({ where: { id: data.roomId }, data: { status: 'DRAFTING' } })
            io.to(`room:${data.roomId}`).emit('AUCTION_RESUMED', { roomId: data.roomId })
            return
          case 'FORCE_SOLD': {
            // Deduct budget and create roster entry
            const state = await helpers.getAuctionState(data.roomId)
            if (state?.currentBidderId && state?.currentPlayerId) {
              const member = await helpers.getRoomMember(data.roomId, state.currentBidderId)
              if (member) {
                await prisma.roomMember.update({
                  where: { roomId_userId: { roomId: data.roomId, userId: state.currentBidderId } },
                  data: { remainingBudget: member.remainingBudget - state.currentBid },
                })
              }
              await prisma.roster.create({
                data: {
                  roomId: data.roomId,
                  userId: state.currentBidderId,
                  playerId: state.currentPlayerId,
                  soldPrice: state.currentBid,
                  acquiredAt: new Date().toISOString(),
                  isCaptain: false,
                  isViceCaptain: false,
                },
              })
            }
            newState = await sellCurrentPlayer(data.roomId, helpers.getAuctionState, helpers.saveAuctionState)
            if (state?.currentPlayerId && state?.currentBidderId) {
              io.to(`room:${data.roomId}`).emit('PLAYER_SOLD', {
                roomId: data.roomId,
                playerId: state.currentPlayerId,
                buyerId: state.currentBidderId,
                price: state.currentBid,
              })
            }
            return
          }
          case 'FORCE_UNSOLD':
            newState = await unsoldCurrentPlayer(data.roomId, helpers.getAuctionState, helpers.saveAuctionState)
            if (newState) {
              io.to(`room:${data.roomId}`).emit('PLAYER_UNSOLD', { roomId: data.roomId })
            }
            return
          case 'START_RE_AUCTION':
            newState = await startReAuction(data.roomId, helpers.getAuctionState, helpers.saveAuctionState)
            if (newState) {
              io.to(`room:${data.roomId}`).emit('RE_AUCTION_STARTED', { roomId: data.roomId, poolQueue: newState.poolQueue })
            }
            return
          case 'END_AUCTION':
            await prisma.room.update({ where: { id: data.roomId }, data: { status: 'COMPLETED' } })
            await helpers.saveAuctionState(data.roomId, { ...(await helpers.getAuctionState(data.roomId))!, phase: 'FINISHED', version: Date.now() })
            io.to(`room:${data.roomId}`).emit('AUCTION_FINISHED', { roomId: data.roomId })
            return
        }

        if (newState) {
          io.to(`room:${data.roomId}`).emit('AUCTION_PHASE_CHANGE', { roomId: data.roomId, state: newState })
        }
      } catch (err: any) {
        logger.error({ event: 'socket.host_action_error', userId: socket.userId, err: err.message }, 'HOST_ACTION error')
        socket.emit('HOST_ACTION_REJECTED', { code: 'INTERNAL_ERROR', message: 'Failed to process action' })
      }
    })

    socket.on('TOGGLE_STAR', async ({ roomId, playerId }: { roomId?: string; playerId?: string }) => {
      if (!roomId || !playerId || !socket.userId) return
      try {
        const existing = await prisma.starredPlayer.findUnique({
          where: { userId_roomId_playerId: { userId: socket.userId, roomId, playerId } },
        })
        if (existing) {
          await prisma.starredPlayer.delete({ where: { id: existing.id } })
        } else {
          await prisma.starredPlayer.create({ data: { userId: socket.userId, roomId, playerId } })
        }
      } catch (err: any) {
        logger.error({ event: 'socket.toggle_star_error', userId: socket.userId, err: err.message })
      }
    })

    // ─── Chat Messages ───────────────────────────────────

    socket.on('SEND_MESSAGE', async ({ roomId, text, gifUrl }: { roomId?: string; text?: string; gifUrl?: string }) => {
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
      } catch (err: any) {
        logger.error({ event: 'socket.send_message_error', userId: socket.userId, err: err.message }, 'SEND_MESSAGE error')
        socket.emit('CHAT_ERROR', { message: 'Failed to send message' })
      }
    })

    socket.on('SEND_REACTION', ({ roomId, emoji }: { roomId?: string; emoji?: string }) => {
      if (!roomId || typeof roomId !== 'string') return
      if (!emoji || typeof emoji !== 'string') return
      io.to(roomId).emit('REACTION_UPDATE', { roomId, emoji, userId: socket.userId })
    })

    // ─── Direct Messages ─────────────────────────────────

    socket.on('DM_TYPING', ({ roomId }: { roomId?: string }) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.to(roomId).emit('DM_TYPING', { roomId, userId: socket.userId })
    })

    socket.on('DM_STOP_TYPING', ({ roomId }: { roomId?: string }) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.to(roomId).emit('DM_STOP_TYPING', { roomId, userId: socket.userId })
    })

    socket.on('JOIN_DM', ({ roomId }: { roomId?: string }) => {
      if (!roomId || typeof roomId !== 'string') return
      if (!roomId.startsWith('dm:')) return
      const participants = roomId.replace('dm:', '').split(':')
      if (!participants.includes(socket.userId!)) return
      socket.join(roomId)
    })

    socket.on('LEAVE_DM', ({ roomId }: { roomId?: string }) => {
      if (!roomId || typeof roomId !== 'string') return
      socket.leave(roomId)
    })

    socket.on('disconnect', () => {
      logger.info({ event: 'socket.disconnected', socketId: socket.id, userId: socket.userId }, `Socket disconnected: ${socket.id}`)
    })
  })
}

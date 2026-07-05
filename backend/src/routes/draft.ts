/**
 * Draft Mode Routes — AuctionXI v4 §1.10
 *
 * REST endpoints for the Draft Mode feature.
 * No WebSocket required (Draft Mode is asynchronous/solo by nature).
 *
 * Endpoints:
 *   POST   /api/draft/start          — Start a new draft (consumes ticket)
 *   GET    /api/draft/:sessionId      — Full session state
 *   GET    /api/draft/:sessionId/next-round — Get next choice round
 *   POST   /api/draft/:sessionId/pick — Pick a player
 *   POST   /api/draft/:sessionId/commit — Commit squad
 *   GET    /api/draft/mine            — List user's draft sessions
 *   GET    /api/draft/tickets         — Ticket balance
 *   GET    /api/draft/formations      — List available formations
 */

import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { validate } from '../middleware/validate'
import asyncHandler from '../middleware/asyncHandler'
import { draftStartSchema, draftPickSchema } from '../config/schemas'
import type { AuthenticatedRequest } from '../middleware/auth'
import {
  startDraft,
  getNextRound,
  processPick,
  commitSquad,
  getSessionState,
  listUserDrafts,
  loadFormations,
  type ChoiceRound,
  type DraftSession,
  type DraftPick,
  type SquadPlayer,
} from '../services/draftService'
import {
  consumeTicket,
  getTicketBalance,
} from '../services/draftTicketService'
import { getDraftEnabledTournaments } from '../middleware/draftGate'
import { draftLimiter } from '../middleware/rateLimiter'
import logger from '../utils/logger'

const router = express.Router()

// All draft routes require authentication
router.use(authenticateToken)

// ─── POST /api/draft/start (§1.2) ───────────────────────

router.post(
  '/start',
  draftLimiter,
  validate(draftStartSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const prisma = req.app.get('prisma')
    const { tournamentId, formation } = req.body as { tournamentId: string; formation: string }

    // Verify Draft Mode is enabled for this tournament
    const enabledTournaments = getDraftEnabledTournaments()
    if (!enabledTournaments.includes(tournamentId)) {
      return res.status(403).json({
        error: {
          code: 'DRAFT_MODE_DISABLED',
          message: `Draft Mode is not enabled for tournament "${tournamentId}". Admins can enable it after the player pool has been validated.`,
        },
      })
    }

    // Check if user is Pro
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isPro: true },
    })
    const isPro = user?.isPro ?? false

    // Start draft (consumes ticket internally)
    const result = await startDraft(
      prisma,
      req.userId!,
      tournamentId,
      formation,
      () => consumeTicket(prisma, req.userId!, tournamentId, isPro),
    )

    if (!result.success) {
      return res.status(400).json({
        error: { code: 'DRAFT_START_FAILED', message: result.error || 'Failed to start draft' },
      })
    }

    res.status(201).json({
      session: result.session,
      nextRound: result.nextRound,
    })
  }),
)

// ─── GET /api/draft/formations ─────────────────────────

router.get(
  '/formations',
  asyncHandler(async (_req, res) => {
    const formations = loadFormations()
    res.json(formations)
  }),
)

// ─── GET /api/draft/mine (§1.10) ───────────────────────

router.get(
  '/mine',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const prisma = req.app.get('prisma')
    const sessions = await listUserDrafts(prisma, req.userId!)
    res.json(sessions)
  }),
)

// ─── GET /api/draft/tickets (§1.10) ─────────────────────

router.get(
  '/tickets',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const prisma = req.app.get('prisma')
    const tournamentId = req.query.tournamentId as string | undefined

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isPro: true },
    })
    const isPro = user?.isPro ?? false

    if (tournamentId) {
      const balance = await getTicketBalance(prisma, req.userId!, tournamentId, isPro)
      res.json(balance)
    } else {
      // Return balances for all LIVE tournaments
      const { listLive } = require('../config/tournaments')
      const liveTournaments = listLive()
      const balances = await Promise.all(
        liveTournaments.map((t: any) =>
          getTicketBalance(prisma, req.userId!, t.id, isPro).then((b) => ({
            tournamentId: t.id,
            tournamentName: t.name,
            ...b,
          })),
        ),
      )
      res.json(balances)
    }
  }),
)

// ─── GET /api/draft/:sessionId (§1.10) ──────────────────

router.get(
  '/:sessionId',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const prisma = req.app.get('prisma')
    const result = await getSessionState(prisma, req.params.sessionId as string, req.userId!)

    if (result.error) {
      const status = result.error === 'Session not found' ? 404 : 403
      return res.status(status).json({ error: { code: 'DRAFT_ERROR', message: result.error } })
    }

    // Load player details for the squad
    const allPlayers: any[] = result.session
      ? await prisma.player.findMany({ where: { tournamentId: result.session.tournamentId } })
      : []

    const playersMap = new Map<string, any>(allPlayers.map((p) => [p.id, p]))
    const squadWithPlayers = result.squad.map((sp) => {
      const player: any = playersMap.get(sp.playerId)
      return {
        ...sp,
        player: player
          ? {
              id: player.id,
              name: player.name,
              position: player.position,
              club: player.club,
              nationality: player.nationality,
              basePrice: player.basePrice,
              rarityTier: player.rarityTier,
              photoUrl: player.photoUrl,
            }
          : null,
      }
    })

    res.json({
      session: result.session,
      picks: result.picks.map((p) => ({
        ...p,
        players: p.offeredPlayerIds
          .map((pid: string) => playersMap.get(pid))
          .filter(Boolean),
      })),
      squad: squadWithPlayers,
    })
  }),
)

// ─── GET /api/draft/:sessionId/next-round (§1.10) ──────

router.get(
  '/:sessionId/next-round',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const prisma = req.app.get('prisma')
    const result = await getNextRound(prisma, req.params.sessionId as string, req.userId!)

    if (result.error) {
      const status = result.error === 'Session not found' ? 404 : 403
      return res.status(status).json({ error: { code: 'DRAFT_ERROR', message: result.error } })
    }

    if (result.complete && !result.round) {
      return res.json({ complete: true, session: result.session, round: null })
    }

    res.json({
      round: result.round,
      session: result.session,
      complete: false,
    })
  }),
)

// ─── POST /api/draft/:sessionId/pick (§1.10) ───────────

router.post(
  '/:sessionId/pick',
  validate(draftPickSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const prisma = req.app.get('prisma')
    const { slotIndex, pickedPlayerId } = req.body as { slotIndex: number; pickedPlayerId: string }

    const result = await processPick(
      prisma,
      req.params.sessionId as string,
      req.userId!,
      slotIndex,
      pickedPlayerId,
    )

    if (!result.success) {
      return res.status(400).json({
        error: { code: 'PICK_REJECTED', message: result.error || 'Pick rejected' },
      })
    }

    res.json({
      success: true,
      nextRound: result.nextRound,
      session: result.session,
      complete: result.complete ?? false,
    })
  }),
)

// ─── POST /api/draft/:sessionId/commit (§1.10) ─────────

router.post(
  '/:sessionId/commit',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const prisma = req.app.get('prisma')
    const result = await commitSquad(prisma, req.params.sessionId as string, req.userId!)

    if (!result.success) {
      return res.status(400).json({
        error: { code: 'COMMIT_FAILED', message: result.error || 'Failed to commit squad' },
      })
    }

    logger.info({
      event: 'draft.squad_committed_api',
      sessionId: req.params.sessionId,
      userId: req.userId,
      synergyScore: result.synergyScore,
      formationBonus: result.formationBonus,
    })

    res.json({
      success: true,
      session: result.session,
      synergyScore: result.synergyScore,
      formationBonus: result.formationBonus,
      squad: result.squad,
    })
  }),
)

export default router

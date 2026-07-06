/**
 * AI Auction Advisor — MatchMind
 *
 * Claude-powered draft strategy hints for Pro users.
 * Analyzes a franchise's current roster + remaining budget + remaining pool
 * and suggests undervalued targets.
 *
 * Security: Requires authentication + Pro check + rate limiting.
 */

import express from 'express'
import { authenticateToken } from '../middleware/auth'
import { aiPredictionLimiter } from '../middleware/rateLimiter'
import logger from '../utils/logger'
import asyncHandler from '../middleware/asyncHandler'
import type { AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

/**
 * POST /api/ai/auction-advice
 * Returns AI-powered draft strategy advice for a room/user
 * Pro-gated: only Pro users can access this.
 */
router.post('/auction-advice', authenticateToken, aiPredictionLimiter, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const prisma = req.app.get('prisma')
  const { roomId } = req.body as { roomId: string }

  if (!roomId) {
    return res.status(400).json({ error: { code: 'MISSING_ROOM_ID', message: 'roomId is required' } })
  }

  // Verify room membership
  const member = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId: req.userId } },
  })
  if (!member) {
    return res.status(403).json({ error: { code: 'NOT_MEMBER', message: 'You are not a member of this room' } })
  }

  // Pro check
  const isPro = await checkProStatus(prisma, req.userId!)
  if (!isPro) {
    return res.json({
      isProFeature: true,
      advice: null,
      message: 'AI Auction Advisor is a Pro feature. Upgrade to unlock.',
    })
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } })
  if (!room) {
    return res.status(404).json({ error: { code: 'ROOM_NOT_FOUND', message: 'Room not found' } })
  }

  // Gather context for the AI
  const roster = await prisma.roster.findMany({
    where: { roomId, userId: req.userId },
    include: { player: { select: { id: true, name: true, position: true, basePrice: true, club: true } } },
  })

  const auctionState = await prisma.auctionState.findUnique({ where: { roomId } })
  const remainingPlayers = auctionState?.poolQueue || []
  const unsoldPlayers = auctionState?.unsoldPlayerIds || []

  // Get remaining pool player details
  const poolPlayerIds = [...remainingPlayers, ...unsoldPlayers]
  const poolPlayers = poolPlayerIds.length > 0
    ? await prisma.player.findMany({ where: { id: { in: poolPlayerIds } } })
    : []

  const rosterPositions: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  for (const entry of roster) {
    if (entry.player?.position) {
      rosterPositions[entry.player.position]++
    }
  }

  const positionNeeds: Record<string, number> = {}
  for (const [pos, limit] of Object.entries(room.rosterRules)) {
    if (pos === 'total') continue
    const filled = rosterPositions[pos] || 0
    const need = (limit as number) - filled
    if (need > 0) positionNeeds[pos] = need
  }

  // Try Anthropic SDK if configured
  let advice: any = null
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      advice = await getAnthropicAdvice(roster, member.remainingBudget, positionNeeds, poolPlayers, room.rosterRules)
    } catch (err: any) {
      logger.error({ event: 'ai.anthropic_advice_error', roomId, err: err.message }, 'Anthropic API error')
    }
  }

  if (advice) {
    return res.json({
      isProFeature: false,
      advice,
    })
  }

  // Fallback heuristic advice
  advice = generateHeuristicAdvice(roster, member.remainingBudget, positionNeeds, poolPlayers)
  res.json({
    isProFeature: false,
    advice,
  })
}))

async function checkProStatus(prisma: any, userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true, proExpiresAt: true },
  })
  if (!user) return false
  if (!user.isPro) return false
  if (user.proExpiresAt && new Date(user.proExpiresAt) < new Date()) return false
  return true
}

async function getAnthropicAdvice(
  roster: any[],
  remainingBudget: number,
  positionNeeds: Record<string, number>,
  poolPlayers: any[],
  rosterRules: any,
): Promise<any> {
  const Anthropic = require('@anthropic-ai/sdk')
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const currentRoster = roster.map((r: any) =>
    `${r.player?.name} (${r.player?.position}, purchased for $${r.soldPrice})`
  ).join('\n')

  const availablePlayers = poolPlayers.map((p: any) =>
    `${p.name} (${p.position}, base price $${p.basePrice}) - ${p.club}`
  ).join('\n')

  const msg = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `You are an auction draft advisor for fantasy football (soccer). Analyze this franchise's current roster and remaining budget. Provide draft strategy advice in exactly this JSON format:
{
  "summary": "<1-2 sentence overall strategy>",
  "positionNeeds": "<which positions need filling>",
  "targets": ["<player name>", "<player name>"] // Top 3-5 suggested targets from the available pool
  "budgetAdvice": "<how to allocate remaining budget>",
  "warning": "<any risks like overpaying for a position>"
}

Current Roster:\n${currentRoster || 'Empty - no players yet'}

Remaining Budget: $${remainingBudget}

Position Needs: ${JSON.stringify(positionNeeds)}

Available Players in Pool:\n${availablePlayers || 'No remaining players'}

Roster Rules: ${JSON.stringify(rosterRules)}

Only respond with valid JSON, no other text.`,
    }],
  })

  try {
    const text = (msg.content[0] as any)?.text || '{}'
    return JSON.parse(text)
  } catch {
    return null
  }
}

function generateHeuristicAdvice(
  roster: any[],
  remainingBudget: number,
  positionNeeds: Record<string, number>,
  poolPlayers: any[],
): any {
  const totalNeeds = Object.values(positionNeeds).reduce((a: number, b: number) => a + b, 0)
  const budgetPerSlot = totalNeeds > 0 ? Math.floor(remainingBudget / totalNeeds) : remainingBudget

  // Sort pool players by value (basePrice vs position scarcity)
  const positionScarcity: Record<string, number> = { GK: 3, DEF: 4, MID: 4, FWD: 5 }
  const scored = poolPlayers.map((p: any) => ({
    ...p,
    score: (positionScarcity[p.position] || 3) * p.basePrice > 0
      ? (positionScarcity[p.position] || 3) / (p.basePrice || 50)
      : 0,
  })).sort((a: any, b: any) => b.score - a.score)

  const targets = scored.slice(0, 5).map((p: any) => p.name)

  const positionSummary = Object.entries(positionNeeds)
    .map(([pos, count]) => `${count}x ${pos}`)
    .join(', ')

  return {
    summary: totalNeeds > 0
      ? `You need ${totalNeeds} more players. Focus on ${positionSummary}.`
      : 'Your roster is complete! Consider upgrading existing positions if budget allows.',
    positionNeeds,
    targets,
    budgetAdvice: totalNeeds > 0
      ? `Try to keep average spend under $${budgetPerSlot} per remaining slot.`
      : 'Budget no longer a concern for minimum roster requirements.',
    warning: remainingBudget < budgetPerSlot * totalNeeds
      ? 'Budget is tight — focus on base-price players to fill mandatory slots.'
      : 'Budget is sufficient for remaining needs.',
  }
}

export default router

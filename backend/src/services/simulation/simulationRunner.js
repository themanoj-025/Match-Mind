/**
 * Simulation Runner — MatchMind
 *
 * BullMQ worker that orchestrates a match simulation:
 * 1. Pulls team ratings from DB
 * 2. Calls the pure simulation engine
 * 3. Walks through the event timeline on a compressed clock
 * 4. Persists MatchEvent rows and emits Socket.IO events at each tick
 * 5. Marks the match FINISHED and enqueues scoring
 */

const { simulateMatch } = require('./simulationEngine')
const { finalizeMatch } = require('../workflows/finalizeMatch')
const logger = require('../../utils/logger')

/**
 * Run a simulation for a given match.
 * Can be called from a BullMQ worker OR directly for testing.
 *
 * @param {object} prisma - PrismaClient
 * @param {object} io - Socket.IO instance (optional)
 * @param {string} matchId - ID of the match to simulate
 * @param {object} [opts]
 * @param {number} [opts.tickDelayMs=150] - Delay between events in real time (for compressed clock)
 * @param {boolean} [opts.skipDelay=false] - Skip delays entirely (for tests)
 * @returns {Promise<{ events: number, stats: object, result: object }>}
 */
async function runSimulation(prisma, io, matchId, opts = {}) {
  const { tickDelayMs = 150, skipDelay = false } = opts

  // ─── 1. Load match and team data ──────────────────
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  })

  if (!match) throw new Error(`Match ${matchId} not found`)
  if (match.status !== 'SCHEDULED') throw new Error(`Match ${matchId} is not SCHEDULED (status: ${match.status})`)

  // ─── 2. Generate seed and run engine ──────────────
  const seed = match.simSeed || Math.floor(Math.random() * 2147483647)
  const speedMultiplier = match.simSpeedMultiplier || 20.0

  const homeTeamData = {
    id: match.homeTeamId,
    attackRating: match.homeTeam.attackRating,
    defenseRating: match.homeTeam.defenseRating,
    formRating: match.homeTeam.formRating,
    homeAdvantage: match.homeTeam.homeAdvantage,
  }
  const awayTeamData = {
    id: match.awayTeamId,
    attackRating: match.awayTeam.attackRating,
    defenseRating: match.awayTeam.defenseRating,
    formRating: match.awayTeam.formRating,
    homeAdvantage: match.awayTeam.homeAdvantage,
  }

  const { events: timeline, stats, result } = simulateMatch(homeTeamData, awayTeamData, seed)

  // ─── 3. Mark match as SIMULATING ─────────────────
  const simStartedAt = new Date()
  await prisma.match.update({
    where: { id: matchId },
    data: {
      status: 'SIMULATING',
      simSeed: seed,
      simStartedAt,
      kickedOffAt: simStartedAt,
    },
  })

  // Emit status update
  if (io) {
    io.to(`match:${matchId}`).emit('SIM_STATUS_UPDATE', {
      matchId,
      status: 'SIMULATING',
      minute: 0,
    })
    io.to('global').emit('SIM_STATUS_UPDATE', {
      matchId,
      homeTeamName: match.homeTeamName,
      awayTeamName: match.awayTeamName,
      status: 'SIMULATING',
    })
  }

  // ─── 4. Walk through timeline on compressed clock ─
  const persistedEvents = []
  let currentMinute = 0
  let homeScore = 0
  let awayScore = 0

  for (const event of timeline) {
    // Update minute tracking
    if (event.minute > currentMinute) {
      currentMinute = event.minute
      // Update match minute in DB
      await prisma.match.update({
        where: { id: matchId },
        data: { minute: currentMinute },
      })
    }

    // Handle halftime score persistence
    if (event.type === 'HALFTIME_WHISTLE') {
      await prisma.match.update({
        where: { id: matchId },
        data: {
          status: 'HALFTIME',
          homeScoreHT: event.detail.homeScore,
          awayScoreHT: event.detail.awayScore,
          homeScore: event.detail.homeScore,
          awayScore: event.detail.awayScore,
        },
      })
    }

    // Track scores from goal events
    if (event.type === 'GOAL') {
      homeScore = event.detail.homeScore
      awayScore = event.detail.awayScore

      // Emit goal event
      if (io) {
        io.to(`match:${matchId}`).emit('SIM_GOAL_EVENT', {
          matchId,
          minute: event.minute,
          teamId: event.teamId,
          homeScore,
          awayScore,
          detail: event.detail,
        })
        io.to('global').emit('SIM_GOAL_EVENT', {
          matchId,
          homeTeamName: match.homeTeamName,
          awayTeamName: match.awayTeamName,
          minute: event.minute,
          homeScore,
          awayScore,
        })
      }
    }

    // Emit card events
    if (event.type === 'YELLOW_CARD' || event.type === 'RED_CARD') {
      if (io) {
        io.to(`match:${matchId}`).emit('SIM_CARD_EVENT', {
          matchId,
          minute: event.minute,
          teamId: event.teamId,
          type: event.type,
          detail: event.detail,
        })
      }
    }

    // Emit substitution events
    if (event.type === 'SUBSTITUTION') {
      if (io) {
        io.to(`match:${matchId}`).emit('SIM_SUB_EVENT', {
          matchId,
          minute: event.minute,
          teamId: event.teamId,
          detail: event.detail,
        })
      }
    }

    // Persist event to database
    const persisted = await prisma.matchEvent.create({
      data: {
        matchId,
        type: event.type,
        minute: event.minute,
        teamId: event.teamId,
        detail: event.detail,
      },
    })
    persistedEvents.push(persisted)

    // Emit score update for every 5th minute or on goals
    if (currentMinute % 5 === 0 || event.type === 'GOAL') {
      if (io) {
        io.to(`match:${matchId}`).emit('SIM_STATUS_UPDATE', {
          matchId,
          minute: currentMinute,
          homeScore,
          awayScore,
          status: event.type === 'HALFTIME_WHISTLE' ? 'HALFTIME' : 'SIMULATING',
        })
      }
    }

    // Compressed clock delay
    if (!skipDelay && tickDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, tickDelayMs))
    }
  }

  // ─── 5. Mark match FINISHED ──────────────────────
  const finishedAt = new Date()
  await prisma.match.update({
    where: { id: matchId },
    data: {
      status: 'FINISHED',
      homeScore: result.homeGoals,
      awayScore: result.awayGoals,
      minute: 90,
      finishedAt,
      simEndsAt: finishedAt,
    },
  })

  // Emit fulltime
  if (io) {
    io.to(`match:${matchId}`).emit('SIM_FULLTIME', {
      matchId,
      homeScore: result.homeGoals,
      awayScore: result.awayGoals,
      stats,
    })
    io.to('global').emit('SIM_FULLTIME', {
      matchId,
      homeTeamName: match.homeTeamName,
      awayTeamName: match.awayTeamName,
      homeScore: result.homeGoals,
      awayScore: result.awayGoals,
    })
  }

  // ─── 6. Auto-trigger scoring ─────────────────────
  try {
    await finalizeMatch(prisma, matchId, { mode: 'auto', io })
  } catch (err) {
    logger.error({ event: 'simulation.scoring_failed', matchId, err: err.message }, `Scoring failed for ${matchId}`)
  }

  // Log simulation
  await prisma.scoringLog.create({
    data: {
      matchId,
      type: 'match_finished',
      detail: { seed, events: persistedEvents.length, stats, result },
    },
  })

  logger.info({ event: 'simulation.completed', matchId, homeGoals: result.homeGoals, awayGoals: result.awayGoals, events: persistedEvents.length, seed }, `Match ${matchId} completed: ${result.homeGoals}-${result.awayGoals}`)

  return { events: persistedEvents.length, stats, result, seed }
}

module.exports = { runSimulation }

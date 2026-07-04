/**
 * Simulation Runner — MatchMind
 *
 * Orchestrates a full match simulation:
 * 1. Load match + team data from DB
 * 2. Run simulation engine with seed
 * 3. Walk through event timeline with compressed clock delay
 * 4. Persist each event to MatchEvent table
 * 5. Emit Socket.IO events per event type
 * 6. Mark match FINISHED with final score
 * 7. Auto-trigger scoring via finalizeMatch
 */
import { simulateMatch } from './simulationEngine'
import type { MatchEvent } from './simulationEngine'
import logger from '../../utils/logger'
import { finalizeMatch } from '../../workflows/finalizeMatch'

interface TeamData {
  id: string
  attackRating?: number
  defenseRating?: number
  formRating?: number
  homeAdvantage?: number
}

interface MatchData {
  id: string
  status: string
  homeTeamId: string
  awayTeamId: string
  homeTeamName?: string
  awayTeamName?: string
  simSeed?: number | null
  simSpeedMultiplier?: number | null
  simStartedAt?: Date | null
  simEndsAt?: Date | null
}

interface DatabaseClient {
  [model: string]: {
    findUnique: (args: any) => Promise<any>
    findMany: (args: any) => Promise<any[]>
    update: (args: any) => Promise<any>
    create: (args: any) => Promise<any>
    createMany?: (args: any) => Promise<{ count: number }>
  }
  $transaction?: (ops: any[]) => Promise<any[]>
  _app?: { get?: (key: string) => any }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runSimulation(
  prisma: DatabaseClient,
  io: any,
  matchId: string,
  opts: { skipDelay?: boolean } = {}
): Promise<void> {
  // Load match
  const match = await prisma.match.findUnique({ where: { id: matchId } }) as MatchData | null
  if (!match) throw new Error(`Match ${matchId} not found`)

  // Load teams
  const [homeTeam, awayTeam] = await Promise.all([
    prisma.team.findUnique({ where: { id: match.homeTeamId } }) as Promise<TeamData | null>,
    prisma.team.findUnique({ where: { id: match.awayTeamId } }) as Promise<TeamData | null>,
  ])

  if (!homeTeam || !awayTeam) throw new Error('Teams not found')

  // Use match seed or generate one
  const seed = match.simSeed ?? Math.floor(Math.random() * 100000)

  // Run simulation
  const result = simulateMatch(homeTeam, awayTeam, seed)

  const isFullMatch = result.events.some((e) => e.type === 'HALFTIME_WHISTLE')
  const matchMinuteMax = isFullMatch ? 90 : 48

  // Set match to SIMULATING
  await prisma.match.update({
    where: { id: matchId },
    data: {
      status: 'SIMULATING',
      simSeed: seed,
      simStartedAt: new Date(),
      simEndsAt: new Date(Date.now() + 60000),
    },
  })

  io.to(`match:${matchId}`).emit('MATCH_STATUS', { matchId, status: 'SIMULATING' })

  // Walk through events with compressed clock delay
  const delayPerEvent = opts.skipDelay ? 0 : 150 * (match.simSpeedMultiplier ?? 1)

  for (const event of result.events) {
    // Persist event
    await prisma.matchEvent.create({
      data: {
        matchId,
        type: event.type,
        minute: event.minute,
        teamId: event.teamId ?? null,
        detail: event.detail ?? {},
      },
    })

    // Emit socket events
    switch (event.type) {
      case 'GOAL':
        io.to(`match:${matchId}`).emit('SIM_GOAL_EVENT', {
          matchId,
          team: event.detail.team,
          minute: event.minute,
          homeScore: event.detail.homeScore,
          awayScore: event.detail.awayScore,
          scorer: event.detail.scorer || null,
        })
        io.to('global').emit('SCORE_UPDATE', {
          matchId,
          homeScore: event.detail.homeScore,
          awayScore: event.detail.awayScore,
          minute: event.minute,
        })
        break

      case 'YELLOW_CARD':
      case 'RED_CARD':
        io.to(`match:${matchId}`).emit('SIM_CARD_EVENT', {
          matchId,
          team: event.detail.team,
          type: event.type,
          minute: event.minute,
        })
        break

      case 'SUBSTITUTION':
        io.to(`match:${matchId}`).emit('SIM_SUB_EVENT', {
          matchId,
          team: event.detail.team,
          minute: event.minute,
        })
        break

      case 'HALFTIME_WHISTLE':
        await prisma.match.update({
          where: { id: matchId },
          data: {
            status: 'HALFTIME',
            homeScoreHT: result.result.homeGoalsHT,
            awayScoreHT: result.result.awayGoalsHT,
          },
        })
        io.to(`match:${matchId}`).emit('MATCH_STATUS', { matchId, status: 'HALFTIME' })
        io.to(`match:${matchId}`).emit('SCORE_UPDATE', {
          matchId,
          homeScore: result.result.homeGoalsHT,
          awayScore: result.result.awayGoalsHT,
          minute: 45,
        })
        break

      case 'FULLTIME_WHISTLE':
        // Mark match finished
        await prisma.match.update({
          where: { id: matchId },
          data: {
            status: 'FINISHED',
            homeScore: result.result.homeGoals,
            awayScore: result.result.awayGoals,
            homeScoreHT: result.result.homeGoalsHT,
            awayScoreHT: result.result.awayGoalsHT,
            minute: matchMinuteMax,
            finishedAt: new Date(),
          },
        })

        io.to(`match:${matchId}`).emit('MATCH_STATUS', { matchId, status: 'FINISHED' })
        io.to('global').emit('MATCH_FINISHED', {
          matchId,
          homeTeamName: match.homeTeamName,
          awayTeamName: match.awayTeamName,
          homeScore: result.result.homeGoals,
          awayScore: result.result.awayGoals,
        })

        // Auto-trigger scoring
        try {
          await finalizeMatch(prisma, matchId, { mode: 'auto', io })
        } catch (err) {
          logger.error({ event: 'simulation.scoring_failed', matchId, err: String(err) }, 'Auto-scoring failed after simulation')
        }
        break
    }

    // Emit common events
    if (event.type === 'POSSESSION_TICK') {
      io.to(`match:${matchId}`).emit('POSSESSION_UPDATE', {
        matchId,
        homePossession: event.detail.homePossession,
        awayPossession: event.detail.awayPossession,
        minute: event.minute,
      })
    }

    // Delay between events (except for final events)
    if (event.type !== 'FULLTIME_WHISTLE' && delayPerEvent > 0) {
      await sleep(delayPerEvent)
    }
  }

  logger.info({ event: 'simulation.completed', matchId, seed }, `Simulation complete for match ${matchId} (seed: ${seed})`)
}

/**
 * Match Simulation Engine — MatchMind
 *
 * Pure (no DB/IO) match simulation using deterministic PRNG.
 *
 * Algorithm:
 * 1. Team ratings → expected goals (xG) via formula
 * 2. Poisson distribution → actual goals
 * 3. Distributed goal timings
 * 4. Cards via Bernoulli draws
 * 5. Possession ticks every 5 minutes via Beta distribution
 * 6. Substitutions at fixed windows (60', 75')
 *
 * PRNG: Mulberry32 — seeded, deterministic
 */

// ─── Interfaces ─────────────────────────────────────────

export interface TeamRating {
  id?: string
  attackRating?: number
  defenseRating?: number
  formRating?: number
  homeAdvantage?: number
}

export interface MatchEvent {
  type: string
  minute: number
  teamId?: string | null
  detail: Record<string, any>
}

export interface MatchResult {
  homeGoals: number
  awayGoals: number
  homeGoalsHT: number
  awayGoalsHT: number
}

export interface SimulationStats {
  homePossession: number
  awayPossession: number
  homeXG: number
  awayXG: number
  homeShots: number
  awayShots: number
  homeShotsOnTarget: number
  awayShotsOnTarget: number
}

export interface SimulationResult {
  events: MatchEvent[]
  stats: SimulationStats
  result: MatchResult
  seed: number
}

// ─── PRNG: Mulberry32 ────────────────────────────────────

export function mulberry32(seed: number): () => number {
  let s = seed | 0
  return function () {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Poisson Distribution ────────────────────────────────

export function poissonSample(lambda: number, rng: () => number): number {
  if (lambda <= 0) return 0
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng()
  } while (p > L)
  return k - 1
}

// ─── Expected Goals Calculation ──────────────────────────

export function calculateExpectedGoals(homeTeam: TeamRating, awayTeam: TeamRating): { homeXG: number; awayXG: number } {
  const hAtt = homeTeam.attackRating ?? 50
  const hDef = homeTeam.defenseRating ?? 50
  const hForm = homeTeam.formRating ?? 50
  const hHome = homeTeam.homeAdvantage ?? 5

  const aAtt = awayTeam.attackRating ?? 50
  const aDef = awayTeam.defenseRating ?? 50
  const aForm = awayTeam.formRating ?? 50

  // Base xG: Attack / (Defense + 50) * (Form / 50) * 1.2
  const baseHomeXG = (hAtt / (aDef + 50)) * (hForm / 50) * 1.2
  const baseAwayXG = (aAtt / (hDef + 50)) * (aForm / 50) * 1.1

  // Home advantage adds ~0.2-0.5 xG
  const homeAdv = 0.2 + hHome * 0.03
  const homeXG = Math.min(Math.max(baseHomeXG + homeAdv, 0.2), 4.5)
  const awayXG = Math.min(Math.max(baseAwayXG, 0.2), 4.5)

  return { homeXG, awayXG }
}

// ─── Goal Timing Distribution ────────────────────────────

function generateGoalTimings(numGoals: number, rng: () => number, matchMinuteMax: number = 90): number[] {
  const timings: number[] = []
  for (let i = 0; i < numGoals; i++) {
    // Bias toward later minutes (more goals in second half)
    const u = rng()
    const biasedMinute = Math.pow(u, 0.85) * matchMinuteMax
    timings.push(Math.round(biasedMinute))
  }
  return timings.sort((a, b) => a - b)
}

// ─── Team-specific defaults ──────────────────────────────

function getTeamRating(team: TeamRating, key: keyof TeamRating, defaultValue: number): number {
  const val = team[key]
  return typeof val === 'number' ? val : defaultValue
}

// ─── Simulate Match ──────────────────────────────────────

export function simulateMatch(
  homeTeam: TeamRating,
  awayTeam: TeamRating,
  seed: number,
  opts: { matchMinuteMax?: number } = {}
): SimulationResult {
  const matchMinuteMax = opts.matchMinuteMax ?? 90
  const rng = mulberry32(seed)

  // Calculate expected goals
  const { homeXG, awayXG } = calculateExpectedGoals(homeTeam, awayTeam)

  // Sample actual goals from Poisson
  const homeGoals = poissonSample(homeXG, rng)
  const awayGoals = poissonSample(awayXG, rng)

  // Generate half-time scores (more conservative)
  const htHomeGoals = Math.min(homeGoals, poissonSample(homeXG * 0.45, rng))
  const htAwayGoals = Math.min(awayGoals, poissonSample(awayXG * 0.45, rng))

  // Generate goal timings
  const homeGoalTimings = generateGoalTimings(homeGoals, rng, matchMinuteMax)
  const awayGoalTimings = generateGoalTimings(awayGoals, rng, matchMinuteMax)

  // Generate possession (Beta distribution ~ centered on 50% with home advantage)
  const homePossRaw = 0.5 + (getTeamRating(homeTeam, 'attackRating', 50) - getTeamRating(awayTeam, 'defenseRating', 50)) * 0.002 + getTeamRating(homeTeam, 'homeAdvantage', 5) * 0.01
  const homePossession = Math.min(Math.max(Math.round(homePossRaw * 100), 30), 70)
  const awayPossession = 100 - homePossession

  // Build event timeline
  const events: MatchEvent[] = []

  // Kickoff
  events.push({ type: 'KICKOFF', minute: 0, detail: {} })

  // Possession ticks every 5 minutes
  for (let min = 5; min <= matchMinuteMax; min += 5) {
    events.push({
      type: 'POSSESSION_TICK',
      minute: min,
      detail: {
        homePossession,
        awayPossession,
      },
    })
  }

  // Goals
  let scoredHome = 0
  let scoredAway = 0

  for (const minute of homeGoalTimings) {
    scoredHome++
    const isHT = minute <= 45
    events.push({
      type: 'GOAL',
      minute,
      teamId: homeTeam.id,
      detail: {
        team: 'home',
        homeScore: scoredHome,
        awayScore: scoredAway,
        homeGoalsHT: isHT ? scoredHome : htHomeGoals,
        awayGoalsHT: isHT ? scoredAway : htAwayGoals,
      },
    })
  }

  for (const minute of awayGoalTimings) {
    scoredAway++
    const isHT = minute <= 45
    events.push({
      type: 'GOAL',
      minute,
      teamId: awayTeam.id,
      detail: {
        team: 'away',
        homeScore: scoredHome,
        awayScore: scoredAway,
        homeGoalsHT: isHT ? scoredHome : htHomeGoals,
        awayGoalsHT: isHT ? scoredAway : htAwayGoals,
      },
    })
  }

  // Sort goals by minute (interleave home and away)
  events.sort((a, b) => a.minute - b.minute || (a.type === 'GOAL' ? -1 : 1))

  // Cards (average ~1.1 per team per match via Bernoulli)
  const homeCards: number = rng() < 0.8 ? 1 + Math.floor(rng() * 3) : 0
  const awayCards: number = rng() < 0.75 ? 1 + Math.floor(rng() * 3) : 0

  for (let i = 0; i < homeCards; i++) {
    events.push({
      type: rng() < 0.9 ? 'YELLOW_CARD' : 'RED_CARD',
      minute: Math.floor(rng() * matchMinuteMax),
      teamId: homeTeam.id,
      detail: { team: 'home', playerIndex: i },
    })
  }

  for (let i = 0; i < awayCards; i++) {
    events.push({
      type: rng() < 0.9 ? 'YELLOW_CARD' : 'RED_CARD',
      minute: Math.floor(rng() * matchMinuteMax),
      teamId: awayTeam.id,
      detail: { team: 'away', playerIndex: i },
    })
  }

  // Substitutions at fixed windows
  if (matchMinuteMax >= 60) {
    events.push({
      type: 'SUBSTITUTION',
      minute: 60,
      detail: { team: 'home', type: 'first_sub' },
    })
    events.push({
      type: 'SUBSTITUTION',
      minute: 60,
      detail: { team: 'away', type: 'first_sub' },
    })
  }
  if (matchMinuteMax >= 75) {
    events.push({
      type: 'SUBSTITUTION',
      minute: 75,
      detail: { team: 'home', type: 'second_sub' },
    })
    events.push({
      type: 'SUBSTITUTION',
      minute: 75,
      detail: { team: 'away', type: 'second_sub' },
    })
  }

  // Halftime whistle
  if (matchMinuteMax > 45) {
    events.push({ type: 'HALFTIME_WHISTLE', minute: 45, detail: { homeGoals: htHomeGoals, awayGoals: htAwayGoals } })
  }

  // Full-time whistle
  events.push({ type: 'FULLTIME_WHISTLE', minute: matchMinuteMax, detail: { homeGoals, awayGoals } })

  // Re-sort everything by minute
  events.sort((a, b) => a.minute - b.minute)

  // Calculate shots/shots on target (approximate)
  const homeShots = homeGoals + Math.floor(poissonSample(homeXG * 2.5, rng)) + 1
  const awayShots = awayGoals + Math.floor(poissonSample(awayXG * 2.5, rng)) + 1
  const homeShotsOnTarget = homeGoals + Math.floor(homeShots * 0.35)
  const awayShotsOnTarget = awayGoals + Math.floor(awayShots * 0.35)

  return {
    events,
    stats: {
      homePossession,
      awayPossession,
      homeXG: Math.round(homeXG * 100) / 100,
      awayXG: Math.round(awayXG * 100) / 100,
      homeShots,
      awayShots,
      homeShotsOnTarget,
      awayShotsOnTarget,
    },
    result: {
      homeGoals,
      awayGoals,
      homeGoalsHT: htHomeGoals,
      awayGoalsHT: htAwayGoals,
    },
    seed,
  }
}

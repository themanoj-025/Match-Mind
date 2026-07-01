/**
 * Simulation Engine — MatchMind
 *
 * Pure, deterministic match simulation using Poisson-distributed goal timing.
 * This module contains ZERO DB/queue/IO dependencies — it's purely math.
 * Feed it team ratings and a seed, get back a deterministic event timeline.
 *
 * Algorithm:
 * 1. Calculate expected goals (xG) for each team based on ratings
 * 2. Sample actual goals from Poisson distribution
 * 3. Distribute goal timings across compressed match clock
 * 4. Layer in cards (low-probability Bernoulli draws), possession ticks
 * 5. Generate kickoff, halftime, fulltime events
 */

// ─── Seeded PRNG (Mulberry32) ───────────────────────────
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Poisson Sampling ───────────────────────────────────
function poissonSample(lambda, rng) {
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

// ─── Beta Distribution (Jöhnk's algorithm) ──────────────
function betaSample(alpha, betaParam, rng) {
  // Simple approximation using normal + clamp for possession
  // More accurate than pure random for our use case
  const mean = alpha / (alpha + betaParam)
  const variance = (alpha * betaParam) / ((alpha + betaParam) ** 2 * (alpha + betaParam + 1))
  const stddev = Math.sqrt(variance)
  // Box-Muller transform
  const u1 = rng()
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2)
  return Math.max(0.15, Math.min(0.85, mean + z * stddev))
}

// ─── Default Constants ──────────────────────────────────
const BASE_GOAL_RATE = 1.4 // Expected goals per team in a balanced match
const MAX_MATCH_MINUTE = 90
const CARD_PROBABILITY_PER_MINUTE = 0.012 // ~1.1 cards per match per team
const SUBSTITUTION_WINDOWS = [60, 75] // Minutes when subs can happen

/**
 * Calculate expected goals for each team.
 *
 * @param {object} homeTeam - { attackRating, defenseRating, formRating, homeAdvantage }
 * @param {object} awayTeam - { attackRating, defenseRating, formRating, homeAdvantage }
 * @returns {{ homeXG: number, awayXG: number }}
 */
function calculateExpectedGoals(homeTeam, awayTeam) {
  const homeAttack = (homeTeam.attackRating || 65) / 100
  const homeDefense = (homeTeam.defenseRating || 65) / 100
  const awayAttack = (awayTeam.attackRating || 65) / 100
  const awayDefense = (awayTeam.defenseRating || 65) / 100
  const homeForm = ((homeTeam.formRating || 50) - 50) / 100 * 0.3
  const awayForm = ((awayTeam.formRating || 50) - 50) / 100 * 0.3
  const homeAdv = (homeTeam.homeAdvantage || 5) / 100

  const homeXG = BASE_GOAL_RATE
    * (homeAttack / (1 - awayDefense * 0.6 + 0.3))
    * (1 + homeAdv)
    * (1 + homeForm)

  const awayXG = BASE_GOAL_RATE
    * (awayAttack / (1 - homeDefense * 0.6 + 0.3))
    * (1 + awayForm)

  return {
    homeXG: Math.max(0.2, Math.min(4.5, homeXG)),
    awayXG: Math.max(0.2, Math.min(4.5, awayXG)),
  }
}

/**
 * Generate a full match event timeline.
 *
 * @param {object} homeTeam - { id, attackRating, defenseRating, formRating, homeAdvantage }
 * @param {object} awayTeam - { id, attackRating, defenseRating, formRating, homeAdvantage }
 * @param {number} seed - RNG seed for deterministic output
 * @param {object} [opts] - Optional overrides
 * @param {number} [opts.matchMinuteMax=90] - Match duration
 * @returns {{ events: Array, stats: object, result: object }}
 */
function simulateMatch(homeTeam, awayTeam, seed, opts = {}) {
  const rng = mulberry32(seed)
  const matchMinuteMax = opts.matchMinuteMax || MAX_MATCH_MINUTE

  const { homeXG, awayXG } = calculateExpectedGoals(homeTeam, awayTeam)
  const homeGoals = poissonSample(homeXG, rng)
  const awayGoals = poissonSample(awayXG, rng)

  const events = []
  let homePossession = 0
  let awayPossession = 0
  let homeShots = 0
  let awayShots = 0

  // ─── KICKOFF ────────────────────────────────────────
  events.push({ type: 'KICKOFF', minute: 0, teamId: null, detail: { homeXG, awayXG } })

  // ─── Generate goal timings ──────────────────────────
  const homeGoalMinutes = []
  const awayGoalMinutes = []
  for (let i = 0; i < homeGoals; i++) {
    // Slight bias toward later minutes (more exciting)
    const minute = Math.min(matchMinuteMax - 1, Math.floor(5 + rng() * (matchMinuteMax - 10) * (0.6 + rng() * 0.4)))
    homeGoalMinutes.push(minute)
  }
  for (let i = 0; i < awayGoals; i++) {
    const minute = Math.min(matchMinuteMax - 1, Math.floor(5 + rng() * (matchMinuteMax - 10) * (0.6 + rng() * 0.4)))
    awayGoalMinutes.push(minute)
  }

  // Sort all goals by minute
  const allGoals = [
    ...homeGoalMinutes.map((m) => ({ minute: m, teamId: homeTeam.id, isHome: true })),
    ...awayGoalMinutes.map((m) => ({ minute: m, teamId: awayTeam.id, isHome: false })),
  ].sort((a, b) => a.minute - b.minute)

  // ─── Minute-by-minute simulation ────────────────────
  let currentHomeScore = 0
  let currentAwayScore = 0
  let goalIndex = 0
  const homeDefense = (homeTeam.defenseRating || 65) / 100
  const awayDefense = (awayTeam.defenseRating || 65) / 100

  for (let minute = 1; minute <= matchMinuteMax; minute++) {
    // Possession tick (every 5 minutes)
    if (minute % 5 === 0) {
      const homePoss = betaSample(
        (homeTeam.attackRating || 65) / 30,
        (awayTeam.attackRating || 65) / 30,
        rng,
      )
      homePossession += homePoss
      awayPossession += (1 - homePoss)
      events.push({
        type: 'POSSESSION_TICK',
        minute,
        teamId: null,
        detail: { homePossession: Math.round(homePoss * 100) },
      })
    }

    // Card events (Bernoulli draws)
    const homeCardChance = CARD_PROBABILITY_PER_MINUTE * (1 + (1 - homeDefense))
    if (rng() < homeCardChance) {
      const isRed = rng() < 0.08
      events.push({
        type: isRed ? 'RED_CARD' : 'YELLOW_CARD',
        minute,
        teamId: homeTeam.id,
        detail: { reason: 'foul' },
      })
    }
    const awayCardChance = CARD_PROBABILITY_PER_MINUTE * (1 + (1 - awayDefense))
    if (rng() < awayCardChance) {
      const isRed = rng() < 0.08
      events.push({
        type: isRed ? 'RED_CARD' : 'YELLOW_CARD',
        minute,
        teamId: awayTeam.id,
        detail: { reason: 'foul' },
      })
    }

    // Shots (approximate — ~10-15 per team per match)
    if (rng() < 0.12) { homeShots++ }
    if (rng() < 0.10) { awayShots++ }

    // Check for goals at this minute
    while (goalIndex < allGoals.length && allGoals[goalIndex].minute === minute) {
      const goal = allGoals[goalIndex]
      if (goal.isHome) {
        currentHomeScore++
      } else {
        currentAwayScore++
      }
      events.push({
        type: 'GOAL',
        minute,
        teamId: goal.teamId,
        detail: {
          homeScore: currentHomeScore,
          awayScore: currentAwayScore,
          scorer: goal.isHome ? 'home_scorer' : 'away_scorer',
        },
      })
      goalIndex++
    }

    // Halftime whistle
    if (minute === Math.floor(matchMinuteMax / 2)) {
      events.push({
        type: 'HALFTIME_WHISTLE',
        minute,
        teamId: null,
        detail: { homeScore: currentHomeScore, awayScore: currentAwayScore },
      })
    }

    // Substitutions (at fixed windows)
    if (SUBSTITUTION_WINDOWS.includes(minute)) {
      if (rng() < 0.7) {
        events.push({ type: 'SUBSTITUTION', minute, teamId: homeTeam.id, detail: { out: 'player_a', in: 'player_b' } })
      }
      if (rng() < 0.7) {
        events.push({ type: 'SUBSTITUTION', minute, teamId: awayTeam.id, detail: { out: 'player_c', in: 'player_d' } })
      }
    }
  }

  // ─── FULLTIME ───────────────────────────────────────
  events.push({
    type: 'FULLTIME_WHISTLE',
    minute: matchMinuteMax,
    teamId: null,
    detail: { homeScore: currentHomeScore, awayScore: currentAwayScore },
  })

  // ─── Compute aggregate stats ────────────────────────
  const totalPoss = homePossession + awayPossession || 1
  const stats = {
    homePossession: Math.round((homePossession / totalPoss) * 100),
    awayPossession: Math.round((awayPossession / totalPoss) * 100),
    homeShots,
    awayShots,
    homeCorners: Math.floor(homeShots * 0.4 + rng() * 3),
    awayCorners: Math.floor(awayShots * 0.4 + rng() * 3),
    homeXG: Math.round(homeXG * 100) / 100,
    awayXG: Math.round(awayXG * 100) / 100,
  }

  const result = {
    homeGoals: currentHomeScore,
    awayGoals: currentAwayScore,
    homeResult: currentHomeScore > currentAwayScore ? 'win' : currentHomeScore < currentAwayScore ? 'loss' : 'draw',
    awayResult: currentAwayScore > currentHomeScore ? 'win' : currentAwayScore < currentHomeScore ? 'loss' : 'draw',
  }

  return { events, stats, result, seed }
}

module.exports = {
  simulateMatch,
  calculateExpectedGoals,
  poissonSample,
  mulberry32,
  betaSample,
  BASE_GOAL_RATE,
  MAX_MATCH_MINUTE,
}

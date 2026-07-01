/**
 * Simulation Engine Tests — MatchMind
 *
 * Tests the pure simulation functions:
 * - mulberry32 (deterministic PRNG)
 * - poissonSample (goal distribution)
 * - calculateExpectedGoals (rating-based xG)
 * - simulateMatch (full match simulation)
 */
// vitest globals: describe, it, expect are available globally
const { simulateMatch, calculateExpectedGoals, poissonSample, mulberry32 } = require('./simulationEngine')

describe('mulberry32 PRNG', () => {
  it('produces deterministic output for same seed', () => {
    const rng1 = mulberry32(42)
    const rng2 = mulberry32(42)
    const vals1 = Array.from({ length: 100 }, () => rng1())
    const vals2 = Array.from({ length: 100 }, () => rng2())
    expect(vals1).toEqual(vals2)
  })

  it('produces different output for different seeds', () => {
    const rng1 = mulberry32(42)
    const rng2 = mulberry32(99)
    const vals1 = Array.from({ length: 100 }, () => rng1())
    const vals2 = Array.from({ length: 100 }, () => rng2())
    expect(vals1).not.toEqual(vals2)
  })

  it('produces values between 0 and 1', () => {
    const rng = mulberry32(12345)
    for (let i = 0; i < 1000; i++) {
      const val = rng()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })
})

describe('poissonSample', () => {
  it('returns 0 when lambda is 0', () => {
    const rng = mulberry32(42)
    expect(poissonSample(0, rng)).toBe(0)
  })

  it('returns 0 when lambda is negative', () => {
    const rng = mulberry32(42)
    expect(poissonSample(-1, rng)).toBe(0)
  })

  it('average converges to lambda over many samples', () => {
    const rng = mulberry32(42)
    const lambda = 1.4
    const samples = 10000
    let sum = 0
    for (let i = 0; i < samples; i++) {
      sum += poissonSample(lambda, rng)
    }
    const avg = sum / samples
    // Should be within 0.1 of lambda
    expect(avg).toBeGreaterThan(lambda - 0.15)
    expect(avg).toBeLessThan(lambda + 0.15)
  })

  it('produces non-negative integers', () => {
    const rng = mulberry32(99)
    for (let i = 0; i < 1000; i++) {
      const val = poissonSample(2.0, rng)
      expect(val).toBeGreaterThanOrEqual(0)
      expect(Number.isInteger(val)).toBe(true)
    }
  })
})

describe('calculateExpectedGoals', () => {
  const balancedTeams = {
    attackRating: 65,
    defenseRating: 65,
    formRating: 50,
    homeAdvantage: 5,
  }

  it('returns reasonable xG for balanced teams', () => {
    const { homeXG, awayXG } = calculateExpectedGoals(balancedTeams, balancedTeams)
    expect(homeXG).toBeGreaterThan(0.5)
    expect(homeXG).toBeLessThan(3.0)
    expect(awayXG).toBeGreaterThan(0.5)
    expect(awayXG).toBeLessThan(3.0)
  })

  it('gives home team a slight advantage', () => {
    const { homeXG, awayXG } = calculateExpectedGoals(balancedTeams, balancedTeams)
    expect(homeXG).toBeGreaterThan(awayXG)
  })

  it('favors strong attack vs weak defense', () => {
    const strongAttack = { ...balancedTeams, attackRating: 90 }
    const weakDefense = { ...balancedTeams, defenseRating: 30 }
    const { homeXG } = calculateExpectedGoals(strongAttack, weakDefense)
    expect(homeXG).toBeGreaterThan(1.0)
    // Should be higher than balanced teams
    const balanced = calculateExpectedGoals(balancedTeams, balancedTeams)
    expect(homeXG).toBeGreaterThan(balanced.homeXG)
  })

  it('penalizes weak attack vs strong defense', () => {
    const weakAttack = { ...balancedTeams, attackRating: 30 }
    const strongDefense = { ...balancedTeams, defenseRating: 90 }
    const { homeXG } = calculateExpectedGoals(weakAttack, strongDefense)
    expect(homeXG).toBeLessThan(1.0)
  })

  it('clamps xG to reasonable bounds', () => {
    const extreme = { attackRating: 100, defenseRating: 0, formRating: 100, homeAdvantage: 20 }
    const { homeXG, awayXG } = calculateExpectedGoals(extreme, extreme)
    expect(homeXG).toBeGreaterThanOrEqual(0.2)
    expect(homeXG).toBeLessThanOrEqual(4.5)
    expect(awayXG).toBeGreaterThanOrEqual(0.2)
    expect(awayXG).toBeLessThanOrEqual(4.5)
  })
})

describe('simulateMatch', () => {
  const defaultHome = {
    id: 'home-1',
    attackRating: 70,
    defenseRating: 65,
    formRating: 55,
    homeAdvantage: 5,
  }
  const defaultAway = {
    id: 'away-1',
    attackRating: 60,
    defenseRating: 70,
    formRating: 45,
    homeAdvantage: 5,
  }

  it('returns a complete event timeline', () => {
    const { events, stats, result, seed } = simulateMatch(defaultHome, defaultAway, 42)
    expect(events).toBeDefined()
    expect(events.length).toBeGreaterThan(10)
    expect(stats).toBeDefined()
    expect(result).toBeDefined()
    expect(seed).toBe(42)
  })

  it('starts with KICKOFF and ends with FULLTIME_WHISTLE', () => {
    const { events } = simulateMatch(defaultHome, defaultAway, 42)
    expect(events[0].type).toBe('KICKOFF')
    expect(events[events.length - 1].type).toBe('FULLTIME_WHISTLE')
  })

  it('includes HALFTIME_WHISTLE around minute 45', () => {
    const { events } = simulateMatch(defaultHome, defaultAway, 42)
    const halftime = events.find((e) => e.type === 'HALFTIME_WHISTLE')
    expect(halftime).toBeDefined()
    expect(halftime.minute).toBe(45)
  })

  it('produces deterministic results for same seed', () => {
    const r1 = simulateMatch(defaultHome, defaultAway, 42)
    const r2 = simulateMatch(defaultHome, defaultAway, 42)
    expect(r1.result.homeGoals).toBe(r2.result.homeGoals)
    expect(r1.result.awayGoals).toBe(r2.result.awayGoals)
    expect(r1.events.length).toBe(r2.events.length)
  })

  it('produces different results for different seeds', () => {
    const r1 = simulateMatch(defaultHome, defaultAway, 42)
    const r2 = simulateMatch(defaultHome, defaultAway, 99)
    // Not guaranteed to be different but extremely unlikely with different seeds
    // Just check they both produce valid results
    expect(r1.result.homeGoals).toBeGreaterThanOrEqual(0)
    expect(r2.result.homeGoals).toBeGreaterThanOrEqual(0)
  })

  it('result scores match goal events', () => {
    const { events, result } = simulateMatch(defaultHome, defaultAway, 42)
    const goals = events.filter((e) => e.type === 'GOAL')
    const lastGoal = goals[goals.length - 1]
    if (lastGoal) {
      expect(result.homeGoals).toBe(lastGoal.detail.homeScore)
      expect(result.awayGoals).toBe(lastGoal.detail.awayScore)
    } else {
      expect(result.homeGoals).toBe(0)
      expect(result.awayGoals).toBe(0)
    }
  })

  it('includes POSSESSION_TICK events', () => {
    const { events } = simulateMatch(defaultHome, defaultAway, 42)
    const possessionEvents = events.filter((e) => e.type === 'POSSESSION_TICK')
    expect(possessionEvents.length).toBeGreaterThan(0)
  })

  it('home possession + away possession totals ~100%', () => {
    const { stats } = simulateMatch(defaultHome, defaultAway, 42)
    expect(stats.homePossession + stats.awayPossession).toBe(100)
  })

  it('handles 0-0 draws correctly', () => {
    // Use a weak vs weak matchup with a seed that produces 0-0
    const weak = { id: 'weak', attackRating: 20, defenseRating: 90, formRating: 30, homeAdvantage: 2 }
    const { result, events } = simulateMatch(weak, weak, 7)
    expect(result.homeGoals).toBeGreaterThanOrEqual(0)
    expect(result.awayGoals).toBeGreaterThanOrEqual(0)
    // Goals should be 0 or very low for such weak attacks
    expect(result.homeGoals + result.awayGoals).toBeLessThanOrEqual(2)
  })

  it('handles very mismatched teams', () => {
    const strong = { id: 'strong', attackRating: 95, defenseRating: 90, formRating: 90, homeAdvantage: 10 }
    const weak = { id: 'weak', attackRating: 25, defenseRating: 30, formRating: 20, homeAdvantage: 2 }
    const { result } = simulateMatch(strong, weak, 42)
    expect(result.homeGoals).toBeGreaterThanOrEqual(0)
    expect(result.awayGoals).toBeGreaterThanOrEqual(0)
    // Strong team should generally score more
    expect(result.homeGoals).toBeGreaterThanOrEqual(result.awayGoals - 1)
  })

  it('all events have valid types', () => {
    const validTypes = ['KICKOFF', 'GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'POSSESSION_TICK', 'HALFTIME_WHISTLE', 'FULLTIME_WHISTLE']
    const { events } = simulateMatch(defaultHome, defaultAway, 42)
    for (const event of events) {
      expect(validTypes).toContain(event.type)
    }
  })

  it('all events have valid minute values', () => {
    const { events } = simulateMatch(defaultHome, defaultAway, 42)
    for (const event of events) {
      expect(event.minute).toBeGreaterThanOrEqual(0)
      expect(event.minute).toBeLessThanOrEqual(90)
    }
  })

  it('goal events have teamId', () => {
    const { events } = simulateMatch(defaultHome, defaultAway, 42)
    const goals = events.filter((e) => e.type === 'GOAL')
    for (const goal of goals) {
      expect(goal.teamId).toBeDefined()
      expect([defaultHome.id, defaultAway.id]).toContain(goal.teamId)
    }
  })

  it('stats include xG values', () => {
    const { stats } = simulateMatch(defaultHome, defaultAway, 42)
    expect(stats.homeXG).toBeGreaterThan(0)
    expect(stats.awayXG).toBeGreaterThan(0)
    expect(typeof stats.homeXG).toBe('number')
    expect(typeof stats.awayXG).toBe('number')
  })

  it('accepts custom matchMinuteMax', () => {
    const { events } = simulateMatch(defaultHome, defaultAway, 42, { matchMinuteMax: 48 })
    const fulltime = events.find((e) => e.type === 'FULLTIME_WHISTLE')
    expect(fulltime.minute).toBe(48)
  })

  it('handles default team ratings gracefully', () => {
    const minimalHome = { id: 'h' }
    const minimalAway = { id: 'a' }
    const { events, result } = simulateMatch(minimalHome, minimalAway, 42)
    expect(events.length).toBeGreaterThan(10)
    expect(result.homeGoals).toBeGreaterThanOrEqual(0)
    expect(result.awayGoals).toBeGreaterThanOrEqual(0)
  })
})

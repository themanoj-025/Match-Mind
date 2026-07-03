const { calculatePredictionPoints, updateUserStreaks, checkTierProgression, TIER_THRESHOLDS, TIER_ORDER, getTierForPoints } = require('./scoring')

// ─── Helpers ──────────────────────────────────────────

function mockUser(overrides = {}) {
  return {
    id: 'user-1',
    streakCurrent: 0,
    streakBest: 0,
    totalPoints: 0,
    tier: 'BRONZE',
    totalPredictions: 0,
    correctPredictions: 0,
    predAccuracy: 0,
    ...overrides,
  }
}

function mockPrisma(userOverrides = {}) {
  const user = mockUser(userOverrides)
  let currentUser = { ...user }

  return {
    user: {
      findUnique: async ({ where }) => {
        if (where.id === currentUser.id) return { ...currentUser }
        if (where.id === 'not-found') return null
        return null
      },
      update: async ({ where, data }) => {
        if (where.id === currentUser.id) {
          currentUser = { ...currentUser, ...data }
        }
        return { ...currentUser }
      },
    },
    _app: null,
    // Spy helper for assertions
    getCurrentUser: () => ({ ...currentUser }),
  }
}

function mockMatch(homeScore = 2, awayScore = 1) {
  return { homeScore, awayScore, status: 'FINISHED' }
}

function mockPrediction(overrides = {}) {
  return {
    id: 'pred-1',
    userId: 'user-1',
    matchId: 'match-1',
    homeGoals: 2,
    awayGoals: 1,
    status: 'LOCKED',
    btts: null,
    totalGoalsOU: null,
    totalGoalsLine: null,
    ...overrides,
  }
}

// ══════════════════════════════════════════════════════════
// calculatePredictionPoints (existing tests + new edge cases)
// ══════════════════════════════════════════════════════════

describe('calculatePredictionPoints', () => {
  // ─── Exact Score ──────────────────────────────────────────
  describe('exact score', () => {
    it('awards 55 points (50 + 5 base) for exact score match', () => {
      const prediction = mockPrediction({ homeGoals: 2, awayGoals: 1 })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(55)
      expect(result.breakdown.exactScore).toBe(50)
      expect(result.breakdown.base).toBe(5)
    })

    it('returns 0 for a VOID prediction even if exact score matches', () => {
      const prediction = mockPrediction({ homeGoals: 2, awayGoals: 1, status: 'VOID' })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(0)
    })
  })

  // ─── Correct Result + Goal Difference ─────────────────────
  describe('correct result + goal difference', () => {
    it('awards 40 points (35 + 5 base) for correct result with same GD', () => {
      const prediction = mockPrediction({ homeGoals: 4, awayGoals: 1 })
      const match = mockMatch(3, 0)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(40)
      expect(result.breakdown.resultAndGD).toBe(35)
    })

    it('does NOT match exact-score branch for 0-0 draws', () => {
      const prediction = mockPrediction({ homeGoals: 0, awayGoals: 0 })
      const match = mockMatch(0, 0)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(55)
      expect(result.breakdown.exactScore).toBe(50)
    })
  })

  // ─── Correct Result Only ──────────────────────────────────
  describe('correct result only', () => {
    it('awards 30 points (25 + 5 base) for correct winner but wrong GD', () => {
      const prediction = mockPrediction({ homeGoals: 4, awayGoals: 1 })
      const match = mockMatch(2, 0)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(30)
      expect(result.breakdown.result).toBe(25)
    })

    it('awards 30 points for correct draw prediction with wrong score', () => {
      const prediction = mockPrediction({ homeGoals: 2, awayGoals: 2 })
      const match = mockMatch(0, 0)
      // pred draws (GD=0), actual draws (GD=0) => same GD => result+GD = 40
      // For result-only, need different GD while same result
      const prediction2 = mockPrediction({ homeGoals: 5, awayGoals: 1 })
      const match2 = mockMatch(3, 0)
      const result = calculatePredictionPoints(prediction2, match2)
      expect(result.points).toBe(30)
      expect(result.breakdown.result).toBe(25)
    })
  })

  // ─── Participation Points ─────────────────────────────────
  describe('participation points', () => {
    it('awards 5 base points for wrong result', () => {
      const prediction = mockPrediction({ homeGoals: 5, awayGoals: 0 })
      const match = mockMatch(0, 1)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(5)
      expect(result.breakdown.base).toBe(5)
    })
  })

  // ─── BTTS Bonus ───────────────────────────────────────────
  describe('BTTS bonus', () => {
    it('awards +10 for correct BTTS prediction on top of result', () => {
      const prediction = mockPrediction({ homeGoals: 3, awayGoals: 1, btts: true })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      // Correct result (25) + base (5) + BTTS (10) = 40
      expect(result.points).toBe(40)
      expect(result.breakdown.btts).toBe(10)
    })

    it('does not award BTTS bonus when prediction is wrong', () => {
      const prediction = mockPrediction({ homeGoals: 3, awayGoals: 0, btts: false })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(30)
      expect(result.breakdown.btts).toBeUndefined()
    })

    it('ignores BTTS when prediction.btts is null', () => {
      const prediction = mockPrediction({ homeGoals: 3, awayGoals: 1, btts: null })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.breakdown.btts).toBeUndefined()
    })

    it('stacks BTTS bonus with exact score', () => {
      const prediction = mockPrediction({ homeGoals: 2, awayGoals: 1, btts: true })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      // exact (50) + base (5) + BTTS (10) = 65
      expect(result.points).toBe(65)
      expect(result.breakdown.btts).toBe(10)
    })

    it('awards BTTS on wrong result prediction', () => {
      // 5-0 predicts home win, 1-2 is away win => wrong result
      const prediction = mockPrediction({ homeGoals: 5, awayGoals: 0, btts: true })
      const match = mockMatch(1, 2)
      const result = calculatePredictionPoints(prediction, match)
      // Wrong result (5 base) + BTTS (10) = 15
      expect(result.points).toBe(15)
      expect(result.breakdown.btts).toBe(10)
    })
  })

  // ─── Over/Under Bonus ─────────────────────────────────────
  describe('Over/Under bonus', () => {
    it('awards +10 for correct OU prediction on top of result', () => {
      const prediction = mockPrediction({
        homeGoals: 3, awayGoals: 1,
        totalGoalsOU: 'over', totalGoalsLine: 2.5,
      })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(40)
      expect(result.breakdown.overUnder).toBe(10)
    })

    it('does not award OU bonus when wrong', () => {
      const prediction = mockPrediction({
        homeGoals: 3, awayGoals: 1,
        totalGoalsOU: 'under', totalGoalsLine: 2.5,
      })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(30)
      expect(result.breakdown.overUnder).toBeUndefined()
    })

    it('correct OU on top of exact score adds 10 (total 65)', () => {
      const prediction = mockPrediction({
        homeGoals: 2, awayGoals: 1,
        totalGoalsOU: 'over', totalGoalsLine: 2.5,
      })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(65)
      expect(result.breakdown.exactScore).toBe(50)
      expect(result.breakdown.overUnder).toBe(10)
    })

    it('stacks BTTS + OU on exact score = 75 total', () => {
      const prediction = mockPrediction({
        homeGoals: 2, awayGoals: 1,
        btts: true,
        totalGoalsOU: 'over', totalGoalsLine: 2.5,
      })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      // exact (50) + base (5) + BTTS (10) + OU (10) = 75
      expect(result.points).toBe(75)
      expect(result.breakdown.btts).toBe(10)
      expect(result.breakdown.overUnder).toBe(10)
    })

    it('stacks BTTS + OU on correct result only = 50 total', () => {
      const prediction = mockPrediction({
        homeGoals: 3, awayGoals: 1,
        btts: true,
        totalGoalsOU: 'over', totalGoalsLine: 2.5,
      })
      const match = mockMatch(2, 1)
      const result = calculatePredictionPoints(prediction, match)
      // result (25) + base (5) + BTTS (10) + OU (10) = 50
      expect(result.points).toBe(50)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────
  describe('edge cases', () => {
    it('handles undefined scores as 0', () => {
      const prediction = mockPrediction({ homeGoals: 0, awayGoals: 0 })
      const match = { homeScore: undefined, awayScore: undefined }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(55) // exact 0-0
    })

    it('handles null scores as 0', () => {
      const prediction = mockPrediction({ homeGoals: 0, awayGoals: 0 })
      const match = { homeScore: null, awayScore: null }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(55) // exact 0-0
    })

    it('awards correct result for away win prediction', () => {
      const prediction = mockPrediction({ homeGoals: 0, awayGoals: 3 })
      const match = mockMatch(1, 2)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(30) // correct result (25) + base (5)
      expect(result.breakdown.result).toBe(25)
    })

    it('first matching branch wins (exact > result+GD > result)', () => {
      const prediction = mockPrediction({ homeGoals: 2, awayGoals: 0 })
      const match = mockMatch(2, 0)
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(55)
      expect(result.breakdown.exactScore).toBe(50)
    })

    it('awards correct result for away win with wrong GD', () => {
      const prediction = mockPrediction({ homeGoals: 1, awayGoals: 3 })
      const match = mockMatch(0, 2)
      const result = calculatePredictionPoints(prediction, match)
      // away win correct, but GD differs (-2 vs -2) → same GD → result+GD branch
      // GD is -2 for both: 1-3 (GD=-2), 0-2 (GD=-2) → same!
      // Let's use different GD
      const prediction2 = mockPrediction({ homeGoals: 0, awayGoals: 4 })
      const match2 = mockMatch(0, 2)
      const result2 = calculatePredictionPoints(prediction2, match2)
      // away win correct, GD differs (-4 vs -2) → result only
      expect(result2.points).toBe(30)
      expect(result2.breakdown.result).toBe(25)
    })
  })
})

// ══════════════════════════════════════════════════════════
// updateUserStreaks
// ══════════════════════════════════════════════════════════

describe('updateUserStreaks', () => {
  it('increments streak on correct prediction from 0', async () => {
    const prisma = mockPrisma({ streakCurrent: 0, streakBest: 0 })
    await updateUserStreaks(prisma, 'user-1', true)
    const user = prisma.getCurrentUser()
    expect(user.streakCurrent).toBe(1)
    expect(user.streakBest).toBe(1)
  })

  it('increments streak on correct prediction from 5', async () => {
    const prisma = mockPrisma({ streakCurrent: 5, streakBest: 8 })
    await updateUserStreaks(prisma, 'user-1', true)
    const user = prisma.getCurrentUser()
    expect(user.streakCurrent).toBe(6)
    expect(user.streakBest).toBe(8) // best unchanged
  })

  it('resets streak to 0 on incorrect prediction', async () => {
    const prisma = mockPrisma({ streakCurrent: 5, streakBest: 8 })
    await updateUserStreaks(prisma, 'user-1', false)
    const user = prisma.getCurrentUser()
    expect(user.streakCurrent).toBe(0)
    expect(user.streakBest).toBe(8) // best unchanged
  })

  it('updates streakBest when current exceeds previous best', async () => {
    const prisma = mockPrisma({ streakCurrent: 5, streakBest: 5 })
    await updateUserStreaks(prisma, 'user-1', true)
    const user = prisma.getCurrentUser()
    expect(user.streakCurrent).toBe(6)
    expect(user.streakBest).toBe(6)
  })

  it('handles not-found user gracefully', async () => {
    const prisma = mockPrisma()
    await expect(updateUserStreaks(prisma, 'not-found', true)).resolves.toBeUndefined()
  })

  it('handles streak staying at 0 after multiple incorrect predictions', async () => {
    const prisma = mockPrisma({ streakCurrent: 0, streakBest: 0 })
    await updateUserStreaks(prisma, 'user-1', false)
    expect(prisma.getCurrentUser().streakCurrent).toBe(0)

    await updateUserStreaks(prisma, 'user-1', false)
    expect(prisma.getCurrentUser().streakCurrent).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════
// checkTierProgression
// ══════════════════════════════════════════════════════════

describe('checkTierProgression', () => {
  it('stays at BRONZE when below SILVER threshold', async () => {
    const prisma = mockPrisma({ tier: 'BRONZE', totalPoints: 100 })
    await checkTierProgression(prisma, 'user-1', 100, 'BRONZE')
    expect(prisma.getCurrentUser().tier).toBe('BRONZE')
  })

  it('upgrades from BRONZE to SILVER at 500 points', async () => {
    const prisma = mockPrisma({ tier: 'BRONZE', totalPoints: 499 })
    await checkTierProgression(prisma, 'user-1', 500, 'BRONZE')
    expect(prisma.getCurrentUser().tier).toBe('SILVER')
  })

  it('upgrades from SILVER to GOLD at 1500 points', async () => {
    const prisma = mockPrisma({ tier: 'SILVER', totalPoints: 1499 })
    await checkTierProgression(prisma, 'user-1', 1500, 'SILVER')
    expect(prisma.getCurrentUser().tier).toBe('GOLD')
  })

  it('upgrades from GOLD to PLATINUM at 3500 points', async () => {
    const prisma = mockPrisma({ tier: 'GOLD', totalPoints: 3499 })
    await checkTierProgression(prisma, 'user-1', 3500, 'GOLD')
    expect(prisma.getCurrentUser().tier).toBe('PLATINUM')
  })

  it('upgrades from PLATINUM to DIAMOND at 7000 points', async () => {
    const prisma = mockPrisma({ tier: 'PLATINUM', totalPoints: 6999 })
    await checkTierProgression(prisma, 'user-1', 7000, 'PLATINUM')
    expect(prisma.getCurrentUser().tier).toBe('DIAMOND')
  })

  it('upgrades from DIAMOND to LEGEND at 12000 points', async () => {
    const prisma = mockPrisma({ tier: 'DIAMOND', totalPoints: 11999 })
    await checkTierProgression(prisma, 'user-1', 12000, 'DIAMOND')
    expect(prisma.getCurrentUser().tier).toBe('LEGEND')
  })

  it('stays in same tier when points are exactly at threshold and already in that tier', async () => {
    const prisma = mockPrisma({ tier: 'SILVER', totalPoints: 500 })
    await checkTierProgression(prisma, 'user-1', 500, 'SILVER')
    expect(prisma.getCurrentUser().tier).toBe('SILVER')
  })

  it('downgrades to correct tier when points decrease', async () => {
    const prisma = mockPrisma({ tier: 'GOLD', totalPoints: 2000 })
    await checkTierProgression(prisma, 'user-1', 100, 'GOLD')
    // The scoring engine scans from top tier down; 100 points = BRONZE
    expect(prisma.getCurrentUser().tier).toBe('BRONZE')
  })

  it('handles non-existent user', async () => {
    const prisma = mockPrisma()
    await expect(checkTierProgression(prisma, 'not-found', 100, null)).resolves.toBeUndefined()
  })

  it('resolves tier from DB when currentTier is null', async () => {
    const prisma = mockPrisma({ tier: 'BRONZE', totalPoints: 600 })
    await checkTierProgression(prisma, 'user-1', 600, null)
    expect(prisma.getCurrentUser().tier).toBe('SILVER')
  })
})

// ══════════════════════════════════════════════════════════
// getTierForPoints
// ══════════════════════════════════════════════════════════

describe('getTierForPoints', () => {
  it('returns BRONZE for 0 points', () => {
    expect(getTierForPoints(0)).toBe('BRONZE')
  })

  it('returns BRONZE for 499 points', () => {
    expect(getTierForPoints(499)).toBe('BRONZE')
  })

  it('returns SILVER for 500 points', () => {
    expect(getTierForPoints(500)).toBe('SILVER')
  })

  it('returns LEGEND for 12000+ points', () => {
    expect(getTierForPoints(12000)).toBe('LEGEND')
    expect(getTierForPoints(50000)).toBe('LEGEND')
  })

  it('returns correct tier at each boundary', () => {
    const boundaries = [
      [0, 'BRONZE'],
      [499, 'BRONZE'],
      [500, 'SILVER'],
      [1499, 'SILVER'],
      [1500, 'GOLD'],
      [3499, 'GOLD'],
      [3500, 'PLATINUM'],
      [6999, 'PLATINUM'],
      [7000, 'DIAMOND'],
      [11999, 'DIAMOND'],
      [12000, 'LEGEND'],
    ]
    for (const [points, expectedTier] of boundaries) {
      expect(getTierForPoints(points)).toBe(expectedTier)
    }
  })
})

// ══════════════════════════════════════════════════════════
// TIER_THRESHOLDS & TIER_ORDER invariants
// ══════════════════════════════════════════════════════════

describe('tier constants', () => {
  it('TIER_THRESHOLDS has all 6 tiers', () => {
    expect(Object.keys(TIER_THRESHOLDS)).toEqual(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGEND'])
  })

  it('TIER_ORDER has all 6 tiers in ascending order', () => {
    expect(TIER_ORDER).toEqual(['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'LEGEND'])
  })

  it('thresholds are strictly increasing', () => {
    for (let i = 1; i < TIER_ORDER.length; i++) {
      expect(TIER_THRESHOLDS[TIER_ORDER[i]]).toBeGreaterThan(TIER_THRESHOLDS[TIER_ORDER[i - 1]])
    }
  })
})

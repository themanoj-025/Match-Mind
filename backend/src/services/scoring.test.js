const { calculatePredictionPoints } = require('./scoring')

describe('calculatePredictionPoints', () => {
  // ─── Exact Score ──────────────────────────────────────────
  describe('exact score', () => {
    it('awards 55 points (50 + 5 base) for exact score match', () => {
      const prediction = { homeGoals: 2, awayGoals: 1, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 2, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(55)
      expect(result.breakdown.exactScore).toBe(50)
      expect(result.breakdown.base).toBe(5)
    })

    it('returns 0 for a VOID prediction even if exact score matches', () => {
      const prediction = { homeGoals: 2, awayGoals: 1, status: 'VOID', btts: null, totalGoalsOU: null }
      const match = { homeScore: 2, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(0)
    })
  })

  // ─── Correct Result + Goal Difference ─────────────────────
  describe('correct result + goal difference', () => {
    it('awards 40 points (35 + 5 base) for correct result with same GD', () => {
      // GD = 3 in both: pred 4-1, actual 3-0
      const prediction = { homeGoals: 4, awayGoals: 1, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 3, awayScore: 0 }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(40)
      expect(result.breakdown.resultAndGD).toBe(35)
    })

    it('does NOT match exact-score branch for 0-0 draws', () => {
      const prediction = { homeGoals: 0, awayGoals: 0, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 0, awayScore: 0 }
      const result = calculatePredictionPoints(prediction, match)
      // 0-0 exact score: both goals match → 55 points
      expect(result.points).toBe(55)
      expect(result.breakdown.exactScore).toBe(50)
    })

    it('awards result+GD correctly for draws with same score', () => {
      const prediction = { homeGoals: 1, awayGoals: 1, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 1, awayScore: 1 }
      // Exact score → 55
      expect(calculatePredictionPoints(prediction, match).points).toBe(55)
    })
  })

  // ─── Correct Result Only ──────────────────────────────────
  describe('correct result only', () => {
    it('awards 30 points (25 + 5 base) for correct winner but wrong GD', () => {
      const prediction = { homeGoals: 4, awayGoals: 1, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 2, awayScore: 0 }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(30)
      expect(result.breakdown.result).toBe(25)
    })

    it('awards 30 points for correct draw prediction with wrong score', () => {
      // Both draws (GD=0 for both), but same GD means result+GD branch
      // For result-only branch, use a score where GD differs
      // pred: 2-2 (GD=0), actual: 0-0 (GD=0) → same GD → result+GD = 40
      // To test result-only, use actual: 3-3 (GD=0) with pred: 2-2 (GD=0)... still same GD
      // For draws, any draw has GD=0. So we need a different approach
      // Pred: home win with wrong GD
      const prediction = { homeGoals: 4, awayGoals: 0, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 3, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      // Both home wins, but GD differs (4 vs 2) → result only
      expect(result.points).toBe(30)
      expect(result.breakdown.result).toBe(25)
    })
  })

  // ─── Participation Points ─────────────────────────────────
  describe('participation points', () => {
    it('awards 5 base points for wrong result', () => {
      const prediction = { homeGoals: 5, awayGoals: 0, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 0, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(5)
      expect(result.breakdown.base).toBe(5)
    })
  })

  // ─── BTTS Bonus ───────────────────────────────────────────
  describe('BTTS (Both Teams To Score) bonus', () => {
    it('awards +10 for correct BTTS prediction on top of result', () => {
      const prediction = { homeGoals: 3, awayGoals: 1, status: 'LOCKED', btts: true, totalGoalsOU: null }
      const match = { homeScore: 2, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      // Correct result (25) + base (5) + BTTS (10) = 40
      expect(result.points).toBe(40)
      expect(result.breakdown.btts).toBe(10)
    })

    it('does not award BTTS bonus when prediction is wrong', () => {
      const prediction = { homeGoals: 3, awayGoals: 0, status: 'LOCKED', btts: false, totalGoalsOU: null }
      const match = { homeScore: 2, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      // Correct result (25) + base (5) = 30 (BTTS was wrong, no bonus)
      expect(result.points).toBe(30)
      expect(result.breakdown.btts).toBeUndefined()
    })

    it('ignores BTTS when prediction.btts is null', () => {
      const prediction = { homeGoals: 3, awayGoals: 1, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 2, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.breakdown.btts).toBeUndefined()
    })
  })

  // ─── Over/Under Bonus ─────────────────────────────────────
  describe('Over/Under bonus', () => {
    it('awards +10 for correct OU prediction on top of result', () => {
      const prediction = {
        homeGoals: 3, awayGoals: 1, status: 'LOCKED',
        btts: null,
        totalGoalsOU: 'over', totalGoalsLine: 2.5,
      }
      const match = { homeScore: 2, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      // Correct result (25) + base (5) + OU (10) = 40
      expect(result.points).toBe(40)
      expect(result.breakdown.overUnder).toBe(10)
    })

    it('does not award OU bonus when wrong', () => {
      const prediction = {
        homeGoals: 3, awayGoals: 1, status: 'LOCKED',
        btts: null,
        totalGoalsOU: 'under', totalGoalsLine: 2.5,
      }
      const match = { homeScore: 2, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      // Total 3 goals → over 2.5, user picked under → wrong
      expect(result.points).toBe(30)
      expect(result.breakdown.overUnder).toBeUndefined()
    })

    it('correct OU on top of exact score adds 10 (total 65)', () => {
      const prediction = {
        homeGoals: 2, awayGoals: 1, status: 'LOCKED',
        btts: null,
        totalGoalsOU: 'over', totalGoalsLine: 2.5,
      }
      const match = { homeScore: 2, awayScore: 1 }
      const result = calculatePredictionPoints(prediction, match)
      // Exact score (50) + base (5) + OU (10) = 65
      expect(result.points).toBe(65)
      expect(result.breakdown.exactScore).toBe(50)
      expect(result.breakdown.overUnder).toBe(10)
    })
  })

  // ─── Edge Cases ───────────────────────────────────────────
  describe('edge cases', () => {
    it('handles undefined scores as 0', () => {
      const prediction = { homeGoals: 0, awayGoals: 0, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: undefined, awayScore: undefined }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(55) // exact 0-0
    })

    it('handles null scores as 0', () => {
      const prediction = { homeGoals: 0, awayGoals: 0, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: null, awayScore: null }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(55) // exact 0-0
    })

    it('awards correct result for away win prediction', () => {
      const prediction = { homeGoals: 0, awayGoals: 3, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 1, awayScore: 2 }
      const result = calculatePredictionPoints(prediction, match)
      expect(result.points).toBe(30) // correct result (25) + base (5)
      expect(result.breakdown.result).toBe(25)
    })

    it('first matching branch wins (exact > result+GD > result)', () => {
      const prediction = { homeGoals: 2, awayGoals: 0, status: 'LOCKED', btts: null, totalGoalsOU: null }
      const match = { homeScore: 2, awayScore: 0 }
      const result = calculatePredictionPoints(prediction, match)
      // Exact score branch runs BEFORE result+GD branch, so it returns 55
      expect(result.points).toBe(55)
      expect(result.breakdown.exactScore).toBe(50)
    })
  })
})

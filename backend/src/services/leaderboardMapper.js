/**
 * Leaderboard Mapper — MatchMind
 *
 * Centralizes the user-to-leaderboard-entry transformation that was
 * duplicated 5x across routes/leaderboard.js. Single point of change
 * for any display field additions or renames.
 */

/**
 * Map a raw Prisma user row into a leaderboard entry shape.
 * @param {object} user - Prisma user object with fields: id, username, displayName, avatar,
 *   totalPoints (or weeklyPoints depending on board), predAccuracy, streakCurrent, tier, etc.
 * @param {number} rank - 1-based rank position
 * @param {object} [opts]
 * @param {string} [opts.pointField='totalPoints'] - Which point field to expose as `points`
 * @returns {object} Leaderboard entry
 */
function toLeaderboardEntry(user, rank, opts = {}) {
  const pointField = opts.pointField || 'totalPoints'
  return {
    id: user.id,
    username: user.username,
    name: user.displayName || user.username,
    avatar: user.avatar,
    points: user[pointField] ?? 0,
    accuracy: user.predAccuracy ?? 0,
    streak: user.streakCurrent ?? 0,
    tier: user.tier,
    rank,
    ...(user.countryCode ? { countryCode: user.countryCode } : {}),
    ...(user.totalPoints !== undefined && pointField !== 'totalPoints'
      ? { totalPoints: user.totalPoints }
      : {}),
  }
}

module.exports = { toLeaderboardEntry }

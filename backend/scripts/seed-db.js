/**
 * Seed database via docker exec psql
 *
 * Uses docker exec to run SQL inside the PostgreSQL container,
 * avoiding both Prisma 7 runtime bugs and pg client network auth issues.
 */

const { execSync } = require('child_process')

const PSQL = `docker exec -i matchmind-db psql -U matchmind -d matchmind`

function run(sql) {
  // Escape single quotes and send via stdin
  const cmd = `${PSQL} -c "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 10000 })
  } catch (err) {
    if (!err.stderr?.toString().includes('already exists')) {
      throw err
    }
  }
}

async function main() {
  console.log('[Seed] Connecting via docker exec...')
  execSync(`${PSQL} -c "SELECT 1"`, { stdio: 'pipe' })
  console.log('[Seed] Connected ✓\n')

  // Clean existing data
  const tables = ['Notification', 'Prediction', 'Match', 'LeagueMember', 'League', 'SquadMember', 'Squad', 'Follow', 'User']
  for (const t of tables) run(`DELETE FROM "${t}"`)
  console.log('[Seed] Cleaned existing data\n')

  // Users
  const now = new Date()
  const users = ['sportsking', 'goalpredictor', 'hoopsmaster', 'gridironguru', 'acepredictor', 'footyfanatic', 'gamedaypro', 'predictmaster', 'fanatico', 'sportymind', 'demouser']

  const userSQL = users.map((u, i) => {
    const id = `user-${u}`
    const points = [8420, 7910, 7650, 7320, 7040, 6780, 6540, 6320, 6100, 5890, 1250][i]
    const accuracy = [78.5, 74.2, 71.8, 69.3, 72.1, 65.4, 68.2, 70.0, 63.8, 67.5, 55.0][i]
    const streak = [12, 9, 7, 5, 8, 4, 6, 3, 2, 5, 1][i]
    const best = [15, 11, 10, 8, 14, 7, 9, 6, 5, 8, 3][i]
    const tiers = ['DIAMOND', 'DIAMOND', 'PLATINUM', 'PLATINUM', 'PLATINUM', 'GOLD', 'GOLD', 'GOLD', 'GOLD', 'GOLD', 'SILVER']
    const rank = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 234]
    const cc = ['US', 'GB', 'CA', 'US', 'AU', 'ES', 'US', 'DE', 'IT', 'FR', 'US']
    const email = u === 'demouser' ? 'demo@matchmind.gg' : `${u}@example.com`
    const displayName = u === 'demouser' ? 'Demo User' : u.charAt(0).toUpperCase() + u.slice(1).replace(/([a-z])([A-Z])/g, '$1 $2')
    return `('${id}', '${u}', '${email}', '${displayName}', ${points}, ${accuracy}, ${streak}, ${best}, '${tiers[i]}', ${rank[i]}, '${cc[i]}', '$2b$12$TiQ.WfUEEemTclePf3KPTuCDRFbOHHwuPAvKk.cw9qzrzg1epV72i')`
  }).join(',\n')

  run(`INSERT INTO "User" (id, username, email, display_name, total_points, pred_accuracy, streak_current, streak_best, tier, global_rank, country_code, password_hash) VALUES ${userSQL}`)
  console.log(`[Seed] Created ${users.length} users\n`)

  const uid = (u) => `'user-${u}'`

  // Follows
  const follows = [['demouser', 'sportsking'], ['demouser', 'goalpredictor'], ['demouser', 'hoopsmaster'], ['sportsking', 'goalpredictor'], ['goalpredictor', 'sportsking'], ['footyfanatic', 'sportsking'], ['predictmaster', 'gamedaypro']]
  for (const [f, g] of follows) run(`INSERT INTO "Follow" (follower_id, following_id) VALUES (${uid(f)}, ${uid(g)})`)
  console.log(`[Seed] Created ${follows.length} follows\n`)

  // Matches
  const matches = [
    `('live-1', 'FOOTBALL', 'comp-pl', 'team-mci', 'team-ars', 'Manchester City', 'Arsenal', 'Premier League', 'Etihad Stadium', 2, 1, 'LIVE', 67, '${new Date(now.getTime() - 5400000).toISOString()}', '2025/26')`,
    `('live-2', 'FOOTBALL', 'comp-ll', 'team-rma', 'team-fcb', 'Real Madrid', 'Barcelona', 'La Liga', 'Santiago Bernabéu', 1, 1, 'LIVE', 34, '${new Date(now.getTime() - 2040000).toISOString()}', '2025/26')`,
    `('live-3', 'BASKETBALL', 'comp-nba', 'team-lal', 'team-bos', 'LA Lakers', 'Boston Celtics', 'NBA', 'Crypto.com Arena', 89, 92, 'LIVE', 8, '${new Date(now.getTime() - 1800000).toISOString()}', '2025/26')`,
    `('live-4', 'TENNIS', 'comp-wim', 'player-djokovic', 'player-alcaraz', 'N. Djokovic', 'C. Alcaraz', 'Wimbledon', 'Centre Court', 2, 1, 'LIVE', 3, '${new Date(now.getTime() - 1800000).toISOString()}', '2025')`,
    `('upcoming-1', 'FOOTBALL', 'comp-ucl', 'team-liv', 'team-mun', 'Liverpool', 'Bayern Munich', 'Champions League', 'Anfield', NULL, NULL, 'SCHEDULED', 0, '${new Date(now.getTime() + 7200000).toISOString()}', '2025/26')`,
    `('upcoming-2', 'FOOTBALL', 'comp-pl', 'team-che', 'team-tot', 'Chelsea', 'Tottenham', 'Premier League', 'Stamford Bridge', NULL, NULL, 'SCHEDULED', 0, '${new Date(now.getTime() + 10800000).toISOString()}', '2025/26')`,
    `('upcoming-3', 'BASKETBALL', 'comp-nba', 'team-gsw', 'team-mil', 'Golden State Warriors', 'Milwaukee Bucks', 'NBA', 'Chase Center', NULL, NULL, 'SCHEDULED', 0, '${new Date(now.getTime() + 14400000).toISOString()}', '2025/26')`,
    `('upcoming-4', 'AMERICAN_FOOTBALL', 'comp-nfl', 'team-kcc', 'team-sf49', 'Kansas City Chiefs', 'San Francisco 49ers', 'NFL', 'Arrowhead Stadium', NULL, NULL, 'SCHEDULED', 0, '${new Date(now.getTime() + 18000000).toISOString()}', '2025')`,
    `('upcoming-5', 'CRICKET', 'comp-ipl', 'team-csk', 'team-mi', 'Chennai Super Kings', 'Mumbai Indians', 'IPL', 'M. A. Chidambaram Stadium', NULL, NULL, 'SCHEDULED', 0, '${new Date(now.getTime() + 21600000).toISOString()}', '2025')`,
    `('finished-1', 'FOOTBALL', 'comp-pl', 'team-mun', 'team-ars', 'Manchester United', 'Arsenal', 'Premier League', 'Old Trafford', 1, 3, 'FINISHED', 90, '${new Date(now.getTime() - 84600000).toISOString()}', '2025/26')`,
    `('finished-2', 'BASKETBALL', 'comp-nba', 'team-lal', 'team-gsw', 'LA Lakers', 'Golden State Warriors', 'NBA', 'Crypto.com Arena', 112, 108, 'FINISHED', 48, '${new Date(now.getTime() - 84600000).toISOString()}', '2025/26')`,
    `('finished-3', 'AMERICAN_FOOTBALL', 'comp-nfl', 'team-kcc', 'team-buf', 'Kansas City Chiefs', 'Buffalo Bills', 'NFL', 'Arrowhead Stadium', 27, 24, 'FINISHED', 60, '${new Date(now.getTime() - 171000000).toISOString()}', '2025')`,
  ]
  run(`INSERT INTO "Match" (id, sport, competition_id, home_team_id, away_team_id, home_team_name, away_team_name, competition, stadium, home_score, away_score, status, minute, scheduled_at, season) VALUES ${matches.join(',\n')}`)
  console.log(`[Seed] Created ${matches.length} matches\n`)

  // Predictions
  const preds = [
    `(${uid('demouser')}, 'live-1', 2, 1, 'PENDING', NULL)`,
    `(${uid('demouser')}, 'live-2', 2, 1, 'PENDING', NULL)`,
    `(${uid('demouser')}, 'upcoming-1', 2, 1, 'PENDING', NULL)`,
    `(${uid('demouser')}, 'upcoming-2', 1, 1, 'PENDING', NULL)`,
    `(${uid('demouser')}, 'finished-1', 1, 2, 'SCORED', 15)`,
    `(${uid('demouser')}, 'finished-2', 110, 105, 'SCORED', 0)`,
    `(${uid('sportsking')}, 'live-1', 3, 1, 'PENDING', NULL)`,
    `(${uid('sportsking')}, 'live-2', 2, 1, 'PENDING', NULL)`,
    `(${uid('sportsking')}, 'finished-1', 1, 3, 'SCORED', 50)`,
    `(${uid('sportsking')}, 'finished-2', 115, 102, 'SCORED', 10)`,
    `(${uid('goalpredictor')}, 'live-1', 2, 2, 'PENDING', NULL)`,
    `(${uid('goalpredictor')}, 'live-3', 95, 98, 'PENDING', NULL)`,
    `(${uid('goalpredictor')}, 'finished-1', 0, 2, 'SCORED', 15)`,
    `(${uid('goalpredictor')}, 'finished-3', 24, 20, 'SCORED', 0)`,
  ]
  run(`INSERT INTO "Prediction" (user_id, match_id, home_goals, away_goals, status, points_earned) VALUES ${preds.join(',\n')}`)
  console.log(`[Seed] Created ${preds.length} predictions\n`)

  // Leagues
  run(`INSERT INTO "League" (name, invite_code, is_public, sport, owner_id) VALUES ('Premier League Fans 2025', 'PL2025X', true, 'FOOTBALL', ${uid('sportsking')})`)
  run(`INSERT INTO "League" (name, invite_code, sport, owner_id) VALUES ('The Undefeatables', 'UNDEF1', 'BASKETBALL', ${uid('hoopsmaster')})`)
  run(`INSERT INTO "League" (name, invite_code, is_public, sport, owner_id) VALUES ('NFL Pick''em Crew', 'NFLPICK', true, 'AMERICAN_FOOTBALL', ${uid('gridironguru')})`)
  run(`INSERT INTO "League" (name, invite_code, is_public, sport, owner_id) VALUES ('Champions League Special', 'UCL25X', true, 'FOOTBALL', ${uid('goalpredictor')})`)
  run(`INSERT INTO "League" (name, invite_code, is_public, owner_id) VALUES ('All Sports Showdown', 'ALLSPT', true, ${uid('sportymind')})`)
  console.log(`[Seed] Created leagues\n`)

  // League members - get league IDs
  const leagueIds = {}
  for (const name of ['Premier League Fans 2025', 'The Undefeatables', "NFL Pick'em Crew", 'Champions League Special', 'All Sports Showdown']) {
    const result = execSync(`${PSQL} -t -A -c "SELECT id FROM \\"League\\" WHERE name = '${name.replace(/'/g, "''")}'"`, { stdio: 'pipe', timeout: 5000 })
    leagueIds[name] = result.toString().trim()
  }

  const lm = [
    [leagueIds['Premier League Fans 2025'], 'sportsking', 1250], [leagueIds['Premier League Fans 2025'], 'goalpredictor', 1180],
    [leagueIds['Premier League Fans 2025'], 'demouser', 980], [leagueIds['Premier League Fans 2025'], 'footyfanatic', 920],
    [leagueIds['The Undefeatables'], 'hoopsmaster', 1100], [leagueIds['The Undefeatables'], 'demouser', 850],
    [leagueIds["NFL Pick'em Crew"], 'gridironguru', 950], [leagueIds["NFL Pick'em Crew"], 'gamedaypro', 890],
    [leagueIds["NFL Pick'em Crew"], 'demouser', 720], [leagueIds['Champions League Special'], 'sportsking', 450],
    [leagueIds['Champions League Special'], 'predictmaster', 380], [leagueIds['All Sports Showdown'], 'sportymind', 670],
    [leagueIds['All Sports Showdown'], 'fanatico', 590], [leagueIds['All Sports Showdown'], 'acepredictor', 520],
  ]
  for (const [lid, uname, pts] of lm) run(`INSERT INTO "LeagueMember" (league_id, user_id, points) VALUES ('${lid}', ${uid(uname)}, ${pts})`)
  console.log(`[Seed] Created ${lm.length} league members\n`)

  // Squads
  const squads = [
    { name: 'The Undefeatables', members: ['hoopsmaster', 'demouser', 'sportsking'] },
    { name: 'Weekend Warriors', members: ['gamedaypro', 'gridironguru', 'acepredictor'] },
    { name: 'Fantasy Kings', members: ['sportymind', 'fanatico', 'predictmaster', 'footyfanatic'] },
  ]
  for (const squad of squads) {
    const escapedName = squad.name.replace(/'/g, "''")
    run(`INSERT INTO "Squad" (name) VALUES ('${escapedName}')`)
    const result = execSync(`${PSQL} -t -A -c "SELECT id FROM \\"Squad\\" WHERE name = '${escapedName}' ORDER BY created_at DESC LIMIT 1"`, { stdio: 'pipe', timeout: 5000 })
    const sid = result.toString().trim()
    squad.members.forEach((m, i) => run(`INSERT INTO "SquadMember" (squad_id, user_id, role) VALUES ('${sid}', ${uid(m)}, '${i === 0 ? 'owner' : 'member'}')`))
  }
  console.log(`[Seed] Created ${squads.length} squads\n`)

  // Notifications
  run(`INSERT INTO "Notification" (user_id, type, title, message, is_read) VALUES (${uid('demouser')}, 'leaderboard', 'Rank Update', 'You moved up to #234 on the global leaderboard!', true)`)
  run(`INSERT INTO "Notification" (user_id, type, title, message) VALUES (${uid('demouser')}, 'prediction', 'Prediction Locked', 'Your prediction for Man City vs Arsenal has been locked.')`)
  run(`INSERT INTO "Notification" (user_id, type, title, message) VALUES (${uid('demouser')}, 'social', 'New Follower', 'SportsKing started following you!')`)
  run(`INSERT INTO "Notification" (user_id, type, title, message) VALUES (${uid('demouser')}, 'league', 'League Update', 'You moved to 3rd place in Premier League Fans 2025!')`)
  run(`INSERT INTO "Notification" (user_id, type, title, message) VALUES (${uid('demouser')}, 'match', 'Match Starting Soon', 'Liverpool vs Bayern Munich kicks off in 30 minutes.')`)
  console.log(`[Seed] Created 5 notifications\n`)

  console.log('🎉 Seeding complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Users:         ${users.length}`)
  console.log(`📊 Matches:       ${matches.length}`)
  console.log(`📊 Predictions:   ${preds.length}`)
  console.log(`📊 Leagues:       5`)
  console.log(`📊 Squads:        ${squads.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔑 Demo account: demo@matchmind.gg / password123')
}

main().catch((err) => {
  console.error('[Seed] Failed:', err.message)
  process.exit(1)
})

require('dotenv').config()
const { PrismaClient, Sport, MatchStatus, PredStatus, Tier } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding MatchMind database...\n')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.prediction.deleteMany()
  await prisma.match.deleteMany()
  await prisma.leagueMember.deleteMany()
  await prisma.league.deleteMany()
  await prisma.squadMember.deleteMany()
  await prisma.squad.deleteMany()
  await prisma.follow.deleteMany()
  await prisma.user.deleteMany()

  // ========== USERS ==========
  const passwordHash = await bcrypt.hash('password123', 12)
  
  const usersData = [
    { username: 'sportsking', email: 'sportsking@example.com', displayName: 'SportsKing', passwordHash, totalPoints: 8420, predAccuracy: 78.5, streakCurrent: 12, streakBest: 15, tier: Tier.DIAMOND, globalRank: 1, countryCode: 'US', bio: 'Living and breathing sports since 1990. Premier League specialist.' },
    { username: 'goalpredictor', email: 'goal@example.com', displayName: 'GoalPredictor', passwordHash, totalPoints: 7910, predAccuracy: 74.2, streakCurrent: 9, streakBest: 11, tier: Tier.DIAMOND, globalRank: 2, countryCode: 'GB', bio: 'Football fanatic. If it has goals, I predict it.' },
    { username: 'hoopsmaster', email: 'hoops@example.com', displayName: 'HoopsMaster', passwordHash, totalPoints: 7650, predAccuracy: 71.8, streakCurrent: 7, streakBest: 10, tier: Tier.PLATINUM, globalRank: 3, countryCode: 'CA', bio: 'NBA is life. 15+ years following the league.' },
    { username: 'gridironguru', email: 'gridiron@example.com', displayName: 'GridironGuru', passwordHash, totalPoints: 7320, predAccuracy: 69.3, streakCurrent: 5, streakBest: 8, tier: Tier.PLATINUM, globalRank: 4, countryCode: 'US', bio: 'Sunday is for football. And I mean real football.' },
    { username: 'acepredictor', email: 'ace@example.com', displayName: 'AcePredictor', passwordHash, totalPoints: 7040, predAccuracy: 72.1, streakCurrent: 8, streakBest: 14, tier: Tier.PLATINUM, globalRank: 5, countryCode: 'AU', bio: 'Tennis and cricket run in my blood.' },
    { username: 'footyfanatic', email: 'footy@example.com', displayName: 'FootyFanatic', passwordHash, totalPoints: 6780, predAccuracy: 65.4, streakCurrent: 4, streakBest: 7, tier: Tier.GOLD, globalRank: 6, countryCode: 'ES', bio: 'Visca el Barça! Predicting La Liga matches.' },
    { username: 'gamedaypro', email: 'gameday@example.com', displayName: 'GameDayPro', passwordHash, totalPoints: 6540, predAccuracy: 68.2, streakCurrent: 6, streakBest: 9, tier: Tier.GOLD, globalRank: 7, countryCode: 'US', bio: 'NFL Sundays are sacred. 80% accuracy on TNF picks.' },
    { username: 'predictmaster', email: 'predict@example.com', displayName: 'PredictMaster', passwordHash, totalPoints: 6320, predAccuracy: 70.0, streakCurrent: 3, streakBest: 6, tier: Tier.GOLD, globalRank: 8, countryCode: 'DE', bio: 'Bundesliga expert. German efficiency in predictions.' },
    { username: 'fanatico', email: 'fanatico@example.com', displayName: 'Fanatico', passwordHash, totalPoints: 6100, predAccuracy: 63.8, streakCurrent: 2, streakBest: 5, tier: Tier.GOLD, globalRank: 9, countryCode: 'IT', bio: 'Serie A is the most tactical league. Prove me wrong.' },
    { username: 'sportymind', email: 'sporty@example.com', displayName: 'SportyMind', passwordHash, totalPoints: 5890, predAccuracy: 67.5, streakCurrent: 5, streakBest: 8, tier: Tier.GOLD, globalRank: 10, countryCode: 'FR', bio: 'All sports, all the time. Jack of all trades.' },
    { username: 'demouser', email: 'demo@matchmind.gg', displayName: 'Demo User', passwordHash, totalPoints: 1250, predAccuracy: 55.0, streakCurrent: 1, streakBest: 3, tier: Tier.SILVER, globalRank: 234, countryCode: 'US', bio: 'Demo account for testing MatchMind!' },
  ]

  const users = {}
  for (const data of usersData) {
    users[data.username] = await prisma.user.create({ data })
  }
  console.log(`✅ Created ${Object.keys(users).length} users`)

  // ========== FOLLOWS ==========
  const follows = [
    { follower: 'demouser', following: 'sportsking' },
    { follower: 'demouser', following: 'goalpredictor' },
    { follower: 'demouser', following: 'hoopsmaster' },
    { follower: 'sportsking', following: 'goalpredictor' },
    { follower: 'goalpredictor', following: 'sportsking' },
    { follower: 'footyfanatic', following: 'sportsking' },
    { follower: 'predictmaster', following: 'gamedaypro' },
  ]
  for (const f of follows) {
    await prisma.follow.create({ data: { followerId: users[f.follower].id, followingId: users[f.following].id } })
  }
  console.log(`✅ Created ${follows.length} follows`)

  // ========== MATCHES ==========
  const now = new Date()

  const matchesData = [
    // SIMULATING matches (pre-seeded as FINISHED with events for demo)
    { id: 'live-1', sport: Sport.FOOTBALL, competition: 'Premier League', homeTeamId: 'team-mci', awayTeamId: 'team-ars', homeTeamName: 'Manchester City', awayTeamName: 'Arsenal', homeScore: 2, awayScore: 1, status: MatchStatus.FINISHED, minute: 90, scheduledAt: new Date(now.getTime() - 7200000), kickedOffAt: new Date(now.getTime() - 7200000), finishedAt: new Date(now.getTime() - 3600000), simSeed: 42, simStartedAt: new Date(now.getTime() - 7200000), simEndsAt: new Date(now.getTime() - 3600000), stadium: 'Etihad Stadium', season: '2025/26' },
    { id: 'live-2', sport: Sport.FOOTBALL, competition: 'La Liga', homeTeamId: 'team-rma', awayTeamId: 'team-fcb', homeTeamName: 'Real Madrid', awayTeamName: 'Barcelona', homeScore: 1, awayScore: 1, status: MatchStatus.FINISHED, minute: 90, scheduledAt: new Date(now.getTime() - 3600000), kickedOffAt: new Date(now.getTime() - 3600000), finishedAt: new Date(), simSeed: 99, simStartedAt: new Date(now.getTime() - 3600000), simEndsAt: new Date(), stadium: 'Santiago Bernabéu', season: '2025/26' },
    { id: 'live-3', sport: Sport.BASKETBALL, competition: 'NBA', homeTeamId: 'team-lal', awayTeamId: 'team-bos', homeTeamName: 'LA Lakers', awayTeamName: 'Boston Celtics', homeScore: 105, awayScore: 98, status: MatchStatus.FINISHED, minute: 48, scheduledAt: new Date(now.getTime() - 2700000), kickedOffAt: new Date(now.getTime() - 2700000), finishedAt: new Date(), simSeed: 7, simStartedAt: new Date(now.getTime() - 2700000), simEndsAt: new Date(), stadium: 'Crypto.com Arena', season: '2025/26' },
    { id: 'live-4', sport: Sport.TENNIS, competition: 'Wimbledon', homeTeamId: 'player-djokovic', awayTeamId: 'player-alcaraz', homeTeamName: 'N. Djokovic', awayTeamName: 'C. Alcaraz', homeScore: 2, awayScore: 1, status: MatchStatus.FINISHED, minute: 3, scheduledAt: new Date(now.getTime() - 3600000), kickedOffAt: new Date(now.getTime() - 3600000), finishedAt: new Date(), simSeed: 123, simStartedAt: new Date(now.getTime() - 3600000), simEndsAt: new Date(), stadium: 'Centre Court', season: '2025' },

    // UPCOMING matches
    { id: 'upcoming-1', sport: Sport.FOOTBALL, competition: 'Champions League', homeTeamId: 'team-liv', awayTeamId: 'team-mun', homeTeamName: 'Liverpool', awayTeamName: 'Bayern Munich', homeScore: null, awayScore: null, status: MatchStatus.SCHEDULED, minute: 0, scheduledAt: new Date(now.getTime() + 7200000), stadium: 'Anfield', season: '2025/26' },
    { id: 'upcoming-2', sport: Sport.FOOTBALL, competition: 'Premier League', homeTeamId: 'team-che', awayTeamId: 'team-tot', homeTeamName: 'Chelsea', awayTeamName: 'Tottenham', homeScore: null, awayScore: null, status: MatchStatus.SCHEDULED, minute: 0, scheduledAt: new Date(now.getTime() + 10800000), stadium: 'Stamford Bridge', season: '2025/26' },
    { id: 'upcoming-3', sport: Sport.BASKETBALL, competition: 'NBA', homeTeamId: 'team-gsw', awayTeamId: 'team-mil', homeTeamName: 'Golden State Warriors', awayTeamName: 'Milwaukee Bucks', homeScore: null, awayScore: null, status: MatchStatus.SCHEDULED, minute: 0, scheduledAt: new Date(now.getTime() + 14400000), stadium: 'Chase Center', season: '2025/26' },
    { id: 'upcoming-4', sport: Sport.AMERICAN_FOOTBALL, competition: 'NFL', homeTeamId: 'team-kcc', awayTeamId: 'team-sf49', homeTeamName: 'Kansas City Chiefs', awayTeamName: 'San Francisco 49ers', homeScore: null, awayScore: null, status: MatchStatus.SCHEDULED, minute: 0, scheduledAt: new Date(now.getTime() + 18000000), stadium: 'Arrowhead Stadium', season: '2025' },
    { id: 'upcoming-5', sport: Sport.CRICKET, competition: 'IPL', homeTeamId: 'team-csk', awayTeamId: 'team-mi', homeTeamName: 'Chennai Super Kings', awayTeamName: 'Mumbai Indians', homeScore: null, awayScore: null, status: MatchStatus.SCHEDULED, minute: 0, scheduledAt: new Date(now.getTime() + 21600000), stadium: 'M. A. Chidambaram Stadium', season: '2025' },

    // FINISHED matches
    { id: 'finished-1', sport: Sport.FOOTBALL, competition: 'Premier League', homeTeamId: 'team-mun', awayTeamId: 'team-ars', homeTeamName: 'Manchester United', awayTeamName: 'Arsenal', homeScore: 1, awayScore: 3, status: MatchStatus.FINISHED, minute: 90, scheduledAt: new Date(now.getTime() - 86400000), kickedOffAt: new Date(now.getTime() - 84600000), finishedAt: new Date(now.getTime() - 83700000), stadium: 'Old Trafford', season: '2025/26' },
    { id: 'finished-2', sport: Sport.BASKETBALL, competition: 'NBA', homeTeamId: 'team-lal', awayTeamId: 'team-gsw', homeTeamName: 'LA Lakers', awayTeamName: 'Golden State Warriors', homeScore: 112, awayScore: 108, status: MatchStatus.FINISHED, minute: 48, scheduledAt: new Date(now.getTime() - 86400000), kickedOffAt: new Date(now.getTime() - 84600000), finishedAt: new Date(now.getTime() - 83700000), stadium: 'Crypto.com Arena', season: '2025/26' },
    { id: 'finished-3', sport: Sport.AMERICAN_FOOTBALL, competition: 'NFL', homeTeamId: 'team-kcc', awayTeamId: 'team-buf', homeTeamName: 'Kansas City Chiefs', awayTeamName: 'Buffalo Bills', homeScore: 27, awayScore: 24, status: MatchStatus.FINISHED, minute: 60, scheduledAt: new Date(now.getTime() - 172800000), kickedOffAt: new Date(now.getTime() - 171000000), finishedAt: new Date(now.getTime() - 170100000), stadium: 'Arrowhead Stadium', season: '2025' },
  ]

  for (const match of matchesData) {
    await prisma.match.create({ data: match })
  }
  console.log(`✅ Created ${matchesData.length} matches`)

  // ========== PREDICTIONS ==========
  const predictionsData = [
    // demouser predictions
    { username: 'demouser', matchId: 'live-1', homeGoals: 2, awayGoals: 1, firstScorerId: 'E. Haaland', totalGoalsOU: 'Over 2.5', btts: true, status: PredStatus.PENDING },
    { username: 'demouser', matchId: 'live-2', homeGoals: 2, awayGoals: 1, firstScorerId: 'K. Mbappé', status: PredStatus.PENDING },
    { username: 'demouser', matchId: 'upcoming-1', homeGoals: 2, awayGoals: 1, btts: true, status: PredStatus.PENDING },
    { username: 'demouser', matchId: 'upcoming-2', homeGoals: 1, awayGoals: 1, status: PredStatus.PENDING },
    { username: 'demouser', matchId: 'finished-1', homeGoals: 1, awayGoals: 2, firstScorerId: 'M. Ødegaard', btts: true, status: PredStatus.SCORED, pointsEarned: 15 },
    { username: 'demouser', matchId: 'finished-2', homeGoals: 110, awayGoals: 105, totalGoalsOU: 'Over 210.5', status: PredStatus.SCORED, pointsEarned: 0 },

    // sportsking predictions (top predictor)
    { username: 'sportsking', matchId: 'live-1', homeGoals: 3, awayGoals: 1, firstScorerId: 'E. Haaland', btts: true, status: PredStatus.PENDING },
    { username: 'sportsking', matchId: 'live-2', homeGoals: 2, awayGoals: 1, firstScorerId: 'Vini Jr.', status: PredStatus.PENDING },
    { username: 'sportsking', matchId: 'finished-1', homeGoals: 1, awayGoals: 3, firstScorerId: 'B. Saka', btts: true, status: PredStatus.SCORED, pointsEarned: 50 },
    { username: 'sportsking', matchId: 'finished-2', homeGoals: 115, awayGoals: 102, totalGoalsOU: 'Over 210.5', status: PredStatus.SCORED, pointsEarned: 10 },

    // goalpredictor predictions
    { username: 'goalpredictor', matchId: 'live-1', homeGoals: 2, awayGoals: 2, btts: true, status: PredStatus.PENDING },
    { username: 'goalpredictor', matchId: 'live-3', homeGoals: 95, awayGoals: 98, totalGoalsOU: 'Over 190.5', status: PredStatus.PENDING },
    { username: 'goalpredictor', matchId: 'finished-1', homeGoals: 0, awayGoals: 2, firstScorerId: 'M. Ødegaard', btts: false, status: PredStatus.SCORED, pointsEarned: 15 },
    { username: 'goalpredictor', matchId: 'finished-3', homeGoals: 24, awayGoals: 20, status: PredStatus.SCORED, pointsEarned: 0 },
  ]

  for (const p of predictionsData) {
    await prisma.prediction.create({
      data: {
        userId: users[p.username].id,
        matchId: p.matchId,
        homeGoals: p.homeGoals,
        awayGoals: p.awayGoals,
        firstScorerId: p.firstScorerId || null,
        totalGoalsOU: p.totalGoalsOU || null,
        btts: p.btts ?? null,
        status: p.status,
        pointsEarned: p.pointsEarned ?? null,
        createdAt: new Date(now.getTime() - Math.random() * 86400000),
      },
    })
  }
  console.log(`✅ Created ${predictionsData.length} predictions`)

  // ========== LEAGUES ==========
  const leaguesData = [
    { name: 'Premier League Fans 2025', inviteCode: 'PL2025X', isPublic: true, sport: Sport.FOOTBALL, ownerId: users.sportsking.id },
    { name: 'The Undefeatables', inviteCode: 'UNDEF1', isPublic: false, sport: Sport.BASKETBALL, ownerId: users.hoopsmaster.id },
    { name: 'NFL Pick\'em Crew', inviteCode: 'NFLPICK', isPublic: true, sport: Sport.AMERICAN_FOOTBALL, ownerId: users.gridironguru.id },
    { name: 'Champions League Special', inviteCode: 'UCL25X', isPublic: true, sport: Sport.FOOTBALL, ownerId: users.goalpredictor.id },
    { name: 'All Sports Showdown', inviteCode: 'ALLSPT', isPublic: true, sport: null, ownerId: users.sportymind.id },
  ]

  for (const league of leaguesData) {
    await prisma.league.create({ data: league })
  }
  console.log(`✅ Created ${leaguesData.length} leagues`)

  // ========== LEAGUE MEMBERS ==========
  const leagueMembers = [
    { league: 'Premier League Fans 2025', username: 'sportsking', points: 1250 },
    { league: 'Premier League Fans 2025', username: 'goalpredictor', points: 1180 },
    { league: 'Premier League Fans 2025', username: 'demouser', points: 980 },
    { league: 'Premier League Fans 2025', username: 'footyfanatic', points: 920 },
    { league: 'The Undefeatables', username: 'hoopsmaster', points: 1100 },
    { league: 'The Undefeatables', username: 'demouser', points: 850 },
    { league: 'NFL Pick\'em Crew', username: 'gridironguru', points: 950 },
    { league: 'NFL Pick\'em Crew', username: 'gamedaypro', points: 890 },
    { league: 'NFL Pick\'em Crew', username: 'demouser', points: 720 },
    { league: 'Champions League Special', username: 'sportsking', points: 450 },
    { league: 'Champions League Special', username: 'predictmaster', points: 380 },
    { league: 'All Sports Showdown', username: 'sportymind', points: 670 },
    { league: 'All Sports Showdown', username: 'fanatico', points: 590 },
    { league: 'All Sports Showdown', username: 'acepredictor', points: 520 },
  ]

  for (const lm of leagueMembers) {
    const league = await prisma.league.findFirst({ where: { name: lm.league } })
    await prisma.leagueMember.create({ data: { leagueId: league.id, userId: users[lm.username].id, points: lm.points } })
  }
  console.log(`✅ Added ${leagueMembers.length} league members`)

  // ========== SQUADS ==========
  const squadsData = [
    { name: 'The Undefeatables', members: ['hoopsmaster', 'demouser', 'sportsking'] },
    { name: 'Weekend Warriors', members: ['gamedaypro', 'gridironguru', 'acepredictor'] },
    { name: 'Fantasy Kings', members: ['sportymind', 'fanatico', 'predictmaster', 'footyfanatic'] },
  ]

  for (const squad of squadsData) {
    const created = await prisma.squad.create({ data: { name: squad.name } })
    for (const member of squad.members) {
      await prisma.squadMember.create({ data: { squadId: created.id, userId: users[member].id, role: member === squad.members[0] ? 'owner' : 'member' } })
    }
  }
  console.log(`✅ Created ${squadsData.length} squads`)

  // ========== NOTIFICATIONS ==========
  const notificationsData = [
    { username: 'demouser', type: 'leaderboard', title: 'Rank Update', message: 'You moved up to #234 on the global leaderboard!' },
    { username: 'demouser', type: 'prediction', title: 'Prediction Locked', message: 'Your prediction for Man City vs Arsenal has been locked.' },
    { username: 'demouser', type: 'social', title: 'New Follower', message: 'SportsKing started following you!' },
    { username: 'demouser', type: 'league', title: 'League Update', message: 'You moved to 3rd place in Premier League Fans 2025!' },
    { username: 'demouser', type: 'match', title: 'Match Starting Soon', message: 'Liverpool vs Bayern Munich kicks off in 30 minutes.' },
  ]

  for (const n of notificationsData) {
    await prisma.notification.create({
      data: {
        userId: users[n.username].id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.type === 'leaderboard',
      },
    })
  }
  console.log(`✅ Created ${notificationsData.length} notifications`)

  console.log('\n🎉 Seeding complete!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Users:         ${Object.keys(users).length}`)
  console.log(`📊 Matches:       ${matchesData.length} (${matchesData.filter(m => m.status === 'SIMULATING').length} simulating, ${matchesData.filter(m => m.status === 'SCHEDULED').length} upcoming, ${matchesData.filter(m => m.status === 'FINISHED').length} finished)`)
  console.log(`📊 Predictions:   ${predictionsData.length}`)
  console.log(`📊 Leagues:       ${leaguesData.length}`)
  console.log(`📊 Squads:        ${squadsData.length}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔑 Demo account: demo@matchmind.gg / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

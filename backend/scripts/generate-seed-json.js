/**
 * Generate JSON Seed Data — MatchMind
 *
 * Generates individual JSON files for each model from the seed data.
 * Run this once to populate the data/ directory.
 *
 * Usage: node scripts/generate-seed-json.js
 */

const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'src', 'data')

// Simple CUID-like ID generator
let idCounter = Date.now()
function makeId(prefix) {
  return `${prefix}_${(idCounter++).toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

// ─── DATA ────────────────────────────────────────────────

const now = new Date()
function daysAgo(n) { return new Date(now.getTime() - n * 86400000).toISOString() }
function hoursAgo(n) { return new Date(now.getTime() - n * 3600000).toISOString() }
function hoursFromNow(n) { return new Date(now.getTime() + n * 3600000).toISOString() }

// Users
const users = [
  { username: 'sportsking', email: 'sportsking@example.com', displayName: 'SportsKing', totalPoints: 8420, predAccuracy: 78.5, streakCurrent: 12, streakBest: 15, tier: 'DIAMOND', globalRank: 1, countryCode: 'US', bio: 'Living and breathing sports since 1990. Premier League specialist.' },
  { username: 'goalpredictor', email: 'goal@example.com', displayName: 'GoalPredictor', totalPoints: 7910, predAccuracy: 74.2, streakCurrent: 9, streakBest: 11, tier: 'DIAMOND', globalRank: 2, countryCode: 'GB', bio: 'Football fanatic. If it has goals, I predict it.' },
  { username: 'hoopsmaster', email: 'hoops@example.com', displayName: 'HoopsMaster', totalPoints: 7650, predAccuracy: 71.8, streakCurrent: 7, streakBest: 10, tier: 'PLATINUM', globalRank: 3, countryCode: 'CA', bio: 'NBA is life. 15+ years following the league.' },
  { username: 'gridironguru', email: 'gridiron@example.com', displayName: 'GridironGuru', totalPoints: 7320, predAccuracy: 69.3, streakCurrent: 5, streakBest: 8, tier: 'PLATINUM', globalRank: 4, countryCode: 'US', bio: 'Sunday is for football. And I mean real football.' },
  { username: 'acepredictor', email: 'ace@example.com', displayName: 'AcePredictor', totalPoints: 7040, predAccuracy: 72.1, streakCurrent: 8, streakBest: 14, tier: 'PLATINUM', globalRank: 5, countryCode: 'AU', bio: 'Tennis and cricket run in my blood.' },
  { username: 'footyfanatic', email: 'footy@example.com', displayName: 'FootyFanatic', totalPoints: 6780, predAccuracy: 65.4, streakCurrent: 4, streakBest: 7, tier: 'GOLD', globalRank: 6, countryCode: 'ES', bio: 'Visca el Barça! Predicting La Liga matches.' },
  { username: 'gamedaypro', email: 'gameday@example.com', displayName: 'GameDayPro', totalPoints: 6540, predAccuracy: 68.2, streakCurrent: 6, streakBest: 9, tier: 'GOLD', globalRank: 7, countryCode: 'US', bio: 'NFL Sundays are sacred. 80% accuracy on TNF picks.' },
  { username: 'predictmaster', email: 'predict@example.com', displayName: 'PredictMaster', totalPoints: 6320, predAccuracy: 70.0, streakCurrent: 3, streakBest: 6, tier: 'GOLD', globalRank: 8, countryCode: 'DE', bio: 'Bundesliga expert. German efficiency in predictions.' },
  { username: 'fanatico', email: 'fanatico@example.com', displayName: 'Fanatico', totalPoints: 6100, predAccuracy: 63.8, streakCurrent: 2, streakBest: 5, tier: 'GOLD', globalRank: 9, countryCode: 'IT', bio: 'Serie A is the most tactical league. Prove me wrong.' },
  { username: 'sportymind', email: 'sporty@example.com', displayName: 'SportyMind', totalPoints: 5890, predAccuracy: 67.5, streakCurrent: 5, streakBest: 8, tier: 'GOLD', globalRank: 10, countryCode: 'FR', bio: 'All sports, all the time. Jack of all trades.' },
  { username: 'demouser', email: 'demo@matchmind.gg', displayName: 'Demo User', totalPoints: 1250, predAccuracy: 55.0, streakCurrent: 1, streakBest: 3, tier: 'SILVER', globalRank: 234, countryCode: 'US', bio: 'Demo account for testing MatchMind!' },
].map(u => ({
  ...u,
  id: makeId('user'),
  passwordHash: '$2a$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1QlCqhGMoLYpYLGMQCqHG6RfFGu', // 'password123'
  emailVerified: true,
  role: u.username === 'sportsking' ? 'SUPERADMIN' : u.username === 'demouser' ? 'USER' : 'USER',
  totalPredictions: Math.floor(u.totalPoints / 30),
  correctPredictions: Math.floor(u.totalPoints / 30 * u.predAccuracy / 100),
  weeklyPoints: Math.floor(Math.random() * 500),
  isPro: u.username === 'sportsking' || u.username === 'demouser',
  proExpiresAt: u.isPro ? new Date(now.getTime() + 365 * 86400000).toISOString() : null,
  createdAt: daysAgo(30 + Math.floor(Math.random() * 60)),
  updatedAt: hoursAgo(Math.floor(Math.random() * 24)),
  lastActiveAt: hoursAgo(Math.floor(Math.random() * 12)),
}))

const userIdMap = {}
users.forEach(u => { userIdMap[u.username] = u.id })

// Follows
const follows = [
  { followerId: userIdMap['demouser'], followingId: userIdMap['sportsking'] },
  { followerId: userIdMap['demouser'], followingId: userIdMap['goalpredictor'] },
  { followerId: userIdMap['demouser'], followingId: userIdMap['hoopsmaster'] },
  { followerId: userIdMap['sportsking'], followingId: userIdMap['goalpredictor'] },
  { followerId: userIdMap['goalpredictor'], followingId: userIdMap['sportsking'] },
  { followerId: userIdMap['footyfanatic'], followingId: userIdMap['sportsking'] },
  { followerId: userIdMap['predictmaster'], followingId: userIdMap['gamedaypro'] },
].map(f => ({ ...f, id: makeId('follow'), createdAt: daysAgo(Math.floor(Math.random() * 20)) }))

// Competitions
const competitions = [
  { name: 'Premier League', shortName: 'PL', sport: 'FOOTBALL', countryCode: 'GB' },
  { name: 'La Liga', shortName: 'LL', sport: 'FOOTBALL', countryCode: 'ES' },
  { name: 'Champions League', shortName: 'UCL', sport: 'FOOTBALL' },
  { name: 'NBA', shortName: 'NBA', sport: 'BASKETBALL', countryCode: 'US' },
  { name: 'NFL', shortName: 'NFL', sport: 'AMERICAN_FOOTBALL', countryCode: 'US' },
  { name: 'Wimbledon', shortName: 'WIM', sport: 'TENNIS', countryCode: 'GB' },
  { name: 'IPL', shortName: 'IPL', sport: 'CRICKET', countryCode: 'IN' },
].map(c => ({ ...c, id: makeId('comp'), isActive: true, isFeatured: true }))

const compMap = {}
competitions.forEach(c => { compMap[c.shortName] = c.id })

// Teams
const teams = [
  { name: 'Manchester City', shortName: 'MCI', sport: 'FOOTBALL', attackRating: 88, defenseRating: 82, formRating: 80, homeAdvantage: 8, countryCode: 'GB' },
  { name: 'Arsenal', shortName: 'ARS', sport: 'FOOTBALL', attackRating: 82, defenseRating: 78, formRating: 75, homeAdvantage: 7, countryCode: 'GB' },
  { name: 'Real Madrid', shortName: 'RMA', sport: 'FOOTBALL', attackRating: 90, defenseRating: 80, formRating: 85, homeAdvantage: 9, countryCode: 'ES' },
  { name: 'Barcelona', shortName: 'FCB', sport: 'FOOTBALL', attackRating: 85, defenseRating: 75, formRating: 78, homeAdvantage: 7, countryCode: 'ES' },
  { name: 'Liverpool', shortName: 'LIV', sport: 'FOOTBALL', attackRating: 84, defenseRating: 76, formRating: 77, homeAdvantage: 9, countryCode: 'GB' },
  { name: 'Bayern Munich', shortName: 'MUN', sport: 'FOOTBALL', attackRating: 88, defenseRating: 79, formRating: 82, homeAdvantage: 8, countryCode: 'DE' },
  { name: 'Chelsea', shortName: 'CHE', sport: 'FOOTBALL', attackRating: 76, defenseRating: 72, formRating: 70, homeAdvantage: 7, countryCode: 'GB' },
  { name: 'Tottenham', shortName: 'TOT', sport: 'FOOTBALL', attackRating: 78, defenseRating: 70, formRating: 72, homeAdvantage: 6, countryCode: 'GB' },
  { name: 'LA Lakers', shortName: 'LAL', sport: 'BASKETBALL', attackRating: 85, defenseRating: 78, formRating: 80, homeAdvantage: 6, countryCode: 'US' },
  { name: 'Boston Celtics', shortName: 'BOS', sport: 'BASKETBALL', attackRating: 88, defenseRating: 82, formRating: 84, homeAdvantage: 7, countryCode: 'US' },
  { name: 'Golden State Warriors', shortName: 'GSW', sport: 'BASKETBALL', attackRating: 82, defenseRating: 74, formRating: 76, homeAdvantage: 6, countryCode: 'US' },
  { name: 'Milwaukee Bucks', shortName: 'MIL', sport: 'BASKETBALL', attackRating: 80, defenseRating: 76, formRating: 78, homeAdvantage: 5, countryCode: 'US' },
  { name: 'Kansas City Chiefs', shortName: 'KC', sport: 'AMERICAN_FOOTBALL', attackRating: 85, defenseRating: 80, formRating: 82, homeAdvantage: 7, countryCode: 'US' },
  { name: 'San Francisco 49ers', shortName: 'SF', sport: 'AMERICAN_FOOTBALL', attackRating: 82, defenseRating: 78, formRating: 80, homeAdvantage: 6, countryCode: 'US' },
  { name: 'Buffalo Bills', shortName: 'BUF', sport: 'AMERICAN_FOOTBALL', attackRating: 80, defenseRating: 76, formRating: 78, homeAdvantage: 6, countryCode: 'US' },
  { name: 'Chennai Super Kings', shortName: 'CSK', sport: 'CRICKET', attackRating: 82, defenseRating: 78, formRating: 80, homeAdvantage: 6, countryCode: 'IN' },
  { name: 'Mumbai Indians', shortName: 'MI', sport: 'CRICKET', attackRating: 84, defenseRating: 76, formRating: 82, homeAdvantage: 5, countryCode: 'IN' },
  { name: 'Novak Djokovic', shortName: 'DJOK', sport: 'TENNIS', attackRating: 95, defenseRating: 90, formRating: 92, homeAdvantage: 3, countryCode: 'RS' },
  { name: 'Carlos Alcaraz', shortName: 'ALCA', sport: 'TENNIS', attackRating: 90, defenseRating: 82, formRating: 88, homeAdvantage: 2, countryCode: 'ES' },
].map(t => ({ ...t, id: `team-${t.shortName.toLowerCase()}`, logo: null }))

const teamMap = {}
teams.forEach(t => { teamMap[t.shortName] = t.id })

// Matches
const matches = [
  { id: 'live-1', sport: 'FOOTBALL', competition: 'Premier League', competitionId: compMap['PL'], homeTeamId: teamMap['MCI'], awayTeamId: teamMap['ARS'], homeTeamName: 'Manchester City', awayTeamName: 'Arsenal', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 90, scheduledAt: hoursAgo(2), kickedOffAt: hoursAgo(2), finishedAt: hoursAgo(1), simSeed: 42, stadium: 'Etihad Stadium', season: '2025/26' },
  { id: 'live-2', sport: 'FOOTBALL', competition: 'La Liga', competitionId: compMap['LL'], homeTeamId: teamMap['RMA'], awayTeamId: teamMap['FCB'], homeTeamName: 'Real Madrid', awayTeamName: 'Barcelona', homeScore: 1, awayScore: 1, status: 'FINISHED', minute: 90, scheduledAt: hoursAgo(1), kickedOffAt: hoursAgo(1), finishedAt: hoursAgo(0.5), simSeed: 99, stadium: 'Santiago Bernabéu', season: '2025/26' },
  { id: 'live-3', sport: 'BASKETBALL', competition: 'NBA', competitionId: compMap['NBA'], homeTeamId: teamMap['LAL'], awayTeamId: teamMap['BOS'], homeTeamName: 'LA Lakers', awayTeamName: 'Boston Celtics', homeScore: 105, awayScore: 98, status: 'FINISHED', minute: 48, scheduledAt: hoursAgo(0.75), kickedOffAt: hoursAgo(0.75), finishedAt: hoursAgo(0.1), simSeed: 7, stadium: 'Crypto.com Arena', season: '2025/26' },
  { id: 'live-4', sport: 'TENNIS', competition: 'Wimbledon', competitionId: compMap['WIM'], homeTeamId: teamMap['DJOK'], awayTeamId: teamMap['ALCA'], homeTeamName: 'N. Djokovic', awayTeamName: 'C. Alcaraz', homeScore: 2, awayScore: 1, status: 'FINISHED', minute: 3, scheduledAt: hoursAgo(1), kickedOffAt: hoursAgo(1), finishedAt: hoursAgo(0.5), simSeed: 123, stadium: 'Centre Court', season: '2025' },
  { id: 'upcoming-1', sport: 'FOOTBALL', competition: 'Champions League', competitionId: compMap['UCL'], homeTeamId: teamMap['LIV'], awayTeamId: teamMap['MUN'], homeTeamName: 'Liverpool', awayTeamName: 'Bayern Munich', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, scheduledAt: hoursFromNow(2), stadium: 'Anfield', season: '2025/26' },
  { id: 'upcoming-2', sport: 'FOOTBALL', competition: 'Premier League', competitionId: compMap['PL'], homeTeamId: teamMap['CHE'], awayTeamId: teamMap['TOT'], homeTeamName: 'Chelsea', awayTeamName: 'Tottenham', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, scheduledAt: hoursFromNow(3), stadium: 'Stamford Bridge', season: '2025/26' },
  { id: 'upcoming-3', sport: 'BASKETBALL', competition: 'NBA', competitionId: compMap['NBA'], homeTeamId: teamMap['GSW'], awayTeamId: teamMap['MIL'], homeTeamName: 'Golden State Warriors', awayTeamName: 'Milwaukee Bucks', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, scheduledAt: hoursFromNow(4), stadium: 'Chase Center', season: '2025/26' },
  { id: 'upcoming-4', sport: 'AMERICAN_FOOTBALL', competition: 'NFL', competitionId: compMap['NFL'], homeTeamId: teamMap['KC'], awayTeamId: teamMap['SF'], homeTeamName: 'Kansas City Chiefs', awayTeamName: 'San Francisco 49ers', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, scheduledAt: hoursFromNow(5), stadium: 'Arrowhead Stadium', season: '2025' },
  { id: 'upcoming-5', sport: 'CRICKET', competition: 'IPL', competitionId: compMap['IPL'], homeTeamId: teamMap['CSK'], awayTeamId: teamMap['MI'], homeTeamName: 'Chennai Super Kings', awayTeamName: 'Mumbai Indians', homeScore: null, awayScore: null, status: 'SCHEDULED', minute: 0, scheduledAt: hoursFromNow(6), stadium: 'M. A. Chidambaram Stadium', season: '2025' },
  { id: 'finished-1', sport: 'FOOTBALL', competition: 'Premier League', competitionId: compMap['PL'], homeTeamId: teamMap['MCI'], awayTeamId: teamMap['ARS'], homeTeamName: 'Manchester City', awayTeamName: 'Arsenal', homeScore: 2, awayScore: 3, status: 'FINISHED', minute: 90, scheduledAt: daysAgo(1), kickedOffAt: daysAgo(1), finishedAt: hoursAgo(23), stadium: 'Emirates Stadium', season: '2025/26' },
  { id: 'finished-2', sport: 'BASKETBALL', competition: 'NBA', competitionId: compMap['NBA'], homeTeamId: teamMap['LAL'], awayTeamId: teamMap['GSW'], homeTeamName: 'LA Lakers', awayTeamName: 'Golden State Warriors', homeScore: 112, awayScore: 108, status: 'FINISHED', minute: 48, scheduledAt: daysAgo(1), kickedOffAt: daysAgo(1), finishedAt: hoursAgo(23), stadium: 'Crypto.com Arena', season: '2025/26' },
  { id: 'finished-3', sport: 'AMERICAN_FOOTBALL', competition: 'NFL', competitionId: compMap['NFL'], homeTeamId: teamMap['KC'], awayTeamId: teamMap['BUF'], homeTeamName: 'Kansas City Chiefs', awayTeamName: 'Buffalo Bills', homeScore: 27, awayScore: 24, status: 'FINISHED', minute: 60, scheduledAt: daysAgo(2), kickedOffAt: daysAgo(2), finishedAt: hoursAgo(47), stadium: 'Arrowhead Stadium', season: '2025' },
]

// Predictions
const predStatuses = ['PENDING', 'PENDING', 'PENDING', 'PENDING', 'SCORED', 'SCORED', 'PENDING', 'PENDING', 'SCORED', 'SCORED', 'PENDING', 'PENDING', 'SCORED', 'SCORED']
const predictions = [
  { username: 'demouser', matchId: 'live-1', homeGoals: 2, awayGoals: 1, firstScorerId: 'E. Haaland', totalGoalsOU: 'Over 2.5', btts: true, status: 'PENDING' },
  { username: 'demouser', matchId: 'live-2', homeGoals: 2, awayGoals: 1, firstScorerId: 'K. Mbappé', status: 'PENDING' },
  { username: 'demouser', matchId: 'upcoming-1', homeGoals: 2, awayGoals: 1, btts: true, status: 'PENDING' },
  { username: 'demouser', matchId: 'upcoming-2', homeGoals: 1, awayGoals: 1, status: 'PENDING' },
  { username: 'demouser', matchId: 'finished-1', homeGoals: 1, awayGoals: 2, firstScorerId: 'M. Ødegaard', btts: true, status: 'SCORED', pointsEarned: 15 },
  { username: 'demouser', matchId: 'finished-2', homeGoals: 110, awayGoals: 105, totalGoalsOU: 'Over 210.5', status: 'SCORED', pointsEarned: 0 },
  { username: 'sportsking', matchId: 'live-1', homeGoals: 3, awayGoals: 1, firstScorerId: 'E. Haaland', btts: true, status: 'PENDING' },
  { username: 'sportsking', matchId: 'live-2', homeGoals: 2, awayGoals: 1, firstScorerId: 'Vini Jr.', status: 'PENDING' },
  { username: 'sportsking', matchId: 'finished-1', homeGoals: 1, awayGoals: 3, firstScorerId: 'B. Saka', btts: true, status: 'SCORED', pointsEarned: 50 },
  { username: 'sportsking', matchId: 'finished-2', homeGoals: 115, awayGoals: 102, totalGoalsOU: 'Over 210.5', status: 'SCORED', pointsEarned: 10 },
  { username: 'goalpredictor', matchId: 'live-1', homeGoals: 2, awayGoals: 2, btts: true, status: 'PENDING' },
  { username: 'goalpredictor', matchId: 'live-3', homeGoals: 95, awayGoals: 98, totalGoalsOU: 'Over 190.5', status: 'PENDING' },
  { username: 'goalpredictor', matchId: 'finished-1', homeGoals: 0, awayGoals: 2, firstScorerId: 'M. Ødegaard', btts: false, status: 'SCORED', pointsEarned: 15 },
  { username: 'goalpredictor', matchId: 'finished-3', homeGoals: 24, awayGoals: 20, status: 'SCORED', pointsEarned: 0 },
].map((p, i) => ({
  id: makeId('pred'),
  userId: userIdMap[p.username],
  matchId: p.matchId,
  homeGoals: p.homeGoals,
  awayGoals: p.awayGoals,
  firstScorerId: p.firstScorerId || null,
  totalGoalsOU: p.totalGoalsOU || null,
  totalGoalsLine: p.totalGoalsOU ? 2.5 : null,
  btts: p.btts ?? null,
  result: null,
  pointsEarned: p.pointsEarned ?? null,
  pointsBreakdown: null,
  status: p.status,
  lockedAt: p.status === 'SCORED' ? hoursAgo(23) : null,
  scoredAt: p.status === 'SCORED' ? hoursAgo(22) : null,
  createdAt: hoursAgo(48 - i * 2),
}))

// Leagues
const leagues = [
  { name: 'Premier League Fans 2025', inviteCode: 'PL2025X', isPublic: true, sport: 'FOOTBALL', ownerId: userIdMap['sportsking'] },
  { name: 'The Undefeatables', inviteCode: 'UNDEF1', isPublic: false, sport: 'BASKETBALL', ownerId: userIdMap['hoopsmaster'] },
  { name: "NFL Pick'em Crew", inviteCode: 'NFLPICK', isPublic: true, sport: 'AMERICAN_FOOTBALL', ownerId: userIdMap['gridironguru'] },
  { name: 'Champions League Special', inviteCode: 'UCL25X', isPublic: true, sport: 'FOOTBALL', ownerId: userIdMap['goalpredictor'] },
  { name: 'All Sports Showdown', inviteCode: 'ALLSPT', isPublic: true, sport: null, ownerId: userIdMap['sportymind'] },
].map(l => ({ ...l, id: makeId('league'), maxMembers: 50, createdAt: daysAgo(20 + Math.floor(Math.random() * 10)) }))

// League Members
const leagueMembers = [
  { league: 'Premier League Fans 2025', username: 'sportsking', points: 1250 },
  { league: 'Premier League Fans 2025', username: 'goalpredictor', points: 1180 },
  { league: 'Premier League Fans 2025', username: 'demouser', points: 980 },
  { league: 'Premier League Fans 2025', username: 'footyfanatic', points: 920 },
  { league: 'The Undefeatables', username: 'hoopsmaster', points: 1100 },
  { league: 'The Undefeatables', username: 'demouser', points: 850 },
  { league: "NFL Pick'em Crew", username: 'gridironguru', points: 950 },
  { league: "NFL Pick'em Crew", username: 'gamedaypro', points: 890 },
  { league: "NFL Pick'em Crew", username: 'demouser', points: 720 },
  { league: 'Champions League Special', username: 'sportsking', points: 450 },
  { league: 'Champions League Special', username: 'predictmaster', points: 380 },
  { league: 'All Sports Showdown', username: 'sportymind', points: 670 },
  { league: 'All Sports Showdown', username: 'fanatico', points: 590 },
  { league: 'All Sports Showdown', username: 'acepredictor', points: 520 },
].map(lm => ({
  id: makeId('lm'),
  leagueId: leagues.find(l => l.name === lm.league).id,
  userId: userIdMap[lm.username],
  points: lm.points,
  rank: null,
  joinedAt: daysAgo(10 + Math.floor(Math.random() * 10)),
}))

// Squads
const squads = [
  { name: 'The Undefeatables', ownerId: userIdMap['hoopsmaster'], members: ['hoopsmaster', 'demouser', 'sportsking'] },
  { name: 'Weekend Warriors', ownerId: userIdMap['gamedaypro'], members: ['gamedaypro', 'gridironguru', 'acepredictor'] },
  { name: 'Fantasy Kings', ownerId: userIdMap['sportymind'], members: ['sportymind', 'fanatico', 'predictmaster', 'footyfanatic'] },
].map(s => ({ ...s, id: makeId('squad'), createdAt: daysAgo(15 + Math.floor(Math.random() * 10)) }))

// Squad Members
const squadMembers = []
for (const squad of squads) {
  squad.members.forEach((username, i) => {
    squadMembers.push({
      id: makeId('sm'),
      squadId: squad.id,
      userId: userIdMap[username],
      role: i === 0 ? 'owner' : 'member',
      points: Math.floor(Math.random() * 500),
      joinedAt: daysAgo(10 + Math.floor(Math.random() * 5)),
    })
  })
}

// Notifications
const notifications = [
  { username: 'demouser', type: 'leaderboard', title: 'Rank Update', message: 'You moved up to #234 on the global leaderboard!', isRead: true },
  { username: 'demouser', type: 'prediction', title: 'Prediction Locked', message: 'Your prediction for Man City vs Arsenal has been locked.', isRead: false },
  { username: 'demouser', type: 'social', title: 'New Follower', message: 'SportsKing started following you!', isRead: false },
  { username: 'demouser', type: 'league', title: 'League Update', message: 'You moved to 3rd place in Premier League Fans 2025!', isRead: false },
  { username: 'demouser', type: 'match', title: 'Match Starting Soon', message: 'Liverpool vs Bayern Munich kicks off in 30 minutes.', isRead: false },
].map(n => ({
  id: makeId('notif'),
  userId: userIdMap[n.username],
  type: n.type,
  title: n.title,
  message: n.message,
  link: null,
  payload: null,
  isRead: n.isRead,
  createdAt: hoursAgo(Math.floor(Math.random() * 24)),
}))

// Subscriptions
const subscriptions = []
for (const user of users) {
  if (user.isPro) {
    subscriptions.push({
      id: makeId('sub'),
      userId: user.id,
      stripeCustomerId: `cus_mock_${user.id}`,
      stripeSubscriptionId: `sub_mock_${user.id}`,
      plan: 'monthly',
      status: 'ACTIVE',
      currentPeriodStart: daysAgo(30),
      currentPeriodEnd: new Date(now.getTime() + 335 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: daysAgo(30),
    })
  }
}

// Achievements
const achievements = [
  { key: 'first_prediction', name: 'First Prediction', description: 'Make your first prediction', icon: '🎯', rarity: 'common', pointBonus: 10 },
  { key: 'perfect_week', name: 'Perfect Week', description: 'Get all predictions correct in a week', icon: '🌟', rarity: 'rare', pointBonus: 50 },
  { key: 'streak_5', name: 'Hot Streak', description: 'Achieve a 5-prediction correct streak', icon: '🔥', rarity: 'rare', pointBonus: 25 },
  { key: 'streak_10', name: 'On Fire', description: 'Achieve a 10-prediction correct streak', icon: '⚡', rarity: 'epic', pointBonus: 100 },
  { key: 'tier_silver', name: 'Silver Tier', description: 'Reach Silver tier', icon: '🥈', rarity: 'common', pointBonus: 20 },
  { key: 'tier_gold', name: 'Gold Tier', description: 'Reach Gold tier', icon: '🥇', rarity: 'rare', pointBonus: 50 },
  { key: 'tier_platinum', name: 'Platinum Tier', description: 'Reach Platinum tier', icon: '💎', rarity: 'epic', pointBonus: 100 },
  { key: 'tier_diamond', name: 'Diamond Tier', description: 'Reach Diamond tier', icon: '💠', rarity: 'legendary', pointBonus: 250 },
  { key: 'tier_legend', name: 'Legend Tier', description: 'Reach Legend tier', icon: '👑', rarity: 'legendary', pointBonus: 500 },
  { key: 'top_10', name: 'Top 10', description: 'Reach top 10 on global leaderboard', icon: '🏆', rarity: 'epic', pointBonus: 150 },
  { key: 'social_butterfly', name: 'Social Butterfly', description: 'Follow 10 users', icon: '🦋', rarity: 'rare', pointBonus: 30 },
  { key: 'league_champion', name: 'League Champion', description: 'Win a league', icon: '🏅', rarity: 'rare', pointBonus: 75 },
].map(a => ({ ...a, id: makeId('ach') }))

const achMap = {}
achievements.forEach(a => { achMap[a.key] = a.id })

// User Achievements
const userAchievements = [
  { userId: userIdMap['sportsking'], achievementId: achMap['tier_diamond'] },
  { userId: userIdMap['sportsking'], achievementId: achMap['streak_10'] },
  { userId: userIdMap['sportsking'], achievementId: achMap['top_10'] },
  { userId: userIdMap['goalpredictor'], achievementId: achMap['tier_diamond'] },
  { userId: userIdMap['hoopsmaster'], achievementId: achMap['tier_platinum'] },
  { userId: userIdMap['demouser'], achievementId: achMap['first_prediction'] },
  { userId: userIdMap['demouser'], achievementId: achMap['tier_silver'] },
].map(ua => ({
  id: makeId('ua'),
  userId: ua.userId,
  achievementId: ua.achievementId,
  unlockedAt: daysAgo(Math.floor(Math.random() * 30)),
}))

// Standings
const standings = []
for (const comp of competitions.filter(c => c.sport === 'FOOTBALL' || c.sport === 'BASKETBALL')) {
  const compTeams = teams.filter(t => t.sport === comp.sport)
  compTeams.forEach((team, idx) => {
    const played = 10 + Math.floor(Math.random() * 10)
    const won = Math.floor(played * (0.3 + Math.random() * 0.4))
    const drawn = Math.floor(played * (0.1 + Math.random() * 0.2))
    const lost = played - won - drawn
    const gf = Math.floor(won * 2.5 + drawn * 1.2 + Math.random() * 5)
    const ga = Math.floor(lost * 2 + drawn * 1 + Math.random() * 5)
    const pts = won * 3 + drawn
    standings.push({
      id: makeId('std'),
      competitionId: comp.id,
      teamId: team.id,
      season: '2025/26',
      position: idx + 1,
      played, won, drawn, lost,
      goalsFor: gf,
      goalsAgainst: ga,
      points: pts,
      form: ['W', 'W', 'L', 'D', 'W'].map(r => Math.random() > 0.5 ? r : ['W', 'L', 'D'][Math.floor(Math.random() * 3)]).join(''),
      updatedAt: hoursAgo(Math.floor(Math.random() * 12)),
    })
  })
}

// ─── WRITE FILES ─────────────────────────────────────────

const allData = {
  user: users,
  follow: follows,
  competition: competitions,
  team: teams,
  match: matches,
  prediction: predictions,
  league: leagues,
  leagueMember: leagueMembers,
  squad: squads,
  squadMember: squadMembers,
  notification: notifications,
  subscription: subscriptions,
  achievement: achievements,
  userAchievement: userAchievements,
  standing: standings,
  chatMessage: [],
  matchEvent: [],
  report: [],
  userSport: [],
  userTeam: [],
  player: [],
  session: [],
  adminLog: [],
  scoringLog: [],
  leaderboardSnapshot: [],
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Write each model to its own JSON file
for (const [modelName, records] of Object.entries(allData)) {
  const filePath = path.join(DATA_DIR, `${modelName}.json`)
  fs.writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf-8')
  console.log(`✅ Wrote ${records.length} records to ${modelName}.json`)
}

console.log('\n🎉 Seed data generated successfully!')
console.log(`📁 Location: ${DATA_DIR}`)
const total = Object.values(allData).reduce((sum, arr) => sum + arr.length, 0)
console.log(`📊 Total records: ${total}`)

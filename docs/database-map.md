# Database Map — Match-Mind

## Database Type
**Custom JSON File-Based Database** — each entity stored as a separate JSON file with atomic write support and automated backups.

## Data Files (`backend/src/data/`)

### Core Entities
| File | Entity | Purpose | Key Fields |
|------|--------|---------|------------|
| user.json | User | User accounts & profiles | id, email, passwordHash, name, role, tokens |
| session.json | Session | Auth sessions | id, userId, token, expiresAt |
| player.json | Player | Sports player database | id, name, sport, team, rarity, stats, photoUrl |
| tournament.json | Tournament | Tournament definitions | id, name, sport, startDate, endDate, status |
| fixture.json | Fixture | Match fixtures | id, tournamentId, homeTeam, awayTeam, date, status |
| room.json | Room | Prediction rooms | id, name, type, ownerId, settings, status |
| roomMember.json | RoomMember | Room membership | id, roomId, userId, role, joinedAt |

### Transactional Entities
| File | Entity | Purpose | Key Fields |
|------|--------|---------|------------|
| auctionState.json | AuctionState | Live auction state | id, roomId, currentPlayer, currentBid, timer, status |
| bid.json | Bid | Auction bids | id, auctionId, playerId, userId, amount, timestamp |
| draftSession.json | DraftSession | Draft session state | id, roomId, round, pickOrder, status |
| draftPick.json | DraftPick | Individual draft picks | id, sessionId, userId, playerId, round, pick |
| draftRunResult.json | DraftRunResult | Completed draft results | id, sessionId, results[] |
| roster.json | Roster | User's fantasy roster | id, userId, roomId, players[], formation |

### Gamification Entities
| File | Entity | Purpose | Key Fields |
|------|--------|---------|------------|
| achievement.json | Achievement | Available achievements | id, name, description, criteria, reward |
| userAchievement.json | UserAchievement | Earned achievements | id, userId, achievementId, earnedAt |
| draftRewardsCatalog.json | DraftRewardsCatalog | Reward definitions | id, name, type, cost, rarity |
| subscription.json | Subscription | User subscriptions | id, userId, plan, status, expiresAt |
| draftTicket.json | DraftTicket | Draft entry tickets | id, userId, sessionId, status, expiresAt |

### Social & Communication
| File | Entity | Purpose | Key Fields |
|------|--------|---------|------------|
| follow.json | Follow | User follows | id, followerId, followingId, type |
| chatMessage.json | ChatMessage | Room chat messages | id, roomId, userId, content, timestamp |
| notification.json | Notification | User notifications | id, userId, type, message, read, createdAt |

### Scoring & Stats
| File | Entity | Purpose | Key Fields |
|------|--------|---------|------------|
| fantasyPointsLedger.json | FantasyPointsLedger | Points ledger entries | id, userId, playerId, matchId, points, breakdown |
| playerMatchStat.json | PlayerMatchStat | Player match statistics | id, playerId, matchId, stats{} |
| leaderboardSnapshot.json | LeaderboardSnapshot | Rank snapshots | id, roomId, rankings[], timestamp |
| playerRarityCache.json | PlayerRarityCache | Cached rarity tiers | id, playerId, tier, score |

### Administrative
| File | Entity | Purpose | Key Fields |
|------|--------|---------|------------|
| adminLog.json | AdminLog | Admin action logs | id, adminId, action, target, timestamp |
| report.json | Report | User/subscription reports | id, reporterId, targetId, reason, status |
| starredPlayer.json | StarredPlayer | User's starred players | id, userId, playerId |
| roomTemplate.json | RoomTemplate | Room templates/configs | id, name, settings, defaultConfig |

## Relationships Map

```
User (1) ──── has ──── Session (0..N)
User (1) ──── has ──── Roster (0..N)
User (1) ──── has ──── Subscription (0..N)
User (1) ──── has ──── UserAchievement (0..N)
User (1) ──── has ──── DraftTicket (0..N)
User (1) ──── follows ──── Follow (M..N)
User (1) ──── belongs to ──── RoomMember (0..N)
User (1) ──── starred ──── StarredPlayer (0..N)

Room (1) ──── has ──── RoomMember (0..N)
Room (1) ──── has ──── AuctionState (0..1)
Room (1) ──── has ──── DraftSession (0..1)
Room (1) ──── has ──── ChatMessage (0..N)
Room (1) ──── has ──── LeaderboardSnapshot (0..N)

Tournament (1) ──── has ──── Fixture (0..N)
Fixture (1) ──── has ──── PlayerMatchStat (0..N)
Player (1) ──── has ──── PlayerMatchStat (0..N)
Player (1) ──── has ──── PlayerRarityCache (1)

AuctionState (1) ──── has ──── Bid (0..N)
DraftSession (1) ──── has ──── DraftPick (0..N)
DraftSession (1) ──── has ──── DraftRunResult (0..N)

Achievement (1) ──── earned by ──── UserAchievement (0..N)
```

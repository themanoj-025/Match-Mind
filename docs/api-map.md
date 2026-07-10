# API Map — Match-Mind

## Authentication (routes/auth.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/auth/csrf-token` | Get CSRF token | None |
| POST | `/api/auth/signup` | Register with username, email, password | None |
| POST | `/api/auth/login` | Login with email, password → JWT + refresh cookie | None |
| POST | `/api/auth/logout` | Revoke tokens, clear auth cookies | JWT |
| POST | `/api/auth/logout-all` | Revoke all sessions | JWT |
| GET | `/api/auth/google` | Google OAuth redirect | None |
| GET | `/api/auth/google/cb` | Google OAuth callback → redirect to /feed | None |
| POST | `/api/auth/refresh` | Refresh access token via refreshToken | Refresh token |
| POST | `/api/auth/forgot-password` | Generate password reset token | None |
| POST | `/api/auth/reset-password` | Consume reset token, update password | Reset token |
| POST | `/api/auth/verify-email` | Verify email via JWT token | None |
| POST | `/api/auth/resend-verification` | Resend verification email | None |

## Users (routes/users.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/users/check-username?username=` | Check if username is available | None |
| GET | `/api/users/:id` | Get public profile | None |
| PATCH | `/api/users/me` | Update displayName, avatar, bio, favouriteSports, favouriteTeams | JWT |
| POST | `/api/users/:id/follow` | Follow a user | JWT |
| DELETE | `/api/users/:id/follow` | Unfollow a user | JWT |
| GET | `/api/users/me/notifications` | Get user notifications (last 50) | JWT |
| PATCH | `/api/users/me/notifications/read` | Mark all notifications as read | JWT |

## Rooms (routes/rooms.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/rooms` | Create room with tournamentId, name, budget, rosterRules | JWT |
| GET | `/api/rooms/mine` | List user's room memberships | JWT |
| GET | `/api/rooms/:id` | Get room with members + auctionState | None |
| GET | `/api/rooms/:id/members` | List members with ready status | None |
| POST | `/api/rooms/:id/join` | Join room by invite code | JWT |
| PATCH | `/api/rooms/:id/ready` | Toggle ready status in lobby | JWT |
| POST | `/api/rooms/:id/regenerate-invite` | Host regenerates invite code | JWT |
| GET | `/api/rooms/:id/leaderboard` | Room fantasy leaderboard | None |

## Auction (routes/auction.ts) — all under `/api/rooms/:roomId/auction/`
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/:roomId/auction/state` | Get current auction state (phase, currentPlayer, timer) | JWT |
| POST | `/:roomId/auction/start` | Host starts auction: shuffle players into queue, init state | JWT |
| POST | `/:roomId/auction/next-player` | Host advances to next player in queue | JWT |
| POST | `/:roomId/auction/force-sold` | Host force-sells current player to highest bidder | JWT |
| POST | `/:roomId/auction/force-unsold` | Host marks current player unsold | JWT |
| POST | `/:roomId/auction/re-auction` | Host starts re-auction of unsold players | JWT |
| POST | `/:roomId/auction/pause` | Host pauses auction | JWT |
| POST | `/:roomId/auction/resume` | Host resumes auction | JWT |
| POST | `/:roomId/auction/end` | Host ends auction | JWT |

> **WebSocket**: Bids are submitted via `PLACE_BID` Socket.IO event, not REST.

## Franchises (routes/franchises.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/rooms/:roomId/franchises/:userId` | View a user's roster in a room | JWT |
| PATCH | `/api/rooms/:roomId/franchises/me/captain` | Set captain or vice-captain | JWT |

## Draft (routes/draft.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/draft/start` | Start draft (consumes ticket) | JWT |
| GET | `/api/draft/formations` | List available formations | JWT |
| GET | `/api/draft/mine` | List user's draft sessions | JWT |
| GET | `/api/draft/tickets?tournamentId=` | Ticket balance (per tournament or all) | JWT |
| GET | `/api/draft/:sessionId` | Full session state + squad + picks | JWT |
| GET | `/api/draft/:sessionId/next-round` | Get next choice round | JWT |
| POST | `/api/draft/:sessionId/pick` | Pick a player for current slot | JWT |
| POST | `/api/draft/:sessionId/commit` | Commit squad (locks roster) | JWT |
| POST | `/api/draft/:sessionId/enter-run` | Enter Draft Run competition | JWT |
| GET | `/api/draft/:sessionId/run-status` | Draft Run status | JWT |
| POST | `/api/draft/:sessionId/resolve-matchday` | Resolve next matchday | JWT |

## Players (routes/players.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/players?tournamentId=` | List players (football only, max 100) | None |
| GET | `/api/players/:id` | Player details | None |

## Tournaments (routes/tournaments.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/tournaments` | List visible tournaments (LIVE + ANNOUNCED) | None |
| GET | `/api/tournaments/live` | List only LIVE tournaments | None |
| GET | `/api/tournaments/announced` | List only ANNOUNCED tournaments | None |
| GET | `/api/tournaments/:id` | Tournament details | None |

## Fixtures (routes/fixtures.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/fixtures?tournamentId=` | List fixtures (max 100) | None |
| GET | `/api/fixtures/:id` | Fixture with playerMatchStats | None |
| POST | `/api/fixtures` | Create fixture | Admin |
| POST | `/api/fixtures/:id/player-stats` | Enter match stats for players | Admin |
| POST | `/api/fixtures/:id/finalize` | Lock stats, compute fantasy points, emit socket events | Admin |

## Matches (routes/matches.ts) — backward-compatible redirects
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/matches` | List fixtures (redirect) | None |
| GET | `/api/matches/:id` | Get fixture by ID | None |

## Leaderboard (routes/leaderboard.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/rooms/:roomId/leaderboard` | Per-room fantasy leaderboard | None |
| GET | `/api/leaderboard/global` | Deprecated — info message | None |
| GET | `/api/leaderboard/friends` | Friend rankings (stub) | JWT |

## Messages / DM (routes/messages.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/messages/conversations` | List DM conversations with latest message | JWT |
| GET | `/api/messages/:userId` | Get DMs with a specific user | JWT |
| POST | `/api/messages/:userId` | Send DM (text or gif) | JWT |
| PATCH | `/api/messages/read/:userId` | Mark messages from a user as read | JWT |

## Search (routes/search.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/search?q=` | Search users + players (min 2 chars) | None |

## Admin (routes/admin.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/admin/stats` | Dashboard metrics (users, rooms, sport distribution) | Admin |
| GET | `/api/admin/users?page=&limit=&search=` | List users with pagination + search | Admin |
| GET | `/api/admin/users/:id` | Detailed user info (subscription, counts) | Admin |
| PATCH | `/api/admin/users/:id` | Update user (role, tier, username, email, displayName) | Admin |
| DELETE | `/api/admin/users/:id` | Soft-delete user | Admin |
| POST | `/api/admin/users/:id/toggle-pro` | Toggle Pro status | Admin |
| GET | `/api/admin/fixtures?page=&tournamentId=` | List fixtures with pagination | Admin |
| PATCH | `/api/admin/fixtures/:id` | Update fixture (homeScore, awayScore, status) | Admin |
| GET | `/api/admin/reports?page=&status=` | List reports with pagination | Admin |
| PATCH | `/api/admin/reports/:id` | Resolve/dismiss report | Admin |
| GET | `/api/admin/activity-log` | Recent admin actions | Admin |
| GET | `/api/admin/settings` | Feature flags + draft-enabled tournaments | Admin |
| POST | `/api/admin/settings/draft-mode/:tournamentId/:action` | Enable/disable/validate Draft Mode | Admin |
| GET | `/api/admin/draft/pool-validation` | Validate all tournament draft pools | Admin |
| GET | `/api/admin/draft/icons` | List ICON-rarity players | Admin |
| POST | `/api/admin/draft/icons/:playerId/toggle` | Toggle isEligibleForIcon | Admin |
| POST | `/api/admin/draft/revalidate` | Re-compute rarity tiers + re-validate | Admin |

## Stripe (routes/stripe.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/stripe/create-checkout` | Create Stripe Checkout (monthly/annual) | JWT |
| POST | `/api/stripe/webhook` | Stripe webhook (checkout.completed, subscription.updated/deleted) | Stripe sig |
| POST | `/api/stripe/create-portal-session` | Create billing portal session | JWT |
| GET | `/api/stripe/status` | Get user's subscription status | JWT |

## AI (routes/ai.ts)
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/ai/auction-advice` | AI-powered draft strategy (Anthropic Claude or heuristic fallback) | JWT + Pro |

## Internal Services

### Auction Engine (services/auctionEngine.ts)
| Function | Description |
|----------|-------------|
| `processBid(bid, ...loaders)` | Validate + apply bid with mutex, anti-snipe timer, budget checks |
| `sellCurrentPlayer(roomId)` | Mark current player as SOLD |
| `unsoldCurrentPlayer(roomId)` | Mark current player as UNSOLD, add to unsold pool |
| `moveToNextPlayer(roomId)` | Advance to next player in queue, or FINISHED |
| `checkAuctionTimer(roomId, ...)` | Auto-resolve expired timers (SOLD or UNSOLD + advance) |
| `requiredIncrement(currentBid)` | Calculate minimum next bid based on thresholds |
| `validateBudgetForRemainingSlots(...)` | Ensure bidder can afford remaining mandatory roster slots |
| `startReAuction(roomId)` | Move unsold players back into pool queue |

### Fantasy Points (services/fantasyPoints.ts)
| Function | Description |
|----------|-------------|
| `calculatePoints(matchStats)` | Compute fantasy points from player match stats |
| `computeFantasyPoints(fixtureId, statsMap, rosters, ...)` | Batch compute for all rosters in a room |

### Scoring (services/scoring.ts)
| Function | Description |
|----------|-------------|
| `calculateScore(roster, matchResults)` | Calculate team score |
| `validateRoster(roster)` | Check roster validity |

### Auth Service (services/authService.ts)
| Function | Description |
|----------|-------------|
| `signup(username, email, password)` | Create user + generate tokens |
| `login(email, password)` | Authenticate + generate tokens |
| `refreshToken(token)` | Rotate refresh token |
| `generatePasswordResetToken(email)` | Generate password reset JWT |

### Token Service (services/tokenService.ts)
| Function | Description |
|----------|-------------|
| `generateTokens(userId, tokenVersion)` | Create access + refresh tokens |
| `setAuthCookies(res, tokens)` | Set httpOnly cookies |
| `clearAuthCookies(res)` | Clear auth cookies |

### Admin Service (services/adminService.ts)
| Function | Description |
|----------|-------------|
| `getDashboardStats()` | Aggregate dashboard metrics |
| `logAction(adminId, action, targetId, targetType, detail)` | Log admin action |

### Draft Service (services/draftService.ts)
| Function | Description |
|----------|-------------|
| `startDraft(prisma, userId, tournamentId, formation, consumeTicket)` | Start draft session |
| `getNextRound(prisma, sessionId, userId)` | Get next pick round |
| `processPick(prisma, sessionId, userId, slotIndex, playerId)` | Submit pick |
| `commitSquad(prisma, sessionId, userId)` | Lock roster |
| `getSessionState(prisma, sessionId, userId)` | Get full session |
| `loadFormations()` | Available formations |

### Draft Run Service (services/draftRunService.ts)
| Function | Description |
|----------|-------------|
| `enterRun(prisma, sessionId, userId)` | Enter competition |
| `getRunStatus(prisma, sessionId, userId)` | Run state |
| `resolveNextMatchday(prisma, sessionId, userId)` | Resolve matchday outcome |

### Draft Ticket Service (services/draftTicketService.ts)
| Function | Description |
|----------|-------------|
| `consumeTicket(prisma, userId, tournamentId, isPro)` | Issue/consume ticket |
| `getTicketBalance(prisma, userId, tournamentId, isPro)` | Ticket balance |

### Leaderboard Service (services/leaderboardService.ts)
| Function | Description |
|----------|-------------|
| `computeRoomLeaderboard(ledger, roomId, rosters)` | Derive leaderboard from fantasy points ledger |

## External Integrations
| Service | Integration Point | Purpose |
|---------|-------------------|---------|
| Stripe | `routes/stripe.ts` | Pro subscription payments |
| Anthropic Claude | `routes/ai.ts` | AI auction strategy advice (optional) |
| Google OAuth | `routes/auth.ts` | Social login |
| MySQL/PostgreSQL | Prisma ORM (JSON DB fallback) | Data persistence |

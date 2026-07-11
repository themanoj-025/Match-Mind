# Routes — Match-Mind

## Frontend Routes (React Router)

| Route | View Component | Purpose | Auth |
|-------|----------------|---------|------|
| `/` | Landing | Landing / Home | No |
| `/login` | Auth | User Authentication (Login & Signup) | No |
| `/lobby` | Lobby | Room Lobby (Create/join rooms) | Yes |
| `/room/:roomId` | DraftRoom | Real-time Auction & Draft Room | Yes |
| `/leaderboard` | Leaderboard | Global Rankings Leaderboard | Yes |

---

## Backend API Routes

### Auth (`routes/auth.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/auth/csrf-token` | Get CSRF token | No |
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout (revoke tokens) | Yes |
| POST | `/api/auth/logout-all` | Logout all sessions | Yes |
| GET | `/api/auth/google` | Google OAuth redirect | No |
| GET | `/api/auth/google/cb` | Google OAuth callback | No |
| POST | `/api/auth/refresh` | Refresh JWT token | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/verify-email` | Verify email address | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |

### Users (`routes/users.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/users/check-username` | Check username availability | No |
| GET | `/api/users/:id` | Get user profile | No |
| PATCH | `/api/users/me` | Update own profile | Yes |
| POST | `/api/users/:id/follow` | Follow a user | Yes |
| DELETE | `/api/users/:id/follow` | Unfollow a user | Yes |
| GET | `/api/users/me/notifications` | Get my notifications | Yes |
| PATCH | `/api/users/me/notifications/read` | Mark all notifications read | Yes |

### Rooms (`routes/rooms.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/rooms` | Create room | Yes |
| GET | `/api/rooms/mine` | List user's rooms | Yes |
| GET | `/api/rooms/:id` | Get room details | No |
| GET | `/api/rooms/:id/members` | List room members | No |
| POST | `/api/rooms/:id/join` | Join room via invite code | Yes |
| PATCH | `/api/rooms/:id/ready` | Toggle ready status | Yes |
| POST | `/api/rooms/:id/regenerate-invite` | Regenerate invite code | Yes |
| GET | `/api/rooms/:id/leaderboard` | Room leaderboard | No |

### Auction (`routes/auction.ts`) — all under `/api/rooms/:roomId/auction/`
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/:roomId/auction/state` | Get auction state | Yes |
| POST | `/:roomId/auction/start` | Start auction (host) | Yes |
| POST | `/:roomId/auction/next-player` | Advance to next player | Yes |
| POST | `/:roomId/auction/force-sold` | Force-sell current player | Yes |
| POST | `/:roomId/auction/force-unsold` | Mark player unsold | Yes |
| POST | `/:roomId/auction/re-auction` | Start re-auction of unsold | Yes |
| POST | `/:roomId/auction/pause` | Pause auction | Yes |
| POST | `/:roomId/auction/resume` | Resume auction | Yes |
| POST | `/:roomId/auction/end` | End auction | Yes |

> **Note**: Bids are processed via WebSocket (`PLACE_BID` event), not REST.

### Franchises (`routes/franchises.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/rooms/:roomId/franchises/:userId` | View roster | Yes |
| PATCH | `/api/rooms/:roomId/franchises/me/captain` | Set captain/VC | Yes |

### Draft (`routes/draft.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/draft/start` | Start new draft | Yes |
| GET | `/api/draft/formations` | List formations | No |
| GET | `/api/draft/mine` | List user's drafts | Yes |
| GET | `/api/draft/tickets` | Ticket balance | Yes |
| GET | `/api/draft/:sessionId` | Session state | Yes |
| GET | `/api/draft/:sessionId/next-round` | Next choice round | Yes |
| POST | `/api/draft/:sessionId/pick` | Pick a player | Yes |
| POST | `/api/draft/:sessionId/commit` | Commit squad | Yes |
| POST | `/api/draft/:sessionId/enter-run` | Enter Draft Run | Yes |
| GET | `/api/draft/:sessionId/run-status` | Draft Run status | Yes |
| POST | `/api/draft/:sessionId/resolve-matchday` | Resolve matchday | Yes |

### Players (`routes/players.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/players` | List players (filter by tournamentId) | No |
| GET | `/api/players/:id` | Player details | No |

### Tournaments (`routes/tournaments.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/tournaments` | List visible tournaments | No |
| GET | `/api/tournaments/live` | List LIVE tournaments | No |
| GET | `/api/tournaments/announced` | List ANNOUNCED tournaments | No |
| GET | `/api/tournaments/:id` | Tournament details | No |

### Fixtures (`routes/fixtures.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/fixtures` | List fixtures | No |
| GET | `/api/fixtures/:id` | Fixture details with stats | No |
| POST | `/api/fixtures` | Create fixture | Admin |
| POST | `/api/fixtures/:id/player-stats` | Enter player match stats | Admin |
| POST | `/api/fixtures/:id/finalize` | Finalize fixture, compute fantasy points | Admin |

### Matches (`routes/matches.ts`) — backward-compatible redirects to fixtures
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/matches` | List matches (redirects to fixtures) | No |
| GET | `/api/matches/:id` | Match details (redirects to fixture) | No |

### Leaderboard (`routes/leaderboard.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/rooms/:roomId/leaderboard` | Room leaderboard | No |
| GET | `/api/leaderboard/global` | Deprecated — returns info message | No |
| GET | `/api/leaderboard/friends` | Friends leaderboard | Yes |

### Messages / DM (`routes/messages.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/messages/conversations` | List DM conversations | Yes |
| GET | `/api/messages/:userId` | Get DMs with a user | Yes |
| POST | `/api/messages/:userId` | Send DM to user | Yes |
| PATCH | `/api/messages/read/:userId` | Mark messages as read | Yes |

### Search (`routes/search.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/search` | Search users and players | No |

### Admin (`routes/admin.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| GET | `/api/admin/stats` | Dashboard stats | Admin |
| GET | `/api/admin/users` | List users (paginated) | Admin |
| GET | `/api/admin/users/:id` | User details | Admin |
| PATCH | `/api/admin/users/:id` | Update user | Admin |
| DELETE | `/api/admin/users/:id` | Soft-delete user | Admin |
| POST | `/api/admin/users/:id/toggle-pro` | Toggle Pro status | Admin |
| GET | `/api/admin/fixtures` | List fixtures | Admin |
| PATCH | `/api/admin/fixtures/:id` | Update fixture | Admin |
| GET | `/api/admin/reports` | List reports | Admin |
| PATCH | `/api/admin/reports/:id` | Resolve/dismiss report | Admin |
| GET | `/api/admin/activity-log` | Admin action logs | Admin |
| GET | `/api/admin/settings` | Feature flags & settings | Admin |
| POST | `/api/admin/settings/draft-mode/:tournamentId/:action` | Enable/disable Draft Mode | Admin |
| GET | `/api/admin/draft/pool-validation` | Validate draft pools | Admin |
| GET | `/api/admin/draft/icons` | List ICON-rarity players | Admin |
| POST | `/api/admin/draft/icons/:playerId/toggle` | Toggle icon eligibility | Admin |
| POST | `/api/admin/draft/revalidate` | Re-validate + re-compute rarity tiers | Admin |

### Stripe (`routes/stripe.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/stripe/create-checkout` | Create checkout session | Yes |
| POST | `/api/stripe/webhook` | Stripe webhook handler | No (signature) |
| POST | `/api/stripe/create-portal-session` | Create customer portal | Yes |
| GET | `/api/stripe/status` | Get subscription status | Yes |

### AI (`routes/ai.ts`)
| Method | Route | Purpose | Auth |
|--------|-------|---------|------|
| POST | `/api/ai/auction-advice` | AI-powered draft strategy (Pro) | Yes + Pro |

## Socket.IO Events
| Event | Direction | Purpose |
|-------|-----------|---------|
| `AUCTION_STARTED` | Server → Client | Auction started in room |
| `AUCTION_PHASE_CHANGE` | Server → Client | Phase changed |
| `AUCTION_PAUSED` | Server → Client | Auction paused |
| `AUCTION_RESUMED` | Server → Client | Auction resumed |
| `AUCTION_FINISHED` | Server → Client | Auction finished |
| `PLAYER_SOLD` | Server → Client | Player sold |
| `PLAYER_UNSOLD` | Server → Client | Player unsold |
| `RE_AUCTION_STARTED` | Server → Client | Re-auction started |
| `PLACE_BID` | Client → Server | Place bid |
| `FANTASY_POINTS_UPDATE` | Server → Client | Points calculated |
| `MEMBER_JOINED` | Server → Client | Member joined room |
| `MEMBER_READY_CHANGED` | Server → Client | Ready status changed |
| `DM_MESSAGE` | Server → Client | Direct message received |

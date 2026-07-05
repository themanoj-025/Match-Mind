# 🏟️ MatchMind — The Internet's Sports Bar

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Sentry](https://img.shields.io/badge/Sentry-10-362D59?logo=sentry&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
[![CI](https://img.shields.io/github/actions/workflow/status/themanoj-025/Match-Mind/ci.yml?branch=main&label=CI&logo=github)](https://github.com/themanoj-025/Match-Mind/actions/workflows/ci.yml)
[![Dependabot](https://img.shields.io/badge/dependabot-enabled-025E8C?logo=dependabot)](https://github.com/themanoj-025/Match-Mind/security/dependabot)

**Watch. Predict. Compete. Talk sport together. Unlock AI insights.**

MatchMind is a real-time social sports prediction platform where fans watch live games, make score predictions, compete on leaderboards, chat in live match rooms, unlock AI-powered insights, earn achievements, and build a global fan community.

---

## ✨ Core Loop

```
WATCH → PREDICT → COMPETE → TALK → EARN → REPEAT
```

### Value Pillars
| Pillar | Description |
|--------|-------------|
| **Watch Together** | Synchronized viewing rooms with live scores, stats, and stream embeds |
| **Predict** | Pre-match score predictions with a tiered points economy |
| **Compete** | Global, weekly, league-specific, and friend-group leaderboards |
| **Talk Sport** | Real-time chat rooms per match, squad, and sport with reactions & GIFs |
| **Social Fabric** | Follow friends, create squads, private leagues, activity feeds |
| **AI Insights** | Claude-powered prediction hints (Pro feature) |
| **Pro Tier** | Stripe subscriptions for AI predictions, badges, unlimited leagues |

### Supported Sports
- ⚽ Football (Premier League, La Liga, Serie A, Bundesliga, Champions League)
- 🏀 NBA / NCAA Basketball
- 🏈 NFL / NCAA Football
- 🎾 Tennis (Grand Slams)
- 🏏 Cricket (IPL, Test Matches)
- 🏒 NHL Hockey

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19 + Vite 8** | UI framework and build tool |
| **Tailwind CSS v4** | Utility-first styling |
| **Zustand** | Global state management |
| **React Query** | Server state & caching |
| **React Router v6** | Routing with lazy loading |
| **Socket.io-client** | Real-time WebSocket communication |
| **Framer Motion** | Page/component animations (18 variant sets) |
| **GSAP** | Scroll-triggered animations, count-ups, timeline reveals |
| **Three.js + React Three Fiber** | 3D particle hero scene |
| **Recharts** | Charts & data visualization (admin dashboard) |
| **Lucide React** | Icon library |
| **react-helmet-async** | SEO meta tags & structured data |
| **React Hook Form + Zod** | Form validation |
| **Sonner** | Toast notifications |
| **@stripe/react-stripe-js** | Stripe Checkout integration |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express 5** | API server (TypeScript via tsx) |
| **TypeScript 6** | Type safety across all server code |
| **Socket.io** | Real-time events (chat, scores, notifications, scoring) |
| **Passport.js** | Authentication (JWT + Google OAuth) |
| **JSON Database** | File-based in-memory DB with Prisma-compatible API |
| **Redis** | Caching, sessions, pub-sub, BullMQ backend |
| **BullMQ** | Background job queue (prediction scoring, leaderboard resets) |
| **Stripe** | Subscription billing (checkout, webhooks, portal) |
| **Anthropic Claude** | AI prediction hints via Claude Haiku |
| **bcryptjs** | Password hashing (12 rounds) |
| **JWT** | Access + refresh token auth |
| **Pino** | Structured JSON logging with redaction |
| **Sentry** | Error monitoring and performance tracing |
| **Zod** | Runtime request validation with TypeScript inference |
| **Vitest** | Test runner with 71+ tests (scoring, auth, predictions) |

### Services
- **Sentry** — Error monitoring (backend + frontend)
- **Stripe** — Pro subscription billing
- **Anthropic Claude** — AI prediction hints
- **Tenor** — GIF search for chat

### Deployment
- Frontend: Vercel / Netlify
- Backend: Railway / Render
- CDN: Cloudflare
- Monitoring: Sentry

---

## 📂 Project Structure

```
Match Mind/
├── README.md
├── prompt.txt                        # Full specification document
├── start.bat                         # 🖱️ Double-click to launch both servers
├── package.json                      # Root scripts (dev, setup, install:all)
│
├── frontend/                         # React + Vite SPA
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx                  # Entry point with providers
│       ├── App.jsx                   # Root component with routing (36+ routes)
│       ├── index.css                 # Design system tokens & styles
│       ├── lib/                      # Shared utilities
│       │   └── animation/
│       │       ├── variants.js       # 18 Framer Motion variant sets
│       │       └── gsap.js           # 10 GSAP utility functions
│       ├── store/
│       │   └── useStore.js           # Zustand global store
│       ├── components/
│       │   ├── three/
│       │   │   ├── HeroScene.jsx     # WebGL detection + lazy loading
│       │   │   └── HeroSceneImpl.jsx # 200-particle 3D field
│       │   ├── Navbar.jsx            # Top navigation
│       │   ├── BottomNav.jsx         # Mobile bottom navigation
│       │   ├── LiveTicker.jsx        # Scrolling live scores ticker
│       │   ├── ErrorBoundary.jsx     # Error boundary for lazy routes
│       │   ├── MatchCard.jsx         # Match preview card
│       │   ├── ScoreDisplay.jsx      # Animated score display
│       │   ├── SportBadge.jsx        # Sport color-coded badge
│       │   ├── LiveBadge.jsx         # Pulsing LIVE indicator
│       │   ├── ChatMessage.jsx       # Enhanced: reactions, GIFs, pin, report, tiers
│       │   ├── PredictionCard.jsx    # Prediction result card
│       │   ├── LeaderboardRow.jsx    # Leaderboard table row
│       │   ├── PointsToast.jsx       # Points earned overlay
│       │   ├── ProGate.jsx           # Pro content blur + upgrade overlay
│       │   ├── AchievementBadge.jsx  # Achievement badge display
│       │   ├── UserAvatar.jsx        # User avatar with tier border
│       │   ├── SkeletonCard.jsx      # Loading skeleton
│       │   ├── EmptyState.jsx        # Empty state with illustration
│       │   ├── NotificationBell.jsx  # Unread notification count
│       │   └── Tooltip.jsx           # Radix tooltip wrapper
│       └── pages/
│           ├── LandingPage.jsx        # / — Three.js hero, GSAP stats
│           ├── LoginPage.jsx          # /login — Framer Motion, forgot password
│           ├── SignupPage.jsx         # /signup — Password strength, username check
│           ├── ForgotPasswordPage.jsx # /forgot-password
│           ├── ResetPasswordPage.jsx  # /reset-password
│           ├── VerifyEmailPage.jsx    # /verify-email
│           ├── OnboardingPage.jsx     # /onboarding — 4-step wizard
│           ├── PricingPage.jsx        # /pricing — Monthly/annual, Stripe checkout
│           ├── FeedPage.jsx           # /feed
│           ├── LiveHubPage.jsx        # /live
│           ├── MatchRoomPage.jsx      # /live/:matchId — ⭐ 3-panel: stats+chat+preds
│           ├── ScoresPage.jsx         # /scores
│           ├── PredictionsPage.jsx    # /predictions
│           ├── MakePredictionPage.jsx # /predictions/new/:matchId
│           ├── LeaderboardPage.jsx    # /leaderboard — Podium + table
│           ├── LeaguesPage.jsx        # /leagues
│           ├── CreateLeaguePage.jsx   # /leagues/create
│           ├── LeagueRoomPage.jsx     # /leagues/:leagueId — 4-tab: standings/chat/preds/about
│           ├── SquadsPage.jsx         # /squads
│           ├── SquadPage.jsx          # /squads/:squadId — 4-tab: rankings/chat/activity/members
│           ├── ExplorePage.jsx        # /explore
│           ├── HighlightsPage.jsx     # /highlights
│           ├── ProfilePage.jsx        # /profile/:userId — Cover, stats, tabs
│           ├── MyProfilePage.jsx      # /profile/me — Progress, achievements
│           ├── SettingsPage.jsx       # /profile/me/settings — Pro management, billing
│           ├── NotificationsPage.jsx  # /profile/me/notifications — Filter tabs
│           ├── AchievementsPage.jsx   # /achievements — Rarity filters, 12 badges
│           ├── ActivityPage.jsx       # /activity — My/Following tabs
│           ├── StandingsPage.jsx      # /standings/:sport
│           ├── TeamPage.jsx           # /teams/:teamId
│           ├── PlayerPage.jsx         # /players/:playerId
│           ├── SearchPage.jsx         # /search
│           ├── AdminPage.jsx          # /admin — KPI cards, charts, user/reports tables
│           ├── AboutPage.jsx          # /about — Mission, GSAP stats
│           ├── FAQPage.jsx            # /faq — Searchable accordion
│           └── NotFoundPage.jsx       # * — Animated 404
│
└── backend/                          # Node.js + Express 5 API (TypeScript)
    ├── package.json
    ├── tsconfig.json                 # TypeScript configuration
    ├── vitest.config.js              # Test runner configuration
    ├── instrument.ts                 # Sentry instrumentation (loaded first)
    ├── .env.example                  # Environment variable template
    └── src/
        ├── index.ts                  # Server entry point + BullMQ init + scheduler
        ├── config/
        │   ├── constants.ts          # App-wide constants (scoring, rate limits, pagination)
        │   ├── passport.ts           # Passport strategies (JWT + Google OAuth)
        │   └── schemas.ts            # Zod validation schemas (14 schemas, typed)
        ├── data/                     # JSON database files (25 model files)
        │   ├── user.json
        │   ├── match.json
        │   ├── prediction.json
        │   └── ...                   # 22 additional model JSON files
        ├── lib/
        │   └── jsonDb.ts             # JSON Database adapter (Prisma-compatible API)
        ├── repositories/
        │   ├── index.ts              # Prisma-style repository implementations
        │   └── types.ts              # Repository interfaces & domain types
        ├── middleware/
        │   ├── auth.ts               # JWT auth (Bearer header + cookie fallback)
        │   ├── validate.ts           # Zod request validation middleware
        │   ├── rateLimiter.ts         # Rate limiting (auth, prediction, AI, global tiers)
        │   ├── errorHandler.ts       # Centralized error handler (JSON DB, JWT, AppError)
        │   ├── asyncHandler.ts       # Async route wrapper (eliminates try/catch)
        │   └── requireAdmin.ts       # Admin role guard middleware
        ├── socket/
        │   └── index.ts              # Socket.io event handlers (auth, chat, reactions, rooms)
        ├── services/
        │   ├── scoring.ts            # Scoring engine: calc, streaks, tiers, snapshots
        │   ├── authService.ts        # Auth business logic (signup, login, refresh, reset)
        │   ├── adminService.ts       # Admin dashboard stats & logging
        │   ├── tokenService.ts       # JWT generation + cookie helpers
        │   ├── leaderboardMapper.ts  # User→LeaderboardEntry transformation
        │   └── simulation/
        │       ├── simulationEngine.ts  # Match simulation (Poisson, xG, PRNG)
        │       └── simulationRunner.ts  # Orchestrates sim + DB + Socket.IO events
        ├── workers/
        │   ├── queue.ts              # BullMQ queue definitions (3 queues)
        │   └── scoringWorker.ts      # BullMQ workers + graceful shutdown
        ├── workflows/
        │   └── finalizeMatch.ts      # Match finalization (lock → score → rank → emit)
        ├── utils/
        │   ├── logger.ts             # Pino structured logger with redaction
        │   └── AppError.ts           # Custom error class (code, statusCode, isAppError)
        └── routes/
            ├── auth.ts               # Signup, login, logout, OAuth, refresh, forgot/reset
            ├── matches.ts            # Matches, stats, lineups, H2H, finish match
            ├── predictions.ts        # Create, list, score, bulk scoring trigger
            ├── leaderboard.ts        # Global, weekly, history, sport, friends
            ├── users.ts              # Profile, follow, notifications, check-username
            ├── leagues.ts            # CRUD private leagues
            ├── squads.ts             # CRUD squads
            ├── highlights.ts         # Video highlights
            ├── ai.ts                 # AI prediction hints (Anthropic + heuristic)
            ├── messages.ts           # DM conversations & messaging
            ├── players.ts            # Player profiles & search
            ├── search.ts             # Global search (users, teams, players, matches)
            ├── simulation.ts         # Match simulation triggers
            ├── stripe.ts             # Checkout, webhook, portal, status
            ├── teams.ts              # Team profiles with standings & form
            └── admin.ts              # Dashboard stats, user/matches/reports CRUD
```

---

## 🎨 Design System

### "Dark Stadium" Theme
MatchMind uses a dark, stadium-atmosphere color palette with green accent as the primary CTA color and gradient accents for Pro features.

| Token | Value | Usage |
|-------|-------|-------|
| `--mm-bg-primary` | `#0A0B0F` | Deep pitch black background |
| `--mm-bg-secondary` | `#13151C` | Card backgrounds |
| `--mm-bg-tertiary` | `#1A1D28` | Input fields, hover states |
| `--mm-accent-green` | `#00E676` | Primary CTAs, live indicators |
| `--mm-accent-amber` | `#FFB300` | Predictions, points, warnings |
| `--mm-accent-red` | `#FF3D57` | Alerts, danger, errors |
| `--mm-accent-blue` | `#4FC3F7` | Info, links, stats |
| `--mm-accent-purple` | `#BB86FC` | Pro features, achievements |
| `--gradient-pro` | `linear-gradient(135deg, #BB86FC, #00E676)` | Pro badge, upgrade CTAs |
| `--border-pro` | `#BB86FC` | Pro subscriber borders |
| `--shadow-glow-purple` | `0 0 20px rgba(187,134,252,0.3)` | Pro hover glow |
| `--shadow-glow-green` | `0 0 15px rgba(0,230,118,0.3)` | Success/active glow |

### Typography
- **Display:** Bebas Neue (72px/48px for headlines)
- **Body:** DM Sans (14px–16px for content)
- **Monospace:** JetBrains Mono (13px for data/numbers)

### Keyframes
- `legend-glow` — Pulsing tier badge
- `shimmer` — Loading skeleton animation
- `fade-up` / `slide-in` — Entry animations

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| POST | `/api/auth/logout` | ✓ | Sign out |
| POST | `/api/auth/refresh` | — | Refresh JWT token |
| GET | `/api/auth/google` | — | Google OAuth redirect |
| POST | `/api/auth/forgot-password` | — | Request password reset |
| POST | `/api/auth/reset-password` | — | Reset password with token |
| POST | `/api/auth/verify-email` | — | Verify email with token |
| POST | `/api/auth/resend-verification` | — | Resend verification email |

### Matches
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/matches` | — | List matches (filters: sport, date, status) |
| GET | `/api/matches/:id` | — | Match details |
| POST | `/api/matches/:id/finish` | Admin | Finish match + trigger scoring |
| GET | `/api/matches/:id/stats` | — | Match statistics |
| GET | `/api/matches/:id/lineups` | — | Starting lineups |
| GET | `/api/matches/:id/h2h` | — | Head-to-head history |
| GET | `/api/matches/:id/timeline` | — | Match events |

### Predictions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/predictions` | ✓ | Make a prediction |
| GET | `/api/predictions/mine` | ✓ | My predictions |
| GET | `/api/predictions/match/:matchId` | — | All predictions for a match |
| POST | `/api/predictions/score/:matchId` | ✓ | Manual scoring trigger |
| PATCH | `/api/predictions/:id/score` | — | Score a prediction (internal) |

### Leaderboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leaderboard/global` | — | Global all-time leaderboard |
| GET | `/api/leaderboard/weekly` | — | Weekly leaderboard (by weeklyPoints) |
| GET | `/api/leaderboard/sport/:sport` | — | Per-sport leaderboard |
| GET | `/api/leaderboard/friends` | ✓ | Friends leaderboard |
| GET | `/api/leaderboard/history/:period` | — | Archived WEEKLY/MONTHLY snapshots |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/predict/:matchId` | ✓ optional | AI prediction hint (Pro-gated) |
| POST | `/api/ai/summary/:matchId` | ✓ | AI match summary |

### Stripe / Pro
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/stripe/create-checkout` | ✓ | Create Stripe checkout session |
| POST | `/api/stripe/webhook` | — | Stripe webhook (subscription lifecycle) |
| POST | `/api/stripe/create-portal-session` | ✓ | Billing portal session |
| GET | `/api/stripe/status` | ✓ | Current user's subscription status |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard metrics |
| GET | `/api/admin/users` | Admin | List users (paginated, search) |
| GET | `/api/admin/users/:id` | Admin | User details with counts |
| PATCH | `/api/admin/users/:id` | Admin | Update user role/tier |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| POST | `/api/admin/users/:id/toggle-pro` | Admin | Toggle Pro status |
| GET | `/api/admin/matches` | Admin | List matches |
| PATCH | `/api/admin/matches/:id` | Admin | Update match score/status |
| GET | `/api/admin/reports` | Admin | List reports |
| PATCH | `/api/admin/reports/:id` | Admin | Resolve/dismiss report |
| GET | `/api/admin/settings` | Admin | Feature flags |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/:id` | — | User profile |
| PATCH | `/api/users/me` | ✓ | Update profile |
| POST | `/api/users/:id/follow` | ✓ | Follow user |
| DELETE | `/api/users/:id/follow` | ✓ | Unfollow user |
| GET | `/api/users/me/notifications` | ✓ | Get notifications |
| PATCH | `/api/users/me/notifications/read` | ✓ | Mark all read |
| GET | `/api/users/check-username` | — | Username availability check |

---

## 📡 WebSocket Events

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `SCORE_UPDATE` | `{ matchId, homeScore, awayScore, minute }` | Live score change |
| `GOAL_EVENT` | `{ matchId, team, scorer, minute }` | Goal alert |
| `CARD_EVENT` | `{ matchId, team, player, type, minute }` | Yellow/red card |
| `MATCH_STATUS` | `{ matchId, status }` | Match status change (HT, FT, etc.) |
| `MATCH_FINISHED` | `{ matchId, homeScore, awayScore }` | Match ended, scoring triggered |
| `CHAT_MESSAGE` | `{ roomId, user, text, timestamp }` | New chat message |
| `REACTION_UPDATE` | `{ roomId, emoji, userId }` | Emoji reaction update |
| `VIEWER_COUNT` | `{ matchId, count }` | Live viewer count |
| `LEADERBOARD_UPD` | `{ userId, newRank, pointsDelta }` | Leaderboard rank change |
| `PREDICTION_SCORED` | `{ matchId, pointsEarned, totalPoints, streakCurrent }` | Prediction result notification |
| `TIER_UPGRADE` | `{ tier, points }` | User tier upgraded |
| `PREDICTION_SCORE` | `{ predictionId, points, message }` | Prediction result notification |
| `NOTIFICATION` | `{ userId, type, payload }` | Push/in-app notification |

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `JOIN_ROOM` | `{ roomId }` | Join match/chat room |
| `LEAVE_ROOM` | `{ roomId }` | Leave room |
| `SEND_MESSAGE` | `{ roomId, text }` | Send chat message |
| `SEND_REACTION` | `{ roomId, emoji }` | Send reaction |

---

## 💾 Database (JSON File-Based)

The production database is a **file-based JSON database** — no PostgreSQL, MySQL, or any database server required. Data is stored as individual JSON files in `backend/src/data/`, loaded into an in-memory store at startup, and persisted atomically after every write.

### Models (25 files)
| Category | Models |
|----------|--------|
| **Tournaments** | `tournaments`, `teams`, `players`, `venues`, `fixtures`, `groups`, `qualification`, `history` |
| **Auction** | `rooms`, `roomMember`, `auctionState`, `bids`, `rosters`, `fantasyPointsLedger` |
| **Social** | `follow`, `notification`, `chatMessage`, `report` |
| **Commerce** | `subscription`, `session`, `starredPlayer` |
| **Game** | `playerMatchStat` |
| **Admin** | `adminLog`, `seed` |

### Architecture — Proxy Intercept Flow

```mermaid
graph TB
    subgraph Application["Application Code"]
        A1["Route Handler"]
        A2["Service / Socket"]
        A3["Repository Layer"]
    end

    subgraph Proxy["JSON DB Proxy (createJsonDatabase)"]
        B1["Proxy.get(target, 'user')"]
        B2["matches model in target.models?"]
        B3["Return ModelHandler"]
        B4["Fall through to target method
($connect, $disconnect, initialize)"]
    end

    subgraph Handler["ModelHandler (per collection)"]
        C1["findUnique / findMany
findFirst / count"]
        C2["create / createMany
update / updateMany / upsert"]
        C3["delete / deleteMany"]
        C4["include / select
relation resolution"]
    end

    subgraph Memory["In-Memory Store"]
        D1["this.data['user']
(Record<string, any[]>)"]
        D2["this.data['room']
(Record<string, any[]>)"]
        D3["... 20+ collections"]
    end

    subgraph Persistence["Atomic Persistence"]
        E1["temp-file write
(name.json.tmp)"]
        E2["fs.renameSync
temp → name.json"]
        E3["Per-collection Mutex
(async-mutex)"]
    end

    subgraph Disk["JSON Files on Disk"]
        F1["backend/src/data/user.json"]
        F2["backend/src/data/room.json"]
        F3["...model.json"]
        F4[".backups/\n(timestamped snapshots)"]
    end

    %% Connections
    A1 -->|prisma.user.findMany| B1
    A2 -->|prisma.room.create| B1
    A3 -->|prisma.bid.findUnique| B1

    B1 -->|model found| B3
    B1 -->|$ method| B4

    B3 -->|delegate call| Handler

    C1 -->|read| D1
    C2 -->|write then persist| D1
    C3 -->|delete then persist| D1
    C4 -->|cross-collection join| D2

    D1 -->|_saveModel()| Persistence
    D2 -->|_saveModel()| Persistence

    E3 -->|serializes| E1
    E1 -->|atomic rename| E2
    E2 -->|written to| F1

    E3 -->|shutdown backup| F4

    %% Styling
    classDef app fill:#1a1d28,stroke:#4fc3f7,color:#fff
    classDef proxy fill:#1a1d28,stroke:#bb86fc,color:#fff
    classDef handler fill:#1a1d28,stroke:#00e676,color:#fff
    classDef memory fill:#1a1d28,stroke:#ffb300,color:#fff
    classDef persist fill:#1a1d28,stroke:#ff3d57,color:#fff
    classDef disk fill:#1a1d28,stroke:#8e44ff,color:#fff

    class A1,A2,A3 app
    class B1,B2,B3,B4 proxy
    class C1,C2,C3,C4 handler
    class D1,D2,D3 memory
    class E1,E2,E3 persist
    class F1,F2,F3,F4 disk

    %% Labels
    B1 -.->|"if prop in target.models"| B2
    B2 -.->|"yes"| B3
    B2 -.->|"no"| B4
```

**Flow:** Application code calls `prisma.model.method()` → the Proxy intercepts the model name → returns a `ModelHandler` → the handler reads/writes an in-memory array → writes are persisted atomically via temp-file + rename, serialized per-collection via `async-mutex`. On shutdown, all collections are flushed and a timestamped backup is created in `.backups/`.

### Key Features
- **Prisma-compatible API** — Uses the same `findUnique`, `findMany`, `create`, `update`, `delete`, `count`, `upsert` interface. All route handlers and services call `prisma.model.method()` — the JSON DB Proxy intercepts and handles these calls transparently.
- **Relation resolution** — `include`/`select` work identically to Prisma (hasMany, belongsTo) via an in-memory relation map (see `getModelRelationsAll()` in `jsonDb.ts`)
- **Compound unique keys** — Supports composite keys like `roomId_userId`
- **Query operators** — `contains`, `mode: 'insensitive'`, `gte`, `lte`, `in`, `not`, `OR`, `AND`, `NOT`
- **Atomic increments** — `{ increment: x }` operator for Prisma-style numeric updates
- **Atomic writes** — Every file save uses temp-file + `fs.renameSync()` to prevent partial-write corruption
- **Per-collection mutexes** — `async-mutex` serializes concurrent writes to the same collection
- **Auto-backups** — Timestamped snapshots created on clean shutdown via `$disconnect()`
- **Seed data** — 25 JSON files pre-loaded with thousands of records for development and testing

---

## 📊 Scoring System

### Prediction Points
| Accuracy | Points |
|----------|--------|
| Exact score (both goals match) | **55** (50 + 5 base) |
| Correct result + same goal difference | **40** (35 + 5 base) |
| Correct result (win/draw) only | **30** (25 + 5 base) |
| Correct BTTS bonus | **+10** |
| Correct Over/Under bonus | **+10** |
| Wrong result, no bonuses | **5** (participation) |
| Void prediction | **0** |

### Scoring Flow
1. Match finishes → admin calls `POST /api/matches/:id/finish`
2. All `PENDING` predictions are locked → `LOCKED`
3. BullMQ queue `score-predictions` processes the match
4. Each prediction scored via `calculatePredictionPoints()`
5. User stats updated: `totalPoints`, `weeklyPoints`, accuracy, streak
6. Tier progression checked (auto-upgrade if threshold met)
7. Global ranks recalculated
8. Socket events emitted: `PREDICTION_SCORED`, `TIER_UPGRADE`

### Tier System
| Tier | Points Required |
|------|----------------|
| 🥉 Bronze | 0+ |
| 🥈 Silver | 500+ |
| 🥇 Gold | 1,500+ |
| 💎 Platinum | 3,500+ |
| 💠 Diamond | 7,000+ |
| 👑 Legend | 12,000+ |

### Streak Tracking
- **Current streak**: increments for each correct result prediction
- **Best streak**: highest ever achieved (persisted)
- Streak resets to 0 on any incorrect result

### Leaderboard Resets
- **Weekly**: `weeklyPoints` reset to 0 every Monday 00:00 UTC (snapshot archived first)
- **Monthly**: Leaderboard snapshot archived on 1st of each month
- **All-time**: `totalPoints` never resets

---

## 🌟 Pro Features

MatchMind Pro unlocks via Stripe subscription ($4.99/month or $39.99/year):

| Feature | Free | Pro |
|---------|------|-----|
| Score predictions | Unlimited | Unlimited |
| Live match rooms & chat | ✓ | ✓ |
| Global leaderboard | ✓ | ✓ |
| Private leagues | Up to 3 | Unlimited |
| Basic profile | ✓ | ✓ |
| 🤖 AI Prediction Insights | — | ✓ |
| 📊 Advanced analytics | — | ✓ |
| 🚫 Ad-free experience | — | ✓ |
| 📥 Export predictions (CSV/PDF) | — | ✓ |
| ✨ Animated Pro badges | — | ✓ |
| 🎨 Custom profile themes | — | ✓ |
| 🔔 Priority notifications | — | ✓ |

Pro content is gated via the `<ProGate>` component, which blurs content with a gradient overlay and upgrade CTA for free users.

---

## 🤖 AI Prediction System

- **Endpoint**: `POST /api/ai/predict/:matchId`
- **Provider**: Anthropic Claude 3 Haiku (when `ANTHROPIC_API_KEY` is set)
- **Fallback**: Smart heuristics based on home advantage and random variance
- **Gating**: Pro subscribers only via `checkProStatus()` middleware
- **Response**: `{ homeGoals, awayGoals, confidence (50-95), reasoning }`
- **Match Summaries**: `POST /api/ai/summary/:matchId` — generates post-match narrative

---

## 🏃 Background Jobs (BullMQ)

| Queue | Trigger | Concurrency | Description |
|-------|---------|-------------|-------------|
| `score-predictions` | Match finish / manual | 5 | Score all predictions for a match |
| `reset-leaderboards` | Scheduled (weekly/monthly) | 2 | Snapshot + reset leaderboard |
| `recalculate-ranks` | After scoring | 1 | Recalculate global ranks |

**Scheduler**: Auto-schedules weekly (Monday 00:00 UTC) and monthly (1st 00:00 UTC) resets.

**Fallback**: If Redis is unavailable, the server logs a warning and falls back to `mode=direct` synchronous scoring.

---

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Redis (optional — for BullMQ, falls back to direct scoring)

### Quick Start (Windows)

```bash
# 1. Install dependencies
npm run install:all

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — at minimum set JWT_SECRET and JWT_REFRESH_SECRET

# 3. Start both servers
npm run dev
```

The backend uses a **file-based JSON database** — no PostgreSQL or other database server required.
On startup it auto-loads all data from `backend/src/data/*.json` (25 JSON files, thousands of records).
See the Database section below for the full model list.

### Demo Account
After the database initializes (it loads pre-seeded JSON files):
- **Email:** `demo@matchmind.gg`
- **Password:** `password123`

---

## 📱 Pages Overview (36 Routes)

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Three.js hero, GSAP stats, feature sections |
| Login | `/login` | Framer Motion, forgot password link |
| Signup | `/signup` | Password strength meter, username check |
| Forgot Password | `/forgot-password` | Email input, cooldown timer |
| Reset Password | `/reset-password` | Token validation, strength meter |
| Verify Email | `/verify-email` | Token verification, resend cooldown |
| Onboarding | `/onboarding` | 4-step: sports → teams → predictors → profile |
| Pricing | `/pricing` | Monthly/annual toggle, Stripe checkout, FAQ |
| Feed | `/feed` | Personalized home for logged-in users |
| Live Hub | `/live` | All live/upcoming/finished matches with filters |
| Match Room ⭐ | `/live/:matchId` | 3-panel: stats + chat + predictions, reactions |
| Scores | `/scores` | Fixture list by competition |
| Predictions | `/predictions` | Dashboard with stats and history |
| New Prediction | `/predictions/new/:matchId` | Score widget + AI hint + markets |
| Leaderboard | `/leaderboard` | Global podium + filterable table |
| Leagues | `/leagues` | Private league hub |
| Create League | `/leagues/create` | League creation form |
| League Room | `/leagues/:leagueId` | 4-tab: standings, chat, predictions, about |
| Squads | `/squads` | Friend group hub |
| Squad | `/squads/:squadId` | 4-tab: rankings, chat, activity, members |
| Explore | `/explore` | Trending matches, sports, competitions |
| Highlights | `/highlights` | Video highlights grid |
| Achievements | `/achievements` | Rarity filters, 12 badges, progress tracking |
| Activity | `/activity` | My Activity + Following's Activity |
| Profile | `/profile/:userId` | Cover banner, stats, 4 tabs |
| My Profile | `/profile/me` | Progress, locked achievements, quick links |
| Settings | `/profile/me/settings` | Pro mgmt, billing portal, account sections |
| Notifications | `/profile/me/notifications` | Filter tabs, mark read |
| Standings | `/standings/:sport` | League standings table |
| Team | `/teams/:teamId` | Team fixtures + fans |
| Player | `/players/:playerId` | Player stats |
| Search | `/search` | Global search |
| Admin | `/admin` | KPI cards, charts, user/matches/reports tables |
| About | `/about` | Mission, GSAP count-up, team grid |
| FAQ | `/faq` | 6-category searchable accordion |
| 404 | `*` | Animated 404 with sport illustration |

---

## 🧪 Phase Implementation Status

### Phase 1 — Foundations ✅ (Complete)
- Design system: 25+ CSS tokens, animation keyframes
- Animation system: 18 Framer Motion variants, 10 GSAP utilities
- 3D Hero Scene: Three.js particle field with WebGL detection
- Pages: LandingPage, LoginPage, SignupPage, OnboardingPage
- Auth pages: ForgotPassword, ResetPassword, VerifyEmail
- Static pages: About, FAQ, NotFound
- Backend: forgot/reset password, verify email, check-username

### Phase 2 — Social Features ✅ (Complete)
- ChatMessage: reactions, GIFs, pin/report, tier badges
- LeagueRoomPage: 4-tab (standings, chat, predictions, about)
- SquadPage: 4-tab (rankings, chat, activity, members)
- NotificationsPage: filter tabs, mark read, empty states
- ProfilePage: cover banner, stats row, achievement tabs
- MyProfilePage: progress, achievements, activity timeline
- AchievementsPage: rarity filters, 12 badges
- ActivityPage: My/Following activity feeds

### Phase 3 — AI & Pro ✅ (Complete)
- ProGate: blur overlay component
- PricingPage: monthly/annual toggle, Stripe checkout
- AI Hints: Anthropic Claude integration + heuristic fallback
- Stripe: full subscription flow (checkout, webhook, portal)
- Admin Dashboard: 6 KPI cards, Recharts charts, tables
- Admin API: users, matches, reports CRUD
- SettingsPage: Pro management with billing portal
- Auth: cookie-based auth for fetch() calls

### Phase 4 — Scoring Engine ✅ (Complete)
- Core scoring: tiered points (55/40/30/10/5), streaks, tiers
- BullMQ: 3 queues with workers, error handling, fallback
- Match finish endpoint (admin-gated, queue or direct)
- Weekly/monthly leaderboard resets with snapshots
- Scheduler: auto-schedules resets, re-schedules after restart
- Endpoints: finish match, score predictions, weekly leaderboard
- LeaderboardSnapshot + ScoringLog database models

### Phase 5 — TypeScript & Infrastructure ✅ (Complete)
- **Full TypeScript migration**: All 45+ backend files converted from JavaScript to TypeScript
- **JSON Database**: File-based in-memory DB — the permanent production database with Prisma-compatible API
- **Repository pattern**: Type-safe repository interfaces abstracted over the JSON DB backend
- **Structured logging**: Pino with event-based logging and sensitive data redaction
- **Error monitoring**: Sentry on both backend and frontend for crash/performance tracking
- **Zod validation**: Runtime request validation with TypeScript type inference
- **Test suite**: 194 tests (vitest) across 9 test files — unit, integration, and e2e coverage
- **Type safety**: TypeScript 6 across 100% of backend and frontend with strict mode enabled

---

## 🔧 Environment Variables

```env
# Server
PORT=4000
BACKEND_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"
LOG_LEVEL="debug"               # pino log level (debug, info, warn, error)

# Database
DATABASE_URL="json://local"      # JSON file-based DB — no PostgreSQL needed
REDIS_URL="redis://localhost:6379"  # Optional — for BullMQ queues

# Auth
JWT_SECRET="your-64-char-secret"
JWT_REFRESH_SECRET="another-64-char-secret"
JWT_RESET_SECRET="your-reset-secret"
GOOGLE_CLIENT_ID="your-client-id"     # Optional
GOOGLE_CLIENT_SECRET="your-client-secret"  # Optional

# Monitoring
SENTRY_DSN="your-sentry-dsn"      # Optional — error/performance monitoring

# AI
ANTHROPIC_API_KEY="your-anthropic-key"  # Optional — Claude prediction hints

# Pro / Stripe
STRIPE_SECRET_KEY="sk_test_..."    # Optional
STRIPE_WEBHOOK_SECRET="whsec_..."  # Optional
STRIPE_PRICE_MONTHLY="price_monthly_id"  # Optional
STRIPE_PRICE_ANNUAL="price_annual_id"    # Optional

# Features
TENOR_API_KEY="your-tenor-key"    # Optional — GIF search in chat
```

---

## 🧪 Testing

### Test Suite (194 tests across 9 files)
| File | What it tests | Tests |
|------|---------------|-------|
| `src/services/scoring.test.ts` | Points calculation, streaks, tier progression, constants | 47 |
| `src/routes/auth.test.ts` | Signup, login, refresh, forgot/reset password | 14 |
| `src/routes/rooms.test.ts` | Room CRUD, invite codes, member management | 5 |
| `src/e2e/room-lifecycle.test.ts` | Full room lifecycle: create → join → draft → complete | 7 |
| `src/e2e/auction-lifecycle.test.ts` | Full auction lifecycle: start → bid → sell → finish | 5 |
| `src/services/auctionEngine.test.ts` | Bid validation, anti-snipe, concurrency, timer expiry | 18 |
| `src/lib/jsonDb.atomicWrite.test.ts` | Atomic persistence, CRUD integrity, error handling | 25 |
| `src/services/leaderboardService.test.ts` | Room leaderboard computation | 3 |
| More... | Additional unit & integration tests | 60+ |

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Approach
- **vitest** with supertest for HTTP integration testing
- Each test uses an isolated JSON-DB instance in a temp directory — no shared mutable state between tests
- External dependencies are mocked (AuthService, JWT, Stripe)
- No real database server, Redis, or external service required

## 🛠️ Troubleshooting

### Redis Not Running
BullMQ requires Redis for background job queues. If Redis is unavailable:
- The server starts with a warning: "BullMQ workers not available"
- Scoring falls back to `mode=direct` (synchronous)
- Leaderboard resets will not be scheduled

### Windows npm ENOTEMPTY Errors
If `npm install` fails with `ENOTEMPTY` errors when cleaning `node_modules`, delete the folder manually via File Explorer and re-run `npm install`.

### Build Issues
- **Chunk size warnings**: Some vendor chunks exceed 500 kB — consider code-splitting or adjust `chunkSizeWarningLimit` in `vite.config.js`.

---

## 📄 License

Built for demonstration and learning purposes.

---

*Document version: 4.0 | Project: MatchMind | TypeScript + JSON DB + Socket.IO + Vitest | Generated: July 2026*
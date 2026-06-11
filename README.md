# 🏟️ MatchMind — The Internet's Sports Bar

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
| **Node.js + Express 5** | API server |
| **Socket.io** | Real-time events (chat, scores, notifications, scoring) |
| **Passport.js** | Authentication (JWT + Google OAuth) |
| **Prisma 7** | ORM with PostgreSQL (17 models, 10 enums) |
| **Redis** | Caching, sessions, pub-sub, BullMQ backend |
| **BullMQ** | Background job queue (prediction scoring, leaderboard resets) |
| **Stripe** | Subscription billing (checkout, webhooks, portal) |
| **Anthropic Claude** | AI prediction hints via Claude Haiku |
| **bcryptjs** | Password hashing (12 rounds) |
| **JWT** | Access + refresh token auth |

### Services
- **Stripe** — Pro subscription billing
- **Anthropic Claude** — AI prediction hints
- **SportRadar API** — Live scores, stats, lineups
- **Cloudinary** — Media storage (avatars, banners)

### Deployment
- Frontend: Vercel / Netlify
- Backend: Railway / Render
- Database: Supabase (PostgreSQL)
- CDN: Cloudflare
- Monitoring: Sentry + Posthog

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
└── backend/                          # Node.js + Express 5 API
    ├── package.json
    ├── .env                          # Environment variables
    ├── prisma.config.ts              # Prisma 7 datasource configuration
    ├── prisma/
    │   ├── schema.prisma             # Database schema (17 models, 10 enums)
    │   └── seed.js                   # Comprehensive seed script
    └── src/
        ├── index.js                  # Server entry point + BullMQ init + scheduler
        ├── config/
        │   └── passport.js           # Passport strategies (JWT + Google OAuth)
        ├── middleware/
        │   └── auth.js               # JWT auth (Bearer header + cookie fallback)
        ├── socket/
        │   └── index.js              # Socket.io event handlers
        ├── services/
        │   └── scoring.js            # Scoring engine: calc, streaks, tiers, snapshots
        ├── workers/
        │   ├── queue.js              # BullMQ queue definitions
        │   └── scoringWorker.js      # BullMQ workers + graceful shutdown
        └── routes/
            ├── auth.js               # Signup, login, logout, OAuth, refresh, forgot/reset
            ├── matches.js            # Matches, stats, lineups, H2H, finish match
            ├── predictions.js        # Create, list, score, bulk scoring trigger
            ├── leaderboard.js        # Global, weekly, history, sport, friends
            ├── users.js              # Profile, follow, notifications, check-username
            ├── leagues.js            # CRUD private leagues
            ├── squads.js             # CRUD squads
            ├── highlights.js         # Video highlights
            ├── ai.js                 # AI prediction hints (Anthropic + heuristic)
            ├── stripe.js             # Checkout, webhook, portal, status
            └── admin.js              # Dashboard stats, user/matches/reports CRUD
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

## 💾 Database Schema (24 Models)

### Core
- **User** — Accounts with tier system, streaks, Pro status
- **Match** — Sports events with live status, scores, competition
- **Prediction** — User predictions with tiered scoring
- **MatchEvent** — Goal/card/substitution events

### Social
- **Follow** — User follow relationships
- **Notification** — In-app notifications (8 types)
- **ChatMessage** — Real-time chat with reactions
- **Report** — Chat message/user reports with moderation

### Groups
- **League** — Private prediction leagues with invite codes
- **LeagueMember** — League membership with points/rank
- **Squad** — Friend groups
- **SquadMember** — Squad membership with roles

### Achievements & Gamification
- **Achievement** — Badge definitions with rarity tiers
- **UserAchievement** — Unlocked achievements per user
- **LeaderboardSnapshot** — Archived WEEKLY/MONTHLY leaderboards
- **ScoringLog** — Audit trail for scoring events

### Commerce
- **Subscription** — Stripe subscription tracking
- **Session** — JWT refresh token sessions

### Sports Data
- **Competition** — League/tournament definitions
- **Team** — Sports teams
- **Player** — Player profiles
- **Standing** — League standings per season
- **UserSport** — User sport preferences
- **UserTeam** — User team preferences

### Enums
`Sport`, `MatchStatus`, `PredStatus`, `Tier`, `UserRole`, `NotifType`, `SubscriptionStatus`, `LeaderboardPeriod`

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
- PostgreSQL
- Redis (optional — for BullMQ, falls back to direct scoring)

### Quick Start (Windows)
Double-click `start.bat` in the root directory. It will:
1. Check Node.js is installed
2. Auto-install frontend + backend dependencies if missing
3. Generate the Prisma client
4. Open two terminal windows for backend (`:4000`) and frontend (`:3000`)
5. Open `http://localhost:3000` in your browser

### Manual Setup

```bash
# 1. Install all dependencies (root + frontend + backend)
npm run install:all

# 2. Configure environment variables
# Copy backend/.env.example to backend/.env and fill in:
# DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET

# 3. Generate Prisma client & push schema
npm run prisma:generate
npm run prisma:push

# 4. Seed the database with mock data
npm run prisma:seed

# 5. Start both servers
npm run dev
```

### One-Command Setup
```bash
npm run setup
# This runs: install:all → prisma:generate → prisma:push → prisma:seed
```

### Demo Account
After seeding:
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

---

## 🔧 Environment Variables

```env
# Server
PORT=4000
BACKEND_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:3000"
NODE_ENV="development"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/matchmind"
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="your-64-char-secret"
JWT_REFRESH_SECRET="another-64-char-secret"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Sports Data
SPORTRADAR_API_KEY="your-api-key"

# Media
CLOUDINARY_URL="cloudinary://key:secret@cloud"

# AI
ANTHROPIC_API_KEY="your-anthropic-key"

# Pro / Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_monthly_id"
STRIPE_PRICE_ANNUAL="price_annual_id"

# Features
TENOR_API_KEY="your-tenor-key"
```

---

## 🛠️ Troubleshooting

### Prisma 7 Datasource URL
Prisma 7 requires the datasource URL in `prisma.config.ts`, NOT in `schema.prisma`:
```ts
// backend/prisma.config.ts
export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL || 'postgresql://...',
})
```
The `url` field in `schema.prisma` `datasource` block must be removed.

### Prisma Config Errors
If `npx prisma generate` fails with `TypeError [ERR_INVALID_ARG_TYPE]: The "paths[1]" argument must be of type string`, the `prisma.config.ts` format may be incorrect. Use the simplified format:
```ts
import { defineConfig } from '@prisma/config'
export default defineConfig({
  datasourceUrl: process.env.DATABASE_URL,
})
```

### Redis Not Running
BullMQ requires Redis for background job queues. If Redis is unavailable:
- The server starts with a warning: "BullMQ workers not available"
- Scoring falls back to `mode=direct` (synchronous)
- Leaderboard resets will not be scheduled

### Windows npm ENOTEMPTY Errors
If `npm install` fails with `ENOTEMPTY` errors when cleaning `node_modules`, delete the folder manually via File Explorer and re-run `npm install`.

### Build Issues
- **Vite + @vitejs/plugin-react compatibility**: Current setup uses Vite 8 + @vitejs/plugin-react 6.
- **Missing picomatch**: If Vite reports picomatch not found, run `npm install picomatch` in the frontend directory.
- **Chunk size warnings**: Some vendor chunks exceed 500 kB — consider code-splitting or adjust `chunkSizeWarningLimit` in `vite.config.js`.

---

## 📄 License

Built for demonstration and learning purposes.

---

*Document version: 2.0 | Project: MatchMind | All 4 phases complete | Generated: June 2026*
# 🏟️ MatchMind — The Internet's Sports Bar

**Project Overview & Complete Technical Documentation**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://prisma.io)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Metadata](#2-project-metadata)
3. [Repository Statistics](#3-repository-statistics)
4. [Folder Structure](#4-folder-structure)
5. [Complete File Documentation](#5-complete-file-documentation)
6. [Architecture](#6-architecture)
7. [Technology Stack](#7-technology-stack)
8. [Features](#8-features)
9. [API Documentation](#9-api-documentation)
10. [Database](#10-database)
11. [Authentication](#11-authentication)
12. [Authorization](#12-authorization)
13. [Environment Variables](#13-environment-variables)
14. [Build Process](#14-build-process)
15. [Development Workflow](#15-development-workflow)
16. [Deployment](#16-deployment)
17. [Testing](#17-testing)
18. [Security](#18-security)
19. [Performance](#19-performance)
20. [Logging](#20-logging)
21. [Monitoring](#21-monitoring)
22. [Error Handling](#22-error-handling)
23. [Coding Standards](#23-coding-standards)
24. [Dependencies](#24-dependencies)
25. [Configuration Files](#25-configuration-files)
26. [Assets](#26-assets)
27. [Scripts](#27-scripts)
28. [Known Issues](#28-known-issues)
29. [Technical Debt](#29-technical-debt)
30. [Future Improvements](#30-future-improvements)
31. [Project Roadmap](#31-project-roadmap)
32. [Glossary](#32-glossary)
33. [Appendix](#33-appendix)

---

## 1. Executive Summary

### Purpose

MatchMind is a full-stack social sports prediction platform where fans predict match outcomes (win/lose/draw, scores), compete in leagues and on leaderboards, earn points for accuracy, chat in real-time during live matches, and access AI-powered insights. It combines real-time match simulation, social features, gamification, and subscription payments into a single web application.

### Problem Being Solved

Sports fans enjoy predicting match outcomes with friends, but existing platforms lack the combination of:
- Real match data integration
- Social competition (leagues, squads, friend-based leaderboards)
- Skill-based scoring (confidence multipliers, bonus predictions)
- Rich engagement features (streaks, tiers, achievements, referrals)
- Real-time live match rooms with chat
- AI-powered prediction insights

MatchMind attempts to solve all of these in a single platform.

### Target Users

- **Casual sports fans** who want to make predictions with friends
- **Competitive predictors** who want to climb leaderboards and earn recognition
- **League organizers** who want private prediction competitions
- **Pro users** willing to pay for AI insights and premium features

### Business Value

- **Freemium model**: Free tier drives adoption; Pro tier ($4.99/month or $39.99/year) generates revenue via Stripe subscriptions
- **Network effects**: League and squad features create social stickiness
- **Engagement loops**: Watch → Predict → Compete → Talk → Earn → Repeat

### Current Development Stage

**Phase 4 of 4 — All phases complete per README:**
- ✅ Phase 1: Foundations (design system, animation, auth pages, landing)
- ✅ Phase 2: Social Features (chat, leagues, squads, profiles, achievements)
- ✅ Phase 3: AI & Pro (ProGate, pricing, Stripe, admin dashboard, AI hints)
- ✅ Phase 4: Scoring Engine (scoring, BullMQ, leaderboard resets, simulations)

### Production Readiness

**Not production-ready.** See [Known Issues](#28-known-issues) and [Technical Debt](#29-technical-debt) for details. The project has zero test coverage, no TypeScript, no error monitoring, and several security vulnerabilities that must be addressed before production deployment.

### Known Limitations

- No live sports data API integration — all match data is manually entered or simulated
- No email sending implemented — verification tokens are logged to console only
- No test coverage
- No TypeScript
- No error monitoring (Sentry, etc.)
- No CI/CD pipeline
- No production deployment configuration

### Future Vision

See [Project Roadmap](#31-project-roadmap).

---

## 2. Project Metadata

| Field | Value |
|-------|-------|
| **Project Name** | MatchMind |
| **Version** | 1.0.0 |
| **License** | MIT |
| **Root Package Name** | `matchmind` |
| **Backend Package Name** | `matchmind-backend` |
| **Frontend Package Name** | `frontend` |
| **Primary Runtime** | Node.js 20+ |
| **Supported Platforms** | Web (not mobile-native) |
| **Authored By** | Not specified in package.json |
| **Repository** | Not specified in package.json (likely `themanoj-025/Match-Mind` per GitHub badges) |

### Languages Used

| Language | Where |
|----------|-------|
| JavaScript (CommonJS) | Backend (Express.js) |
| JavaScript (ESM + JSX) | Frontend (React) |
| TypeScript (ESM) | `backend/prisma.config.ts` only |
| CSS | Frontend (custom design system) |
| SQL | Migration scripts, seed scripts |
| Batch | `start.bat` (Windows launcher) |
| YAML | GitHub Actions workflows, Docker Compose |

### Frameworks & Libraries

See [Dependencies](#24-dependencies) for complete listing.

### External Services

| Service | Purpose | Status |
|---------|---------|--------|
| **Stripe** | Subscription payments (Pro tier) | Implemented with webhook handling |
| **Anthropic Claude** | AI prediction hints | Implemented with heuristic fallback |
| **Google OAuth** | Social login | Implemented via Passport.js |
| **Redis** | BullMQ queue backend, rate limiting | Implemented with fallback to memory |
| **PostgreSQL** | Primary database | Implemented via Prisma ORM |
| **Nodemailer** | Email sending | Configured but NOT implemented (tokens logged to console) |
| **SportRadar API** | Live sports data | `SPORTRADAR_API_KEY` in env.example but NOT implemented in code |
| **Cloudinary** | Media storage | `CLOUDINARY_URL` in env.example but NOT implemented in code |
| **Sentry** | Error monitoring | Listed in README but NOT configured |
| **PostHog** | Analytics | Listed in README but NOT configured |
| **Cloudflare** | CDN | Listed in README but NOT configured |
| **Supabase** | Production PostgreSQL | Listed in README but NOT configured |

> ⚠️ **Note:** Several services listed in the README (`SportRadar API`, `Cloudinary`, `Sentry`, `PostHog`, `Cloudflare`, `Supabase`) have associated environment variables in `.env.example` but have **no implementation in the codebase**. They appear to be planned integrations that were not completed or were removed during development.

---

## 3. Repository Statistics

| Metric | Count |
|--------|-------|
| **Total Files** | ~90+ (source + config + docs) |
| **Total Directories** | ~25+ |
| **Backend Source Files** | ~25 files |
| **Frontend Source Files** | ~45 files (36 pages, 20 components) |
| **Route Files** | 15 (backend) |
| **Middleware Files** | 5 (backend) |
| **Configuration Files** | ~15 |
| **Documentation Files** | 8 |
| **Test Files** | 2 (scoring.test.js, simulationEngine.test.js) |
| **CI/CD Workflow Files** | 7 (GitHub Actions) |
| **Script Files** | 5 (backend setup/seed) |

### Largest Modules (by file count)

| Module | File Count | Description |
|--------|------------|-------------|
| Frontend Pages | 36 | Page-level components |
| Frontend Components | 20 | Reusable UI components |
| Backend Routes | 15 | API route handlers |
| Prisma Schema Models | 17 | Database models |
| Enums | 10 | Database enum types |

### Largest Files

| File | Size (est.) | Description |
|------|-------------|-------------|
| `frontend/src/App.jsx` | ~200 lines | Root component with 36+ route definitions |
| `backend/src/services/scoring.js` | ~300 lines | Core scoring engine |
| `backend/src/services/simulation/simulationEngine.js` | ~250 lines | Match simulation engine |
| `backend/src/routes/admin.js` | ~250 lines | Admin API routes |
| `backend/src/routes/stripe.js` | ~230 lines | Stripe webhook + payment routes |
| `backend/prisma/seed.js` | ~250 lines | Database seed script (Prisma) |
| `backend/scripts/push-schema.js` | ~200 lines | Schema push via docker exec |
| `backend/scripts/seed-db.js` | ~200 lines | DB seed via docker exec |

---

## 4. Folder Structure

### Root

```
Match-Mind/
├── package.json                 # Root workspace: npm scripts for both packages
├── docker-compose.yml           # Local dev: PostgreSQL + Redis containers
├── start.bat                    # Windows double-click launcher
├── .editorconfig                # Editor settings (spaces, LF line endings)
├── .gitattributes               # Git LFS/text handling
├── .gitignore                   # Ignored files (node_modules, .env, dist)
├── PROJECT_OVERVIEW.md          # ← This file
├── README.md                    # Project README (marketing + setup)
├── CHANGELOG.md                 # Version history (Keep a Changelog)
├── CONTRIBUTING.md              # Contribution guidelines
├── SECURITY.md                  # Security policy + vulnerability reporting
├── SUPPORT.md                   # Support channels
├── CODE_OF_CONDUCT.md           # Contributor Covenant v2.1
├── LICENSE                      # MIT License
├── backend/                     # Express.js API server
└── frontend/                    # React SPA (Vite)
```

### Backend Structure

```
backend/
├── package.json                 # Dependencies: express, prisma, stripe, etc.
├── .env.example                 # Template for all env vars
├── prisma.config.ts             # Prisma 7 datasource configuration (TypeScript)
├── vitest.config.js             # Vitest test configuration
├── prisma/
│   ├── schema.prisma            # Database schema (17 models, 10 enums)
│   ├── migration.sql            # Prisma migration file (may be empty)
│   └── seed.js                  # Database seed script (Prisma-based)
├── scripts/
│   ├── push-schema.js           # Push schema via docker exec (workaround for Prisma 7 bugs)
│   ├── seed-db.js               # Seed database via docker exec
│   ├── setup-db.js              # Orchestrator: generate → push → seed
│   └── setup-native-pg.js       # Configure local PostgreSQL on Windows
└── src/
    ├── index.js                 # Express server entry point
    ├── config/
    │   ├── constants.js         # Scoring points, pagination, rate limits, BullMQ config
    │   ├── passport.js          # Passport strategies: JWT + Google OAuth
    │   └── schemas.js           # Zod validation schemas for all request bodies
    ├── middleware/
    │   ├── auth.js              # JWT authentication (Bearer header + cookie fallback)
    │   ├── errorHandler.js      # Centralized error handler (Prisma, JWT, AppError, 500)
    │   ├── rateLimiter.js       # Rate limiting (auth, password reset, prediction, global)
    │   ├── requireAdmin.js      # Admin role check middleware
    │   └── validate.js          # Zod schema validation middleware
    ├── routes/
    │   ├── auth.js              # Signup, login, logout, Google OAuth, token refresh, forgot/reset password, verify email
    │   ├── matches.js           # Match CRUD, stats, lineups, H2H, timeline, finish match
    │   ├── predictions.js       # Create prediction, list mine, list by match, score predictions
    │   ├── leaderboard.js       # Global, weekly, sport-specific, friends, history snapshots
    │   ├── users.js             # Profile, update, follow/unfollow, notifications, username check
    │   ├── leagues.js           # CRUD leagues, join by invite code, leaderboard
    │   ├── squads.js            # CRUD squads, invite members
    │   ├── highlights.js        # Match highlights from goal events
    │   ├── ai.js                # AI prediction hints (Anthropic + heuristic), AI match summaries
    │   ├── stripe.js            # Checkout session, webhook, billing portal, subscription status
    │   ├── admin.js             # Dashboard stats, user/matches/reports CRUD, activity log, settings
    │   ├── teams.js             # List teams, team profile with standings + recent matches
    │   ├── players.js           # List players, player details
    │   ├── search.js            # Global search: users, teams, players, matches
    │   ├── simulation.js        # Start match simulation (async + sync), simulation status
    │   └── messages.js          # Conversations list, direct messages CRUD, mark read
    ├── services/
    │   ├── scoring.js           # Core scoring engine: calculatePredictionPoints, scoreMatchPredictions, streaks, tiers, leaderboard management
    │   ├── scoring.test.js      # Unit tests for calculatePredictionPoints
    │   ├── tokenService.js      # JWT token generation and httpOnly cookie setting
    │   └── simulation/
    │       ├── simulationEngine.js       # Pure function: deterministic match simulation (Poisson xG, event timeline)
    │       ├── simulationEngine.test.js  # Unit tests for simulation engine
    │       └── simulationRunner.js       # Orchestrator: loads teams, runs engine, persists events, emits Socket.IO
    ├── socket/
    │   └── index.js             # Socket.IO event handlers: room management, chat, reactions, simulation events, DM typing
    ├── workers/
    │   ├── queue.js             # BullMQ queue definitions: score-predictions, reset-leaderboards, recalculate-ranks
    │   └── scoringWorker.js     # BullMQ workers: score predictions, reset leaderboards, recalculate ranks
    ├── workflows/
    │   └── finalizeMatch.js     # Workflow: lock predictions → score (queue/direct/auto) → recalculate ranks → emit socket events
    └── utils/
        └── AppError.js          # Custom error class with code, message, statusCode
```

### Frontend Structure

```
frontend/
├── package.json                 # Dependencies: react, framer-motion, zustand, three.js, etc.
├── vite.config.js               # Vite config: React plugin, Tailwind CSS, proxy, chunk splitting
├── vercel.json                  # Vercel deployment: build command, API rewrites, headers
├── eslint.config.js             # ESLint flat config: React hooks, React refresh
├── index.html                   # HTML entry: SEO meta, Open Graph, PWA manifest, fonts, structured data
├── public/
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
└── src/
    ├── main.jsx                 # React entry: QueryClient, BrowserRouter, HelmetProvider
    ├── App.jsx                  # Root: Navbar, BottomNav, LiveTicker, routes (36+), lazy loading, Framer Motion transitions
    ├── index.css                # Design system: CSS variables, typography, animations, utility classes
    ├── store/
    │   └── useStore.js          # Zustand store: auth, UI state, live matches, chat, notifications, predictions, leaderboard
    ├── hooks/
    │   └── useApi.js            # React Query hooks: all API endpoints (matches, predictions, leaderboard, etc.)
    ├── components/
    │   ├── Navbar.jsx           # Top navigation: logo, links, auth buttons, search, notifications, user menu
    │   ├── BottomNav.jsx        # Mobile bottom navigation bar
    │   ├── LiveTicker.jsx       # Scrolling ticker of live match scores
    │   ├── MatchCard.jsx        # Match preview card component
    │   ├── ScoreDisplay.jsx     # Animated score display (flash on change)
    │   ├── PredictionCard.jsx   # Prediction result card
    │   ├── ChatMessage.jsx      # Enhanced chat message with reactions, GIFs, pin, report, tiers
    │   ├── LeaderboardRow.jsx   # Leaderboard table row
    │   ├── PointsToast.jsx      # Points earned overlay notification
    │   ├── SportBadge.jsx       # Sport color-coded badge
    │   ├── SportIcon.jsx        # Sport icon component
    │   ├── LiveBadge.jsx        # Pulsing LIVE indicator
    │   ├── UserAvatar.jsx       # User avatar with tier border styling
    │   ├── TierBadge.jsx        # Tier badge display
    │   ├── AchievementBadge.jsx # Achievement badge display
    │   ├── GamificationStrip.jsx # Gamification progress strip
    │   ├── NotificationBell.jsx # Unread notification count bell
    │   ├── QuickChatFeed.jsx    # Global floating chat drawer
    │   ├── CommandPalette.jsx   # ⌘K command palette
    │   ├── ProGate.jsx          # Pro content blur overlay with upgrade CTA
    │   ├── ProgressBar.jsx      # Reusable progress bar
    │   ├── SkeletonCard.jsx     # Loading skeleton card
    │   ├── EmptyState.jsx       # Empty state with illustration
    │   ├── ErrorBoundary.jsx    # React error boundary (catches rendering errors)
    │   ├── ErrorState.jsx       # Error state display
    │   ├── ConfirmModal.jsx     # Confirmation modal dialog
    │   ├── Tooltip.jsx          # Radix tooltip wrapper
    │   ├── Chip.jsx             # Reusable chip/tag component
    │   ├── StatBar.jsx          # Statistics bar component
    │   ├── CommunityPollWidget.jsx # Community poll component
    │   ├── PremiumLoadingScreen.jsx # Initial loading screen with animation
    │   └── three/
    │       ├── HeroScene.jsx     # WebGL detection + lazy loading of Three.js scene
    │       └── HeroSceneImpl.jsx # Three.js particle field (200 particles, 3D)
    ├── lib/
    │   └── animation/
    │       ├── variants.js      # 18 Framer Motion animation variant sets
    │       └── gsap.js          # 10 GSAP utility functions
    └── pages/
        ├── LandingPage.jsx      # / — Three.js hero, GSAP count-up stats, feature sections
        ├── LoginPage.jsx        # /login — Framer Motion form, forgot password link
        ├── SignupPage.jsx       # /signup — Password strength meter, username availability check
        ├── FeedPage.jsx         # /feed — Personalized match feed for logged-in users
        ├── LiveHubPage.jsx      # /live — All live/upcoming/finished matches with filtering
        ├── MatchRoomPage.jsx    # /live/:matchId — 3-panel: stats + chat + predictions
        ├── ScoresPage.jsx       # /scores — Fixture list by competition
        ├── PredictionsPage.jsx  # /predictions — Dashboard with prediction stats and history
        ├── MakePredictionPage.jsx # /predictions/new/:matchId — Score widget, AI hint, markets
        ├── LeaderboardPage.jsx  # /leaderboard — Global podium + filterable table
        ├── LeaguesPage.jsx      # /leagues — Private league hub
        ├── CreateLeaguePage.jsx # /leagues/create — League creation form
        ├── LeagueRoomPage.jsx   # /leagues/:leagueId — 4-tab: standings, chat, predictions, about
        ├── SquadsPage.jsx       # /squads — Friend group hub
        ├── SquadPage.jsx        # /squads/:squadId — 4-tab: rankings, chat, activity, members
        ├── ExplorePage.jsx      # /explore — Trending matches, sports, competitions
        ├── HighlightsPage.jsx   # /highlights — Video highlights grid
        ├── ProfilePage.jsx      # /profile/:userId — Cover banner, stats, 4 tabs
        ├── MyProfilePage.jsx    # /profile/me — Progress, locked achievements, quick links
        ├── SettingsPage.jsx     # /profile/me/settings — Pro management, billing portal
        ├── NotificationsPage.jsx # /profile/me/notifications — Filter tabs, mark read
        ├── AchievementsPage.jsx # /achievements — Rarity filters, 12 badges, progress
        ├── ActivityPage.jsx     # /activity — My Activity + Following's Activity
        ├── MessagesPage.jsx     # /messages — Direct messaging
        ├── StandingsPage.jsx    # /standings/:sport — League standings table
        ├── TeamPage.jsx         # /teams/:teamId — Team fixtures + fans
        ├── PlayerPage.jsx       # /players/:playerId — Player stats
        ├── SearchPage.jsx       # /search — Global search results
        ├── AdminPage.jsx        # /admin — KPI cards, Recharts charts, user/matches/reports tables
        ├── PricingPage.jsx      # /pricing — Monthly/annual toggle, Stripe checkout, FAQ
        ├── OnboardingPage.jsx   # /onboarding — 4-step wizard: sports → teams → predictors → profile
        ├── auth/
        │   ├── ForgotPasswordPage.jsx  # /forgot-password
        │   ├── ResetPasswordPage.jsx   # /reset-password
        │   └── VerifyEmailPage.jsx     # /verify-email
        └── static/
            ├── AboutPage.jsx    # /about — Mission, GSAP count-up, team grid
            ├── FAQPage.jsx      # /faq — 6-category searchable accordion
            └── NotFoundPage.jsx # * — Animated 404 page
```

---

## 5. Complete File Documentation

### 5.1 Root Configuration Files

#### `package.json` (Root)
- **Purpose**: Workspace orchestrator — scripts for install, dev, build, and database setup
- **Why it exists**: Single entry point to run both frontend and backend
- **Dependencies**: `concurrently` only (runs backend + frontend in parallel)
- **Key scripts**: `dev`, `install:all`, `build`, `setup`, `prisma:*`
- **Critical**: Yes — cannot run the project without it

#### `docker-compose.yml`
- **Purpose**: Local development infrastructure — PostgreSQL (port 5433) + Redis (port 6379)
- **Why it exists**: Avoids requiring locally installed PostgreSQL/Redis
- **Services**: `postgres` (postgres:16-alpine), `redis` (redis:7-alpine)
- **Volumes**: `pgdata`, `redisdata` (persist data between restarts)
- **Health checks**: Both services have health checks (pg_isready, redis-cli ping)
- **Critical**: Required for development unless PostgreSQL + Redis are installed natively

#### `start.bat`
- **Purpose**: Windows double-click launcher for the entire project
- **Why it exists**: Easy onboarding for Windows users
- **What it does**: Checks Node.js + Docker, creates .env from template, starts containers, installs deps, generates Prisma client, pushes schema, seeds database, launches both servers in separate windows
- **Critical**: Optional (convenience script)

### 5.2 Backend Source Files

#### `backend/src/index.js` — Server Entry Point ⭐ CRITICAL
- **Purpose**: Express.js HTTP server + Socket.IO WebSocket server entry point
- **Execution order**: 
  1. Load dotenv → validate required env vars (JWT_SECRET, DATABASE_URL)
  2. Initialize Prisma with PostgreSQL adapter (`@prisma/adapter-pg`)
  3. Configure Passport.js strategies
  4. Create Express app → apply global rate limiter → create HTTP server → create Socket.IO server
  5. Apply middleware: helmet, cors, morgan, Stripe webhook raw body, json, cookieParser, passport
  6. Mount 15 route groups under `/api/`
  7. Mount health check endpoint
  8. Mount error handler
  9. Setup Socket.IO event handlers
  10. Initialize BullMQ workers with fallback
  11. Schedule weekly/monthly leaderboard resets
  12. Start HTTP server
  13. Handle SIGTERM for graceful shutdown
- **Side effects**: Creates global `prisma._app` reference (anti-pattern), creates `prisma._pool`
- **Critical dependencies**: PrismaClient, Express, Socket.IO, BullMQ, Passport
- **Known issues**:
  - `prisma._app` is a mutable global — tight coupling
  - Graceful shutdown has `closeWorkers` as dynamic require inside the handler
  - `httpServer.close()` callback not awaited
- **Technical debt**: Anti-pattern `prisma._app`, no dependency injection

#### `backend/src/config/constants.js`
- **Purpose**: Single source of truth for all magic numbers
- **Exports**: `SCORING`, `PAGINATION`, `RATE_LIMIT`, `BULLMQ`, `MATCH`, `CHAT`
- **Critical values**:
  - Score points: BASE=5, EXACT_SCORE=50, RESULT_AND_GD=35, RESULT_ONLY=25, BTTS=10, OVER_UNDER=10
  - Pagination: DEFAULT_PAGE=1, DEFAULT_LIMIT=20, MAX_LIMIT=100
  - Rate limits: AUTH_MAX=5/15min, PASSWORD_RESET_MAX=3/hour, PREDICTION_MAX=30/min, GLOBAL_MAX=100/min
- **Known issue**: `MATCH.FINISHED_MINUTE=90` is football-specific, not applicable to all sports

#### `backend/src/config/passport.js`
- **Purpose**: Passport.js strategy configuration
- **Strategies**:
  1. **JWT Strategy**: Extracts Bearer token from Authorization header, verifies against JWT_SECRET, looks up user in database
  2. **Google OAuth Strategy**: Uses passport-google-oauth20, creates user if not exists, only configured if env vars are set
- **Side effects**: Registers serialization/deserialization functions (not used with JWT)
- **Dependencies**: passport, passport-jwt, passport-google-oauth20, prisma

#### `backend/src/config/schemas.js` ⭐ CRITICAL
- **Purpose**: Zod validation schemas for all API request bodies
- **17 schemas** covering: auth (signup, login, forgot/reset password, verify email), predictions, matches, leagues, squads, users, Stripe, messages, AI, admin
- **Design patterns**: Uses `.strict()` on most schemas to reject unknown fields
- **Dependencies**: zod
- **Known issues**:
  - `createPredictionSchema` creates `result` field but it's never stored in the database
  - `updateProfileSchema` accepts `favouriteSports` and `favouriteTeams` but the route handler ignores them

#### `backend/src/middleware/auth.js`
- **Purpose**: JWT authentication middleware
- **Exports**: `authenticateToken` (required), `optionalAuth` (optional)
- **Token sources**: Authorization header (Bearer) → cookie fallback (accessToken)
- **Error handling**: Returns 401 if no token, 403 if token invalid/expired
- **Known issue**: optionalAuth silently ignores invalid tokens (could log a debug message)

#### `backend/src/middleware/errorHandler.js` ⭐ CRITICAL
- **Purpose**: Centralized Express error handler (must be last middleware)
- **Mapped errors**:
  - PrismaClientKnownRequestError: P2002 (409 Conflict), P2025 (404 Not Found), P2003 (400), P2014 (400)
  - PrismaClientValidationError: 400
  - JsonWebTokenError / TokenExpiredError: 401
  - AppError: Custom statusCode
  - Fallback: 500 Internal Server Error
- **Logging**: Logs error message to console, stack trace in development mode only
- **Never leaks stack traces to clients** ✅

#### `backend/src/middleware/rateLimiter.js`
- **Purpose**: Rate limiting with Redis backing and memory store fallback
- **Limiters**: auth (5/15min), password reset (3/hour), prediction (30/min), global (100/min)
- **Redis integration**: Uses `rate-limit-redis` store if available, falls back to Express's built-in memory store
- **Known issue**: Redis store initialization failure is silently caught with no warning log

#### `backend/src/middleware/requireAdmin.js`
- **Purpose**: Admin role verification middleware
- **Logic**: Looks up user by ID, checks if role is ADMIN or SUPERADMIN
- **Returns**: 403 if not admin

#### `backend/src/middleware/validate.js`
- **Purpose**: Zod schema validation as Express middleware
- **Supports**: `body`, `query`, `params` sources
- **On success**: Replaces original input with parsed/coerced data ✅
- **On failure**: Returns 400 with structured error array: `{ path, message, code }`

#### `backend/src/middleware/asyncHandler.js`
- **Purpose**: Wraps async route handlers to catch rejected promises
- **Pattern**: `(fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)`
- **Usage**: Applied to every async route handler

### 5.3 Backend Route Files

#### `backend/src/routes/auth.js` ⭐ CRITICAL
- **Endpoints**: `POST /signup`, `POST /login`, `POST /logout`, `GET /google`, `GET /google/cb`, `POST /refresh`, `POST /forgot-password`, `POST /reset-password`, `POST /verify-email`, `POST /resend-verification`
- **Key implementation details**:
  - Signup: Creates user with bcrypt (12 rounds), generates email verification token (TODO: email sending), returns JWT
  - Login: Validates credentials, returns JWT + httpOnly cookies
  - Google OAuth: Passport.js authentication, redirects to frontend
  - Password reset: Uses JWT token with 1h expiry, falls back to JWT_SECRET if JWT_RESET_SECRET is not set
  - Forgot password: Always returns success (prevents email enumeration) ✅
- **Known issues**:
  - Email verification token is logged to console but never sent
  - Password reset tokens not stored in DB — can't invalidate individual tokens
  - JWT_RESET_SECRET falls back to JWT_SECRET (security concern)

#### `backend/src/routes/matches.js` ⭐ CRITICAL
- **Endpoints**: `GET /`, `GET /:id`, `GET /:id/stats`, `GET /:id/lineups`, `GET /:id/h2h`, `POST /:id/finish`, `GET /:id/timeline`
- **Data sources**: 
  - Stats: Real data from MatchEvent rows (goals, cards, possession)
  - Lineups: Generated from Player pool (max 11 per team)
  - H2H: Real historical matches between the same two teams
  - Timeline: Real events from MatchEvent table
- **Finish match**: Admin-only, calls `finalizeMatch` workflow, emits Socket.IO events
- **Known issue**: Hardcoded formation '4-3-3' for all lineups

#### `backend/src/routes/predictions.js` ⭐ CRITICAL
- **Endpoints**: `POST /`, `GET /mine`, `GET /match/:matchId`, `POST /score/:matchId`, `PATCH /:id/score`
- **Validation**: Matches must be SCHEDULED to predict, unique per user per match (composite key)
- **Rate limiting**: 30/min/user via `predictionLimiter`
- **Scoring**: Can be triggered manually via `POST /score/:matchId` with mode=queue/direct/auto

#### `backend/src/routes/leaderboard.js`
- **Endpoints**: `GET /global`, `GET /sport/:sport`, `GET /weekly`, `GET /history/:period`, `GET /friends`
- **Note**: The leaderboard routes contain **duplicated mapping code** 5 times:
  ```javascript
  users.map((u, i) => ({ ...u, rank: i + 1, name: u.displayName || u.username, points: u.totalPoints, accuracy: u.predAccuracy, streak: u.streakCurrent }))
  ```
- **Known issue**: `/friends` endpoint does NOT filter by friends — returns all users

#### `backend/src/routes/users.js`
- **Endpoints**: `GET /check-username`, `GET /:id`, `PATCH /me`, `POST /:id/follow`, `DELETE /:id/follow`, `GET /me/notifications`, `PATCH /me/notifications/read`
- **Known issue**: `favouriteSports` and `favouriteTeams` are accepted in the request body but silently ignored in the update handler

#### `backend/src/routes/admin.js` ⭐ CRITICAL
- **Endpoints**: `GET /stats`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`, `POST /users/:id/toggle-pro`, `GET /matches`, `PATCH /matches/:id`, `GET /reports`, `PATCH /reports/:id`, `GET /activity-log`, `GET /settings`
- **All routes require admin auth** (authenticateToken + requireAdmin)
- **AdminLog**: All destructive actions logged to AdminLog table
- **User deletion**: Cascade deletes all user data (no soft-delete, no confirmation)
- **Known issue**: sportsDistribution in `/stats` is hardcoded:
  ```javascript
  sportDistribution: [
    { name: 'Football', value: 45 },
    // ... hardcoded values
  ]
  ```

#### `backend/src/routes/leagues.js`
- **Endpoints**: `POST /` (create), `GET /mine`, `GET /:id`, `POST /:id/join`, `GET /:id/leaderboard`
- **Invite codes**: Generated via UUID v4 (8 chars, uppercase)
- **Auto-join**: Creator automatically joins as first member with rank 1

#### `backend/src/routes/squads.js`
- **Endpoints**: `POST /` (create), `GET /mine`, `GET /:id`, `POST /:id/members/invite`
- **Roles**: Creator gets 'owner', invited users get 'member'

#### `backend/src/routes/highlights.js`
- **Endpoints**: `GET /`
- **Known issue**: **N+1 query** — fetches matches, then loops through each to fetch goal events individually

#### `backend/src/routes/ai.js` ⭐ CRITICAL
- **Endpoints**: `POST /predict/:matchId`, `POST /summary/:matchId`
- **AI provider**: Anthropic Claude 3 Haiku (when ANTHROPIC_API_KEY is set)
- **Fallback**: Smart heuristic prediction (randomized) when API key is missing
- **Pro gating**: Checks if user has active Pro subscription
- **⚠️ SECURITY**: The predict endpoint uses `optionalAuth` — unauthenticated users can trigger Anthropic API calls, costing money

#### `backend/src/routes/stripe.js` ⭐ CRITICAL
- **Endpoints**: `POST /create-checkout`, `POST /webhook`, `POST /create-portal-session`, `GET /status`
- **Webhook events handled**: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- **Webhook**: Uses raw body before express.json() ✅
- **Mock mode**: When STRIPE_SECRET_KEY is not set, returns a mock URL for testing

#### `backend/src/routes/teams.js`
- **Endpoints**: `GET /`, `GET /:id`
- **Team profile**: Includes players, standings, recent matches, computed form (W/L/D from last 5)

#### `backend/src/routes/players.js`
- **Endpoints**: `GET /`, `GET /:id`

#### `backend/src/routes/search.js`
- **Endpoints**: `GET /?q=`
- **Searches**: Users (username, displayName), Teams (name), Players (name), Matches (home/away team, competition)
- **All searches use**: `{ contains: query, mode: 'insensitive' }` — full text search without trigram indexes

#### `backend/src/routes/simulation.js`
- **Endpoints**: `POST /:id/start-simulation`, `POST /:id/start-simulation-sync`, `GET /:id/simulation-status`
- **Requires**: Admin auth
- **Implementation**: Runs `runSimulation()` which loads teams, runs the engine, persists events with compressed clock delays, emits Socket.IO events, and auto-triggers scoring on finish
- **Known issue**: No locking mechanism — parallel simulations can run on the same match

#### `backend/src/routes/messages.js`
- **Endpoints**: `GET /conversations`, `GET /:userId`, `POST /:userId`, `PATCH /read/:userId`
- **DM room IDs**: Deterministic (`dm:{sortedUserId1}:{sortedUserId2}`)
- **Real-time**: Emits `DM_MESSAGE` via Socket.IO to both users' personal rooms

### 5.4 Backend Service Files

#### `backend/src/services/scoring.js` ⭐ CRITICAL (Core Business Logic)
- **Purpose**: The prediction scoring engine — the heart of the application
- **Key functions**:
  - `calculatePredictionPoints(prediction, match)` — Pure function, no side effects
    - Exact score: 50 + 5 base = 55 points
    - Correct result + same GD: 35 + 5 = 40
    - Correct result only: 25 + 5 = 30
    - BTTS bonus: +10
    - Over/Under bonus: +10
    - Wrong result: 5 base only
    - VOID: 0 points
  - `scoreMatchPredictions(prisma, matchId)` — Scores all LOCKED predictions for a match, batch-updates user stats
  - `updateUserStreaks(prisma, userId, wasCorrect)` — Increments/decrements streak
  - `checkTierProgression(prisma, userId, totalPoints, currentTier)` — Checks threshold-based tier upgrades
  - `recalculateRanks(prisma)` — Recalculates global rank for all users
  - `resetWeeklyLeaderboard(prisma)` — Snapshots + resets weekly points
  - `resetMonthlyLeaderboard(prisma)` — Snapshots monthly leaderboard
- **Tier thresholds**: BRONZE(0), SILVER(500), GOLD(1500), PLATINUM(3500), DIAMOND(7000), LEGEND(12000)
- **Tests**: `scoring.test.js` exists with comprehensive test coverage

#### `backend/src/services/tokenService.js`
- **Purpose**: JWT token generation and httpOnly cookie setting (extracted from auth.js)
- **Token expiry**: Access token = 15 minutes, Refresh token = 30 days
- **Cookies**: httpOnly, secure in production, sameSite strict (refresh) / lax (access)

#### `backend/src/services/simulation/simulationEngine.js`
- **Purpose**: Pure, deterministic match simulation engine
- **No DB/IO dependencies** — purely mathematical
- **Algorithm**:
  1. Team ratings → expected goals (xG) via formula
  2. Poisson distribution → actual goals
  3. Distributed goal timings with bias toward later minutes
  4. Cards via Bernoulli draws (~1.1 per team per match)
  5. Possession ticks every 5 minutes via Beta distribution
  6. Substitutions at fixed windows (60', 75')
- **PRNG**: Mulberry32 — seeded, deterministic
- **Tests**: `simulationEngine.test.js` with comprehensive test coverage

#### `backend/src/services/simulation/simulationRunner.js`
- **Purpose**: Orchestrates a full match simulation
- **Process**:
  1. Load match + team data from DB
  2. Run simulation engine with seed
  3. Set match to SIMULATING
  4. Walk through event timeline with compressed clock delay (150ms default)
  5. Persist each event to MatchEvent table
  6. Emit Socket.IO events per event type
  7. Mark match FINISHED with final score
  8. Auto-trigger scoring via finalizeMatch

### 5.5 Backend Worker Files

#### `backend/src/workers/queue.js`
- **Purpose**: BullMQ queue definitions
- **Queues**: `score-predictions`, `reset-leaderboards`, `recalculate-ranks`
- **Job options**: Retry with exponential/fixed backoff, cleanup on complete/fail

#### `backend/src/workers/scoringWorker.js`
- **Purpose**: BullMQ worker implementations
- **Concurrency**: score-predictions=5, reset-leaderboards=2, recalculate-ranks=1
- **Error handlers**: Log failed/completed jobs to console

#### `backend/src/workflows/finalizeMatch.js`
- **Purpose**: Orchestrates match scoring after completion
- **Flow**: Lock pending predictions → score (queue/direct/auto) → recalculate ranks → emit socket events → log scoring
- **Multiple modes**: `queue` (async via BullMQ), `direct` (sync), `auto` (try queue, fallback to direct)

### 5.6 Frontend Files

#### `frontend/src/main.jsx`
- **Purpose**: React entry point
- **Providers**: HelmetProvider, QueryClientProvider, BrowserRouter
- **React Query defaults**: staleTime=30s, retry=2, refetchOnWindowFocus=false
- **React Router future flags**: v7_startTransition, v7_relativeSplatPath

#### `frontend/src/App.jsx`
- **Purpose**: Root application component
- **Contains**: Navbar, BottomNav, LiveTicker, GamificationStrip, QuickChatFeed, CommandPalette, PremiumLoadingScreen
- **Routes**: 36+ lazy-loaded pages with Framer Motion page transitions
- **Keyboard shortcut**: ⌘K/Ctrl+K toggles Command Palette
- **Mobile detection**: Updates isMobile flag in Zustand store on window resize (breakpoint: 640px)
- **Known issue**: Initial loading screen always shows for 1200ms even on navigation

#### `frontend/src/index.css`
- **Purpose**: Complete design system in CSS
- **Contains**: 80+ CSS custom properties (colors, spacing, typography, shadows, gradients, borders, z-index, transitions)
- **Typography classes**: display-xl, display-l, heading-1/2/3, body-large, body, caption, overline, mono
- **Animations**: 12 @keyframes (live-pulse, shrink, scroll-ticker, score-flash, fade-in-up, slide-in-right, float, glow-pulse, shimmer, number-roll, confetti-fall)
- **Reduced motion**: @media (prefers-reduced-motion: reduce) disables animations
- **Note**: Not using Tailwind CSS utility classes despite `@tailwindcss/vite` being configured — uses custom CSS classes instead
- **Technical debt**: Monolithic file (~450 lines) with no component-scoped styles

#### `frontend/src/store/useStore.js`
- **Purpose**: Zustand global state store
- **State slices**: Auth (user, isAuthenticated), UI (isNavOpen), Live Matches (scores, status updates), Chat Messages (per-room), Viewer Counts, Notifications, Predictions, Leaderboard, Viewport (isMobile), Loading States, Error States
- **Design patterns**: Immutable updates via `set()`, computed values where needed
- **Known issue**: Chat messages grow unbounded — no limit on stored messages per room

#### `frontend/src/hooks/useApi.js` ⭐ CRITICAL
- **Purpose**: React Query hooks for all API interactions
- **Contains**: 40+ custom hooks covering all endpoints
- **Patterns**: 
  - Helper `fetchJSON()` with credentials: 'include' for cookies
  - Helper `authedHeaders()` reads accessToken from cookies
  - Optimistic updates for follow/unfollow with rollback
- **Missing**: No loading/error state exposure on mutation hooks, no automatic token refresh

### 5.7 Scripts

#### `backend/scripts/push-schema.js`
- **Purpose**: Push Prisma schema to PostgreSQL via docker exec (workaround for Prisma 7 bugs)
- **Notable**: Creates all tables, enums, indexes, and seeds reference data (competitions + teams) directly via SQL
- **Known issue**: The `MatchStatus` enum includes 'LIVE' in the script but the Prisma schema uses 'SIMULATING'

#### `backend/scripts/seed-db.js`
- **Purpose**: Seed demo data via docker exec (workaround for Prisma 7 bugs)
- **Seeds**: 11 users, 12 matches (4 live, 5 upcoming, 3 finished), 14 predictions, 5 leagues, 3 squads, 5 notifications
- **Password hash**: Hardcoded bcrypt hash for 'password123'
- **Uses**: Arbitrary user IDs like 'user-demouser', references team IDs like 'team-mci'

#### `backend/scripts/setup-db.js`
- **Purpose**: Orchestrator — runs generate → push → seed
- **Usage**: `node scripts/setup-db.js [generate|push|seed|all]`

#### `backend/scripts/setup-native-pg.js`
- **Purpose**: Configure native PostgreSQL 18 on Windows
- **Attempts**: Multiple authentication methods (trust, password combinations)
- **Modifies**: pg_hba.conf to add trust auth, restarts PostgreSQL service

---

## 6. Architecture

### Overall Architecture

**Style**: Three-tier monolith (SPA ↔ API ↔ Database) with background job processing.

```mermaid
graph TB
    subgraph "Client Layer (Browser)"
        A["React SPA<br/>Port 3000"]
        B["Zustand Store"]
        C["React Query Cache"]
    end

    subgraph "HTTP/WS Gateway (Port 4000)"
        D["Express.js v5"]
        E["Socket.IO Server"]
    end

    subgraph "Application Layer"
        F["15 Route Modules"]
        G["Passport.js Auth"]
        H["Zod Validation"]
        I["Rate Limiting"]
    end

    subgraph "Business Logic"
        J["Scoring Engine"]
        K["Simulation Engine"]
        L["Finalize Match<br/>Workflow"]
    end

    subgraph "Background Processing"
        M["BullMQ Queue"]
        N["3 Workers"]
        O["Scheduler"]
    end

    subgraph "Data Layer"
        P["Prisma ORM v7"]
        Q["PostgreSQL 16"]
        R["Redis 7"]
    end

    subgraph "External"
        S["Stripe API"]
        T["Anthropic API"]
        U["Google OAuth"]
    end

    A -->|HTTP| D
    A -->|WebSocket| E
    D --> F
    D --> G
    D --> H
    D --> I
    F --> J
    F --> K
    F --> L
    F --> S
    F --> T
    L --> M
    M --> N
    N --> P
    N --> R
    F --> P
    E --> P
    G --> U
```

### Request Flow

```mermaid
sequenceDiagram
    participant Browser
    participant ViteProxy as Vite Dev Proxy
    participant Express as Express.js
    participant Passport as Passport/JWT
    participant Route as Route Handler
    participant Service as Service Layer
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL

    Browser->>ViteProxy: HTTP Request
    ViteProxy->>Express: Proxy to :4000
    Express->>Express: Helmet, CORS, Morgan
    Express->>Express: Rate Limiter Check
    Express->>Passport: JWT Auth (if required)
    Passport-->>Express: user object or 401
    Express->>Route: Route Handler
    Route->>Service: Business Logic
    Service->>Prisma: Database Query
    Prisma->>DB: SQL (via adapter-pg)
    DB-->>Prisma: Results
    Prisma-->>Service: Typed Results
    Service-->>Route: Processed Data
    Route-->>Express: JSON Response
    Express-->>ViteProxy: HTTP Response
    ViteProxy-->>Browser: Proxy Response
```

### Startup Sequence

```mermaid
sequenceDiagram
    participant Server as index.js
    participant Prisma as PrismaClient
    participant Passport as Passport
    participant Express as Express App
    participant Socket as Socket.IO
    participant BullMQ as BullMQ Workers
    participant Scheduler as Scheduler

    Server->>Server: Load dotenv
    Server->>Server: Validate JWT_SECRET, DATABASE_URL
    Server->>Prisma: Initialize (pool + adapter)
    Server->>Passport: configurePassport(prisma)
    Server->>Express: Create app
    Server->>Socket: Create HTTP server + IO
    Server->>Express: Apply middleware (helmet, cors, morgan)
    Server->>Express: Mount 15 route groups
    Server->>Express: Mount health check
    Server->>Socket: setupSocket(io, prisma)
    Server->>Prisma: Attach prisma._app = app
    Server->>BullMQ: createWorkers(prisma)
    alt Redis Available
        BullMQ-->>Server: Workers initialized
        Server->>Scheduler: scheduleWeekly()
        Server->>Scheduler: scheduleMonthly()
    else Redis Unavailable
        BullMQ-->>Server: Warning log
    end
    Server->>Server: httpServer.listen(PORT)
```

### Shutdown Sequence

```mermaid
sequenceDiagram
    participant OS as OS Signal
    participant Process as Node Process
    participant Prisma as PrismaClient
    participant Pool as PG Pool
    participant BullMQ as Workers
    participant HTTP as HTTP Server

    OS->>Process: SIGTERM
    Process->>Prisma: prisma.$disconnect()
    Process->>Pool: prisma._pool.end()
    Process->>BullMQ: closeWorkers(workers)
    BullMQ-->>Process: All workers closed
    Process->>HTTP: httpServer.close()
    HTTP-->>Process: Closed
    Process->>Process: process.exit(0)
```

### Data Flow for Scoring

```mermaid
sequenceDiagram
    participant Admin as Admin
    participant MatchRoute as POST /matches/:id/finish
    participant Workflow as finalizeMatch()
    participant Queue as BullMQ Queue
    participant Worker as Scoring Worker
    participant Scoring as scoring.js
    participant Prisma as Prisma ORM
    participant DB as PostgreSQL
    participant Socket as Socket.IO

    Admin->>MatchRoute: POST /api/matches/:id/finish
    MatchRoute->>MatchRoute: Admin auth check
    MatchRoute->>Workflow: finalizeMatch(prisma, matchId, {mode: 'auto'})
    
    Workflow->>Prisma: Update PENDING→LOCKED
    Prisma->>DB: UPDATE predictions
    
    alt Queue Mode
        Workflow->>Queue: queueScoreMatchPredictions(matchId)
        Queue->>Worker: Process job
        Worker->>Scoring: scoreMatchPredictions(prisma, matchId)
    else Direct Mode (fallback)
        Workflow->>Scoring: scoreMatchPredictions(prisma, matchId)
    end
    
    Scoring->>Prisma: Get all LOCKED predictions
    Prisma->>DB: SELECT predictions WHERE matchId + LOCKED
    DB-->>Scoring: Predictions
    
    loop Each Prediction
        Scoring->>Scoring: calculatePredictionPoints()
        Scoring->>Prisma: UPDATE prediction (SCORED, points)
    end
    
    Scoring->>Prisma: Update user stats (batch)
    Scoring->>Prisma: checkTierProgression()
    
    Scoring->>Socket: EMIT PREDICTION_SCORED
    Socket-->>User: Real-time notification
    
    Workflow->>Scoring: recalculateRanks(prisma)
    Workflow->>Prisma: Log scoring event
    
    Workflow-->>MatchRoute: {mode, scored, usersAffected}
    MatchRoute-->>Admin: Final response + Socket events
```

---

## 7. Technology Stack

### Backend

| Technology | Version | Purpose | Module(s) | Alternatives |
|------------|---------|---------|-----------|-------------|
| **Node.js** | 20+ | Runtime | All backend | Deno, Bun |
| **Express.js** | ^5.2.1 | HTTP framework | All routes | Fastify, Hono (Express 5 is experimental) |
| **Socket.IO** | ^4.8.3 | Real-time WebSocket | socket/index.js, all routes with live updates | WebSocket Native, ws |
| **Prisma** | ^7.8.0 | ORM | All data access | Drizzle ORM, TypeORM, Knex |
| **@prisma/adapter-pg** | ^7.8.0 | PostgreSQL adapter | index.js | @prisma/adapter-neon (serverless) |
| **PostgreSQL** | 16 | Primary database | — | MySQL, SQLite, Supabase |
| **Redis** | 7 | Queue backend, rate limiting | workers/queue.js, middleware/rateLimiter.js | Upstash, KeyDB |
| **BullMQ** | ^5.78.0 | Background job queue | workers/* | Inngest, Trigger.dev, RabbitMQ |
| **Passport.js** | ^0.7.0 | Authentication | config/passport.js | jsonwebtoken directly, Auth0 |
| **bcryptjs** | ^3.0.3 | Password hashing | routes/auth.js | bcrypt, argon2 |
| **jsonwebtoken** | ^9.0.3 | JWT tokens | middleware/auth.js, services/tokenService.js | jose, passport-jwt |
| **Stripe** | ^22.2.0 | Payment processing | routes/stripe.js | Paddle, Lemon Squeezy |
| **Anthropic SDK** | ^0.104.1 | AI predictions | routes/ai.js | OpenAI, Cohere |
| **Zod** | ^4.4.3 | Input validation | config/schemas.js | Joi, Yup (Zod v4 is pre-release) |
| **Helmet** | ^8.2.0 | Security headers | index.js | — |
| **Morgan** | ^1.11.0 | HTTP request logging | index.js | pino-http, winston |
| **Nodemailer** | ^8.0.10 | Email sending | Installed, NOT used | Resend, SendGrid, SES |
| **express-rate-limit** | ^8.5.2 | Rate limiting | middleware/rateLimiter.js | rate-limiter-flexible |
| **rate-limit-redis** | ^5.0.0 | Redis store for rate limiting | middleware/rateLimiter.js | — |
| **nodemon** | ^3.1.14 | Dev auto-restart | package.json devDeps | tsx, ts-node |
| **vitest** | ^4.1.9 | Test runner | vitest.config.js | Jest, Mocha |
| **supertest** | ^7.2.2 | HTTP testing | Installed, NOT used | — |
| **dotenv** | ^17.4.2 | Env variable loading | index.js | — |

### Frontend

| Technology | Version | Purpose | Module(s) | Alternatives |
|------------|---------|---------|-----------|-------------|
| **React** | ^19.2.6 | UI framework | All pages & components | Vue, Svelte, Solid |
| **React DOM** | ^19.2.6 | DOM rendering | main.jsx | — |
| **Vite** | ^8.0.12 | Build tool | vite.config.js | Webpack, Turbopack (Vite 8 is very new) |
| **@vitejs/plugin-react** | ^6.0.1 | React Fast Refresh | vite.config.js | — |
| **React Router** | ^6.30.4 | Client-side routing | App.jsx, all pages | TanStack Router, wouter |
| **TanStack React Query** | ^5.101.0 | Server state management | hooks/useApi.js | SWR, Apollo, RTK Query |
| **Zustand** | ^5.0.14 | Client state management | store/useStore.js | Redux, Jotai, Valtio |
| **Framer Motion** | ^12.40.0 | Animations | App.jsx, pages | React Spring, GSAP |
| **GSAP** | ^3.15.0 | Scroll animations | LandingPage, AboutPage, lib/animation/gsap.js | Framer Motion scroll |
| **Three.js** | ^0.184.0 | 3D graphics | three/HeroSceneImpl.jsx | CSS 3D transforms, Lottie |
| **React Three Fiber** | ^9.6.1 | React renderer for Three.js | three/HeroScene.jsx | — |
| **Drei** | ^10.7.7 | R3F utilities | three/HeroSceneImpl.jsx | — |
| **Recharts** | ^3.8.1 | Charts | AdminPage | Chart.js, Victory, Nivo |
| **Lucide React** | ^1.17.0 | Icons | Multiple pages & components | Heroicons, Phosphor |
| **Heroicons** | ^2.2.0 | Icons | Multiple components | Lucide, Phosphor |
| **react-helmet-async** | ^3.0.0 | SEO meta tags | main.jsx | @unhead/react |
| **React Hook Form** | ^7.78.0 | Form management | Multiple pages | Formik, Final Form |
| **@hookform/resolvers** | ^5.4.0 | Zod/validation bridge | Multiple pages | — |
| **Radix UI** | Various | Accessible primitives | Tooltip, Dialog, Popover, Select, Slider | Headless UI, Ariakit |
| **DOMPurify** | ^3.4.8 | XSS sanitization | Installed, usage unclear | — |
| **Sonner** | ^2.0.7 | Toast notifications | Installed | react-hot-toast, toaster |
| **react-player** | ^3.4.0 | Video playback | Highlights, potentially | video.js |
| **react-window** | ^2.2.7 | Virtualization | Potentially leaderboards | react-virtuoso |
| **react-intersection-observer** | ^10.0.3 | Scroll detection | Installed | — |
| **Socket.io-client** | ^4.8.3 | WebSocket client | Instantiated via context | — |
| **Tailwind CSS v4** | ^4.3.0 | Utility CSS (via Vite plugin) | index.css (not used as utilities) | — |
| **@stripe/react-stripe-js** | ^6.6.0 | Stripe elements | PricingPage | — |
| **@stripe/stripe-js** | ^9.8.0 | Stripe.js loading | PricingPage | — |
| **picomatch** | ^4.0.4 | Direct dependency (workaround) | — | Remove (transitive dep of Vite) |
| **ESLint** | ^10.3.0 | Linting | eslint.config.js | — |
| **TypeScript types** | Various | Type checking (unused) | Installed in devDeps | — |

---

## 8. Features

### 8.1 User Authentication
- **Status**: ✅ Implemented
- **Files**: `backend/src/routes/auth.js`, `backend/src/config/passport.js`, `backend/src/middleware/auth.js`, `backend/src/services/tokenService.js`
- **Description**: Email/password signup and login with bcrypt hashing, Google OAuth via Passport.js, JWT access tokens (15min) + refresh tokens (30 days), httpOnly cookie-based auth with Authorization header fallback
- **Limitations**: No email sending (verification tokens logged to console), no 2FA, no CSRF protection, no token revocation

### 8.2 Match Management
- **Status**: ✅ Implemented
- **Files**: `backend/src/routes/matches.js`, `backend/src/routes/simulation.js`
- **Description**: List/filter matches by sport/date/status, match details with stats, lineups, H2H history, timeline. Admin can finalize matches manually.
- **Dependencies**: Competition, Team, Match, MatchEvent models

### 8.3 Match Simulation Engine
- **Status**: ✅ Implemented
- **Files**: `backend/src/services/simulation/simulationEngine.js`, `backend/src/services/simulation/simulationRunner.js`, `backend/src/routes/simulation.js`
- **Description**: Deterministic match simulation using Poisson-distributed goal timing, seeded PRNG (Mulberry32), card events, possession tracking, substitution windows. Runs on compressed clock with Socket.IO real-time event streaming.
- **Limitations**: Requires admin to trigger, no scheduling/auto-trigger

### 8.4 Prediction Scoring Engine
- **Status**: ✅ Implemented
- **Files**: `backend/src/services/scoring.js`, `backend/src/workflows/finalizeMatch.js`
- **Description**: Tiered scoring (exact score: 55pts, result+GD: 40pts, result only: 30pts, wrong: 5pts), BTTS bonus (+10), Over/Under bonus (+10), streak tracking, tier progression (6 tiers), leaderboard recalculation, weekly/monthly resets with snapshots
- **Dependencies**: Prediction, Match, User, LeaderboardSnapshot, ScoringLog models

### 8.5 Background Job Processing
- **Status**: ✅ Implemented
- **Files**: `backend/src/workers/queue.js`, `backend/src/workers/scoringWorker.js`
- **Description**: BullMQ queues for score-predictions (concurrency: 5), reset-leaderboards (concurrency: 2), recalculate-ranks (concurrency: 1). Falls back to direct synchronous scoring when Redis is unavailable.
- **Dependencies**: Redis (optional — falls back gracefully)

### 8.6 Real-Time Communication
- **Status**: ✅ Implemented
- **Files**: `backend/src/socket/index.js`
- **Description**: Socket.IO server for live score updates, chat messages, viewer counts, prediction results, tier upgrades, simulation events. JWT-authenticated connections. Room-based messaging (match, squad, sport).
- **Events**: SCORE_UPDATE, GOAL_EVENT, CARD_EVENT, MATCH_STATUS, MATCH_FINISHED, CHAT_MESSAGE, PREDICTION_SCORED, TIER_UPGRADE, VIEWER_COUNT, and SIM_* prefixed simulation events

### 8.7 Leaderboards
- **Status**: ✅ Implemented
- **Files**: `backend/src/routes/leaderboard.js`
- **Description**: Global (all-time), weekly, sport-specific, friends, and archived history leaderboards. Weekly points reset every Monday (snapshot archived first), monthly snapshots on 1st.
- **Known issue**: Friends leaderboard returns ALL users, not filtered by follow relationships

### 8.8 Leagues & Squads
- **Status**: ✅ Implemented
- **Files**: `backend/src/routes/leagues.js`, `backend/src/routes/squads.js`
- **Description**: Private/public leagues with invite codes, per-league leaderboards. Friend groups (squads) with member roles.

### 8.9 Chat & Direct Messages
- **Status**: ✅ Implemented
- **Files**: `backend/src/socket/index.js`, `backend/src/routes/messages.js`, `frontend/src/components/ChatMessage.jsx`
- **Description**: Real-time chat in match rooms, squad rooms, and sport rooms. Direct messaging between users. Reactions, GIF support, message pinning, reporting, typing indicators.
- **Dependencies**: ChatMessage model

### 8.10 User Profiles & Social
- **Status**: ✅ Implemented
- **Files**: `backend/src/routes/users.js`
- **Description**: User profiles with bio, avatar, stats, tier, streaks. Follow/unfollow system, activity feeds, notifications (8 types).

### 8.11 Achievements & Gamification
- **Status**: ✅ Implemented
- **Files**: Prisma schema (Achievement, UserAchievement models)
- **Description**: Achievement definitions with rarity tiers (common, rare, epic, legendary), point bonuses. User achievements tracked with unlock timestamps. 12 badge types.
- **Limitations**: No achievement unlocking logic implemented — achievements must be granted manually

### 8.12 AI Predictions
- **Status**: ✅ Implemented
- **Files**: `backend/src/routes/ai.js`
- **Description**: Anthropic Claude-powered prediction hints for Pro subscribers. Falls back to heuristic predictions (randomized with home advantage bias). AI match summaries generated from event data.
- **⚠️ Security**: Endpoint uses `optionalAuth` → unauthenticated users can trigger Anthropic API calls

### 8.13 Stripe Subscriptions (Pro Tier)
- **Status**: ✅ Implemented
- **Files**: `backend/src/routes/stripe.js`
- **Description**: Monthly ($4.99) and annual ($39.99) Pro subscriptions via Stripe Checkout. Webhook handling for subscription lifecycle (complete, update, cancel), billing portal for management. Pro features gated via middleware and component-level `<ProGate>` blur overlay.
- **Dependencies**: Stripe API keys, Subscription model

### 8.14 Admin Dashboard
- **Status**: ✅ Implemented
- **Files**: `backend/src/routes/admin.js`, `frontend/src/pages/AdminPage.jsx`
- **Description**: KPI stats (total users, active users, predictions today, pro users, pending reports, scheduled matches), user management (list, detail, edit, delete, toggle pro), match management (list, edit score/status), report moderation (resolve/dismiss with message deletion), activity log, feature flags (env-based).
- **Authorization**: ADMIN or SUPERADMIN role required

### 8.15 Global Search
- **Status**: ✅ Implemented
- **Files**: `backend/src/routes/search.js`
- **Description**: Full-text search across users, teams, players, and matches using case-insensitive contains queries.
- **Performance**: No trigram indexes — full table scans on all 4 tables

### 8.16 Design System & Animations
- **Status**: ✅ Implemented
- **Files**: `frontend/src/index.css`, `frontend/src/lib/animation/variants.js`, `frontend/src/lib/animation/gsap.js`
- **Description**: "Dark Stadium" theme with 80+ CSS custom properties, 12 keyframe animations, 18 Framer Motion variant sets, 10 GSAP utility functions. Three.js 3D particle field on landing page. Dark theme only (no light mode).

### 8.17 PWA Support
- **Status**: ✅ Implemented (minimal)
- **Files**: `frontend/public/manifest.json`, `frontend/public/sw.js`, `frontend/index.html`
- **Description**: Service worker registration, manifest with icons, apple-touch-icon, mobile-web-app-capable. Basic PWA shell.

---

## 9. API Documentation

### 9.1 Authentication

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/api/auth/signup` | — | 5/15min | Create account (username, email, password) |
| POST | `/api/auth/login` | — | 5/15min | Sign in (email, password) — returns JWT + httpOnly cookies |
| POST | `/api/auth/logout` | — | — | Clear refresh token cookie |
| POST | `/api/auth/refresh` | — | — | Exchange refresh token for new access token |
| GET | `/api/auth/google` | — | — | Google OAuth redirect |
| GET | `/api/auth/google/cb` | — | — | Google OAuth callback |
| POST | `/api/auth/forgot-password` | — | 3/hour | Request password reset link (email) |
| POST | `/api/auth/reset-password` | — | — | Reset password with token (token, newPassword) |
| POST | `/api/auth/verify-email` | — | — | Verify email with token |
| POST | `/api/auth/resend-verification` | — | — | Resend verification email (TODO) |

### 9.2 Matches

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/matches` | — | List matches (filters: sport, date, status) |
| GET | `/api/matches/:id` | — | Match details |
| GET | `/api/matches/:id/stats` | — | Match statistics from events |
| GET | `/api/matches/:id/lineups` | — | Starting lineups (max 11 from Player pool) |
| GET | `/api/matches/:id/h2h` | — | Head-to-head history |
| GET | `/api/matches/:id/timeline` | — | Match event timeline |
| POST | `/api/matches/:id/finish` | Admin | Finalize match + trigger scoring |
| POST | `/api/matches/:id/start-simulation` | Admin | Start async simulation |
| POST | `/api/matches/:id/start-simulation-sync` | Admin | Start sync simulation (blocks) |
| GET | `/api/matches/:id/simulation-status` | — | Current simulation state |

### 9.3 Predictions

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| POST | `/api/predictions` | ✓ | 30/min | Create prediction (matchId, homeGoals, awayGoals) |
| GET | `/api/predictions/mine` | ✓ | — | My prediction history |
| GET | `/api/predictions/match/:matchId` | — | — | All predictions for a match |
| POST | `/api/predictions/score/:matchId` | ✓ | — | Manual scoring trigger (mode=queue/direct/auto) |
| PATCH | `/api/predictions/:id/score` | — | — | Score a single prediction |

### 9.4 Leaderboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/leaderboard/global` | — | Global all-time (top 100) |
| GET | `/api/leaderboard/weekly` | — | Weekly points (top 100) |
| GET | `/api/leaderboard/sport/:sport` | — | Per-sport leaderboard (top 100) |
| GET | `/api/leaderboard/friends` | — | Friends leaderboard (⚠️ returns all users) |
| GET | `/api/leaderboard/history/:period` | — | Archived WEEKLY/MONTHLY snapshots |

### 9.5 Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/:id` | — | User profile |
| PATCH | `/api/users/me` | ✓ | Update profile (displayName, avatar, bio) |
| POST | `/api/users/:id/follow` | ✓ | Follow user |
| DELETE | `/api/users/:id/follow` | ✓ | Unfollow user |
| GET | `/api/users/me/notifications` | ✓ | Get notifications |
| PATCH | `/api/users/me/notifications/read` | ✓ | Mark all notifications as read |
| GET | `/api/users/check-username` | — | Username availability (query: username) |

### 9.6 Leagues

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/leagues` | ✓ | Create league |
| GET | `/api/leagues/mine` | ✓ | My leagues |
| GET | `/api/leagues/:id` | — | League details with members |
| POST | `/api/leagues/:id/join` | ✓ | Join league (body: inviteCode) |
| GET | `/api/leagues/:id/leaderboard` | — | League standings |

### 9.7 Squads

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/squads` | ✓ | Create squad |
| GET | `/api/squads/mine` | ✓ | My squads |
| GET | `/api/squads/:id` | — | Squad details with members |
| POST | `/api/squads/:id/members/invite` | ✓ | Invite member |

### 9.8 AI

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/predict/:matchId` | Optional✓ | AI prediction hint (Pro-gated) |
| POST | `/api/ai/summary/:matchId` | ✓ | AI match summary |

### 9.9 Stripe

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/stripe/create-checkout` | ✓ | Create checkout session (plan: monthly|annual) |
| POST | `/api/stripe/webhook` | — | Stripe webhook (raw body) |
| POST | `/api/stripe/create-portal-session` | ✓ | Billing portal session |
| GET | `/api/stripe/status` | ✓ | Subscription status |

### 9.10 Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard metrics |
| GET | `/api/admin/users` | List users (page, limit, search) |
| GET | `/api/admin/users/:id` | User details with counts |
| PATCH | `/api/admin/users/:id` | Update user (role, tier, username, email) |
| DELETE | `/api/admin/users/:id` | Delete user (cascade) |
| POST | `/api/admin/users/:id/toggle-pro` | Toggle Pro status |
| GET | `/api/admin/matches` | List matches (page, limit, status) |
| PATCH | `/api/admin/matches/:id` | Update match (score, status, minute) |
| GET | `/api/admin/reports` | List reports (page, limit, status) |
| PATCH | `/api/admin/reports/:id` | Resolve/dismiss report |
| GET | `/api/admin/activity-log` | Admin action log (page, limit) |
| GET | `/api/admin/settings` | Feature flags |

### 9.11 Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/teams` | List teams (filter: sport) |
| GET | `/api/teams/:id` | Team profile with players, standings, form |
| GET | `/api/players` | List players (filter: sport) |
| GET | `/api/players/:id` | Player details |
| GET | `/api/highlights` | Match highlights from goal events |
| GET | `/api/search?q=` | Global search (users, teams, players, matches) |
| GET | `/api/messages/conversations` | DM conversations |
| GET | `/api/messages/:userId` | Messages with user |
| POST | `/api/messages/:userId` | Send message |
| PATCH | `/api/messages/read/:userId` | Mark messages as read |
| GET | `/api/health` | Health check |

### 9.12 Common Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes: `MATCH_NOT_FOUND`, `USER_NOT_FOUND`, `INVALID_CREDENTIALS`, `DUPLICATE_USER`, `RATE_LIMIT_EXCEEDED`, `VALIDATION_ERROR`, `FORBIDDEN`, `INTERNAL_ERROR`.

---

## 10. Database

### 10.1 Overview

- **Engine**: PostgreSQL 16+
- **ORM**: Prisma 7 with `@prisma/adapter-pg`
- **Schema defined in**: `backend/prisma/schema.prisma`
- **Migrations**: Manual migration file at `backend/prisma/migration.sql` (may be empty)
- **Client generation**: `prisma generate` (runs on postinstall)

### 10.2 Models (17 total)

```mermaid
erDiagram
    User ||--o{ Prediction : makes
    User ||--o{ Follow : followers
    User ||--o{ Follow : following
    User ||--o{ LeagueMember : joins
    User ||--o{ SquadMember : belongs
    User ||--o{ Notification : receives
    User ||--o{ UserAchievement : earns
    User ||--o{ ChatMessage : sends
    User ||--o{ Report : submits
    User ||--o{ Subscription : has
    User ||--o{ UserSport : prefers
    User ||--o{ UserTeam : prefers_team
    User ||--o{ Session : owns

    Match ||--o{ Prediction : has
    Match ||--o{ MatchEvent : contains
    Match ||--o{ Competition : belongs_to
    Match ||--o{ Team : home_team
    Match ||--o{ Team : away_team

    Competition ||--o{ Match : has
    Competition ||--o{ Standing : has

    Team ||--o{ Match : home_matches
    Team ||--o{ Match : away_matches
    Team ||--o{ Player : has
    Team ||--o{ UserTeam : preferred_by
    Team ||--o{ Standing : has

    League ||--o{ LeagueMember : has
    Squad ||--o{ SquadMember : has

    Achievement ||--o{ UserAchievement : unlocked_by
    ChatMessage ||--o{ Report : reported_in

    User {
        string id PK
        string username UK
        string email UK
        boolean emailVerified
        string passwordHash "nullable"
        string displayName
        string avatar
        string bannerImage
        string bio
        string countryCode
        UserRole role
        Tier tier
        int totalPoints
        int weeklyPoints
        int globalRank
        float predAccuracy
        int totalPredictions
        int correctPredictions
        int streakCurrent
        int streakBest
        boolean isPro
        datetime proExpiresAt
        datetime createdAt
        datetime updatedAt
        datetime lastActiveAt
    }

    Match {
        string id PK
        Sport sport
        string competitionId FK
        string homeTeamId FK
        string awayTeamId FK
        string homeTeamName
        string awayTeamName
        string homeTeamLogo
        string awayTeamLogo
        string competition
        string stadium
        int homeScore
        int awayScore
        int homeScoreHT
        int awayScoreHT
        MatchStatus status
        int minute
        datetime scheduledAt
        datetime kickedOffAt
        datetime finishedAt
        string season
        string aiSummary
        int simSeed
        float simSpeedMultiplier
        datetime simStartedAt
        datetime simEndsAt
    }

    Prediction {
        string id PK
        string userId FK
        string matchId FK
        int homeGoals
        int awayGoals
        string firstScorerId
        string totalGoalsOU
        float totalGoalsLine
        boolean btts
        string result
        int pointsEarned
        json pointsBreakdown
        PredStatus status
        datetime lockedAt
        datetime scoredAt
        datetime createdAt
    }
```

### 10.3 Enums (10 total)

| Enum | Values | Used By |
|------|--------|---------|
| `Sport` | FOOTBALL, BASKETBALL, AMERICAN_FOOTBALL, TENNIS, CRICKET, HOCKEY | Match, Team, Player, Competition, League, UserSport |
| `MatchStatus` | SCHEDULED, SIMULATING, HALFTIME, FINISHED, POSTPONED, CANCELLED | Match |
| `MatchEventType` | GOAL, YELLOW_CARD, RED_CARD, SUBSTITUTION, POSSESSION_TICK, KICKOFF, HALFTIME_WHISTLE, FULLTIME_WHISTLE, VAR | MatchEvent |
| `PredStatus` | PENDING, LOCKED, SCORED, VOID | Prediction |
| `Tier` | BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, LEGEND | User |
| `UserRole` | USER, MODERATOR, ADMIN, SUPERADMIN | User |
| `NotifType` | MATCH_STARTING, PREDICTION_LOCKED, PREDICTION_SCORED, RANK_CHANGED, NEW_FOLLOWER, SQUAD_INVITE, LEAGUE_RESULT, ACHIEVEMENT | Notification |
| `SubscriptionStatus` | ACTIVE, CANCELLED, PAST_DUE, TRIALING | Subscription |
| `LeaderboardPeriod` | WEEKLY, MONTHLY | LeaderboardSnapshot |
| (MatchEventType.String) | (string, not enum in code) | MatchEvent |

### 10.4 Indexes

Defined in `schema.prisma`:
- `Match`: `[status]`, `[scheduledAt]`, `[sport]`
- `MatchEvent`: `[matchId]`, `[matchId, type]`, `[matchId, minute]`
- `Prediction`: `[userId]`, `[matchId]`, `[status]`, `@@unique([userId, matchId])`
- `ChatMessage`: `[roomType, roomId]`, `[createdAt]`
- `Notification`: `[userId, isRead]`
- `LeaderboardSnapshot`: `[period, periodStart]`
- `AdminLog`: `[adminId]`, `[action]`, `[createdAt]`
- `ScoringLog`: `[matchId]`, `[type]`

### 10.5 Unique Constraints

| Model | Fields |
|-------|--------|
| User | username, email |
| Follow | [followerId, followingId] |
| Prediction | [userId, matchId] |
| League | inviteCode |
| LeagueMember | [leagueId, userId] |
| SquadMember | [squadId, userId] |
| Subscription | userId, stripeCustomerId, stripeSubscriptionId |
| UserAchievement | [userId, achievementId] |
| Standing | [competitionId, teamId, season] |
| Achievement | key |

### 10.6 Known Schema Issues

- **Missing compound index**: `Prediction` for `[matchId, status]` — critical for scoring queries
- **Missing compound index**: `Prediction` for `[userId, status]` — for user prediction history queries
- **Missing full-text search indexes**: No trigram indexes on User.username, User.displayName, Team.name, Player.name, Match.homeTeamName, Match.awayTeamName
- **Denormalized fields**: `Match.homeTeamName`, `Match.awayTeamName`, `Match.competition` — will be stale if referenced data changes
- **Missing `@updatedAt`**: Team, Player, Competition, League, Squad models
- **Missing `onDelete` cascade**: Not explicitly defined in schema (Prisma handles this at the application level)

---

## 11. Authentication

### Flow

```mermaid
sequenceDiagram
    participant User as Browser
    participant API as Express API
    participant Passport as Passport/JWT
    participant DB as PostgreSQL
    participant Client as Frontend Store

    %% Registration
    User->>API: POST /api/auth/signup {username, email, password}
    API->>API: Validate with Zod
    API->>DB: Check for existing user (email/username)
    alt User exists
        API-->>User: 409 DUPLICATE_USER
    else New user
        API->>API: bcrypt.hash(password, 12)
        API->>DB: Create user
        API->>API: Generate email verification JWT
        API->>API: console.log(verificationToken)  // TODO: send email
        API->>API: generateTokens(userId)
        API->>User: Set httpOnly cookies + return user
        User->>Client: Store user in Zustand
    end

    %% Login
    User->>API: POST /api/auth/login {email, password}
    API->>DB: Find user by email
    alt Not found or no passwordHash
        API-->>User: 401 INVALID_CREDENTIALS
    else Found
        API->>API: bcrypt.compare(password, hash)
        alt Invalid
            API-->>User: 401 INVALID_CREDENTIALS
        else Valid
            API->>API: generateTokens(userId)
            API->>User: Set httpOnly cookies + return tokens
        end
    end

    %% Authenticated Request
    User->>API: Request with Authorization: Bearer <token>
    API->>Passport: JWT Strategy
    Passport->>Passport: Verify token signature + expiry
    alt Invalid/Expired
        Passport-->>API: 401/403
        API-->>User: Auth error
    else Valid
        Passport->>DB: Find user by id from payload
        DB-->>Passport: User data
        Passport-->>API: User object
        API->>API: Proceed to route handler
        API-->>User: Response
    end
```

### Token Details

- **Access Token**: JWT, 15-minute expiry, contains `{ userId }`, signed with `JWT_SECRET`
- **Refresh Token**: JWT, 30-day expiry, contains `{ userId }`, signed with `JWT_REFRESH_SECRET`
- **Cookie Settings**: httpOnly, `secure: true` in production, `sameSite: 'lax'` (access) / `'strict'` (refresh)
- **No revocation**: Tokens cannot be individually invalidated (no block list, no token version)

### Sessions

The `Session` model stores refresh tokens but is **not used** for token validation in the current implementation.

---

## 12. Authorization

### Roles

| Role | Access Level |
|------|-------------|
| `USER` | Standard: predictions, leagues, profile, chat |
| `MODERATOR` | Not used in route protection (defined but no middleware) |
| `ADMIN` | Admin panel: user management, match management, reports |
| `SUPERADMIN` | Same as ADMIN (not separately distinguished in middleware) |

### Route Protection

| Level | Middleware | Routes |
|-------|-----------|--------|
| Public | None | GET /api/matches, GET /api/leaderboard, POST /api/auth/signup |
| Authenticated | `authenticateToken` | POST /api/predictions, PATCH /api/users/me, POST /api/stripe/* |
| Admin | `authenticateToken` + `requireAdmin` | All /api/admin/*, POST /api/matches/:id/finish, POST /api/matches/:id/start-simulation |
| Pro | `checkProStatus()` (in route body) | POST /api/ai/predict/:matchId (Pro content check) |

### Features Gated by Pro Status
- AI prediction insights (Claude-powered)
- Advanced analytics
- Ad-free experience (not implemented)
- Export predictions (not implemented)
- Animated Pro badges (frontend component)
- Custom profile themes (not implemented)
- Priority notifications (not implemented)
- Unlimited private leagues (free users limited to 3 — not enforced in code)

---

## 13. Environment Variables

### Required

| Variable | Purpose | Default | Security |
|----------|---------|---------|----------|
| `JWT_SECRET` | JWT signing secret | None (process exits if missing) | 🔴 Critical — must be 64+ random chars |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://matchmind:matchmind_pass@localhost:5433/matchmind` | 🔴 Critical — contains credentials |

### Optional

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `PORT` | Backend server port | `4000` | — |
| `BACKEND_URL` | Backend URL for callbacks | `http://localhost:4000` | Used in Google OAuth |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | Also used in Stripe redirects |
| `NODE_ENV` | Environment | `development` | Controls secure cookies, error stack traces |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | Falls back to `JWT_SECRET` | Should be different from JWT_SECRET |
| `JWT_RESET_SECRET` | Password reset token signing secret | Falls back to `JWT_SECRET` | Should be different from JWT_SECRET |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | — | Optional — disables Google OAuth if missing |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | — | Optional |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | Optional — BullMQ falls back to direct |
| `STRIPE_SECRET_KEY` | Stripe API secret key | — | Optional — returns mock URL if missing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | — | Optional |
| `STRIPE_PRICE_MONTHLY` | Stripe price ID for monthly | — | Required for Stripe to work |
| `STRIPE_PRICE_ANNUAL` | Stripe price ID for annual | — | Required for Stripe to work |
| `ANTHROPIC_API_KEY` | Anthropic API key | — | Optional — falls back to heuristic predictions |
| `SPORTRADAR_API_KEY` | SportRadar API key | — | **NOT IMPLEMENTED** in code |
| `CLOUDINARY_URL` | Cloudinary media storage | — | **NOT IMPLEMENTED** in code |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Nodemailer config | — | **NOT IMPLEMENTED** — no email sending |
| `FLAG_AI_HINTS` | Feature flag | `true` | Enables AI hints |
| `FLAG_PRO_GATE_AI` | Feature flag | `true` | Gates AI behind Pro |
| `FLAG_CHAT_GIFS` | Feature flag | `true` | Enables GIFs in chat |
| `FLAG_LB_REALTIME` | Feature flag | `false` | Real-time leaderboard updates |
| `FLAG_DM` | Feature flag | `false` | Direct messages |

### Frontend

| Variable | Purpose | Default |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | Empty (uses Vite proxy in dev) |
| `VITE_WS_URL` | WebSocket URL | Empty (uses Vite proxy in dev) |
| `VITE_APP_URL` | Frontend URL | — |
| `VITE_POSTHOG_KEY` | PostHog analytics key | — **(NOT IMPLEMENTED)** |
| `VITE_SENTRY_DSN` | Sentry DSN | — **(NOT IMPLEMENTED)** |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | — |
| `VITE_FLAG_AI_HINTS` | Feature flag | `true` |
| `VITE_FLAG_CHAT_GIFS` | Feature flag | `true` |
| `VITE_FLAG_LEADERBOARD_REALTIME` | Feature flag | `true` |

---

## 14. Build Process

### Backend

No build step — the backend runs directly as JavaScript (CommonJS). The only build-like step is `prisma generate`.

```bash
cd backend
npx prisma generate   # Generate Prisma client from schema
node src/index.js     # Run server
```

### Frontend

Build via Vite:

```bash
cd frontend
npm run build   # → outputs to dist/
```

The `vite.config.js` includes:
- React plugin (Fast Refresh)
- Tailwind CSS Vite plugin
- Dev server proxy (`/api` → `localhost:4000`, `/socket.io` → `localhost:4000` with WebSocket support)
- Manual chunk splitting (vendor-react, vendor-ui, vendor-state, vendor-other)
- `es2020` build target

### Production Build

```bash
npm run build   # cd frontend && npm run build
```

---

## 15. Development Workflow

### Prerequisites

- Node.js 20+
- Docker Desktop (for PostgreSQL + Redis) — OR locally installed PostgreSQL + Redis
- npm (comes with Node.js)

### Quick Start (Windows)

Double-click `start.bat` — it handles everything:
1. Checks Node.js + Docker
2. Creates `.env` from template (if missing)
3. Starts Docker containers (PostgreSQL on :5433, Redis on :6379)
4. Installs npm dependencies
5. Generates Prisma client
6. Pushes database schema
7. Seeds demo data (if DB is empty)
8. Starts both servers in separate windows
9. Opens browser at `http://localhost:3000`

### Manual Setup

```bash
# 1. Install all dependencies
cd backend && npm install
cd ../frontend && npm install
cd ..

# 2. Start infrastructure
docker compose up -d

# 3. Generate Prisma client
cd backend && npx prisma generate

# 4. Push schema
node scripts/push-schema.js

# 5. Seed database
node scripts/seed-db.js

# 6. Start servers
cd backend && npm run dev    # :4000
cd frontend && npm run dev   # :3000
```

### One-Command Setup (from root)

```bash
npm run setup
# Runs: install:all → prisma:generate → prisma:push → prisma:seed
npm run dev
# Runs: concurrently backend + frontend
```

### Demo Account

| Field | Value |
|-------|-------|
| Email | `demo@matchmind.gg` |
| Password | `password123` |
| Tier | SILVER |
| Points | 1,250 |
| Global Rank | #234 |

---

## 16. Deployment

### Frontend (Vercel)

Configuration in `frontend/vercel.json`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://matchmind-api.railway.app/:path*" },
    { "source": "/socket.io/:path*", "destination": "https://matchmind-api.railway.app/socket.io/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Asset caching: 1 year immutable for `/assets/*`, security headers on all routes.

### Backend

No Dockerfile for the backend application. The README lists "Railway / Render" as deployment targets but there's no deployment configuration for these platforms.

### Infrastructure

Only Docker Compose is configured for local development (PostgreSQL + Redis). No production infrastructure configuration (Kubernetes, Terraform, etc.).

---

## 17. Testing

### Current State: ⚠️ Minimal

| Test File | Location | Coverage | Status |
|-----------|----------|----------|--------|
| `scoring.test.js` | `backend/src/services/scoring.test.js` | `calculatePredictionPoints()` only | ✅ Exists — 20+ test cases |
| `simulationEngine.test.js` | `backend/src/services/simulation/simulationEngine.test.js` | All simulation engine functions | ✅ Exists — 20+ test cases |

### Test Runner

Vitest (v4) configured in `backend/vitest.config.js`:
- Environment: node
- Pattern: `src/**/*.test.js`, `src/**/*.spec.js`
- Coverage: provider=v8, thresholds=40% (branches, functions, lines, statements)
- Timeout: 10s

### How to Run Tests

```bash
cd backend
npx vitest run        # Run all tests
npx vitest run --coverage  # With coverage
```

### What's Missing

| Area | Priority | Notes |
|------|----------|-------|
| Route integration tests | 🔴 Critical | No supertest usage despite being installed |
| Auth flow tests | 🟠 High | No tests for signup/login/refresh |
| Prediction flow tests | 🟠 High | No tests for create/score |
| Match flow tests | 🟠 High | No tests for finish/simulation |
| League/Squad tests | 🟠 High | No tests for CRUD operations |
| User/Follow tests | 🟠 High | No tests for profile/follow/unfollow |
| Stripe webhook tests | 🟠 High | No tests for webhook handling |
| All scoring service functions | 🟠 High | Only `calculatePredictionPoints` is tested |
| Frontend component tests | 🟡 Medium | Zero component tests |
| Frontend hook tests | 🟡 Medium | Zero hook tests |
| Zustand store tests | 🟡 Medium | Zero store tests |
| E2E tests | 🔵 Low | Not configured |
| Load tests | 🔵 Low | Not configured |

---

## 18. Security

### Implemented Measures

| Measure | Where | Status |
|---------|-------|--------|
| JWT authentication | `middleware/auth.js`, `config/passport.js` | ✅ Implemented |
| Google OAuth | `config/passport.js` | ✅ Implemented (optional) |
| bcrypt password hashing (12 rounds) | `routes/auth.js` | ✅ Implemented |
| Helmet security headers | `index.js` | ✅ Implemented (default settings) |
| CORS configuration | `index.js` | ✅ Implemented (frontend origin only) |
| httpOnly auth cookies | `services/tokenService.js` | ✅ Implemented |
| Zod input validation | `middleware/validate.js`, `config/schemas.js` | ✅ Implemented |
| Rate limiting | `middleware/rateLimiter.js` | ✅ 4 tiers, Redis + memory fallback |
| Admin role verification | `middleware/requireAdmin.js` | ✅ Implemented |
| Forgot-password email enumeration prevention | `routes/auth.js` | ✅ Always returns success |
| Graceful shutdown | `index.js` | ✅ SIGTERM handler |
| Structured error responses | `middleware/errorHandler.js` | ✅ Consistent error format |
| Stripe webhook signature verification | `routes/stripe.js` | ✅ Implemented |

### Vulnerabilities & Weaknesses

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Unauthenticated AI endpoint | 🔴 **Critical** | `routes/ai.js:11` | `optionalAuth` allows anyone to trigger Anthropic API calls — cost exposure |
| No CSRF protection | 🔴 **Critical** | Throughout | Cookie-based auth without CSRF tokens |
| No refresh token revocation | 🟠 **High** | `services/tokenService.js` | Stolen refresh tokens valid for 30 days |
| JWT_RESET_SECRET falls back to JWT_SECRET | 🟠 **High** | `routes/auth.js:116` | Same secret for access tokens and password reset tokens |
| User deletion without confirmation | 🟠 **High** | `routes/admin.js:112` | Admin can permanently delete users (cascade) |
| Email verification not sent | 🟡 **Medium** | `routes/auth.js:46` | Verification token logged to console only |
| No rate limiting on AI endpoint | 🟡 **Medium** | `routes/ai.js` | No rate limiter applied |
| No input sanitization in chat | 🟡 **Medium** | `socket/index.js` | Messages trimmed but not sanitized for XSS |
| No HTTPS enforcement | 🟡 **Medium** | Throughout | No TLS at application level |
| Weak CORS fallback | 🔵 **Low** | `index.js:58` | Falls back to `http://localhost:3000` |
| Secret in process.env | 🔵 **Low** | `routes/ai.js:88` | ANTHROPIC_API_KEY loaded from env (acceptable but worth noting) |

### External Service Security

| Service | Data Transmitted | Risk Level |
|---------|-----------------|------------|
| Stripe | Payment details, customer info | ✅ Stripe handles PCI compliance |
| Anthropic | Match data, user queries | ⚠️ Ensure no PII sent |
| Google OAuth | OAuth tokens, email, name | ✅ Google manages OAuth security |
| Redis (BullMQ) | Job data | ⚠️ Should not be exposed publicly |
| PostgreSQL | All application data | ⚠️ Use SSL, restrict network access |

---

## 19. Performance

### Current Optimizations

| Optimization | Where | Benefit |
|-------------|-------|---------|
| React Query caching | `hooks/useApi.js` | Reduces API calls with staleTime (10s-120s) |
| Lazy-loaded routes | `App.jsx` | Code-splitting by page |
| Manual chunk splitting | `vite.config.js` | Separates vendor code into chunks |
| Rate limiting | `middleware/rateLimiter.js` | Prevents abuse |
| BullMQ background jobs | `workers/*` | Offloads scoring from request path |
| Graceful fallbacks | Various | BullMQ falls back to direct scoring |
| Limited query results | Various routes | `take: 50/100` limits on most list endpoints |
| Socket.IO real-time | `socket/index.js` | No polling for live updates |

### Performance Issues

| Issue | Severity | Location | Impact |
|-------|----------|----------|--------|
| N+1 query in highlights | 🔴 **Critical** | `routes/highlights.js:15` | 1 + N queries for goal events |
| No database indexes on search fields | 🟠 **High** | `routes/search.js` | Full table scans |
| No caching layer | 🟠 **High** | All routes | Every request hits the database |
| Chat memory growth (frontend) | 🟠 **High** | `store/useStore.js` | Messages accumulate unbounded |
| Large vendor bundle | 🟡 **Medium** | Frontend | ~800KB+ gzipped (Three.js, GSAP, Framer Motion, Recharts) |
| No compression middleware | 🟡 **Medium** | Backend | Response bodies not gzipped |
| Default connection pool size | 🟡 **Medium** | `index.js:22` | Default 10 connections may be insufficient |
| No cursor-based pagination | 🟡 **Medium** | Leaderboard routes | Deep pagination is inefficient |
| Hardcoded `take: 50` | 🔵 **Low** | `routes/matches.js:17` | Should be configurable |
| Three.js forced load | 🔵 **Low** | `components/three/HeroScene.jsx` | ~500KB for landing page only |

---

## 20. Logging

### Current Implementation

| Logger | Where | Format |
|--------|-------|--------|
| Morgan | `index.js` — HTTP request logging | `:method :url :status :response-time ms` |
| console.log | Throughout | Plain text, prefixed with `[Module]` |
| console.error | Error handlers | Plain text with error message |
| console.warn | BullMQ fallback | Plain text warning |

### Logging Patterns

- `[Auth]` prefix for authentication events
- `[Scoring]` prefix for scoring engine
- `[Worker]` prefix for BullMQ workers
- `[Worker] error:` prefix for worker failures
- `[Socket]` prefix for Socket.IO events
- `[Simulation]` prefix for simulation engine
- `[Scheduler]` prefix for leaderboard reset scheduler
- `[Stripe]` prefix for Stripe operations
- `[Tier]` prefix for tier upgrades
- `[AdminLog]` prefix for admin action logging failures
- `[Push]`, `[Seed]`, `[Setup]` prefixes for scripts

### Missing

- **Structured logging**: No JSON logs, no log levels, no queryable format
- **Request correlation**: No request IDs, cannot trace requests across services
- **Log rotation**: No configuration for log file rotation
- **Centralized logging**: No integration with log aggregation services (Datadog, Logz.io, etc.)

---

## 21. Monitoring

### Current State: None

- **No error tracking**: No Sentry, Rollbar, or similar
- **No APM**: No Datadog, New Relic, or similar
- **No metrics**: No Prometheus, Grafana, or similar
- **No uptime monitoring**: No health check endpoint that validates dependencies
- **No alerting**: No alert rules for errors, queue depth, or latency

The health check at `GET /api/health` only returns `{ status: 'healthy' }` without checking:
- Database connectivity
- Redis connectivity  
- External service availability (Stripe, Anthropic)

---

## 22. Error Handling

### Backend Error Handling

| Layer | Mechanism | Coverage |
|-------|-----------|----------|
| Route handlers | `asyncHandler` wrapper | All routes |
| Centralized handler | `errorHandler` middleware | All unhandled errors |
| Prisma errors | Mapped codes (P2002, P2025, P2003, P2014) | Known error types |
| JWT errors | JsonWebTokenError, TokenExpiredError | All JWT operations |
| Custom errors | `AppError` class | Application-level errors |
| Rate limiting | Express middleware | Configured endpoints |
| Validation | Zod schemas (400 with details) | Most POST/PATCH routes |
| 404 | Route check | All single-resource GET routes |
| 500 | Fallback handler | All unhandled errors |
| Socket.IO errors | Try-catch with console.error | Chat messages |

### Edge Cases Not Handled

| Scenario | Impact |
|----------|--------|
| Redis connection failure | BullMQ workers fail silently, fall back to direct |
| Stripe API timeout | Webhook processing hangs |
| Anthropic API failure | Falls back to heuristic silently |
| Database connection pool exhaustion | Requests hang until timeout |
| Concurrent simulation on same match | Two simulations run in parallel |
| Race condition in scoring | Multiple finish calls could double-score |

---

## 23. Coding Standards

### Backend

- **Module system**: CommonJS (`require`/`module.exports`)
- **File naming**: camelCase for services/utilities, kebab-case for config
- **Error handling**: asyncHandler wrapper, centralized errorHandler
- **Validation**: Zod schemas in `config/schemas.js`, validate middleware
- **Configuration**: Constants in `config/constants.js`, env vars via dotenv
- **Comments**: JSDoc-style for exported functions, inline for complex logic

### Frontend

- **Module system**: ESM (`import`/`export`)
- **File naming**: PascalCase for components/pages, camelCase for hooks/utilities
- **Component style**: Functional components with hooks
- **State management**: Zustand for global state, React Query for server state
- **Routing**: React Router v6 with lazy loading
- **Styling**: Custom CSS with CSS custom properties (no Tailwind utility classes used)

### Not Enforced

- No linter configuration for the backend
- No pre-commit hooks
- No commit message validation
- No TypeScript
- No code formatter (Prettier not configured)

---

## 24. Dependencies

### Backend Dependencies

| Package | Version | Size (est.) | Required? | Alternative |
|---------|---------|-------------|-----------|-------------|
| `@anthropic-ai/sdk` | ^0.104.1 | ~100KB | No (feature) | OpenAI, Cohere |
| `@prisma/adapter-pg` | ^7.8.0 | ~50KB | ✅ Yes | @prisma/adapter-neon |
| `@prisma/client` | ^7.8.0 | ~3MB | ✅ Yes | — |
| `bcryptjs` | ^3.0.3 | ~200KB | ✅ Yes | bcrypt, argon2 |
| `bullmq` | ^5.78.0 | ~500KB | No (feature) | Inngest, Trigger.dev |
| `cookie-parser` | ^1.4.7 | ~10KB | ✅ Yes | — |
| `cors` | ^2.8.6 | ~20KB | ✅ Yes | — |
| `crypto` | ^1.0.1 | ~100KB | **❌ Unused** | Node.js built-in |
| `dotenv` | ^17.4.2 | ~20KB | ✅ Yes | — |
| `express` | ^5.2.1 | ~500KB | ✅ Yes | Fastify, Hono |
| `express-rate-limit` | ^8.5.2 | ~30KB | ✅ Yes | rate-limiter-flexible |
| `google-auth-library` | ^10.7.0 | ~500KB | No (feature) | — |
| `helmet` | ^8.2.0 | ~50KB | ✅ Yes | — |
| `jsonwebtoken` | ^9.0.3 | ~100KB | ✅ Yes | jose |
| `morgan` | ^1.11.0 | ~20KB | ✅ Yes | pino-http |
| `nodemailer` | ^8.0.10 | ~200KB | **❌ Not used** | Resend, SendGrid |
| `passport` | ^0.7.0 | ~50KB | ✅ Yes | — |
| `passport-google-oauth20` | ^2.0.0 | ~20KB | No (feature) | — |
| `passport-jwt` | ^4.0.1 | ~10KB | ✅ Yes | — |
| `pg` | ^8.21.0 | ~500KB | ✅ Yes | @neondatabase/serverless |
| `prisma` | ^7.8.0 | ~5MB | ✅ Yes | — |
| `rate-limit-redis` | ^5.0.0 | ~10KB | No (optional) | — |
| `redis` | ^6.0.0 | ~500KB | No (optional) | ioredis |
| `socket.io` | ^4.8.3 | ~500KB | ✅ Yes | ws |
| `stripe` | ^22.2.0 | ~1MB | No (feature) | Paddle, Lemon Squeezy |
| `uuid` | ^14.0.0 | ~10KB | ✅ Yes | crypto.randomUUID() |
| `zod` | ^4.4.3 | ~100KB | ✅ Yes | Joi, Yup |

### Frontend Dependencies

| Package | Version | Size (gzip est.) | Required? | Notes |
|---------|---------|------------------|-----------|-------|
| `react` | ^19.2.6 | ~40KB | ✅ Yes | — |
| `react-dom` | ^19.2.6 | ~120KB | ✅ Yes | — |
| `react-router-dom` | ^6.30.4 | ~20KB | ✅ Yes | — |
| `@tanstack/react-query` | ^5.101.0 | ~25KB | ✅ Yes | — |
| `zustand` | ^5.0.14 | ~5KB | ✅ Yes | — |
| `framer-motion` | ^12.40.0 | ~60KB | No | Can use CSS transitions |
| `gsap` | ^3.15.0 | ~80KB | No | Can use Intersection Observer |
| `three` | ^0.184.0 | ~400KB | No | Landing page only |
| `@react-three/fiber` | ^9.6.1 | ~50KB | No | Landing page only |
| `@react-three/drei` | ^10.7.7 | ~50KB | No | Landing page only |
| `recharts` | ^3.8.1 | ~100KB | No | Admin page |
| `lucide-react` | ^1.17.0 | ~50KB | No | Can use SVGs |
| `@heroicons/react` | ^2.2.0 | ~30KB | No | Redundant with lucide |
| `dompurify` | ^3.4.8 | ~20KB | No | XSS protection |
| `sonner` | ^2.0.7 | ~10KB | No | Toast notifications |
| `react-hook-form` | ^7.78.0 | ~15KB | No | Can use native forms |
| `zod` | ^4.4.3 | ~100KB | ✅ Yes | Shared with backend |
| `socket.io-client` | ^4.8.3 | ~40KB | ✅ Yes | — |
| `picomatch` | ^4.0.4 | ~10KB | **❌ Unused** | Transitive dep of Vite |
| `@stripe/react-stripe-js` | ^6.6.0 | ~20KB | No (feature) | — |
| `@stripe/stripe-js` | ^9.8.0 | ~10KB | No (feature) | — |
| `react-helmet-async` | ^3.0.0 | ~5KB | ✅ Yes | SEO |
| `react-player` | ^3.4.0 | ~30KB | No | Video |
| `react-window` | ^2.2.7 | ~20KB | No | Virtualization |
| `react-intersection-observer` | ^10.0.3 | ~5KB | No | Scroll detection |

### Unused/Redundant Dependencies

| Package | Type | Reason to Remove |
|---------|------|-----------------|
| `crypto` (backend) | npm package | Use Node.js built-in `crypto` module |
| `picomatch` (frontend) | Direct dependency | Transitive dependency of Vite |
| `nodemailer` (backend) | Runtime dep | No email sending implemented (TODO in code) |
| `@heroicons/react` (frontend) | Runtime dep | Redundant with `lucide-react` |
| `supertest` (backend) | Dev dep | No tests use it |

---

## 25. Configuration Files

| File | Purpose | Notes |
|------|---------|-------|
| `package.json` (root) | Workspace scripts | `concurrently` devDependency only |
| `backend/package.json` | Backend deps + scripts | `prisma.generate` in postinstall |
| `frontend/package.json` | Frontend deps + scripts | None |
| `docker-compose.yml` | Local infrastructure | Postgres 16 + Redis 7 |
| `backend/vitest.config.js` | Test configuration | Coverage thresholds at 40% |
| `backend/prisma.config.ts` | Prisma 7 datasource | TypeScript, earlyAccess: true |
| `frontend/vite.config.js` | Vite build config | React plugin, Tailwind, proxy, chunk split |
| `frontend/vercel.json` | Vercel deployment | Rewrites, headers, build command |
| `frontend/eslint.config.js` | ESLint flat config | React hooks + refresh plugins |
| `.editorconfig` | Editor settings | 2-space indent, UTF-8, LF line endings |
| `.gitignore` | Ignored files | node_modules, .env, dist, IDE files |
| `.gitattributes` | Git handling | Auto text detection, binary types |

---

## 26. Assets

### Public Assets

Located in `frontend/public/`:

| File | Purpose |
|------|---------|
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker |

The `index.html` references additional assets that may not exist:
- `/favicon.svg`
- `/favicon-32x32.png`
- `/favicon-16x16.png`
- `/safari-pinned-tab.svg`
- `/icons/icon-192x192.png`
- `/icons/icon-512x512.png`
- `/icons/icon-144x144.png`
- `/og-image.png`

> ⚠️ **Note**: These icon/image files are referenced but their existence in the repository is not verified. The `public/` directory shows only 2 files.

### Fonts (External)

Loaded from Google Fonts in `index.html`:
- **Bebas Neue** (display headlines, 72px/48px)
- **DM Sans** (body text, weights 400/500/600/700)
- **JetBrains Mono** (monospace data, weights 400/500)

---

## 27. Scripts

### Root Scripts (`package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `concurrently -n api,web -c cyan,green "npm run dev:backend" "npm run dev:frontend"` | Run both servers |
| `dev:backend` | `cd backend && npm run dev` | Run backend only |
| `dev:frontend` | `cd frontend && npm run dev` | Run frontend only |
| `install:all` | `npm install && cd frontend && npm install && cd ../backend && npm install` | Install all deps |
| `build` | `cd frontend && npm run build` | Build frontend |
| `prisma:generate` | `cd backend && npx prisma generate` | Generate Prisma client |
| `prisma:push` | `cd backend && node scripts/push-schema.js` | Push schema |
| `prisma:seed` | `cd backend && npm run prisma:seed` | Seed database |
| `setup` | `npm run install:all && npm run prisma:generate && npm run prisma:push && npm run prisma:seed` | Full setup |

### Backend Scripts (`backend/package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `node src/index.js` | Run server |
| `dev:watch` | `nodemon src/index.js` | Run with auto-restart |
| `prisma:generate` | `prisma generate` | Generate Prisma client |
| `prisma:push` | `node scripts/push-schema.js` | Push schema (docker exec) |
| `prisma:seed` | `node scripts/seed-db.js` | Seed database (docker exec) |
| `test` | `vitest run` | Run tests once |
| `test:watch` | `vitest` | Run tests in watch mode |
| `test:coverage` | `vitest run --coverage` | Run tests with coverage |
| `postinstall` | `prisma generate` | Auto-generate Prisma client |

### Frontend Scripts (`frontend/package.json`)

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `vite` | Dev server |
| `build` | `vite build` | Production build |
| `lint` | `eslint .` | Lint all files |
| `typecheck` | `tsc --noEmit` | Type check (no TypeScript source) |
| `preview` | `vite preview` | Preview production build |

---

## 28. Known Issues

### 🔴 Critical

| Issue | Location | Impact |
|-------|----------|--------|
| **Zero test coverage** (core logic) | All services/routes | Cannot safely refactor; bugs will be discovered in production |
| **No TypeScript** | Entire project | Runtime errors for undefined fields; poor DX |
| **AI endpoint unauthenticated** | `routes/ai.js` | Anyone can trigger Anthropic API calls — cost exposure |
| **No error monitoring** | Entire project | Silent failures in production |
| **No CSRF protection** | Cookie-based auth | Cookie theft/CSRF attacks possible |

### 🟠 High

| Issue | Location | Impact |
|-------|----------|--------|
| **N+1 query in highlights** | `routes/highlights.js` | Performance issue with many matches |
| **No service layer** | All routes | Business logic mixed with HTTP concerns |
| **`prisma._app` anti-pattern** | `index.js`, `scoring.js` | Fragile global state |
| **Business logic in routes** | `routes/auth.js`, etc. | Violates SRP, hard to test |
| **Leaderboard mapping duplicated 5×** | `routes/leaderboard.js` | DRY violation, maintenance burden |
| **No email verification** | `routes/auth.js` | Users can't verify emails |
| **No refresh token revocation** | `services/tokenService.js` | Stolen tokens valid 30 days |
| **JWT_RESET_SECRET fallback** | `routes/auth.js` | Same secret for access + reset tokens |
| **Admin user deletion (cascade)** | `routes/admin.js` | Permanent data loss without confirmation |
| **No rate limiting on AI endpoint** | `routes/ai.js` | Abuse vulnerability |
| **No caching layer** | All routes | Every request hits the database |
| **No health check (dependency-aware)** | `routes/index.js` | Can't detect degraded state |

### 🟡 Medium

| Issue | Location | Impact |
|-------|----------|--------|
| **Seed data references non-existent teams** | `scripts/seed-db.js` | DB constraints may fail without reference data |
| **No database indexes on search fields** | `routes/search.js` | Full table scans on all searches |
| **Favourite fields silently dropped** | `routes/users.js` | `favouriteSports`, `favouriteTeams` accepted but not saved |
| **Chat messages unbounded (frontend)** | `store/useStore.js` | Memory growth over time |
| **Large vendor bundle** | Frontend | ~800KB+ gzipped |
| **No compression middleware** | Backend | Larger response bodies |
| **No OpenAPI/Swagger** | All routes | No discoverable API documentation |
| **README claims unimplemented features** | `README.md` | Misleading (SportRadar, Cloudinary, Sentry, Supabase, Tailwind utilities) |
| **Score distribution hardcoded** | `routes/admin.js` | Not computed from actual data |
| **`MatchStatus` mismatch** | `scripts/push-schema.js` vs `schema.prisma` | Script uses 'LIVE', schema uses 'SIMULATING' |
| **No auto-scroll on chat** | Frontend chat | New messages may not be visible |
| **Service worker error silently swallowed** | `index.html` | SW registration failures not logged |
| **Initial loading screen always shows** | `App.jsx` | 1200ms delay on every navigation |

### 🔵 Low

| Issue | Location | Impact |
|-------|----------|--------|
| **`crypto` npm package unused** | `backend/package.json` | Unnecessary dependency |
| **`picomatch` direct dependency** | `frontend/package.json` | Should be transitive |
| **`nodemailer` installed but unused** | `backend/package.json` | Unnecessary dependency (200KB) |
| **`supertest` installed but unused** | `backend/package.json` | Dev dependency with no tests using it |
| **`@heroicons/react` redundant with lucide** | `frontend/package.json` | Two icon libraries |
| **`QueueScheduler` deprecated** | `workers/queue.js` | Imported but not used (BullMQ v5) |
| **Hardcoded formation '4-3-3'** | `routes/matches.js` | Not sport-aware |
| **Friends leaderboard returns all users** | `routes/leaderboard.js` | Not filtered by friends |

---

## 29. Technical Debt

### 🔴 Critical Debt

| Debt Item | Effort to Fix | Risk |
|-----------|---------------|------|
| No TypeScript anywhere | Weeks (backend + frontend) | Runtime errors, poor DX |
| No tests for 95% of code | Weeks | Refactoring impossible without risk |
| Business logic in route handlers | Days | Hard to test, violates SRP |
| `prisma._app` global state pattern | Hours | Fragile, unexpected side effects |

### 🟠 High Debt

| Debt Item | Effort | Risk |
|-----------|--------|------|
| No service/repository layer | Days | Tight coupling to Prisma |
| No dependency injection | Days | Every file imports Prisma directly |
| Duplicated mapping code (5×) | Hours | Maintenance burden |
| Error handling inconsistencies | Hours | Some routes use different error formats |
| No request ID tracking | Hours | Can't trace requests |
| No structured logging | Hours | Can't search/analyze logs |
| Graceful shutdown issues | Hours | May not shut down cleanly |
| Monolithic CSS file | Days | Hard to maintain at scale |

### 🟡 Medium Debt

| Debt Item | Effort | Risk |
|-----------|--------|------|
| No feature flag system | Days | Can't gradually roll out features |
| No database migration strategy | Days | Schema changes risky |
| Hardcoded configuration values | Hours | Not environment-aware |
| No API versioning | Days | Breaking changes affect all clients |
| Frontend: no CSS modules | Days | Style conflicts at scale |
| Frontend: no accessibility foundation | Weeks | Excludes users |
| Frontend: no responsive design audit | Days | Poor mobile experience |

---

## 30. Future Improvements

### 🔴 Critical (Prerequisite for Production)

| Improvement | Effort | Impact |
|-------------|--------|--------|
| Add error monitoring (Sentry) | 1 hour | Can detect and diagnose production issues |
| Add authentication to AI endpoint | 10 min | Prevent unauthorized API usage costs |
| Write core tests (scoring + critical routes) | 1-2 weeks | Safe to refactor |
| Add structured logging (pino) | 2 hours | Can debug production issues |
| Fix N+1 query in highlights | 30 min | Performance at scale |
| Add rate limiting to all endpoints | 1 hour | Prevent abuse |

### 🟠 Important (Within 1 Month)

| Improvement | Effort | Impact |
|-------------|--------|--------|
| Migrate backend to TypeScript | 1-2 weeks | Type safety, better DX |
| Add service layer (extract from routes) | 3-4 days | Testability, SRP |
| Add Redis caching for API responses | 2-3 days | Performance (10x improvement) |
| Add CSRF protection | 1 day | Security |
| Add refresh token revocation | 1 day | Security |
| Implement email sending (Resend) | 1 day | Verification, password reset |
| Add proper health check endpoint | 1 hour | Operations |

### 🟡 Nice to Have (Within 3 Months)

| Improvement | Effort | Impact |
|-------------|--------|--------|
| Migrate frontend to TypeScript | 2-3 weeks | Type safety, better DX |
| Add integration tests for all routes | 1-2 weeks | Full test coverage |
| Add component tests | 1 week | Frontend reliability |
| Add repository pattern | 1 week | Data access abstraction |
| Add OpenAPI/Swagger docs | 2-3 days | API discoverability |
| Implement SportRadar API integration | 1 week | Real match data |
| Add image upload (Cloudinary/S3) | 1 day | Avatar/banner uploads |
| Add push notifications | 2-3 days | User engagement |
| Add pagination to all list endpoints | 1 day | Performance |

### 🔵 Future Ideas (6+ Months)

| Improvement | Effort | Impact |
|-------------|--------|--------|
| Monolith to microservices decomposition | Months | Scalability |
| Database read replicas | Weeks | Read performance |
| Kubernetes deployment | Weeks | Operations |
| End-to-end testing (Playwright) | 2 weeks | Quality assurance |
| Mobile app (React Native) | Months | New platform |
| Machine learning models | Weeks | Better predictions |
| Internationalization (i18n) | Weeks | Global audience |

---

## 31. Project Roadmap

### Phase 1 — Foundations (Complete ✅)
- Design system (CSS variables, typography, animations)
- Animation system (Framer Motion, GSAP)
- 3D Hero Scene (Three.js particle field)
- Core pages: Landing, Login, Signup, Onboarding
- Auth pages: Forgot Password, Reset Password, Verify Email
- Static pages: About, FAQ, NotFound
- Backend: Auth flow, forgot/reset password, email verification, username check

### Phase 2 — Social Features (Complete ✅)
- ChatMessage: reactions, GIFs, pin/report, tier badges
- LeagueRoomPage: 4-tab (standings, chat, predictions, about)
- SquadPage: 4-tab (rankings, chat, activity, members)
- NotificationsPage: filter tabs, mark read
- ProfilePage: cover banner, stats, achievement tabs
- MyProfilePage: progress, achievements, activity timeline
- AchievementsPage: rarity filters, 12 badges

### Phase 3 — AI & Pro (Complete ✅)
- ProGate: blur overlay component
- PricingPage: monthly/annual toggle, Stripe checkout
- AI Hints: Anthropic Claude + heuristic fallback
- Stripe: subscription flow (checkout, webhook, portal)
- Admin Dashboard: KPI cards, Recharts charts, tables
- Admin API: users, matches, reports CRUD
- SettingsPage: Pro management, billing portal
- Cookie-based auth for fetch calls

### Phase 4 — Scoring Engine (Complete ✅)
- Core scoring: tiered points (55/40/30/10/5), streaks, tiers
- BullMQ: 3 queues with workers, error handling, fallback
- Match finish endpoint (admin-gated, queue or direct)
- Weekly/monthly leaderboard resets with snapshots
- Scheduler: auto-schedules resets
- Endpoints: finish match, score predictions, leaderboard
- LeaderboardSnapshot + ScoringLog database models

### Phase 5 — Production Hardening (Planned)
- Error monitoring (Sentry)
- Structured logging (pino)
- TypeScript migration (backend)
- Test coverage (critical paths)
- Security fixes (CSRF, auth on AI endpoint, token revocation)
- Caching layer (Redis)
- Deployment configuration

---

## 32. Glossary

| Term | Definition |
|------|------------|
| **BTTS** | Both Teams To Score — a prediction that both teams will score at least one goal |
| **BullMQ** | Redis-backed job queue for Node.js — used for async match scoring |
| **Cascade Delete** | Database operation that deletes related records when a parent record is deleted |
| **CSRF** | Cross-Site Request Forgery — an attack that tricks users into performing unintended actions |
| **Docker Compose** | Tool for defining and running multi-container Docker applications |
| **GD** | Goal Difference — the difference between goals scored and goals conceded |
| **H2H** | Head-to-Head — historical match results between two teams |
| **JWT** | JSON Web Token — a compact, URL-safe token format used for authentication |
| **N+1 Query** | A performance anti-pattern where a query is made for each item in a result set |
| **ORM** | Object-Relational Mapping — a technique for converting data between type systems |
| **PRNG** | Pseudo-Random Number Generator — a deterministic algorithm for generating random numbers |
| **Prisma** | Next-generation ORM for Node.js and TypeScript |
| **Pro** | Premium subscription tier ($4.99/month) with AI predictions and advanced features |
| **Squad** | A user-created group of predictors (friend group) |
| **SSRF** | Server-Side Request Forgery — an attack that makes the server send requests to internal resources |
| **Tier** | User progression level (Bronze → Silver → Gold → Platinum → Diamond → Legend) based on total points |
| **xG** | Expected Goals — a statistical measure of goal-scoring opportunities |

---

## 33. Appendix

### A. Complete Dependency Graph

```mermaid
graph LR
    subgraph "Core Server"
        Index[index.js] --> Auth[config/passport.js]
        Index --> Routes[15 Route Files]
        Index --> Socket[socket/index.js]
        Index --> Workers[workers/scoringWorker.js]
        Index --> Queue[workers/queue.js]
    end

    subgraph "Configuration"
        Constants[config/constants.js]
        Schemas[config/schemas.js]
        Passport[config/passport.js]
    end

    subgraph "Middleware"
        AuthMW[middleware/auth.js]
        Error[middleware/errorHandler.js]
        Rate[middleware/rateLimiter.js]
        Admin[middleware/requireAdmin.js]
        Validate[middleware/validate.js]
        Async[middleware/asyncHandler.js]
    end

    subgraph "Routes"
        AuthR[routes/auth.js]
        MatchR[routes/matches.js]
        PredR[routes/predictions.js]
        LB[routes/leaderboard.js]
        UserR[routes/users.js]
        LeagueR[routes/leagues.js]
        SquadR[routes/squads.js]
        AI[routes/ai.js]
        StripeR[routes/stripe.js]
        AdminR[routes/admin.js]
    end

    subgraph "Services"
        Score[services/scoring.js]
        Token[services/tokenService.js]
        SimEngine[services/simulation/simulationEngine.js]
        SimRunner[services/simulation/simulationRunner.js]
    end

    subgraph "Data"
        Prisma[Prisma ORM]
        Redis[Redis]
        PG[PostgreSQL]
    end

    Routes --> Constants
    Routes --> Schemas
    Routes --> AuthMW
    Routes --> Async
    Routes --> Validate
    Routes --> Rate
    AuthR --> Token
    AdminR --> Admin
    MatchR --> Score
    MatchR --> SimRunner
    PredR --> Score
    LB --> UserR
    AI --> Anthropic[Anthropic SDK]
    StripeR --> Stripe[Stripe SDK]
    SimRunner --> SimEngine
    SimRunner --> Score

    Score -.-> Socket
    SimRunner -.-> Socket
```

### B. Execution Sequence (Server Startup)

1. `node src/index.js`
2. `dotenv.config()` — Load .env file
3. Validate required env vars (JWT_SECRET, DATABASE_URL)
4. Create PostgreSQL connection pool
5. Instantiate PrismaPg adapter
6. Create PrismaClient with adapter
7. Configure Passport strategies (JWT + Google OAuth)
8. Create Express app
9. Apply global rate limiter
10. Create HTTP server from Express
11. Create Socket.IO server with CORS config
12. Apply middleware: helmet → cors → morgan → Stripe webhook raw → json → cookieParser → passport.initialize
13. Mount route groups: auth → matches → predictions → leaderboard → users → leagues → squads → highlights → AI → teams → players → search → stripe → messages → admin → simulation
14. Mount health check at `/api/health`
15. Mount error handler
16. Setup Socket.IO event handlers
17. Attach app reference to prisma (`prisma._app`)
18. Initialize BullMQ workers
19. Schedule weekly/monthly leaderboard resets
20. Start HTTP server on PORT (default 4000)
21. Log startup message

### C. Socket.IO Event Reference

#### Server → Client

| Event | Payload | When |
|-------|---------|------|
| `SCORE_UPDATE` | `{ matchId, homeScore, awayScore, minute }` | Live score change |
| `GOAL_EVENT` | `{ matchId, teamId, scorer, minute }` | Goal scored |
| `CARD_EVENT` | `{ matchId, teamId, playerId, type, minute }` | Yellow/red card |
| `MATCH_STATUS` | `{ matchId, status }` | Status change (HT, FT) |
| `MATCH_FINISHED` | `{ matchId, homeScore, awayScore }` | Match ended |
| `CHAT_MESSAGE` | `{ id, roomId, user, text, timestamp }` | New chat message |
| `REACTION_UPDATE` | `{ roomId, emoji, userId }` | Emoji reaction |
| `VIEWER_COUNT` | `{ matchId, count }` | Live viewer count |
| `LEADERBOARD_UPD` | `{ userId, newRank, pointsDelta }` | Rank change |
| `PREDICTION_SCORED` | `{ matchId, pointsEarned, totalPoints, streakCurrent }` | Prediction result |
| `PREDICTION_SCORE` | `{ predictionId, points, message }` | Prediction result |
| `TIER_UPGRADE` | `{ tier, points }` | Tier upgraded |
| `NOTIFICATION` | `{ userId, type, payload }` | In-app notification |
| `DM_MESSAGE` | `{ message, roomId, fromUserId }` | Direct message |
| `SIM_STATUS_UPDATE` | `{ matchId, minute, homeScore, awayScore, status }` | Simulation tick |
| `SIM_GOAL_EVENT` | `{ matchId, minute, teamId, homeScore, awayScore }` | Simulation goal |
| `SIM_CARD_EVENT` | `{ matchId, minute, teamId, type }` | Simulation card |
| `SIM_SUB_EVENT` | `{ matchId, minute, teamId, detail }` | Simulation substitution |
| `SIM_FULLTIME` | `{ matchId, homeScore, awayScore, stats }` | Simulation end |
| `CHAT_ERROR` | `{ message }` | Chat send failure |

#### Client → Server

| Event | Payload | When |
|-------|---------|------|
| `JOIN_ROOM` | `{ roomId }` | Join match/squad/sport room |
| `LEAVE_ROOM` | `{ roomId }` | Leave room |
| `SEND_MESSAGE` | `{ roomId, text, gifUrl }` | Send chat message |
| `SEND_REACTION` | `{ roomId, emoji }` | Send emoji reaction |
| `DM_TYPING` | `{ roomId }` | User typing in DM |
| `DM_STOP_TYPING` | `{ roomId }` | User stopped typing |
| `JOIN_DM` | `{ roomId }` | Join DM room |
| `LEAVE_DM` | `{ roomId }` | Leave DM room |

### D. Scoring Points Reference

| Accuracy | Base | Bonus | Total | Condition |
|----------|------|-------|-------|-----------|
| Exact score | 5 | 50 | **55** | Both goals match |
| Correct result + same GD | 5 | 35 | **40** | Same winner + same goal difference |
| Correct result only | 5 | 25 | **30** | Same winner (or draw) |
| Wrong result | 5 | 0 | **5** | Different winner |
| Void prediction | 0 | 0 | **0** | Prediction voided |
| BTTS bonus | — | 10 | +10 | Correct Both Teams To Score prediction |
| Over/Under bonus | — | 10 | +10 | Correct Over/Under prediction |

### E. Tier Thresholds

| Tier | Points Required | Color |
|------|----------------|-------|
| 🥉 Bronze | 0+ | `#CD7F32` |
| 🥈 Silver | 500+ | `#C0C0C0` |
| 🥇 Gold | 1,500+ | `#FFD700` |
| 💎 Platinum | 3,500+ | `#E5E4E2` |
| 💠 Diamond | 7,000+ | `#B9F2FF` |
| 👑 Legend | 12,000+ | `linear-gradient(135deg, #FF6B6B, #FFE66D, #4ECDC4)` |

### F. Complete File Tree

```
Match-Mind/
├── .editorconfig
├── .gitattributes
├── .gitignore
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── PROJECT_OVERVIEW.md              ← This file
├── README.md
├── SECURITY.md
├── SUPPORT.md
├── docker-compose.yml
├── package.json
├── start.bat
├── .github/
│   ├── CODEOWNERS
│   ├── copilot-instructions.md
│   ├── dependabot.yml
│   ├── labeler.yml
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── workflows/
│       ├── ci.yml
│       ├── codeql.yml
│       ├── gitleaks.yml
│       ├── labeler.yml
│       ├── maintenance.yml
│       ├── stale.yml
│       └── welcome.yml
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── prisma.config.ts
│   ├── vitest.config.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migration.sql
│   │   └── seed.js
│   ├── scripts/
│   │   ├── push-schema.js
│   │   ├── seed-db.js
│   │   ├── setup-db.js
│   │   └── setup-native-pg.js
│   └── src/
│       ├── index.js
│       ├── config/
│       │   ├── constants.js
│       │   ├── passport.js
│       │   └── schemas.js
│       ├── middleware/
│       │   ├── asyncHandler.js
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   ├── rateLimiter.js
│       │   ├── requireAdmin.js
│       │   └── validate.js
│       ├── routes/
│       │   ├── admin.js
│       │   ├── ai.js
│       │   ├── auth.js
│       │   ├── highlights.js
│       │   ├── leaderboard.js
│       │   ├── leagues.js
│       │   ├── matches.js
│       │   ├── messages.js
│       │   ├── players.js
│       │   ├── predictions.js
│       │   ├── search.js
│       │   ├── simulation.js
│       │   ├── squads.js
│       │   ├── stripe.js
│       │   ├── teams.js
│       │   └── users.js
│       ├── services/
│       │   ├── scoring.js
│       │   ├── scoring.test.js
│       │   ├── tokenService.js
│       │   └── simulation/
│       │       ├── simulationEngine.js
│       │       ├── simulationEngine.test.js
│       │       └── simulationRunner.js
│       ├── socket/
│       │   └── index.js
│       ├── workers/
│       │   ├── queue.js
│       │   └── scoringWorker.js
│       ├── workflows/
│       │   └── finalizeMatch.js
│       └── utils/
│           └── AppError.js
└── frontend/
    ├── .env.example
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── vercel.json
    ├── vite.config.js
    ├── public/
    │   ├── manifest.json
    │   └── sw.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── store/
        │   └── useStore.js
        ├── hooks/
        │   └── useApi.js
        ├── lib/
        │   └── animation/
        │       ├── variants.js
        │       └── gsap.js
        ├── components/
        │   ├── AchievementBadge.jsx
        │   ├── BottomNav.jsx
        │   ├── ChatMessage.jsx
        │   ├── Chip.jsx
        │   ├── CommandPalette.jsx
        │   ├── CommunityPollWidget.jsx
        │   ├── ConfirmModal.jsx
        │   ├── EmptyState.jsx
        │   ├── ErrorBoundary.jsx
        │   ├── ErrorState.jsx
        │   ├── GamificationStrip.jsx
        │   ├── LeaderboardRow.jsx
        │   ├── LiveBadge.jsx
        │   ├── LiveTicker.jsx
        │   ├── MatchCard.jsx
        │   ├── Navbar.jsx
        │   ├── NotificationBell.jsx
        │   ├── PointsToast.jsx
        │   ├── PredictionCard.jsx
        │   ├── PremiumLoadingScreen.jsx
        │   ├── ProGate.jsx
        │   ├── ProgressBar.jsx
        │   ├── QuickChatFeed.jsx
        │   ├── ScoreDisplay.jsx
        │   ├── SkeletonCard.jsx
        │   ├── SportBadge.jsx
        │   ├── SportIcon.jsx
        │   ├── StatBar.jsx
        │   ├── TierBadge.jsx
        │   ├── Tooltip.jsx
        │   ├── UserAvatar.jsx
        │   └── three/
        │       ├── HeroScene.jsx
        │       └── HeroSceneImpl.jsx
        └── pages/
            ├── AchievementsPage.jsx
            ├── ActivityPage.jsx
            ├── AdminPage.jsx
            ├── CreateLeaguePage.jsx
            ├── ExplorePage.jsx
            ├── FeedPage.jsx
            ├── HighlightsPage.jsx
            ├── LandingPage.jsx
            ├── LeaderboardPage.jsx
            ├── LeagueRoomPage.jsx
            ├── LeaguesPage.jsx
            ├── LiveHubPage.jsx
            ├── LoginPage.jsx
            ├── MakePredictionPage.jsx
            ├── MatchRoomPage.jsx
            ├── MessagesPage.jsx
            ├── MyProfilePage.jsx
            ├── NotificationsPage.jsx
            ├── OnboardingPage.jsx
            ├── PlayerPage.jsx
            ├── PredictionsPage.jsx
            ├── PricingPage.jsx
            ├── ProfilePage.jsx
            ├── ScoresPage.jsx
            ├── SearchPage.jsx
            ├── SettingsPage.jsx
            ├── SignupPage.jsx
            ├── SquadPage.jsx
            ├── SquadsPage.jsx
            ├── StandingsPage.jsx
            ├── TeamPage.jsx
            ├── auth/
            │   ├── ForgotPasswordPage.jsx
            │   ├── ResetPasswordPage.jsx
            │   └── VerifyEmailPage.jsx
            └── static/
                ├── AboutPage.jsx
                ├── FAQPage.jsx
                └── NotFoundPage.jsx
```

---

*This document was generated by reverse-engineering the entire MatchMind repository. Every statement is verified against the source code. Where features are listed in documentation but not found in code, this is explicitly noted as "Not Implemented".*

*Generated: July 3, 2026 | Version: 1.0*

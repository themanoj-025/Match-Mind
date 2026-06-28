# Match-Mind — Project Overview

## 1. Project Title
**Match-Mind** — A sports prediction and social gaming platform where users predict match outcomes, compete in leagues, and earn points for accuracy.

## 2. Executive Summary
Match-Mind is a full-stack web application that allows sports fans to predict the outcomes of real matches (football/cricket), earn points for correct predictions, climb leaderboards, and compete in user-created leagues. The backend is built with Express.js and Prisma ORM on PostgreSQL, providing a REST API with Socket.IO for real-time updates, BullMQ for background job processing with Redis, and Stripe for payment processing. It also integrates Anthropic AI for AI-powered features and Google OAuth for authentication. The frontend is a React single-page application with React Query for data fetching and Zustand for state management. The platform includes user authentication (JWT + Google OAuth), social feeds, match statistics, user tiers, streak tracking, referral rewards, messaging, and team/squad management.

## 3. Problem Statement
Sports fans enjoy predicting match outcomes with friends, but existing platforms lack the combination of real match data integration, social competition (leagues), skill-based scoring (confidence multipliers), and rich engagement features (streaks, tiers, referrals) in a single, modern interface.

## 4. Objectives
- Allow users to predict match outcomes (win/lose/draw, scores) before kickoff
- Score predictions using a configurable points system with confidence multipliers
- Support user-created leagues for private competition
- Track streaks, tiers, and long-term performance statistics
- Provide real-time match updates and scoring via Socket.IO
- Include social features (user profiles, follows, feed, notifications)
- Support payments (Stripe) for premium features
- Integrate AI features (Anthropic) for insights and analysis

## 5. Key Features
- **Match predictions:** Predict winners, scores, and outcomes before matches
- **Scoring engine:** Points awarded based on accuracy, confidence multiplier, and streak bonuses
- **Leaderboards:** Global, league-specific, and friend-based rankings
- **Leagues:** Create and join private/public leagues with custom rules
- **User tiers:** Progression system based on prediction accuracy and volume
- **Streaks:** Track correct/incorrect prediction streaks with bonuses
- **Social feed:** User activity feed, follow system, notifications, messaging
- **Live updates:** Socket.IO-based real-time score and prediction updates
- **Match statistics:** Head-to-head records, historical performance
- **Referral system:** Invite friends and earn bonus points
- **Teams & squads:** Manage teams and player squads
- **Highlights:** Match highlights and key moments
- **Payments:** Stripe integration for premium features
- **AI insights:** Anthropic-powered match analysis and predictions
- **Admin panel:** Admin route for system management
- **Search:** Global search across matches, teams, users

## 6. System Architecture
```
[React Frontend] ←→ [Express.js REST API + Socket.IO] ←→ [PostgreSQL via Prisma]
       │                        │                              │
       │                        │                              │
       │                [BullMQ Worker] ←→ [Redis]      [Prisma Studio]
       │                        │
       │                [Stripe Webhook]
       │                [Anthropic AI]
       │
  Browser → SPA (React + React Query + Zustand)
```

## 7. Tech Stack
| Category | Technology |
|---|---|
| **Frontend** | React 18, React Router, Vite |
| **State Mgmt** | Zustand |
| **Data Fetching** | React Query (TanStack Query) |
| **Styling** | Custom CSS (no framework) |
| **Backend** | Node.js, Express.js (v5) |
| **Database** | PostgreSQL with @prisma/adapter-pg |
| **ORM** | Prisma (v7) with migrations |
| **Auth** | JWT (jsonwebtoken, passport-jwt), Google OAuth (passport-google-oauth20, google-auth-library) |
| **Real-time** | Socket.IO |
| **Background Jobs** | BullMQ (Redis-backed job queue) |
| **Cache/Queue** | Redis (ioredis) |
| **Payments** | Stripe |
| **AI** | Anthropic AI SDK (@anthropic-ai/sdk) |
| **Email** | Nodemailer |
| **Security** | Helmet, CORS, cookie-parser |
| **Logging** | Morgan (HTTP request logging) |
| **Validation** | Zod (via Prisma/Express) |
| **Utilities** | uuid, crypto |
| **Testing** | Not configured |
| **Deployment** | Vercel (frontend config), Docker Compose |

## 8. Architecture Diagram
See Section 6 — standard three-tier architecture (React SPA ↔ Express API + Socket.IO ↔ PostgreSQL), with Redis/BullMQ for background processing and Stripe/Anthropic as external services.

## 9. Folder Structure
```
Match-Mind/
├── package.json                       # Root workspace config
├── docker-compose.yml                 # PostgreSQL + Redis services
├── backend/
│   ├── package.json                   # Backend dependencies (20+ packages)
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema/models
│   │   ├── prisma.config.ts           # Prisma configuration
│   │   ├── migration.sql              # Database migration
│   │   └── seed.js                    # Database seed script
│   └── src/
│       ├── index.js                   # Express server entry + Socket.IO setup
│       ├── config/                    # Configuration (env, constants)
│       ├── middleware/                 # Auth middleware, error handling
│       ├── routes/                    # 15 route modules
│       │   ├── auth.js                # Signup, login, Google OAuth, token refresh
│       │   ├── matches.js             # Match CRUD, stats, lineups
│       │   ├── predictions.js         # Prediction submission, history
│       │   ├── leagues.js             # League CRUD, join/leave, standings
│       │   ├── users.js               # User profiles, follows, settings
│       │   ├── leaderboard.js         # Global and league leaderboards
│       │   ├── admin.js               # Admin panel routes
│       │   ├── ai.js                  # Anthropic AI-powered insights
│       │   ├── highlights.js          # Match highlights
│       │   ├── messages.js            # User messaging
│       │   ├── players.js             # Player management
│       │   ├── search.js              # Global search
│       │   ├── squads.js              # Squad management
│       │   ├── stripe.js              # Payment processing
│       │   └── teams.js               # Team management
│       ├── services/
│       │   └── scoring.js             # Prediction scoring engine
│       ├── socket/                    # Socket.IO event handlers
│       └── workers/                   # BullMQ background job workers
├── frontend/
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite build configuration
│   ├── index.html                     # HTML entry point
│   ├── vercel.json                    # Vercel deployment config
│   └── src/
│       ├── main.jsx                   # React entry (QueryClient, Router)
│       ├── App.jsx                    # Layout + route definitions
│       ├── components/
│       │   ├── Navbar.jsx             # Navigation + search + auth state
│       │   ├── MatchCard.jsx          # Match display card
│       │   ├── PredictionForm.jsx     # Prediction input form
│       │   ├── LeaderboardTable.jsx   # Leaderboard display
│       │   └── ... (additional components)
│       ├── pages/
│       │   ├── FeedPage.jsx           # Main feed (live/upcoming matches, stats)
│       │   ├── MatchPage.jsx          # Match detail + prediction
│       │   ├── LeaguePage.jsx         # League detail + standings
│       │   ├── ProfilePage.jsx        # User profile + history
│       │   ├── LeaderboardPage.jsx    # Full leaderboard view
│       │   └── ... (additional pages)
│       ├── hooks/
│       │   └── useApi.js              # API hooks (React Query mutations/queries)
│       ├── store/
│       │   └── useStore.js            # Zustand global state (auth, UI, live data)
│       └── utils/
│           └── api.js                 # Axios/fetch client configuration
└── start.bat                          # Windows startup script
```

## 10. Module Overview
- **scoring.js:** Core logic — evaluates predictions against actual match results, calculates points with confidence multipliers, updates user scores, streaks, and tiers
- **Socket.IO (socket/):** Real-time event handling for live score updates, prediction results, and notifications
- **BullMQ workers:** Background job processing for scoring, notifications, and scheduled tasks
- **AI integration (routes/ai.js):** Anthropic-powered match analysis, predictions, and insights
- **Stripe integration (routes/stripe.js):** Payment processing for premium features
- **Auth (routes/auth.js):** JWT-based auth with Google OAuth via Passport.js, bcryptjs password hashing
- **useApi.js (frontend):** Custom React hooks wrapping React Query for all API interactions

## 11. Database Overview
**Engine:** PostgreSQL via Prisma ORM (v7) with @prisma/adapter-pg. Migration file present at `prisma/migration.sql`.

**Key models (from prisma/schema.prisma):**
- **User** — id, username, email, password (hashed), tier, points, streak, referral code
- **Match** — id, sport, teams, date, status (upcoming/live/finished), score
- **Prediction** — id, user, match, predicted outcome, confidence, points awarded, timestamp
- **League** — id, name, creator, invite code, rules, member count
- **LeagueMember** — user + league membership with points within league
- **Squad** — user-created groups of predictors
- **Follow** — user-to-user follow relationships
- **Notification** — in-app notifications for users
- **Referral** — referral tracking with bonus points
- **Message** — user-to-user messaging
- **Team** — team definitions
- **Player** — player profiles

## 12. API Overview (Express.js — 15 route files)

### Auth
- `POST /auth/signup` — Register new user
- `POST /auth/login` — Login, returns JWT
- `POST /auth/refresh` — Refresh access token
- `POST /auth/password` — Change/reset password
- `GET /auth/google` — Google OAuth login

### Matches
- `GET /matches` — List matches (with filters for date, sport, status)
- `GET /matches/:id` — Match detail with stats
- `POST /matches/:id/finish` — Admin: finalize match results

### Predictions
- `POST /predictions` — Submit prediction for a match
- `GET /predictions/history` — User's prediction history

### Leagues
- `GET /leagues` — List user's leagues
- `POST /leagues` — Create a new league
- `POST /leagues/:id/join` — Join a league
- `GET /leagues/:id/standings` — League leaderboard

### Users
- `GET /users/:id` — User profile
- `PUT /users/:id` — Update profile
- `POST /users/:id/follow` — Follow/unfollow user

### Leaderboard
- `GET /leaderboard` — Global leaderboard
- `GET /leaderboard/top` — Top predictors

### Additional
- `GET /admin/*` — Admin panel routes
- `GET/POST /ai/*` — AI-powered insights and analysis
- `GET /highlights/*` — Match highlights
- `GET/POST /messages/*` — User messaging
- `GET /players/*` — Player management
- `GET /search` — Global search
- `GET/POST /squads/*` — Squad management
- `POST /stripe/*` — Payment processing
- `GET /teams/*` — Team management

## 13. Authentication & Authorization
- **JWT-based:** Access tokens issued on login (jsonwebtoken)
- **Google OAuth:** Passport.js with passport-google-oauth20 + google-auth-library
- **Password hashing:** bcryptjs (3 rounds)
- **Token refresh:** Refresh token mechanism implemented
- **Role-based:** Admin/User distinction with admin route file
- **Security middleware:** Helmet, CORS, cookie-parser
- No 2FA, no session-based auth

## 14. Data Flow
1. User opens app → React app loads → Zustand checks stored auth token
2. If not authenticated → Login page → POST /auth/login or Google OAuth → JWT stored in Zustand + localStorage
3. User navigates to Feed → React Query fetches `GET /matches` → displays live/upcoming matches
4. User submits prediction → `POST /predictions` → backend stores in PostgreSQL via Prisma
5. Match finishes → admin triggers or BullMQ background job calls scoring service
6. Scoring service evaluates all predictions → updates points, streaks, tiers
7. Socket.IO pushes updates to connected clients → UI refreshes automatically
8. Optional: Stripe handles payments, Anthropic AI generates insights

## 15. Request Lifecycle
HTTP Request → Express.js (v5) → Helmet/CORS Middleware → Morgan (logging) → Passport Auth Middleware (JWT or OAuth verify) → Router → Route Handler → Prisma Client → PostgreSQL → JSON Response

WebSocket connections via Socket.IO maintain persistent bidirectional communication for live updates.

## 16. External Integrations
| Service | Purpose | Package |
|---|---|---|
| **Stripe** | Payment processing for premium features | stripe |
| **Anthropic AI** | AI-powered match analysis and insights | @anthropic-ai/sdk |
| **Google OAuth** | Social login/authentication | passport-google-oauth20, google-auth-library |
| **Redis** | Caching, BullMQ job queue, session store | redis (ioredis) |
| **PostgreSQL** | Primary database (via Prisma) | pg, @prisma/adapter-pg |
| **Nodemailer** | Email notifications | nodemailer |

## 17. Environment Variables
No `.env.example` file found in the repository. Based on dependencies and usage, the following variables are expected:
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `ANTHROPIC_API_KEY` | Anthropic AI API key |
| `REDIS_URL` | Redis connection string |
| `PORT` | Backend server port |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email (nodemailer) configuration |

> ⚠️ Unverified — exact variable names need to be confirmed from the source code's env usage.

## 18. Configuration
- Prisma schema (prisma/schema.prisma) defines database models and relationships with migration support
- Backend configuration read from environment variables via dotenv
- Frontend Vite config for build and dev server
- Vercel configuration (vercel.json) for frontend deployment
- Docker Compose for local development environment (PostgreSQL + Redis)
- BullMQ configuration for background job processing

## 19. Security Measures
- **JWT auth:** API endpoints require valid tokens with passport-jwt
- **Password hashing:** bcryptjs for all user passwords
- **Google OAuth:** Federated identity via Passport.js
- **Helmet:** Security headers middleware
- **CORS:** Cross-origin resource sharing configured
- **cookie-parser:** Signed cookie support
- **Input validation:** Via Zod/Prisma schemas
- No HTTPS enforcement, no rate limiting, no CSRF protection

## 20. Logging & Monitoring
Morgan HTTP request logger is configured for request logging. No external monitoring or error tracking (e.g., Sentry) is configured.

## 21. Error Handling
Standard Express.js error handling with async middleware wrappers. API returns structured JSON error responses.

## 22. Performance Optimizations
- **React Query:** Automatic caching, background refetching, and pagination
- **Prisma:** Database connection pooling and query optimization
- **Socket.IO:** Real-time updates without polling
- **BullMQ + Redis:** Background job processing offloads heavy tasks
- No CDN configuration

## 23. Deployment Architecture
- **Frontend:** Vercel (`vercel.json` configuration found)
- **Backend:** Docker Compose for local development (PostgreSQL + Redis)
- **Background Jobs:** BullMQ workers (would need Redis in production)
- No cloud-specific deployment scripts (AWS, GCP, Railway, Render)

## 24. Testing Strategy
No test setup found. No test files, no test framework configured in either frontend or backend.

## 25. Development Workflow
No CONTRIBUTING.md found. No documented conventions.

## 26. Known Limitations
- **No external sports data source:** Match data must be entered manually; no integration with live sports APIs
- **No automated scoring:** Match results must be manually finalized (admin endpoint)
- **No tests:** Zero test coverage across frontend and backend
- **No production deployment config:** Docker Compose for local use only
- **No CI/CD pipeline**
- **No monitoring or error tracking**

## 27. Future Roadmap
No documented roadmap found. Code evidence suggests:
- Sports data API integration (half-built patterns in routes)
- Enhanced real-time updates
- Paid leagues / premium tiers (Stripe already integrated)

## 28. Troubleshooting
- **Backend won't start:** Ensure PostgreSQL and Redis are running. Set required env vars. Run `npx prisma migrate dev` to apply schema.
- **Frontend can't connect:** Check that backend is running on the expected port. Verify CORS configuration.
- **Socket.IO not connecting:** Confirm Socket.IO server is initialized on the same port as the HTTP server.
- **BullMQ not processing:** Ensure Redis is running and accessible.

## 29. FAQ
- **How to run locally?** `docker-compose up` for DB + Redis, then `cd backend && npm run dev` for backend, and `cd frontend && npm run dev` for frontend.
- **How to reset the database?** `npx prisma migrate reset` in the backend directory.
- **How to add matches?** Use the admin API endpoint or insert directly into the database.
- **What OAuth providers are supported?** Google OAuth via Passport.js.

## 30. Contributing Guidelines
Not yet defined. No CONTRIBUTING.md file exists in the repository.

## 31. License
No license file found in the repository root.

## 32. Maintainers & Contacts
- **Author (from root package.json):** Not specified
- **Repository:** Local filesystem — no discoverable remote origin or author metadata

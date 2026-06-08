# 🏟️ MatchMind — The Internet's Sports Bar

**Watch. Predict. Compete. Talk sport together.**

MatchMind is a real-time social sports platform where fans watch live games, make score predictions, compete on leaderboards, chat in live match rooms, and build a global fan community. A comprehensive clone of the SDFN.com experience.

---

## ✨ Core Loop

```
WATCH (live scores + streams) → PREDICT (before/during games)
→ COMPETE (leaderboards) → TALK (live chat rooms) → REPEAT
```

### Value Pillars
| Pillar | Description |
|--------|-------------|
| **Watch Together** | Synchronized viewing rooms with live scores, stats, and stream embeds |
| **Predict** | Pre-match and in-play score/outcome predictions with a points economy |
| **Compete** | Global, league-specific, and friend-group leaderboards |
| **Talk Sport** | Real-time chat rooms per match, per sport, and general fan zones |
| **Social Fabric** | Follow friends, create squads, private leagues, activity feeds |

### Supported Sports (MVP)
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
| **Framer Motion** | Animations |
| **Recharts** | Charts & data visualization |
| **Lucide React** | Icon library |
| **react-helmet-async** | SEO meta tags & structured data |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | API server |
| **Socket.io** | Real-time events (chat, scores, notifications) |
| **Passport.js** | Authentication (JWT + Google OAuth) |
| **Prisma 7** | ORM with PostgreSQL |
| **Redis** | Caching, sessions, pub-sub, rate limiting |
| **BullMQ** | Background job queue (prediction scoring) |
| **Cloudinary** | Media storage (avatars, images) |

### Sports Data
- **SportRadar API** (primary) — live scores, stats, lineups, odds
- **API-Football** / **ESPN API** (fallback)

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
│
├── frontend/                         # React + Vite SPA
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx                  # Entry point with providers
│       ├── App.jsx                   # Root component with routing
│       ├── index.css                 # Design system tokens & styles
│       ├── store/
│       │   └── useStore.js           # Zustand global store
│       ├── components/
│       │   ├── Navbar.jsx            # Top navigation
│       │   ├── BottomNav.jsx         # Mobile bottom navigation
│       │   ├── LiveTicker.jsx        # Scrolling live scores ticker
│       │   ├── ErrorBoundary.jsx     # Error boundary for lazy routes
│       │   ├── MatchCard.jsx         # Match preview card
│       │   ├── ScoreDisplay.jsx      # Animated score display
│       │   ├── SportBadge.jsx        # Sport color-coded badge
│       │   ├── LiveBadge.jsx         # Pulsing LIVE indicator
│       │   ├── ChatMessage.jsx       # Chat message with reactions
│       │   ├── PredictionCard.jsx    # Prediction result card
│       │   ├── LeaderboardRow.jsx    # Leaderboard table row
│       │   └── PointsToast.jsx       # Points earned overlay
│       └── pages/
│           ├── LandingPage.jsx        # /
│           ├── LoginPage.jsx          # /login
│           ├── SignupPage.jsx         # /signup
│           ├── OnboardingPage.jsx     # /onboarding
│           ├── FeedPage.jsx           # /feed
│           ├── LiveHubPage.jsx        # /live
│           ├── MatchRoomPage.jsx      # /live/:matchId ⭐
│           ├── ScoresPage.jsx         # /scores
│           ├── PredictionsPage.jsx    # /predictions
│           ├── MakePredictionPage.jsx # /predictions/new/:matchId
│           ├── LeaderboardPage.jsx    # /leaderboard
│           ├── LeaguesPage.jsx        # /leagues
│           ├── CreateLeaguePage.jsx   # /leagues/create
│           ├── LeagueRoomPage.jsx     # /leagues/:leagueId
│           ├── SquadsPage.jsx         # /squads
│           ├── SquadPage.jsx          # /squads/:squadId
│           ├── ExplorePage.jsx        # /explore
│           ├── HighlightsPage.jsx     # /highlights
│           ├── ProfilePage.jsx        # /profile/:userId
│           ├── MyProfilePage.jsx      # /profile/me
│           ├── SettingsPage.jsx       # /profile/me/settings
│           ├── NotificationsPage.jsx  # /profile/me/notifications
│           ├── StandingsPage.jsx      # /standings/:sport
│           ├── TeamPage.jsx           # /teams/:teamId
│           ├── PlayerPage.jsx         # /players/:playerId
│           ├── SearchPage.jsx         # /search
│           └── AdminPage.jsx          # /admin
│
└── backend/                          # Node.js + Express API
    ├── package.json
    ├── .env                          # Environment variables
    ├── prisma.config.ts              # Prisma 7 datasource configuration
    ├── prisma/
    │   ├── schema.prisma             # Database schema (9 models)
    │   └── seed.js                   # Comprehensive seed script
    └── src/
        ├── index.js                  # Server entry point
        ├── config/
        │   └── passport.js           # Passport strategies (JWT + Google OAuth)
        ├── middleware/
        │   └── auth.js               # JWT authentication middleware
        ├── socket/
        │   └── index.js              # Socket.io event handlers
        └── routes/
            ├── auth.js               # Signup, login, logout, Google OAuth, refresh
            ├── matches.js            # Matches, stats, lineups, H2H, timeline
            ├── predictions.js        # Create, list, score predictions
            ├── leaderboard.js        # Global, sport, friends leaderboards
            ├── users.js              # Profile, follow, notifications
            ├── leagues.js            # CRUD private leagues
            ├── squads.js             # CRUD squads
            ├── highlights.js         # Video highlights
            └── ai.js                 # AI prediction hints
```

---

## 🎨 Design System

### "Dark Stadium" Theme
MatchMind uses a dark, stadium-atmosphere color palette with green accent as the primary CTA color.

| Token | Value | Usage |
|-------|-------|-------|
| `--mm-bg-primary` | `#0A0B0F` | Deep pitch black background |
| `--mm-bg-secondary` | `#13151C` | Card backgrounds |
| `--mm-accent-green` | `#00E676` | Primary CTAs, live indicators |
| `--mm-accent-amber` | `#FFB300` | Predictions, points |
| `--mm-accent-red` | `#FF3D57` | Alerts, danger |
| `--mm-accent-blue` | `#4FC3F7` | Info, links |

### Typography
- **Display:** Bebas Neue (72px/48px for headlines)
- **Body:** DM Sans (14px–16px for content)
- **Monospace:** JetBrains Mono (13px for data)

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/google` | Google OAuth redirect |

### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/matches` | List matches (filters: sport, date, status) |
| GET | `/api/matches/:id` | Match details |
| GET | `/api/matches/:id/stats` | Match statistics |
| GET | `/api/matches/:id/lineups` | Starting lineups |
| GET | `/api/matches/:id/h2h` | Head-to-head history |
| GET | `/api/matches/:id/timeline` | Match events |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predictions` | Make a prediction |
| GET | `/api/predictions/mine` | My predictions |
| GET | `/api/predictions/match/:matchId` | All predictions for a match |
| PATCH | `/api/predictions/:id/score` | Score a prediction (internal) |

### Leaderboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leaderboard/global` | Global leaderboard |
| GET | `/api/leaderboard/sport/:sport` | Per-sport leaderboard |
| GET | `/api/leaderboard/friends` | Friends leaderboard |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id` | User profile |
| PATCH | `/api/users/me` | Update profile |
| POST | `/api/users/:id/follow` | Follow user |
| DELETE | `/api/users/:id/follow` | Unfollow user |
| GET | `/api/users/me/notifications` | Get notifications |
| PATCH | `/api/users/me/notifications/read` | Mark all read |

---

## 📡 WebSocket Events

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `SCORE_UPDATE` | `{ matchId, homeScore, awayScore, minute }` | Live score change |
| `GOAL_EVENT` | `{ matchId, team, scorer, minute }` | Goal alert |
| `CARD_EVENT` | `{ matchId, team, player, type, minute }` | Yellow/red card |
| `MATCH_STATUS` | `{ matchId, status }` | Match status change (HT, FT, etc.) |
| `CHAT_MESSAGE` | `{ roomId, user, text, timestamp }` | New chat message |
| `REACTION_UPDATE` | `{ roomId, reactions }` | Emoji reaction update |
| `VIEWER_COUNT` | `{ matchId, count }` | Live viewer count |
| `LEADERBOARD_UPD` | `{ userId, newRank, pointsDelta }` | Leaderboard rank change |
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

## 💾 Database Schema (9 Models)

- **User** — Accounts with tier system (Bronze → Legend)
- **Match** — Sports events with live status tracking
- **Prediction** — User predictions with scoring
- **League** — Private prediction leagues with invite codes
- **LeagueMember** — League membership with points
- **Squad** — Friend groups
- **SquadMember** — Squad membership with roles
- **Follow** — User follow relationships
- **Notification** — In-app notifications

Enums: `Sport`, `MatchStatus`, `PredStatus`, `Tier`

---

## 📊 Scoring System

| Action | Points |
|--------|--------|
| Correct exact score | +50 |
| Correct result (W/D/W) | +15 |
| Off by 1 goal (correct result) | +10 |
| Correct first goalscorer | +20 |
| Correct over/under total | +10 |
| Correct both teams to score | +10 |
| Daily prediction (any) | +2 |
| Perfect match (all markets) | +100 |
| Streak bonus (5+ streak) | +5/prediction |
| Early bird (2h+ before KO) | +5 |

### Tier System
| Tier | Points Required |
|------|----------------|
| 🥉 Bronze | 0–499 |
| 🥈 Silver | 500–1,999 |
| 🥇 Gold | 2,000–4,999 |
| 💎 Platinum | 5,000–9,999 |
| 💠 Diamond | 10,000–24,999 |
| 👑 Legend | 25,000+ |

---

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL
- Redis (optional, for caching)

### Installation

```bash
# 1. Clone & navigate
cd "Match Mind"

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Install backend dependencies
cd ../backend
npm install

# 4. Configure environment variables
# Open backend/.env and fill in your credentials
# At minimum, set DATABASE_URL for PostgreSQL and JWT_SECRET

# 5. Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# 6. Seed the database with mock data
npm run prisma:seed

# 7. Start backend (in one terminal)
npm run dev
# or with auto-reload:
npm run dev:watch

# 8. Start frontend (in another terminal)
cd ../frontend
npm run dev
```

### Demo Account
After seeding:
- **Email:** `demo@matchmind.gg`
- **Password:** `password123`

---

## 📱 Pages Overview (27 Routes)

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Public hero, features, leaderboard preview |
| Login | `/login` | Email/password + Google OAuth |
| Signup | `/signup` | Registration form |
| Onboarding | `/onboarding` | 4-step wizard (sports, teams, profile, follows) |
| Feed | `/feed` | Personalized home for logged-in users |
| Live Hub | `/live` | All live/upcoming/finished matches with filters |
| Match Room ⭐ | `/live/:matchId` | 3-panel: stats + chat + predictions |
| Scores | `/scores` | Fixture list by competition |
| Predictions | `/predictions` | Dashboard with stats and history |
| New Prediction | `/predictions/new/:matchId` | Score widget + AI hint + markets |
| Leaderboard | `/leaderboard` | Global podium + filterable table |
| Leagues | `/leagues` | Private league hub |
| Create League | `/leagues/create` | League creation form |
| League Room | `/leagues/:leagueId` | League standings + invite |
| Squads | `/squads` | Friend group hub |
| Squad | `/squads/:squadId` | Squad chat + rankings |
| Explore | `/explore` | Trending matches, sports, competitions |
| Highlights | `/highlights` | Video highlights grid |
| Profile | `/profile/:userId` | Public user profile |
| My Profile | `/profile/me` | Own profile with badges |
| Settings | `/profile/me/settings` | Account, privacy, appearance |
| Notifications | `/profile/me/notifications` | Notification center |
| Standings | `/standings/:sport` | League standings table |
| Team | `/teams/:teamId` | Team fixtures + fans |
| Player | `/players/:playerId` | Player stats |
| Search | `/search` | Global search |
| Admin | `/admin` | Admin dashboard |

---

## 🧪 Phase Implementation Plan

### Phase 1 — Core MVP ✅ (Complete)
- Auth system (signup/login/Google OAuth)
- Sports data integration (live scores endpoints)
- Live Matches Hub page
- Basic Match Room (stats + live score)
- Prediction flow (make + auto-score)
- Basic leaderboard (global, weekly)
- User profile (basic)
- Design system + component library

### Phase 2 — Social & Chat ✅ (Complete)
- Live chat engine (Socket.io)
- Follow system + friends leaderboard
- Private prediction leagues
- Squads + squad chat
- Notifications system
- Achievements + badges
- Mobile optimization

### Phase 3 — AI & Polish ⏳ (Partially Complete)
- MatchMind AI prediction hints — endpoint ready
- AI match summaries — not started
- Video highlights feed — page ready
- Onboarding wizard — implemented
- Smart notifications — not started
- SEO + meta tags — HelmetProvider + LandingPage done
- Performance optimization — not started
- Production deployment — not started

---

## 🔧 Environment Variables

```env
PORT=4000
BACKEND_URL="http://localhost:4000"
FRONTEND_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/matchmind"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-64-char-secret"
JWT_REFRESH_SECRET="another-64-char-secret"
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
SPORTRADAR_API_KEY="your-api-key"
CLOUDINARY_URL="cloudinary://key:secret@cloud"
ANTHROPIC_API_KEY="your-anthropic-key"
TENOR_API_KEY="your-tenor-key"
NODE_ENV="development"
```

---

## 🛠️ Troubleshooting

### Prisma 7 Datasource URL
Prisma 7 requires the datasource URL to be configured via `prisma.config.ts` (at the backend root), not in `schema.prisma`. The config file reads `DATABASE_URL` from the environment.

### Windows npm ENOTEMPTY Errors
If `npm install` fails with `ENOTEMPTY` errors when cleaning `node_modules`, delete the folder manually via File Explorer and re-run `npm install`.

### Build Issues
- **Vite + @vitejs/plugin-react compatibility**: Ensure you're using a compatible pair. Current setup uses Vite 8 + @vitejs/plugin-react 6.
- **Missing picomatch**: If Vite reports picomatch not found, run `npm install picomatch` in the frontend directory.

---

## 📄 License

Built for demonstration and learning purposes.

---

*Document version: 1.0 | Project: MatchMind | Based on SDFN.com analysis | Generated: June 2026*

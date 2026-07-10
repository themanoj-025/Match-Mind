# MEMORY.md — Match-Mind

## Project Overview
Match-Mind is a full-stack fantasy sports prediction and auction platform where users create teams, participate in draft sessions, bid on players in real-time auctions, join prediction rooms, compete on leaderboards, and earn achievements. It features real-time WebSocket communication, a sophisticated auction engine, draft mechanics, and gamification.

## Business Purpose
Provide an engaging fantasy sports platform where users can:
- Participate in player auctions
- Build fantasy rosters through drafts
- Join prediction rooms and compete with friends
- Track performance via leaderboards
- Earn achievements and rewards
- Follow players, teams, and tournaments

## Tech Stack
| Category | Technology |
|----------|------------|
| Backend | Node.js / Express / TypeScript |
| Frontend | React 19 / TypeScript / Vite |
| Styling | Tailwind CSS / GSAP animations |
| Realtime | Socket.IO |
| Database | JSON file-based (custom JSON DB) |
| Auth | JWT + Passport |
| Payments | Stripe integration |
| Testing | Vitest (unit + e2e) |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend) / Docker (backend) |
| 3D Graphics | Three.js (hero scene) |

## Repository Structure
```
Match-Mind/
├── backend/                    # Express + TypeScript backend
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── config/            # Config, constants, schemas, tournaments
│   │   ├── data/              # JSON data files + backups
│   │   ├── lib/               # JSON DB library
│   │   ├── middleware/        # Auth, rate limiting, error handling, etc.
│   │   ├── repositories/      # Data access layer
│   │   ├── routes/            # Express route handlers
│   │   ├── services/          # Business logic layer
│   │   ├── socket/            # Socket.IO event handlers
│   │   ├── utils/             # AppError, logger
│   │   ├── test-utils/        # Test setup utilities
│   │   └── e2e/               # End-to-end tests
│   ├── scripts/               # Seed, validation, utility scripts
│   └── coverage/              # Test coverage reports
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── App.tsx            # Root app with routing
│   │   ├── main.tsx           # Entry point
│   │   ├── index.css          # Global styles
│   │   ├── components/        # UI components
│   │   │   ├── kinetic/       # Kinetic animations
│   │   │   └── three/         # Three.js 3D components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── store/             # State management (Zustand)
│   │   └── lib/               # Utilities and types
│
├── docker-compose.yml         # Docker orchestration
└── docs/                      # Documentation
```

## Key Features
- **User System**: Registration, login, JWT auth, profiles, subscriptions
- **Auctions**: Real-time bidding engine with Socket.IO, bid tracking
- **Drafts**: Player draft sessions, pick tracking, draft runs
- **Rooms**: Prediction rooms, room templates, member management
- **Tournaments**: Tournament registry, fixtures, match tracking
- **Fantasy Points**: Points calculation, scoring engine, leaderboards
- **Rosters**: Team building, formation management, player assignment
- **Players**: Player database, rarity tiers, stats, photos
- **Leaderboards**: Global and room-based rankings
- **Gamification**: Achievements, badges, rewards, progression
- **Social**: Following, chat messages, notifications
- **Admin**: Admin panel, logs, system management
- **Payments**: Stripe integration for subscriptions/purchases

## Data Flow
```
User (Browser)
       ↓
  React Frontend (Vite + Zustand)
       ↓
  API Calls (REST) / WebSocket (Socket.IO)
       ↓
  Express Backend
       ↓
  Middleware (Auth, Rate Limiting, Validation)
       ↓
  Routes → Services → Repositories
       ↓
  JSON Database (Custom JSON DB)
       ↓
  Response → Frontend State Update
```

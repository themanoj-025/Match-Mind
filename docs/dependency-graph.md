# Dependency Graph — Match-Mind

## Backend Module Dependency Map

```
backend/src/index.ts (Server Entry)
  ├── config/
  │   ├── constants.ts ──────── Shared constants
  │   ├── passport.ts ───────── Passport strategies
  │   ├── schemas.ts ────────── Validation schemas
  │   ├── tournaments.ts ────── Tournament configs
  │   └── tournamentRegistry.json
  │
  ├── middleware/
  │   ├── auth.ts ───────────── JWT verification
  │   ├── rateLimiter.ts ────── Rate limiting
  │   ├── csrf.ts ───────────── CSRF protection
  │   ├── validate.ts ───────── Request validation
  │   ├── errorHandler.ts ───── Error handling
  │   ├── asyncHandler.ts ───── Async wrapper
  │   ├── circuitBreaker.ts ─── Circuit breaker
  │   ├── idempotency.ts ────── Idempotency keys
  │   ├── metrics.ts ────────── Performance metrics
  │   ├── requestId.ts ──────── Request ID tagging
  │   ├── requireAdmin.ts ───── Admin authorization
  │   └── draftGate.ts ──────── Draft access control
  │
  ├── routes/
  │   ├── auth.ts ──────────→ services/authService.ts
  │   ├── auction.ts ───────→ services/auctionEngine.ts
  │   ├── draft.ts ─────────→ services/draftService.ts, draftRunService.ts
  │   ├── rooms.ts ─────────→ services/auctionEngine.ts
  │   ├── users.ts ─────────→ services/authService.ts
  │   ├── players.ts ───────→ repositories
  │   ├── tournaments.ts ───→ repositories
  │   ├── matches.ts ───────→ repositories
  │   ├── fixtures.ts ──────→ repositories
  │   ├── leaderboard.ts ───→ services/leaderboardService.ts
  │   ├── messages.ts ──────→ socket/index.ts
  │   ├── admin.ts ─────────→ services/adminService.ts
  │   ├── franchises.ts ────→ services/scoring.ts
  │   ├── search.ts ────────→ repositories
  │   ├── stripe.ts ────────→ stripe API
  │   └── ai.ts ────────────→ AI API
  │
  ├── services/
  │   ├── authService.ts ──────→ repositories, tokenService.ts
  │   ├── tokenService.ts ─────→ jsonwebtoken
  │   ├── auctionEngine.ts ────→ repositories, socket/
  │   ├── draftService.ts ─────→ repositories, draftTicketService.ts
  │   ├── draftRunService.ts ───→ repositories, scoring.ts
  │   ├── draftTicketService.ts → repositories
  │   ├── fantasyPoints.ts ────→ repositories, scoring.ts
  │   ├── scoring.ts ──────────→ repositories
  │   ├── leaderboardService.ts → repositories, leaderboardMapper.ts
  │   ├── leaderboardMapper.ts ─→ (utility)
  │   ├── adminService.ts ─────→ repositories
  │   └── emailService.ts ─────→ email provider
  │
  ├── repositories/
  │   ├── index.ts ──────────── Repository exports
  │   └── types.ts ──────────── Repository types
  │
  ├── lib/
  │   ├── jsonDb.ts ─────────── Core JSON database
  │   └── validateDraftPool.ts ─ Draft validation
  │
  ├── socket/
  │   └── index.ts ──────────── Socket.IO handlers
  │
  └── utils/
      ├── AppError.ts ───────── Custom error class
      └── logger.ts ─────────── Logging utility
```

## Frontend Module Dependency Map

```
frontend/src/main.tsx (Entry)
  └── App.tsx
        ├── pages/*.tsx (All page components)
        │     ├── components/*.tsx (Reusable components)
        │     │     ├── components/kinetic/*.tsx
        │     │     └── components/three/*.tsx
        │     ├── hooks/useApi.ts → API calls
        │     ├── hooks/useAuctionSocket.ts → Socket.IO
        │     ├── hooks/useDraft.ts → Draft logic
        │     └── store/useStore.ts → Zustand state
        │
        ├── components/Navbar.tsx
        ├── components/BottomNav.tsx
        └── lib/
              ├── types.ts ──── Shared types
              ├── tournaments.ts ── Tournament helpers
              ├── kinetic.ts ────── Kinetic animations
              ├── instrument.ts ─── Frontend monitoring
              └── animation/ ────── GSAP + variants
```

## External Dependencies

### Backend (`backend/package.json`)
| Package | Purpose |
|---------|---------|
| express | HTTP server framework |
| socket.io | WebSocket realtime communication |
| passport + passport-jwt | Authentication strategies |
| jsonwebtoken | JWT token generation/verification |
| express-rate-limit | Rate limiting middleware |
| helmet | Security headers |
| cors | Cross-origin resource sharing |
| csurf | CSRF protection |
| stripe | Payment processing |
| winston / pino | Logging |
| zod | Schema validation |
| vitest | Testing |

### Frontend (`frontend/package.json`)
| Package | Purpose |
|---------|---------|
| react, react-dom | UI framework |
| react-router-dom | Client-side routing |
| zustand | State management |
| socket.io-client | WebSocket client |
| tailwindcss | Utility-first CSS |
| gsap | Animations |
| three, @react-three/fiber | 3D rendering |
| react-query / swr | Data fetching |
| framer-motion | Motion components |
| vitest, testing-library | Testing |

## Critical Files (Backend)
- **src/index.ts**: Server entry — orchestrates entire backend
- **lib/jsonDb.ts**: Core data persistence — touches every entity
- **services/auctionEngine.ts**: Auction logic — critical business engine
- **services/draftService.ts**: Draft logic — core gameplay
- **services/fantasyPoints.ts**: Points calculation — scoring integrity
- **services/authService.ts**: Authentication — security critical
- **middleware/auth.ts**: Auth middleware — protects all routes

## Critical Files (Frontend)
- **src/App.tsx**: Root component — routes and providers
- **src/store/useStore.ts**: Global state — used by all pages
- **src/hooks/useApi.ts**: API client — all backend communication
- **src/hooks/useAuctionSocket.ts**: Socket client — realtime features

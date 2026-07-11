# Architecture — Match-Mind

## System Architecture

```
Browser (React + Vite)
       │
       ├── HTTP (REST API) ──────────┐
       │     GET/POST/PUT/DELETE      │
       │                              ▼
       │                     Express Backend (TypeScript)
       │                              │
       ├── WebSocket (Socket.IO) ────┐│
       │     Real-time events         ▼│
       │                     Socket.IO Server
       │                              │
       │                    ┌─────────┴──────────┐
       │                    │   Middleware Stack   │
       │                    │ Auth ─ Rate Limiter │
       │                    │ CSRF ─ Validation   │
       │                    │ Circuit Breaker     │
       │                    │ Idempotency ─ Metrics│
       │                    │ Error Handler       │
       │                    └─────────┬──────────┘
       │                              │
       │                    ┌─────────┴──────────┐
       │                    │     Routes          │
       │                    │ auth, auction, draft │
       │                    │ rooms, tournaments   │
       │                    │ players, matches,    │
       │                    │ users, admin, etc.   │
       │                    └─────────┬──────────┘
       │                              │
       │                    ┌─────────┴──────────┐
       │                    │    Services         │
       │                    │ AuctionEngine       │
       │                    │ DraftService        │
       │                    │ AuthService         │
       │                    │ FantasyPoints       │
       │                    │ LeaderboardService  │
       │                    │ etc.                │
       │                    └─────────┬──────────┘
       │                              │
       │                    ┌─────────┴──────────┐
       │                    │   Repositories      │
       │                    │ (Data Access Layer) │
       │                    └─────────┬──────────┘
       │                              │
       │                    ┌─────────┴──────────┐
       │                    │  PostgreSQL DB      │
       │                    │ (Prisma Client)     │
       └────────────────────┴─────────────────────┘
```

## Architecture Overview
- **Pattern**: Layered architecture (Routes → Services → Repositories → Data)
- **Frontend**: React SPA with client-side routing via React Router
- **Backend**: Express REST API + Socket.IO for realtime
- **State Management**: AppContext on frontend
- **Database**: PostgreSQL (via Prisma ORM, migrated from legacy JSON DB)
- **Caching & Mutexes**: Redis for high-frequency auction bids and rate-limiting
- **Auth**: JWT-based with Passport middleware

## Layer Breakdown

### Backend Layers
| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| Middleware | middleware/ | Auth, rate limiting, CSRF, validation, error handling, metrics |
| Routes | routes/ | HTTP endpoint definitions and request handling |
| Services | services/ | Business logic, orchestration, engine components |
| Repositories | repositories/ | Data access abstraction |
| Lib | lib/ | Core utilities (JSON DB, validation) |
| Sockets | socket/ | WebSocket event handlers |
| Config | config/ | Constants, schemas, tournament registry |

### Frontend Layers
| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| Views | views/ | Route-level view components (Landing, Auth, Lobby, DraftRoom, Leaderboard) |
| Components | components/ | Reusable UI components (Button, Card, Input) |
| Context | context/ | Global state context provider (AppContext) |
| Lib | lib/ | Utilities |

## Design Patterns
1. **Layered Architecture**: Clear separation of concerns
2. **Repository Pattern**: Abstracts data access
3. **Service Layer**: Encapsulates business logic
4. **Middleware Chain**: Composable request processing
5. **Event-Driven**: Socket.IO for realtime features
6. **Atomic Writes**: JSON DB ensures data integrity

## Key Architecture Decisions
- **PostgreSQL via Prisma**: Migrated from a local JSON database to a robust relational model to support high-concurrency tournament traffic.
- **Redis & Distributed Locks (Mutex)**: Live auction bids use `redlock` mechanisms to strictly prevent race conditions when two managers bid on a player at the exact same millisecond.
- **JWT**: Stateless authentication to allow horizontal scaling.
- **Socket.IO**: Realtime bid broadcasting, anti-snipe timers, and chat.
- **BullMQ**: Background job processing for heavy scoring calculations when matchdays conclude.

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

## Dependency Injection (Awilix)
We employ a strict `InjectionMode.PROXY` pattern for resolving dependencies. All services, repositories, and utilities receive an object containing their dependencies injected via the constructor.

### Lifetimes & Memory Leaks
To prevent memory leaks, we enforce strict lifetime policies in `container.ts`:
- **Singletons**: Stateless services (`MessageService`, `MatchService`), Database and Redis connections (`prisma`, `redis`).
- **Scoped**: Services that depend on the request context or specific user state (e.g., `AuthService`, `UserService`). Using `scopePerRequest` in Express automatically creates a localized DI scope per HTTP request, discarding it when the request ends.
**CRITICAL**: Do NOT bind heavy connections (like Prisma) as Scoped or Transient, as this will result in immediate exhaustion of the database connection pool.

## Read-Replica Readiness
The architecture is designed to support read-replicas. 
- While `req.app.get('prisma')` was previously used, all data access now flows through Repositories or Services injected via the DI container.
- When read-replicas are introduced, the DI container can easily map `prismaReader` and `prismaWriter` into the respective repositories, isolating read-heavy queries (leaderboards, public listings) from transactional writes (auction bids, draft picks).

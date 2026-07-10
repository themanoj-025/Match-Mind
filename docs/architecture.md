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
       │                    │  JSON Database      │
       │                    │ (File-based)        │
       │                    └────────────────────┘
```

## Architecture Overview
- **Pattern**: Layered architecture (Routes → Services → Repositories → Data)
- **Frontend**: React SPA with client-side routing via React Router
- **Backend**: Express REST API + Socket.IO for realtime
- **State Management**: Zustand on frontend
- **Database**: Custom JSON file-based database with atomic writes and backups
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
| Pages | pages/ | Route-level page components |
| Components | components/ | Reusable UI components |
| Hooks | hooks/ | Custom React hooks (API calls, WebSocket, draft) |
| Store | store/ | Zustand state management |
| Lib | lib/ | Types, utilities, animation configs |

## Design Patterns
1. **Layered Architecture**: Clear separation of concerns
2. **Repository Pattern**: Abstracts data access
3. **Service Layer**: Encapsulates business logic
4. **Middleware Chain**: Composable request processing
5. **Event-Driven**: Socket.IO for realtime features
6. **Atomic Writes**: JSON DB ensures data integrity

## Key Architecture Decisions
- JSON DB for simplicity (no external database dependency)
- JWT for stateless authentication
- Socket.IO for realtime auction and chat
- Zustand for lightweight state management
- Tailwind CSS for consistent styling
- Three.js for 3D hero scene on landing page

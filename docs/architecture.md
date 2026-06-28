# MatchMind — Architecture

```mermaid
graph TB
    subgraph Frontend ["Frontend (Vite + React 19)"]
        A[React SPA] --> B[React Router v6]
        A --> C[Zustand Store]
        A --> D[React Query]
        A --> E[Socket.io Client]
        A --> F[Framer Motion / GSAP]
        A --> G[Three.js / R3F]
    end

    subgraph Backend ["Backend (Express 5 + Node.js)"]
        H[Express Server] --> I[Passport.js Auth]
        H --> J[REST Routes]
        H --> K[Socket.io]
        H --> L[BullMQ Workers]
        I --> M[JWT Strategy]
        I --> N[Google OAuth]
        J --> O[Routes:<br/>auth, matches, predictions,<br/>leaderboard, users, leagues,<br/>squads, admin, ai, stripe]
    end

    subgraph Services ["External Services"]
        P[Anthropic Claude]
        Q[Stripe]
        R[SportRadar API]
        S[Cloudinary]
    end

    subgraph Data ["Data Layer"]
        T[(PostgreSQL via Prisma 7)]
        U[(Redis)]

    Frontend -->|HTTP / WebSocket| Backend
    L -->|Jobs| T
    L -->|Queue backend| U
    K -->|Real-time events| T
    H --> T
    H --> U
    J --> P
    J --> Q
    J --> R
    J --> S
```

## Data Flow

1. **User visits page** → React app loads via Vite, routes rendered by React Router
2. **API calls** → React Query fetches from `/api/*` endpoints with auth headers
3. **Real-time updates** → Socket.io connection sends events (scores, chat, notifications)
4. **Predictions** → User submits prediction → stored in PostgreSQL → when match finishes → BullMQ scores it → points/tiers updated
5. **AI insights** → Pro user requests prediction hint → backend calls Anthropic Claude → returns prediction with reasoning
6. **Stripe** → User subscribes → Stripe checkout → webhook updates subscription status in DB

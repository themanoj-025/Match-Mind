# Contributing to Match-Mind

Thank you for your interest in contributing to Match-Mind, the sports prediction and social gaming platform!

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL 14+
- Redis 6+ (for BullMQ queue)
- Stripe account (for payment features, optional for development)
- Anthropic API key (for AI features, optional for development)
- Google OAuth credentials (for social login, optional for development)

### Setup

1. Fork and clone the repository.

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # create and fill in your env vars
   npx prisma migrate dev
   npm run db:seed       # optional: seed sample data
   ```

3. **Frontend setup:**
   ```bash
   cd frontend
   npm install
   ```

4. **Start infrastructure (Docker):**
   ```bash
   docker-compose up -d  # starts PostgreSQL + Redis
   ```

5. **Run the backend:**
   ```bash
   cd backend
   npm run dev           # or `npm run dev:watch` with nodemon
   ```

6. **Run the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

### Expected Environment Variables
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret |
| `PORT` | Backend server port |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
| `STRIPE_SECRET_KEY` | Stripe API secret key (optional) |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) |
| `REDIS_URL` | Redis connection string |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Nodemailer config (optional) |

## Code Style

### Backend (JavaScript/Node.js)
- Use CommonJS modules (`require`/`module.exports`).
- Follow standard Express.js patterns with async route handlers.
- Use descriptive function and variable names.
- Add JSDoc comments for route handlers and service functions.
- Keep route files focused — routes should call service functions, not contain business logic.

### Frontend (React/JSX)
- Use functional components with hooks.
- Use React Query for server state management.
- Use Zustand for client state (auth, UI preferences).
- Follow existing component patterns (file structure, naming).

## Project Architecture

### Backend (`backend/src/`)
- **`index.js`** — Express + Socket.IO server entry point
- **`routes/`** — 15 route files (auth, matches, predictions, leagues, users, admin, ai, highlights, messages, players, search, squads, stripe, teams, leaderboard)
- **`services/`** — Business logic (scoring.js)
- **`middleware/`** — Auth middleware, error handling
- **`socket/`** — Socket.IO event handlers
- **`workers/`** — BullMQ background job workers
- **`config/`** — Server configuration

### Frontend (`frontend/src/`)
- **`pages/`** — Page-level components
- **`components/`** — Reusable UI components
- **`hooks/`** — Custom React hooks (useApi.js for API calls)
- **`store/`** — Zustand stores (useStore.js)
- **`utils/`** — Utility functions (api.js)

### Database
- Prisma ORM v7 with PostgreSQL
- Schema defined in `backend/prisma/schema.prisma`
- Migrations in `backend/prisma/migration.sql`
- Seeding via `backend/prisma/seed.js`

## Running Tests

No test suite is currently configured. If you add tests:
- Use Jest or Vitest for the frontend.
- Use Jest or Mocha for the backend.
- Place tests in a `__tests__` directory near the code being tested.

## Submitting Changes

1. Create a feature branch:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make focused, minimal changes.
3. Run linting and type-checking if available.
4. Test manually by running both backend and frontend.
5. Commit with a descriptive message:
   - Format: `type(scope): description`
   - Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
   - Examples:
     - `feat(predictions): add confidence multiplier scoring`
     - `fix(api): correct leaderboard pagination`
     - `feat(stripe): add subscription tier support`
6. Push and open a Pull Request.

## Reporting Issues

Include in your report:
- Steps to reproduce
- Whether the issue is backend, frontend, or database
- Error messages and console output
- Your environment (Node version, OS, database version)

## Adding New Features

### New API Route
1. Create the route file in `backend/src/routes/`.
2. Register it in `backend/src/index.js`.
3. Add corresponding Prisma queries if new data models are needed.
4. Run `npx prisma migrate dev` for schema changes.

### New Socket Event
1. Add event handlers in `backend/src/socket/`.
2. Emit events from the appropriate service or route.

### New Database Model
1. Edit `backend/prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name description`.
3. Update the seed script if applicable.

## Deployment Notes

- Frontend deploys to Vercel (`vercel.json` config present).
- Backend expects PostgreSQL and Redis (docker-compose.yml for local dev).
- BullMQ requires a running Redis instance for background job processing.
- Socket.IO requires WebSocket support from the hosting provider.

## Code of Conduct

This project and everyone participating in it is governed by the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

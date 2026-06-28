# MatchMind

## Stack
- **Frontend:** React 19 + Vite 8 + Tailwind CSS v4, state: Zustand, routing: React Router v6, animations: Framer Motion + GSAP, 3D: Three.js + React Three Fiber
- **Backend:** Node.js + Express 5 (CommonJS), auth: Passport.js (JWT + Google OAuth)
- **Database:** PostgreSQL via Prisma 7 (17 models)
- **Cache/Queue:** Redis + BullMQ (background jobs)
- **Payments:** Stripe
- **AI:** Anthropic Claude
- **Real-time:** Socket.io

## Dev commands
- `npm run install:all` — install all dependencies (root + frontend + backend)
- `npm run dev` — start both servers (backend:4000 + frontend:3000)
- `npm run build` — build frontend for production
- `cd backend && npm run prisma:generate` — generate Prisma client
- `cd backend && node scripts/push-schema.js` — push schema to DB
- `cd backend && node scripts/seed-db.js` — seed database
- `cd frontend && npm run lint` — lint frontend

## Key conventions
- 2-space indent for JS/TS/JSX/TSX, 4-space for Python
- Backend: CommonJS (`require`/`module.exports`)
- Frontend: ES modules (`.jsx` files)
- Routes: Express 5 with `/api/` prefix
- Socket events: UPPER_SNAKE_CASE event names
- Git: Conventional Commits (`type(scope): description`)

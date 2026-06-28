# Changelog

All notable changes to **Match-Mind** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-06-01

### Added

#### Backend (Express.js)
- **15 route files** covering: admin, AI chat, auth, highlights, messages, notifications, players, predictions, search, squads, stats, Stripe payments, teams, users, webhooks
- JWT authentication with Passport.js and `jsonwebtoken`
- Google OAuth 2.0 via `passport-google-oauth20`
- Role-based access (User / Admin) with admin route protection
- WebSocket real-time communication via Socket.IO
- BullMQ job queue with Redis for background processing
- AI integration with Anthropic SDK for chat features
- Stripe payment processing with webhook handling
- Email notifications via Nodemailer
- Prisma ORM with PostgreSQL database
- Zod input validation schemas
- Security: Helmet headers, CORS, signed cookies, bcryptjs password hashing
- Monitoring: Morgan request logging

#### Frontend (React + Vite)
- Modern React application with Vite build tool
- ESLint configuration for code quality
- Responsive UI components
- Integration with backend API and WebSocket

#### Infrastructure
- Docker Compose for local development (Node + PostgreSQL + Redis)
- Prisma migrations for database schema management
- Environment-based configuration with `.env` files

---

## [0.1.0] — Initial Development

### Added
- Project scaffolding (monorepo with backend/ and frontend/)
- Express.js server setup
- React + Vite frontend template
- PostgreSQL schema via Prisma
- Docker Compose configuration

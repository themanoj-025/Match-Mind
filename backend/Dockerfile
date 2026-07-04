# ── Build Stage ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY src/ ./src/
COPY instrument.ts ./

# ── Production Stage ─────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only (use install — not ci — so lockfile is optional)
COPY package.json ./
RUN npm install --omit=dev && \
    npm install -g tsx@^4.22.5 && \
    npm cache clean --force

# Copy source
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/instrument.ts ./instrument.ts

# Create data directory for JSON DB (bind mount in production)
RUN mkdir -p /app/data && chown -R node:node /app/data

# Use non-root user for security
USER node

# Environment
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

# Health check (wget is available in node:20-alpine)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health || exit 1

# Run with tsx (handles ESM + TypeScript natively)
CMD ["tsx", "src/index.ts"]

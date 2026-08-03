# node:20-slim (Debian/glibc) — Prisma 5 engines require libssl/glibc, which
# Alpine/musl images do not ship (the app fails at runtime with
# "libquery_engine... libssl.so.1.1 not found" otherwise).
FROM node:20-slim AS builder

WORKDIR /app

# Copy workspace manifests (root + each workspace package) for dependency install
COPY package.json package-lock.json* ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY packages/shared-types/package.json packages/shared-types/

# Install all workspace dependencies. Scripts are skipped so prisma generate
# and shared-types build run explicitly, in the right order, below.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN npm install --ignore-scripts

# Copy source
COPY backend/ backend/
COPY packages/ packages/

# Build shared-types first — the backend's tsc imports its compiled dist/
WORKDIR /app/packages/shared-types
RUN npm run build

# Generate the Prisma client (skipped by --ignore-scripts during install).
# The erd generator writes to ../docs, so ensure the directory exists.
WORKDIR /app/backend
RUN mkdir -p /app/docs && npx prisma generate

# Build backend (TypeScript compilation). The app declares "type": "commonjs" and
# its start script targets dist/index.js, so we compile to CommonJS explicitly and
# keep the src/ tree (tsconfig has no rootDir). Entry point ends up at dist/src/index.js.
RUN npx tsc --module commonjs --moduleResolution node --ignoreDeprecations 6.0

# tsc only emits .ts — the app also reads JSON assets at runtime via __dirname
# (e.g. src/config/tournamentRegistry.json, src/data/*.json), so mirror them
# into the dist tree at the same relative locations.
RUN mkdir -p /app/backend/dist/src/config /app/backend/dist/src/data && \
    cp -r /app/backend/src/config/. /app/backend/dist/src/config/ && \
    cp -r /app/backend/src/data/. /app/backend/dist/src/data/

# Production image — same glibc base as the builder so the Prisma
# engine binary generated at build time runs unmodified.
FROM node:20-slim AS runner

WORKDIR /app

# Prisma needs OpenSSL at runtime; install before dropping privileges.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

# Non-root user setup per Security Volume 8
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/false --create-home nodejs

COPY --from=builder --chown=nodejs:nodejs /app/backend/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
# workspace symlink target for @matchmind/shared-types (must mirror builder path)
COPY --from=builder --chown=nodejs:nodejs /app/packages/shared-types ./packages/shared-types

USER nodejs

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/src/index.js"]

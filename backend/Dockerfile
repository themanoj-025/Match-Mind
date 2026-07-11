FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json files
COPY package.json package-lock.json* ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/

# Install dependencies (ignoring scripts to prevent postinstall failures during build)
RUN npm install --ignore-scripts

# Copy source
COPY backend/ backend/

# Build backend (TypeScript compilation)
WORKDIR /app/backend
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Non-root user setup per Security Volume 8
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001 -G nodejs

COPY --from=builder --chown=nodejs:nodejs /app/backend/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

USER nodejs

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/index.js"]

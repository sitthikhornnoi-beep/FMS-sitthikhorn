# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency manifests and npm configuration
COPY package.json package-lock.json .npmrc* ./
COPY prisma ./prisma/

# Install dependencies (triggers postinstall: prisma generate)
RUN npm ci

# ── Stage 2: Builder ──
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dummy"
ENV AUTH_SECRET="build-time-secret-at-least-32-chars-long"

# Generate Prisma client and build Next.js standalone
RUN npx prisma generate
RUN npm run build

# ── Stage 3: Runner ──
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat curl && \
    npm install -g prisma@6.19.3
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3010
ENV HOSTNAME="0.0.0.0"

# Create non-root system user & group
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Create uploads directory with non-root ownership
RUN mkdir -p /app/public/uploads && \
    chown -R nextjs:nodejs /app/public

# Copy static assets and standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Remove prisma.config.ts from runner so Prisma CLI uses schema.prisma directly without needing TypeScript runtime
RUN rm -f /app/prisma.config.ts*

# Copy Prisma schema & migrations for runtime migration deployment
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3010

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3010/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install runtime dependencies (needed by Baileys for media processing)
RUN apk add --no-cache \
  ffmpeg \
  ca-certificates \
  && update-ca-certificates

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Create auth_info directory (used as fallback if Supabase not configured)
RUN mkdir -p /app/auth_info

# Railway injects PORT env var — use it or fall back to 7700
ENV PORT=7700

EXPOSE ${PORT}

# Health check: Railway will ping /api/health
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

CMD ["node", "dist/index.js"]

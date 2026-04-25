# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Disable Next.js telemetry during build
RUN npx next telemetry disable

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.29.1 --activate

# Copy package files first (leverage layer caching)
COPY package*.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build app
RUN pnpm build

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for podman (security best practice)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-lock.yaml ./

# Install only production dependencies
RUN corepack enable && corepack prepare pnpm@10.29.1 --activate
RUN pnpm install --prod --frozen-lockfile

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check for podman
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start app
CMD ["pnpm", "start"]
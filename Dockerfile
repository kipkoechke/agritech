# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Disable Next.js telemetry during build
RUN pnpm exec next telemetry disable

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.29.1 --activate

# Copy package files first (leverage layer caching)
COPY package*.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# 🔑 IMPORTANT: Build-time environment variables for Next.js
# These get embedded into the JavaScript bundle at build time
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_API_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_API_BASE_URL

ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_CLOUDINARY_API_KEY=$NEXT_PUBLIC_CLOUDINARY_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Build app (NEXT_PUBLIC_* vars are embedded at this stage)
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

# Note: NEXT_PUBLIC_* variables don't need to be set here since they're already
# baked into the static build during Stage 1

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check for podman
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start app
CMD ["pnpm", "start"]
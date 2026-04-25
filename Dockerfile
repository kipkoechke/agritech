# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm first using corepack
RUN corepack enable && corepack prepare pnpm@10.29.1 --activate

# Disable Next.js telemetry during build (now pnpm is available)
RUN npx next telemetry disable

# Copy package files first (leverage layer caching)
COPY package*.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# 🔑 IMPORTANT: Build-time environment variables for Next.js
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_API_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_API_BASE_URL

ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ENV NEXT_PUBLIC_CLOUDINARY_API_KEY=$NEXT_PUBLIC_CLOUDINARY_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Build app
RUN pnpm build

# Stage 2: Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm in runner stage too
RUN corepack enable && corepack prepare pnpm@10.29.1 --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy build artifacts
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Switch to non-root user
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

CMD ["pnpm", "start"]

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifests and workspace package manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all dependencies across workspaces for building
RUN npm ci

# Copy root tsconfig and workspace sources
COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared library first, then API application
RUN npm --workspace=packages/shared run build
RUN npm --workspace=apps/api run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Copy manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built distribution bundles
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Non-root user for security
USER node

EXPOSE 4000

CMD ["node", "apps/api/dist/server.js"]

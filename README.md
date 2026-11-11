# Sanad (سند)

> A verified-scholars-only social and learning platform.

## Architecture

- **Mobile:** Expo (React Native) + TypeScript (strict) with Expo Router, Zustand, and TanStack Query.
- **Backend:** Node.js 20 LTS + Express + TypeScript + Mongoose (MongoDB) + Redis + Socket.io.
- **Shared:** `@sanad/shared` Zod schemas, role definitions, and RBAC matrix.
- **Package Manager:** **npm only** (pnpm is prohibited).

## Monorepo Layout

```
sanad/
├── apps/
│   ├── api/        # Express REST & Socket.io backend
│   └── mobile/     # Expo React Native mobile application
├── packages/
│   └── shared/     # Shared Zod schemas, types, and RBAC matrix
├── docs/           # System specifications (PRD, TRD, SDD, Security, etc.)
└── docker-compose.yml # Local MongoDB and Redis
```

## Quick Start

### 1. Prerequisites

- Node.js >= 20.x, npm >= 10.x
- Docker (for MongoDB and Redis)

### 2. Start Infrastructure

```bash
docker compose up -d
```

### 3. Install & Build

```bash
npm install
npm run build
```

### 4. Run Development Servers

```bash
# Start API
npm run dev:api

# Start Mobile
npm run dev:mobile
```

### 5. Validation

```bash
npm run typecheck
npm run test
```


# Sanad Monorepo

Sanad (Arabic: "chain of authority") is a trusted platform where only verified religious scholars publish, and the community learns, asks questions, and interacts within safe boundaries.

## Architecture

This repository is structured as a pnpm workspace monorepo conforming strictly to `docs/02-TRD.md` and `docs/03-SDD.md`:

```
sanad/
├─ apps/
│  ├─ mobile/        # Expo SDK 51/52 React Native Mobile Application
│  └─ api/           # Node.js + Express + TypeScript API Service
├─ packages/
│  ├─ types/         # Shared Zod Schemas and TypeScript Data Contracts
│  └─ config/        # Base TypeScript and ESLint Configurations
├─ docs/             # PRD, TRD, SDD, API Spec, Security/RBAC, Design System
├─ docker-compose.yml# Local MongoDB and Redis services
└─ pnpm-workspace.yaml
```

## Security and RBAC Highlights

- **Verified-Only Content Publication:** Only accounts possessing the `scholar` role and active Two-Factor Authentication (TOTP) can publish videos or reels.
- **Separation of Duties:** Moderators review credentials and provide notes; only platform Administrators possess the authority to approve scholar status and issue the verified badge.
- **Token Rotation & Session Revocation:** Rotating 30-day refresh tokens with automated reuse detection that revokes entire compromised token families immediately.
- **Moderation and Audit Logging:** Every moderation action, application review, suspension, and account deletion is recorded in audit trails.
- **Mobile UGC Compliance:** Complete reporting, user blocking, and in-app account deletion support.

## Getting Started

### Prerequisites
- Node.js (v20 or v22)
- pnpm (v9 or v10)
- Docker (optional for local database services)

### Installation
```bash
pnpm install
pnpm --filter=@sanad/types run build
```

### Starting Databases
```bash
docker compose up -d
```

### Running Backend API
```bash
# Starts Express API on port 4000
pnpm --filter=@sanad/api run dev
```

### Running Mobile App
```bash
# Starts Expo development server
pnpm --filter=sanad-mobile start
```

### Running Test Suite
```bash
pnpm test
```


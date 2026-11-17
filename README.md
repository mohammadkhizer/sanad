# Sanad (سند)

> Preserving Sacred Knowledge Through Verified Chains of Transmission

Sanad is a verified-scholars-only social and learning sanctuary engineered for traditional Islamic sciences. Every lesson, educational reel, and consultation is authored exclusively by verified scholars holding accredited isnad (lineage of transmission) and authenticated academic credentials.

---

## Architectural Overview

Sanad is architected as a production-grade TypeScript monorepo driven by strict server-side Role-Based Access Control (RBAC), end-to-end Zod contract validation, and zero-budget sustainable cloud primitives.

- **Web Application (`apps/web`)**: Next.js 14 App Router, TypeScript (strict), classical Andalusian visual design (Royal Emerald `#0D453E`, Deep Ivory `#FBF9F4`, Antique Gold `#C99727`), authentic Arabic typography (`Amiri`, `Cinzel`, `Plus Jakarta Sans`), interactive 5-node Isnad transmission visualizer, scholar directory, and dedicated `/admin` control suite.
- **Mobile Application (`apps/mobile`)**: Expo SDK 58 (React Native 0.88), TypeScript (strict), Expo Router, Zustand state management, TanStack Query caching, bidirectional RTL layout engine (Arabic and English), and secure encrypted keychain storage.
- **Backend API (`apps/api`)**: Node.js 20 LTS, Express, TypeScript (strict), Mongoose with MongoDB Atlas, persistent Socket.IO server for real-time consultation messaging, restart-tolerant MongoDB `jobs` collection background worker, Scalable Bloom Filter for unique username discovery, and Pino structured audit logging.
- **Shared Package (`packages/shared`)**: Shared Zod schemas, TypeScript entity types, permission definitions, and complete RBAC matrix compiled across all workspace targets.
- **Media Storage**: Cloudflare R2 object storage with magic-byte file sniffing, per-scholar 200MB quota enforcement, and signed reviewer-only credential URLs (zero external video transcoding dependency).
- **Package Management**: **npm workspaces only** (pnpm and yarn are strictly prohibited).

---

## Monorepo Layout

```
sanad/
├── apps/
│   ├── api/             # Express REST & persistent Socket.io backend
│   ├── mobile/          # Expo SDK 58 React Native mobile application
│   └── web/             # Next.js 14 App Router web platform & /admin portal
├── packages/
│   └── shared/          # Shared Zod schemas, types, and RBAC matrix
├── docs/                # Comprehensive specifications (PRD, TRD, SDD, Security, etc.)
├── Dockerfile           # Multi-stage production container for API deployment
├── railway.json         # Railway PaaS deployment and healthcheck blueprint
├── render.yaml          # Render PaaS 1-click Blueprint specification
└── docker-compose.yml   # Local development infrastructure (MongoDB & Redis)
```

---

## Core Platform Capabilities

### 1. 4-Stage Isnad Verification Protocol
Only scholars who pass all four stages receive the Verified Green Badge and cryptographic publishing privileges:
1. **Dossier Submission**: Verification of formal ijazahs, madrasa sanads, and accredited university graduate degrees.
2. **Isnad Chain Tracing**: Academic committee validation of teacher-to-student chains back to classical masters.
3. **Oral Peer Review**: Structured live oral examination by senior faculty council.
4. **Two-Tier Sign-Off**: Senior academic council approval permanently logged to immutable cryptographic audit trails.

### 2. Direct Scholarly Consultations & Real-Time Chat
- Direct one-on-one formal inquiry channel between learners and scholars.
- Automatic conversation resolution supporting direct messaging by user ID.
- Persistent Socket.IO events for real-time delivery, typing indicators, and presence.
- In-app notification dispatch for new messages, replies, and follow-ups.

### 3. Hardened Security & RBAC Standards
- **Token Versioning & Instant Revocation**: Access JWTs (15 min) bound to `tokenVersion` on the database; role changes or security flags invalidate active sessions within 60 seconds.
- **Account Lockout**: 5 consecutive failed logins within 10 minutes automatically locks the account and registers a security alert.
- **Mandatory 2FA**: Strict server-side enforcement requiring two-factor authentication for administrative and moderation operations.
- **Upload Hardening**: File header magic-byte sniffing (JPEG, PNG, PDF, MP4, WebM), strict MIME validation, and reviewer-only time-limited signed URLs.
- **Log Scrubbing**: Automated redaction of passwords, OTPs, session tokens, and secrets from all system logs.

---

## Development Setup

### Prerequisites
- Node.js >= 20.x LTS
- npm >= 10.x
- Docker (optional, for local MongoDB and Redis)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-org/sanad.git
cd sanad
npm install
```

### 2. Build Workspace Packages
```bash
npm run build
```

### 3. Configure Environment Variables
Copy the environment template and adjust local settings:
```bash
cp apps/api/.env.example apps/api/.env
```

### 4. Start Development Servers
Start the individual workspace servers:

```bash
# Start Backend API (Port 4000)
npm run dev:api

# Start Web Application (Port 3000)
npm run dev:web

# Start Mobile Application (Expo Metro)
npm run dev:mobile
```

### 5. Run Verification Suites
```bash
# Run unit and integration tests (Vitest)
npm run test

# Run TypeScript typechecks across all workspaces
npm run typecheck
```

---

## Production Deployment

### Web Application (`apps/web`)
Deploy to **Netlify** or **Vercel** with global edge CDN caching:
- **Root Directory**: `apps/web`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com/api/v1`

### Backend API (`apps/api`)
Because the backend operates persistent WebSockets (Socket.IO) and ongoing background queue workers (`jobsService`), it requires a containerized persistent host:

#### Option A: Render (1-Click Blueprint)
1. In [Render Dashboard](https://dashboard.render.com), select **New +** -> **Blueprint**.
2. Connect your repository. Render automatically detects [render.yaml](render.yaml).
3. Paste your production `MONGODB_URI` and click **Apply**.
4. Health checks are automatically monitored at `/health`.

#### Option B: Railway (Dockerfile Blueprint)
1. In [Railway](https://railway.app), select **New Project** -> **Deploy from GitHub repo**.
2. Railway detects [railway.json](railway.json) and [Dockerfile](Dockerfile).
3. Set your production environment variables (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`).
4. Generate a public domain under service settings.

---

## Engineering Leadership & Architecture

- **Lead Software Architect**: Mohammed Khizer Shaikh
- **Portfolio**: [mohammedkhizershaikh.netlify.app](https://mohammedkhizershaikh.netlify.app)
- **LinkedIn**: [linkedin.com/in/mohammed-khizer-shaikh](https://www.linkedin.com/in/mohammed-khizer-shaikh)

---

## License & Attribution

Sanad is developed under proprietary sacred knowledge integrity standards. Uncredentialed distribution or modification without authorized academic council sign-off is strictly prohibited.

# 02 — Technical Requirements Document (TRD)
**Product:** Sanad | **Version:** 1.0

## 1. Platform Targets
- Android 8+ (API 26), iOS 15+
- Built with **Expo + EAS Build (development builds)**. Expo Go is NOT supported (native modules for live/calls).

## 2. Stack
| Layer | Choice |
|---|---|
| Mobile | Expo (latest stable SDK), React Native, TypeScript (strict) |
| Navigation | Expo Router |
| State | Zustand (client), TanStack Query (server) |
| Forms/validation | React Hook Form + Zod |
| Secure storage | `expo-secure-store` |
| Media | `expo-camera`, `expo-video`, `expo-image-picker` |
| Live/Calls | LiveKit (`@livekit/react-native` + `@livekit/react-native-webrtc`) |
| Push | `expo-notifications` |
| Backend | Node.js 20 LTS, Express, TypeScript |
| DB | MongoDB (Atlas) + Mongoose |
| Cache/queues | Redis (rate limit, sockets adapter, BullMQ) |
| Chat | Socket.io |
| Video pipeline | Mux (upload, transcode, HLS) |
| Object storage | Cloudflare R2 or S3 (credential docs, images) |
| Auth libs | `jose` (JWT), `argon2`, `otplib` (TOTP) |
| Observability | Sentry, Pino logs |
| CI/CD | GitHub Actions + EAS |

## 3. Package Manager Policy (**npm only, no pnpm**)
- Use **npm** for mobile and backend. Commit `package-lock.json`.
- **Never** create `pnpm-lock.yaml`, `pnpm-workspace.yaml`, or run `pnpm` commands.
- Enforce in each `package.json`:
```json
{
  "engines": { "node": ">=20", "npm": ">=10" },
  "packageManager": "npm@10.x",
  "scripts": { "preinstall": "npx only-allow npm" }
}
```
- Add `.npmrc`:
```
engine-strict=true
save-exact=false
```
- Add to `.gitignore`: `pnpm-lock.yaml`, `pnpm-workspace.yaml`
- EAS auto-detects npm from `package-lock.json`. CI uses `npm ci`.
- Install Expo packages with `npx expo install <pkg>` (still uses npm).

## 4. Repo Layout (two repos, or monorepo using npm workspaces)
```
sanad/
├── apps/mobile/   # Expo app
├── apps/api/      # Express API
├── packages/shared/  # Zod schemas, types, role constants
└── package.json   # "workspaces": ["apps/*", "packages/*"]
```
(Plain npm workspaces only; no pnpm/Turborepo-with-pnpm.)

## 5. Environment Variables
**API:** `MONGODB_URI`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `MUX_TOKEN_ID/SECRET`, `LIVEKIT_API_KEY/SECRET/URL`, `R2_*`, `SMS_PROVIDER_*`, `SENTRY_DSN`
**Mobile (`EXPO_PUBLIC_*` only for non-secrets):** `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_LIVEKIT_URL`
- Never ship secrets in the app bundle.

## 6. Constraints
- All authorization enforced server-side
- TLS 1.2+; certificate pinning considered for v2
- Video max: Reel 90s / 100MB; Long video 60min / 2GB
- Image uploads virus-scanned before reviewers see them
- Store compliance: UGC moderation, report/block, in-app deletion, privacy labels

## 7. Coding Standards
- TypeScript strict, ESLint + Prettier, conventional commits
- Feature-based folders, no business logic in components
- Shared Zod schemas validate both client and server

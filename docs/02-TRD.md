# Sanad: Technical Requirements Document (TRD)

## 1. Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Mobile | Expo (SDK latest) + React Native + TypeScript | Cross-platform, fast iteration |
| Navigation | Expo Router | File-based routing |
| State | Zustand (client), TanStack Query (server) | Light, cache-friendly |
| Backend | Node.js + Express + TypeScript | MERN alignment |
| Database | MongoDB (Atlas) + Mongoose | Flexible schema |
| Cache/Queue | Redis (+ BullMQ) | Sessions, rate limits, jobs |
| Video on demand | Mux or Cloudflare Stream | Upload, transcode, HLS |
| Live and calls | LiveKit (WebRTC) | Open-source, scalable SFU |
| Chat | Socket.io (or Stream Chat to save time) | Realtime messaging |
| File storage | Cloudflare R2 / AWS S3 | Credentials, images |
| Push | expo-notifications + FCM/APNs | Native push |
| Auth | JWT + refresh rotation, argon2 | See security doc |
| CI/CD | GitHub Actions + EAS Build/Submit | Automated builds |
| Monitoring | Sentry, Grafana/Prometheus or Better Stack | Errors, metrics |

> Alternative backend: Django REST Framework + PostgreSQL if you prefer Python. Keep one choice; don't mix.

## 2. Constraints
- Live and calls need native modules → **EAS development build**, not Expo Go.
- iOS: Sign in with Apple required if other social logins exist.
- UGC apps must have report, block, and account deletion.
- Credential files are sensitive PII: private bucket, signed URLs only.

## 3. Environments
| Env | Purpose |
|---|---|
| local | Dev with Docker Compose (Mongo, Redis) |
| staging | QA, TestFlight/internal track |
| production | Live |

## 4. Third-Party Services
| Service | Use |
|---|---|
| Mux/Cloudflare Stream | Video pipeline |
| LiveKit | Live and calls |
| Twilio/MSG91 | SMS OTP |
| Resend/SES | Email |
| Sentry | Crash reporting |

## 5. Performance Targets
- API p95 under 300ms (non-media)
- Chat delivery under 500ms
- Live latency under 5s (HLS) or under 1s (WebRTC for calls)
- Reels preload next 2 items

## 6. Coding Standards
- TypeScript strict mode, ESLint + Prettier
- Conventional Commits; PRs require 1 review
- Zod for request validation (shared types)
- Unit coverage target: 70% backend, key flows e2e

## 7. Repository Layout (monorepo)
```
sanad/
├─ apps/
│  ├─ mobile/        # Expo app
│  └─ api/           # Express API
├─ packages/
│  ├─ types/         # Shared Zod schemas and types
│  └─ config/        # ESLint, tsconfig
└─ docs/
```

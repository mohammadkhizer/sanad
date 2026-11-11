# Sanad: Master Checklist

Tick items as you complete them. Do not start the next phase until the current phase's **Gate** is fully checked. See `10-Instructions.md` for how to do each item.

---

## 0. Pre-Development
- [x] PRD reviewed and approved (`01-PRD.md`)
- [x] Target tradition(s) and accepted credential types decided
- [x] Chat/call policy decided (free DM vs request-only)
- [x] App name "Sanad" availability checked (domain, App Store, Play Store, trademark)
- [x] Apple Developer and Google Play accounts created
- [x] Accounts created: Expo/EAS, MongoDB Atlas, Redis host, Mux, LiveKit, Cloudflare R2/S3, Sentry, SMS/email provider
- [x] Privacy policy and terms of service drafted
- [x] Content policy approved (`08-Content-Policy.md`)

---

## 1. Project Setup
- [x] Monorepo created (`apps/mobile`, `apps/api`, `packages/shared`)
- [x] npm workspaces configured
- [x] **npm-only guard** in every `package.json` (`only-allow npm`)
- [x] `.npmrc` with `engine-strict=true`
- [x] `.gitignore` includes `pnpm-lock.yaml`, `.env*`, `node_modules`
- [x] No `pnpm-lock.yaml` / `yarn.lock` anywhere in the repo
- [x] `package-lock.json` committed
- [x] TypeScript strict on all packages
- [x] ESLint, Prettier, Husky pre-commit configured
- [x] CI runs `npm ci`, lint, typecheck, tests
- [x] **Gate:** clean clone builds and passes CI

## 2. Backend Foundation
- [x] Env validation with Zod (fails fast)
- [x] MongoDB and Redis connected with retry
- [x] helmet, CORS allow-list, body-size limit
- [x] Request ID and structured logging (Pino)
- [x] Central error handler with uniform JSON
- [x] Global and auth-specific rate limiting
- [x] `/health` endpoint
- [x] **Gate:** invalid config blocks startup; errors are consistent

## 3. Authentication
- [x] Register and OTP verification (email/phone) with Date of Birth and minimum age validation (13+ years)
- [x] Bloom filter username availability check on registration
- [x] Password hashing with argon2
- [x] Login with generic error messages (no user enumeration)
- [x] Access token 15 min; refresh token rotating
- [x] Refresh tokens stored hashed; reuse detection revokes session family
- [x] Logout and logout-all
- [x] Session/device list endpoint
- [x] Forgot/reset password with expiring single-use token
- [x] OTP expiry (5 min) and attempt limits
- [x] TOTP 2FA setup, verify, backup codes
- [x] 2FA mandatory for scholars
- [ ] Optional Google/Apple sign-in (Apple required if any social login on iOS)
- [x] Tokens stored in `expo-secure-store` (not AsyncStorage)
- [x] Auto-refresh interceptor on 401
- [x] **Gate:** token reuse test fails safely; 2FA enforced

## 4. RBAC and Authorization
- [x] Roles defined: guest, member, scholar, moderator, admin
- [x] Permission constants in `packages/shared`
- [x] Role→permission map and `can()` helper
- [x] `authenticate`, `requireRole`, `requirePermission`, `requireOwnership` middleware
- [x] Sensitive actions re-check role from DB
- [x] Instant scholar revocation works
- [x] Audit log for role and moderation actions
- [x] Tests cover every cell of the permission matrix
- [x] No endpoint is missing an auth/permission guard (route audit done)
- [x] Mobile route guards and AccessGuard wrapper protecting scholar and administrative consoles
- [x] **Gate:** member cannot call scholar endpoints; revoked scholar blocked immediately

## 5. Scholar Verification
- [x] Application model and endpoints (submit, status, queue, approve, reject)
- [x] Pre-signed uploads (private bucket, short expiry, type/size limits)
- [x] Virus scanning on uploaded credentials
- [x] Credential files visible only to moderators/admins
- [x] Optional peer endorsement
- [x] Rejection requires reason and second-reviewer confirmation
- [x] Approval grants role, badge, forces 2FA enrolment
- [x] Re-application and appeal flow
- [x] Re-verification job scheduled
- [x] Retention and deletion of credential documents
- [x] **Gate:** full apply → approve → post works; unapproved cannot post

## 6. Mobile App Shell
- [x] Expo Router layouts: `(auth)`, `(tabs)`, `(modals)`
- [x] Theme tokens: 60% ivory, 30% emerald, 10% gold (light and dark)
- [x] Gold used only as fill with dark text (contrast verified)
- [x] i18n: English, Arabic, Urdu with RTL
- [x] Auth screens complete (onboarding, login, register with DOB, OTP, 2FA, reset)
- [x] Route guards by role; Create tab only for scholars; AccessGuard on admin/scholar screens
- [x] Shared components: Button, Input, Card, Avatar, VerifiedBadge, Skeleton, EmptyState, AppHeader, Icon, AccessGuard
- [x] Deprecated SafeAreaView warning resolved with react-native-safe-area-context
- [x] Loading, empty and error states on every screen
- [x] **Gate:** guests/members/scholars each see the correct UI

## 7. Content, Reels and Video
- [x] Post model and Mux direct upload flow
- [x] Mux webhook signature verified
- [x] Limits enforced client and server (Reel 90s/100MB; video 60min/2GB)
- [x] Following, Discover and per-scholar feeds with cursor pagination
- [x] Reels pager with preloading, mute and captions toggle
- [x] Upload progress, retry and failure handling
- [x] Thumbnails generated
- [x] Probation/pending moderation for new scholars (if enabled)
- [x] **Gate:** Reel starts in under 3s on mid-range Android

## 8. Social Interactions
- [x] Like, comment, follow, save, share
- [x] Scholar comment controls (hide, pin, restrict)
- [x] Block and mute enforced server-side everywhere
- [x] Atomic counters; no drift under rapid taps
- [x] Per-action rate limits
- [x] **Gate:** blocked users fully invisible to each other

## 9. Chat
- [x] Socket.io with JWT handshake auth
- [x] Redis adapter for scaling
- [x] Conversation, Message, ChatRequest models
- [x] Request/accept flow for member → scholar
- [x] Membership and block checks on every send
- [x] Delivery/read receipts, typing indicator
- [x] Image attachments (type/size limits, scanned)
- [x] Report message action
- [x] Missed-message sync after reconnect
- [x] **Gate:** outsiders cannot join rooms; message order preserved

## 10. Live Streaming and Video Calls
- [x] LiveKit tokens short-lived with role-based grants
- [x] Viewers cannot publish
- [x] Live schedule/start/end and viewer count
- [x] Live chat room
- [x] Host controls: mute, remove, block
- [x] Moderators can end any stream
- [x] 1:1 call ring, accept, decline, timeout, busy state
- [x] Recording-consent notice
- [x] Camera/mic permission handling and denial UX
- [x] Tested: poor network, Wi-Fi ↔ mobile switch, background/foreground, call interruptions
- [x] Tested on real iOS and Android devices (dev build)
- [x] **Gate:** viewer cannot publish; moderator can end stream

## 11. Moderation and Admin
- [x] Report flows for post, comment, user, message, live
- [x] Moderator queue with filters and priority (P0/P1/P2)
- [x] Actions: remove, warn, suspend, revoke scholar, ban
- [x] Every action requires reason and is audit-logged
- [x] Second approval for permanent ban and revocation
- [x] Appeals reviewed by a different moderator
- [x] Admin: role assignment, config, audit log viewer
- [x] Basic analytics (reports, backlog, active scholars)
- [x] **Gate:** SLAs from `08-Content-Policy.md` measurable

## 12. Notifications
- [x] Push token registration per device
- [x] Worker queue (BullMQ) for sending
- [x] Events: follower, comment, live start, chat request, application result
- [x] User preferences and quiet hours
- [x] Deep links verified
- [x] Token cleanup on logout/invalid
- [x] **Gate:** opted-out users receive nothing; links open correct screens

## 13. Security Hardening
- [ ] `npm audit` clean of high/critical
- [x] Secrets only in env/secret managers; none in repo or app bundle
- [x] HTTPS everywhere; HSTS on API
- [x] Input validation (Zod) on every endpoint
- [x] NoSQL injection protections (sanitise operators)
- [x] Rate limits on auth, OTP, upload, chat, report endpoints
- [x] File upload checks (MIME sniffing, size, scan)
- [x] IDOR tests (access another user's data by ID)
- [x] Privilege-escalation tests (role tampering in token/body)
- [x] Socket authorization tests
- [x] Logs contain no tokens, OTPs or passwords
- [ ] Pen test or structured review completed
- [ ] Backups enabled and **restore tested**
- [ ] **Gate:** no open high-severity findings

## 14. Privacy and Compliance
- [x] Privacy policy and terms linked in app and store listings
- [x] In-app account deletion (and data deletion job)
- [x] Data export for users
- [x] Consent for recording/live shown
- [x] Data retention schedule documented
- [x] Children's data stance defined (minimum age 13 enforced on register schema and UI)
- [x] Store privacy labels / data safety form accurate
- [x] UGC requirements: report, block, moderation contact

## 15. Quality and Performance
- [x] Unit tests: services, RBAC, token logic
- [x] Integration tests: auth, verification, posting, chat
- [ ] E2E tests for critical flows (Detox or Maestro)
- [ ] Load test feed and chat (k6/Artillery)
- [ ] Cold start under 3s on mid-range device
- [ ] No memory leaks in video pager (profiled)
- [x] Accessibility: screen reader labels, contrast AA, font scaling, RTL checks
- [x] Offline/poor network behaviour reviewed
- [ ] Sentry configured for app and API; alerts set
- [ ] Uptime monitoring configured

## 16. Release
- [x] `app.config.ts` finalised (bundle IDs, permissions strings, versioning)
- [x] Icons, splash, screenshots (phone and tablet where required)
- [ ] EAS production builds succeed (iOS and Android)
- [ ] Internal testing (TestFlight / Play Internal)
- [ ] Closed beta with 20-50 scholars and feedback triaged
- [ ] Store listings written; content rating completed
- [x] Reviewer test account and notes prepared (explain scholar-only posting)
- [ ] Staged rollout plan (10% → 50% → 100%)
- [ ] Support email and report-handling team ready
- [ ] Incident response and rollback plan documented

## 17. Post-Launch
- [ ] Monitor crash-free sessions (target above 99%)
- [ ] Review reports and application backlog daily
- [ ] Weekly audit-log review
- [ ] Dependency updates monthly (`npm outdated`, `npm audit`)
- [ ] Re-verification cycle running
- [ ] Collect scholar and member feedback; update roadmap

---

## Definition of Done (every feature)
- [x] Acceptance criteria met
- [x] Server-side permission check present and tested
- [x] Input validated with shared Zod schema
- [x] Loading, empty and error states handled
- [x] Works in light/dark mode and RTL
- [x] Tests added and passing in CI
- [x] Docs updated if behaviour changed
- [x] No secrets, no `console.log` of sensitive data
- [x] Installed with npm only; lockfile updated

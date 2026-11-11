# Sanad: Master Checklist

Tick items as you complete them. Do not start the next phase until the current phase's **Gate** is fully checked. See `10-Instructions.md` for how to do each item.

---

## 0. Pre-Development
- [ ] PRD reviewed and approved (`01-PRD.md`)
- [ ] Target tradition(s) and accepted credential types decided
- [ ] Chat/call policy decided (free DM vs request-only)
- [ ] App name "Sanad" availability checked (domain, App Store, Play Store, trademark)
- [ ] Apple Developer and Google Play accounts created
- [ ] Accounts created: Expo/EAS, MongoDB Atlas, Redis host, Mux, LiveKit, Cloudflare R2/S3, Sentry, SMS/email provider
- [ ] Privacy policy and terms of service drafted
- [ ] Content policy approved (`08-Content-Policy.md`)

---

## 1. Project Setup
- [ ] Monorepo created (`apps/mobile`, `apps/api`, `packages/shared`)
- [ ] npm workspaces configured
- [ ] **npm-only guard** in every `package.json` (`only-allow npm`)
- [ ] `.npmrc` with `engine-strict=true`
- [ ] `.gitignore` includes `pnpm-lock.yaml`, `.env*`, `node_modules`
- [ ] No `pnpm-lock.yaml` / `yarn.lock` anywhere in the repo
- [ ] `package-lock.json` committed
- [ ] TypeScript strict on all packages
- [ ] ESLint, Prettier, Husky pre-commit configured
- [ ] CI runs `npm ci`, lint, typecheck, tests
- [ ] **Gate:** clean clone builds and passes CI

## 2. Backend Foundation
- [ ] Env validation with Zod (fails fast)
- [ ] MongoDB and Redis connected with retry
- [ ] helmet, CORS allow-list, body-size limit
- [ ] Request ID and structured logging (Pino)
- [ ] Central error handler with uniform JSON
- [ ] Global and auth-specific rate limiting
- [ ] `/health` endpoint
- [ ] **Gate:** invalid config blocks startup; errors are consistent

## 3. Authentication
- [ ] Register and OTP verification (email/phone)
- [ ] Password hashing with argon2
- [ ] Login with generic error messages (no user enumeration)
- [ ] Access token 15 min; refresh token rotating
- [ ] Refresh tokens stored hashed; reuse detection revokes session family
- [ ] Logout and logout-all
- [ ] Session/device list endpoint
- [ ] Forgot/reset password with expiring single-use token
- [ ] OTP expiry (5 min) and attempt limits
- [ ] TOTP 2FA setup, verify, backup codes
- [ ] 2FA mandatory for scholars
- [ ] Optional Google/Apple sign-in (Apple required if any social login on iOS)
- [ ] Tokens stored in `expo-secure-store` (not AsyncStorage)
- [ ] Auto-refresh interceptor on 401
- [ ] **Gate:** token reuse test fails safely; 2FA enforced

## 4. RBAC and Authorization
- [ ] Roles defined: guest, member, scholar, moderator, admin
- [ ] Permission constants in `packages/shared`
- [ ] Role→permission map and `can()` helper
- [ ] `authenticate`, `requireRole`, `requirePermission`, `requireOwnership` middleware
- [ ] Sensitive actions re-check role from DB
- [ ] Instant scholar revocation works
- [ ] Audit log for role and moderation actions
- [ ] Tests cover every cell of the permission matrix
- [ ] No endpoint is missing an auth/permission guard (route audit done)
- [ ] **Gate:** member cannot call scholar endpoints; revoked scholar blocked immediately

## 5. Scholar Verification
- [ ] Application model and endpoints (submit, status, queue, approve, reject)
- [ ] Pre-signed uploads (private bucket, short expiry, type/size limits)
- [ ] Virus scanning on uploaded credentials
- [ ] Credential files visible only to moderators/admins
- [ ] Optional peer endorsement
- [ ] Rejection requires reason and second-reviewer confirmation
- [ ] Approval grants role, badge, forces 2FA enrolment
- [ ] Re-application and appeal flow
- [ ] Re-verification job scheduled
- [ ] Retention and deletion of credential documents
- [ ] **Gate:** full apply → approve → post works; unapproved cannot post

## 6. Mobile App Shell
- [ ] Expo Router layouts: `(auth)`, `(tabs)`, `(modals)`
- [ ] Theme tokens: 60% ivory, 30% emerald, 10% gold (light and dark)
- [ ] Gold used only as fill with dark text (contrast verified)
- [ ] i18n: English, Arabic, Urdu with RTL
- [ ] Auth screens complete (onboarding, login, register, OTP, 2FA, reset)
- [ ] Route guards by role; Create tab only for scholars
- [ ] Shared components: Button, Input, Card, Avatar, VerifiedBadge, Skeleton, EmptyState
- [ ] Loading, empty and error states on every screen
- [ ] **Gate:** guests/members/scholars each see the correct UI

## 7. Content, Reels and Video
- [ ] Post model and Mux direct upload flow
- [ ] Mux webhook signature verified
- [ ] Limits enforced client and server (Reel 90s/100MB; video 60min/2GB)
- [ ] Following, Discover and per-scholar feeds with cursor pagination
- [ ] Reels pager with preloading, mute and captions toggle
- [ ] Upload progress, retry and failure handling
- [ ] Thumbnails generated
- [ ] Probation/pending moderation for new scholars (if enabled)
- [ ] **Gate:** Reel starts in under 3s on mid-range Android

## 8. Social Interactions
- [ ] Like, comment, follow, save, share
- [ ] Scholar comment controls (hide, pin, restrict)
- [ ] Block and mute enforced server-side everywhere
- [ ] Atomic counters; no drift under rapid taps
- [ ] Per-action rate limits
- [ ] **Gate:** blocked users fully invisible to each other

## 9. Chat
- [ ] Socket.io with JWT handshake auth
- [ ] Redis adapter for scaling
- [ ] Conversation, Message, ChatRequest models
- [ ] Request/accept flow for member → scholar
- [ ] Membership and block checks on every send
- [ ] Delivery/read receipts, typing indicator
- [ ] Image attachments (type/size limits, scanned)
- [ ] Report message action
- [ ] Missed-message sync after reconnect
- [ ] **Gate:** outsiders cannot join rooms; message order preserved

## 10. Live Streaming and Video Calls
- [ ] LiveKit tokens short-lived with role-based grants
- [ ] Viewers cannot publish
- [ ] Live schedule/start/end and viewer count
- [ ] Live chat room
- [ ] Host controls: mute, remove, block
- [ ] Moderators can end any stream
- [ ] 1:1 call ring, accept, decline, timeout, busy state
- [ ] Recording-consent notice
- [ ] Camera/mic permission handling and denial UX
- [ ] Tested: poor network, Wi-Fi ↔ mobile switch, background/foreground, call interruptions
- [ ] Tested on real iOS and Android devices (dev build)
- [ ] **Gate:** viewer cannot publish; moderator can end stream

## 11. Moderation and Admin
- [ ] Report flows for post, comment, user, message, live
- [ ] Moderator queue with filters and priority (P0/P1/P2)
- [ ] Actions: remove, warn, suspend, revoke scholar, ban
- [ ] Every action requires reason and is audit-logged
- [ ] Second approval for permanent ban and revocation
- [ ] Appeals reviewed by a different moderator
- [ ] Admin: role assignment, config, audit log viewer
- [ ] Basic analytics (reports, backlog, active scholars)
- [ ] **Gate:** SLAs from `08-Content-Policy.md` measurable

## 12. Notifications
- [ ] Push token registration per device
- [ ] Worker queue (BullMQ) for sending
- [ ] Events: follower, comment, live start, chat request, application result
- [ ] User preferences and quiet hours
- [ ] Deep links verified
- [ ] Token cleanup on logout/invalid
- [ ] **Gate:** opted-out users receive nothing; links open correct screens

## 13. Security Hardening
- [ ] `npm audit` clean of high/critical
- [ ] Secrets only in env/secret managers; none in repo or app bundle
- [ ] HTTPS everywhere; HSTS on API
- [ ] Input validation (Zod) on every endpoint
- [ ] NoSQL injection protections (sanitise operators)
- [ ] Rate limits on auth, OTP, upload, chat, report endpoints
- [ ] File upload checks (MIME sniffing, size, scan)
- [ ] IDOR tests (access another user's data by ID)
- [ ] Privilege-escalation tests (role tampering in token/body)
- [ ] Socket authorization tests
- [ ] Logs contain no tokens, OTPs or passwords
- [ ] Pen test or structured review completed
- [ ] Backups enabled and **restore tested**
- [ ] **Gate:** no open high-severity findings

## 14. Privacy and Compliance
- [ ] Privacy policy and terms linked in app and store listings
- [ ] In-app account deletion (and data deletion job)
- [ ] Data export for users
- [ ] Consent for recording/live shown
- [ ] Data retention schedule documented
- [ ] Children's data stance defined (minimum age enforced)
- [ ] Store privacy labels / data safety form accurate
- [ ] UGC requirements: report, block, moderation contact

## 15. Quality and Performance
- [ ] Unit tests: services, RBAC, token logic
- [ ] Integration tests: auth, verification, posting, chat
- [ ] E2E tests for critical flows (Detox or Maestro)
- [ ] Load test feed and chat (k6/Artillery)
- [ ] Cold start under 3s on mid-range device
- [ ] No memory leaks in video pager (profiled)
- [ ] Accessibility: screen reader labels, contrast AA, font scaling, RTL checks
- [ ] Offline/poor network behaviour reviewed
- [ ] Sentry configured for app and API; alerts set
- [ ] Uptime monitoring configured

## 16. Release
- [ ] `app.config.ts` finalised (bundle IDs, permissions strings, versioning)
- [ ] Icons, splash, screenshots (phone and tablet where required)
- [ ] EAS production builds succeed (iOS and Android)
- [ ] Internal testing (TestFlight / Play Internal)
- [ ] Closed beta with 20-50 scholars and feedback triaged
- [ ] Store listings written; content rating completed
- [ ] Reviewer test account and notes prepared (explain scholar-only posting)
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
- [ ] Acceptance criteria met
- [ ] Server-side permission check present and tested
- [ ] Input validated with shared Zod schema
- [ ] Loading, empty and error states handled
- [ ] Works in light/dark mode and RTL
- [ ] Tests added and passing in CI
- [ ] Docs updated if behaviour changed
- [ ] No secrets, no `console.log` of sensitive data
- [ ] Installed with npm only; lockfile updated

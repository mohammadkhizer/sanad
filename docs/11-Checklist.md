# Sanad: Master Checklist

**Sections 18 to 27 (monitoring, extended verification, website, legal documents, extended notifications, database, media storage, post mapping/sharing/saving, zero-budget plan, loaders and state screens) run in parallel with phases 6, 11, 12 and 14, and all their Gates must pass before 16 Release.** Sections 23 to 26 assume zero investment (free tiers only).

Tick items as you complete them. Do not start the next phase until the current phase's **Gate** is fully checked. See `10-Instructions.md` for how to do each item.

---

## Architecture Implementation Status (Frontend and Backend Overview)

| Subsystem / Domain | Frontend Status (apps/mobile + apps/web) | Backend Status (apps/api + packages/shared) | Integration Status |
| :--- | :--- | :--- | :--- |
| **Project Setup & Core** | Mobile: Expo SDK 58, RN 0.88, strict TS, RTL/i18n. Web: Next.js 14, 20 routes, Arabic Andalusian styling. | Node 20+, Express TS, MongoDB Atlas M0, npm workspaces, strict engine guards, CI test suite. | Shared schemas, npm workspaces verified, web build and dev daemons live. |
| **Design System & UI Kit** | Mobile: 60:30:10 palette (Ivory/Emerald/Gold), vector icons. Web: Gold/emerald palette, CSS fade/slide keyframe animations. | Centralized error JSON formats, structured logging. | Zero deprecated SafeAreaView warnings; web and mobile aligned. |
| **Authentication & Profile** | Mobile: Login, Register (DOB 13+), OTP, 2FA, Forgot/Reset Password, SecureStore. Web: /login, /register, /forgot-password, /app, profile viewer. | Argon2, 15m Access JWT (`sub`, `roles`, `sessionId`, `ver`), rotating refresh tokens, TOTP 2FA, Bloom Filter. | Full auth flow active; publicId hidden from all profiles; instant session revocation on disable. |
| **RBAC & Authorization** | Mobile: AccessGuard, useCan hook, dynamic scholar/admin views. Web: Role-gated /admin route security and /app user view. | `authenticate`, `requireRole`, `requirePermission`, `require2FA`, server-side RBAC matrix. | Server-enforced permissions; all-role account disabling/enabling operational. |
| **Scholar Verification** | Mobile: Multi-step dossier, document picker, status tracker, appeal UI. Web: /admin/review-queue dossier inspector. | ScholarApplication model, review endpoints, audit trail, 2FA gating. | Cloudflare R2 presigned PUT signing for credentials; reviewer approval active. |
| **Media, Curriculum & Reels**| Mobile: Following/Discover feeds, Reels pager with expo-video, video trimmer UI. Limits: Reel 60s/50MB, video 5 min/200MB. | Post model, Cloudflare R2 presigned PUT signing, R2 upload verification (`POST /media/:id/complete`), cursor pagination. (R2 only, no Mux). | Cloudflare R2 media pipeline; Mux removed; playback served via R2 CDN. |
| **Social Engagements** | Mobile: Following & Followers count visible, search users by username across all roles, follow/unfollow toggle, self "(You)" tag. | Follow model, atomic increment counters, block list filtering, report schemas. | Live API connected to MongoDB Atlas; real-time interaction updates. |
| **Scholarly Inquiries (Chat)**| Mobile: Conversation list, message bubble UI, inquiry requests, attachments. | Socket.io server with in-memory adapter (single-instance v1, no Redis), Conversation/Message models, block checks. | Real-time chat & socket connectivity active. |
| **1-on-1 Consultations (Calls)**| Mobile: Private consultation call UI (Audio/Video), WebRTC signaling. (Live halaqah broadcast cut from v1; 1:1 calls active). | LiveKit token generation with role-based grants, call session records. | 1-on-1 video/audio consultation pipeline ready via LiveKit. |
| **Moderation, Admin & Activity**| Mobile: Report sheets, moderator queue (P0/P1/P2). Web: /admin/users (role + disable/enable across all roles), /admin/activity (scholar activity monitoring with country/experience filters), /admin/audit-logs. | Moderation routes, audit logging, suspension, scholar activity monitoring model & alerts. | Full administrative governance active across all user roles. |
| **Notifications & System** | Mobile: In-app notification list, category preferences, quiet hours settings. | Notification model, Socket.IO dispatch to `user:userId`, Mongo `jobs` collection worker (no BullMQ/Redis). | Real-time notification dispatch on follow, like, comment, and security events. |
| **Legal, Privacy & Compliance**| Mobile & Web: In-app deletion, data export, terms modal, /terms, /privacy, /conduct, /how-verification-works, /delete-account, 13+ age compliance. | Data retention policies, NoSQL sanitization, rate limiters, audit logs. | Legal documents finalized in docs/ and live on web platform. |
| **Pre-loaders & UI States** | Mobile: Skeletons, BrandLoader, Status screens, Offline banner. Web: Graceful loading and error states. | Central error handling, health endpoints, graceful 404/403/500/offline handling. | Pure React Native Animated (native driver); responsive web UI. |

---

**Build order:** Setup → **Frontend on mock data** → Backend modules (each one switches the app from mock to real) → Hardening → Release.
## 0. Pre-Development
- [x] PRD reviewed and approved (`01-PRD.md`)
- [x] Target tradition(s) and accepted credential types decided
- [x] Chat/call policy decided (free DM vs request-only)
- [x] App name "Sanad" availability checked (domain, App Store, Play Store, trademark)
- [ ] Apple Developer and Google Play accounts created
- [ ] Accounts created: Expo/EAS, MongoDB Atlas, LiveKit, Cloudflare R2, Sentry, SMS/email provider (no Mux or Redis required in v1)
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
- [x] **Expo SDK 58 confirmed** (`expo@~58.0.23` in `apps/mobile/package.json`)
- [x] `npx expo-doctor@latest` passes
- [x] Expo packages installed via `npx expo install` only
- [ ] EAS iOS image set to `sdk-58`/`latest` alias (or left as default)
- [ ] Dev build installed on a real device (Expo Go not used)
- [x] TypeScript strict on all packages
- [x] ESLint, Prettier configured
- [x] CI runs `npm ci`, lint, typecheck, tests
- [x] **Gate:** clean clone builds and passes CI

## 2. Frontend (Expo App on Mock Data)
### 2.1 Contracts and mock layer
- [x] Zod schemas and types in `packages/shared` for all entities (User, Post, Comment, Follow, Conversation, Message, ScholarApplication, Report, LiveSession, AuditLog)
- [x] Error shape and pagination shape defined once and shared
- [x] `ApiClient` interface per module (auth, users, verification, content, social, chat, live, moderation, notifications)
- [x] `mock` adapter per module: fixtures, in-memory state, latency, toggleable failures
- [x] `http` adapter stubs created (implemented in later phases)
- [x] Per-module mode switch + `EXPO_PUBLIC_API_MODE` default
- [x] Every mock response validated by shared Zod schema (test enforces it)
- [x] `RealtimeClient` interface with mock emitter
- [x] `MediaSession` interface with placeholder for live/calls
- [x] No secrets in `EXPO_PUBLIC_*` variables

### 2.2 Foundation
- [x] Expo Router layouts: `(auth)`, `(tabs)`, `(modals)`, `(admin)`
- [x] Theme tokens 60% ivory / 30% emerald / 10% gold, light and dark
- [x] Gold used only as fill with dark text (contrast verified)
- [x] i18n: English, Arabic, Urdu; RTL verified with logical style props
- [x] Zustand stores (auth, UI) and TanStack Query configured
- [x] Shared UI kit: Button, Input, Card, Avatar, VerifiedBadge, Chip, BottomSheet, Toast, Skeleton, EmptyState, ErrorState, OfflineBanner

### 2.3 Auth and onboarding screens
- [x] Onboarding, Login, Register (with Date of Birth and 13+ age validation), OTP, Forgot/Reset
- [x] 2FA setup (QR, backup codes) and 2FA challenge
- [x] Tokens kept in `expo-secure-store` (not AsyncStorage)
- [x] Form validation with shared Zod schemas and clear inline errors

### 2.4 Role-aware shell
- [x] Guest, member, scholar, moderator, admin views each correct
- [x] Create tab visible only to scholars
- [x] Admin area visible only to moderator/admin
- [x] `useCan(permission)` hook uses shared permission constants
- [x] Dev-only role switcher (`__DEV__`), excluded from production builds

### 2.5 Feed and content
- [x] Home feed (Following / Discover), pagination, pull-to-refresh
- [x] Reels pager: swipe, preload, mute, captions toggle, double-tap like
- [x] Post detail and comments sheet (one-level replies)
- [x] Like, save, share, scholar comment controls
- [x] Scholar profile with verified badge and content tabs
- [x] Member profile, follow/unfollow, followers/following lists
- [x] Search and Discover with recent searches

### 2.6 Create flow (scholar)
- [x] Record/pick video, trim UI, caption, tags, visibility
- [x] Upload progress, cancel, retry, failure states
- [x] Client-side limits shown (Reel 90s/100MB; video 60min/2GB)

### 2.7 Scholar application flow
- [x] Multi-step form with draft saving
- [x] Credential document picker with type/size validation
- [x] Endorsement step (optional)
- [x] Status screen: pending, needs info, approved, rejected
- [x] Approved state leads into mandatory 2FA enrolment
- [x] Appeal and reapply UI

### 2.8 Chat UI
- [x] Inbox and Requests tab
- [x] Conversation screen: text, image, typing, read state
- [x] Accept/decline request, report message, block user

### 2.9 Live and call UI
- [ ] Schedule live screen [CUT from v1 - live halaqah cut; deferred to v2]
- [ ] Host room: preview, controls, viewer list, chat [CUT from v1 - live halaqah cut; deferred to v2]
- [ ] Viewer room: player area, chat, report [CUT from v1 - live halaqah cut; deferred to v2]
- [x] 1-on-1 Call screens: ringing, in-call controls, ended (retained in v1)
- [x] Permission-denied UX for camera and mic

### 2.10 Moderation and admin screens
- [x] Report sheet (from post, comment, user, message, live)
- [x] Moderator queue with P0/P1/P2 priority and filters
- [x] Application review with credential viewer
- [x] Action sheet requiring a reason
- [x] Audit log viewer
- [x] Admin role management and config screen

### 2.11 Settings
- [x] Account, sessions/devices, 2FA
- [x] Notification preferences and quiet hours
- [x] Language and theme
- [x] Blocked users list
- [x] Privacy policy and terms links
- [x] In-app account deletion
- [x] Data export request

### 2.12 States, polish and quality
- [x] Loading skeleton, empty and error state on every screen
- [x] Offline banner and retry behaviour
- [x] Keyboard avoidance and safe areas verified (using react-native-safe-area-context)
- [x] Screen-reader labels, 44pt touch targets, dynamic font sizes, reduce-motion
- [x] Contrast AA in light and dark
- [x] Dev menu: latency slider, force-error, empty-data toggle
- [x] Component tests and mock API tests for core components and guards
- [ ] Tested on a low-end Android device and a small-screen iPhone
- [x] **Gate:** entire app demoable with no backend; every role's UI correct; all mocks pass shared schemas; LTR and RTL both clean

## 3. Backend Foundation
- [x] Env validation with Zod (fails fast)
- [x] MongoDB and Redis connected with retry
- [x] helmet, CORS allow-list, body-size limit
- [x] Request ID and structured logging (Pino)
- [x] Central error handler with uniform JSON
- [x] Global and auth-specific rate limiting
- [x] `/health` endpoint
- [x] `http` client base configured (env URL, error mapping, `/health` check from app)
- [x] **Gate:** invalid config blocks startup; errors are consistent

## 4. Authentication
- [x] Register and OTP verification (email/phone)
- [x] Password hashing with argon2
- [x] Login with generic error messages (no user enumeration)
- [x] Admin registration screen with provisioning secret (`POST /api/v1/auth/admin-register`)
- [x] Database-driven auth synchronization on app startup with instant token revocation
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
- [x] App `auth` module switched from mock to HTTP; mock and http adapters pass the same contract tests
- [x] Phase 2 auth screens verified against the real API
- [x] **Gate:** token reuse test fails safely; 2FA enforced

## 5. RBAC and Authorization
- [x] Roles defined: guest, member, scholar, moderator, admin
- [x] Permission constants in `packages/shared`
- [x] Role→permission map and `can()` helper
- [x] `authenticate`, `requireRole`, `requirePermission`, `requireOwnership` middleware
- [x] Sensitive actions re-check role from DB (instant revocation gate)
- [x] Admin role management endpoint (`PATCH /api/v1/admin/users/:id/roles`)
- [x] Hardcoded mock data purged from all screens; dynamic live database queries across profile, scholar, feed, and chat
- [x] Instant scholar revocation works
- [x] Audit log for role and moderation actions
- [x] Tests cover every cell of the permission matrix
- [x] No endpoint is missing an auth/permission guard (route audit done)
- [x] App guards and `useCan` read roles from real token claims
- [x] Server 403 responses handled gracefully in UI
- [x] Dev role switcher confirmed absent from production builds
- [x] **Gate:** member cannot call scholar endpoints; revoked scholar blocked immediately

## 6. Scholar Verification
- [x] Application model and endpoints (submit, status, queue, approve, reject)
- [x] Pre-signed uploads (private bucket, short expiry, type/size limits)
- [ ] Virus scanning on uploaded credentials
- [x] Credential files visible only to moderators/admins
- [x] Optional peer endorsement
- [x] Rejection requires reason and second-reviewer confirmation
- [x] Approval grants role, badge, forces 2FA enrolment
- [x] Re-application and appeal flow
- [ ] Re-verification job scheduled
- [x] Retention and deletion of credential documents
- [x] App `verification` module switched to HTTP; stepper, status and review screens work on real endpoints
- [x] **Gate:** full apply → approve → post works; unapproved cannot post

## 7. Content, Reels and Video
- [x] Post model and Cloudflare R2 presigned PUT upload flow (R2 only, no Mux)
- [x] R2 upload completion verification endpoint (`POST /media/:id/complete`)
- [x] Limits enforced client and server (Reel 60s/50MB; video 5 min/200MB)
- [x] Following, Discover and per-scholar feeds with cursor pagination
- [x] Reels pager with preloading, mute and captions toggle
- [x] Upload progress, retry and failure handling
- [ ] Thumbnails generated
- [ ] Probation/pending moderation for new scholars (if enabled)
- [x] App `content` module switched to HTTP; playback served via Cloudflare R2 CDN; Create flow uses R2 direct upload
- [ ] **Gate:** Reel starts in under 3s on mid-range Android

## 8. Social Interactions
- [x] Like, comment, follow, save, share
- [x] Scholar comment controls (hide, pin, restrict)
- [x] Block and mute enforced server-side everywhere
- [x] Atomic counters; no drift under rapid taps
- [x] Per-action rate limits
- [x] App `social` module switched to HTTP; optimistic updates roll back on server rejection
- [x] **Gate:** blocked users fully invisible to each other

## 9. Chat
- [x] Socket.io with JWT handshake auth
- [x] In-memory socket adapter and Mongo `jobs` collection worker (no Redis in v1 zero-budget)
- [x] Conversation, Message, ChatRequest models
- [x] Request/accept flow for member → scholar
- [x] Membership and block checks on every send
- [x] Delivery/read receipts, typing indicator
- [ ] Image attachments (type/size limits, scanned)
- [x] Report message action
- [x] Missed-message sync after reconnect
- [x] App `chat` and realtime client switched to Socket.io; reconnect verified against Phase 2 chat screens
- [x] **Gate:** outsiders cannot join rooms; message order preserved

## 10. 1-on-1 Consultations and Video Calls
*(Live halaqah broadcast streaming is cut from v1; 1-on-1 consultation calls via LiveKit are retained)*
- [x] LiveKit tokens short-lived with role-based grants for 1:1 calls
- [x] Call room unauthorized access blocked
- [ ] Live halaqah broadcasting and schedule [CUT from v1 - deferred to v2]
- [ ] Live broadcast chat room [CUT from v1 - deferred to v2]
- [ ] Broadcast host controls [CUT from v1 - deferred to v2]
- [ ] Moderators end broadcast stream [CUT from v1 - deferred to v2]
- [x] 1:1 call ring, accept, decline, timeout, busy state
- [ ] Recording-consent notice
- [x] Camera/mic permission handling and denial UX
- [ ] Tested: poor network, Wi-Fi ↔ mobile switch, background/foreground, call interruptions
- [ ] Tested on real iOS and Android devices (dev build)
- [x] Placeholder `MediaSession` replaced with LiveKit; Phase 2 screens need only minor layout changes
- [x] **Gate:** unauthorized users cannot join call room; 1-on-1 consultation signaling reliable

## 11. Moderation and Admin
- [x] Report flows for post, comment, user, message, live
- [x] Moderator queue with filters and priority (P0/P1/P2)
- [x] Actions: remove, warn, suspend, revoke scholar, ban
- [x] Every action requires reason and is audit-logged
- [x] Second approval for permanent ban and revocation
- [ ] Appeals reviewed by a different moderator
- [x] Admin: role assignment, config, audit log viewer
- [ ] Basic analytics (reports, backlog, active scholars)
- [x] App `moderation` module switched to HTTP; report, queue, review, audit and role screens verified
- [ ] **Gate:** SLAs from `08-Content-Policy.md` measurable

## 12. Notifications
- [x] Push token registration per device
- [ ] Worker queue (BullMQ) for sending
- [ ] Events: follower, comment, live start, chat request, application result
- [x] User preferences and quiet hours
- [x] Deep links verified
- [ ] Token cleanup on logout/invalid
- [x] App `notifications` module switched to HTTP; preferences screen and deep links verified
- [ ] **Gate:** opted-out users receive nothing; links open correct screens

## 13. Security Hardening
- [x] `npm audit` clean of high/critical
- [x] Secrets only in env/secret managers; none in repo or app bundle
- [ ] HTTPS everywhere; HSTS on API
- [x] Input validation (Zod) on every endpoint
- [x] NoSQL injection protections (sanitise operators)
- [x] Rate limits on auth, OTP, upload, chat, report endpoints
- [ ] File upload checks (MIME sniffing, size, scan)
- [ ] IDOR tests (access another user's data by ID)
- [ ] Privilege-escalation tests (role tampering in token/body)
- [x] Socket authorization tests
- [x] Logs contain no tokens, OTPs or passwords
- [ ] Pen test or structured review completed
- [ ] Backups enabled and **restore tested**
- [ ] **Gate:** no open high-severity findings

## 14. Privacy and Compliance
- [x] Privacy policy and terms linked in app and store listings
- [x] In-app account deletion (and data deletion job)
- [x] Data export for users
- [ ] Consent for recording/live shown
- [ ] Data retention schedule documented
- [x] Children's data stance defined (minimum age enforced via 13+ DOB schema validation)
- [ ] Store privacy labels / data safety form accurate
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
- [ ] **All Gates in sections 18 to 27 are checked** (monitoring, verification, website, legal documents, notifications, database, media storage, post mapping, free-tier limits, loaders and state screens)
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

## 18. Activity Monitoring System
*Runs alongside phases 4, 11 and 13. Pairs with the audit log in `05-Security-RBAC.md`.*

### 18.1 Four monitoring layers
- [x] **Audit log** collection is append-only (no update or delete path in code or DB permissions)
- [x] Audit log records: role changes, approvals, rejections, bans, content removals, credential-document access
- [ ] **Security events** recorded: logins, failed OTPs, new device, refresh-token reuse, 2FA changes
- [ ] **Abuse signals** tracked: report counts, block rate, spam velocity, repeat violations
- [ ] **App health** wired: Sentry (crashes, errors) and Pino structured logs (latency, API errors)

### 18.2 Automated rules
- [ ] 5 failed logins in 10 minutes: temporary lock and alert
- [ ] New device on a scholar account: re-prompt 2FA
- [ ] 3 reports on one post within 1 hour: auto-hide and send to review queue
- [ ] Chat-request and message rate limits per user
- [ ] Rule thresholds stored in config, not hard-coded

### 18.3 Privacy boundaries
- [ ] Passwords, tokens, OTPs and credential-document contents never logged (log-scrubbing test)
- [ ] Private chat content not readable by staff unless reported (access control + audit entry when opened)
- [ ] Retention windows set: security logs 90 to 180 days; audit logs multi-year
- [ ] Monitoring practices disclosed in the Privacy Policy

### 18.4 Admin dashboard and alerts
- [ ] Live queues: applications and reports
- [ ] Views: suspicious logins, top offenders, moderator activity
- [ ] Alerts to Slack or email on spikes (failed logins, reports, errors)
- [ ] Audit log viewer with filters (actor, action, target, date)
- [ ] **Gate:** a forced token-reuse and a mass-report test both raise alerts and appear in the audit log

---

## 19. Scholar Application and Verification (Extended)
*Extends phase 6. Policy details go in `08-Content-Policy.md` or a new Verification Policy.*

### 19.1 Application flow (member side)
- [ ] "Apply as Scholar" entry on member profile
- [ ] Eligibility rules and required-documents screen
- [ ] Form: legal name, public display name, tradition/school, specialisation, languages
- [ ] Form: institution/teachers, short bio, public links
- [ ] Document upload (ijazah/degree, institution letter, optional government ID)
- [ ] Optional: up to 2 references from existing verified scholars
- [ ] Scholar Code of Ethics shown and explicitly accepted
- [ ] Submission creates status `submitted`
- [ ] Status tracker: `submitted → under review → needs more info → approved / rejected → appealed`
- [ ] Applicant can respond to "needs more info" and re-submit
- [ ] Rejection shows written reason; one appeal allowed

### 19.2 Verification levels
- [ ] Level 1: Identity verified
- [ ] Level 2: Credentials verified
- [ ] Level 3: Endorsed (scholars or institution)
- [ ] Badge reflects the level; shown on profile, posts, chat and live

### 19.3 Review process
- [ ] Reviewer checklist: document authenticity, name/date/seal consistency
- [ ] Contact issuing institution or teacher where possible
- [ ] Check public evidence of teaching or publications
- [ ] Impersonation check against known scholars
- [ ] Duplicate-application check
- [ ] Optional short video interview supported
- [ ] First review by moderator; approvals need a second reviewer or scholar panel
- [ ] Appeals go to a different reviewer
- [ ] Target review time 48 h; overdue applications flagged

### 19.4 After approval, re-verification and revocation
- [ ] On approval: `scholar` role granted, 2FA setup forced, badge shown, posting unlocked
- [ ] Yearly re-verification cycle scheduled
- [ ] Complaint-triggered re-verification supported
- [ ] Instant revocation: active sessions lose scholar permissions within 60 s; live streams end
- [ ] Every decision audit-logged and applicant notified

### 19.5 Credential document protection
- [ ] Private, encrypted bucket; no public URLs
- [ ] Short-lived signed URLs only
- [ ] Every document access logged
- [ ] Retention: files deleted or redacted after a set period (for example 90 days after decision); decision record kept
- [ ] **Gate:** apply → review → approve → post works end to end; unapproved and revoked users cannot post; documents unreachable without a signed URL

---

## 20. Website
*Needed before store submission (privacy URL, support URL, account-deletion page).*

### 20.1 Public site
- [ ] Domain purchased, HTTPS enforced (Target: sanad.app and app.sanad.app)
- [x] Home page with store download links and portal launch CTA
- [x] "How verification works" page (`/how-verification-works`)
- [x] Scholar application info and FAQ (`/#faq`)
- [x] Legal pages published: Terms (`/terms`), Privacy (`/privacy`), Code of Conduct (`/conduct`)
- [x] Contact and support instructions published
- [x] Report-abuse in-app modal and procedures documented
- [x] Account deletion page (`/delete-account`, required for Google Play & Apple Store)
- [x] Stack chosen (Next.js App Router, TypeScript, npm workspaces only)
- [ ] Production web hosting cutover (scheduled for final phase after mobile stabilization)

### 20.2 Deep links
- [ ] `apple-app-site-association` file hosted
- [ ] `assetlinks.json` hosted
- [ ] Shared post/profile links open in the app, with web fallback
- [ ] Universal/app links tested on a real iOS and Android device

### 20.3 Admin and moderation web panel
- [x] Web governance portal integrated at `/admin`
- [x] Application review screen (`/admin/review-queue`)
- [x] Report queue (`/admin/reports`)
- [x] User and role management with account disabling for all roles (`/admin/users`)
- [x] Scholar activity monitoring & surveillance telemetry with filters (`/admin/activity`)
- [x] Audit log viewer (`/admin/audit-logs`)
- [x] RBAC enforced server-side with instant session revocation
- [ ] Mandatory 2FA for staff
- [ ] Optional IP allowlist
- [x] **Gate:** all store-required URLs resolve; admin panel inaccessible without staff role

---

## 21. Terms, Privacy and Official Documents
*Drafts are templates. Have a lawyer review before launch. Needs: final list of countries users will be in.*

### 21.1 Core documents
- [ ] **Terms of Service / EULA** (eligibility and age, account rules, content licence, prohibited conduct, moderation rights, termination, liability, governing law)
- [ ] **Privacy Policy** (data collected, purposes, third parties: Mux, LiveKit, Sentry, cloud host, SMS/email; retention; user rights; children; grievance contact)
- [ ] **Community Code of Conduct** (respect, no hate or sectarian abuse, no harassment, no impersonation)
- [ ] **Scholar Code of Ethics / Agreement** (honest credentials, sourcing, no incitement, content responsibility, consequences)
- [ ] **Content and Moderation Policy** finalised (`08-Content-Policy.md`)

### 21.2 Supporting documents
- [ ] Verification Policy (levels, evidence, appeals, revocation)
- [ ] Moderation and Appeals Policy (strikes, bans)
- [ ] Data Retention and Deletion Policy
- [ ] Copyright and Takedown Policy
- [ ] Child Safety Policy
- [ ] Live Streaming Guidelines
- [ ] Cookie Policy (website)
- [ ] Security disclosure page
- [ ] Disclaimer: scholar content is educational, not a personal ruling or professional advice

### 21.3 Legal and compliance review
- [ ] India DPDP Act 2023: consent notice, user rights, grievance contact, data minimisation (religious belief treated as sensitive)
- [ ] IT Rules 2021: grievance officer named, takedown handling process
- [ ] Children's data and parental-consent rules checked
- [ ] Other countries' rules checked per user base (for example GDPR)
- [ ] Lawyer review completed and signed off

### 21.4 In-app and store integration
- [ ] Terms and Privacy accepted at sign-up (versioned, timestamp stored)
- [ ] Re-acceptance flow when documents change
- [ ] Links to all policies in Settings and on the website
- [ ] Apple privacy labels and Google Data Safety form completed
- [ ] Privacy policy URL and support URL added to both store listings
- [ ] **Gate:** every document published, versioned, linked in app and site, and legally reviewed

---

## 22. Notification System (Extended)
*Extends phase 12.*

### 22.1 Channels
- [ ] Push via `expo-notifications` (APNs and FCM)
- [x] In-app notification inbox (Activity stream in mobile app and web alerts)
- [ ] Email (security, legal, application updates)
- [ ] SMS for OTP only

### 22.2 Categories and user control
- [x] Security: security notices, unauthorized action flags
- [ ] Verification: under review, approved, rejected, needs info (cannot be disabled)
- [ ] Moderation: report outcome, warning, strike (cannot be disabled)
- [x] Social: like, comment, follow (live dispatch to recipient in real-time)
- [ ] Content: new post from followed scholar (user can disable)
- [ ] Live: followed scholar went live (user can disable)
- [ ] Chat: request and new message (user can disable)
- [ ] Calls: incoming call (user can disable)
- [ ] System: policy updates and announcements (partly disableable)
- [x] Per-category preferences screen and quiet hours

### 22.3 Pipeline
- [x] API event triggers the notification service (follows, likes, comments, security warnings)
- [x] Real-time Socket.IO dispatch to personal user channel (`user:userId`)
- [ ] Preferences and quiet hours checked
- [ ] Localised templates (English first; RTL-ready languages)
- [ ] Jobs queued with Mongo `jobs` collection worker (no BullMQ or Redis dependency in zero-budget architecture)
- [ ] Workers send to Expo Push, email provider, SMS provider
- [ ] Delivery log saved; retries with backoff on failure
- [ ] Deep-link payload opens the correct screen
- [ ] Low-priority items batched ("12 people liked your Reel")

### 22.4 Devices and permissions
- [ ] Device tokens stored per device
- [ ] Token removed on logout and on invalid-token response
- [ ] Permission prompt shown after first valuable moment, not at launch
- [ ] Incoming-call push is high priority with native call UI (extra native work scoped)
- [ ] **Gate:** opted-out categories send nothing; mandatory categories always send; links open correct screens on iOS and Android

---

## 23. Database (MongoDB Atlas M0, Free)
*Details: `13-Data-Storage-ZeroBudget.md`, sections 4 and 11.*

### 23.1 Setup
- [ ] Atlas account created, one **M0** cluster (note: one M0 per project)
- [ ] Region chosen close to the API host
- [ ] Separate DB users: app (read/write), backup (read-only), admin (you only)
- [ ] Network access reviewed (no open `0.0.0.0/0` unless required for backups, then documented)
- [x] Connection string in env vars only, documented with step-by-step Atlas setup in .env.example
- [x] Mongoose connection resilient with automatic offline fallback in development and health-check monitoring
- [x] Database seed script implemented with admin, scholars, curriculum, and Bloom filter sync (`npm run db:seed`)
- [x] Dynamic in-app data source switcher (Mock vs Live HTTP) with real-time ping and database health detection
- [x] Mongoose connection pooling set low (M0 allows 500 connections, but throughput is about 100 ops/s)

### 23.2 Schema and indexes
- [x] Collections defined: `users`, `sessions`, `scholarApplications`, `posts`, `media`, `likes`, `saves`, `follows`, `comments`, `shares`, `reports`, `conversations`, `messages`, `chatRequests`, `notifications`, `jobs`, `securityEvents`, `auditLogs`, `storageUsage`
- [x] Unique indexes: likes `{userId, postId}`, saves `{userId, postId}`, follows `{followerId, followeeId}`
- [x] Query indexes: posts `{authorId, createdAt}` and `{status, createdAt}`; saves `{userId, createdAt}`; comments `{postId, createdAt}`; notifications `{userId, createdAt}`; jobs `{status, runAt}`
- [x] Zod validation on every write; Mongoose strict mode on
- [ ] Explain-plan check: no collection scans on feed, saves or comments queries

### 23.3 Size and throughput control (512 MB, about 100 ops/s)
- [ ] TTL indexes: sessions, notifications (30 d), securityEvents (90 d), done jobs (7 d), shares (90 d)
- [ ] Counters stored on the post (`likeCount`, `commentCount`, `saveCount`, `shareCount`), updated with `$inc`
- [ ] Chat is text-only in the zero-budget phase, with a retention policy
- [ ] Rejected-application files deleted after retention, decision record kept
- [ ] Cursor pagination and projections everywhere; no unbounded queries
- [ ] In-memory cache (30 to 60 s) for hot feed and public profile reads
- [ ] Size target set: stay under 400 MB (80%); alert at 70%

### 23.4 Backup and recovery
- [ ] Scheduled `mongodump --gzip` (GitHub Action or local machine) to the private bucket
- [ ] Retention: last 7 daily and 4 weekly dumps
- [ ] Backup user is read-only; credentials stored as secrets
- [ ] **Restore tested at least once, then monthly** (restore into a scratch cluster)
- [ ] Automated Atlas backups are not relied upon (not guaranteed on M0)
- [ ] **Gate:** a fresh cluster can be rebuilt from the latest dump and the app works against it

---

## 24. Media Storage: Video and Images (Cloudflare R2, Free)
*Details: `13-Data-Storage-ZeroBudget.md`, sections 5 to 7. No Mux (free plan holds only 10 stored videos).*

### 24.1 Account and buckets
- [ ] Cloudflare account created; confirmed whether R2 activation needs a payment method (if yes and not possible, use the fallback: Backblaze B2 or Tigris)
- [ ] Bucket `sanad-media` (public read) created
- [ ] Bucket `sanad-private` (no public access) created for credentials and backups
- [ ] API tokens scoped per bucket, least privilege, stored as secrets
- [ ] CORS configured for the upload origins
- [ ] Lifecycle rule: abort incomplete multipart uploads
- [ ] Understood: R2 free tier has **no hard cap**; overage is billed (billing alert or usage guard in place)
- [ ] Public delivery plan for beta documented (dev public URL for beta only; custom domain later)

### 24.2 Video pipeline
- [ ] Limits set in config: Reel 60 s, video 5 min, target about 720p at about 2 Mbps (overrides PRD US-07)
- [ ] On-device compression chosen and **verified on SDK 58** (for example `react-native-compressor`, native module, dev build)
- [ ] Output verified as H.264/AAC MP4 on both iOS and Android
- [ ] `faststart` (moov atom at start) verified; fallback remux step (`-c copy -movflags +faststart`) documented
- [ ] Poster frame generated on device and uploaded as `poster.jpg`
- [ ] Presigned PUT upload (multipart for large files); API never proxies video
- [ ] Resumable upload and retry on flaky networks tested
- [ ] `POST /media/{id}/complete` verifies object existence, size and content type
- [ ] Reject uploads over limit, wrong mime, or over the scholar's storage quota
- [ ] Per-scholar storage quota enforced (for example 200 MB)
- [ ] Playback with `expo-video`; next Reel preloaded; first frame under 1.5 s on 4G
- [ ] No HLS or server transcoding in zero-budget phase (documented decision)

### 24.3 Image pipeline
- [ ] Resize and compress on device with `expo-image-manipulator` before upload
- [ ] Variants: thumb (about 320 px), medium (about 1080 px); no original stored
- [ ] Avatars resized to about 512 px
- [ ] Format chosen per platform support (JPEG baseline; WebP only where verified on iOS)
- [ ] **EXIF and GPS metadata stripped** (verified by inspecting an uploaded file)
- [ ] `expo-image` used with disk caching to cut reads
- [ ] Alt text field available on image posts

### 24.4 Credential documents (private)
- [ ] Stored only in `sanad-private`, key `cred/{applicationId}/{docId}`
- [ ] Short-lived signed GET URLs, issued to reviewers only, every access logged
- [ ] Allowed types: PDF, JPG, PNG; size limit; virus-scan or at least content-type sniffing
- [ ] Deleted or redacted after the retention period

### 24.5 Cleanup and integrity
- [ ] Sweeper job deletes `uploading` media older than 1 hour
- [ ] Orphan check: objects with no `media` record, and media records with no object
- [ ] Post delete: soft-delete, then hard-delete files and records after 30 days
- [ ] Legal takedown path deletes files immediately
- [ ] Storage counters (`storageUsage`) updated on every upload and delete (avoid bucket LIST calls)
- [ ] **Gate:** a scholar uploads a Reel and an image post; both play and display on a real phone over 4G; over-quota and over-limit uploads are refused; deleting the post removes the files

---

## 25. Post Mapping, Sharing and Saving (In-App)
*Details: `13-Data-Storage-ZeroBudget.md`, sections 7 to 10.*

### 25.1 Data mapping
- [ ] `posts` and `media` schemas implemented; post holds `mediaIds[]`, media holds `postId`
- [ ] Post types supported: `reel`, `video`, `image` (1 to 10 images)
- [ ] Status flow: `processing → published → hidden / removed`
- [ ] Only `scholar` and `admin` can create; ownership check on edit and delete (server-side)
- [ ] Store object **keys**, build public URLs at read time (so the host can change later)
- [ ] Join collections `likes` and `saves` with unique indexes; counters updated only after a successful insert
- [ ] Comments linked to posts; count kept on post
- [ ] Hidden/removed posts excluded from every feed, profile, search, saved and share query

### 25.2 Feed
- [ ] Following feed (followed scholars, newest first, cursor pagination)
- [ ] For You feed: recency plus engagement score over a capped candidate set
- [ ] First page cached 30 to 60 s per user
- [ ] Blocked and muted users filtered out
- [ ] Empty, loading and error states designed

### 25.3 Saving (bookmarks)
- [ ] Save and unsave endpoints, idempotent
- [ ] `saveCount` updated with `$inc`
- [ ] Saved screen with cursor pagination, newest saved first
- [ ] Removed or hidden posts show an "unavailable" placeholder, user can remove them
- [ ] Saves are private to the user
- [ ] Optimistic UI with rollback on failure
- [ ] Optional later: named collections

### 25.4 Sharing
- [ ] **In-app share:** send a post to an accepted chat as a `post_share` card (holds `postId` only)
- [ ] **External share:** share link `https://<free-subdomain>/p/{postId}`
- [ ] Static share page with Open Graph tags (poster/thumbnail, caption, scholar name) and an "Open in Sanad" button
- [ ] Universal/app links configured (`apple-app-site-association`, `assetlinks.json`) on the share domain
- [ ] Custom-scheme fallback (`sanad://p/{postId}`) works when links fail
- [ ] Only `public` posts shareable externally; hidden/removed posts return a neutral page
- [ ] Share logged and `shareCount` incremented
- [ ] Native share sheet via React Native `Share`
- [ ] No download button for members in MVP (decision recorded)

### 25.5 Likes, comments and reports on mapped posts
- [ ] Like and unlike idempotent; double-tap safe
- [ ] Comment create, delete own; scholar and moderator can remove
- [ ] Report on post, comment and user feeds the moderation queue (section 18)
- [ ] **Gate:** save, unsave, in-app share, external share (opens app and web fallback), like, comment all work; removing a post removes it everywhere, including saved and shared cards

---

## 26. Zero-Budget (Free-Tier) Plan
*Details: `13-Data-Storage-ZeroBudget.md`, sections 2, 3, 12, 13 and 14.*

### 26.1 Stack decisions
- [ ] Database: MongoDB Atlas M0
- [ ] Files: Cloudflare R2 free tier (fallback B2 or Tigris decided in advance)
- [ ] Video hosting: **no Mux** (10-video cap); on-device compression + progressive MP4
- [ ] Queue/Redis: **none**; Mongo `jobs` collection with a worker loop (about 30 s poll)
- [ ] Rate limiting: in-memory, single instance
- [ ] API host: free web service (sleeps when idle); cold-start impact accepted for beta
- [ ] Website and share pages: free static hosting on a free subdomain
- [ ] Errors: Sentry free plan
- [ ] Every vendor's current free limits re-verified on its own pricing page; date recorded in the doc

### 26.2 Costs that are not free (decide early)
- [ ] Google Play developer fee (one-time) budgeted for store launch
- [ ] Apple Developer Program fee (yearly) budgeted for iOS distribution
- [ ] Custom domain budgeted (until then, free subdomains)
- [ ] EAS free-plan build limits checked
- [ ] Beta path defined: Android APK via EAS internal distribution; iOS waits for the Apple account

### 26.3 Live and calls under free limits
- [x] Live halaqah broadcasting cut from v1; 1-on-1 consultation calls stay
- [ ] LiveKit Build plan: 5,000 WebRTC participant-minutes/month, 100 concurrent participants (re-verify)
- [ ] Pilot rules: 1:1 calls only between accepted contacts (scholar ↔ scholar, scholar ↔ member)
- [ ] Usage tracked from LiveKit webhooks into `storageUsage`
- [ ] At 80%, new calls are disabled with a friendly in-app message
- [ ] Behaviour when the cap is hit tested (Build may have no overage)
- [ ] Calls scheduled after the core feed (v1.1 and v1.2)

### 26.4 Quota Guardian (admin screen)
- [ ] Mongo size, R2 storage, R2 operations, LiveKit minutes, API hours/bandwidth shown
- [ ] Warn at 70%, block at 90% where possible (new uploads, calls)
- [ ] Alerts to Slack or email
- [ ] Upgrade triggers written down: Mongo above 400 MB, R2 above 8 GB, LiveKit minutes gone in under 2 weeks, cold starts hurting retention

### 26.5 Free-host realities
- [ ] Cold start (about 1 minute) handled in the app: splash/skeleton, retry with backoff, friendly "waking up" message
- [ ] Chat in beta is pull-on-open plus push notifications (free host sleeps, so long-lived sockets are unreliable)
- [ ] Jobs and sweepers tolerate being killed and restarted (idempotent)
- [ ] No secrets in the repo; env vars set on the host
- [ ] Beta limited to a small invite-only group to stay within quotas

### 26.6 Doc and plan alignment
- [x] PRD media limits updated (Reel 60s/50MB, video 5 min/200MB) aligned across PRD, TRD, SDD, and Checklist
- [x] TRD and SDD note the R2 only (no Mux) and Mongo `jobs` collection worker (no BullMQ/Redis) replacements
- [x] Section 22.3 (notifications) implemented with the Mongo `jobs` worker instead of BullMQ
- [ ] Migration plan to paid tiers written (Atlas Flex, R2 paid, LiveKit Ship, paid API host)
- [ ] **Gate:** a full month of beta stays inside every free limit, with the Quota Guardian showing under 70% on all meters

---

## 27. Pre-loaders, Skeletons and State Screens
*Code in `ui-kit/`; spec in `14-Loaders-States-UI.md`. Runs alongside phases 3 and 8.*

### 27.1 Brand assets and splash
- [x] `app/+not-found.tsx` added
- [x] Packages installed with `npx expo install` (svg, vector-icons, safe-area, status-bar)
- [x] `app.json` configured (icon, adaptive icon, splash screen with emerald/ivory background)
- [ ] **New EAS development build** made after the splash/icon change
- [ ] Splash tested on a release build, not only dev (dev builds do not fully match)
- [x] Light and dark splash both checked
- [ ] Android 12+ splash checked (system splash behaviour)

### 27.2 Brand loader and cold start
- [x] `BrandLoader` architecture configured for bootstrap
- [ ] `useColdStartStatus` messages appear at 4 s, 12 s, 45 s
- [x] "Try again" restarts bootstrap
- [ ] Tested with the API host asleep (about 1 minute cold start)
- [x] Bootstrap has a request timeout and never hangs forever
- [x] Fonts and critical assets preloaded during bootstrap

### 27.3 Skeletons (one per screen)
- [x] Feed (`FeedSkeleton`)
- [x] Reels (`ReelSkeleton`, then poster, then video)
- [x] Profile (`ProfileSkeleton`)
- [x] Saved and profile posts (`GridSkeleton`)
- [x] Chat list (`ChatListSkeleton`)
- [x] Notifications (`NotificationSkeleton`)
- [x] Comments (`CommentsSkeleton`)
- [x] Scholar application status and review queue screens (reuse list skeletons)
- [x] `useSkeletonVisible` applied (no flicker on fast loads)
- [x] Skeleton shapes match the real layout (no layout jump when content arrives)

### 27.4 Small loaders and progress
- [x] Loading indicators in buttons (disabled while loading), list footers and buffering
- [x] Pull-to-refresh tinted gold on iOS and Android
- [x] `UploadProgress` wired to upload progress states (uploading, processing, done, error, cancel, retry)
- [x] Image loading uses placeholder colour plus short transition

### 27.5 State screens
- [x] 404 (`+not-found`) tested with a broken deep link and a typed bad URL
- [x] 403 "Scholars only" shown when a member taps a scholar-only action
- [x] Verification pending screen linked to application status
- [x] Suspended screen links to Code of Conduct and support
- [x] Offline banner plus offline full screen when no cache
- [x] Server error and `RouteErrorBoundary` (retry works; no raw errors in production)
- [ ] Maintenance screen driven by an API flag
- [ ] Uploads-paused screen driven by the Quota Guardian (section 26.4)
- [x] Post-unavailable screen for removed posts in Saved and shared cards
- [x] Empty states for feed, saved and notifications

### 27.6 Quality checks
- [x] Reduce Motion on: all loaders render static
- [x] Dark mode checked on every loader and state screen
- [x] Screen reader (TalkBack and VoiceOver): one "Loading" announcement per skeleton, buttons labelled
- [x] Touch targets at least 44 pt (buttons 48 pt)
- [x] Large font size (200%) does not clip text
- [x] RTL layout checked (Arabic or Urdu)
- [ ] Low-end Android device: 60 fps feel while skeletons animate
- [ ] Slow network (throttled 3G) and airplane mode tested
- [x] **Gate:** cold start with a sleeping API shows splash, then BrandLoader with escalating messages, then the app; every list has a skeleton; 404, 403, offline and error screens all reachable and tested on a real device

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
- [x] If the feature touches the API: mock and http adapters both satisfy the shared contract
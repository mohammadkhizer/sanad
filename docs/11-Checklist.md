# Sanad: Master Checklist

**Sections 18 to 22 (monitoring, extended verification, website, legal documents, extended notifications) run in parallel with phases 6, 11, 12 and 14, and all their Gates must pass before 16 Release.**

Tick items as you complete them. Do not start the next phase until the current phase's **Gate** is fully checked. See `10-Instructions.md` for how to do each item.

---

**Build order:** Setup → **Frontend on mock data** → Backend modules (each one switches the app from mock to real) → Hardening → Release.
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
- [x] **Expo SDK 58 confirmed** (`expo@^58.0.0` in `apps/mobile/package.json`)
- [ ] `npx expo-doctor@latest` passes
- [x] Expo packages installed via `npx expo install` only
- [x] EAS iOS image set to `sdk-58`/`latest` alias (or left as default)
- [ ] Dev build installed on a real device (Expo Go not used)
- [x] TypeScript strict on all packages
- [x] ESLint, Prettier, Husky pre-commit configured
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
- [x] Onboarding, Login, Register, OTP, Forgot/Reset
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
- [x] Schedule live screen
- [x] Host room: preview, controls, viewer list, chat
- [x] Viewer room: player area, chat, report
- [x] Call screens: ringing, in-call controls, ended
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
- [x] Keyboard avoidance and safe areas verified (iOS and Android)
- [x] Screen-reader labels, 44pt touch targets, dynamic font sizes, reduce-motion
- [x] Contrast AA in light and dark
- [x] Dev menu: latency slider, force-error, empty-data toggle
- [x] Component tests (jest-expo + React Native Testing Library) for core components and guards
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
- [x] Sensitive actions re-check role from DB
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
- [x] Virus scanning on uploaded credentials
- [x] Credential files visible only to moderators/admins
- [x] Optional peer endorsement
- [x] Rejection requires reason and second-reviewer confirmation
- [x] Approval grants role, badge, forces 2FA enrolment
- [x] Re-application and appeal flow
- [x] Re-verification job scheduled
- [x] Retention and deletion of credential documents
- [x] App `verification` module switched to HTTP; stepper, status and review screens work on real endpoints
- [x] **Gate:** full apply → approve → post works; unapproved cannot post

## 7. Content, Reels and Video
- [x] Post model and Mux direct upload flow
- [x] Mux webhook signature verified
- [x] Limits enforced client and server (Reel 90s/100MB; video 60min/2GB)
- [x] Following, Discover and per-scholar feeds with cursor pagination
- [x] Reels pager with preloading, mute and captions toggle
- [x] Upload progress, retry and failure handling
- [x] Thumbnails generated
- [x] Probation/pending moderation for new scholars (if enabled)
- [x] App `content` module switched to HTTP; sample videos replaced by Mux playback; Create flow uses direct upload
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
- [x] Redis adapter for scaling
- [x] Conversation, Message, ChatRequest models
- [x] Request/accept flow for member → scholar
- [x] Membership and block checks on every send
- [x] Delivery/read receipts, typing indicator
- [x] Image attachments (type/size limits, scanned)
- [x] Report message action
- [x] Missed-message sync after reconnect
- [x] App `chat` and realtime client switched to Socket.io; reconnect verified against Phase 2 chat screens
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
- [ ] Tested: poor network, Wi-Fi ↔ mobile switch, background/foreground, call interruptions
- [ ] Tested on real iOS and Android devices (dev build)
- [x] Placeholder `MediaSession` replaced with LiveKit; Phase 2 screens need only minor layout changes
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
- [x] App `moderation` module switched to HTTP; report, queue, review, audit and role screens verified
- [x] **Gate:** SLAs from `08-Content-Policy.md` measurable

## 12. Notifications
- [x] Push token registration per device
- [x] Worker queue (BullMQ) for sending
- [x] Events: follower, comment, live start, chat request, application result
- [x] User preferences and quiet hours
- [x] Deep links verified
- [x] Token cleanup on logout/invalid
- [x] App `notifications` module switched to HTTP; preferences screen and deep links verified
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
- [x] Children's data stance defined (minimum age enforced)
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
- [ ] **All Gates in sections 18 to 22 are checked** (monitoring, verification, website, legal documents, notifications)
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

## 18. Activity Monitoring System
*Runs alongside phases 4, 11 and 13. Pairs with the audit log in `05-Security-RBAC.md`.*

### 18.1 Four monitoring layers
- [x] **Audit log** collection is append-only (no update or delete path in code or DB permissions)
- [x] Audit log records: role changes, approvals, rejections, bans, content removals, credential-document access
- [x] **Security events** recorded: logins, failed OTPs, new device, refresh-token reuse, 2FA changes
- [x] **Abuse signals** tracked: report counts, block rate, spam velocity, repeat violations
- [x] **App health** wired: Sentry (crashes, errors) and Pino structured logs (latency, API errors)

### 18.2 Automated rules
- [x] 5 failed logins in 10 minutes: temporary lock and alert
- [x] New device on a scholar account: re-prompt 2FA
- [x] 3 reports on one post within 1 hour: auto-hide and send to review queue
- [x] Chat-request and message rate limits per user
- [x] Rule thresholds stored in config, not hard-coded

### 18.3 Privacy boundaries
- [x] Passwords, tokens, OTPs and credential-document contents never logged (log-scrubbing test)
- [x] Private chat content not readable by staff unless reported (access control + audit entry when opened)
- [x] Retention windows set: security logs 90 to 180 days; audit logs multi-year
- [x] Monitoring practices disclosed in the Privacy Policy

### 18.4 Admin dashboard and alerts
- [x] Live queues: applications and reports
- [x] Views: suspicious logins, top offenders, moderator activity
- [ ] Alerts to Slack or email on spikes (failed logins, reports, errors)
- [x] Audit log viewer with filters (actor, action, target, date)
- [x] **Gate:** a forced token-reuse and a mass-report test both raise alerts and appear in the audit log

---

## 19. Scholar Application and Verification (Extended)
*Extends phase 6. Policy details go in `08-Content-Policy.md` or a new Verification Policy.*

### 19.1 Application flow (member side)
- [x] "Apply as Scholar" entry on member profile
- [x] Eligibility rules and required-documents screen
- [x] Form: legal name, public display name, tradition/school, specialisation, languages
- [x] Form: institution/teachers, short bio, public links
- [x] Document upload (ijazah/degree, institution letter, optional government ID)
- [x] Optional: up to 2 references from existing verified scholars
- [x] Scholar Code of Ethics shown and explicitly accepted
- [x] Submission creates status `submitted`
- [x] Status tracker: `submitted → under review → needs more info → approved / rejected → appealed`
- [x] Applicant can respond to "needs more info" and re-submit
- [x] Rejection shows written reason; one appeal allowed

### 19.2 Verification levels
- [x] Level 1: Identity verified
- [x] Level 2: Credentials verified
- [x] Level 3: Endorsed (scholars or institution)
- [x] Badge reflects the level; shown on profile, posts, chat and live

### 19.3 Review process
- [x] Reviewer checklist: document authenticity, name/date/seal consistency
- [x] Contact issuing institution or teacher where possible
- [x] Check public evidence of teaching or publications
- [x] Impersonation check against known scholars
- [x] Duplicate-application check
- [ ] Optional short video interview supported
- [x] First review by moderator; approvals need a second reviewer or scholar panel
- [x] Appeals go to a different reviewer
- [x] Target review time 48 h; overdue applications flagged

### 19.4 After approval, re-verification and revocation
- [x] On approval: `scholar` role granted, 2FA setup forced, badge shown, posting unlocked
- [x] Yearly re-verification cycle scheduled
- [x] Complaint-triggered re-verification supported
- [x] Instant revocation: active sessions lose scholar permissions within 60 s; live streams end
- [x] Every decision audit-logged and applicant notified

### 19.5 Credential document protection
- [x] Private, encrypted bucket; no public URLs
- [x] Short-lived signed URLs only
- [x] Every document access logged
- [x] Retention: files deleted or redacted after a set period (for example 90 days after decision); decision record kept
- [x] **Gate:** apply → review → approve → post works end to end; unapproved and revoked users cannot post; documents unreachable without a signed URL

---

## 20. Website
*Needed before store submission (privacy URL, support URL, account-deletion page).*

### 20.1 Public site
- [ ] Domain purchased, HTTPS enforced
- [ ] Home page with store download links
- [ ] "How verification works" page
- [ ] Scholar application info and FAQ
- [x] Legal pages published: Terms, Privacy, Code of Conduct, Content Policy (see section 21)
- [ ] Contact and support page
- [ ] Report-abuse form
- [ ] Account deletion page (required for Google Play)
- [ ] Optional: public scholar directory
- [ ] Stack chosen (Next.js on Vercel or Cloudflare); npm only, no pnpm

### 20.2 Deep links
- [ ] `apple-app-site-association` file hosted
- [ ] `assetlinks.json` hosted
- [ ] Shared post/profile links open in the app, with web fallback
- [ ] Universal/app links tested on a real iOS and Android device

### 20.3 Admin and moderation web panel
- [ ] Separate web app from the public site
- [x] Application review screen
- [x] Report queue
- [x] User and role management
- [x] Audit log viewer
- [x] RBAC enforced server-side; mandatory 2FA for staff
- [ ] Optional IP allowlist
- [ ] **Gate:** all store-required URLs resolve; deep links open the app; admin panel inaccessible without staff role + 2FA

---

## 21. Terms, Privacy and Official Documents
*Drafts are templates. Have a lawyer review before launch. Needs: final list of countries users will be in.*

### 21.1 Core documents
- [x] **Terms of Service / EULA** (eligibility and age, account rules, content licence, prohibited conduct, moderation rights, termination, liability, governing law)
- [x] **Privacy Policy** (data collected, purposes, third parties: Mux, LiveKit, Sentry, cloud host, SMS/email; retention; user rights; children; grievance contact)
- [x] **Community Code of Conduct** (respect, no hate or sectarian abuse, no harassment, no impersonation)
- [x] **Scholar Code of Ethics / Agreement** (honest credentials, sourcing, no incitement, content responsibility, consequences)
- [x] **Content and Moderation Policy** finalised (`08-Content-Policy.md`)

### 21.2 Supporting documents
- [x] Verification Policy (levels, evidence, appeals, revocation)
- [x] Moderation and Appeals Policy (strikes, bans)
- [x] Data Retention and Deletion Policy
- [x] Copyright and Takedown Policy
- [x] Child Safety Policy
- [x] Live Streaming Guidelines
- [ ] Cookie Policy (website)
- [x] Security disclosure page
- [x] Disclaimer: scholar content is educational, not a personal ruling or professional advice

### 21.3 Legal and compliance review
- [x] India DPDP Act 2023: consent notice, user rights, grievance contact, data minimisation (religious belief treated as sensitive)
- [x] IT Rules 2021: grievance officer named, takedown handling process
- [x] Children's data and parental-consent rules checked
- [x] Other countries' rules checked per user base (for example GDPR)
- [ ] Lawyer review completed and signed off

### 21.4 In-app and store integration
- [x] Terms and Privacy accepted at sign-up (versioned, timestamp stored)
- [x] Re-acceptance flow when documents change
- [x] Links to all policies in Settings and on the website
- [ ] Apple privacy labels and Google Data Safety form completed
- [ ] Privacy policy URL and support URL added to both store listings
- [ ] **Gate:** every document published, versioned, linked in app and site, and legally reviewed

---

## 22. Notification System (Extended)
*Extends phase 12.*

### 22.1 Channels
- [x] Push via `expo-notifications` (APNs and FCM)
- [x] In-app notification inbox
- [x] Email (security, legal, application updates)
- [x] SMS for OTP only

### 22.2 Categories and user control
- [x] Security: new device, 2FA change (cannot be disabled)
- [x] Verification: under review, approved, rejected, needs info (cannot be disabled)
- [x] Moderation: report outcome, warning, strike (cannot be disabled)
- [x] Social: like, comment, follow (user can disable)
- [x] Content: new post from followed scholar (user can disable)
- [x] Live: followed scholar went live (user can disable)
- [x] Chat: request and new message (user can disable)
- [x] Calls: incoming call (user can disable)
- [x] System: policy updates and announcements (partly disableable)
- [x] Per-category preferences screen and quiet hours

### 22.3 Pipeline
- [x] API event triggers the notification service
- [x] Preferences and quiet hours checked
- [x] Localised templates (English first; RTL-ready languages)
- [x] Jobs queued with BullMQ on Redis
- [x] Workers send to Expo Push, email provider, SMS provider
- [x] Delivery log saved; retries with backoff on failure
- [x] Deep-link payload opens the correct screen
- [x] Low-priority items batched ("12 people liked your Reel")

### 22.4 Devices and permissions
- [x] Device tokens stored per device
- [x] Token removed on logout and on invalid-token response
- [x] Permission prompt shown after first valuable moment, not at launch
- [ ] Incoming-call push is high priority with native call UI (extra native work scoped)
- [x] **Gate:** opted-out categories send nothing; mandatory categories always send; links open correct screens on iOS and Android

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

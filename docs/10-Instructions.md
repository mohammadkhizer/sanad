# Sanad: Build Instructions

Step-by-step guide to building Sanad from zero to store release. Follow phases in order. Each phase lists the goal, steps, a ready-to-use Claude prompt, and acceptance criteria. Pair with `11-Checklist.md` to track progress.

---

## 0. Ground Rules (read first)
1. **npm only.** Never use pnpm (or yarn). Commit `package-lock.json`. Use `npm ci` in CI.
2. **Server decides.** Every permission is enforced on the backend. The app only hides UI.
3. **Expo dev builds, not Expo Go.** Live streaming and video calls need native modules.
4. **Shared schemas.** Define Zod schemas once in `packages/shared`, reuse in API and app.
5. **One phase, one branch, one PR.** Merge only when acceptance criteria pass.
6. **Never commit secrets.** Use `.env` locally, EAS secrets and hosting secrets in cloud.
7. **Docs are the source of truth.** If code and docs disagree, update the docs in the same PR.

### Branch and Commit Convention
- Branches: `feat/<phase>-<topic>`, `fix/<topic>`
- Commits: `feat(auth): add refresh token rotation` (conventional commits)
- PR must include: what changed, how tested, screenshots for UI

---

## Phase 1: Project Setup
**Goal:** working monorepo, lint, types, CI skeleton.

**Steps**
1. Create repo and folders: `apps/mobile`, `apps/api`, `packages/shared`.
2. Root `package.json` with `"workspaces": ["apps/*", "packages/*"]`.
3. Add the npm guard (`"preinstall": "npx only-allow npm"`) and `engines` to every `package.json`.
4. Add `.npmrc` (`engine-strict=true`) and `.gitignore` (include `pnpm-lock.yaml`, `.env*`, `node_modules`).
5. Configure TypeScript strict, ESLint, Prettier, Husky pre-commit (lint + typecheck).
6. Scaffold Expo app with Expo Router; scaffold Express app with a `/health` route.
7. GitHub Actions: `npm ci` → lint → typecheck → test.

**Claude prompt**
> Context: Sanad, npm workspaces monorepo (apps/mobile Expo, apps/api Express TS, packages/shared). Task: generate root package.json, tsconfig base, ESLint/Prettier config, and a GitHub Actions workflow using npm ci. No pnpm. Output: files only.

**Acceptance:** `npm ci && npm run lint && npm run typecheck` passes from a clean clone.

---

## Phase 2: Backend Foundation
**Goal:** structured API with DB, config, logging, error handling.

**Steps**
1. Folder layout: `src/modules/<feature>/{routes,controller,service,model,schema}.ts`.
2. Config loader validating env with Zod; app fails fast on missing vars.
3. Mongoose connection with retry; Redis connection.
4. Middleware: helmet, cors (allow-list), JSON body limit, request ID, Pino logger.
5. Central error handler returning `{ error: { code, message } }`.
6. Global rate limiter plus stricter limiter for auth routes.

**Claude prompt**
> Express + TS + Mongoose. Write src/config/env.ts (Zod-validated), src/app.ts with helmet, cors allow-list, pino-http, rate limit, and a central error handler. Code only, under 150 lines.

**Acceptance:** `/health` returns 200; invalid env stops boot; errors are uniform JSON.

---

## Phase 3: Authentication
**Goal:** secure sign-up, login, sessions, 2FA.

**Steps**
1. `User` model: email/phone, passwordHash (argon2), roles[], status, twoFactor fields.
2. Endpoints: register, verify OTP, login, refresh, logout, logout-all, forgot/reset password.
3. Access token: 15 min JWT (`sub`, `roles`, `sessionId`). Refresh token: opaque, hashed in DB, rotated on every use, reuse detection revokes the whole session family.
4. `Session` model: device info, IP, lastUsed, revokedAt.
5. TOTP 2FA setup (QR secret, verify, backup codes). Enforce for scholar role.
6. OTP delivery via SMS/email provider; rate-limit and expire OTPs (5 min, max 5 attempts).
7. Mobile: store tokens in `expo-secure-store`; Axios/fetch interceptor refreshes on 401 once.

**Claude prompt**
> Implement refresh-token rotation with reuse detection in Express + Mongoose. Models: User, Session. Endpoints: POST /auth/refresh, POST /auth/logout, POST /auth/logout-all. Code only, include Zod validation.

**Acceptance:** reused refresh token invalidates the session; expired access token auto-refreshes in app; scholar cannot act without 2FA.

---

## Phase 4: RBAC and Authorization
**Goal:** roles and permissions enforced consistently.

**Steps**
1. Roles: `guest`, `member`, `scholar`, `moderator`, `admin` (see `05-Security-RBAC.md`).
2. Permission constants in `packages/shared` (e.g., `post:create`, `live:start`, `user:suspend`).
3. Role → permissions map; helper `can(user, permission)`.
4. Middleware: `authenticate`, `requireRole(...)`, `requirePermission(...)`, `requireOwnership(model)`.
5. Re-check role from DB (not just JWT) for sensitive actions; revoke takes effect immediately.
6. Audit log middleware for role changes and moderation actions.
7. Write a test for every row of the permission matrix.

**Claude prompt**
> Given this role→permission matrix [paste], generate permission constants, can() helper, and Express middleware requirePermission and requireOwnership. Add vitest tests covering each role. Code only.

**Acceptance:** member calling a scholar-only endpoint gets 403; revoked scholar loses access on next request.

---

## Phase 5: Scholar Verification
**Goal:** trustworthy pipeline for granting the scholar role.

**Steps**
1. `ScholarApplication` model: user, credentials[] (file keys), institution, specialisations, status, reviewer, notes.
2. Upload credentials via pre-signed R2/S3 URLs (private bucket, short expiry, size/type limits).
3. Virus-scan uploads; only moderators/admins can view them.
4. Endpoints: submit, status, moderator queue, approve, reject (reason required), request more info.
5. Optional endorsement by 1-2 verified scholars.
6. Approval grants `scholar` role, sets `verifiedAt`, forces 2FA enrolment, writes audit log.
7. Rejections need second-reviewer confirmation; applicant can reapply or appeal.
8. Periodic re-verification job (e.g., every 12 months).

**Claude prompt**
> Build the scholar application flow: Mongoose model, pre-signed upload endpoint for R2, moderator approve/reject endpoints with audit logging and role grant. Express + TS. Code only.

**Acceptance:** end-to-end apply → review → approve works; unapproved users cannot post.

---

## Phase 6: Mobile App Shell
**Goal:** navigable, themed app with auth screens.

**Steps**
1. Expo Router structure: `(auth)`, `(tabs)` (Home, Discover, Create, Inbox, Profile), `(modals)`.
2. Theme provider with 60:30:10 tokens (light/dark) from `06-Design-System.md`.
3. i18n with RTL support (English, Arabic, Urdu).
4. Auth screens: onboarding, login, register, OTP, 2FA, forgot password.
5. Route guards: redirect guests to auth; hide Create tab unless role is scholar.
6. Shared UI kit: Button, Input, Card, Avatar, VerifiedBadge, EmptyState, Skeleton.

**Claude prompt**
> Expo Router + TS. Create the (auth) and (tabs) layouts with a role-aware guard using a Zustand auth store and expo-secure-store. Theme tokens: ivory #F8F5EE, emerald #0F4C45, gold #C9A227. Code only.

**Acceptance:** guests see only public screens; scholars see Create tab; RTL renders correctly.

---

## Phase 7: Content, Reels and Video
**Goal:** scholars publish; everyone watches smoothly.

**Steps**
1. `Post` model: author, type (reel/video/text), muxAssetId, playbackId, caption, tags, visibility, status.
2. Upload flow: app requests Mux direct-upload URL → uploads → Mux webhook marks ready → post published.
3. Enforce limits (Reel 90s/100MB, video 60min/2GB) client- and server-side.
4. Feed endpoints with cursor pagination: following, discover, per-scholar.
5. Reels player: vertical pager, `expo-video`, preload next item, mute/captions toggle.
6. Moderation hook: new content flagged `pending` if author is under probation.
7. Thumbnails, captions/subtitles (optional auto-captions later).

**Claude prompt**
> Mux direct upload + webhook handler in Express (verify signature), Post model, and POST /posts flow. Then Expo screen to pick, record and upload a Reel with progress. Code only, two answers.

**Acceptance:** Reel uploaded on a mid-range Android plays in under 3 seconds; non-scholar upload attempt returns 403.

---

## Phase 8: Social Interactions
**Goal:** members engage within rules.

**Steps**
1. Models/endpoints: Like, Comment (threaded one level), Follow, Save, Share link.
2. Comment controls: scholars can hide/pin comments, restrict to followers.
3. Counters via atomic increments; denormalised counts on Post.
4. Block and mute at DB level; blocked users hidden everywhere.
5. Rate limits per action to stop spam.

**Acceptance:** blocked user cannot see or interact with the blocker; counts stay consistent after rapid taps.

---

## Phase 9: Chat
**Goal:** safe real-time messaging.

**Steps**
1. Socket.io with JWT handshake auth; Redis adapter for scaling.
2. Models: Conversation, Message, ChatRequest.
3. Rules: scholar ↔ scholar free; member → scholar via request that the scholar accepts.
4. Features: delivery/read state, typing, image attachments, report message.
5. Offline sync: fetch missed messages by cursor on reconnect.
6. Server checks block status and membership on every send.

**Claude prompt**
> Socket.io server with JWT auth middleware, Redis adapter, and handlers for sendMessage/typing/read. Enforce conversation membership and block checks. TypeScript, code only.

**Acceptance:** non-participants cannot join a room; messages arrive in order and survive reconnect.

---

## Phase 10: Live Streaming and Video Calls
**Goal:** reliable live and 1:1 calls via LiveKit.

**Steps**
1. API issues short-lived LiveKit tokens with grants by role (host: publish; viewer: subscribe only).
2. Live: schedule, start, end; viewer count; live chat via Socket.io room.
3. Host controls: mute, remove, block viewer; moderators can end stream.
4. 1:1 calls: callee must accept; ring timeout; busy state.
5. Recording-consent banner before recording.
6. Permissions UX for camera/mic; handle interruptions and network drops.
7. Test on real devices, poor networks, and background/foreground transitions.

**Claude prompt**
> LiveKit token endpoint in Express with role-based grants (host vs viewer), plus Expo screen using @livekit/react-native to publish and view. Dev build instructions included, npm only.

**Acceptance:** viewer cannot publish; moderator can end a stream; call survives Wi-Fi → mobile data switch.

---

## Phase 11: Moderation and Admin
**Goal:** keep the platform trustworthy.

**Steps**
1. `Report` model and in-app report flows (post, comment, user, message, live).
2. Moderator dashboard (web or in-app admin screens): queue, filters, actions.
3. Actions: remove content, warn, suspend, revoke scholar, ban; each logs reason.
4. Appeals flow with different reviewer.
5. Admin: assign roles, view audit log, system config, verification criteria.
6. Basic analytics: reports per day, application backlog, active scholars.

**Acceptance:** report triaged by SLA (see `08-Content-Policy.md`); every action appears in the audit log.

---

## Phase 12: Notifications
**Steps**
1. Register Expo push tokens per device; store in `Device` collection.
2. BullMQ worker sends notifications (new follower, comment, live starting, application result, chat request).
3. User notification preferences; quiet hours.
4. Deep links to the right screen.

**Acceptance:** notification opens the correct screen; opted-out users receive nothing.

---

## Phase 13: Hardening
**Steps**
1. Run `npm audit`; fix high/critical issues.
2. Security review against `05-Security-RBAC.md` checklist; penetration test on auth, uploads, sockets.
3. Load test feed and chat (k6/Artillery).
4. Add Sentry (app + API), uptime monitoring, DB backups with a tested restore.
5. Privacy: data export, in-app account deletion, retention jobs.
6. Accessibility audit (screen reader, contrast, font scaling).

**Acceptance:** no high-severity findings open; restore from backup verified.

---

## Phase 14: Release
**Steps**
1. Configure `app.json`/`app.config.ts`, icons, splash, permissions strings.
2. `eas build --profile production --platform all`.
3. Internal testing (TestFlight, Play Internal), then closed beta with 20-50 scholars.
4. Store listings: screenshots, description, privacy labels, content-rating, UGC moderation and account-deletion info.
5. Staged rollout (e.g., 10% → 50% → 100%); watch crash-free rate and reports.

**Acceptance:** crash-free sessions above 99%; store review approved.

---

## Working Efficiently with Claude (usage-limit friendly)
- **One goal per prompt.** Schema, then service, then route, then screen.
- **Always give context line:** `Sanad: Expo RN + Express/Mongo, roles guest/member/scholar/mod/admin, npm only.`
- **State output format:** "code only", "TypeScript", "under N lines", "no explanations".
- **Paste only relevant snippets**, not whole files.
- **Reference docs by section:** "per 05-Security-RBAC §4".
- **Iterate with diffs:** "change only X; return the modified function."
- **Ask for a plan first on big features:** "list steps only, no code", then request one step at a time.
- **Avoid:** re-pasting the whole conversation, asking for entire apps in one prompt, requesting long explanations for code you only need to run.

### Reusable Template
```
Context: Sanad, Expo RN + Express/Mongo, roles guest/member/scholar/mod/admin, npm only.
Task: <one specific thing>
Constraints: TypeScript strict, Zod validation, server-side RBAC.
Output: code only, <N> lines max, no explanation.
```

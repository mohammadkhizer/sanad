# Sanad: System Design Document (SDD)

## 1. Architecture Overview
```
[Expo App & Web] ──HTTPS──► [API Gateway / Express]
    │                          ├─► MongoDB Atlas (users, content, apps, jobs queue)
    │                          ├─► Cloudflare R2 (media, images, credentials, backups)
    │                          └─► Worker (Mongo jobs queue worker: notifications, sweeper)
    ├──WebSocket────────────► [Socket.io] (chat, presence, notifications)
    └──WebRTC───────────────► [LiveKit] (1-on-1 consultations; live halaqah cut from v1)
```
Style: modular monolith (v1), split services later (media, realtime).

## 2. Modules
| Module | Responsibility |
|---|---|
| auth | Register, login, OTP, 2FA, tokens, sessions |
| users | Profiles, follow, block |
| verification | Scholar applications, review, endorsements |
| content | Videos, Reels, comments, likes, saves (R2 media pipeline) |
| live | Live halaqah broadcast cut from v1; deferred to v2 |
| messaging | Chat requests, conversations, messages |
| calls | 1-on-1 call sessions, LiveKit tokens |
| moderation | Reports, actions, suspensions |
| notifications | Push + in-app (Mongo jobs worker queue) |
| admin | Roles, audit log, analytics, scholar activity monitoring |

## 3. Data Model (MongoDB)
**users**
```
_id, email, phone, passwordHash, displayName, avatarUrl, bio,
roles: ['member'|'scholar'|'moderator'|'admin'],
scholarProfile: { verified, verifiedAt, institution, specialties[], languages[] },
twoFA: { enabled, secretEnc }, status: 'active'|'suspended'|'deleted',
createdAt, updatedAt
```
**scholar_applications**
```
_id, userId, credentials: [{type, fileKey, institution, year}],
statement, endorsements: [{scholarId, at}],
status: 'pending'|'approved'|'rejected'|'more_info',
reviewedBy, reviewNote, createdAt
```
**posts**
```
_id, authorId, type: 'reel'|'video', mediaKey, playbackUrl, duration,
thumbnailKey, caption, tags[], language, visibility,
status: 'processing'|'live'|'removed',
counts: {likes, comments, views, shares}, createdAt
```
**jobs** `_id, type, payload, status: 'pending'|'processing'|'completed'|'failed', runAt, attempts, maxAttempts, lastError, createdAt, updatedAt`
**comments** `_id, postId, userId, parentId, text, status, createdAt`
**follows** `followerId, followeeId, createdAt` (unique compound index)
**chat_requests** `_id, fromId, toId, message, status, createdAt`
**conversations** `_id, participants[], lastMessageAt`
**messages** `_id, conversationId, senderId, type, body, readBy[], createdAt`
**call_sessions** `_id, callerId, calleeId, roomName, status, startedAt, endedAt`
**reports** `_id, reporterId, targetType, targetId, reason, status, handledBy, createdAt`
**audit_logs** `_id, actorId, action, targetType, targetId, meta, ip, createdAt`
**refresh_tokens** `_id, userId, tokenHash, deviceId, expiresAt, revokedAt, replacedBy`

**Key indexes:** `users.email` (unique), `posts(authorId, createdAt)`, `posts(status, createdAt)`, `follows(followerId, followeeId)` unique, `messages(conversationId, createdAt)`, `jobs(status, runAt)`.

## 4. Key Sequences
**Scholar verification**
1. Member submits application → files uploaded via signed URL to private Cloudflare R2 bucket
2. Status `pending` → moderator queue
3. Moderator approves → add `scholar` role, set `verified`, audit log, push notification
4. Scholar prompted to enable 2FA before first post

**Video/Reel upload (Cloudflare R2)**
1. App requests presigned upload URL (`requireRole('scholar')`)
2. Direct upload to Cloudflare R2 public media bucket; post created as `processing`
3. App calls `POST /media/:id/complete` (server verifies R2 object existence, magic bytes, size, and type)
4. Post marked `live`, playback URL stored
5. Feed serves media via `expo-video` from Cloudflare R2 CDN URL

**1-on-1 Consultation Call**
1. Scholar initiates or accepts call request → server creates LiveKit room and short-lived tokens
2. Both participants connect via `@livekit/react-native-webrtc`
3. Recording-consent banner displayed if recording enabled
4. Session logged in `call_sessions`

*(Note: Live halaqah broadcasting is cut from v1; deferred to v2)*

**Chat request**
1. Member sends request → scholar accepts/declines → conversation created
2. Scholars can message anyone who follows them or has an open request

## 5. Mobile App Structure
```
app/
├─ (auth)/      login, register, otp, 2fa, forgot-password
├─ (tabs)/      feed, explore, inbox, profile
├─ scholar/     apply, dashboard, upload
├─ admin/       review-queue, reports   (role-gated)
├─ chat/[id]
└─ call/[id]    (1-on-1 consultations)
src/ api/ store/ hooks/ components/ theme/ i18n/ utils/
```
- Route guards read role from auth store; server remains source of truth.
- Tokens in `expo-secure-store`.

## 6. Caching and Scaling
- In-memory cache (30-60s TTL) for feed pages, scholar profiles, and saves (zero budget)
- Cloudflare R2 CDN for video playback and images
- Socket.io in-memory adapter for single-instance Node API
- Mongo `jobs` collection worker for async processing (notifications, upload sweeper, maintenance)

## 7. Error Handling and Observability
- Uniform error shape `{ error: { code, message, details? } }`
- Sentry in app, web, and API; request IDs in logs
- Health endpoint and uptime alerts

## 8. Deployment
- API on Railway/Render/AWS ECS; Mongo Atlas M0 (free); Cloudflare R2 (free tier)
- Web on Next.js 14 (Vercel or Node container)
- EAS Build for app binaries; OTA updates for JS-only fixes
- Blue/green or rolling deploys; DB backups daily with restore testing

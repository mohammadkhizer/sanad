# Sanad: System Design Document (SDD)

## 1. Architecture Overview
```
[Expo App] ──HTTPS──► [API Gateway / Express]
    │                     ├─► MongoDB (users, content, apps)
    │                     ├─► Redis (sessions, rate limits, queues)
    │                     ├─► Mux/Stream (video upload + HLS)
    │                     ├─► R2/S3 (credentials, images)
    │                     └─► Worker (BullMQ: notifications, moderation, webhooks)
    ├──WebSocket──► [Socket.io] (chat, presence)
    └──WebRTC─────► [LiveKit] (live, video calls)
```
Style: modular monolith (v1), split services later (media, realtime).

## 2. Modules
| Module | Responsibility |
|---|---|
| auth | Register, login, OTP, 2FA, tokens, sessions |
| users | Profiles, follow, block |
| verification | Scholar applications, review, endorsements |
| content | Videos, Reels, comments, likes, saves |
| live | Create room, tokens, chat, end/record |
| messaging | Chat requests, conversations, messages |
| calls | Call sessions, LiveKit tokens |
| moderation | Reports, actions, suspensions |
| notifications | Push + in-app |
| admin | Roles, audit log, analytics |

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
_id, authorId, type: 'reel'|'video', muxAssetId, playbackId, caption,
tags[], language, visibility, status: 'processing'|'live'|'removed',
counts: {likes, comments, views, shares}, createdAt
```
**comments** `_id, postId, userId, parentId, text, status, createdAt`
**follows** `followerId, followeeId, createdAt` (unique compound index)
**chat_requests** `_id, fromId, toId, message, status, createdAt`
**conversations** `_id, participants[], lastMessageAt`
**messages** `_id, conversationId, senderId, type, body, readBy[], createdAt`
**live_sessions** `_id, hostId, roomName, title, status, startedAt, endedAt, recordingUrl`
**call_sessions** `_id, callerId, calleeId, roomName, status, startedAt, endedAt`
**reports** `_id, reporterId, targetType, targetId, reason, status, handledBy, createdAt`
**audit_logs** `_id, actorId, action, targetType, targetId, meta, ip, createdAt`
**refresh_tokens** `_id, userId, tokenHash, deviceId, expiresAt, revokedAt, replacedBy`

**Key indexes:** `users.email` (unique), `posts(authorId, createdAt)`, `posts(status, createdAt)`, `follows(followerId, followeeId)` unique, `messages(conversationId, createdAt)`.

## 4. Key Sequences
**Scholar verification**
1. Member submits application → files uploaded via signed URL to private bucket
2. Status `pending` → moderator queue
3. Moderator approves → add `scholar` role, set `verified`, audit log, push notification
4. Scholar prompted to enable 2FA before first post

**Video/Reel upload**
1. App requests upload URL (`requireRole('scholar')`)
2. Direct upload to Mux; post created as `processing`
3. Mux webhook → mark `live`, store `playbackId`
4. Feed serves HLS via `expo-video`

**Go live**
1. Scholar `POST /live` → server creates LiveKit room + host token
2. Viewers fetch subscriber tokens
3. Live chat over Socket.io room
4. End → store recording (optional) → notify followers

**Chat request**
1. Member sends request → scholar accepts/declines → conversation created
2. Scholars can message anyone who follows them or has an open request

## 5. Mobile App Structure
```
app/
├─ (auth)/      login, register, otp, 2fa
├─ (tabs)/      feed, explore, live, inbox, profile
├─ scholar/     apply, dashboard, upload
├─ admin/       review-queue, reports   (role-gated)
├─ chat/[id]
├─ live/[id]
└─ call/[id]
src/ api/ store/ hooks/ components/ theme/ i18n/ utils/
```
- Route guards read role from auth store; server remains source of truth.
- Tokens in `expo-secure-store`.

## 6. Caching and Scaling
- Redis: feed pages, rate limit counters, online presence
- CDN for HLS and images
- Socket.io Redis adapter for multi-instance
- Background jobs for heavy work (notifications, thumbnails)

## 7. Error Handling and Observability
- Uniform error shape `{ code, message, details? }`
- Sentry in app and API; request IDs in logs
- Health endpoint and uptime alerts

## 8. Deployment
- API on Railway/Render/AWS ECS; Mongo Atlas; Redis managed
- EAS Build for app binaries; OTA updates for JS-only fixes
- Blue/green or rolling deploys; DB backups daily

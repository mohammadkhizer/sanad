# Graph Report - .  (2026-11-11)

## Corpus Check
- Corpus is ~28,697 words - fits in a single context window. You may not need a graph.

## Summary
- 219 nodes · 267 edges · 13 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_app.ts  db.ts|app.ts / db.ts]]
- [[_COMMUNITY_auth.controller.ts  auth.model.ts|auth.controller.ts / auth.model.ts]]
- [[_COMMUNITY_login.tsx  otp.tsx|login.tsx / otp.tsx]]
- [[_COMMUNITY_apiClient()  onRefreshed()|apiClient() / onRefreshed()]]
- [[_COMMUNITY_errors.ts  AppError|errors.ts / AppError]]
- [[_COMMUNITY_AuthController  .checkUsername()|AuthController / .checkUsername()]]
- [[_COMMUNITY_ContentController  .addComment()|ContentController / .addComment()]]
- [[_COMMUNITY_messaging.controller.ts  messaging.model.ts|messaging.controller.ts / messaging.model.ts]]
- [[_COMMUNITY_auditLog.ts  moderation.model.ts|auditLog.ts / moderation.model.ts]]
- [[_COMMUNITY_LiveController  .createLiveKitToken()|LiveController / .createLiveKitToken()]]
- [[_COMMUNITY_ScholarController  .decideApplication()|ScholarController / .decideApplication()]]
- [[_COMMUNITY_UsersController  .blockUser()|UsersController / .blockUser()]]
- [[_COMMUNITY_MemoryRedisMock  .del()|MemoryRedisMock / .del()]]

## God Nodes (most connected - your core abstractions)
1. `AuthController` - 12 edges
2. `ContentController` - 12 edges
3. `AuthService` - 10 edges
4. `LiveController` - 8 edges
5. `ScholarController` - 8 edges
6. `UsersController` - 8 edges
7. `MemoryRedisMock` - 6 edges
8. `MessagingController` - 6 edges
9. `ModerationController` - 6 edges
10. `BloomFilter` - 6 edges

## Surprising Connections (you probably didn't know these)
- `handlePublish()` --calls--> `apiClient()`  [INFERRED]
  apps\mobile\app\(tabs)\create.tsx → apps\mobile\src\api\client.ts
- `handleSubmit()` --calls--> `apiClient()`  [INFERRED]
  apps\mobile\app\scholar\apply.tsx → apps\mobile\src\api\client.ts
- `bootstrap()` --calls--> `connectDB()`  [INFERRED]
  apps\api\src\server.ts → apps\api\src\config\db.ts
- `handleLogout()` --calls--> `apiClient()`  [INFERRED]
  apps\mobile\app\(tabs)\profile.tsx → apps\mobile\src\api\client.ts

## Communities

### Community 1 - "app.ts / db.ts"
Cohesion: 0.18
Nodes (2): connectDB(), bootstrap()

### Community 2 - "auth.controller.ts / auth.model.ts"
Cohesion: 0.2
Nodes (2): BloomFilter, UsernameService

### Community 3 - "login.tsx / otp.tsx"
Cohesion: 0.18
Nodes (3): AuthService, handleLogin(), handleVerify()

### Community 4 - "apiClient() / onRefreshed()"
Cohesion: 0.17
Nodes (5): apiClient(), onRefreshed(), handleSubmit(), handlePublish(), handleLogout()

### Community 5 - "errors.ts / AppError"
Cohesion: 0.15
Nodes (6): AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError

### Community 6 - "AuthController / .checkUsername()"
Cohesion: 0.18
Nodes (1): AuthController

### Community 7 - "ContentController / .addComment()"
Cohesion: 0.17
Nodes (1): ContentController

### Community 8 - "messaging.controller.ts / messaging.model.ts"
Cohesion: 0.18
Nodes (1): MessagingController

### Community 9 - "auditLog.ts / moderation.model.ts"
Cohesion: 0.19
Nodes (1): ModerationController

### Community 10 - "LiveController / .createLiveKitToken()"
Cohesion: 0.39
Nodes (1): LiveController

### Community 11 - "ScholarController / .decideApplication()"
Cohesion: 0.25
Nodes (1): ScholarController

### Community 12 - "UsersController / .blockUser()"
Cohesion: 0.25
Nodes (1): UsersController

### Community 13 - "MemoryRedisMock / .del()"
Cohesion: 0.47
Nodes (1): MemoryRedisMock

## Knowledge Gaps
- **Thin community `app.ts / db.ts`** (17 nodes): `app.ts`, `db.ts`, `env.ts`, `logger.ts`, `redis.ts`, `errorHandler.ts`, `requestId.ts`, `server.ts`, `bloomFilter.test.ts`, `health.test.ts`, `rbac.test.ts`, `connectDB()`, `disconnectDB()`, `errorHandler()`, `requestIdMiddleware()`, `bootstrap()`, `shutdown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `auth.controller.ts / auth.model.ts`** (16 nodes): `auth.controller.ts`, `auth.model.ts`, `auth.service.ts`, `bloomFilter.service.ts`, `BloomFilter`, `.add()`, `.clear()`, `.constructor()`, `.getHashes()`, `.has()`, `UsernameService`, `.checkAvailability()`, `.constructor()`, `.getBloomFilter()`, `.initialize()`, `.registerUsername()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AuthController / .checkUsername()`** (12 nodes): `AuthController`, `.checkUsername()`, `.deleteAccount()`, `.getSessions()`, `.login()`, `.logout()`, `.logoutAll()`, `.refresh()`, `.register()`, `.setup2FA()`, `.verify2FA()`, `.verifyOtp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ContentController / .addComment()`** (12 nodes): `ContentController`, `.addComment()`, `.createPost()`, `.deletePost()`, `.getComments()`, `.getFeed()`, `.getPostById()`, `.getUploadUrl()`, `.likePost()`, `.savePost()`, `.unlikePost()`, `.updatePost()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `messaging.controller.ts / messaging.model.ts`** (12 nodes): `messaging.controller.ts`, `messaging.model.ts`, `messaging.routes.ts`, `users.model.ts`, `socket.ts`, `MessagingController`, `.getConversations()`, `.getMessages()`, `.respondChatRequest()`, `.sendChatRequest()`, `.sendMessage()`, `setupSocketIO()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `auditLog.ts / moderation.model.ts`** (9 nodes): `auditLog.ts`, `moderation.model.ts`, `auditAction()`, `ModerationController`, `.createReport()`, `.getAuditLogs()`, `.handleReportAction()`, `.listReports()`, `.suspendUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `LiveController / .createLiveKitToken()`** (8 nodes): `LiveController`, `.createLiveKitToken()`, `.endLive()`, `.getActiveLives()`, `.getViewerToken()`, `.initiateCall()`, `.respondCall()`, `.startLive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ScholarController / .decideApplication()`** (8 nodes): `ScholarController`, `.decideApplication()`, `.endorseScholar()`, `.getMyApplication()`, `.getUploadUrl()`, `.listApplications()`, `.revokeScholar()`, `.submitApplication()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UsersController / .blockUser()`** (8 nodes): `UsersController`, `.blockUser()`, `.followUser()`, `.getMe()`, `.getUser()`, `.unblockUser()`, `.unfollowUser()`, `.updateMe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MemoryRedisMock / .del()`** (6 nodes): `MemoryRedisMock`, `.del()`, `.expire()`, `.get()`, `.incr()`, `.set()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `login.tsx / otp.tsx` to `auth.controller.ts / auth.model.ts`, `apiClient() / onRefreshed()`?**
  _High betweenness centrality (0.166) - this node is a cross-community bridge._
- **Why does `ContentController` connect `ContentController / .addComment()` to `auth.ts / rateLimiter.ts`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `AuthController` connect `AuthController / .checkUsername()` to `auth.controller.ts / auth.model.ts`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Should `auth.ts / rateLimiter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
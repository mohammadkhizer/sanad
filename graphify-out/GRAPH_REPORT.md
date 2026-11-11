# Graph Report - .  (2026-11-11)

## Corpus Check
- Corpus is ~27,846 words - fits in a single context window. You may not need a graph.

## Summary
- 204 nodes · 242 edges · 12 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_auth.ts  rateLimiter.ts|auth.ts / rateLimiter.ts]]
- [[_COMMUNITY_app.ts  db.ts|app.ts / db.ts]]
- [[_COMMUNITY_login.tsx  otp.tsx|login.tsx / otp.tsx]]
- [[_COMMUNITY_errors.ts  AppError|errors.ts / AppError]]
- [[_COMMUNITY_apiClient()  onRefreshed()|apiClient() / onRefreshed()]]
- [[_COMMUNITY_ContentController  .addComment()|ContentController / .addComment()]]
- [[_COMMUNITY_messaging.controller.ts  messaging.model.ts|messaging.controller.ts / messaging.model.ts]]
- [[_COMMUNITY_AuthController  .deleteAccount()|AuthController / .deleteAccount()]]
- [[_COMMUNITY_auditLog.ts  moderation.controller.ts|auditLog.ts / moderation.controller.ts]]
- [[_COMMUNITY_LiveController  .createLiveKitToken()|LiveController / .createLiveKitToken()]]
- [[_COMMUNITY_UsersController  .blockUser()|UsersController / .blockUser()]]
- [[_COMMUNITY_MemoryRedisMock  .del()|MemoryRedisMock / .del()]]

## God Nodes (most connected - your core abstractions)
1. `ContentController` - 12 edges
2. `AuthController` - 11 edges
3. `AuthService` - 10 edges
4. `LiveController` - 8 edges
5. `ScholarController` - 8 edges
6. `UsersController` - 8 edges
7. `MemoryRedisMock` - 6 edges
8. `MessagingController` - 6 edges
9. `ModerationController` - 6 edges
10. `apiClient()` - 5 edges

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

### Community 0 - "auth.ts / rateLimiter.ts"
Cohesion: 0.08
Nodes (1): ScholarController

### Community 1 - "app.ts / db.ts"
Cohesion: 0.19
Nodes (2): connectDB(), bootstrap()

### Community 2 - "login.tsx / otp.tsx"
Cohesion: 0.18
Nodes (3): AuthService, handleLogin(), handleVerify()

### Community 3 - "errors.ts / AppError"
Cohesion: 0.15
Nodes (6): AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError

### Community 4 - "apiClient() / onRefreshed()"
Cohesion: 0.17
Nodes (5): apiClient(), onRefreshed(), handleSubmit(), handlePublish(), handleLogout()

### Community 5 - "ContentController / .addComment()"
Cohesion: 0.17
Nodes (1): ContentController

### Community 6 - "messaging.controller.ts / messaging.model.ts"
Cohesion: 0.18
Nodes (1): MessagingController

### Community 7 - "AuthController / .deleteAccount()"
Cohesion: 0.2
Nodes (1): AuthController

### Community 8 - "auditLog.ts / moderation.controller.ts"
Cohesion: 0.2
Nodes (1): ModerationController

### Community 9 - "LiveController / .createLiveKitToken()"
Cohesion: 0.39
Nodes (1): LiveController

### Community 10 - "UsersController / .blockUser()"
Cohesion: 0.25
Nodes (1): UsersController

### Community 11 - "MemoryRedisMock / .del()"
Cohesion: 0.47
Nodes (1): MemoryRedisMock

## Knowledge Gaps
- **Thin community `auth.ts / rateLimiter.ts`** (38 nodes): `auth.ts`, `rateLimiter.ts`, `rbac.ts`, `validate.ts`, `admin.routes.ts`, `auth.controller.ts`, `auth.model.ts`, `auth.routes.ts`, `auth.service.ts`, `content.controller.ts`, `content.model.ts`, `content.routes.ts`, `live.controller.ts`, `live.model.ts`, `live.routes.ts`, `moderation.routes.ts`, `scholar.controller.ts`, `scholar.model.ts`, `scholar.routes.ts`, `users.controller.ts`, `users.routes.ts`, `index.ts`, `authenticate()`, `optionalAuthenticate()`, `require2FA()`, `requireOwnership()`, `requirePermission()`, `requireRole()`, `validate()`, `validateQuery()`, `ScholarController`, `.decideApplication()`, `.endorseScholar()`, `.getMyApplication()`, `.getUploadUrl()`, `.listApplications()`, `.revokeScholar()`, `.submitApplication()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `app.ts / db.ts`** (16 nodes): `app.ts`, `db.ts`, `env.ts`, `logger.ts`, `redis.ts`, `errorHandler.ts`, `requestId.ts`, `server.ts`, `health.test.ts`, `rbac.test.ts`, `connectDB()`, `disconnectDB()`, `errorHandler()`, `requestIdMiddleware()`, `bootstrap()`, `shutdown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ContentController / .addComment()`** (12 nodes): `ContentController`, `.addComment()`, `.createPost()`, `.deletePost()`, `.getComments()`, `.getFeed()`, `.getPostById()`, `.getUploadUrl()`, `.likePost()`, `.savePost()`, `.unlikePost()`, `.updatePost()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `messaging.controller.ts / messaging.model.ts`** (12 nodes): `messaging.controller.ts`, `messaging.model.ts`, `messaging.routes.ts`, `users.model.ts`, `socket.ts`, `MessagingController`, `.getConversations()`, `.getMessages()`, `.respondChatRequest()`, `.sendChatRequest()`, `.sendMessage()`, `setupSocketIO()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `AuthController / .deleteAccount()`** (11 nodes): `AuthController`, `.deleteAccount()`, `.getSessions()`, `.login()`, `.logout()`, `.logoutAll()`, `.refresh()`, `.register()`, `.setup2FA()`, `.verify2FA()`, `.verifyOtp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `auditLog.ts / moderation.controller.ts`** (10 nodes): `auditLog.ts`, `moderation.controller.ts`, `moderation.model.ts`, `auditAction()`, `ModerationController`, `.createReport()`, `.getAuditLogs()`, `.handleReportAction()`, `.listReports()`, `.suspendUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `LiveController / .createLiveKitToken()`** (8 nodes): `LiveController`, `.createLiveKitToken()`, `.endLive()`, `.getActiveLives()`, `.getViewerToken()`, `.initiateCall()`, `.respondCall()`, `.startLive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UsersController / .blockUser()`** (8 nodes): `UsersController`, `.blockUser()`, `.followUser()`, `.getMe()`, `.getUser()`, `.unblockUser()`, `.unfollowUser()`, `.updateMe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MemoryRedisMock / .del()`** (6 nodes): `MemoryRedisMock`, `.del()`, `.expire()`, `.get()`, `.incr()`, `.set()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `login.tsx / otp.tsx` to `auth.ts / rateLimiter.ts`, `apiClient() / onRefreshed()`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Why does `ContentController` connect `ContentController / .addComment()` to `auth.ts / rateLimiter.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `auth.ts / rateLimiter.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
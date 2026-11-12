# Graph Report - sanad  (2026-11-12)

## Corpus Check
- 138 files · ~80,078 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 350 nodes · 357 edges · 17 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `AuthController` - 13 edges
2. `ContentController` - 12 edges
3. `AuthService` - 11 edges
4. `UsersController` - 11 edges
5. `LiveController` - 8 edges
6. `ScholarController` - 8 edges
7. `MockRealtimeClient` - 8 edges
8. `MemoryRedisMock` - 6 edges
9. `MessagingController` - 6 edges
10. `ModerationController` - 6 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --calls--> `connectDB()`  [INFERRED]
  apps\api\src\server.ts → apps\api\src\config\db.ts
- `connectDB()` --calls--> `seedDatabase()`  [INFERRED]
  apps\api\src\config\db.ts → apps\api\src\scripts\seed.ts
- `disconnectDB()` --calls--> `seedDatabase()`  [INFERRED]
  apps\api\src\config\db.ts → apps\api\src\scripts\seed.ts
- `handlePingBackend()` --calls--> `checkBackendHealth()`  [INFERRED]
  apps\mobile\app\settings\index.tsx → apps\mobile\src\api\config.ts
- `apiClient()` --calls--> `getApiBaseUrl()`  [INFERRED]
  apps\mobile\src\api\client.ts → apps\mobile\src\api\config.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (1): ModerationController

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (4): connectDB(), disconnectDB(), seedDatabase(), bootstrap()

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (4): handleAdminRegister(), AuthService, handleLogin(), handleVerify()

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (7): apiClient(), onRefreshed(), checkBackendHealth(), getApiBaseUrl(), getExpoHostUri(), getPlatformOS(), handlePingBackend()

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (1): AuthController

### Community 5 - "Community 5"
Cohesion: 0.15
Nodes (6): AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (1): ContentController

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (1): MessagingController

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (2): BloomFilter, UsernameService

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (1): UsersController

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (1): MockRealtimeClient

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (2): useCan(), can()

### Community 12 - "Community 12"
Cohesion: 0.39
Nodes (1): LiveController

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (1): ScholarController

### Community 14 - "Community 14"
Cohesion: 0.47
Nodes (1): MemoryRedisMock

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (1): MockMediaSession

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (1): RootLayout()

## Knowledge Gaps
- **Thin community `Community 0`** (37 nodes): `auditLog.ts`, `auth.ts`, `rateLimiter.ts`, `rbac.ts`, `validate.ts`, `admin.routes.ts`, `auth.routes.ts`, `content.controller.ts`, `content.model.ts`, `content.routes.ts`, `live.controller.ts`, `live.model.ts`, `live.routes.ts`, `moderation.controller.ts`, `moderation.model.ts`, `moderation.routes.ts`, `scholar.controller.ts`, `scholar.model.ts`, `scholar.routes.ts`, `users.controller.ts`, `users.routes.ts`, `index.ts`, `auditAction()`, `authenticate()`, `optionalAuthenticate()`, `require2FA()`, `requireOwnership()`, `requirePermission()`, `requireRole()`, `validate()`, `validateQuery()`, `ModerationController`, `.createReport()`, `.getAuditLogs()`, `.handleReportAction()`, `.listReports()`, `.suspendUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (13 nodes): `AuthController`, `.adminRegister()`, `.checkUsername()`, `.deleteAccount()`, `.getSessions()`, `.login()`, `.logout()`, `.logoutAll()`, `.refresh()`, `.register()`, `.setup2FA()`, `.verify2FA()`, `.verifyOtp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (12 nodes): `ContentController`, `.addComment()`, `.createPost()`, `.deletePost()`, `.getComments()`, `.getFeed()`, `.getPostById()`, `.getUploadUrl()`, `.likePost()`, `.savePost()`, `.unlikePost()`, `.updatePost()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (12 nodes): `messaging.controller.ts`, `messaging.model.ts`, `messaging.routes.ts`, `users.model.ts`, `socket.ts`, `MessagingController`, `.getConversations()`, `.getMessages()`, `.respondChatRequest()`, `.sendChatRequest()`, `.sendMessage()`, `setupSocketIO()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (12 nodes): `BloomFilter`, `.add()`, `.clear()`, `.constructor()`, `.getHashes()`, `.has()`, `UsernameService`, `.checkAvailability()`, `.constructor()`, `.getBloomFilter()`, `.initialize()`, `.registerUsername()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (11 nodes): `UsersController`, `.blockUser()`, `.followUser()`, `.getMe()`, `.getNetwork()`, `.getUser()`, `.listUsers()`, `.unblockUser()`, `.unfollowUser()`, `.updateMe()`, `.updateUserRoles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (9 nodes): `MockRealtimeClient`, `.connect()`, `.disconnect()`, `.emit()`, `.joinRoom()`, `.leaveRoom()`, `.on()`, `.trigger()`, `realtime.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (9 nodes): `useCan.ts`, `useCan()`, `permissions.test.ts`, `permissions.ts`, `roles.ts`, `schemas.test.ts`, `schemas.ts`, `can()`, `createPaginatedResponseSchema()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (8 nodes): `LiveController`, `.createLiveKitToken()`, `.endLive()`, `.getActiveLives()`, `.getViewerToken()`, `.initiateCall()`, `.respondCall()`, `.startLive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (8 nodes): `ScholarController`, `.decideApplication()`, `.endorseScholar()`, `.getMyApplication()`, `.getUploadUrl()`, `.listApplications()`, `.revokeScholar()`, `.submitApplication()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (6 nodes): `MemoryRedisMock`, `.del()`, `.expire()`, `.get()`, `.incr()`, `.set()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (6 nodes): `createMediaSession()`, `MockMediaSession`, `.flipCamera()`, `.toggleMute()`, `.toggleVideo()`, `media.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `RootLayout()`, `_layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `AuthController` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `ContentController` connect `Community 6` to `Community 0`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
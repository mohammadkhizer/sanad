# Graph Report - sanad  (2026-11-11)

## Corpus Check
- 119 files · ~53,094 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 314 nodes · 327 edges · 16 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
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
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `AuthController` - 12 edges
2. `ContentController` - 12 edges
3. `AuthService` - 10 edges
4. `LiveController` - 8 edges
5. `ScholarController` - 8 edges
6. `UsersController` - 8 edges
7. `MockRealtimeClient` - 8 edges
8. `MemoryRedisMock` - 6 edges
9. `MessagingController` - 6 edges
10. `ModerationController` - 6 edges

## Surprising Connections (you probably didn't know these)
- `handlePublish()` --calls--> `apiClient()`  [INFERRED]
  apps\mobile\app\(tabs)\create.tsx → apps\mobile\src\api\client.ts
- `handleLogout()` --calls--> `apiClient()`  [INFERRED]
  apps\mobile\app\(tabs)\profile.tsx → apps\mobile\src\api\client.ts
- `handleSubmit()` --calls--> `apiClient()`  [INFERRED]
  apps\mobile\app\scholar\apply.tsx → apps\mobile\src\api\client.ts
- `bootstrap()` --calls--> `connectDB()`  [INFERRED]
  apps\api\src\server.ts → apps\api\src\config\db.ts
- `setMockUser()` --calls--> `handleSelectRole()`  [INFERRED]
  apps\mobile\src\api\mock\adapter.ts → apps\mobile\src\components\DevControlsBar.tsx

## Communities

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (7): AuthService, handleLogin(), handleVerify(), handleVerify(), handleSelectRole(), setMockUser(), handleLogout()

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (2): connectDB(), bootstrap()

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (6): AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (1): AuthController

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (1): ContentController

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (1): MessagingController

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (2): BloomFilter, UsernameService

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (4): apiClient(), onRefreshed(), handleSubmit(), handlePublish()

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (1): MockRealtimeClient

### Community 10 - "Community 10"
Cohesion: 0.39
Nodes (1): LiveController

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (1): ScholarController

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (1): UsersController

### Community 13 - "Community 13"
Cohesion: 0.29
Nodes (2): useCan(), can()

### Community 14 - "Community 14"
Cohesion: 0.47
Nodes (1): MemoryRedisMock

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (1): ModerationController

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (1): MockMediaSession

## Knowledge Gaps
- **Thin community `Community 2`** (16 nodes): `app.ts`, `db.ts`, `env.ts`, `logger.ts`, `redis.ts`, `errorHandler.ts`, `requestId.ts`, `server.ts`, `health.test.ts`, `rbac.test.ts`, `connectDB()`, `disconnectDB()`, `errorHandler()`, `requestIdMiddleware()`, `bootstrap()`, `shutdown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (12 nodes): `AuthController`, `.checkUsername()`, `.deleteAccount()`, `.getSessions()`, `.login()`, `.logout()`, `.logoutAll()`, `.refresh()`, `.register()`, `.setup2FA()`, `.verify2FA()`, `.verifyOtp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (12 nodes): `ContentController`, `.addComment()`, `.createPost()`, `.deletePost()`, `.getComments()`, `.getFeed()`, `.getPostById()`, `.getUploadUrl()`, `.likePost()`, `.savePost()`, `.unlikePost()`, `.updatePost()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (12 nodes): `messaging.controller.ts`, `messaging.model.ts`, `messaging.routes.ts`, `users.model.ts`, `socket.ts`, `MessagingController`, `.getConversations()`, `.getMessages()`, `.respondChatRequest()`, `.sendChatRequest()`, `.sendMessage()`, `setupSocketIO()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (12 nodes): `BloomFilter`, `.add()`, `.clear()`, `.constructor()`, `.getHashes()`, `.has()`, `UsernameService`, `.checkAvailability()`, `.constructor()`, `.getBloomFilter()`, `.initialize()`, `.registerUsername()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (9 nodes): `MockRealtimeClient`, `.connect()`, `.disconnect()`, `.emit()`, `.joinRoom()`, `.leaveRoom()`, `.on()`, `.trigger()`, `realtime.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (8 nodes): `LiveController`, `.createLiveKitToken()`, `.endLive()`, `.getActiveLives()`, `.getViewerToken()`, `.initiateCall()`, `.respondCall()`, `.startLive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (8 nodes): `ScholarController`, `.decideApplication()`, `.endorseScholar()`, `.getMyApplication()`, `.getUploadUrl()`, `.listApplications()`, `.revokeScholar()`, `.submitApplication()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (8 nodes): `UsersController`, `.blockUser()`, `.followUser()`, `.getMe()`, `.getUser()`, `.unblockUser()`, `.unfollowUser()`, `.updateMe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (8 nodes): `useCan.ts`, `useCan()`, `permissions.test.ts`, `permissions.ts`, `roles.ts`, `schemas.ts`, `can()`, `createPaginatedResponseSchema()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (6 nodes): `MemoryRedisMock`, `.del()`, `.expire()`, `.get()`, `.incr()`, `.set()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (6 nodes): `ModerationController`, `.createReport()`, `.getAuditLogs()`, `.handleReportAction()`, `.listReports()`, `.suspendUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (6 nodes): `createMediaSession()`, `MockMediaSession`, `.flipCamera()`, `.toggleMute()`, `.toggleVideo()`, `media.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `handleLogout()` connect `Community 1` to `Community 8`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `ContentController` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
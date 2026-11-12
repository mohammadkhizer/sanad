# Graph Report - sanad  (2026-11-12)

## Corpus Check
- 137 files · ~78,943 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 348 nodes · 352 edges · 18 communities detected
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]

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
- `bootstrap()` --calls--> `connectDB()`  [INFERRED]
  apps\api\src\server.ts → apps\api\src\config\db.ts
- `seedDatabase()` --calls--> `connectDB()`  [INFERRED]
  apps\api\src\scripts\seed.ts → apps\api\src\config\db.ts
- `seedDatabase()` --calls--> `disconnectDB()`  [INFERRED]
  apps\api\src\scripts\seed.ts → apps\api\src\config\db.ts
- `handleToggleMode()` --calls--> `setApiMode()`  [INFERRED]
  apps\mobile\app\settings\index.tsx → apps\mobile\src\api\config.ts
- `handleToggleMode()` --calls--> `getApiBaseUrl()`  [INFERRED]
  apps\mobile\app\settings\index.tsx → apps\mobile\src\api\config.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (6): AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (4): connectDB(), disconnectDB(), seedDatabase(), bootstrap()

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (5): AuthService, handleLogin(), handleVerify(), handleSelectRole(), setMockUser()

### Community 3 - "Community 3"
Cohesion: 0.18
Nodes (1): AuthController

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (1): ContentController

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (2): BloomFilter, UsernameService

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (1): MessagingController

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (1): ModerationController

### Community 8 - "Community 8"
Cohesion: 0.27
Nodes (5): checkBackendHealth(), getApiBaseUrl(), setApiMode(), handlePingBackend(), handleToggleMode()

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (1): MockRealtimeClient

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (2): useCan(), can()

### Community 11 - "Community 11"
Cohesion: 0.39
Nodes (1): LiveController

### Community 12 - "Community 12"
Cohesion: 0.25
Nodes (1): ScholarController

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (1): UsersController

### Community 15 - "Community 15"
Cohesion: 0.47
Nodes (1): MemoryRedisMock

### Community 16 - "Community 16"
Cohesion: 0.33
Nodes (1): MockMediaSession

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (2): apiClient(), onRefreshed()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (1): RootLayout()

## Knowledge Gaps
- **Thin community `Community 3`** (12 nodes): `AuthController`, `.checkUsername()`, `.deleteAccount()`, `.getSessions()`, `.login()`, `.logout()`, `.logoutAll()`, `.refresh()`, `.register()`, `.setup2FA()`, `.verify2FA()`, `.verifyOtp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (12 nodes): `ContentController`, `.addComment()`, `.createPost()`, `.deletePost()`, `.getComments()`, `.getFeed()`, `.getPostById()`, `.getUploadUrl()`, `.likePost()`, `.savePost()`, `.unlikePost()`, `.updatePost()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (12 nodes): `BloomFilter`, `.add()`, `.clear()`, `.constructor()`, `.getHashes()`, `.has()`, `UsernameService`, `.checkAvailability()`, `.constructor()`, `.getBloomFilter()`, `.initialize()`, `.registerUsername()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (11 nodes): `messaging.controller.ts`, `messaging.model.ts`, `users.model.ts`, `socket.ts`, `MessagingController`, `.getConversations()`, `.getMessages()`, `.respondChatRequest()`, `.sendChatRequest()`, `.sendMessage()`, `setupSocketIO()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (10 nodes): `auditLog.ts`, `moderation.controller.ts`, `moderation.model.ts`, `auditAction()`, `ModerationController`, `.createReport()`, `.getAuditLogs()`, `.handleReportAction()`, `.listReports()`, `.suspendUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (9 nodes): `MockRealtimeClient`, `.connect()`, `.disconnect()`, `.emit()`, `.joinRoom()`, `.leaveRoom()`, `.on()`, `.trigger()`, `realtime.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (9 nodes): `useCan.ts`, `useCan()`, `permissions.test.ts`, `permissions.ts`, `roles.ts`, `schemas.test.ts`, `schemas.ts`, `can()`, `createPaginatedResponseSchema()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (8 nodes): `LiveController`, `.createLiveKitToken()`, `.endLive()`, `.getActiveLives()`, `.getViewerToken()`, `.initiateCall()`, `.respondCall()`, `.startLive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (8 nodes): `ScholarController`, `.decideApplication()`, `.endorseScholar()`, `.getMyApplication()`, `.getUploadUrl()`, `.listApplications()`, `.revokeScholar()`, `.submitApplication()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (8 nodes): `UsersController`, `.blockUser()`, `.followUser()`, `.getMe()`, `.getUser()`, `.unblockUser()`, `.unfollowUser()`, `.updateMe()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (6 nodes): `MemoryRedisMock`, `.del()`, `.expire()`, `.get()`, `.incr()`, `.set()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (6 nodes): `createMediaSession()`, `MockMediaSession`, `.flipCamera()`, `.toggleMute()`, `.toggleVideo()`, `media.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (4 nodes): `apiClient()`, `onRefreshed()`, `subscribeTokenRefresh()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (3 nodes): `RootLayout()`, `_layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `Community 2` to `Community 1`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `ContentController` connect `Community 4` to `Community 0`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `AuthController` connect `Community 3` to `Community 1`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
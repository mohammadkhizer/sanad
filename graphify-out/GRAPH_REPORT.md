# Graph Report - sanad  (2026-11-12)

## Corpus Check
- 138 files · ~81,171 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 355 nodes · 363 edges · 16 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)
1. `AuthController` - 13 edges
2. `ContentController` - 12 edges
3. `AuthService` - 11 edges
4. `UsersController` - 9 edges
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
- `handleToggleMode()` --calls--> `setApiMode()`  [INFERRED]
  apps\mobile\app\settings\index.tsx → apps\mobile\src\api\config.ts
- `handleToggleMode()` --calls--> `getApiBaseUrl()`  [INFERRED]
  apps\mobile\app\settings\index.tsx → apps\mobile\src\api\config.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (7): UsersController, AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (5): connectDB(), disconnectDB(), MemoryRedisMock, seedDatabase(), bootstrap()

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (7): handleAdminRegister(), AuthService, handleAdminQuickLogin(), handleLogin(), handleVerify(), handleSelectRole(), setMockUser()

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (1): ScholarController

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (1): AuthController

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (1): ContentController

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (2): BloomFilter, UsernameService

### Community 7 - "Community 7"
Cohesion: 0.27
Nodes (5): checkBackendHealth(), getApiBaseUrl(), setApiMode(), handlePingBackend(), handleToggleMode()

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (1): MockRealtimeClient

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (2): useCan(), can()

### Community 10 - "Community 10"
Cohesion: 0.39
Nodes (1): LiveController

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (1): MessagingController

### Community 13 - "Community 13"
Cohesion: 0.33
Nodes (1): ModerationController

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (1): MockMediaSession

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (2): apiClient(), onRefreshed()

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (1): RootLayout()

## Knowledge Gaps
- **Thin community `Community 3`** (19 nodes): `auditLog.ts`, `auth.controller.ts`, `auth.model.ts`, `auth.service.ts`, `content.model.ts`, `moderation.controller.ts`, `moderation.model.ts`, `scholar.model.ts`, `seed.ts`, `bloomFilter.service.ts`, `auditAction()`, `ScholarController`, `.decideApplication()`, `.endorseScholar()`, `.getMyApplication()`, `.getUploadUrl()`, `.listApplications()`, `.revokeScholar()`, `.submitApplication()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (13 nodes): `AuthController`, `.adminRegister()`, `.checkUsername()`, `.deleteAccount()`, `.getSessions()`, `.login()`, `.logout()`, `.logoutAll()`, `.refresh()`, `.register()`, `.setup2FA()`, `.verify2FA()`, `.verifyOtp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (12 nodes): `ContentController`, `.addComment()`, `.createPost()`, `.deletePost()`, `.getComments()`, `.getFeed()`, `.getPostById()`, `.getUploadUrl()`, `.likePost()`, `.savePost()`, `.unlikePost()`, `.updatePost()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (12 nodes): `BloomFilter`, `.add()`, `.clear()`, `.constructor()`, `.getHashes()`, `.has()`, `UsernameService`, `.checkAvailability()`, `.constructor()`, `.getBloomFilter()`, `.initialize()`, `.registerUsername()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (9 nodes): `MockRealtimeClient`, `.connect()`, `.disconnect()`, `.emit()`, `.joinRoom()`, `.leaveRoom()`, `.on()`, `.trigger()`, `realtime.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (9 nodes): `useCan.ts`, `useCan()`, `permissions.test.ts`, `permissions.ts`, `roles.ts`, `schemas.test.ts`, `schemas.ts`, `can()`, `createPaginatedResponseSchema()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (8 nodes): `LiveController`, `.createLiveKitToken()`, `.endLive()`, `.getActiveLives()`, `.getViewerToken()`, `.initiateCall()`, `.respondCall()`, `.startLive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (6 nodes): `MessagingController`, `.getConversations()`, `.getMessages()`, `.respondChatRequest()`, `.sendChatRequest()`, `.sendMessage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (6 nodes): `ModerationController`, `.createReport()`, `.getAuditLogs()`, `.handleReportAction()`, `.listReports()`, `.suspendUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (6 nodes): `createMediaSession()`, `MockMediaSession`, `.flipCamera()`, `.toggleMute()`, `.toggleVideo()`, `media.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (4 nodes): `apiClient()`, `onRefreshed()`, `subscribeTokenRefresh()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (3 nodes): `RootLayout()`, `_layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `Community 2` to `Community 3`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `AuthController` connect `Community 4` to `Community 3`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `ContentController` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
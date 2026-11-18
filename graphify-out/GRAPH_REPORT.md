# Graph Report - sanad  (2026-11-18)

## Corpus Check
- 222 files · ~129,104 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 552 nodes · 555 edges · 27 communities detected
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
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
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `AuthController` - 15 edges
2. `AuthService` - 13 edges
3. `ContentController` - 12 edges
4. `UsersController` - 11 edges
5. `createAndSendNotification()` - 9 edges
6. `JobsService` - 8 edges
7. `LiveController` - 8 edges
8. `ScholarController` - 8 edges
9. `MockRealtimeClient` - 8 edges
10. `NotificationsController` - 7 edges

## Surprising Connections (you probably didn't know these)
- `bootstrap()` --calls--> `connectDB()`  [INFERRED]
  apps\api\src\server.ts → apps\api\src\config\db.ts
- `connectDB()` --calls--> `seedDatabase()`  [INFERRED]
  apps\api\src\config\db.ts → apps\api\src\scripts\seed.ts
- `disconnectDB()` --calls--> `seedDatabase()`  [INFERRED]
  apps\api\src\config\db.ts → apps\api\src\scripts\seed.ts
- `createAndSendNotification()` --calls--> `getSocketIO()`  [INFERRED]
  apps\api\src\services\notification.service.ts → apps\api\src\realtime\socket.ts
- `handlePingBackend()` --calls--> `checkBackendHealth()`  [INFERRED]
  apps\mobile\app\settings\index.tsx → apps\mobile\src\api\config.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (8): MediaController, sniffMagicBytes(), AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (6): ScholarActivityController, ContentController, MessagingController, getSocketIO(), createAndSendNotification(), UsersController

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (5): connectDB(), disconnectDB(), EmailService, seedDatabase(), bootstrap()

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (7): handleAdminRegister(), AuthService, handleLogin(), handleVerify(), handleSignOut(), handleSubmit(), handleRegister()

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (1): AuthController

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (7): apiClient(), onRefreshed(), checkBackendHealth(), getApiBaseUrl(), getExpoHostUri(), getPlatformOS(), handlePingBackend()

### Community 7 - "Community 7"
Cohesion: 0.24
Nodes (2): BloomFilter, UsernameService

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (1): MockRealtimeClient

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (2): useCan(), can()

### Community 10 - "Community 10"
Cohesion: 0.29
Nodes (3): ApiError, apiFetch(), getStoredToken()

### Community 11 - "Community 11"
Cohesion: 0.32
Nodes (1): JobsService

### Community 12 - "Community 12"
Cohesion: 0.39
Nodes (1): LiveController

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (1): ScholarController

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (1): NotificationsController

### Community 16 - "Community 16"
Cohesion: 0.47
Nodes (3): fetchScholars(), handleDismissActivity(), handleSearchSubmit()

### Community 17 - "Community 17"
Cohesion: 0.47
Nodes (3): fetchUsers(), handleSaveRoles(), handleToggleDisable()

### Community 18 - "Community 18"
Cohesion: 0.47
Nodes (1): MemoryRedisMock

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (1): ModerationController

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (1): MockMediaSession

### Community 22 - "Community 22"
Cohesion: 0.4
Nodes (1): RootLayout()

### Community 25 - "Community 25"
Cohesion: 0.4
Nodes (1): toggleFollow()

### Community 27 - "Community 27"
Cohesion: 0.67
Nodes (2): handleRequestCode(), handleResetPassword()

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (1): MediaService

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (2): fetchReports(), handleResolve()

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (2): fetchQueue(), handleDecision()

### Community 35 - "Community 35"
Cohesion: 0.67
Nodes (1): AppPage()

### Community 36 - "Community 36"
Cohesion: 0.67
Nodes (1): ConductPage()

## Knowledge Gaps
- **Thin community `Community 5`** (15 nodes): `AuthController`, `.adminRegister()`, `.checkUsername()`, `.deleteAccount()`, `.forgotPassword()`, `.getSessions()`, `.login()`, `.logout()`, `.logoutAll()`, `.refresh()`, `.register()`, `.resetPassword()`, `.setup2FA()`, `.verify2FA()`, `.verifyOtp()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (12 nodes): `BloomFilter`, `.add()`, `.clear()`, `.constructor()`, `.getHashes()`, `.has()`, `UsernameService`, `.checkAvailability()`, `.constructor()`, `.getBloomFilter()`, `.initialize()`, `.registerUsername()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (9 nodes): `MockRealtimeClient`, `.connect()`, `.disconnect()`, `.emit()`, `.joinRoom()`, `.leaveRoom()`, `.on()`, `.trigger()`, `realtime.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 9`** (9 nodes): `useCan.ts`, `useCan()`, `permissions.test.ts`, `permissions.ts`, `roles.ts`, `schemas.test.ts`, `schemas.ts`, `can()`, `createPaginatedResponseSchema()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (8 nodes): `JobsService`, `.constructor()`, `.enqueue()`, `.processNextJob()`, `.registerDefaultHandlers()`, `.registerHandler()`, `.startWorker()`, `.stopWorker()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (8 nodes): `LiveController`, `.createLiveKitToken()`, `.endLive()`, `.getActiveLives()`, `.getViewerToken()`, `.initiateCall()`, `.respondCall()`, `.startLive()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (8 nodes): `ScholarController`, `.decideApplication()`, `.endorseScholar()`, `.getMyApplication()`, `.getUploadUrl()`, `.listApplications()`, `.revokeScholar()`, `.submitApplication()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (7 nodes): `NotificationsController`, `.getPreferences()`, `.listNotifications()`, `.markAllRead()`, `.markRead()`, `.unreadCount()`, `.updatePreferences()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (6 nodes): `MemoryRedisMock`, `.del()`, `.expire()`, `.get()`, `.incr()`, `.set()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (6 nodes): `ModerationController`, `.createReport()`, `.getAuditLogs()`, `.handleReportAction()`, `.listReports()`, `.suspendUser()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (6 nodes): `createMediaSession()`, `MockMediaSession`, `.flipCamera()`, `.toggleMute()`, `.toggleVideo()`, `media.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (5 nodes): `NavigationAuthGuard()`, `RootLayout()`, `layout.tsx`, `_layout.tsx`, `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (5 nodes): `page.tsx`, `page.tsx`, `load()`, `loadScholar()`, `toggleFollow()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (4 nodes): `page.tsx`, `page.tsx`, `handleRequestCode()`, `handleResetPassword()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (4 nodes): `MediaService`, `.completeUpload()`, `.generateUploadUrl()`, `.getReviewerCredentialUrl()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (3 nodes): `page.tsx`, `fetchReports()`, `handleResolve()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (3 nodes): `page.tsx`, `fetchQueue()`, `handleDecision()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (3 nodes): `AppPage()`, `page.tsx`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (3 nodes): `page.tsx`, `page.tsx`, `ConductPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AuthService` connect `Community 3` to `Community 2`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `AuthController` connect `Community 5` to `Community 2`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `ContentController` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `createAndSendNotification()` (e.g. with `.sendSecurityAlert()` and `.likePost()`) actually correct?**
  _`createAndSendNotification()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
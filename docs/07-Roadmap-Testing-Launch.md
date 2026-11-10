# Sanad: Roadmap, Testing and Launch Plan

## 1. Roadmap
| Phase | Scope | Duration |
|---|---|---|
| 0 Discovery | Lock audience, policy, verification authorities, branding | 1-2 wks |
| 1 Foundation | Monorepo, auth, RBAC, user profiles, CI | 3 wks |
| 2 Verification | Applications, moderator queue, badge, audit log | 2-3 wks |
| 3 Content | Upload, Reels feed, likes, comments, follow | 4 wks |
| 4 Realtime | Chat requests, messaging, push | 3 wks |
| 5 Live and Calls | LiveKit streaming, video calls | 4 wks |
| 6 Safety | Reports, blocks, moderation tools, i18n/RTL | 3 wks |
| 7 Hardening | Pen test, load test, store assets | 2-3 wks |
| 8 Beta and Launch | TestFlight/Play internal, invited scholars, staged release | 3 wks |

MVP cut (≈ phases 1-3 + 6 basics): auth, verification, scholar video posting, feed, report/block.

## 2. Testing Strategy
| Level | Tool | Focus |
|---|---|---|
| Unit | Jest | Services, RBAC middleware, validators |
| API | Supertest | Role matrix: every endpoint × every role |
| Component | React Native Testing Library | Forms, guards |
| E2E | Maestro/Detox | Register → apply → approve → post |
| Load | k6 | Feed, chat sockets, live viewers |
| Security | OWASP ZAP, manual pen test | Auth, uploads, IDOR |
| Device | Real iOS/Android | Camera, live, calls, poor networks |

**Must-pass RBAC tests:** member cannot post · revoked scholar cannot post · moderator cannot approve · scholar cannot edit others' posts · expired token rejected · refresh reuse revokes session.

## 3. Definition of Done
- Code reviewed, tests green, lint/type-check pass
- Role checks verified on backend
- Accessibility and RTL checked
- Docs/API spec updated

## 4. Store Readiness Checklist
- [ ] Privacy policy and terms URLs
- [ ] Content policy and moderation description for reviewers
- [ ] Report/block and in-app account deletion
- [ ] Sign in with Apple (if other social logins)
- [ ] Demo reviewer accounts (member and scholar)
- [ ] Camera, mic, notification permission strings
- [ ] Screenshots, icon, app description
- [ ] Data safety (Play) and privacy nutrition labels (Apple)

## 5. Launch Plan
1. Closed beta with 20-50 verified scholars
2. Seed content before opening to members
3. Staged rollout (10% → 50% → 100%)
4. Monitor crashes, reports, verification queue daily

## 6. Cost Watch (early)
- Biggest drivers: video storage/streaming, live minutes, SMS OTP
- Mitigate: cap video length/resolution, adaptive bitrate, email OTP default, cap live concurrency in beta

## 7. Risks and Decisions Log
| Decision | Status |
|---|---|
| Tradition/region scope | Open |
| Verification authorities | Open |
| Backend: Node vs Django | Proposed Node |
| Chat: Socket.io vs Stream Chat | Proposed Socket.io (Stream if time-limited) |
| Recording of lives | Open |

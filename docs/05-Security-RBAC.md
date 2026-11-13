# Sanad: Security, Authentication, Authorization and RBAC

## 1. Authentication
- Sign-up via email or phone OTP; optional Google/Apple
- Passwords: argon2id (or bcrypt cost 12+), min 10 chars, breach-list check
- Access JWT: 15 min · Refresh token: 30 days, **rotating**, hashed in DB, reuse detection revokes the whole family
- Mobile storage: `expo-secure-store` only
- **2FA (TOTP) mandatory for scholar, moderator, admin**
- Session/device list, logout-all, new-device alerts
- Rate limiting + lockout on repeated failures; CAPTCHA on abuse

## 2. Authorization Model
- **RBAC** for role-level access plus **ownership/ABAC checks** for resources
- Role stored in DB; Access JWT carries standardized claims: `sub` (userId), `roles` (role array), `sessionId` (active session id), and `ver` (permission/token version for instant 60s revocation)
- Sensitive actions re-check DB state (suspension, revoked scholar, session validity)
- Server enforces everything; app only hides UI

## 3. Roles
| Role | Description |
|---|---|
| guest | Unauthenticated, read-only public content |
| member | Registered learner |
| scholar | Verified publisher |
| moderator | Reviews applications and reports |
| admin | Full control, role assignment |

## 4. Permission Matrix
| Permission | Guest | Member | Scholar | Moderator | Admin |
|---|:-:|:-:|:-:|:-:|:-:|
| content:view | YES | YES | YES | YES | YES |
| content:like_comment | NO | YES | YES | YES | YES |
| content:create (video/reel) | NO | NO | YES | NO | YES |
| content:edit_own / delete_own | NO | NO | YES | NO | YES |
| content:remove_any | NO | NO | NO | YES | YES |
| live:host (halaqah) | NO | NO | CUT v1 | NO | CUT v1 |
| live:watch_chat | NO | CUT v1 | CUT v1 | CUT v1 | CUT v1 |
| chat:request | NO | YES | YES | YES | YES |
| chat:accept_initiate | NO | NO | YES | YES | YES |
| call:initiate (1-on-1) | NO | NO | YES | NO | YES |
| call:accept (1-on-1) | NO | YES | YES | YES | YES |
| application:submit | NO | YES | NO | NO | NO |
| application:review | NO | NO | NO | YES | YES |
| application:approve | NO | NO | NO | NO | YES |
| user:suspend | NO | NO | NO | YES | YES |
| role:assign / revoke_scholar | NO | NO | NO | NO | YES |
| audit:view | NO | NO | NO | NO | YES |

## 5. Middleware Pattern
```ts
// route: only scholars can create posts, and 2FA must be enabled
router.post('/posts',
  authenticate,            // verify JWT, load user
  requireRole('scholar'),  // RBAC
  require2FA,              // scholar policy
  validate(postSchema),    // Zod
  createPost
);

// ownership check
const isOwnerOrAdmin = (req, post) =>
  post.authorId === req.user.id || req.user.roles.includes('admin');
```

## 6. Scholar Verification Controls
- Documents in a **private bucket**, accessed by short-lived signed URLs, deleted after the retention window
- Two-step: moderator reviews, admin approves (separation of duties)
- Optional peer endorsement (1-2 verified scholars)
- Verification badge is revocable instantly; revocation invalidates scholar actions on next request
- Periodic re-verification (e.g., yearly)

## 7. Data and Transport Security
- TLS everywhere; HSTS; certificate pinning (optional)
- Encrypt TOTP secrets and PII fields at rest
- Helmet, CORS allow-list, NoSQL injection sanitising, Zod validation
- Signed, expiring upload URLs; file type/size checks; virus scan for documents
- Secrets in a manager (never in repo); rotate keys

## 8. Realtime Security
- Socket auth on connect (JWT); room-level authorisation
- LiveKit tokens: short TTL, scoped grants (publish only for host)
- Host controls: mute, remove, block; viewers cannot publish

## 9. Moderation and Safety
- Report and block on every post, comment, profile, chat
- Auto-flags: keyword lists, rate spikes; human review for sensitive reports
- Suspension, takedown, appeal flow; all logged in `audit_logs`
- Content policy: no hate/sectarian takfir, harassment, impersonation, or misinformation about credentials

## 10. Privacy and Compliance
- Privacy policy, terms, content policy, in-app account deletion
- Data export and deletion on request
- Minimise data; log retention limits
- Age gate (13+/16+ by region)

## 11. Security Checklist (pre-launch)
- [ ] OWASP Mobile Top 10 reviewed
- [ ] Pen test on auth, upload, and role endpoints
- [ ] Dependency audit (`npm audit`, Snyk)
- [ ] Rate limits and lockouts verified
- [ ] Backup and restore tested

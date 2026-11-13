# Sanad: API Specification (v1)

Base URL: `/api/v1` · Auth: `Authorization: Bearer <accessToken>` · Format: JSON  
Error shape: `{ "code": "FORBIDDEN", "message": "...", "details": {} }`

## Auth
| Method | Endpoint | Role | Purpose |
|---|---|---|---|
| POST | /auth/register | public | Create account |
| POST | /auth/verify-otp | public | Verify email/phone |
| POST | /auth/login | public | Returns access + refresh |
| POST | /auth/refresh | public | Rotate refresh token |
| POST | /auth/logout | member+ | Revoke current session |
| POST | /auth/logout-all | member+ | Revoke all sessions |
| POST | /auth/2fa/setup | member+ | Get TOTP secret/QR |
| POST | /auth/2fa/verify | member+ | Enable/verify 2FA |
| DELETE | /users/me | member+ | Delete account |

## Users
| Method | Endpoint | Role |
|---|---|---|
| GET | /users/me | member+ |
| PATCH | /users/me | member+ |
| GET | /users/:id | guest+ |
| POST/DELETE | /users/:id/follow | member+ |
| POST/DELETE | /users/:id/block | member+ |

## Scholar Verification
| Method | Endpoint | Role |
|---|---|---|
| POST | /scholar/applications | member |
| GET | /scholar/applications/me | member |
| POST | /scholar/applications/upload-url | member |
| POST | /scholar/applications/:id/endorse | scholar |
| GET | /admin/applications?status=pending | moderator, admin |
| POST | /admin/applications/:id/decision | moderator (review), admin (approve) |
| POST | /admin/users/:id/revoke-scholar | admin |

## Content
| Method | Endpoint | Role |
|---|---|---|
| GET | /feed?cursor= | guest+ |
| GET | /posts/:id | guest+ |
| POST | /media/upload-url | scholar |
| POST | /media/:id/complete | scholar |
| POST | /posts | scholar |
| PATCH/DELETE | /posts/:id | owner scholar, admin |
| POST/DELETE | /posts/:id/like | member+ |
| GET/POST | /posts/:id/comments | guest+ / member+ |
| POST | /posts/:id/save | member+ |

## Live (Halaqah Broadcast) [CUT from v1 - deferred to v2]
| Method | Endpoint | Role |
|---|---|---|
| POST | /live | [CUT v1] scholar |
| POST | /live/:id/end | [CUT v1] host |
| GET | /live | [CUT v1] guest+ |
| POST | /live/:id/token | [CUT v1] member+ (viewer) |

## Messaging and 1-on-1 Consultations
| Method | Endpoint | Role |
|---|---|---|
| POST | /chat/requests | member |
| POST | /chat/requests/:id/respond | scholar |
| GET | /conversations | member+ |
| GET/POST | /conversations/:id/messages | participant |
| POST | /calls | scholar (or accepted request) |
| POST | /calls/:id/respond | callee |

**Socket events:** `message:new`, `message:read`, `typing`, `presence`, `call:ring`, `notification:new`

## Moderation
| Method | Endpoint | Role |
|---|---|---|
| POST | /reports | member+ |
| GET | /admin/reports | moderator, admin |
| POST | /admin/reports/:id/action | moderator, admin |
| POST | /admin/users/:id/suspend | moderator, admin |
| GET | /admin/audit-logs | admin |

## Conventions
- Cursor pagination: `?cursor=&limit=20`
- Rate limits: auth 5/min/IP, comments 30/min/user, uploads 10/hour/user
- Idempotency-Key header on create endpoints

# 01 — Product Requirements Document (PRD)
**Product:** Sanad | **Version:** 1.0 | **Status:** Draft

## 1. Vision
A trusted social space where **only verified religious scholars publish**, and the community learns, asks, and engages directly with authentic knowledge.

## 2. Problem
- Religious content online is flooded with unverified, self-appointed voices.
- Audiences cannot easily tell who is qualified.
- Scholars lack a dedicated, respectful platform for reels, live sessions, and direct Q&A.

## 3. Goals and Non-Goals
**Goals**
- Verified-only publishing with visible credential badges
- Short video (Reels), long video, live streaming
- Direct chat and video calls (scholar ↔ scholar, scholar ↔ approved member)
- Strong moderation and trust signals

**Non-Goals (v1)**
- Open public posting by non-scholars
- Monetisation, ads, marketplace
- Web app (mobile only in v1)

## 4. Personas
| Persona | Description | Needs |
|---|---|---|
| Scholar | Verified teacher/imam/mufti | Publish, go live, answer questions |
| Member | Learner/follower | Discover, follow, comment, request Q&A |
| Moderator | Trust and safety staff | Review applications and reports |
| Admin | Platform owner | Roles, config, audit, analytics |

## 5. Functional Requirements
| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Register/login via email or phone OTP; optional Google/Apple | P0 |
| FR-02 | Mandatory 2FA for scholars | P0 |
| FR-03 | Scholar application with credential upload | P0 |
| FR-04 | Moderator review, optional peer endorsement, approve/reject | P0 |
| FR-05 | Verified badge on scholar profiles | P0 |
| FR-06 | Scholars post Reels, videos, text posts | P0 |
| FR-07 | Scholars go live; members watch and chat | P1 |
| FR-08 | 1:1 chat (scholar-initiated or approved request) | P0 |
| FR-09 | 1:1 video call (scholar ↔ scholar/approved member) | P1 |
| FR-10 | Members like, comment, follow, save, share | P0 |
| FR-11 | Report content/user; block user | P0 |
| FR-12 | Moderator dashboard: reports, takedowns, suspensions | P0 |
| FR-13 | Push notifications | P1 |
| FR-14 | In-app account deletion | P0 (store requirement) |
| FR-15 | Instant revocation of scholar status | P0 |
| FR-16 | Audit log of role and moderation actions | P0 |

## 6. Non-Functional Requirements
- **Performance:** feed first paint < 2s on mid-range Android; video start < 3s
- **Availability:** 99.5% backend uptime target
- **Security:** OWASP MASVS L1; encrypted transport; secure token storage
- **Scalability:** designed for 100k MAU without re-architecture
- **Accessibility:** WCAG AA contrast, dynamic font sizes, RTL support (Arabic/Urdu)
- **Localisation:** English, Arabic, Urdu (RTL ready from day one)

## 7. Success Metrics
- Scholar application → approval time < 72h
- Report resolution time < 24h
- Day-30 retention > 25%
- Verified scholars onboarded: 100 in first 3 months

## 8. Risks
| Risk | Mitigation |
|---|---|
| Fake credentials | Manual review + peer endorsement + re-verification |
| Sectarian conflict | Clear content policy, fast moderation, report tooling |
| Live/call abuse | Role gating, rate limits, block, recording-consent notice |
| Moderator bias/error | Two-person review on rejections, appeals, audit log |

## 9. Open Questions
- Which tradition(s) and accreditation bodies count as valid credentials?
- Can members DM scholars freely, or only via request?
- Will scholars be allowed paid sessions in a later phase?

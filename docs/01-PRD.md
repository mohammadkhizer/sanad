# Sanad: Product Requirements Document (PRD)

| Field | Value |
|---|---|
| Product | Sanad (Arabic: "chain of authority") |
| Version | 0.1 (Draft) |
| Platforms | iOS, Android (Expo React Native) |
| Owner | Founder / Product Lead |

## 1. Vision
A trusted social platform where **only verified religious scholars publish**, and the community learns, asks, and interacts within safe boundaries.

## 2. Problem
- Religious content online is mixed with unverified, sectarian, or misleading voices.
- Audiences cannot tell who is qualified.
- Scholars lack a dedicated, credibility-first platform.

## 3. Goals and Non-Goals
**Goals**
- Verified-only publishing (video, Reels, live, chat, calls)
- Transparent verification with visible badge
- Safe community interaction with strong moderation

**Non-Goals (v1)**
- Open posting by general users
- Monetisation, ads, donations
- Web app (mobile first)

## 4. Personas
| Persona | Description | Key Need |
|---|---|---|
| Scholar | Verified teacher/imam/academic | Reach audience, credibility |
| Member | Learner/follower | Trusted content, ask questions |
| Guest | Unregistered visitor | Preview content |
| Moderator | Reviews applications and reports | Efficient queue tools |
| Admin | Platform owner | Control, audit, analytics |

## 5. Functional Requirements
| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Register/login via email or phone OTP; Google/Apple optional | P0 |
| FR-02 | Scholar application with credential upload | P0 |
| FR-03 | Moderator review, approve/reject with reason | P0 |
| FR-04 | Scholar-only upload of videos and Reels | P0 |
| FR-05 | Feed (Reels + videos), like, comment, share, save | P0 |
| FR-06 | Follow scholars | P0 |
| FR-07 | Live streaming by scholars with live chat | P1 |
| FR-08 | 1:1 chat (member must request; scholar accepts) | P1 |
| FR-09 | Video calls (scholar-initiated or accepted request) | P1 |
| FR-10 | Report content/user; block user | P0 |
| FR-11 | Push notifications | P1 |
| FR-12 | Scholar peer endorsement | P2 |
| FR-13 | Q&A inbox for scholars | P2 |
| FR-14 | In-app account deletion | P0 |
| FR-15 | Multi-language (EN, AR, UR, HI first) and RTL | P1 |

## 6. Non-Functional Requirements
- **Performance:** feed loads under 2s on 4G; video start under 3s
- **Availability:** 99.5% (v1)
- **Security:** see `05-Security-RBAC.md`
- **Scalability:** 100K MAU at launch, horizontally scalable
- **Accessibility:** WCAG AA contrast, screen-reader labels
- **Compliance:** GDPR-style privacy, App Store and Play UGC rules

## 7. User Flows (summary)
1. **Member:** sign up → browse → follow → comment → request chat
2. **Scholar:** sign up → apply → upload credentials → await review → approved → 2FA setup → post
3. **Moderator:** queue → review documents → approve/reject → audit logged

## 8. Success Metrics
- Scholar application approval turnaround under 72h
- Day-30 retention above 25%
- Report resolution under 24h
- Fake-scholar incidents: 0 confirmed after verification

## 9. Risks
| Risk | Mitigation |
|---|---|
| Fake credentials | Manual review + peer endorsement + revocation |
| Sectarian conflict | Clear content policy, trained moderators |
| Live/video abuse | Report, kick, mute tools; recorded-session retention |
| Moderation cost | Report-triage tooling, community flags |

## 10. Open Questions
- Which tradition(s) and regions at launch?
- Who are the verification authorities (institutions, boards)?
- Are female scholars able to restrict who can DM or call them?
- Will recorded lives be retained, and for how long?

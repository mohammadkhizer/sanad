# Sanad: Documentation Index

> *Sanad* (سند): "chain of authority". A verified-scholars-only social platform.

## Document Set
| # | File | Purpose |
|---|------|---------|
| 01 | `01-PRD.md` | Product requirements: what and why |
| 02 | `02-TRD.md` | Technical requirements: stack, constraints, package manager policy |
| 03 | `03-SDD.md` | System design: architecture, modules, data model, sequences |
| 04 | `04-API-Spec.md` | REST and socket endpoints |
| 05 | `05-Security-RBAC.md` | Authentication, authorization, RBAC, security controls |
| 06 | `06-Design-System.md` | 60:30:10 colours, typography, components |
| 07 | `07-Roadmap-Testing-Launch.md` | Phases, testing, store readiness, launch |
| 08 | `08-Content-Policy.md` | Community rules and moderation |
| 09 | `09-Dev-Setup-npm.md` | Local setup, npm-only workflow |
| 10 | `10-Instructions.md` | Phase-by-phase build instructions with Claude prompts |
| 11 | `11-Checklist.md` | Master checklist with phase gates and Definition of Done |

## Project Constants
- **App name:** Sanad
- **Mobile:** Expo (React Native) + TypeScript, EAS development builds
- **Backend:** Node.js + Express + MongoDB
- **Package manager:** **npm only. pnpm is NOT used** (see TRD §3 and doc 09)
- **Assumption:** primary audience is Islamic scholars (ulama); verification criteria are config-driven so other traditions can be supported.

## Reading Order
PRD → TRD → SDD → Security/RBAC → API → Design → Roadmap → Policy → Dev Setup → Instructions → Checklist

# PadPal v2 — Engineering Workflow

**Version:** 1.0 | **Last Updated:** May 10, 2026  
**Scope:** All development on the `padpal` (frontend) and `palpal-api` (backend) repositories  

---

## Core Principle

> Jira defines **what** to build · Branch defines **isolation** · Commits define **safe, incremental progress**

---

## Reference Files

| File | Purpose |
|------|---------|
| `AUDIT.md` | Full system bottleneck and scalability audit — root causes and fix directions |
| `docs/product/PRD.md` | Product requirements and intended system behavior |
| `WORKFLOW.md` | This file — the development process and conventions |

Always read `AUDIT.md` and `docs/product/PRD.md` before starting any ticket. If a ticket's fix direction conflicts with what is described in either document, update the relevant document first.

---

## STRICT RULES (Never Violate)

- **DO NOT** implement any code changes unless explicitly instructed to work on a specific ticket
- **DO NOT** refactor broadly or "improve things while here"
- **DO NOT** perform unrelated optimizations, cleanups, or fixes
- **DO NOT** bundle changes from multiple tickets into one branch or PR
- **ONLY** work within the scope of the current Jira ticket
- **STOP and WAIT** for explicit greenlight after each PR is opened — do not proceed to the next ticket automatically

---

## Jira Rules

### Project

- **Board:** PadPal (`SCRUM` project key on Atlassian)
- **Ticket reference format in commits/branches:** `SCRUM-XXX`

### Sprints

- Phase 1 tickets (SCRUM-1 through SCRUM-18) are in the **"PadPal V2 - Phase 1"** sprint
- Phase 2 tickets (SCRUM-19 through SCRUM-33) will be in a Phase 2 sprint
- Phase 3 tickets (SCRUM-34 through SCRUM-48) will be in a Phase 3 sprint

### Ticket Requirements

Each Jira ticket must represent **ONE clearly scoped engineering task** — small enough to complete independently. Each ticket includes:

- Title with `[Phase X.Y]` prefix
- Detailed description with problem, root cause, what to do, and acceptance criteria
- Labels: one or more of `frontend` / `backend` / `db` / `api` / `architecture` / `system` / `UX` + severity (`critical` / `high` / `medium` / `low`) + `phase-N`

---

## Branching Strategy

### Branch naming

```
feature/SCRUM-XXX-short-kebab-title
```

Examples:
```
feature/SCRUM-1-enforce-jwt-middleware
feature/SCRUM-4-fix-editprofile-state-current
feature/SCRUM-18-remove-chatroom-base64-artifact
```

### Base branch

All feature branches are cut from **`padpal-v2`**.

```bash
git checkout padpal-v2
git pull origin padpal-v2
git checkout -b feature/SCRUM-XXX-short-title
```

---

## Commit System

### Format

```
<type>(<scope>): <short description> [SCRUM-XXX]
```

### Types

| Type | Use For |
|------|---------|
| `feat` | New functionality |
| `fix` | Bug fix |
| `perf` | Performance improvement |
| `refactor` | Internal cleanup (no behavior change) |
| `chore` | Tooling / infra / config changes |
| `docs` | Documentation only |

### Scopes (examples)

`api` · `auth` · `chat` · `matching` · `db` · `ui` · `build` · `config`

### Examples

```
fix(auth): move setTimeout to useEffect to prevent render loop [SCRUM-5]
fix(db): remove duplicate smokerPreferences key from user schema [SCRUM-8]
chore(config): add .env and .env.* to .gitignore [SCRUM-3]
feat(api): create asyncHandler utility and wrap all route handlers [SCRUM-16]
fix(ui): replace agePreferences.current with agePreferences in editProfile [SCRUM-4]
```

### Commit Rules

- Commits must be **atomic** and **reversible**
- Each commit represents **ONE logical change**
- Do NOT bundle unrelated changes
- Do NOT mix multiple concerns in one commit
- Multiple commits per ticket are expected and encouraged when the work has distinct logical steps

---

## Execution Model (Per Ticket)

Follow this exact sequence for every ticket:

1. **Read the ticket** — understand scope, acceptance criteria, and audit reference
2. **Read relevant source files** — understand the current state before changing anything
3. **Create the feature branch** off `padpal-v2`
4. **Implement only the scoped change** — nothing more
5. **Commit atomically** — one commit per logical change, using the correct format
6. **Push the branch**
7. **Open a PR** into `padpal-v2` using the mandatory PR template below
8. **Update the Jira ticket status** to "In Review"
9. **STOP** — wait for explicit instruction before starting the next ticket

---

## PR Template (Mandatory)

Every PR must include all of the following sections:

```markdown
## Jira Ticket
[SCRUM-XXX](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-XXX)

## Summary

### What this PR changes
<!-- One sentence -->

### Why this change is needed
- **Problem being solved:** <!-- What was broken or unsafe -->
- **Why it matters at scale:** <!-- Impact with real users -->

### What changed
- <!-- bullet list of specific changes -->

## How to Test
<!-- Step-by-step instructions to validate the fix -->

## Risk Level
<!-- Low / Medium / High + explanation -->

## Performance / Scalability Impact
<!-- If applicable: before vs. after, or "No impact" -->

## Acceptance Criteria
- [ ] Matches Jira ticket scope exactly
- [ ] No unrelated changes included
- [ ] No regressions introduced
- [ ] Acceptance criteria from the Jira ticket are all met
```

---

## Priority Override — Phase 0 Product Launch (ACTIVE)

**Status:** Highest priority · **Effective:** June 8, 2026  
**Plan:** `docs/product/plans/2026-06-08-design-system-rooms-roadmap.md`

The **Phase 0** initiative (design system, marketing MVP, Rooms feature) **takes precedence over all Phase 1–3 audit tickets** until the marketing milestone (SCRUM-62) and Rooms epic (SCRUM-84) are complete.

| Rule | Detail |
|------|--------|
| Work Phase 0 first | SCRUM-49–62, 66, 68–89 unless explicitly told otherwise |
| Security exception | SCRUM-1, SCRUM-2, SCRUM-3 still run in parallel — required before public beta |
| Reserved numbers | SCRUM-63, SCRUM-64, SCRUM-65, SCRUM-67 — Capacitor (separate track) |
| Deferred | SCRUM-4–48 unless a ticket blocks marketing flows or Rooms |
| Sprint name | **"PadPal V2 - Phase 0 Product Launch"** |

### Phase 0 — Product Launch (SCRUM-49+)

| Epic | SCRUM | Scope |
|------|-------|-------|
| Design System v2 | SCRUM-49 (epic), 50–55 | Tokens, SwipeCard, FeedStack, MatchOverlay, BottomNavBar |
| Marketing MVP | SCRUM-56 (epic), 57–62, 66 | App shell, sign-in, slim onboarding, Home feed, chat, profile — **record videos at SCRUM-62** |
| Rooms Backend | SCRUM-68 (epic), 69–76 | Listing models, APIs, group chat (`palpal-api`) |
| Rooms Frontend | SCRUM-77 (epic), 78–84 | Mode entry, wizard, feeds, invites, group chat, lifecycle |
| Safety & Polish | SCRUM-85 (epic), 86–89 | Report/block, image moderation, T&C, empty states |

---

## Phase Reference

### Phase 1 — Critical Fixes (SCRUM-1 to SCRUM-18)
Correctness and security blockers. The system must NOT be opened to real users until all Phase 1 tickets are complete.

| SCRUM-# | Summary | Severity |
|---------|---------|----------|
| SCRUM-1 | Enforce JWT authentication middleware on all API routes | critical |
| SCRUM-2 | Fix mass-assignment vulnerability in POST /auth/survey | critical |
| SCRUM-3 | Add .env to .gitignore and rotate committed secrets | critical |
| SCRUM-4 | Fix editProfile update payload reading .current from useState | critical |
| SCRUM-5 | Fix signIn setTimeout firing on every render | critical |
| SCRUM-6 | Replace deprecated bcrypt-nodejs with bcryptjs | high |
| SCRUM-7 | Fix expectedMoveOut type inconsistency | high |
| SCRUM-8 | Fix smokerPreferences duplicate key in userModels.js | high |
| SCRUM-9 | Fix DELETE /auth/logout undefined variable ReferenceError | medium |
| SCRUM-10 | Fix POST /auth/register to issue real refresh token | high |
| SCRUM-11 | Add rate limiting to auth routes; reduce JSON body limit | high |
| SCRUM-12 | Fix viewProfile passing single user object as users map | high |
| SCRUM-13 | Fix handleKeyPress stale closure and multiple listeners | high |
| SCRUM-14 | Fix duplicate question id:19 in survey/questions.js | medium |
| SCRUM-15 | Fix isLastItem bug in chatRoom (SortedMessages.length) | medium |
| SCRUM-16 | Add asyncHandler wrapper to all Express route handlers | high |
| SCRUM-17 | Apply Joi validation to POST /auth/register and login | high |
| SCRUM-18 | Remove dead base64 image artifact from chatRoom/index.jsx | high |

### Phase 2 — Scaling Improvements (SCRUM-19 to SCRUM-33)
Performance and architectural issues that become blockers as user count grows.

| SCRUM-# | Summary | Severity |
|---------|---------|----------|
| SCRUM-19 | Migrate images from MongoDB base64 to object storage | critical |
| SCRUM-20 | Add database indexes to all hot query paths | critical |
| SCRUM-21 | Fix N+1 query in POST /feed/ with aggregation pipeline | critical |
| SCRUM-22 | Add Redis caching for feed results | critical |
| SCRUM-23 | Create centralized frontend API client module | high |
| SCRUM-24 | Add cursor-based message pagination to chat | critical |
| SCRUM-25 | Replace chat HTTP polling with WebSockets (Socket.io) | critical |
| SCRUM-26 | Implement route-level code splitting (React.lazy) | high |
| SCRUM-27 | Remove unused dependencies, consolidate MUI | medium |
| SCRUM-28 | Resolve dual build pipeline — commit to Webpack 5 | high |
| SCRUM-29 | Add client-side data caching with TanStack React Query | high |
| SCRUM-30 | Move facial verification to backend CV service | high |
| SCRUM-31 | Replace window.location with React Router useNavigate | high |
| SCRUM-32 | Add React.memo and useCallback to feed card stack | high |
| SCRUM-33 | Create useWindowWidth hook; remove inline window.innerWidth | medium |

### Phase 3 — Production Hardening (SCRUM-34 to SCRUM-48)
Observability, UX completeness, resilience, and long-term reliability.

| SCRUM-# | Summary | Severity |
|---------|---------|----------|
| SCRUM-34 | Add structured logging with pino | high |
| SCRUM-35 | Add Sentry error tracking (frontend + backend) | high |
| SCRUM-36 | Add comprehensive rate limiting to all API routes | high |
| SCRUM-37 | Add email verification on registration | high |
| SCRUM-38 | Add password reset flow (forgot password) | high |
| SCRUM-39 | Add onboarding survey progress persistence | high |
| SCRUM-40 | Upgrade backend hosting; add health check endpoint | high |
| SCRUM-41 | Add push notifications (Web Push / FCM) | high |
| SCRUM-42 | Store JWT in HttpOnly cookie server-side | high |
| SCRUM-43 | Add account deletion with full data purge | medium |
| SCRUM-44 | Add empty states and error states across all pages | medium |
| SCRUM-45 | Replace CRA default metadata in manifest.json / index.html | low |
| SCRUM-46 | Add ARIA labels and keyboard accessibility audit | medium |
| SCRUM-47 | Remove console.log from production builds + ESLint rule | medium |
| SCRUM-48 | Add TTL indexes on match records; chat archival strategy | medium |

---

## PRD Update Rule

If during any ticket you discover:
- Missing requirements
- Unclear product behavior
- Incorrect assumptions in the codebase

You **MUST** update `docs/product/PRD.md` to reflect the correct system understanding before or alongside the code change.

---

*End of workflow document.*

# PadPal v2 Product Launch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a polished, marketable PadPal v2 (redesigned UI + Rooms vacancy feature) with minimal rework by building a shared design system first, then hero marketing flows, then Rooms on the new component stack.

**Architecture:** Design tokens and shared primitives (`SwipeCard`, `FeedStack`, `BottomNavBar`, `MatchOverlay`) are built once. Home feed and Rooms feeds are variants. Backend listing APIs run in parallel with frontend design-system work. Capacitor tickets (SCRUM-63–67) remain a separate track.

**Tech Stack:** React 18 · MUI + Tailwind CSS variables · Framer Motion · Express/MongoDB (`palpal-api`) · Socket.io (existing)

**Priority:** **HIGHEST — takes precedence over Phase 1–3 audit tickets** except SCRUM-1–3 (auth middleware, mass-assignment, secrets), which must still land before any public beta. All other SCRUM-4–48 work is deferred until this plan's marketing milestone (SCRUM-62) is complete.

**Spec references:**
- `docs/product/PRD.md`
- `docs/product/specs/2026-06-08-vacancy-listings-design.md`

**Reserved ticket numbers:** SCRUM-63, SCRUM-64, SCRUM-65, SCRUM-67 (Capacitor epic — do not reassign)

---

## Ticket Dependency Graph

```
SCRUM-49 (Epic: Design System)
  ├─ SCRUM-50 Tokens ─────────────────────────────┐
  ├─ SCRUM-51 Form primitives (needs 50)          │
  ├─ SCRUM-52 SwipeCard (needs 50)                │
  ├─ SCRUM-53 FeedStack (needs 52)                │
  ├─ SCRUM-54 MatchOverlay (needs 50)             │
  └─ SCRUM-55 BottomNavBar (needs 50)             │
                                                   ▼
SCRUM-56 (Epic: Marketing MVP)          SCRUM-68 (Epic: Rooms Backend) ← start Day 1, no FE dep
  ├─ SCRUM-57 AppShell (needs 55)                 ├─ SCRUM-69 User model ext
  ├─ SCRUM-58 Sign-in (needs 51, 57)              ├─ SCRUM-70 Listing models
  ├─ SCRUM-59 Slim onboarding (needs 51, 58)      ├─ SCRUM-71 Listing CRUD
  ├─ SCRUM-60 Home feed (needs 52, 53, 57)        ├─ SCRUM-72 Invite APIs
  ├─ SCRUM-61 Match flow (needs 54, 60)           ├─ SCRUM-73 Creator feed API
  ├─ SCRUM-62 Chat redesign (needs 57)            ├─ SCRUM-74 Seeker feed API
  └─ SCRUM-66 Profile view (needs 57)             ├─ SCRUM-75 Swipe + match
         │                                         └─ SCRUM-76 Group chat
         ▼ MARKETING MILESTONE — start screen recording
SCRUM-77 (Epic: Rooms Frontend) — needs SCRUM-57 + SCRUM-52 + SCRUM-76
  ├─ SCRUM-78 Rooms entry
  ├─ SCRUM-79 Listing wizard
  ├─ SCRUM-80 Creator feed
  ├─ SCRUM-81 Seeker feed + ListingCard
  ├─ SCRUM-82 Co-tenant invites UI
  ├─ SCRUM-83 Group chat UI
  └─ SCRUM-84 Lifecycle (archive, reactivation, mode switch)

SCRUM-85 (Epic: Safety & Polish) — post-Rooms or parallel low-priority within epic
  ├─ SCRUM-86 Report/block
  ├─ SCRUM-87 Image moderation
  ├─ SCRUM-88 Terms & Conditions
  └─ SCRUM-89 Empty states
```

---

## Recommended Execution Order (Sprint 1–4)

| Sprint | Focus | Tickets | Outcome |
|--------|-------|---------|---------|
| **Sprint 1** | Foundation | SCRUM-50→55 (FE) + SCRUM-69→71 (BE) | Design system + listing models live |
| **Sprint 2** | Marketing MVP | SCRUM-57→62, 66 (FE) + SCRUM-72→76 (BE) | **Record marketing videos** |
| **Sprint 3** | Rooms UI | SCRUM-78→84 | Full Rooms feature on new design |
| **Sprint 4** | Beta depth | SCRUM-85→89 | Safety, T&C, empty states |

---

## Epic SCRUM-49 — Design System v2

**Labels:** `frontend`, `UX`, `critical`, `phase-0`, `design-system`  
**Priority:** Highest

---

### SCRUM-50 — [Phase 0.1] Design token sheet and global CSS variables

**Priority:** Highest · **Blocks:** SCRUM-51, 52, 54, 55

**Problem:** Styling is scattered across page-level CSS (`src/index.css`, per-page `styles.css`) with ad-hoc values. Redesign and Rooms will diverge without a single source of truth.

**What to do:**
- Create `src/design/tokens.css` (or extend `src/index.css` `:root`) with finalized mockup values: colors, typography scale, spacing, radii, shadows, z-index layers
- Map existing CSS variables (`--theme-primary-color`, font families) to new token names; keep backward-compat aliases during migration
- Document tokens in `src/design/README.md` (one-page reference for agents)

**Files:**
- Create: `src/design/tokens.css`, `src/design/README.md`
- Modify: `src/index.css` (import tokens), `src/index.js` (ensure import order)

**Acceptance criteria:**
- [ ] All new components in SCRUM-51+ import tokens only — no hardcoded hex in new code
- [ ] DM Serif Display + Inter applied via token variables
- [ ] Safe-area insets preserved for Capacitor (`--safe-area-*`)

---

### SCRUM-51 — [Phase 0.1] Form primitives (PrimaryButton, FormField, TextInput)

**Priority:** Highest · **Depends on:** SCRUM-50

**Problem:** Auth, onboarding, and listing wizard all need consistent form UI. Building per-page duplicates work.

**What to do:**
- Create `src/components/ui/PrimaryButton.jsx` — primary, secondary, ghost variants
- Create `src/components/ui/FormField.jsx` — label, error, helper text wrapper
- Create `src/components/ui/TextInput.jsx` — styled input using tokens
- No business logic; presentational only

**Files:**
- Create: `src/components/ui/PrimaryButton.jsx`, `FormField.jsx`, `TextInput.jsx`, `src/components/ui/index.js` barrel

**Acceptance criteria:**
- [ ] Buttons match mockup states: default, hover, disabled, loading
- [ ] FormField shows validation error state
- [ ] Components use design tokens exclusively

---

### SCRUM-52 — [Phase 0.1] SwipeCard primitive (extract from UserCard)

**Priority:** Highest · **Depends on:** SCRUM-50

**Problem:** `src/pages/feed/components/UserCard/index.jsx` couples swipe physics, user data rendering, and API calls. Rooms needs a listing card variant — extract the swipe shell first.

**What to do:**
- Create `src/components/swipe/SwipeCard.jsx` — Framer Motion drag, like/pass overlays, `children` slot for card content
- Create `src/components/swipe/useSwipeGesture.js` — motion values, threshold, `onSwipeLeft`/`onSwipeRight` callbacks
- Refactor `UserCard` to compose `SwipeCard` + `UserCardContent` (content extraction only — wire-up completed in SCRUM-60)

**Files:**
- Create: `src/components/swipe/SwipeCard.jsx`, `useSwipeGesture.js`
- Modify: `src/pages/feed/components/UserCard/index.jsx` (partial — shell extraction)

**Acceptance criteria:**
- [ ] SwipeCard accepts `children` and fires callbacks at threshold
- [ ] Like/pass stamp overlays match mockup
- [ ] Existing UserCard behavior unchanged until SCRUM-60

---

### SCRUM-53 — [Phase 0.1] FeedStack container

**Priority:** Highest · **Depends on:** SCRUM-52

**Problem:** Feed pages need a consistent layout: safe-area padding, card stack positioning, empty/loading slots.

**What to do:**
- Create `src/components/feed/FeedStack.jsx` — renders stacked `SwipeCard` children, loading spinner, empty state slot
- Props: `cards[]`, `renderCard`, `onSwipeLeft`, `onSwipeRight`, `isLoading`, `emptyState`

**Files:**
- Create: `src/components/feed/FeedStack.jsx`

**Acceptance criteria:**
- [ ] FeedStack centers card with mockup dimensions
- [ ] Supports single-card and stack-of-two visual (top card active)
- [ ] Loading and empty slots render without layout shift

---

### SCRUM-54 — [Phase 0.1] MatchOverlay component

**Priority:** Highest · **Depends on:** SCRUM-50

**Problem:** Match moment is a key marketing shot — needs a dedicated, reusable overlay.

**What to do:**
- Create `src/components/match/MatchOverlay.jsx` — full-screen or modal overlay with animation (scale/fade), matched entity preview, "Send a message" CTA
- Props: `open`, `onClose`, `matchedUser` (or generic `matchedEntity`), `onChat`

**Files:**
- Create: `src/components/match/MatchOverlay.jsx`, `src/components/match/MatchOverlay.css`

**Acceptance criteria:**
- [ ] Overlay animates in on match (Framer Motion or CSS)
- [ ] CTA navigates to chat via callback (no hardcoded routes)
- [ ] Works for user↔user matches (listing variant added in SCRUM-80/81)

---

### SCRUM-55 — [Phase 0.1] BottomNavBar (Home / Rooms / Chat / Profile)

**Priority:** Highest · **Depends on:** SCRUM-50

**Problem:** Current `src/components/navBar/index.jsx` is a top bar with Feed/Chat toggle — mockups use bottom nav with four tabs including Rooms placeholder.

**What to do:**
- Create `src/components/nav/BottomNavBar.jsx` — four tabs per spec: Home, Rooms, Chat, Profile
- Active state styling from tokens; safe-area bottom padding
- Rooms tab routes to `/rooms` (placeholder ok until SCRUM-78)
- Deprecate old top NavBar usage in SCRUM-57

**Files:**
- Create: `src/components/nav/BottomNavBar.jsx`, `styles.css`
- Reference (replace in 57): `src/components/navBar/index.jsx`

**Acceptance criteria:**
- [ ] Four tabs with icons + labels per mockup
- [ ] Active route highlighted
- [ ] `padding-bottom: env(safe-area-inset-bottom)` applied

---

## Epic SCRUM-56 — UI Shell & Marketing MVP

**Labels:** `frontend`, `UX`, `critical`, `phase-0`, `marketing`  
**Priority:** Highest  
**Milestone:** Complete SCRUM-62 → **start screen recording**

---

### SCRUM-57 — [Phase 0.2] AppShell layout (nav + routed content area)

**Priority:** Highest · **Depends on:** SCRUM-55

**What to do:**
- Create `src/layouts/AppShell.jsx` — `BottomNavBar` + `<Outlet />` or children; hides nav on auth routes (`/`, `/signIn`, `/survey`)
- Update `src/App.js` routes: wrap authenticated routes in AppShell
- Add route stubs: `/home` or keep `/feed` as Home, `/rooms`, `/chat`, `/profile`

**Files:**
- Create: `src/layouts/AppShell.jsx`
- Modify: `src/App.js`, `src/navigation.js` (route constants)

**Acceptance criteria:**
- [ ] Authenticated pages show bottom nav; sign-in does not
- [ ] Nav selection syncs with `react-router` location
- [ ] Capacitor safe areas respected on shell

---

### SCRUM-58 — [Phase 0.2] Sign-in page redesign

**Priority:** Highest · **Depends on:** SCRUM-51, SCRUM-57

**What to do:**
- Redesign `src/pages/signIn/index.jsx` and `styles.css` using Form primitives and tokens
- Add T&C link placeholder (full page in SCRUM-88): "By signing up, you agree to our Terms and Conditions"
- Preserve existing auth API calls (`apiFetch` register/login)

**Files:**
- Modify: `src/pages/signIn/index.jsx`, `src/pages/signIn/styles.css`

**Acceptance criteria:**
- [ ] Visual match to mockup (gradient, typography, form layout)
- [ ] Register + login flows still work
- [ ] T&C link present (can 404 until SCRUM-88)

---

### SCRUM-59 — [Phase 0.2] Slim onboarding (required fields only)

**Priority:** Highest · **Depends on:** SCRUM-51, SCRUM-58

**Problem:** 16-step survey causes burnout. Spec requires only core fields at signup.

**What to do:**
- Create `src/pages/onboarding/index.jsx` — multi-step or single-page form: age, age prefs, city, budget, gender, gender prefs, `@username`, phone
- On submit: `POST /auth/survey` (or new endpoint) with only required fields; lifestyle fields optional in Settings later
- Redirect to Home feed on completion
- Keep old `src/pages/survey/` for reference but bypass for new signups

**Files:**
- Create: `src/pages/onboarding/index.jsx`, `styles.css`
- Modify: `src/App.js` (route), sign-in redirect logic
- Backend (palpal-api): relax survey validation if needed — coordinate with SCRUM-69

**Acceptance criteria:**
- [ ] New user completes onboarding in ≤8 fields
- [ ] `@username` uniqueness enforced (backend)
- [ ] Phone collected for future SMS invites
- [ ] User lands on Home feed after completion

---

### SCRUM-60 — [Phase 0.2] Home feed on new SwipeCard + FeedStack

**Priority:** Highest · **Depends on:** SCRUM-52, SCRUM-53, SCRUM-57

**What to do:**
- Migrate `src/pages/feed/index.jsx` to use `FeedStack` + refactored `UserCard`/`SwipeCard`
- Apply new background, spacing, tokens from mockup
- Preserve existing feed API (`POST /feed/`) and swipe save logic

**Files:**
- Modify: `src/pages/feed/index.jsx`, `src/pages/feed/styles.css`, `src/pages/feed/components/UserCard/index.jsx`

**Acceptance criteria:**
- [ ] Swipe left/right behavior identical to pre-migration
- [ ] Visual match to mockup Home feed
- [ ] Compatibility badge section styled (existing data)

---

### SCRUM-61 — [Phase 0.2] Match flow integration (Home feed)

**Priority:** Highest · **Depends on:** SCRUM-54, SCRUM-60

**What to do:**
- Wire `MatchOverlay` to existing match detection in feed (after mutual swipe API response)
- Navigate to chat on CTA

**Files:**
- Modify: `src/pages/feed/index.jsx`, `src/components/match/MatchOverlay.jsx`

**Acceptance criteria:**
- [ ] Match overlay appears on mutual like
- [ ] "Send a message" opens correct chat thread
- [ ] Overlay dismissible

---

### SCRUM-62 — [Phase 0.2] Chat list + chat room redesign

**Priority:** Highest · **Depends on:** SCRUM-57

**What to do:**
- Redesign `src/pages/chat/index.jsx`, `chatPreview`, `chatRoom` with tokens and new list item styling
- Preserve Socket.io / `apiFetch` message flows (`src/api/socket.js`)
- Group chat styling deferred to SCRUM-83 — 1:1 only here

**Files:**
- Modify: `src/pages/chat/index.jsx`, `src/pages/chat/components/chatPreview/`, `src/pages/chat/components/chatRoom/`

**Acceptance criteria:**
- [ ] Chat list and room match mockup
- [ ] Send/receive messages works (existing socket)
- [ ] **MARKETING MILESTONE:** sign-up → swipe → match → chat is screen-record ready

---

### SCRUM-66 — [Phase 0.2] Profile view redesign

**Priority:** High · **Depends on:** SCRUM-57

**What to do:**
- Redesign `src/pages/viewProfile/index.jsx` with tokens; fix SCRUM-12 bug (`users` map) if still present
- Link to edit profile

**Files:**
- Modify: `src/pages/viewProfile/index.jsx`

**Acceptance criteria:**
- [ ] Profile card matches mockup
- [ ] Own vs other-user profile states correct

---

## Epic SCRUM-68 — Rooms Backend (`palpal-api`)

**Labels:** `backend`, `api`, `db`, `critical`, `phase-0`, `rooms`  
**Priority:** Highest · **Start Day 1** (parallel with design system)

---

### SCRUM-69 — [Phase 0.3] Extend User model (username, phone, roomsMode, lastActiveAt)

**Depends on:** nothing

**What to do:**
- Add fields per spec: `username` (unique, indexed), `phone`, `roomsMode: null|'creator'|'seeker'`, `lastActiveAt`
- Update register/survey endpoints for slim onboarding fields
- Joi validation for new fields

**Acceptance criteria:**
- [ ] `username` unique constraint enforced
- [ ] `lastActiveAt` updated on login
- [ ] `roomsMode` nullable default

---

### SCRUM-70 — [Phase 0.3] Listing and ListingInvite models

**Depends on:** SCRUM-69

**What to do:**
- Create `listingModels.js` and `listingInviteModels.js` per spec §12
- Indexes: `addressNormalized` + `status` for dedup; `listingId` on invites

**Acceptance criteria:**
- [ ] Listing statuses: `DRAFT`, `LIVE`, `ARCHIVED`
- [ ] `tenants[]` with `userId`, `status: pending|accepted`, `joinedAt`
- [ ] ListingInvite links listing, inviter, invitee contact, status

---

### SCRUM-71 — [Phase 0.3] Listing CRUD + draft save + go-live gate

**Depends on:** SCRUM-70

**API routes:**
- `POST /listings/create` — creates DRAFT
- `PUT /listings/:id` — partial update (draft save any step)
- `POST /listings/:id/publish` — validates go-live gate (all required fields + creator + ≥1 accepted tenant)
- `POST /listings/:id/archive`

**Acceptance criteria:**
- [ ] Draft save at any wizard step
- [ ] Publish fails with clear errors if gate not met
- [ ] One LIVE listing per `addressNormalized`; duplicate returns join prompt payload

---

### SCRUM-72 — [Phase 0.3] Listing invite APIs

**Depends on:** SCRUM-71

**API routes:**
- `POST /listings/:id/invite` — by `@username`, phone (SMS), or email
- `POST /listings/invites/:id/accept|decline`
- `DELETE /listings/:id/tenants/:userId` — remove tenant with notification hook (stub ok)

**Acceptance criteria:**
- [ ] Invite creates ListingInvite record
- [ ] Accept adds user to `tenants[]` as accepted
- [ ] Pending tenants cannot swipe (enforced in feed APIs)

---

### SCRUM-73 — [Phase 0.3] Creator feed API (listing → user candidates)

**Depends on:** SCRUM-71

**API:** `POST /listings/candidates` — returns ranked seekers for listing tenants; hard filters per spec §9; excludes already-swiped per tenant

**Acceptance criteria:**
- [ ] Only accepted tenants on LIVE listing can call
- [ ] Per-tenant swipe history stored separately
- [ ] Compatibility score + badge traits in response

---

### SCRUM-74 — [Phase 0.3] Seeker feed API (user → listings)

**Depends on:** SCRUM-71

**API:** `POST /listings/feed` — returns ranked LIVE listings for seeker; hard filters; excludes swiped listings

**Acceptance criteria:**
- [ ] Only users with `roomsMode: 'seeker'` (or appropriate gate)
- [ ] Public card payload: neighborhood + city only — never full address
- [ ] Badge traits included

---

### SCRUM-75 — [Phase 0.3] Listing swipe + match logic

**Depends on:** SCRUM-73, SCRUM-74

**API routes:**
- `POST /match/saveListingSwipe` — tenant or seeker swipe
- `POST /match/getListingMatch` — check mutual

**Rules (beta):**
- Per-tenant pass: only hides from that tenant's feed
- Match: any tenant right + seeker right → create match
- Unlimited concurrent listing matches until archived

**Acceptance criteria:**
- [ ] Match record has `type: 'listing'`, `listingId`, `seekerId`, `triggeringTenantId`
- [ ] Pass does not block other tenants from seeing candidate

---

### SCRUM-76 — [Phase 0.3] Group chat extension

**Depends on:** SCRUM-75

**What to do:**
- Extend `Chat` model: `type: 'direct'|'group'`, `participants[]`, `listingId?`
- On listing match: auto-create group chat with seeker + all accepted tenants
- Extend socket events for group rooms

**Acceptance criteria:**
- [ ] Group chat created atomically with match
- [ ] All accepted tenants + seeker are participants
- [ ] Existing 1:1 chats unaffected

---

## Epic SCRUM-77 — Rooms Frontend

**Labels:** `frontend`, `UX`, `critical`, `phase-0`, `rooms`  
**Priority:** Highest · **Depends on:** SCRUM-57, SCRUM-52, SCRUM-76

---

### SCRUM-78 — [Phase 0.4] Rooms mode entry screen

**What to do:**
- Create `src/pages/rooms/index.jsx` — first-visit entry: "I have a vacancy" / "I want to fill a vacancy"
- Persist choice to `roomsMode` via API; confirmation on switch from Settings later (SCRUM-84)
- Route: `/rooms`

**Acceptance criteria:**
- [ ] First visit shows entry; return visit routes to active feed
- [ ] Modes mutually exclusive

---

### SCRUM-79 — [Phase 0.4] Listing creation wizard

**Depends on:** SCRUM-71, SCRUM-51

**What to do:**
- Create `src/pages/rooms/createListing/` — 5 steps per spec §5 with draft save on each step
- Use Form primitives; call listing CRUD APIs

**Acceptance criteria:**
- [ ] All 5 steps implemented with back/next
- [ ] Draft persists on leave and return
- [ ] Publish blocked until go-live gate met (show inline checklist)

---

### SCRUM-80 — [Phase 0.4] Creator feed (listing → user)

**Depends on:** SCRUM-73, SCRUM-53

**What to do:**
- Create `src/pages/rooms/creatorFeed/` — FeedStack of seeker UserCards
- Per-tenant swipe state; show which listing tenant is swiping if multiple

**Acceptance criteria:**
- [ ] Swipe saves via `saveListingSwipe`
- [ ] MatchOverlay on mutual match (seeker variant)
- [ ] Empty state when no candidates

---

### SCRUM-81 — [Phase 0.4] Seeker feed + ListingCard variant

**Depends on:** SCRUM-74, SCRUM-52

**What to do:**
- Create `src/components/swipe/ListingCardContent.jsx` — photos, neighborhood, rent, tenants, compatibility badge
- Create `src/pages/rooms/seekerFeed/` — FeedStack of listing cards

**Acceptance criteria:**
- [ ] Listing card scrollable like UserCard
- [ ] Badge copy: "You and one or more roommates like: …"
- [ ] No full address displayed

---

### SCRUM-82 — [Phase 0.4] Co-tenant invite UI + in-app banner

**Depends on:** SCRUM-72

**What to do:**
- Invite step in wizard (SCRUM-79) + pending invite banner on Home/Profile
- Accept/decline flow for incoming invites

**Acceptance criteria:**
- [ ] SMS/email invite triggers backend (deep link stub ok for beta)
- [ ] In-app banner shows pending invites
- [ ] Accept adds user to listing tenants

---

### SCRUM-83 — [Phase 0.4] Group chat UI

**Depends on:** SCRUM-76, SCRUM-62

**What to do:**
- Extend chat list to show group threads (listing name + participant count)
- Chat room shows multiple avatars; messages from all participants

**Acceptance criteria:**
- [ ] Group threads listed in chat tab
- [ ] Real-time messages via existing socket
- [ ] Listing context visible in header

---

### SCRUM-84 — [Phase 0.4] Listing lifecycle UI

**Depends on:** SCRUM-71

**What to do:**
- "Vacancy filled" archive button on listing management
- Depop-style reactivation popup on login after `lastActiveAt` inactivity
- Mode switch in Settings with confirmation + archive/transfer rules

**Acceptance criteria:**
- [ ] Manual archive works
- [ ] Reactivation popup on login after 2–3 week inactivity (configurable)
- [ ] Mode switch shows confirmation and executes transfer/archive rules

---

## Epic SCRUM-85 — Safety & Beta Polish

**Labels:** `frontend`, `backend`, `high`, `phase-0`  
**Priority:** High (after SCRUM-84 or parallel if capacity)

---

### SCRUM-86 — [Phase 0.5] Report and block UI

Report/block on user cards, listing cards, and chat. Backend report endpoint.

### SCRUM-87 — [Phase 0.5] Image moderation on upload

Google Cloud Vision SafeSearch or AWS Rekognition on profile and listing photo upload; reject with user-friendly error.

### SCRUM-88 — [Phase 0.5] Terms and Conditions page

Static page at `/terms`; link from sign-in (SCRUM-58); fair-housing language placeholder.

### SCRUM-89 — [Phase 0.5] Empty states across all feeds

Per spec §13: no listings in city, no candidates, no matches — with CTAs.

---

## Jira Ticket Template (copy per ticket)

```
Title: [Phase 0.X] <short title>
Epic Link: SCRUM-49 | SCRUM-56 | SCRUM-68 | SCRUM-77 | SCRUM-85
Priority: Highest (or High for SCRUM-66, 85–89)
Labels: frontend, phase-0, <epic-label>
Blocked by: SCRUM-XX (if any)

Description:
## Problem
<why this ticket exists>

## What to do
<bullet list of concrete work>

## Files (padpal / palpal-api)
<paths>

## Acceptance criteria
- [ ] ...
- [ ] ...

## References
- docs/product/plans/2026-06-08-design-system-rooms-roadmap.md
- docs/product/specs/2026-06-08-vacancy-listings-design.md
```

---

## What is explicitly deferred

Until SCRUM-89 is complete, **do not start** these unless a blocking bug:

- Phase 2 scaling (SCRUM-19–33) except SCRUM-23/25 if already in progress
- Phase 3 hardening (SCRUM-34–48)
- Capacitor polish (SCRUM-64, 67) — unless needed for recording on device
- Phase 1 tickets SCRUM-4–18 — pick up only if they break marketing flows

**Exception — always parallel:** SCRUM-1, SCRUM-2, SCRUM-3 (security) must not be skipped for public beta.

---

## Marketing recording checklist (after SCRUM-62)

- [ ] Sign up with slim onboarding (clean UI)
- [ ] Home feed swipe (smooth animations)
- [ ] Match overlay (hero moment)
- [ ] Open chat and send message
- [ ] Profile view quick cut
- [ ] Optional teaser: Rooms tab → "Coming soon" or partial SCRUM-78

Second video wave after SCRUM-84: full Rooms creator + seeker demo.

---

*Plan version 1.0 | June 8, 2026*

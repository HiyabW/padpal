# FeedStack Container (SCRUM-77) — Design Spec

**Version 1.0 | June 10, 2026**  
**Status:** Approved  
**Jira:** [SCRUM-77](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-77) · Epic [SCRUM-72](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-72)  
**Depends on:** [SCRUM-76](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-76) (SwipeCard + ActionBar + useSwipeGesture)  
**Blocks:** [SCRUM-86](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-86) (home feed v2 content), [SCRUM-92](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-92) (creator feed UI), [SCRUM-94](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-94) (seeker feed + ListingCard)

**Branch:** `feature/SCRUM-77-feed-stack`

---

## 1. Summary

Extract the swipe-feed **layout shell** from `feed/index.jsx` into a reusable `FeedStack` component under `src/components/feed/`. FeedStack owns card-column centering, the overlapped two-card stack visual, and loading/empty slots. Swipe physics, API calls, and card content remain in `SwipeCard` / `UserCard`.

The home feed migrates to `FeedStack` in this ticket. Creator and seeker feeds (SCRUM-92, SCRUM-94) reuse the same component without duplicating stack math.

Visual parity with today is acceptable — this ticket is architectural. v2 profile content, FeedHeader, and black shell page chrome are **SCRUM-86**.

---

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Stack depth | **Top 2 cards rendered** — front (active) + one back peek; full candidate list stays in parent state |
| API pattern | **`renderCard` prop** — parent supplies data + card component; FeedStack controls stack indices |
| Front-card detection | **FeedStack passes `isFront`** — remove `isKeyLast(users, email)` from `UserCard` |
| Back-card rotation | **Desktop only (>900px):** alternating `±4deg` static offset on back card; mobile: `0deg` (per SCRUM-76 spec) |
| Back-card scale | **`0.95`** on stacked `SwipeCard` (existing SCRUM-76 behavior) |
| Loading / empty | **Slot props** with token-styled defaults; legacy copy preserved until SCRUM-105 |
| Help tooltip | **Stays in `feed/index.jsx`** — not part of FeedStack (removed when FeedHeader lands in SCRUM-86) |
| Match overlay | **Stays in `feed/index.jsx`** — FeedStack does not wrap match UI |
| MUI in FeedStack | **No** — native HTML + co-located CSS with `--pp-*` tokens |
| Page background | **Keep legacy gradient** on feed page until SCRUM-86 |
| Bottom nav clearance | FeedStack respects existing feed bottom padding (`72px + safe-area`) via parent `.feed` styles |

---

## 3. Approaches considered

### Approach 1 — `renderCard` data-driven API (recommended)

FeedStack receives `items[]`, slices to top 2, calls `renderCard(item, stackMeta)`.

**Pros:** Same API for home, creator, and seeker feeds; parent keeps fetch/state; stack indices centralized.  
**Cons:** Slightly more boilerplate than `children` alone.

### Approach 2 — `children` composition only

Parent maps items and passes `<UserCard />` children; FeedStack is a styled wrapper.

**Pros:** Minimal API surface.  
**Cons:** Parent must slice to 2 cards and compute `isFront`/`stackIndex` — duplicates logic across three feed pages.

### Approach 3 — Headless `useFeedStack` hook

Hook returns stack state; no layout component.

**Pros:** Maximum flexibility.  
**Cons:** Over-engineered for Phase 0; every consumer reimplements the same grid CSS.

**Recommendation:** Approach 1. Matches the roadmap's original `cards[]` / `renderCard` sketch and keeps Rooms feeds DRY.

---

## 4. Ticket boundaries

```
Branch: feature/SCRUM-77-feed-stack
Spec: docs/superpowers/specs/2026-06-10-feed-stack-design.md

## Delivers
- FeedStack.jsx + FeedStack.css — stack grid, card column, loading/empty slots
- src/components/feed/index.js — barrel export
- Migrate feed/index.jsx stack map → FeedStack
- UserCard accepts isFront + stackIndex props; remove isKeyLast / isRotated
- Move stack positioning CSS from UserCard/styles.css → FeedStack.css
- Restore desktop back-card ±4deg rotation via stackIndex

## Does NOT deliver
- Swipe physics, stamps, ActionBar (SCRUM-76 — done)
- v2 profile sections: FeedHeader, HeroImageOverlay, AboutMe, PromptCard (SCRUM-86)
- Black shell page background (SCRUM-86)
- Polished empty-state copy + CTAs (SCRUM-105)
- AppShell layout wrapper (SCRUM-83)
- Help tooltip relocation
- Rewind / undo swipe (future FeedHeader in SCRUM-86)
```

---

## 5. Architecture

```
feed/index.jsx
├── fetch users + images (unchanged)
├── MatchOverlay (unchanged)
├── Onboarding (unchanged)
├── help tooltip (unchanged — page-level)
└── FeedStack
      ├── loading slot (when !loaded)
      ├── empty slot (when loaded && items.length === 0)
      └── stack region (when loaded && items.length > 0)
            ├── UserCard stackIndex=1 isFront=false  (back peek)
            └── UserCard stackIndex=0 isFront=true   (front, receives drag)

UserCard (unchanged responsibilities)
├── useSwipeGesture + SwipeCard + ActionBar
├── match API calls
└── UserCardContent (legacy layout until SCRUM-86)
```

**Separation of concerns:**

| Layer | Responsibility |
|---|---|
| `feed/index.jsx` | Data fetch, match state, onboarding, page chrome |
| `FeedStack` | Layout shell: center column, 2-card stack grid, loading/empty |
| `UserCard` | Per-card swipe behavior, API, content composition |
| `SwipeCard` | Drag shell, scale for stacked state |

---

## 6. FeedStack API

```jsx
<FeedStack
  items={userCards}                    // array; order = stack order (last item = front)
  isLoading={boolean}
  isEmpty={boolean}                    // true when loaded && items.length === 0
  renderCard={(item, meta) => ReactNode}
  loadingSlot={ReactNode}              // optional override
  emptySlot={ReactNode}                // optional override
  className=""
/>
```

### `meta` passed to `renderCard`

| Field | Type | Meaning |
|---|---|---|
| `stackIndex` | `0 \| 1` | `0` = front (active), `1` = back peek |
| `isFront` | `boolean` | `stackIndex === 0` |
| `itemIndex` | `number` | Index in full `items` array (for rotation parity) |
| `stackRotateOffset` | `number` | Degrees added to drag rotation (see §8) |

### Item ordering convention

**Front card = last item in `items` array.** This matches today's behavior where `isKeyLast(users, email)` picks the last entry in the `users` object (insertion order from API).

FeedStack slices: `const visible = items.slice(-2)` — renders back first (lower stackIndex), front last (higher z-index).

When `items.length === 1`, only the front card renders (no back peek).

---

## 7. FeedStack layout CSS

### Container (`.pp-feed-stack`)

| Property | Value |
|---|---|
| Display | `grid` with `place-items: center` |
| Width | `100%` |
| Flex growth | `1` / `min-height: 0` when inside flex parent |
| Max width | `var(--pp-layout-max-card)` |
| Horizontal margin | `0 auto` |
| Card column width | `85vw` mobile, `min(92vw, var(--pp-layout-max-card))` desktop |

### Stack grid (`.pp-feed-stack__cards`)

Single-cell CSS grid — all cards occupy the same cell:

```css
.pp-feed-stack__cards {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  width: 100%;
}
.pp-feed-stack__cards > * {
  grid-row: 1;
  grid-column: 1;
}
```

Back card (`stackIndex === 1`): `pointer-events: none`, lower effective z-index via DOM order (render back before front).

Front card: receives pointer events and drag.

### Loading slot (`.pp-feed-stack__loading`)

Centered in the stack region. Default content:

- CSS spinner using `--pp-color-accent` (no MUI inside FeedStack)
- Heading: "Gathering Candidates…" — `--pp-font-body`, `--pp-text-2xl`, `--pp-color-text-primary`

### Empty slot (`.pp-feed-stack__empty`)

Centered text. Default content:

- "No more candidates, come back later!" — same typography tokens as loading heading
- SCRUM-105 replaces copy and adds CTAs

### Layout shift prevention

Loading, empty, and stack states share the same outer dimensions (`width`, min-height). Switching between states must not jump the page vertically. Use a consistent min-height on `.pp-feed-stack` derived from current card column height (`min(80vh, calc(100dvh - header - nav - safe-area))` on desktop; auto on mobile scroll layout).

---

## 8. Stack rotation rules

Port the SCRUM-76 spec rule that was never wired (`stackRotateOffset = 0` today):

```js
function getStackRotateOffset(itemIndex, isFront) {
  if (isFront) return 0;
  if (typeof window !== "undefined" && window.innerWidth <= 900) return 0;
  // itemIndex = position in full items array (0-based)
  return itemIndex % 2 === 0 ? 4 : -4;
}
```

`itemIndex` is the index of this card in the **full** `items` array (not the visible-slice index). For the back peek, this is always `items.length - 2` when two cards are visible.

Pass result to `UserCard` → `useSwipeGesture({ stackRotateOffset })`.

`meta` includes `itemIndex` alongside `stackIndex` and `isFront`.

---

## 9. UserCard changes

### New props

```jsx
<UserCard
  isFront={boolean}           // required in feed mode
  stackIndex={0 | 1}          // required in feed mode
  stackRotateOffset={number}  // optional; computed by FeedStack if omitted
  // existing: user, users, setUsers, images, setMatch, feedOrViewProfile
/>
```

### Removed props

- `isRotated` — replaced by `stackIndex`

### Removed logic

- `isKeyLast(users, user.email)` for front detection — parent/FeedStack supplies `isFront`
- Hardcoded `stackRotateOffset = 0`

### View profile mode (unchanged)

`feedOrViewProfile === "view profile"`: `isFront={true}`, no stack, no ActionBar, no FeedStack wrapper. `viewProfile/index.jsx` continues rendering `UserCard` directly.

### CSS migration

**Move from `UserCard/styles.css` to `FeedStack.css`:**

- `grid-row: 1; grid-column: 1` on `.userFeedCardDiv`
- Stack-related `margin-top: 7rem` on feed cards (replace with FeedStack vertical positioning)

**Keep in `UserCard/styles.css`:**

- Card dimensions (`width`, `height`, `max-height`)
- Clip, scroll, SwipeCard overrides
- View profile overrides
- Internal content layout

---

## 10. feed/index.jsx migration

### Remove

- `userCards` `isRotated` counter increment
- Direct `userCards.map(...)` rendering
- Inline loading `motion.div` + MUI `CircularProgress` block (move to `loadingSlot` override OR use FeedStack default)
- Inline empty `Box` block (move to `emptySlot` override OR use FeedStack default)

### Add

```jsx
<FeedStack
  items={userCards}
  isLoading={!loaded}
  isEmpty={loaded && userCards.length === 0}
  loadingSlot={/* optional: keep MUI loader for zero visual change */}
  emptySlot={/* optional: keep legacy copy */}
  renderCard={({ key, user, images }, meta) => (
    <UserCard
      key={key}
      user={user}
      users={users}
      setUsers={setUsers}
      setMatch={setMatch}
      images={images}
      isFront={meta.isFront}
      stackIndex={meta.stackIndex}
      stackRotateOffset={meta.stackRotateOffset}
    />
  )}
/>
```

### Keep unchanged

- Auth redirect, fetch effects, image preload
- `MatchOverlay` wiring
- `Onboarding` modal
- Help tooltip (absolute positioned in `.feed`)
- Session expired message

### `.feed` styles adjustment

- Retain `padding-bottom: calc(72px + var(--pp-safe-bottom))` for BottomNavBar clearance
- Retain `padding-top: 4.5rem` until SCRUM-86 FeedHeader
- Grid centering on `.feed` may simplify — stack centering moves to FeedStack; `.feed` becomes a flex column or keeps grid with FeedStack as sole child in the stack region

---

## 11. File layout

| File | Action |
|---|---|
| `src/components/feed/FeedStack.jsx` | Create |
| `src/components/feed/FeedStack.css` | Create |
| `src/components/feed/index.js` | Create — barrel export |
| `src/pages/feed/index.jsx` | Modify — use FeedStack |
| `src/pages/feed/styles.css` | Modify — simplify page vs stack responsibilities |
| `src/pages/feed/components/UserCard/index.jsx` | Modify — `isFront`/`stackIndex` props |
| `src/pages/feed/components/UserCard/styles.css` | Modify — remove stack grid rules |
| `docs/design/v2-mockup-reference.md` | Modify — FeedStack decision log entry |

**Out of scope:** SwipeCard, ActionBar, useSwipeGesture, UserCardContent, MatchOverlay, BottomNavBar.

---

## 12. Desktop behavior

| Element | Behavior |
|---|---|
| Card column | `max-width: var(--pp-layout-max-card)`, centered in viewport |
| Stack | Top 2 cards overlapped; back card scaled 0.95 with ±4deg offset |
| Card height | Existing UserCard desktop rules (`max-height: calc(100dvh - …)`) |
| ActionBar sticky | Unchanged — sticky rule lives in UserCard/styles.css |
| Bottom nav | Fixed pill; feed page padding-bottom clears nav |

No desktop mockup. Mobile-first rules from SCRUM-76 apply.

---

## 13. Error handling

FeedStack is presentational — no fetch logic.

| Case | Behavior |
|---|---|
| `isLoading && isEmpty` | Show loading slot only |
| `!isLoading && isEmpty` | Show empty slot |
| `items.length === 1` | Single front card, no back peek |
| `renderCard` returns null | Skip slot (caller bug — not FeedStack's job to guard) |

---

## 14. Acceptance criteria

- [ ] `FeedStack` renders at most 2 cards from `items` (last = front)
- [ ] Back card: `scale(0.95)`, no pointer events, desktop ±4deg rotation
- [ ] Front card: full interactivity (drag, ActionBar, keyboard)
- [ ] Card column centered at `--pp-layout-max-card` on desktop
- [ ] Loading and empty slots render without layout shift
- [ ] `feed/index.jsx` uses FeedStack; no direct `userCards.map` for stack
- [ ] `UserCard` no longer uses `isKeyLast` or `isRotated`
- [ ] Swipe left/right, match detection, and MatchOverlay unchanged
- [ ] View profile page unchanged
- [ ] No MUI imports in `src/components/feed/` files
- [ ] All new CSS uses `--pp-*` tokens — no hardcoded hex in FeedStack files
- [ ] Barrel export from `src/components/feed/index.js`

---

## 15. Testing / verification

Manual checks in PR:

1. **Load feed** — loading spinner/text appears centered; no layout jump when cards arrive
2. **Stack visual** — with 2+ candidates, back card peeks behind front at 0.95 scale
3. **Swipe front card** — card flies off; next candidate promotes to front; back peek updates
4. **Single candidate** — one card, no back peek, swipe still works
5. **Empty feed** — legacy empty copy appears when API returns no users
6. **Desktop 1280px** — column centered at 480px; back card has slight rotation
7. **Mobile 375px** — back card no static rotation; page scroll behavior unchanged
8. **Keyboard** — arrow keys affect front card only (no duplicate listeners from hidden cards)
9. **View profile** — navigate to `/viewProfile`; card renders without FeedStack regressions
10. **Match flow** — mutual swipe still opens MatchOverlay
11. **Bottom nav** — card not obscured by nav bar on mobile
12. **DevTools** — only 1–2 `UserCard` instances in DOM when feed has many candidates

---

## 16. Downstream usage

| Consumer | Ticket | FeedStack usage |
|---|---|---|
| Home feed v2 content | SCRUM-86 | Same FeedStack; swaps UserCardContent internals |
| Creator feed | SCRUM-92 | `items={seekers}`, `renderCard` → UserCard |
| Seeker feed | SCRUM-94 | `items={listings}`, `renderCard` → ListingCard variant |
| Empty states polish | SCRUM-105 | Pass custom `emptySlot` with CTA copy |

---

## 17. Implementation commits (suggested atomic split)

1. `feat(feed): add FeedStack layout component [SCRUM-77]` — FeedStack.jsx, .css, barrel
2. `refactor(feed): migrate home feed to FeedStack [SCRUM-77]` — feed/index.jsx, styles
3. `refactor(feed): simplify UserCard stack props [SCRUM-77]` — UserCard index + styles

Single commit acceptable if preferred.

---

## 18. Mockup reference updates

Update `docs/design/v2-mockup-reference.md` decision log:

- FeedStack scope: layout shell only; top-2 render; renderCard API
- Stack rotation: desktop ±4deg on back card; mobile 0
- Help tooltip + FeedHeader remain SCRUM-86

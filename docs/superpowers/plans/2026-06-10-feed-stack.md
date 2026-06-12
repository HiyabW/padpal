# FeedStack Container (SCRUM-77) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract a reusable `FeedStack` layout shell from the home feed; render top-2 cards with stack positioning, loading/empty slots, and centered 480px column.

**Architecture:** `FeedStack` is presentational — it slices `items` to the last two entries, computes stack metadata (`isFront`, `stackIndex`, `stackRotateOffset`), and calls `renderCard`. `UserCard` receives stack props from FeedStack instead of computing `isKeyLast` internally. Page-level concerns (fetch, MatchOverlay, help tooltip) stay in `feed/index.jsx`. Spec: `docs/superpowers/specs/2026-06-10-feed-stack-design.md`.

**Tech Stack:** React 18 · CSS custom properties (`--pp-*`) · no MUI in `src/components/feed/` files

**Branch:** `feature/SCRUM-77-feed-stack` (cut from `padpal-v2`)

**Testing note:** SCRUM-77 uses manual verification only (per spec §15). No automated component tests in this ticket.

---

## File map

| File | Responsibility |
|---|---|
| `src/components/feed/getStackRotateOffset.js` | Desktop back-card ±4deg rotation helper |
| `src/components/feed/FeedStack.jsx` | Stack layout, loading/empty slots, renderCard loop |
| `src/components/feed/FeedStack.css` | `.pp-feed-stack` grid, column centering, slot styles |
| `src/components/feed/index.js` | Barrel export |
| `src/pages/feed/index.jsx` | Replace inline stack map with FeedStack |
| `src/pages/feed/styles.css` | Simplify page shell; stack centering moves to FeedStack |
| `src/pages/feed/components/UserCard/index.jsx` | Accept `isFront`/`stackIndex`/`stackRotateOffset`; remove `isKeyLast` |
| `src/pages/feed/components/UserCard/styles.css` | Remove stack grid rules; keep card dimensions |
| `src/pages/viewProfile/index.jsx` | Remove deprecated `isRotated` prop |
| `docs/design/v2-mockup-reference.md` | Decision log entry (already partially updated) |
| `docs/superpowers/specs/2026-06-10-feed-stack-design.md` | Set status to Approved |

---

### Task 0: Create feature branch

**Files:** None (git only)

- [ ] **Step 1: Cut branch from padpal-v2**

```bash
git checkout padpal-v2
git pull origin padpal-v2
git checkout -b feature/SCRUM-77-feed-stack
```

Expected: branch created. SCRUM-76 (SwipeCard) must be merged or present on `padpal-v2` before starting — verify `src/components/swipe/SwipeCard.jsx` exists.

---

### Task 1: Stack rotation helper

**Files:**
- Create: `src/components/feed/getStackRotateOffset.js`

- [ ] **Step 1: Create helper**

```javascript
/**
 * Static rotation offset for back cards in the stack (desktop only).
 * @param {number} itemIndex - Index in full items array (0-based)
 * @param {boolean} isFront
 * @returns {number} degrees
 */
export function getStackRotateOffset(itemIndex, isFront) {
  if (isFront) return 0;
  if (typeof window !== "undefined" && window.innerWidth <= 900) return 0;
  return itemIndex % 2 === 0 ? 4 : -4;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/feed/getStackRotateOffset.js
git commit -m "$(cat <<'EOF'
feat(feed): add stack rotation helper [SCRUM-77]

EOF
)"
```

---

### Task 2: FeedStack component

**Files:**
- Create: `src/components/feed/FeedStack.jsx`
- Create: `src/components/feed/FeedStack.css`
- Create: `src/components/feed/index.js`

- [ ] **Step 1: Create FeedStack.css**

```css
.pp-feed-stack {
  display: grid;
  place-items: center;
  width: 100%;
  max-width: var(--pp-layout-max-card);
  margin: 0 auto;
  min-height: min(80vh, calc(100dvh - 4.5rem - 72px - var(--pp-safe-bottom, 0px)));
}

.pp-feed-stack__cards {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  width: min(92vw, var(--pp-layout-max-card));
}

.pp-feed-stack__cards > * {
  grid-row: 1;
  grid-column: 1;
}

.pp-feed-stack__cards > .userFeedCardDiv--back {
  pointer-events: none;
}

.pp-feed-stack__loading,
.pp-feed-stack__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  padding: var(--pp-space-8);
}

.pp-feed-stack__loading-title,
.pp-feed-stack__empty-title {
  font-family: var(--pp-font-body);
  font-size: var(--pp-text-2xl);
  font-weight: var(--pp-font-bold);
  color: var(--pp-color-text-primary);
  margin: var(--pp-space-6) 0 0;
}

.pp-feed-stack__spinner {
  width: 10rem;
  height: 10rem;
  border: 24px solid rgba(255, 255, 255, 0.15);
  border-top-color: var(--pp-color-accent);
  border-radius: 50%;
  animation: pp-feed-stack-spin 0.8s linear infinite;
}

@keyframes pp-feed-stack-spin {
  to {
    transform: rotate(360deg);
  }
}

@media screen and (max-width: 768px) {
  .pp-feed-stack {
    min-height: auto;
  }

  .pp-feed-stack__cards {
    width: 85vw;
  }
}
```

- [ ] **Step 2: Create FeedStack.jsx**

```jsx
import React, { useMemo } from "react";
import { getStackRotateOffset } from "./getStackRotateOffset";
import "./FeedStack.css";

function DefaultLoading() {
  return (
    <div className="pp-feed-stack__loading">
      <div className="pp-feed-stack__spinner" role="status" aria-label="Loading candidates" />
      <h1 className="pp-feed-stack__loading-title">Gathering Candidates...</h1>
    </div>
  );
}

function DefaultEmpty() {
  return (
    <div className="pp-feed-stack__empty">
      <h1 className="pp-feed-stack__empty-title">no more candidates, come back later!</h1>
    </div>
  );
}

function FeedStack({
  items = [],
  isLoading = false,
  isEmpty = false,
  renderCard,
  loadingSlot,
  emptySlot,
  className = "",
}) {
  const visibleItems = useMemo(() => {
    if (items.length <= 1) return items;
    return items.slice(-2);
  }, [items]);

  const rootClass = ["pp-feed-stack", className].filter(Boolean).join(" ");

  if (isLoading) {
    return (
      <div className={rootClass}>
        {loadingSlot ?? <DefaultLoading />}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={rootClass}>
        {emptySlot ?? <DefaultEmpty />}
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <div className="pp-feed-stack__cards">
        {visibleItems.map((item, visibleIndex) => {
          const itemIndex = items.indexOf(item);
          const isFront = visibleIndex === visibleItems.length - 1;
          const stackIndex = isFront ? 0 : 1;
          const stackRotateOffset = getStackRotateOffset(itemIndex, isFront);

          return renderCard(item, {
            stackIndex,
            isFront,
            itemIndex,
            stackRotateOffset,
          });
        })}
      </div>
    </div>
  );
}

export default FeedStack;
```

- [ ] **Step 3: Create barrel export**

```javascript
export { default as FeedStack } from "./FeedStack";
export { getStackRotateOffset } from "./getStackRotateOffset";
```

Save as `src/components/feed/index.js`.

- [ ] **Step 4: Verify component loads**

Run: `npm run serve` (if not already running)

Temporarily add to any route for smoke test, or proceed to Task 4 migration and verify there.

- [ ] **Step 5: Commit**

```bash
git add src/components/feed/
git commit -m "$(cat <<'EOF'
feat(feed): add FeedStack layout component [SCRUM-77]

EOF
)"
```

---

### Task 3: Refactor UserCard stack props

**Files:**
- Modify: `src/pages/feed/components/UserCard/index.jsx`
- Modify: `src/pages/feed/components/UserCard/styles.css`
- Modify: `src/pages/viewProfile/index.jsx`

- [ ] **Step 1: Update UserCard/index.jsx**

Remove `isKeyLast` helper and `isRotated` prop. Accept stack props from FeedStack; default for view profile mode.

Replace the component signature and front-card logic:

```jsx
const UserCard = ({
  isFront: isFrontProp,
  stackIndex = 0,
  stackRotateOffset: stackRotateOffsetProp,
  user,
  users,
  setUsers,
  images,
  setMatch,
  feedOrViewProfile = "feed",
}) => {
  const isViewProfile = feedOrViewProfile === "view profile";
  const isFront = isViewProfile ? true : Boolean(isFrontProp);
  const enabled = feedOrViewProfile === "feed";
  const stackRotateOffset =
    stackRotateOffsetProp ??
    (isViewProfile ? 0 : 0);
```

Remove the entire `isKeyLast` function at the top of the file.

Update the outer `motion.div` className to include back modifier from FeedStack:

```jsx
<motion.div
  className={[
    "userFeedCardDiv",
    isFront && "userFeedCardDiv--front",
    !isFront && "userFeedCardDiv--back",
    feedOrViewProfile !== "feed" ? "viewProfile" : "",
  ]
    .filter(Boolean)
    .join(" ")}
  style={gesture.shellStyle}
>
```

Pass `stackRotateOffset` to `useSwipeGesture` (already wired — just ensure it uses the variable, not hardcoded `0`).

- [ ] **Step 2: Update UserCard/styles.css — remove stack grid rules**

Delete these lines from `.userFeedCardDiv`:

```css
  grid-row: 1;
  grid-column: 1;
```

Delete desktop/mobile `margin-top: 7rem` and set feed-mode margins to `0` (FeedStack handles vertical placement):

In `.userFeedCardDiv`, change `margin-top: 7rem` to `margin-top: 0`.

In the `@media (max-width: 768px)` block for `.userFeedCardDiv`, confirm `margin-top: 0` (already present).

Remove `.userFeedCardDiv--back { pointer-events: none; }` — moved to FeedStack.css.

- [ ] **Step 3: Update viewProfile/index.jsx**

Remove deprecated prop:

```jsx
<UserCard
  user={user}
  users={users}
  setUsers={setUsers}
  images={images}
  feedOrViewProfile="view profile"
/>
```

Remove `isRotated={null}`, `match={null}`, `setMatch={null}` if present (not in UserCard API).

- [ ] **Step 4: Commit**

```bash
git add src/pages/feed/components/UserCard/index.jsx \
        src/pages/feed/components/UserCard/styles.css \
        src/pages/viewProfile/index.jsx
git commit -m "$(cat <<'EOF'
refactor(feed): UserCard accepts stack props from FeedStack [SCRUM-77]

EOF
)"
```

---

### Task 4: Migrate home feed to FeedStack

**Files:**
- Modify: `src/pages/feed/index.jsx`
- Modify: `src/pages/feed/styles.css`

- [ ] **Step 1: Update feed/index.jsx imports**

Add:

```jsx
import { FeedStack } from "../../components/feed";
```

Remove unused imports after migration:
- `Box` from MUI (if empty state removed)
- `CircularProgress` from MUI (if loading uses FeedStack default)
- `motion` from framer-motion (if loading animation removed)

Keep `motion` only if still used elsewhere in the file (it is not after migration — remove it).

- [ ] **Step 2: Simplify userCards useMemo**

Replace the `isRotated` counter with a plain map:

```jsx
const userCards = useMemo(() => {
  return Object.entries(users).map(([key, user]) => ({
    key,
    user,
    images: images[user.email],
  }));
}, [users, images]);
```

- [ ] **Step 3: Replace loading, stack map, and empty blocks**

Remove:
- The `{!loaded && ( <motion.div>...CircularProgress...</motion.div> )}` block
- The `{userCards.map(...)}` block
- The `{Object.keys(users).length === 0 && loaded && ( <Box>...</Box> )}` block

Add inside the authenticated `{isAuthenticated && ( <> ... </> )}` block, after the help tooltip:

```jsx
<FeedStack
  items={userCards}
  isLoading={!loaded}
  isEmpty={loaded && userCards.length === 0}
  renderCard={(item, meta) => (
    <UserCard
      key={item.key}
      user={item.user}
      users={users}
      setUsers={setUsers}
      setMatch={setMatch}
      images={item.images}
      isFront={meta.isFront}
      stackIndex={meta.stackIndex}
      stackRotateOffset={meta.stackRotateOffset}
    />
  )}
/>
```

Help tooltip condition stays: `loaded && Object.keys(users).length > 0`.

- [ ] **Step 4: Adjust feed/styles.css**

The `.feed` page shell keeps padding for bottom nav and top header. FeedStack now owns card column centering. Ensure `.feed` allows FeedStack to fill the content area:

```css
.feed {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  overscroll-behavior: none;
  padding-top: 4.5rem;
  padding-bottom: calc(72px + var(--pp-safe-bottom, 0px));
  /* ... keep helpTooltip, h1, media queries ... */
}
```

Change `display: grid; place-items: center; align-items: center;` to `display: flex; flex-direction: column; align-items: center;`.

Mobile block (`max-width: 768px`): keep `height: auto; min-height: 100dvh; overflow: visible` rules.

- [ ] **Step 5: Commit**

```bash
git add src/pages/feed/index.jsx src/pages/feed/styles.css
git commit -m "$(cat <<'EOF'
refactor(feed): migrate home feed to FeedStack [SCRUM-77]

EOF
)"
```

---

### Task 5: Docs and spec status

**Files:**
- Modify: `docs/superpowers/specs/2026-06-10-feed-stack-design.md` (line 4)
- Modify: `docs/design/v2-mockup-reference.md` (decision log — verify entry present)

- [ ] **Step 1: Mark spec approved**

In `docs/superpowers/specs/2026-06-10-feed-stack-design.md`, change:

```markdown
**Status:** Approved
```

- [ ] **Step 2: Verify mockup reference decision log includes FeedStack entry**

Confirm line exists in `docs/design/v2-mockup-reference.md`:

```markdown
- FeedStack: top-2 render, `renderCard` API, loading/empty slots; desktop back-card ±4deg via `itemIndex`
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-06-10-feed-stack-design.md docs/design/v2-mockup-reference.md
git commit -m "$(cat <<'EOF'
docs(feed): approve FeedStack spec [SCRUM-77]

EOF
)"
```

---

### Task 6: Manual verification

**Files:** None (browser only)

- [ ] **Step 1: Load feed with candidates**

Run: `npm run serve`

Navigate to `/feed` while authenticated.

Expected: CSS spinner + "Gathering Candidates..." then card stack appears without layout jump.

- [ ] **Step 2: Stack visual (2+ candidates)**

Expected: Back card visible at ~0.95 scale behind front card. DevTools → only 1–2 `.userFeedCardDiv` elements in DOM.

- [ ] **Step 3: Swipe front card**

Swipe left or right (drag or ActionBar).

Expected: Card flies off; next candidate promotes; back peek updates.

- [ ] **Step 4: Single candidate**

Swipe until one card remains.

Expected: Single card, no back peek, swipe still works.

- [ ] **Step 5: Empty feed**

If API returns no users (or swipe through all):

Expected: "no more candidates, come back later!"

- [ ] **Step 6: Desktop 1280px**

Resize browser to 1280px width.

Expected: Card column centered, max ~480px. Back card has slight ±4deg rotation.

- [ ] **Step 7: Mobile 375px**

Resize to 375px.

Expected: Back card no static rotation. Page scroll behavior unchanged.

- [ ] **Step 8: Keyboard**

On desktop, press ArrowLeft / ArrowRight.

Expected: Only front card responds; no duplicate swipes.

- [ ] **Step 9: View profile**

Navigate to `/viewProfile?id=<valid-id>`.

Expected: Profile card renders; no drag; no ActionBar.

- [ ] **Step 10: Match flow**

Mutual swipe with a test account.

Expected: MatchOverlay opens; chat CTA works.

- [ ] **Step 11: Bottom nav clearance**

On mobile, scroll card to bottom.

Expected: ActionBar and card content not hidden behind BottomNavBar.

- [ ] **Step 12: Grep FeedStack for hardcoded hex**

Run:

```bash
rg '#[0-9a-fA-F]{3,8}' src/components/feed/
```

Expected: no matches (tokens only).

- [ ] **Step 13: STOP — open PR**

Push branch and open PR per `WORKFLOW.md` template. Update Jira SCRUM-77 to "In Review". **Do not start SCRUM-78/86 until greenlight.**

---

## Spec coverage checklist

| Spec requirement | Task |
|---|---|
| FeedStack.jsx + CSS | Task 2 |
| Barrel export | Task 2 |
| Top-2 render, last = front | Task 2 |
| renderCard + meta API | Task 2 |
| Loading / empty slots | Task 2 |
| getStackRotateOffset desktop ±4deg | Task 1, 2 |
| UserCard isFront/stackIndex props | Task 3 |
| Remove isKeyLast / isRotated | Task 3 |
| CSS migration stack grid | Task 2, 3 |
| feed/index.jsx migration | Task 4 |
| View profile unchanged | Task 3 |
| No MUI in feed components | Task 2 |
| Manual verification | Task 6 |
| Mockup reference update | Task 5 |

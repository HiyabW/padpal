# SwipeCard Primitive (SCRUM-76) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract reusable `useSwipeGesture`, `SwipeCard`, and `ActionBar` primitives; wire live feed via refactored `UserCard` with legacy content; remove Lottie overlays.

**Architecture:** `useSwipeGesture` owns Framer Motion values, direction lock (via `useDragControls`), threshold commits, keyboard, and programmatic swipe. `SwipeCard` is a presentational motion shell with PASS/MATCH stamps. `ActionBar` is token-styled native buttons. `UserCard` composes all three and keeps API calls. Spec: `docs/superpowers/specs/2026-06-09-swipe-card-design.md`.

**Tech Stack:** React 18 · Framer Motion · CSS custom properties (`--pp-*`) · no MUI in new `src/components/swipe/` files

**Branch:** `feature/SCRUM-76-swipe-card-primitive` (cut from `padpal-v2`)

**Testing note:** SCRUM-76 uses manual verification only (per spec §15). No automated component tests in this ticket.

---

## File map

| File | Responsibility |
|---|---|
| `src/design/tokens.css` | Three new stamp/action tokens |
| `src/design/README.md` | Document new tokens |
| `src/components/swipe/useSwipeGesture.js` | Drag physics, direction lock, keyboard, programmatic swipe |
| `src/components/swipe/SwipeCard.jsx` | Motion shell + stamp overlays |
| `src/components/swipe/SwipeCard.css` | `.pp-swipe-card`, `.pp-swipe-stamp` styles |
| `src/components/swipe/ActionBar.jsx` | Reject/Match/Share/Report buttons |
| `src/components/swipe/ActionBar.css` | `.pp-action-bar` styles |
| `src/components/swipe/index.js` | Barrel export |
| `src/pages/feed/components/UserCard/UserCardContent.jsx` | Legacy profile rendering only |
| `src/pages/feed/components/UserCard/index.jsx` | Compose shell + ActionBar; API calls |
| `src/pages/feed/index.jsx` | Remove Lottie overlays and accept/reject state |

---

### Task 0: Create feature branch

**Files:** None (git only)

- [ ] **Step 1: Cut branch from padpal-v2**

```bash
git checkout padpal-v2
git pull origin padpal-v2
git checkout -b feature/SCRUM-76-swipe-card-primitive
```

Expected: branch created, working tree clean except any pre-existing local changes.

---

### Task 1: Add swipe tokens

**Files:**
- Modify: `src/design/tokens.css` (after line 17, action colors block)
- Modify: `src/design/README.md` (Colors core table)

- [ ] **Step 1: Add tokens to tokens.css**

Insert after `--pp-color-action-reject-text`:

```css
  --pp-color-stamp-pass: var(--pp-color-danger);
  --pp-color-stamp-match: var(--pp-color-success);
  --pp-color-action-match-bg: var(--pp-color-success);
```

- [ ] **Step 2: Document tokens in README.md**

Add three rows to the Colors (core) table:

```markdown
| `--pp-color-stamp-pass` | PASS stamp during drag |
| `--pp-color-stamp-match` | MATCH stamp during drag |
| `--pp-color-action-match-bg` | Match button fill in ActionBar |
```

- [ ] **Step 3: Verify tokens load**

Run: `npm run serve` (if not already running)

In browser DevTools → Elements → `:root`, confirm `--pp-color-stamp-pass`, `--pp-color-stamp-match`, `--pp-color-action-match-bg` resolve.

- [ ] **Step 4: Commit**

```bash
git add src/design/tokens.css src/design/README.md
git commit -m "$(cat <<'EOF'
feat(design): add swipe action and stamp tokens [SCRUM-76]

EOF
)"
```

---

### Task 2: useSwipeGesture hook

**Files:**
- Create: `src/components/swipe/useSwipeGesture.js`

- [ ] **Step 1: Create the hook file**

```javascript
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useMotionValue,
  useTransform,
  useDragControls,
  animate,
} from "framer-motion";

const DEFAULT_THRESHOLD = 120;
const DEFAULT_DIRECTION_LOCK_PX = 10;

export function useSwipeGesture({
  enabled = true,
  isActive = false,
  onSwipeLeft,
  onSwipeRight,
  threshold = DEFAULT_THRESHOLD,
  directionLockPx = DEFAULT_DIRECTION_LOCK_PX,
  stackRotateOffset = 0,
}) {
  const x = useMotionValue(0);
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const isCommittingRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const axisLockedRef = useRef(null);

  const rotateRaw = useTransform(x, [-150, 150], [-18, 18]);
  const rotate = useTransform(() => `${rotateRaw.get() + stackRotateOffset}deg`);
  const stampOpacity = useTransform(x, [-threshold, -10, 0, 10, threshold], [1, 0.3, 0, 0.3, 1]);

  const commitSwipe = useCallback(
    async (direction) => {
      if (isCommittingRef.current || !enabled) return;
      isCommittingRef.current = true;
      const target = direction === "right" ? window.innerWidth : -window.innerWidth;
      await animate(x, target, { duration: 0.2, ease: "easeIn" });
      if (direction === "right") {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
      x.set(0);
      isCommittingRef.current = false;
    },
    [enabled, onSwipeLeft, onSwipeRight, x]
  );

  const swipeProgrammatic = useCallback(
    (direction) => commitSwipe(direction),
    [commitSwipe]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    axisLockedRef.current = null;
    const currentX = x.get();
    if (Math.abs(currentX) >= threshold) {
      commitSwipe(currentX > 0 ? "right" : "left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  }, [commitSwipe, threshold, x]);

  const handlePointerDown = useCallback(
    (event) => {
      if (!enabled || isCommittingRef.current) return;
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      axisLockedRef.current = null;

      const onPointerMove = (moveEvent) => {
        const dx = moveEvent.clientX - pointerStartRef.current.x;
        const dy = moveEvent.clientY - pointerStartRef.current.y;
        if (axisLockedRef.current) return;
        if (
          Math.abs(dx) < directionLockPx &&
          Math.abs(dy) < directionLockPx
        ) {
          return;
        }
        axisLockedRef.current =
          Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
        window.removeEventListener("pointermove", onPointerMove);
        if (axisLockedRef.current === "horizontal") {
          setIsDragging(true);
          dragControls.start(event);
        }
      };

      window.addEventListener("pointermove", onPointerMove);
      const cleanup = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", cleanup);
        window.removeEventListener("pointercancel", cleanup);
      };
      window.addEventListener("pointerup", cleanup);
      window.addEventListener("pointercancel", cleanup);
    },
    [directionLockPx, dragControls, enabled]
  );

  useEffect(() => {
    if (!isActive || !enabled) return;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        swipeProgrammatic("right");
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        swipeProgrammatic("left");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, isActive, swipeProgrammatic]);

  const dragProps = {
    drag: enabled ? "x" : false,
    dragControls,
    dragListener: false,
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 0.9,
    onDragEnd: handleDragEnd,
    onPointerDown: handlePointerDown,
    style: { x, rotate },
  };

  return {
    x,
    rotate,
    stampOpacity,
    dragProps,
    swipeProgrammatic,
    isDragging,
    threshold,
  };
}
```

- [ ] **Step 2: Smoke-check import**

Run: `npm run build`

Expected: build succeeds (hook is not imported yet — no breakage).

- [ ] **Step 3: Commit**

```bash
git add src/components/swipe/useSwipeGesture.js
git commit -m "$(cat <<'EOF'
feat(swipe): add useSwipeGesture hook [SCRUM-76]

EOF
)"
```

---

### Task 3: SwipeCard component

**Files:**
- Create: `src/components/swipe/SwipeCard.jsx`
- Create: `src/components/swipe/SwipeCard.css`

- [ ] **Step 1: Create SwipeCard.css**

```css
.pp-swipe-card {
  position: relative;
  width: 100%;
  max-width: var(--pp-layout-max-card);
  background: var(--pp-color-bg-surface);
  border-radius: var(--pp-radius-lg);
  overflow: hidden;
  touch-action: pan-y;
}

.pp-swipe-card--front {
  box-shadow: var(--pp-shadow-card);
  cursor: grab;
}

.pp-swipe-card--front:active {
  cursor: grabbing;
}

.pp-swipe-card--stacked {
  box-shadow: none;
}

.pp-swipe-card__content {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.pp-swipe-stamp {
  position: absolute;
  z-index: var(--pp-z-overlay);
  pointer-events: none;
  padding: var(--pp-space-2) var(--pp-space-4);
  border: 3px solid;
  border-radius: var(--pp-radius-sm);
  font-family: var(--pp-font-body);
  font-size: var(--pp-text-xl);
  font-weight: var(--pp-font-black);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.pp-swipe-stamp--pass {
  top: var(--pp-space-4);
  left: var(--pp-space-4);
  transform: rotate(-15deg);
  color: var(--pp-color-stamp-pass);
  border-color: var(--pp-color-stamp-pass);
}

.pp-swipe-stamp--match {
  top: var(--pp-space-4);
  right: var(--pp-space-4);
  transform: rotate(15deg);
  color: var(--pp-color-stamp-match);
  border-color: var(--pp-color-stamp-match);
}
```

- [ ] **Step 2: Create SwipeCard.jsx**

```jsx
import React from "react";
import { motion, useTransform } from "framer-motion";
import "./SwipeCard.css";

const SwipeCard = ({ gesture, isStacked = false, isFront = true, className = "", children }) => {
  const { x, threshold } = gesture;
  const passOpacity = useTransform(x, (v) => {
    if (v >= -10) return 0;
    return Math.min(Math.abs(v) / threshold, 1);
  });
  const matchOpacity = useTransform(x, (v) => {
    if (v <= 10) return 0;
    return Math.min(v / threshold, 1);
  });

  const classNames = [
    "pp-swipe-card",
    isFront ? "pp-swipe-card--front" : "pp-swipe-card--stacked",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.div
      className={classNames}
      animate={{ scale: isFront ? 1 : 0.95 }}
      transition={{ duration: 0.125 }}
      {...gesture.dragProps}
    >
      <motion.span
        className="pp-swipe-stamp pp-swipe-stamp--pass"
        style={{ opacity: passOpacity }}
        aria-hidden="true"
      >
        Pass
      </motion.span>
      <motion.span
        className="pp-swipe-stamp pp-swipe-stamp--match"
        style={{ opacity: matchOpacity }}
        aria-hidden="true"
      >
        Match
      </motion.span>
      <div className="pp-swipe-card__content">{children}</div>
    </motion.div>
  );
};

export default SwipeCard;
```

- [ ] **Step 3: Verify build**

Run: `npm run build`

Expected: PASS (component not wired yet).

- [ ] **Step 4: Commit**

```bash
git add src/components/swipe/SwipeCard.jsx src/components/swipe/SwipeCard.css
git commit -m "$(cat <<'EOF'
feat(swipe): add SwipeCard with PASS/MATCH stamps [SCRUM-76]

EOF
)"
```

---

### Task 4: ActionBar + barrel export

**Files:**
- Create: `src/components/swipe/ActionBar.jsx`
- Create: `src/components/swipe/ActionBar.css`
- Create: `src/components/swipe/index.js`

- [ ] **Step 1: Create ActionBar.css**

```css
.pp-action-bar {
  display: flex;
  flex-direction: column;
  gap: var(--pp-space-3);
  padding: var(--pp-space-4);
  background: var(--pp-color-bg-surface);
  border-top: 1px solid var(--pp-color-border);
  position: sticky;
  bottom: 0;
}

.pp-action-bar--disabled {
  opacity: var(--pp-opacity-disabled);
  pointer-events: none;
}

.pp-action-bar__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--pp-space-3);
}

.pp-action-bar__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--pp-space-2);
  min-height: 48px;
  padding: var(--pp-space-3) var(--pp-space-4);
  border: none;
  border-radius: var(--pp-radius-full);
  font-family: var(--pp-font-body);
  font-size: var(--pp-text-base);
  font-weight: var(--pp-font-semibold);
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.pp-action-bar__btn--reject {
  background: var(--pp-color-action-reject-bg);
  color: var(--pp-color-action-reject-text);
}

.pp-action-bar__btn--match {
  background: var(--pp-color-action-match-bg);
  color: var(--pp-color-text-on-surface);
}

.pp-action-bar__btn--share {
  width: 100%;
  background: var(--pp-color-bg-app);
  color: var(--pp-color-text-primary);
}

.pp-action-bar__btn--report {
  width: 100%;
  background: var(--pp-color-danger-subtle);
  color: var(--pp-color-danger);
}
```

- [ ] **Step 2: Create ActionBar.jsx**

```jsx
import React from "react";
import "./ActionBar.css";

const ActionBar = ({
  onReject,
  onMatch,
  onShare,
  onReport,
  disabled = false,
  className = "",
}) => {
  const classNames = ["pp-action-bar", disabled && "pp-action-bar--disabled", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classNames}>
      <div className="pp-action-bar__row">
        <button
          type="button"
          className="pp-action-bar__btn pp-action-bar__btn--reject"
          onClick={onReject}
          aria-label="Reject"
        >
          👎 Reject
        </button>
        <button
          type="button"
          className="pp-action-bar__btn pp-action-bar__btn--match"
          onClick={onMatch}
          aria-label="Match"
        >
          🤝 Match
        </button>
      </div>
      <button
        type="button"
        className="pp-action-bar__btn pp-action-bar__btn--share"
        onClick={onShare}
        aria-label="Share user with a friend"
      >
        Share user with a friend
      </button>
      <button
        type="button"
        className="pp-action-bar__btn pp-action-bar__btn--report"
        onClick={onReport}
        aria-label="Report user"
      >
        Report User
      </button>
    </div>
  );
};

export default ActionBar;
```

- [ ] **Step 3: Create barrel export**

```javascript
export { default as SwipeCard } from "./SwipeCard";
export { default as ActionBar } from "./ActionBar";
export { useSwipeGesture } from "./useSwipeGesture";
```

- [ ] **Step 4: Grep for hardcoded hex in swipe files**

Run: `rg '#[0-9a-fA-F]{3,8}' src/components/swipe/`

Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add src/components/swipe/ActionBar.jsx src/components/swipe/ActionBar.css src/components/swipe/index.js
git commit -m "$(cat <<'EOF'
feat(swipe): add ActionBar primitive and barrel export [SCRUM-76]

EOF
)"
```

---

### Task 5: Extract UserCardContent

**Files:**
- Create: `src/pages/feed/components/UserCard/UserCardContent.jsx`
- Modify: `src/pages/feed/components/UserCard/index.jsx` (temporary — will fully refactor in Task 6)

- [ ] **Step 1: Create UserCardContent.jsx**

Move from `UserCard/index.jsx` without drag/API logic:

- Utils: `formatDateStr`, `getAge`, preference translation objects
- State: `imageIndex`, `nextPicture`, `previousPicture`
- Keyboard: `ArrowUp`/`ArrowDown` only (image carousel) via `useEffect` on `document`
- JSX: `DotProgress`, hero image, info grid, bio, preference pills, hobbies
- Keep MUI imports in **UserCardContent** (legacy layout — SCRUM-86 replaces)
- Wrap content in a fragment; preserve existing `styles.css` class names (`userFeedImageDiv`, `userFeedInfoDiv`, etc.)

Props:

```jsx
const UserCardContent = ({
  user,
  images,
  feedOrViewProfile = "feed",
}) => { ... }
```

- [ ] **Step 2: Verify file compiles**

Run: `npm run build`

Expected: PASS once Task 6 imports it (if build before Task 6, file may be unused — that's OK).

- [ ] **Step 3: Commit**

```bash
git add src/pages/feed/components/UserCard/UserCardContent.jsx
git commit -m "$(cat <<'EOF'
refactor(feed): extract UserCardContent from UserCard [SCRUM-76]

EOF
)"
```

---

### Task 6: Wire UserCard + remove Lottie from feed

**Files:**
- Modify: `src/pages/feed/components/UserCard/index.jsx`
- Modify: `src/pages/feed/index.jsx`

- [ ] **Step 1: Rewrite UserCard/index.jsx**

Remove:
- Framer imports (`motion`, `useMotionValue`, `useTransform`)
- `accept`, `setAccept`, `reject`, `setReject` props
- All drag/keyboard swipe logic
- Inline profile JSX (now in UserCardContent)

Add:

```jsx
import { SwipeCard, ActionBar, useSwipeGesture } from "../../../../components/swipe";
import UserCardContent from "./UserCardContent";
```

Core logic:

```jsx
const UserCard = ({
  isRotated,
  user,
  users,
  setUsers,
  images,
  setMatch,
  feedOrViewProfile = "feed",
}) => {
  const isFront =
    feedOrViewProfile === "view profile" ? true : isKeyLast(users, user.email);
  const enabled = feedOrViewProfile === "feed";
  const stackRotateOffset =
    isFront || window.innerWidth <= 900 ? 0 : isRotated % 2 ? 4 : -4;

  const handleSwipe = useCallback(
    (isAMatch) => {
      apiFetch("/match/saveMatch", {
        method: "POST",
        body: JSON.stringify({ to: user._id, isAMatch }),
      })
        .then((r) => r.json())
        .then(() =>
          apiFetch("/match/getMatch", {
            method: "POST",
            body: JSON.stringify({ to: user._id }),
          })
        )
        .then((r) => r.json())
        .then((data) => {
          if (data.isAMatch) {
            setMatch({ name: user.name, pfp: images[0].image });
          }
        })
        .catch(console.log);

      setUsers((prev) => {
        const next = { ...prev };
        delete next[user.email];
        return next;
      });
    },
    [user, images, setMatch, setUsers]
  );

  const gesture = useSwipeGesture({
    enabled,
    isActive: isFront,
    onSwipeLeft: () => handleSwipe(false),
    onSwipeRight: () => handleSwipe(true),
    stackRotateOffset,
  });

  return (
    <div className={feedOrViewProfile !== "feed" ? "viewProfile" : ""}>
      <SwipeCard gesture={gesture} isStacked={!isFront} isFront={isFront}>
        <UserCardContent
          user={user}
          images={images}
          feedOrViewProfile={feedOrViewProfile}
        />
      </SwipeCard>
      {enabled && (
        <ActionBar
          onReject={() => gesture.swipeProgrammatic("left")}
          onMatch={() => gesture.swipeProgrammatic("right")}
          onShare={() => {}}
          onReport={() => {}}
          disabled={!isFront}
        />
      )}
    </div>
  );
};
```

Keep `isKeyLast` in `index.jsx` (or move to a shared util). Remove `console.log` calls while touching the file.

- [ ] **Step 2: Clean feed/index.jsx**

Remove these imports:

```javascript
import { Player } from '@lordicon/react';
const thumbDownIcon = require(...);
const heartIcon = require(...);
```

Remove state:

```javascript
const [accept, setAccept] = React.useState(false)
const [reject, setReject] = React.useState(false)
```

Remove blocks (lines ~116–160):
- `playerRefHeartIcon` / `playerRefThumbDownIcon` logic
- Fixed-position `.thumbsDown` and `.heart` divs with `Player`

Remove props from `<UserCard>`:

```javascript
accept={accept}
setAccept={setAccept}
reject={reject}
setReject={setReject}
```

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: PASS with no import errors.

- [ ] **Step 4: Manual verification (spec §15)**

With `npm run serve` running, log in and open Home feed:

1. Drag card right → MATCH stamp fades in → card flies off → API fires
2. Drag card left → PASS stamp fades in → card flies off
3. Scroll bio vertically → no horizontal swipe interference
4. Tap Reject/Match buttons → same fly-off behavior
5. `ArrowLeft`/`ArrowRight` on front card only
6. Mutual match still shows confetti overlay
7. Resize to 1280px → card renders, ActionBar visible

- [ ] **Step 5: Grep new swipe files for hardcoded hex**

Run: `rg '#[0-9a-fA-F]{3,8}' src/components/swipe/`

Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add src/pages/feed/components/UserCard/index.jsx src/pages/feed/index.jsx
git commit -m "$(cat <<'EOF'
refactor(feed): compose UserCard with SwipeCard shell [SCRUM-76]

Wire live feed to SwipeCard + ActionBar with legacy UserCardContent.
Remove Lottie heart/thumb overlays from feed page.

EOF
)"
```

---

### Task 7: Open PR

**Files:** None (process)

- [ ] **Step 1: Push branch**

```bash
git push -u origin feature/SCRUM-76-swipe-card-primitive
```

- [ ] **Step 2: Open PR using WORKFLOW.md template**

Title: `feat(swipe): SwipeCard primitive + ActionBar [SCRUM-76]`

Include:
- Link to spec: `docs/superpowers/specs/2026-06-09-swipe-card-design.md`
- Manual test checklist from spec §15
- Note: legacy profile layout preserved; v2 content is SCRUM-86

- [ ] **Step 3: Update Jira SCRUM-76 to In Review**

Paste description from spec §3 (SCRUM-76 block) if not already done.

- [ ] **Step 4: STOP — wait for greenlight before SCRUM-77**

Per `WORKFLOW.md`, do not start the next ticket until PR is approved.

---

## Spec coverage self-review

| Spec requirement | Task |
|---|---|
| Three new tokens | Task 1 |
| useSwipeGesture direction lock + threshold | Task 2 |
| SwipeCard + stamps | Task 3 |
| ActionBar mockup layout | Task 4 |
| Barrel export | Task 4 |
| UserCardContent extraction | Task 5 |
| UserCard compose + API unchanged | Task 6 |
| Remove Lottie overlays | Task 6 |
| Keyboard front-card only | Task 2 + Task 6 |
| View-profile: no drag/ActionBar | Task 6 (`enabled` gate) |
| No MUI in swipe/ | Tasks 2–4 |
| aria-label on ActionBar | Task 4 |
| Desktop sticky ActionBar | Task 4 CSS |
| Manual verification | Task 6 Step 4 |

No gaps found.

---

## Out of scope (do not implement in this branch)

- FeedStack (SCRUM-77)
- v2 profile components / FeedHeader (SCRUM-86)
- MatchOverlay (SCRUM-87)
- BottomNavBar (SCRUM-79)
- Share/Report real handlers (SCRUM-86)
- Black shell background on feed page (SCRUM-86)

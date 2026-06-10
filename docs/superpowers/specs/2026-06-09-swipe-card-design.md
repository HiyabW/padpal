# SwipeCard Primitive (SCRUM-76) — Design Spec

**Version 1.0 | June 9, 2026**  
**Status:** Approved  
**Jira:** [SCRUM-76](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-76) · Epic [SCRUM-72](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-72)  
**Depends on:** [SCRUM-74](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-74) (design tokens)  
**Blocks:** [SCRUM-77](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-77) (FeedStack), [SCRUM-86](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-86) (home feed migration), [SCRUM-94](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-94) (ListingCard — reuses swipe shell)

**Branch:** `feature/SCRUM-76-swipe-card-primitive`

---

## 1. Summary

Extract a reusable swipe shell from the monolithic `UserCard` by creating `useSwipeGesture`, `SwipeCard`, and `ActionBar` under `src/components/swipe/`. Components use Framer Motion for drag physics, native HTML for ActionBar buttons, co-located CSS with `pp-` BEM classes, and `--pp-*` tokens exclusively. No MUI in new files.

Wire the live feed: refactor `UserCard` to compose `SwipeCard` + `ActionBar` + `UserCardContent` (legacy profile layout preserved). Remove feed-level Lottie heart/thumb overlays — corner PASS/MATCH stamps on `SwipeCard` replace them.

Visual authority: mobile feed mockup (`docs/design/assets/feed-card-mobile.png`) documented in `docs/design/v2-mockup-reference.md`. Desktop has no mockup; use token layout rules (480px centered card column, sticky ActionBar).

The v2 scrollable profile layout (HeroImageOverlay, AboutMeSection, PromptCard, FeedHeader) is **SCRUM-86**, not this ticket.

---

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Component scope | `SwipeCard` + `useSwipeGesture` + `ActionBar` as separate primitives |
| Architecture | Hook + thin components (Approach 1) |
| Swipe vs scroll | Direction lock on first 10px of pointer movement |
| Drag feedback | Corner "PASS" / "MATCH" stamps; opacity scales with drag distance |
| Live feed wiring | Refactor `UserCard` with legacy content; remove Lottie overlays |
| ActionBar buttons | Reject/Match trigger same programmatic swipe as drag |
| Share/Report | Render per mockup; stub callbacks (no-op) until SCRUM-86 |
| API calls | Stay in `UserCard` — swipe primitives fire callbacks only |
| Implementation | Native HTML + co-located CSS; Framer Motion for drag |
| MUI in new files | No |
| Desktop | Mobile-first; 480px centered column; sticky ActionBar; mouse drag + keyboard |
| Demo / Storybook | None — manual PR verification checklist |

---

## 3. Ticket boundaries (Jira descriptions)

Copy the relevant block into each Jira ticket so branch scope is unambiguous during review.

### SCRUM-76 — SwipeCard primitive

```
Branch: feature/SCRUM-76-swipe-card-primitive
Spec: docs/superpowers/specs/2026-06-09-swipe-card-design.md

## Delivers
- useSwipeGesture.js — direction lock, drag threshold, keyboard arrows, programmatic swipe
- SwipeCard.jsx + .css — motion shell, PASS/MATCH corner stamps, children slot
- ActionBar.jsx + .css — Reject/Match ovals, Share/Report full-width pills
- src/components/swipe/index.js — barrel export
- UserCard refactor → SwipeCard + UserCardContent (LEGACY content layout)
- ActionBar Reject/Match wired to same swipe callbacks as drag
- Remove feed-level Lottie heart/thumb overlays from feed/index.jsx
- Share/Report stub callbacks (no-op until SCRUM-86)
- Three new action/stamp tokens in tokens.css

## Does NOT deliver
- FeedStack layout (SCRUM-77)
- v2 profile sections: HeroImageOverlay, AboutMe, PromptCard (SCRUM-86)
- FeedHeader, black shell page chrome (SCRUM-86)
- MatchOverlay integration (SCRUM-87)
- BottomNavBar (SCRUM-79)
- Report/block backend wiring (SCRUM-102)
```

### SCRUM-77 — FeedStack container

```
Branch: feature/SCRUM-77-feed-stack

## Delivers
- FeedStack.jsx — card stack positioning, back-card scale/rotate, loading slot, empty slot
- Migrate feed/index.jsx stack rendering from inline logic → FeedStack
- Center card column at --pp-layout-max-card on desktop

## Does NOT deliver
- Swipe physics (SCRUM-76)
- v2 profile content layout (SCRUM-86)
```

### SCRUM-86 — Home feed migration

```
Branch: feature/SCRUM-86-home-feed-migration

## Delivers
- Replace UserCardContent with v2 mockup components: FeedHeader, HeroImageOverlay, AboutMeSection, PromptCard
- Page chrome: black shell, remove legacy gradient
- Wire Share/Report to real handlers
- Visual parity with mobile feed mockup
- Compatibility badge styling

## Does NOT deliver
- SwipeCard / ActionBar / useSwipeGesture (SCRUM-76)
- FeedStack container (SCRUM-77)
- MatchOverlay (SCRUM-87)
```

---

## 4. New tokens

Add to `src/design/tokens.css`:

| Token | Value | Purpose |
|---|---|---|
| `--pp-color-stamp-pass` | `var(--pp-color-danger)` | PASS stamp border and text during drag |
| `--pp-color-stamp-match` | `var(--pp-color-success)` | MATCH stamp border and text during drag |
| `--pp-color-action-match-bg` | `var(--pp-color-success)` | Match oval button fill in ActionBar |

Update `src/design/README.md` with the three new tokens.

---

## 5. File layout

| File | Action |
|---|---|
| `src/components/swipe/useSwipeGesture.js` | Create |
| `src/components/swipe/SwipeCard.jsx` | Create |
| `src/components/swipe/SwipeCard.css` | Create |
| `src/components/swipe/ActionBar.jsx` | Create |
| `src/components/swipe/ActionBar.css` | Create |
| `src/components/swipe/index.js` | Create — barrel export |
| `src/pages/feed/components/UserCard/UserCardContent.jsx` | Create — extract legacy content from UserCard |
| `src/pages/feed/components/UserCard/index.jsx` | Modify — compose SwipeCard + ActionBar + UserCardContent |
| `src/pages/feed/index.jsx` | Modify — remove Lottie overlays and accept/reject state |
| `src/design/tokens.css` | Modify — add §4 tokens |
| `src/design/README.md` | Modify — document new tokens |
| `docs/design/v2-mockup-reference.md` | Modify — feed mockup path + ActionBar notes + decision log |

**Out of scope:** FeedStack (SCRUM-77), v2 profile components (SCRUM-86), MatchOverlay (SCRUM-87), BottomNavBar (SCRUM-79), Storybook.

---

## 6. Architecture

```
feed/index.jsx
  └── UserCard (per card in stack — stack layout unchanged until SCRUM-77)
        ├── SwipeCard              drag shell + PASS/MATCH stamps
        │     └── UserCardContent  legacy layout (SCRUM-76) → v2 layout (SCRUM-86)
        └── ActionBar              Reject / Match / Share / Report
```

**Separation of concerns:**

| Layer | Responsibility |
|---|---|
| `useSwipeGesture` | Motion values, direction lock, threshold, keyboard, programmatic swipe |
| `SwipeCard` | Motion shell, stamp overlays, passes `children` |
| `ActionBar` | Presentational buttons; calls parent callbacks |
| `UserCardContent` | Profile data rendering only (no drag, no API) |
| `UserCard` | Composes shell + content + ActionBar; owns API calls |

**Data flow on swipe commit:**

1. `SwipeCard` / `useSwipeGesture` fires `onSwipeLeft` or `onSwipeRight`
2. `UserCard` handler calls `POST /match/saveMatch`, then `POST /match/getMatch`
3. On mutual match, `setMatch` propagates to feed (unchanged)
4. Front card removed from `users` state (unchanged)

---

## 7. useSwipeGesture

### API

```js
const gesture = useSwipeGesture({
  enabled: boolean,       // false in view-profile mode
  isActive: boolean,      // true only for front card — gates keyboard
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold: 120,         // px |x| to commit swipe (default 120)
  directionLockPx: 10,    // px before axis is locked (default 10)
});

// Returns:
{
  x,                    // MotionValue — horizontal offset
  rotate,               // MotionValue — derived rotation from x
  stampOpacity,         // MotionValue — 0–1 based on |x| / threshold
  stampDirection,       // 'left' | 'right' | null
  swipeProgrammatic,    // (direction: 'left' | 'right') => Promise<void>
  dragProps,            // spread onto motion.div: drag, onDragEnd, style, etc.
  isDragging,           // boolean
}
```

### Direction lock

On `pointerdown` / drag start, track cumulative `dx` and `dy`. Until `directionLockPx` is exceeded, do not commit to an axis.

- If `|dx| > |dy|` after lock threshold → **horizontal mode**: card drags on x-axis; vertical scroll on the card content is suppressed for this gesture.
- If `|dy| >= |dx|` after lock threshold → **vertical mode**: pointer events pass through to scrollable content; no horizontal drag for this gesture.

### Threshold and animation

- Commit swipe when `|x| >= threshold` on drag end or programmatic call.
- On commit: animate `x` to `±(viewport width)` over ~200ms, then fire callback and reset.
- On cancel (below threshold): spring `x` back to 0.

### Keyboard

When `isActive && enabled`:

- `ArrowRight` → `swipeProgrammatic('right')`
- `ArrowLeft` → `swipeProgrammatic('left')`

`ArrowUp` / `ArrowDown` remain in `UserCardContent` for the legacy image carousel until SCRUM-86 removes it.

Attach `keydown` listener only when `isActive` is true (fixes duplicate-listener issue noted in AUDIT.md).

### Rotation

Derive from x: `rotate = map(x, [-150, 150], [-18, 18])` (match existing UserCard feel).

---

## 8. SwipeCard

### API

```jsx
<SwipeCard
  gesture={gesture}           // return value of useSwipeGesture (called by parent)
  isStacked={boolean}         // back card in stack: scale 0.95, slight rotate offset
  className=""
>
  {children}
</SwipeCard>
```

`enabled`, `isActive`, `onSwipeLeft`, and `onSwipeRight` are passed to `useSwipeGesture` by the parent — not to `SwipeCard` directly.

### Card shell CSS (`.pp-swipe-card`)

| Property | Token |
|---|---|
| Background | `--pp-color-bg-surface` |
| Border radius | `--pp-radius-lg` |
| Box shadow (front card) | `--pp-shadow-card` |
| Max width | `100%` (parent constrains to `--pp-layout-max-card`) |
| Overflow | `hidden` on shell; children handle internal scroll |

### Stack visual (when `isStacked={true}`)

- `scale: 0.95`
- Static rotate offset: `±4deg` alternating per stack position (preserve existing feed behavior)
- No box shadow

### PASS / MATCH stamps

Rendered inside `.pp-swipe-card` at `z-index: var(--pp-z-overlay)`.

| Stamp | Position | Rotation | Colors |
|---|---|---|---|
| PASS | Top-left, inset `--pp-space-4` | `-15deg` | Border + text: `--pp-color-stamp-pass` |
| MATCH | Top-right, inset `--pp-space-4` | `+15deg` | Border + text: `--pp-color-stamp-match` |

- Font: `--pp-font-body`, `--pp-font-black`, `--pp-text-xl`
- Border: `3px solid` (current stamp color)
- Padding: `--pp-space-2` `--pp-space-4`
- Opacity: `clamp(|x| / threshold, 0, 1)` — PASS visible when `x < 0`, MATCH when `x > 0`
- Hidden when `|x| < 10` (no flicker on tap)

Programmatic swipes (ActionBar buttons) animate card off-screen; stamps are not required to appear for button-triggered swipes.

---

## 9. ActionBar

### API

```jsx
<ActionBar
  onReject={fn}
  onMatch={fn}
  onShare={fn}
  onReport={fn}
  disabled={boolean}
  className=""
/>
```

### Layout (from mockup)

```
┌─────────────────────────────────┐
│  [ 👎 Reject ]  [ 🤝 Match ]    │  ← row 1: two equal ovals
│  [ Share user with a friend ]   │  ← row 2: full-width black pill
│  [ Report User ]                │  ← row 3: full-width danger-subtle pill
└─────────────────────────────────┘
```

### Button styles

| Button | Background | Text | Radius |
|---|---|---|---|
| Reject | `--pp-color-action-reject-bg` | `--pp-color-action-reject-text` | `--pp-radius-full` |
| Match | `--pp-color-action-match-bg` | `--pp-color-text-on-surface` | `--pp-radius-full` |
| Share | `--pp-color-bg-app` | `--pp-color-text-primary` | `--pp-radius-full` |
| Report | `--pp-color-danger-subtle` | `--pp-color-danger` | `--pp-radius-full` |

- Container padding: `--pp-space-4`
- Gap between elements: `--pp-space-3`
- Row 1: `display: grid; grid-template-columns: 1fr 1fr`
- Rows 2–3: `width: 100%`
- `disabled`: `--pp-opacity-disabled` on all buttons; `pointer-events: none`
- `aria-label` on each button (Reject, Match, Share user, Report user)

### Desktop

`position: sticky; bottom: 0` within the card's scroll container. Background: `--pp-color-bg-surface` with top border `--pp-color-border` so content does not show through while scrolling.

---

## 10. UserCard refactor

### UserCardContent.jsx

Extract from current `UserCard/index.jsx` everything that renders profile data:

- Image carousel + DotProgress
- Name, age, budget, move-out date
- Bio, preference pills, hobbies
- Edit Profile button (view-own-profile case)

No Framer Motion drag, no API calls, no keyboard swipe handlers.

### UserCard/index.jsx (after refactor)

```jsx
const UserCard = ({ user, users, setUsers, images, setMatch, isRotated, feedOrViewProfile, ... }) => {
  const isFront = /* existing isKeyLast logic */;
  const enabled = feedOrViewProfile === 'feed';

  const handleSwipe = useCallback((isAMatch) => {
    // existing saveMatch + getMatch + setUsers logic
  }, [...]);

  const gesture = useSwipeGesture({
    enabled,
    isActive: isFront,
    onSwipeLeft: () => handleSwipe(false),
    onSwipeRight: () => handleSwipe(true),
  });

  return (
    <>
      <SwipeCard gesture={gesture} isStacked={!isFront}>
        <UserCardContent user={user} images={images} feedOrViewProfile={feedOrViewProfile} />
      </SwipeCard>
      {enabled && (
        <ActionBar
          onReject={() => gesture.swipeProgrammatic('left')}
          onMatch={() => gesture.swipeProgrammatic('right')}
          onShare={() => {}}   // stub
          onReport={() => {}}  // stub
          disabled={!isFront}
        />
      )}
    </>
  );
};
```

`useSwipeGesture` is called in `UserCard`; the returned `gesture` object is passed to `SwipeCard` as a prop. This keeps `swipeProgrammatic` available to `ActionBar` without refs or imperative handles.

### Unchanged behavior

- Feed API (`POST /feed/`) untouched
- Match detection and confetti overlay in `feed/index.jsx` untouched
- `view profile` mode: drag disabled, ActionBar hidden
- Stack rendering in `feed/index.jsx` untouched (FeedStack migration is SCRUM-77)

---

## 11. feed/index.jsx changes

**Remove:**

- `accept` / `reject` state
- `setAccept` / `setReject` props on `UserCard`
- `@lordicon/react` `Player` import and usage
- `thumbDownIcon` / `heartIcon` JSON requires
- Fixed-position heart/thumb overlay divs

**Keep:**

- Match state, confetti `Particles`, onboarding, feed loading, stack map logic

---

## 12. Desktop behavior

No desktop mockup. Apply these rules:

| Element | Behavior |
|---|---|
| Card column | Parent wrapper `max-width: var(--pp-layout-max-card); margin: 0 auto` (applied in SCRUM-77 FeedStack; interim: existing feed wrapper or minimal addition in SCRUM-76 if needed for ActionBar sticky to work) |
| App background | Black (`--pp-color-bg-app`) — full page chrome migration is SCRUM-86; SCRUM-76 may keep legacy gradient on feed page until then |
| ActionBar | Sticky at bottom of card scroll area |
| Drag | Mouse drag with same direction lock |
| Keyboard | Arrow keys on front card |
| Stamp/button sizes | Same as mobile — no desktop variant |

---

## 13. Barrel export

`src/components/swipe/index.js`:

```js
export { default as SwipeCard } from './SwipeCard';
export { default as ActionBar } from './ActionBar';
export { useSwipeGesture } from './useSwipeGesture';
```

---

## 14. Acceptance criteria

- [ ] `useSwipeGesture` implements direction lock (10px) and commit threshold (120px)
- [ ] `SwipeCard` accepts `children` and fires `onSwipeLeft` / `onSwipeRight` at threshold
- [ ] PASS/MATCH corner stamps appear during drag with correct colors and opacity
- [ ] `ActionBar` matches mockup layout; all CSS uses `--pp-*` tokens
- [ ] Reject/Match buttons trigger programmatic swipe with same API flow as drag
- [ ] `UserCard` composes `SwipeCard` + `ActionBar` + `UserCardContent` (legacy layout)
- [ ] `POST /match/saveMatch` and `POST /match/getMatch` behavior unchanged
- [ ] Lottie heart/thumb overlays removed from `feed/index.jsx`
- [ ] Keyboard `ArrowLeft` / `ArrowRight` work on front card only
- [ ] View-profile mode: no drag, no ActionBar
- [ ] Three new tokens in `tokens.css` documented in `src/design/README.md`
- [ ] No MUI imports in `src/components/swipe/` files
- [ ] `aria-label` on all ActionBar buttons

---

## 15. Testing / verification

Manual checks in PR (no automated tests required for SCRUM-76):

1. **Drag:** Swipe card left/right on mobile viewport — stamps fade in, card flies off, next card promoted
2. **Scroll:** Scroll bio section vertically — no accidental horizontal swipe
3. **Direction lock:** Diagonal gesture — axis locks correctly after ~10px
4. **Buttons:** Tap Reject/Match — same fly-off and API behavior as drag
5. **Keyboard:** Arrow keys on front card only; no duplicate swipes from back cards
6. **View profile:** Navigate to own profile — no drag, no ActionBar
7. **Match flow:** Mutual swipe still triggers match overlay (confetti)
8. **Desktop:** Resize 375px → 1280px — card respects max-width, ActionBar sticky
9. **DevTools:** Grep new swipe files for hardcoded hex — none outside tokens
10. **Legacy pages:** Sign-in, chat load without regression

---

## 16. Downstream usage (not this ticket)

| Consumer | Ticket | Uses |
|---|---|---|
| FeedStack layout | SCRUM-77 | Renders stacked `SwipeCard` children |
| Home feed v2 content | SCRUM-86 | Replaces `UserCardContent`; wires Share/Report |
| Match overlay | SCRUM-87 | Triggered by existing match detection in feed |
| Listing card | SCRUM-94 | `SwipeCard` + `ActionBar` + `ListingCardContent` |

---

## 17. Implementation commits (suggested atomic split)

1. `feat(design): add swipe action and stamp tokens [SCRUM-76]` — `tokens.css`, `README.md`
2. `feat(swipe): add useSwipeGesture hook [SCRUM-76]`
3. `feat(swipe): add SwipeCard with PASS/MATCH stamps [SCRUM-76]`
4. `feat(swipe): add ActionBar primitive [SCRUM-76]` — includes barrel export
5. `refactor(feed): compose UserCard with SwipeCard shell [SCRUM-76]` — UserCardContent extraction, remove Lottie

Single commit acceptable if preferred.

---

## 18. Mockup reference updates

Update `docs/design/v2-mockup-reference.md`:

- Add `docs/design/assets/feed-card-mobile.png` to screenshot sources
- Expand ActionBar row with token mapping
- Add swipe/stamp decisions to decision log
- Note FeedHeader / HeroImageOverlay / AboutMe / PromptCard remain SCRUM-86

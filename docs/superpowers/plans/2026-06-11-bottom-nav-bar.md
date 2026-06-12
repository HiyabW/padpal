# BottomNavBar (SCRUM-79) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace legacy top `NavBar` with iOS-style glass `BottomNavBar` on authenticated routes.

**Architecture:** `BottomNavBar` is a fixed bottom dock with four MUI icon buttons, a sliding absolute indicator positioned via `offsetLeft`, and CSS keyframe bounce on tab change. `App.js` swaps imports and adds `/rooms` stub. Spec: `docs/superpowers/specs/2026-06-11-bottom-nav-bar-design.md`.

**Tech Stack:** React 18 · React Router · MUI icons only · CSS custom properties (`--pp-*`) · no MUI layout components in new files

**Branch:** `feature/SCRUM-79-bottom-nav-bar` (cut from `padpal-v2`)

**Testing note:** Manual verification only (per spec §9). No automated component tests in this ticket.

---

## File map

| File | Responsibility |
|---|---|
| `src/design/tokens.css` | Optional nav glass/indicator/border tokens |
| `src/design/README.md` | Document new nav tokens |
| `src/components/nav/BottomNavBar.jsx` | Tab buttons, indicator, navigation logic |
| `src/components/nav/BottomNavBar.css` | Glass dock, indicator, bounce, badge styles |
| `src/components/nav/index.js` | Barrel export |
| `src/pages/rooms/index.jsx` | Minimal Rooms placeholder |
| `src/App.js` | Swap NavBar → BottomNavBar; add `/rooms` route; content padding |
| `src/App.css` | Bottom padding when nav visible (if not inline in App.js) |

---

### Task 0: Create feature branch

**Files:** None (git only)

- [ ] **Step 1: Cut branch from padpal-v2**

```bash
git checkout padpal-v2
git pull origin padpal-v2
git checkout -b feature/SCRUM-79-bottom-nav-bar
```

Expected: branch created.

---

### Task 1: Add nav tokens

**Files:**
- Modify: `src/design/tokens.css` (after `--pp-shadow-nav` block)
- Modify: `src/design/README.md` (Colors or new Nav section)

- [ ] **Step 1: Add tokens to tokens.css**

Insert after `--pp-shadow-nav`:

```css
  --pp-color-nav-glass: rgba(72, 72, 74, 0.42);
  --pp-color-nav-indicator: rgba(255, 255, 255, 0.26);
  --pp-color-nav-border: rgba(255, 255, 255, 0.14);
```

- [ ] **Step 2: Document in README.md**

Add a **Nav** subsection under Colors:

```markdown
| `--pp-color-nav-glass` | Bottom nav dock background |
| `--pp-color-nav-indicator` | Active tab pill |
| `--pp-color-nav-border` | Dock border highlight |
```

- [ ] **Step 3: Commit**

```bash
git add src/design/tokens.css src/design/README.md
git commit -m "$(cat <<'EOF'
feat(design): add bottom nav glass tokens [SCRUM-79]

EOF
)"
```

---

### Task 2: BottomNavBar component

**Files:**
- Create: `src/components/nav/BottomNavBar.jsx`
- Create: `src/components/nav/BottomNavBar.css`
- Create: `src/components/nav/index.js`

- [ ] **Step 1: Create BottomNavBar.css**

```css
.pp-bottom-nav-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  padding: 0 var(--pp-space-4) calc(var(--pp-space-4) + var(--pp-safe-bottom));
  z-index: var(--pp-z-nav);
  pointer-events: none;
}

.pp-bottom-nav {
  --pp-nav-tab-size: 52px;
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 2px;
  padding: 4px;
  height: 52px;
  max-width: var(--pp-layout-max-nav);
  width: 100%;
  overflow: hidden;
  border-radius: var(--pp-radius-full);
  background: var(--pp-color-nav-glass);
  backdrop-filter: blur(40px) saturate(190%);
  -webkit-backdrop-filter: blur(40px) saturate(190%);
  border: 1px solid var(--pp-color-nav-border);
  box-shadow:
    var(--pp-shadow-nav),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.12);
  transform-origin: center center;
}

.pp-bottom-nav.is-bouncing {
  animation: pp-nav-spring 0.36s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
}

@keyframes pp-nav-spring {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.022); }
  70%  { transform: scale(0.992); }
  100% { transform: scale(1); }
}

.pp-bottom-nav__indicator {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  width: var(--pp-nav-tab-size);
  border-radius: var(--pp-radius-full);
  background: var(--pp-color-nav-indicator);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.2);
  z-index: 0;
  pointer-events: none;
  transition: transform 0.34s cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform;
}

.pp-bottom-nav__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 var(--pp-nav-tab-size);
  width: var(--pp-nav-tab-size);
  height: 100%;
  border: none;
  border-radius: var(--pp-radius-full);
  background: transparent;
  cursor: pointer;
  position: relative;
  z-index: 1;
  padding: 0;
  color: var(--pp-color-text-primary);
}

.pp-bottom-nav__tab:focus-visible {
  outline: 2px solid var(--pp-color-border-focus);
  outline-offset: 2px;
}

.pp-bottom-nav__tab svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
  display: block;
  transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}

.pp-bottom-nav__tab[aria-current="page"] svg {
  transform: scale(1.05);
}

.pp-bottom-nav__badge {
  position: absolute;
  bottom: 9px;
  right: 10px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--pp-color-accent);
  z-index: 2;
}
```

- [ ] **Step 2: Create BottomNavBar.jsx**

```jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import GroupsIcon from "@mui/icons-material/Groups";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatBubbleOutlinedIcon from "@mui/icons-material/ChatBubbleOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useAuth } from "../../context/AuthContext";
import "./BottomNavBar.css";

const TABS = [
  { id: "home", label: "Home", path: "/feed", match: (p) => p === "/feed" },
  { id: "rooms", label: "Rooms", path: "/rooms", match: (p) => p === "/rooms" },
  { id: "chat", label: "Chat", path: "/chat", match: (p) => p === "/chat" },
  {
    id: "profile",
    label: "Profile",
    path: "/viewProfile",
    match: (p) => p === "/viewProfile" || p === "/editProfile",
  },
];

const ICONS = {
  home: { filled: HomeIcon, outlined: HomeOutlinedIcon },
  rooms: { filled: GroupsIcon, outlined: GroupsOutlinedIcon },
  chat: { filled: ChatBubbleIcon, outlined: ChatBubbleOutlinedIcon },
  profile: { filled: PersonIcon, outlined: PersonOutlineIcon },
};

function BottomNavBar({ showChatBadge = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dockRef = useRef(null);
  const tabRefs = useRef({});
  const [indicatorX, setIndicatorX] = useState(0);

  const activeTab =
    TABS.find((t) => t.match(location.pathname))?.id ?? "home";

  const moveIndicator = useCallback(() => {
    const btn = tabRefs.current[activeTab];
    if (!btn) return;
    setIndicatorX(btn.offsetLeft);
  }, [activeTab]);

  useEffect(() => {
    moveIndicator();
    window.addEventListener("resize", moveIndicator);
    return () => window.removeEventListener("resize", moveIndicator);
  }, [moveIndicator]);

  function triggerSpring() {
    const dock = dockRef.current;
    if (!dock) return;
    dock.classList.remove("is-bouncing");
    void dock.offsetWidth;
    dock.classList.add("is-bouncing");
    const onEnd = () => dock.classList.remove("is-bouncing");
    dock.addEventListener("animationend", onEnd, { once: true });
  }

  function handleTabClick(tab) {
    if (tab.id === activeTab) return;
    if (tab.id === "profile") {
      if (!user?.id) return;
      navigate(`/viewProfile?id=${user.id}`);
    } else {
      navigate(tab.path);
    }
    triggerSpring();
  }

  return (
    <div className="pp-bottom-nav-wrap">
      <nav
        ref={dockRef}
        className="pp-bottom-nav"
        aria-label="Bottom navigation"
      >
        <div
          className="pp-bottom-nav__indicator"
          aria-hidden="true"
          style={{ transform: `translateX(${indicatorX}px)` }}
        />
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = isActive
            ? ICONS[tab.id].filled
            : ICONS[tab.id].outlined;
          const chatLabel =
            tab.id === "chat" && showChatBadge
              ? "Chat, unread messages"
              : tab.label;

          return (
            <button
              key={tab.id}
              type="button"
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              className="pp-bottom-nav__tab"
              aria-label={chatLabel}
              aria-current={isActive ? "page" : undefined}
              onClick={() => handleTabClick(tab)}
            >
              <Icon aria-hidden="true" />
              {tab.id === "chat" && showChatBadge && (
                <span className="pp-bottom-nav__badge" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default BottomNavBar;
```

- [ ] **Step 3: Create index.js**

```js
export { default as BottomNavBar } from "./BottomNavBar";
```

- [ ] **Step 4: Commit**

```bash
git add src/components/nav/
git commit -m "$(cat <<'EOF'
feat(nav): add BottomNavBar glass dock component [SCRUM-79]

EOF
)"
```

---

### Task 3: Rooms placeholder + App.js integration

**Files:**
- Create: `src/pages/rooms/index.jsx`
- Modify: `src/App.js`
- Modify: `src/App.css`

- [ ] **Step 1: Create rooms placeholder**

```jsx
import React from "react";

function Rooms() {
  return (
    <div
      className="centeredDiv gradient-background2"
      style={{ minHeight: "100dvh", padding: "var(--pp-space-6)" }}
    >
      <h1 style={{ color: "var(--pp-color-text-primary)" }}>Rooms</h1>
      <p style={{ color: "var(--pp-color-text-muted)" }}>Coming soon.</p>
    </div>
  );
}

export default Rooms;
```

- [ ] **Step 2: Update App.js**

Replace `NavBar` import with:

```jsx
import { BottomNavBar } from './components/nav';
```

Add lazy import:

```jsx
const Rooms = React.lazy(() => import('./pages/rooms'));
```

Replace nav render:

```jsx
const hideNav = location.pathname === '/' || location.pathname === '/survey';
// ...
<div className={hideNav ? 'App' : 'App App--with-bottom-nav'}>
  {!hideNav && <BottomNavBar />}
```

Add route:

```jsx
<Route exact path='/rooms' element={<Rooms />} />
```

- [ ] **Step 3: Add App.css padding**

```css
.App--with-bottom-nav {
  padding-bottom: calc(72px + var(--pp-safe-bottom));
}
```

- [ ] **Step 4: Manual smoke test**

Run: `npm run serve`

Checklist:
- `/feed` shows bottom nav; `/` does not
- Tab switches update active icon and sliding pill
- `/rooms` loads placeholder
- Profile navigates to `/viewProfile?id=...`

- [ ] **Step 5: Commit**

```bash
git add src/pages/rooms/index.jsx src/App.js src/App.css
git commit -m "$(cat <<'EOF'
feat(nav): wire BottomNavBar in App and add rooms stub [SCRUM-79]

EOF
)"
```

---

### Task 4: Open PR

**Files:** None

- [ ] **Step 1: Push and open PR per WORKFLOW.md template**

```bash
git push -u origin feature/SCRUM-79-bottom-nav-bar
gh pr create --title "feat(nav): BottomNavBar glass dock [SCRUM-79]" --body "$(cat <<'EOF'
## Summary
- Replace legacy top NavBar with iOS-style glass BottomNavBar (4 icon tabs)
- Sliding active pill, subtle dock bounce, lime unread dot prop on Chat
- Add `/rooms` placeholder route

## Test plan
- [ ] `/feed`, `/chat`, `/viewProfile`, `/rooms` show bottom nav
- [ ] `/` and `/survey` hide nav
- [ ] Active pill stays inside dock on tab switch
- [ ] Icons outlined → filled on active tab
- [ ] Safe area padding on mobile viewport
- [ ] Desktop nav max 400px centered

EOF
)"
```

- [ ] **Step 2: Move Jira SCRUM-79 to In Review**

---

## Spec coverage self-check

| Spec requirement | Task |
|---|---|
| Four icon-only tabs | Task 2 |
| MUI outlined/filled icons | Task 2 |
| Glass dock + blur | Task 1, 2 |
| Sliding indicator (no overshoot) | Task 2 CSS |
| Dock bounce | Task 2 CSS + JS |
| Lime badge, no border | Task 2 CSS |
| Safe area | Task 2 CSS wrap padding |
| Desktop max-width | Task 2 CSS |
| App.js swap | Task 3 |
| /rooms placeholder | Task 3 |
| showChatBadge prop | Task 2 |
| Nav tokens | Task 1 |
| Content bottom padding | Task 3 |

# BottomNavBar (SCRUM-79) — Design Spec

**Version 1.0 | June 11, 2026**  
**Status:** Approved  
**Jira:** [SCRUM-79](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-79) · Epic [SCRUM-72](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-72)  
**Depends on:** [SCRUM-74](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-74) (design tokens)  
**Blocks:** [SCRUM-83](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-83) (AppShell layout)

**Branch:** `feature/SCRUM-79-bottom-nav-bar`

**Visual authority:** Brainstorm mockup v6 — `.superpowers/brainstorm/93698-1781222773/content/bottom-nav-reference-match-v6.html` (iOS reference match)

---

## 1. Summary

Replace the legacy top `NavBar` (`src/components/navBar/index.jsx`) with a floating bottom navigation dock for authenticated routes. Four icon-only tabs: **Home**, **Rooms**, **Chat**, **Profile**. iOS-style glassmorphism (dark translucent pill, strong backdrop blur), monochrome white MUI icons (outlined when inactive, filled when active), light-grey sliding active pill, subtle dock bounce on tab change, and a solid lime unread dot on Chat (no border ring).

Wire into `App.js` on authenticated routes. Full `AppShell` layout wrapper is **SCRUM-83** — this ticket performs a direct swap only.

---

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Tab labels | **Icon-only** (no text labels) — matches iOS reference |
| Active state | Light-grey pill behind icon (`rgba(255,255,255,0.26)`), not lime |
| Icons | MUI `@mui/icons-material`: `Home`/`HomeOutlined`, `Groups`/`GroupsOutlined`, `ChatBubble`/`ChatBubbleOutlined`, `Person`/`PersonOutline` |
| Glass effect | `backdrop-filter: blur(40px) saturate(190%)`; dark translucent bg |
| Active indicator | Sliding pill; fixed 52px tab width; deceleration easing (no overshoot); `overflow: hidden` on dock |
| Dock microinteraction | Subtle scale bounce on tab tap (~2% peak, ~360ms) |
| Unread badge | 7px solid `--pp-color-accent` dot on Chat; **no border** |
| Desktop | Floating pill, `max-width: var(--pp-layout-max-nav)` (400px), centered |
| Safe area | `padding-bottom: var(--pp-safe-bottom)` on dock wrapper |
| Routes | Home→`/feed`, Rooms→`/rooms`, Chat→`/chat`, Profile→`/viewProfile?id={userId}` |
| Rooms | Placeholder route/page ok until Rooms epic |
| Logout | Removed from nav (was on legacy top bar); profile/settings later |
| Unread wiring | `showChatBadge` boolean prop; default `false` until chat unread API exists |
| Implementation | Native HTML + co-located CSS (`pp-` BEM); MUI icons only (same as legacy nav) |
| MUI elsewhere | No MUI `Box`/`Tooltip` in new component files |

---

## 3. Ticket boundaries

### SCRUM-79 — BottomNavBar

```
Branch: feature/SCRUM-79-bottom-nav-bar
Spec: docs/superpowers/specs/2026-06-11-bottom-nav-bar-design.md

## Delivers
- BottomNavBar.jsx + BottomNavBar.css under src/components/nav/
- src/components/nav/index.js barrel export
- Optional nav glass/indicator tokens in tokens.css + README
- Replace legacy NavBar with BottomNavBar in App.js (authenticated routes only)
- /rooms placeholder route (minimal stub page or redirect) if not present
- Active route detection + navigation
- Safe-area bottom padding
- Sliding indicator + dock bounce animations per mockup v6
- Chat unread dot via showChatBadge prop (false by default)

## Does NOT deliver
- AppShell layout wrapper (SCRUM-83)
- Sign-in / survey chrome changes beyond hiding nav
- Chat unread count backend wiring
- Rooms feature UI (SCRUM-88+)
- Profile/settings logout UI
- Feed page chrome / FeedHeader (SCRUM-86)
```

---

## 4. Component API

```jsx
<BottomNavBar showChatBadge={false} />
```

Internal behavior:
- Reads `useLocation()` for active tab
- Reads `useNavigate()` for tab clicks
- Reads `useAuth()` for profile route (`user.id`)
- Renders fixed `position` bottom dock; does not wrap page content

### Tab → route mapping

| Tab | Path match | Navigate to |
|---|---|---|
| Home | `/feed` | `/feed` |
| Rooms | `/rooms` | `/rooms` |
| Chat | `/chat` | `/chat` |
| Profile | `/viewProfile` | `/viewProfile?id={user.id}` |

Profile is active when pathname is `/viewProfile` or `/editProfile`.

---

## 5. Visual spec

### Dock container (`.pp-bottom-nav`)

| Property | Value |
|---|---|
| Position | `fixed`; bottom `var(--pp-space-4)` + safe area; horizontal center |
| Max width | `var(--pp-layout-max-nav)` |
| Height | 52px inner + 4px padding |
| Border radius | `var(--pp-radius-full)` |
| Background | `rgba(72, 72, 74, 0.42)` → tokenize as `--pp-color-nav-glass` |
| Backdrop | `blur(40px) saturate(190%)` |
| Border | `1px solid rgba(255,255,255,0.14)` |
| Shadow | `var(--pp-shadow-nav)` + inset highlight |
| Overflow | `hidden` (clamp sliding indicator) |
| Z-index | `var(--pp-z-nav)` |

### Tabs (`.pp-bottom-nav__tab`)

| Property | Value |
|---|---|
| Size | 52×44px hit area (fixed `flex: 0 0 52px`) |
| Icons | 24px; `fill: #fff` / `var(--pp-color-text-primary)` |
| Inactive | Outlined MUI icon |
| Active | Filled MUI icon; `transform: scale(1.05)` on icon |
| aria | `aria-label` per tab; `aria-current="page"` on active |

### Active indicator (`.pp-bottom-nav__indicator`)

| Property | Value |
|---|---|
| Position | Absolute; `top/bottom: 4px`; width 52px |
| Background | `rgba(255,255,255,0.26)` → `--pp-color-nav-indicator` |
| Border radius | `var(--pp-radius-full)` |
| Transition | `transform 0.34s cubic-bezier(0.32, 0.72, 0, 1)` only |
| Positioning | `translateX(tab.offsetLeft)` — no width tween |

### Dock bounce (`.pp-bottom-nav.is-bouncing`)

```css
@keyframes pp-nav-spring {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.022); }
  70%  { transform: scale(0.992); }
  100% { transform: scale(1); }
}
```

Duration ~360ms; `transform-origin: center`.

### Unread badge (`.pp-bottom-nav__badge`)

| Property | Value |
|---|---|
| Size | 7×7px |
| Color | `var(--pp-color-accent)` |
| Border | **none** |
| Position | Bottom-right of Chat icon |

---

## 6. App integration

### App.js changes

- Import `BottomNavBar` from `src/components/nav`
- Show when `location.pathname` is not `/`, `/survey` (same guard as legacy nav)
- Remove `NavBar` import/usage
- Add `/rooms` route → minimal placeholder (`<div>Rooms coming soon</div>` or dedicated stub component)

### Page content offset

Until SCRUM-83 AppShell, pages may need bottom padding so content is not obscured by the fixed dock. Add a global utility or `App.css` rule:

```css
.App:has(.pp-bottom-nav) .page-content,
/* or per-route wrapper */
padding-bottom: calc(72px + var(--pp-safe-bottom));
```

Prefer minimal approach: add `padding-bottom` on `.App` when nav is visible, or document that SCRUM-83 owns full shell spacing. **Recommendation:** add `padding-bottom` on authenticated route wrapper in `App.js` for this ticket.

### Legacy nav

Keep `src/components/navBar/` untouched (delete in SCRUM-83 or chore). Do not import it after swap.

---

## 7. New tokens (optional but recommended)

| Token | Value | Usage |
|---|---|---|
| `--pp-color-nav-glass` | `rgba(72, 72, 74, 0.42)` | Dock background |
| `--pp-color-nav-indicator` | `rgba(255, 255, 255, 0.26)` | Active pill |
| `--pp-color-nav-border` | `rgba(255, 255, 255, 0.14)` | Dock border |

---

## 8. Accessibility

- Each tab is a `<button type="button">` with `aria-label`
- Active tab: `aria-current="page"`
- Badge: `aria-hidden="true"` on decorative dot; parent Chat button gets `aria-label="Chat, unread messages"` when badge visible
- Keyboard: buttons are focusable; visible focus ring using `--pp-color-border-focus`

---

## 9. Testing (manual PR checklist)

- [ ] Authenticated routes show bottom nav; `/` and `/survey` do not
- [ ] Four tabs navigate correctly; active pill slides without leaving dock bounds
- [ ] Dock bounce plays on tab change (subtle)
- [ ] Icons switch outlined ↔ filled on active tab
- [ ] Chat badge shows when `showChatBadge={true}`; solid lime, no border
- [ ] Safe area respected on iOS simulator or DevTools device mode
- [ ] Desktop: nav centered, max 400px wide
- [ ] `/rooms` placeholder loads without error
- [ ] No regression: feed, chat, profile still load

---

## 10. References

- Mockup v6: `.superpowers/brainstorm/93698-1781222773/content/bottom-nav-reference-match-v6.html`
- Legacy nav: `src/components/navBar/index.jsx`
- Tokens: `src/design/tokens.css`, `src/design/README.md`
- Decision log: `docs/design/v2-mockup-reference.md`

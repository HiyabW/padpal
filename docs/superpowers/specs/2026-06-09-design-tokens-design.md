# Design Token Sheet (SCRUM-74) — Design Spec

**Version 1.1 | June 9, 2026**  
**Status:** Approved — implemented in SCRUM-74  
**Jira:** [SCRUM-74](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-74) · Epic [SCRUM-72](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-72)  
**Blocks:** SCRUM-75 (Form primitives), SCRUM-76 (SwipeCard), SCRUM-77 (FeedStack), SCRUM-78 (MatchOverlay), SCRUM-79 (BottomNavBar)

---

## 1. Summary

Establish a single source of truth for PadPal v2 visual design by creating `src/design/tokens.css` with semantic CSS custom properties derived from the approved Home feed mockup. The new palette (black shell, white cards, lime accent) becomes **canonical**. Legacy `--theme-*` variables in `src/index.css` are preserved as thin aliases pointing at new `--pp-*` tokens so unmigrated pages do not break.

This ticket delivers tokens and documentation only — no components, no feed page migration (SCRUM-86).

---

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Palette authority | New mockup palette is canonical; legacy aliases bridge old names |
| Body typography | **Inter** for all UI text (headings, bio, buttons, labels, nav) |
| Logo typography | **Inter Black (900)** — same family as body; approximates mockup boldness without a Druk Wide license |
| Display font removal | **DM Serif Display** removed from imports; no longer used |
| Font delivery | **Inter only** via Google Fonts variable import (weights 100–900) |
| Scratch notes | Temporary `docs/design/v2-mockup-reference.md` for downstream tickets; delete after SCRUM-79 + SCRUM-86 |
| Future upgrade | When licensed, swap `--pp-font-logo` to Druk Wide Bold via `@font-face` — no component changes needed |

---

## 3. Typography

### Single-font stack

PadPal v2 uses **Inter exclusively**. No proprietary or self-hosted fonts in SCRUM-74.

The mockup logo uses Druk Wide Bold, which requires a commercial license. Until the startup can purchase it, the logo uses **Inter at weight 900 (Black)** for comparable visual weight. Druk Wide is also ultra-expanded; Inter Black will not match its width — that is an accepted beta trade-off.

### Implementation plan

1. Keep (or relocate) the existing Google Fonts Inter variable import covering weights `100..900`
2. Remove the DM Serif Display `@import`
3. Define logo-specific tokens:

```css
--pp-font-body: 'Inter', sans-serif;
--pp-font-logo: var(--pp-font-body);
--pp-font-logo-weight: 900;
--pp-logo-letter-spacing: -0.01em; /* slight tightening; tune in SCRUM-79/86 if needed */
```

4. Logo elements use `.pp-logo` with `font-family: var(--pp-font-logo); font-weight: var(--pp-font-logo-weight);`

### Future Druk Wide upgrade path

When a license is acquired:

1. Add `public/fonts/DrukWide-Bold.woff2` + `@font-face`
2. Change `--pp-font-logo` to `'Druk Wide Bold', var(--pp-font-body)`
3. Reset `--pp-font-logo-weight` to `700` (Druk Wide Bold's native weight)

No component rewrites required — only token values change.

---

## 4. File layout

| File | Action | Purpose |
|---|---|---|
| `src/design/tokens.css` | Create | All `--pp-*` tokens + Inter Google Fonts import |
| `src/design/README.md` | Create | Permanent token catalog for agents and humans |
| `docs/design/v2-mockup-reference.md` | Create | **Temporary** component inventory from mockup screenshots |
| `src/index.css` | Modify | `@import './design/tokens.css'`; legacy `--theme-*` aliases |
| `src/index.js` | Verify | Import order unchanged (index.css already imported) |

**Out of scope:** Component files, feed page CSS, MUI theme refactor, deleting hardcoded hex in existing page stylesheets.

---

## 5. Token naming convention

Prefix: `--pp-` (PadPal). Use **semantic** names, not literal color names.

### 5.1 Color — core

| Token | Value | Usage |
|---|---|---|
| `--pp-color-bg-app` | `#000000` | App shell, feed outer background |
| `--pp-color-bg-surface` | `#FFFFFF` | Cards, modals, compatibility box |
| `--pp-color-bg-elevated` | `rgba(255,255,255,0.08)` | Glass nav background |
| `--pp-color-accent` | `#DFFF00` | Active nav, "New here" badge, primary highlights |
| `--pp-color-accent-muted` | `#C8E600` | Hover/pressed accent states |
| `--pp-color-success` | `#68ED76` | Match button, match overlay (tune at SCRUM-86 if mockup differs) |
| `--pp-color-text-primary` | `#FFFFFF` | Text on dark backgrounds |
| `--pp-color-text-on-surface` | `#000000` | Text on white cards |
| `--pp-color-text-muted` | `#6B7280` | Section labels ("ABOUT ME"), secondary copy |
| `--pp-color-text-subtle` | `rgba(255,255,255,0.7)` | Overlays on hero images |
| `--pp-color-border` | `rgba(0,0,0,0.08)` | Card borders, dividers |
| `--pp-color-action-reject-bg` | `#E8E8E8` | Reject button background |
| `--pp-color-action-reject-text` | `#000000` | Reject button label |
| `--pp-color-danger-subtle` | `#FEE2E2` | Report button background |
| `--pp-color-danger` | `#DC2626` | Report button text |

### 5.2 Color — attribute tags

Per-mockup pill hues (used by SCRUM-86 UserCardContent):

| Token | Approx. value | Example trait |
|---|---|---|
| `--pp-color-tag-purple` | `#E9D5FF` | Zodiac |
| `--pp-color-tag-grey` | `#E5E7EB` | Smoking |
| `--pp-color-tag-orange` | `#FFEDD5` | Guests |
| `--pp-color-tag-red` | `#FECACA` | Drinking |
| `--pp-color-tag-yellow` | `#FEF08A` | Identity |
| `--pp-color-tag-teal` | `#CCFBF1` | Cleanliness |
| `--pp-color-tag-text` | `#000000` | Tag label text |

### 5.3 Typography

| Token | Value |
|---|---|
| `--pp-font-body` | `'Inter', sans-serif` |
| `--pp-font-logo` | `var(--pp-font-body)` |
| `--pp-font-logo-weight` | `900` |
| `--pp-logo-letter-spacing` | `-0.01em` |
| `--pp-font-regular` | `400` |
| `--pp-font-medium` | `500` |
| `--pp-font-semibold` | `600` |
| `--pp-font-bold` | `700` |
| `--pp-font-black` | `900` |
| `--pp-text-xs` | `0.75rem` |
| `--pp-text-sm` | `0.875rem` |
| `--pp-text-base` | `1rem` |
| `--pp-text-lg` | `1.125rem` |
| `--pp-text-xl` | `1.25rem` |
| `--pp-text-2xl` | `1.5rem` |
| `--pp-text-3xl` | `1.875rem` |
| `--pp-text-4xl` | `2.25rem` |
| `--pp-leading-tight` | `1.2` |
| `--pp-leading-normal` | `1.5` |
| `--pp-leading-relaxed` | `1.625` |

**Usage rule:** All new components use `--pp-font-body` at appropriate weights. Only elements with class `.pp-logo` (or equivalent) apply `--pp-font-logo` + `--pp-font-logo-weight` (900).

### 5.4 Spacing (4px grid)

| Token | Value |
|---|---|
| `--pp-space-1` | `4px` |
| `--pp-space-2` | `8px` |
| `--pp-space-3` | `12px` |
| `--pp-space-4` | `16px` |
| `--pp-space-5` | `20px` |
| `--pp-space-6` | `24px` |
| `--pp-space-8` | `32px` |
| `--pp-space-10` | `40px` |
| `--pp-space-12` | `48px` |

### 5.5 Radii

| Token | Value | Usage |
|---|---|---|
| `--pp-radius-sm` | `8px` | Small pills, tags |
| `--pp-radius-md` | `16px` | Buttons, inner containers |
| `--pp-radius-lg` | `24px` | Card corners, hero image top |
| `--pp-radius-xl` | `32px` | Bottom nav pill, large cards |
| `--pp-radius-full` | `9999px` | Ovals (Match/Reject) |

### 5.6 Shadows

| Token | Value |
|---|---|
| `--pp-shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` |
| `--pp-shadow-card` | `0 10px 30px rgba(0,0,0,0.15)` |
| `--pp-shadow-nav` | `0 4px 24px rgba(0,0,0,0.4)` |

### 5.7 Z-index

| Token | Value | Layer |
|---|---|---|
| `--pp-z-base` | `0` | Default content |
| `--pp-z-card` | `10` | Stacked swipe cards |
| `--pp-z-header` | `20` | Feed header |
| `--pp-z-nav` | `30` | Bottom nav |
| `--pp-z-overlay` | `40` | Match overlay, swipe stamps |
| `--pp-z-modal` | `50` | Modals, tooltips |

### 5.8 Safe area

| Token | Value |
|---|---|
| `--pp-safe-top` | `env(safe-area-inset-top, 0px)` |
| `--pp-safe-right` | `env(safe-area-inset-right, 0px)` |
| `--pp-safe-bottom` | `env(safe-area-inset-bottom, 0px)` |
| `--pp-safe-left` | `env(safe-area-inset-left, 0px)` |

Existing `--safe-area-*` variables become aliases to `--pp-safe-*`.

### 5.9 Layout (for downstream tickets)

| Token | Value | Notes |
|---|---|---|
| `--pp-layout-max-card` | `480px` | Desktop centered card width |
| `--pp-layout-max-nav` | `400px` | Desktop bottom nav pill width |

---

## 6. Legacy alias bridge

In `src/index.css`, after importing `tokens.css`, map old variables to new tokens:

```css
--theme-background-color-dark: var(--pp-color-bg-app);
--theme-feed-background-color: var(--pp-color-bg-app);
--theme-primary-color: var(--pp-color-accent);
--theme-dark-mode-primary-text: var(--pp-color-text-primary);
--theme-dark-mode-secondary-text: var(--pp-color-text-subtle);
--theme-dark-background-color: var(--pp-color-bg-app);
--theme-dark-background-color-2: var(--pp-color-bg-elevated);
--theme-primary-font-family: var(--pp-font-body);
--theme-secondary-font-family: var(--pp-font-body);
--bs-primary: var(--pp-color-accent);
--safe-area-top: var(--pp-safe-top);
--safe-area-right: var(--pp-safe-right);
--safe-area-bottom: var(--pp-safe-bottom);
--safe-area-left: var(--pp-safe-left);
```

**Effects:** Unmigrated pages immediately pick up black background and lime accent where they used `--theme-*` vars. Hardcoded hex in page CSS (e.g. `#3a74e5`, `#68ed76` in feed styles) remains until each page's migration ticket.

Remove DM Serif Display `@import` when aliases are in place.

---

## 7. Temporary mockup reference doc

Create `docs/design/v2-mockup-reference.md` in the SCRUM-74 PR with:

```markdown
# TEMP — PadPal v2 Mockup Reference
Delete when SCRUM-79 + SCRUM-86 are merged.

## Screenshot sources
- Feed card (full scroll): `assets/image-b40cc62a-f172-4443-be5e-10a04d7b514d.png`
- Feed with bottom nav: `assets/image-4b299347-8142-486c-b3ac-99d5ffcd2028.png`

## Component inventory (build in later tickets)
| Component | Ticket | Notes |
|---|---|---|
| FeedHeader | SCRUM-86 | Black bar, Inter Black logo (`.pp-logo`), rewind + filter, dot progress |
| HeroImageOverlay | SCRUM-86 | Share, "New here", name/age, distance, socials, compatibility box |
| AboutMeSection | SCRUM-86 | Muted label, bold bio, attribute pills |
| PromptCard | SCRUM-86 | Icon + title + answer |
| ActionBar | SCRUM-76/86 | Reject/Match ovals, Share/Report full-width |
| BottomNavBar | SCRUM-79 | Glass pill, lime active Home tab |

## Desktop (mobile-first)
- Card max-width 480px, centered on black bg
- Action bar sticky at bottom of card column
- Bottom nav floating pill, max-width 400px, centered

## Decision log
- Logo font: Inter Black (900) — Druk Wide deferred until license purchased
- (updated per ticket)
```

---

## 8. `src/design/README.md` contents

One-page reference covering:

- How to import tokens (automatic via `index.css`)
- Naming convention (`--pp-*`)
- Color, type, spacing tables (condensed from section 5)
- Logo styling (`.pp-logo` — Inter weight 900, not a separate typeface)
- Rule: **new components must not use hardcoded hex/rgb** — use tokens
- Link to temporary mockup reference doc

---

## 9. Acceptance criteria (SCRUM-74)

- [ ] `src/design/tokens.css` defines all tokens in section 5
- [ ] Inter loaded with full weight range (100–900); DM Serif Display import removed
- [ ] Logo tokens (`--pp-font-logo-weight: 900`) defined; no proprietary font files in repo
- [ ] `src/index.css` imports tokens and maps legacy `--theme-*` aliases
- [ ] `src/design/README.md` documents token catalog
- [ ] `docs/design/v2-mockup-reference.md` created with component inventory
- [ ] Safe-area tokens preserved for Capacitor
- [ ] No new hardcoded color values in token/README files
- [ ] Existing page behavior unchanged (no component refactors in this PR)

---

## 10. Testing / verification

Manual checks after implementation:

1. App loads without font-related console errors
2. `body` renders Inter; `.pp-logo` test element renders at weight 900
3. Inspect `:root` in devtools — all `--pp-*` tokens present
4. Legacy pages still render (feed, chat, sign-in) without layout breakage
5. `--theme-primary-color` computed value resolves to `#DFFF00`

No automated tests required for CSS tokens in SCRUM-74.

---

## 11. Downstream dependency chain

```
SCRUM-74 (this) → SCRUM-75 Form primitives
                → SCRUM-76 SwipeCard
                → SCRUM-77 FeedStack
                → SCRUM-78 MatchOverlay
                → SCRUM-79 BottomNavBar
                → SCRUM-83 AppShell
                → SCRUM-86 Home feed migration (uses mockup reference doc)
```

Delete `docs/design/v2-mockup-reference.md` in a chore commit when SCRUM-79 + SCRUM-86 are merged.

---

## 12. Implementation commits (suggested atomic split)

1. `feat(design): add token sheet and legacy aliases [SCRUM-74]` — tokens.css, index.css import + aliases
2. `docs(design): add token README and mockup reference [SCRUM-74]` — README.md, v2-mockup-reference.md, this spec

Single commit is also acceptable if preferred.

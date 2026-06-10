# PadPal Design Tokens

Single source of truth for PadPal v2 visual design. All new components must use `--pp-*` tokens — no hardcoded hex or rgb in new code.

**Specs:** `docs/superpowers/specs/2026-06-09-design-tokens-design.md` · `docs/superpowers/specs/2026-06-09-form-primitives-design.md`  
**Mockup scratch notes (temporary):** `docs/design/v2-mockup-reference.md`

## Usage

Tokens load automatically via `src/index.css` → `@import './design/tokens.css'`.

```css
.my-component {
  background: var(--pp-color-bg-surface);
  color: var(--pp-color-text-on-surface);
  border-radius: var(--pp-radius-lg);
  padding: var(--pp-space-4);
  font-family: var(--pp-font-body);
  font-weight: var(--pp-font-semibold);
}
```

## Logo

Apply the `.pp-logo` class for the PadPal wordmark (Inter Black / weight 900):

```jsx
<span className="pp-logo">PadPal</span>
```

## Typography

| Token | Value |
|---|---|
| `--pp-font-body` | Inter (all UI text) |
| `--pp-font-logo-weight` | 900 |
| `--pp-font-regular` … `--pp-font-black` | 400–900 |

## Colors (core)

| Token | Usage |
|---|---|
| `--pp-color-bg-app` | Black app shell |
| `--pp-color-bg-surface` | White cards |
| `--pp-color-accent` | Lime highlights (#DFFF00) |
| `--pp-color-success` | Match actions |
| `--pp-color-text-primary` | Text on dark |
| `--pp-color-text-muted` | Section labels |
| `--pp-color-bg-input` | Dark pill input background |
| `--pp-color-bg-input-hover` | Input hover state |
| `--pp-color-border-focus` | Focus ring (lime accent) |
| `--pp-opacity-disabled` | Disabled controls |

Tag pill colors: `--pp-color-tag-purple` through `--pp-color-tag-teal`.

## Spacing, radii, shadows

- Spacing: `--pp-space-1` (4px) through `--pp-space-12` (48px)
- Radii: `--pp-radius-sm` through `--pp-radius-full`
- Shadows: `--pp-shadow-sm`, `--pp-shadow-card`, `--pp-shadow-nav`

## Safe area

`--pp-safe-top/right/bottom/left` — use for Capacitor notch/home-indicator padding.

## Legacy bridge

Unmigrated pages may still reference `--theme-*` variables in `index.css`. Those alias to `--pp-*` tokens and will be removed as pages migrate.

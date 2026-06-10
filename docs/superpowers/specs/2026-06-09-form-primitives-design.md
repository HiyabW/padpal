# Form Primitives (SCRUM-75) — Design Spec

**Version 1.0 | June 9, 2026**  
**Status:** Approved  
**Jira:** [SCRUM-75](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-75) · Epic [SCRUM-72](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-72)  
**Depends on:** [SCRUM-74](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-74) (design tokens)  
**Blocks:** [SCRUM-84](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-84) (sign-in redesign), [SCRUM-85](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-85) (slim onboarding), [SCRUM-90](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-90) (listing wizard)

---

## 1. Summary

Create three presentational form primitives — `PrimaryButton`, `FormField`, and `TextInput` — under `src/components/ui/`. Components use native HTML elements styled exclusively with `--pp-*` design tokens and co-located CSS files. No MUI dependency in new code.

Visual authority: onboarding mockup strip (dark pill inputs on black shell) documented in `docs/design/v2-mockup-reference.md`. Sign-in mockup not yet provided; primitives must work on both solid-black onboarding and future sign-in page chrome.

This ticket delivers components and token additions only — no page migrations.

---

## 2. Decisions (locked)

| Decision | Choice |
|---|---|
| Visual reference | Onboarding mockup strip + token sheet |
| Implementation | Native HTML + co-located CSS per component |
| MUI in new components | No — legacy pages keep MUI until SCRUM-84+ |
| CSS strategy | Per-component `.css` files with `pp-` prefixed BEM classes |
| Barrel export | `src/components/ui/index.js` |
| Desktop | Mobile-first; constrain width on large viewports (see §8) |
| Demo / Storybook | None — manual PR verification checklist |

---

## 3. New tokens

Add to `src/design/tokens.css`:

| Token | Value | Purpose |
|---|---|---|
| `--pp-color-bg-input` | `#1C1C1E` | Dark pill input background (onboarding mockup) |
| `--pp-color-bg-input-hover` | `#2C2C2E` | Input hover state |
| `--pp-color-border-focus` | `var(--pp-color-accent)` | Focus ring on inputs and buttons |
| `--pp-opacity-disabled` | `0.45` | Disabled buttons and inputs |

Update `src/design/README.md` with the four new tokens.

---

## 4. File layout

| File | Action |
|---|---|
| `src/components/ui/PrimaryButton.jsx` | Create |
| `src/components/ui/PrimaryButton.css` | Create |
| `src/components/ui/FormField.jsx` | Create |
| `src/components/ui/FormField.css` | Create |
| `src/components/ui/TextInput.jsx` | Create |
| `src/components/ui/TextInput.css` | Create |
| `src/components/ui/index.js` | Create — barrel export |
| `src/design/tokens.css` | Modify — add §3 tokens |
| `src/design/README.md` | Modify — document new tokens |

**Out of scope:** Sign-in, onboarding, listing wizard page changes; `SelectionPill`, progress bar, FAB next button (SCRUM-85); Storybook.

---

## 5. PrimaryButton

### API

```jsx
<PrimaryButton
  variant="primary"   // "primary" | "secondary" | "ghost" — default "primary"
  type="button"       // "button" | "submit" | "reset"
  fullWidth={false}
  loading={false}
  disabled={false}
  onClick={fn}
  className=""
>
  Label
</PrimaryButton>
```

### Variants

| Variant | Background | Text | Usage |
|---|---|---|---|
| `primary` | `--pp-color-accent` | `--pp-color-text-on-surface` | Lime CTA (sign-in, wizard submit) |
| `secondary` | `--pp-color-bg-input` | `--pp-color-text-primary` | Dark pill ("Locate me" style) |
| `ghost` | transparent | `--pp-color-text-primary` | Text-only actions |

### Shared styles

- Shape: full pill (`--pp-radius-full`)
- Min-height: `48px` (touch target)
- Padding: `--pp-space-3` `--pp-space-6`
- Font: `--pp-font-body`, weight `--pp-font-semibold`, size `--pp-text-base`
- `fullWidth`: `width: 100%`

### States

| State | Behavior |
|---|---|
| Default | As variant table |
| Hover | Primary → `--pp-color-accent-muted`; secondary → `--pp-color-bg-input-hover`; ghost → subtle white overlay |
| Disabled | `opacity: var(--pp-opacity-disabled)`, `pointer-events: none` |
| Loading | Inline CSS spinner centered; children visually hidden; `aria-busy="true"`; button disabled |
| Focus-visible | `outline: 2px solid var(--pp-color-border-focus); outline-offset: 2px` |

### CSS class map

- Block: `.pp-btn`
- Modifiers: `.pp-btn--primary`, `.pp-btn--secondary`, `.pp-btn--ghost`, `.pp-btn--full-width`, `.pp-btn--loading`, `.pp-btn--disabled`

---

## 6. FormField

### API

```jsx
<FormField
  id="birthday"              // required — links label to control
  label="When's your birthday?"
  labelSize="lg"             // "lg" | "sm" — default "sm"
  subtitle=""                // optional muted line under label
  error=""                   // optional — renders error message
  helper=""                  // optional — renders helper below control
  className=""
>
  <TextInput id="birthday" ... />
</FormField>
```

### Label sizes

| Size | Style | When |
|---|---|---|
| `lg` | `--pp-text-2xl`, `--pp-font-bold`, `--pp-color-text-primary` | Onboarding step titles |
| `sm` | `--pp-text-sm`, `--pp-font-medium`, `--pp-color-text-muted` | Compact sign-in labels |

### Structure

```html
<div class="pp-form-field">
  <label class="pp-form-field__label" for="{id}">...</label>
  <p class="pp-form-field__subtitle">...</p>   <!-- if subtitle -->
  <div class="pp-form-field__control">{children}</div>
  <p class="pp-form-field__error" role="alert">...</p>   <!-- if error -->
  <p class="pp-form-field__helper">...</p>   <!-- if helper -->
</div>
```

### Accessibility

- `label` uses `htmlFor={id}` matching child input `id`
- When `error` is set: clone/propagate `aria-invalid="true"` and `aria-describedby` on child input pointing to error + helper element ids
- Error text uses `--pp-color-danger`
- Helper/subtitle use `--pp-color-text-muted` or `--pp-color-text-subtle`

---

## 7. TextInput

### API

```jsx
<TextInput
  id="email"
  type="text"          // text | email | password | tel | date
  value=""
  onChange={fn}
  placeholder=""
  error={false}
  disabled={false}
  fullWidth={true}
  endAdornment={null}  // React node — e.g. password visibility toggle
  className=""
  name=""
  autoComplete=""
/>
```

Forwards remaining native `<input>` attributes via spread where safe (`name`, `autoComplete`, `inputMode`, `maxLength`, etc.).

### Styles

- Shape: full pill (`--pp-radius-full`)
- Background: `--pp-color-bg-input`; hover → `--pp-color-bg-input-hover`
- Text: `--pp-color-text-primary`, `--pp-text-base`, `--pp-font-body`
- Padding: `--pp-space-4` horizontal; min-height `48px`
- Placeholder: `--pp-color-text-muted`
- `fullWidth`: `width: 100%`
- Error: `box-shadow: inset 0 0 0 1px var(--pp-color-danger)`
- Focus-visible: `outline: 2px solid var(--pp-color-border-focus); outline-offset: 2px`
- Disabled: `opacity: var(--pp-opacity-disabled)`

### endAdornment

When provided, wrap input + adornment in `.pp-input-wrapper` (flex row). Input flex-grows; adornment sits at trailing edge. Used by SCRUM-84 for password visibility toggle without MUI.

### CSS class map

- `.pp-input`, `.pp-input--error`, `.pp-input--full-width`, `.pp-input-wrapper`, `.pp-input-wrapper__adornment`

---

## 8. Desktop responsiveness

Mobile-first. On viewports ≥ `768px`:

- `fullWidth` inputs and buttons respect parent container width (no forced narrow column inside primitives)
- Consuming pages (SCRUM-84/85) will center forms in a max-width column; primitives do not hardcode `max-width`
- Recommended consumer pattern (document in spec, implement in downstream tickets): wrap form stacks in a container with `max-width: var(--pp-layout-max-card)` (`480px`) and `margin: 0 auto`
- Touch targets and pill proportions unchanged on desktop — no separate desktop variant

---

## 9. Barrel export

`src/components/ui/index.js`:

```js
export { default as PrimaryButton } from './PrimaryButton';
export { default as FormField } from './FormField';
export { default as TextInput } from './TextInput';
```

---

## 10. Acceptance criteria

- [ ] `PrimaryButton` supports `primary`, `secondary`, `ghost` variants
- [ ] `PrimaryButton` supports default, hover, disabled, loading states
- [ ] `FormField` renders label, subtitle, helper, and error; wires `aria-invalid` / `aria-describedby`
- [ ] `FormField` supports `labelSize="lg"` for onboarding titles
- [ ] `TextInput` renders pill input matching onboarding mockup on black background
- [ ] `TextInput` supports `endAdornment` slot
- [ ] All new CSS uses `--pp-*` tokens only — no hardcoded hex in component files
- [ ] Four new tokens added to `tokens.css` and documented in `src/design/README.md`
- [ ] Barrel export at `src/components/ui/index.js`
- [ ] Legacy sign-in page unchanged (no imports of new primitives in this PR)
- [ ] Focus rings visible for keyboard navigation

---

## 11. Testing / verification

Manual checks in PR (no automated tests required for SCRUM-75):

1. Temporary render block or dev snippet exercising all button variants × states
2. `TextInput`: default, focus, error, disabled, with `endAdornment`
3. `FormField`: `labelSize` lg/sm; error + helper combinations
4. DevTools: inspect `:root` for new tokens; grep new files for hardcoded hex — none
5. Resize browser 375px → 1280px — pills scale with container, no overflow breakage
6. Legacy pages (sign-in, feed) load without regression

---

## 12. Downstream usage (not this ticket)

| Consumer | Ticket | Primitives used |
|---|---|---|
| Sign-in redesign | SCRUM-84 | `FormField`, `TextInput`, `PrimaryButton` |
| Slim onboarding | SCRUM-85 | `FormField` (lg labels), `TextInput`; plus `SelectionPill` (new) |
| Listing wizard | SCRUM-90 | All three |

---

## 13. Implementation commits (suggested atomic split)

1. `feat(design): add form input tokens [SCRUM-75]` — `tokens.css`, `README.md`
2. `feat(ui): add PrimaryButton primitive [SCRUM-75]`
3. `feat(ui): add FormField and TextInput primitives [SCRUM-75]` — includes barrel export

Single commit acceptable if preferred.

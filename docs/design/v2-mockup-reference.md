# TEMP — PadPal v2 Mockup Reference

**Delete when SCRUM-79 + SCRUM-86 are merged.**

Scratch notes for downstream design-system and feed tickets. Permanent values live in `src/design/tokens.css`.

## Screenshot sources

- Feed card (full scroll): `assets/image-b40cc62a-f172-4443-be5e-10a04d7b514d.png`
- Feed with bottom nav: `assets/image-4b299347-8142-486c-b3ac-99d5ffcd2028.png`
- Onboarding form inputs (4 screens): `assets/IMG_9758-9374248f-df91-4236-9197-26ed43d84856.png`

## Component inventory (build in later tickets)

| Component | Ticket | Notes |
|---|---|---|
| FeedHeader | SCRUM-86 | Black bar, Inter Black logo (`.pp-logo`), rewind + filter, dot progress |
| HeroImageOverlay | SCRUM-86 | Share, "New here", name/age, distance, socials, compatibility box |
| AboutMeSection | SCRUM-86 | Muted label, bold bio, attribute pills |
| PromptCard | SCRUM-86 | Icon + title + answer |
| ActionBar | SCRUM-76/86 | Reject/Match ovals, Share/Report full-width |
| BottomNavBar | SCRUM-79 | Glass pill, lime active Home tab |
| PrimaryButton | SCRUM-75 | Pill CTA; see onboarding patterns below |
| FormField | SCRUM-75 | Label + subtitle + error/helper wrapper |
| TextInput | SCRUM-75 | Dark pill input on black shell |
| SelectionPill | SCRUM-85 | Single-select option row (gender, etc.) — **not SCRUM-75** |
| OnboardingProgressBar | SCRUM-85 | Thin top progress track — **not SCRUM-75** |
| OnboardingNavFAB | SCRUM-85 | Circular next chevron — **not SCRUM-75** |

## Onboarding form patterns (SCRUM-75 / SCRUM-85)

Source: onboarding mockup strip (birthday, gender, roommates, location).

### Page chrome

- **Background:** solid black (`--pp-color-bg-app`) — no animated gradient on onboarding
- **Typography:** Inter; step title = large bold white (`--pp-color-text-primary`); subtitle = smaller muted (`--pp-color-text-subtle` or `--pp-color-text-muted`)
- **Back control:** white chevron, top-left — page-level, not a form primitive
- **Next control:** circular dark-grey FAB, bottom-right, white chevron — page-level (SCRUM-85), not `PrimaryButton`
- **Progress:** thin horizontal bar below status area; white fill on dark track — SCRUM-85

### TextInput (SCRUM-75)

- **Shape:** full pill (`--pp-radius-full`)
- **Background:** dark grey elevated surface (map to new token `--pp-color-bg-input` or reuse `--pp-color-bg-elevated` — tune in implementation)
- **Text:** white, centered or left-aligned per field type
- **Examples:** date `09 / 04 / 2000`; roommate search with `@username` chip inside field
- **Helper/feedback:** below input, small muted text (e.g. "You're 25 years old! 🎂")

### FormField (SCRUM-75)

- **Label:** step question as heading (not a small form label above the field — onboarding uses screen-level `h1`-style title)
- **Subtitle:** optional one-line helper under title ("You won't be able to change this.")
- **Error state:** not shown in mockup — use `--pp-color-danger` text; keep input border/shake TBD in spec

### PrimaryButton (SCRUM-75)

Onboarding mockup uses **selection pills** and a **circular FAB** for navigation — not a full-width lime CTA. PrimaryButton still needed for:

- Sign-in / register (SCRUM-84) — likely lime fill on black
- "Locate me" style secondary pill (`📍 Locate me`) — dark grey bg, white text
- Listing wizard (SCRUM-90)

**Variants to build in SCRUM-75:**

| Variant | Mockup signal | Tokens |
|---|---|---|
| `primary` | Lime fill CTA (sign-in; not in onboarding strip) | `--pp-color-accent`, `--pp-color-text-on-surface` |
| `secondary` | Dark grey pill, white text | `--pp-color-bg-elevated`, `--pp-color-text-primary` |
| `ghost` | Text-only / transparent | `--pp-color-text-primary` |

**States:** default, hover (`--pp-color-accent-muted` for primary), disabled (reduced opacity), loading (spinner inline).

### Selection pill (SCRUM-85 — document only)

- Unselected: dark grey pill, white text
- Selected: **white** pill, **black** text (`--pp-color-bg-surface`, `--pp-color-text-on-surface`)
- Stacked vertically with consistent gap (`--pp-space-3` or `--pp-space-4`)

### Out of scope for SCRUM-75

- Map widget, location dropdown, roommate chip/tag input internals
- Bottom nav on roommate screen (SCRUM-79)
- Onboarding step layout shell (SCRUM-85)

### Sign-in mockup

**Not yet provided.** SCRUM-84 sign-in redesign may differ (roadmap mentions gradient). Form primitives should work on both black onboarding and sign-in page chrome.

## Desktop (mobile-first)

- Card max-width 480px (`--pp-layout-max-card`), centered on black bg
- Action bar sticky at bottom of card column
- Bottom nav floating pill, max-width 400px (`--pp-layout-max-nav`), centered
- Onboarding: full-bleed mobile; no card column wrapper

## Decision log

- Logo font: Inter Black (900) — Druk Wide deferred until license purchased
- Palette: black shell, white cards, lime accent — canonical via `--pp-*` tokens
- Onboarding inputs: dark pill on black shell; selected option = inverted white pill (not lime)
- Onboarding page background: solid black (not legacy `gradient-background2`)
- Form primitive visual authority: onboarding mockup strip + token sheet (sign-in mockup TBD)
- Form primitive implementation: native HTML + co-located CSS (`src/components/ui/`); no MUI in new components

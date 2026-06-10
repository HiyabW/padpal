# TEMP — PadPal v2 Mockup Reference

**Delete when SCRUM-79 + SCRUM-86 are merged.**

Scratch notes for downstream design-system and feed tickets. Permanent values live in `src/design/tokens.css`.

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

- Card max-width 480px (`--pp-layout-max-card`), centered on black bg
- Action bar sticky at bottom of card column
- Bottom nav floating pill, max-width 400px (`--pp-layout-max-nav`), centered

## Decision log

- Logo font: Inter Black (900) — Druk Wide deferred until license purchased
- Palette: black shell, white cards, lime accent — canonical via `--pp-*` tokens

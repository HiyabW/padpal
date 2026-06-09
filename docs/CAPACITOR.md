# Capacitor — iOS & Android (SCRUM-65)

PadPal ships as a native shell via [Capacitor](https://capacitorjs.com/), wrapping the webpack `dist/` build. Parent epic: [SCRUM-63](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-63).

## Prerequisites

- Node 18+
- **iOS:** Full **Xcode** app (not Command Line Tools only)
- **Android:** Android Studio, JDK 17+

> **Note:** Capacitor is pinned to **8.0.2** with **no official plugins** installed. Plugin `Package.swift` files resolve `capacitor-swift-pm` with `from: "8.0.0"`, which SPM can bump to 8.3.x and break compilation (`call.reject`, etc.) — see [capacitor#8333](https://github.com/ionic-team/capacitor/issues/8333). Use native `LaunchScreen` + CSS safe areas (SCRUM-64). Re-add plugins when Ionic ships SPM-compatible releases.

## One-time setup

```bash
npm install
npm run build:prod
npx cap add ios    # if ios/ does not exist yet
npx cap add android
```

## Build & run (production API)

Point the app at your deployed API before building:

```bash
export REACT_APP_API_URL=https://palpal-api.onrender.com
npm run cap:sync
npm run cap:ios      # opens Xcode → Run on simulator or device
# or
npm run cap:android
```

In Xcode, select a simulator or your iPhone and press **Run**. The app runs full-screen (no Safari chrome).

### iOS Simulator keyboard

If tapping a text field shows the **Done** accessory bar but **no on-screen keyboard**, the simulator is using your Mac keyboard. Turn it off:

**I/O → Keyboard → Connect Hardware Keyboard** (or press **⌘⇧K**), then tap the field again.

To force the software keyboard: **I/O → Keyboard → Toggle Software Keyboard** (**⌘K**).

### Safe area / white bands

iOS uses `contentInset: never` in `capacitor.config.ts` so Capacitor does not add extra WebView insets on top of CSS `env(safe-area-inset-*)`. After changing config or web CSS, run `npm run cap:sync` and rebuild in Xcode.

### Page transitions (no white flash)

In-app navigation uses React Router (`useNavigate` / `appNavigate`) instead of `window.location` full reloads. Rebuild and sync after changing routing code.

## Live reload (optional, dev)

With webpack dev server running (`npm run serve` on port 3000):

```bash
CAPACITOR_DEV_SERVER_URL=http://localhost:3000 npm run cap:sync
npm run cap:ios
```

Use your machine’s LAN IP instead of `localhost` when testing on a physical device.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run build:prod` | Webpack production build → `dist/` |
| `npm run cap:sync` | Build web assets and copy into native projects |
| `npm run cap:ios` | Sync + open Xcode |
| `npm run cap:android` | Sync + open Android Studio |
| `npm run cap:run:ios` | Sync + run on default iOS simulator |

## App icon & splash

Source assets live in `resources/` (see `resources/README.md`). Regenerate native assets after changing icons:

```bash
npx @capacitor/assets generate --ios --android
npm run cap:sync
```

## Auth & WebSockets in WebView

- API calls use `credentials: 'include'` (HttpOnly cookies from SCRUM-42).
- Set `REACT_APP_API_URL` to your **HTTPS** backend for simulator/device builds; `localhost` only works with live reload pointed at your dev machine.
- Socket.io uses the same `REACT_APP_API_URL` as REST.
- Backend CORS must allow the Capacitor origin (`capacitor://localhost` on iOS, `https://localhost` on Android).

## Related Jira

- [SCRUM-65](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-65) — Capacitor integration (this doc)
- [SCRUM-64](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-64) — iOS safe-area / viewport
- [SCRUM-67](https://hiyabwoldegebriel.atlassian.net/browse/SCRUM-67) — Native push (FCM/APNs)

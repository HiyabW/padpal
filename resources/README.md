# Native app assets

Place branding images here, then regenerate iOS/Android icons and splash screens:

```bash
# Expected layout (create from your PadPal logo):
# icon-only.png   — 1024×1024 app icon
# splash.png      — 2732×2732 splash (centered logo on brand background)

npx @capacitor/assets generate --ios --android
npm run cap:sync
```

Until custom artwork is added, Capacitor uses default placeholder icons from the native project templates.

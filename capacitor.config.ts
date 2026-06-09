import type { CapacitorConfig } from '@capacitor/cli';

const devServerUrl = process.env.CAPACITOR_DEV_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.padpal.app',
  appName: 'PadPal',
  webDir: 'dist',
  ios: {
    // CSS env(safe-area-inset-*) handles insets; "automatic" double-insets and shows white bands.
    contentInset: 'never',
    allowsLinkPreview: false,
  },
  android: {
    allowMixedContent: true,
  },
};

if (devServerUrl) {
  config.server = {
    url: devServerUrl,
    cleartext: devServerUrl.startsWith('http://'),
  };
}

export default config;

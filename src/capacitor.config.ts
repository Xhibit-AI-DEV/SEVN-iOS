import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xhibits',
  appName: 'SEVN',
  webDir: 'build',
  bundledWebRuntime: false,
  
  server: {
    hostname: 'sevn.app',
    androidScheme: 'https',
    iosScheme: 'https',
    url: undefined,
    cleartext: false,
  },
  
  ios: {
    contentInset: 'automatic',
    scheme: 'SEVN',
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true // Set to false in production
  }
};

export default config;
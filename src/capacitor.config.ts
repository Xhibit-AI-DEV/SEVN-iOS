import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xhibits',
  appName: 'SEVN Stylist',
  webDir: 'dist',
  bundledWebRuntime: false,
  
  server: {
    hostname: 'sevn.app',
    androidScheme: 'https',
    iosScheme: 'https',
    // Load customer.html directly instead of index.html
    url: undefined,
    cleartext: false,
  },
  
  // Configure the iOS app to load customer.html as the starting page
  ios: {
    contentInset: 'automatic',
    scheme: 'SEVN Stylist',
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true // Set to false in production
  }
};

export default config;
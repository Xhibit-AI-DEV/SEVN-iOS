import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xhibits',
  appName: 'SEVN',
  webDir: 'dist',
  bundledWebRuntime: false,
  
  server: {
    hostname: 'sevn.app',
    androidScheme: 'https',
    iosScheme: 'https',
    url: undefined,
    cleartext: false,
    // Clear cache on app launch
    cleartext: false,
  },
  
  ios: {
    contentInset: 'always',
    scheme: 'SEVN',
    // Ensure safe area is properly handled
    scrollEnabled: true,
    // Status bar configuration
    preferredContentMode: 'mobile',
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff',
      overlay: false,
    },
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true // Set to false in production
  }
};

export default config;
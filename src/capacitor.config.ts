import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xhibits',
  appName: 'SEVN', // Clean app name for iOS/Android home screen
  webDir: 'dist',
  bundledWebRuntime: false,
  
  server: {
    hostname: 'sevn.app',
    androidScheme: 'https',
    iosScheme: 'https',
    url: undefined,
    cleartext: false,
  },
  
  ios: {
    contentInset: 'always',
    scheme: 'SEVN',
    // Ensure safe area is properly handled
    scrollEnabled: true,
    // Status bar configuration
    preferredContentMode: 'mobile',
    // Force viewport to use available height
    limitsNavigationsToAppBoundDomains: false,
  },
  
  plugins: {
    SplashScreen: {
      // Brand splash screen with SEVN aesthetic
      launchShowDuration: 2000, // 2 seconds
      launchAutoHide: true,
      launchFadeOutDuration: 500, // Smooth 500ms fade
      backgroundColor: '#D4D0CA', // Brand beige/tan color
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false, // Clean, minimal - no spinner
      iosSpinnerStyle: 'small',
      spinnerColor: '#1e1709', // Dark brand color if spinner ever shows
    },
    StatusBar: {
      style: 'default', // Dark text on light background
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
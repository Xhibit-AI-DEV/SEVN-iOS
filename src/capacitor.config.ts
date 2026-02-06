import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sevn.stylistadmin',
  appName: 'SEVN Stylist',
  webDir: 'dist',
  bundledWebRuntime: false,
  
  server: {
    hostname: 'sevn.app',
    androidScheme: 'https',
    iosScheme: 'https',
    // For development with live reload, uncomment and set your local IP:
    // url: 'http://YOUR_LOCAL_IP:5173',
    // cleartext: true
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small'
    },
    
    StatusBar: {
      style: 'dark',
      backgroundColor: '#FFFFFF'
    },

    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },

    Camera: {
      // Camera permissions for intake form image uploads
      permissions: ['camera', 'photos']
    }
  },

  ios: {
    contentInset: 'automatic',
    scheme: 'SEVN Stylist'
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true // Set to false in production
  }
};

export default config;
# Capacitor Mobile Setup Guide

This guide will help you set up Capacitor to deploy your SEVN Stylist Admin app to iOS and Android devices.

## 📋 Prerequisites

### For iOS Development
- **macOS** (required for iOS development)
- **Xcode** 14+ installed from Mac App Store
- **CocoaPods** - Install with: `sudo gem install cocoapods`
- **Apple Developer Account** (free for testing, $99/year for App Store)

### For Android Development
- **Any OS** (macOS, Windows, or Linux)
- **Android Studio** - Download from https://developer.android.com/studio
- **Java JDK** 17+ installed
- **Android SDK** (installed with Android Studio)

### General Requirements
- **Node.js** 18+ and npm
- **Git** installed

---

## 🚀 Step-by-Step Setup

### 1. Export Your Project from Figma Make

Since you're working in Figma Make, you'll need to export your project:

1. Click the export/download button in Figma Make
2. Download the complete project files
3. Extract to a local folder on your computer

### 2. Install Dependencies

Open Terminal/Command Prompt in your project folder:

```bash
# Navigate to your project
cd /path/to/SEVN_DEV

# Install all dependencies
npm install

# This will install:
# - React and dependencies
# - Capacitor CLI and core
# - iOS and Android platforms
# - Plugins (Camera, StatusBar, Keyboard, etc.)
```

### 3. Initialize Capacitor

Capacitor is already configured via `capacitor.config.ts`, but you need to add the native platforms:

```bash
# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android

# This creates:
# - /ios folder with Xcode project
# - /android folder with Android Studio project
```

### 4. Build Your Web App

Before syncing to mobile, build the web assets:

```bash
npm run build
```

This creates the `/dist` folder with your compiled app.

### 5. Sync Web Code to Native Projects

```bash
npx cap sync
```

This command:
- Copies web assets from `/dist` to native projects
- Updates native dependencies
- Installs Capacitor plugins

---

## 📱 Running on Devices

### iOS Testing

#### Option A: Using Xcode (Recommended)

```bash
# Open iOS project in Xcode
npx cap open ios
```

In Xcode:
1. Select a simulator from the device dropdown (e.g., "iPhone 15 Pro")
2. Click the Play ▶️ button to build and run
3. Wait for simulator to boot and app to install

#### Option B: Command Line

```bash
# Run on connected device
npx cap run ios --target="Your iPhone Name"

# Run on simulator
npx cap run ios --target=iPhone-15-Pro
```

### Android Testing

#### Option A: Using Android Studio (Recommended)

```bash
# Open Android project in Android Studio
npx cap open android
```

In Android Studio:
1. Wait for Gradle sync to complete
2. Select a device/emulator from dropdown
3. Click Run ▶️ button

#### Option B: Command Line

```bash
# List available devices
npx cap run android --list

# Run on specific device
npx cap run android --target=device-id
```

---

## 🔥 Live Reload Development

For faster development, use live reload to see changes instantly on your device:

### Setup

1. **Get Your Local IP Address:**

```bash
# macOS/Linux
ifconfig | grep "inet "
# Look for something like 192.168.1.XXX

# Windows
ipconfig
# Look for IPv4 Address
```

2. **Update `capacitor.config.ts`:**

Uncomment and update these lines:

```typescript
server: {
  url: 'http://192.168.1.XXX:5173',  // Your IP here
  cleartext: true
}
```

3. **Start Development:**

```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Run on device with live reload
npx cap run ios --livereload --external
# or
npx cap run android --livereload --external
```

Now changes you make will hot-reload on your device! 🎉

---

## 🔌 Using Capacitor Plugins

Your app already has these plugins configured:

### Camera (for intake form uploads)

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// Take a photo
const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera
  });
  
  // image.webPath contains the URI
  return image.webPath;
};

// Pick from gallery
const pickPhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos
  });
  
  return image.webPath;
};
```

### Status Bar (for styling)

```typescript
import { StatusBar, Style } from '@capacitor/status-bar';

// Set light content (white text/icons)
await StatusBar.setStyle({ style: Style.Light });

// Set dark content (black text/icons)
await StatusBar.setStyle({ style: Style.Dark });

// Hide status bar
await StatusBar.hide();

// Show status bar
await StatusBar.show();
```

### Keyboard (for form inputs)

```typescript
import { Keyboard } from '@capacitor/keyboard';

// Hide keyboard
await Keyboard.hide();

// Listen for keyboard events
Keyboard.addListener('keyboardWillShow', info => {
  console.log('Keyboard height:', info.keyboardHeight);
});

Keyboard.addListener('keyboardWillHide', () => {
  console.log('Keyboard will hide');
});
```

### Preferences (for local storage)

```typescript
import { Preferences } from '@capacitor/preferences';

// Set a value
await Preferences.set({
  key: 'user_session',
  value: JSON.stringify(userData)
});

// Get a value
const { value } = await Preferences.get({ key: 'user_session' });
const userData = JSON.parse(value);

// Remove a value
await Preferences.remove({ key: 'user_session' });

// Clear all
await Preferences.clear();
```

---

## 🎨 Mobile-Specific Updates

### Add Safe Area Support

Update `/styles/globals.css`:

```css
body {
  /* Respect device notches and rounded corners */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

### Detect Mobile Platform

```typescript
import { Capacitor } from '@capacitor/core';

// Check if running on native
const isNative = Capacitor.isNativePlatform();

// Get specific platform
const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'

// Check if iOS
const isIOS = platform === 'ios';

// Check if Android
const isAndroid = platform === 'android';
```

---

## 🔧 Common Issues & Solutions

### Issue: White Screen on Device

**Solution:**
1. Check browser console (Safari Web Inspector for iOS, Chrome DevTools for Android)
2. Verify all imports use relative paths, not absolute
3. Run `npx cap sync` after making changes

### Issue: API Calls Failing

**Solution:**
1. Check CORS settings in Supabase - allow `capacitor://localhost` and `http://localhost`
2. Update Supabase CORS via Dashboard → Settings → API → CORS
3. Add these origins:
   - `capacitor://localhost`
   - `http://localhost`
   - `ionic://localhost`

### Issue: Images Not Loading

**Solution:**
1. Use absolute URLs for Supabase Storage images
2. Check network permissions in native configs
3. For iOS: Update `Info.plist` with `NSAppTransportSecurity` settings

### Issue: Plugins Not Working

**Solution:**
```bash
# Reinstall plugins
npm install @capacitor/camera @capacitor/keyboard @capacitor/status-bar

# Sync again
npx cap sync
```

### Issue: Build Errors in Xcode

**Solution:**
```bash
# Update CocoaPods
cd ios
pod repo update
pod install
cd ..
```

### Issue: Build Errors in Android Studio

**Solution:**
1. File → Invalidate Caches → Invalidate and Restart
2. Clean project: Build → Clean Project
3. Rebuild: Build → Rebuild Project

---

## 📦 Building for Production

### iOS App Store Build

```bash
# Build web assets
npm run build

# Sync to iOS
npx cap sync ios

# Open Xcode
npx cap open ios
```

In Xcode:
1. Select "Any iOS Device" as target
2. Product → Archive
3. Follow App Store submission process

### Android Play Store Build

```bash
# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Follow the wizard to create/select signing key
3. Choose "release" build variant
4. Upload to Play Store Console

---

## 🔐 Environment Variables for Mobile

Create a `.env` file (already in `.gitignore`):

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Access in code:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

---

## 📚 Additional Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **iOS Development:** https://developer.apple.com/documentation/
- **Android Development:** https://developer.android.com/docs
- **Capacitor Plugins:** https://capacitorjs.com/docs/plugins

---

## 🆘 Need Help?

Common commands cheatsheet:

```bash
# Install dependencies
npm install

# Build web app
npm run build

# Sync to native
npx cap sync

# Open in IDE
npx cap open ios
npx cap open android

# Run with live reload
npx cap run ios --livereload --external
npx cap run android --livereload --external

# Update Capacitor
npm install @capacitor/cli@latest @capacitor/core@latest
npm install @capacitor/ios@latest @capacitor/android@latest
npx cap sync
```

---

**Ready to build! 🚀**

After following this guide, your SEVN Stylist Admin app will be running natively on iOS and Android devices with full access to camera, keyboard, and other native features!

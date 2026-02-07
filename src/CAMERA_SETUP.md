# Camera Plugin Setup Guide

## Installation Complete ✅

The Capacitor Camera plugin has been integrated into:
- **CreateEditPage** - Image/video upload for Edit posts
- **IntakeFormPage** - Main image and reference images for style intake

## iOS Permissions Setup

After running `npx cap sync ios`, you need to add camera permissions to your iOS project:

### 1. Open Xcode
```bash
npx cap open ios
```

### 2. Add Privacy Permissions
In Xcode, navigate to:
1. Click on **App** (blue icon at top of project navigator)
2. Select the **App** target
3. Go to the **Info** tab
4. Right-click in the **Custom iOS Target Properties** section
5. Select **Add Row**

Add these privacy keys:

| Key | Type | Value |
|-----|------|-------|
| `Privacy - Camera Usage Description` | String | `This app needs access to your camera to upload style photos` |
| `Privacy - Photo Library Usage Description` | String | `This app needs access to your photo library to upload style photos` |
| `Privacy - Photo Library Additions Usage Description` | String | `This app needs to save photos to your library` |

**Alternative:** Edit `ios/App/App/Info.plist` directly and add:

```xml
<key>NSCameraUsageDescription</key>
<string>This app needs access to your camera to upload style photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs access to your photo library to upload style photos</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>This app needs to save photos to your library</string>
```

## How It Works

### Native Platform (iOS/Android)
- Tapping upload buttons triggers the native camera/photo library picker
- Users see a native action sheet: **"Camera"** or **"Photo Library"**
- Photos are converted to File objects and uploaded seamlessly

### Web Platform
- Automatically falls back to standard HTML file input
- Works identically to the previous implementation

## Features

✅ **CreateEditPage:**
- Native image/video picker
- Smooth native experience on mobile
- Web fallback

✅ **IntakeFormPage:**
- Native main image picker
- Native reference images picker (up to 4)
- Camera and photo library support
- Web fallback

## Testing

1. Build and run on iOS simulator:
   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. In Xcode, select a simulator and click **Run** ▶️

3. Test both flows:
   - Go to "Create Edit" and try uploading an image
   - Start a style intake and upload photos

## Troubleshooting

**"Photo library access denied"**
- Check that Info.plist has the correct privacy descriptions
- Rebuild the app after adding permissions

**Camera not working in simulator**
- iOS simulators have limited camera access
- Test on a real device for full functionality

**Web version not working**
- Make sure file input elements have correct IDs:
  - `main-image-input` for main intake image
  - `reference-images-input` for reference images

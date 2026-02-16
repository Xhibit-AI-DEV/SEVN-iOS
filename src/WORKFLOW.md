# SEVN - Complete Development Workflow

**Last Updated:** February 16, 2026  
**Project:** SEVN Stylist Admin Interface  
**Version:** 1.0.1

---

## 🎯 CRITICAL: Understanding the File Structure

### **In Figma Make (What You See Here):**
```
/ (flat structure - everything at root)
├── App.tsx
├── main.tsx
├── index.html
├── vite.config.ts
├── capacitor.config.ts
├── package.json
├── components/
├── supabase/
└── ...
```

### **In GitHub (After Push):**
Figma Make **automatically reorganizes** files:
```
/ (in your GitHub repo)
├── src/                  ← ALL app code goes here
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── supabase/
│   ├── utils/
│   └── ...
├── index.html           ← Stays at root
├── vite.config.ts       ← Stays at root
├── capacitor.config.ts  ← Stays at root
├── package.json         ← Stays at root
└── ...
```

### **On Your Local Machine (After Pull):**
Same as GitHub structure with `/src` folder.

---

## ⚠️ THE GOLDEN RULES

### **Rule #1: Figma Make is Source of Truth**
- ✅ Edit ALL code in Figma Make (web interface)
- ❌ NEVER manually edit files in GitHub
- ❌ NEVER manually move files in GitHub

### **Rule #2: Let Figma Make Handle File Organization**
- Figma Make automatically moves files to `/src` on push
- DO NOT fight this - it's automatic and unchangeable
- Your configs are already set up to work with this

### **Rule #3: Commands Run Locally ONLY**
- Figma Make has NO terminal/command line
- All `npm`, `vite`, `capacitor` commands run on your machine
- Pull from GitHub before running any commands

---

## 🔄 Your Development Workflow

### **Step 1: Edit in Figma Make**
1. Open Figma Make in browser
2. Edit your code files
3. Test in browser preview

### **Step 2: Push to GitHub**
1. Click "Push to GitHub" in Figma Make
2. Figma Make automatically reorganizes files
3. Files move to `/src`, configs stay at root

### **Step 3: Pull to Local Machine**
```bash
# Navigate to your project
cd /path/to/sevn

# Pull latest from GitHub
git pull origin main

# Install dependencies (if needed)
npm install
```

### **Step 4: Build & Test Locally**
```bash
# Run development server (test in browser)
npm run dev

# Build for production
npm run build

# Sync with Capacitor iOS
npm run cap:sync

# Open in Xcode
npm run cap:open:ios
```

### **Step 5: Test on iOS Device**
1. Xcode opens automatically
2. Select your device/simulator
3. Click "Run" (▶️) button
4. App installs and runs on device

---

## 📁 File Structure Reference

### **Config Files (Root Level)**

#### `vite.config.ts`
- ✅ Already configured for `/src` structure
- ✅ Build output: `build/` directory
- ✅ Entry point: `/index.html` (root level)
- ⚠️ DO NOT EDIT unless absolutely necessary

#### `capacitor.config.ts`
- ✅ Already configured for `build/` output
- ✅ App ID: `com.xhibits`
- ✅ App Name: `SEVN`
- ⚠️ DO NOT EDIT unless absolutely necessary

#### `package.json`
- Scripts for development and builds
- Dependencies locked to specific versions
- Uses Tailwind v3.4.1 (DO NOT UPGRADE)

#### `index.html`
- ✅ Points to `/main.tsx` (Vite resolves this to `/src/main.tsx` after build)
- Contains splash screen
- Contains font-loading blockers
- Contains iOS crash prevention

---

## 🔧 Important Build Settings

### **Vite Configuration:**
```javascript
base: './',              // Relative paths for Capacitor
outDir: 'build',         // Output directory
input: '/index.html',    // Entry point at root
```

### **Capacitor Configuration:**
```javascript
webDir: 'build',         // Matches Vite outDir
appId: 'com.xhibits',
appName: 'SEVN',
```

### **How It Works:**
1. Vite builds from `/src` → outputs to `/build`
2. Capacitor reads from `/build` directory
3. iOS app bundles the `/build` directory

---

## 🐛 Common Issues & Solutions

### **Issue: "Cannot find module '/main.tsx'"**
**Solution:** This is normal in Figma Make. Vite resolves paths correctly during build.

### **Issue: Duplicate files in GitHub**
**Cause:** Manually editing files in GitHub  
**Solution:** Delete duplicates in GitHub, only edit in Figma Make

### **Issue: "Build directory not found"**
**Solution:**
```bash
npm run build    # Create the build directory
npm run cap:sync # Now sync will work
```

### **Issue: iOS app shows blank screen**
**Cause:** Cache issues or missing build  
**Solution:**
1. Delete build folder: `rm -rf build/`
2. Rebuild: `npm run build`
3. Resync: `npm run cap:sync`
4. Clean in Xcode: Product → Clean Build Folder

### **Issue: Tailwind styles not working**
**DO NOT remove Tailwind!**  
**Solution:** Check that `tailwind.config.js` and `postcss.config.cjs` exist

---

## 📦 Dependencies

### **Critical Versions (DO NOT CHANGE):**
- `tailwindcss`: `3.4.1` (NOT v4.x)
- `vite`: `^5.0.8`
- `react`: `^18.2.0`
- `@capacitor/core`: `^6.0.0`

### **Reinstalling Dependencies:**
```bash
# If things break, clean reinstall:
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Deployment Checklist

### **Before Building for iOS:**
- [ ] All code changes pushed from Figma Make
- [ ] Pulled latest from GitHub
- [ ] `npm install` completed successfully
- [ ] `npm run build` completes without errors
- [ ] `npm run cap:sync` completes without errors

### **In Xcode:**
- [ ] Select correct signing team
- [ ] Select target device
- [ ] Build succeeds
- [ ] App runs on device

---

## 🏗️ System Architecture

### **Frontend (React + Tailwind)**
- Single-page application
- Role-based routing (admin vs customer)
- Helvetica Neue typography
- No horizontal scrolling (strict layout rules)

### **Backend (Supabase)**
- Edge Functions (Hono server)
- Key-Value store for data
- Authentication (email/password + social)
- Storage for images/files

### **Mobile (Capacitor)**
- iOS (primary target)
- Android (future)
- Native camera integration
- Push notifications ready

---

## 📝 Quick Command Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Capacitor iOS
npm run cap:sync              # Sync web → native
npm run cap:open:ios          # Open Xcode
npm run cap:run:ios           # Build & run on device

# Capacitor Android (future)
npm run cap:sync
npm run cap:open:android
npm run cap:run:android
```

---

## 🆘 Emergency Contacts

### **When Things Break:**

1. **Check this document first**
2. **Check GitHub commit history**
3. **Re-read the workflow rules above**

### **Nuclear Option (Last Resort):**
```bash
# Complete clean reinstall
rm -rf node_modules package-lock.json build/
npm install
npm run build
npm run cap:sync
```

---

## 🎨 Design System

### **Typography:**
- Font: Helvetica Neue (system fallback)
- Line height: 26px
- Letter spacing: 1px

### **Colors:**
- Brand beige/tan: `#D4D0CA`
- Dark text: `#1e1709`
- White: `#ffffff`

### **UI Patterns:**
- Full-page popup overlays for detailed views
- Triple-border card effects for images
- Consistent 1px borders on images
- No horizontal scrolling anywhere

---

## ✅ Final Reminders

1. **Figma Make = Source of Truth** - Edit here only
2. **GitHub = Storage** - Don't manually edit
3. **Local Machine = Build & Test** - Run commands here
4. **Let Figma Make organize files** - Don't fight the `/src` folder
5. **Pull before building** - Always get latest code first

---

**Remember:** The `/src` folder in GitHub is AUTOMATIC. You cannot change this behavior. Your configs are already set up correctly to handle it.

If this document doesn't answer your question, there might be a bug or missing configuration. Document the exact error and steps to reproduce.

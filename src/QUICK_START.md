# SEVN - Quick Start Guide

**👉 READ THIS EVERY TIME YOU START WORKING**

---

## ⚡ The 3 Golden Rules

### 1️⃣ **Figma Make = Source of Truth**
- ✅ Edit ALL code in Figma Make (web browser)
- ❌ NEVER edit files in GitHub manually
- ❌ NEVER move files in GitHub

### 2️⃣ **Let Figma Make Organize Files**
- Figma Make automatically moves files to `/src` on push
- This is AUTOMATIC and UNCHANGEABLE
- Don't fight it - your configs are already set up

### 3️⃣ **Commands Run Locally ONLY**
- Figma Make has NO terminal
- All `npm`, `vite`, `capacitor` commands run on YOUR machine
- Pull from GitHub before running commands

---

## 🔄 Your 5-Step Workflow

```
┌─────────────────────────────────────────────────┐
│ 1. EDIT in Figma Make (web browser)            │
│    ↓                                            │
│ 2. PUSH to GitHub (click button)               │
│    ↓                                            │
│ 3. PULL to local machine (git pull)            │
│    ↓                                            │
│ 4. BUILD locally (npm run build)               │
│    ↓                                            │
│ 5. TEST on iOS (npx cap sync, open Xcode)      │
└─────────────────────────────────────────────────┘
```

---

## 💻 Local Commands (On Your Machine)

### **Pull Latest Code**
```bash
cd /path/to/sevn
git pull origin main
```

### **Install/Update Dependencies**
```bash
npm install
```

### **Build for Production**
```bash
npm run build
```

### **Sync with Capacitor**
```bash
npm run cap:sync
# or: npx cap sync ios
```

### **Open in Xcode**
```bash
npm run cap:open:ios
# or: npx cap open ios
```

---

## 📁 File Structure (In GitHub)

```
/
├── src/              ← ALL app code (auto-created by Figma Make)
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   └── ...
├── index.html        ← Entry point (at root)
├── vite.config.ts    ← Build config (at root)
├── capacitor.config.ts  ← Mobile config (at root)
└── package.json
```

**⚠️ The `/src` folder is AUTOMATIC - don't manually create or delete it!**

---

## 🐛 Common Issues

### **"Build directory not found"**
```bash
npm run build        # Create build directory first
npm run cap:sync     # Then sync
```

### **"Blank screen on iOS"**
```bash
rm -rf build/        # Delete old build
npm run build        # Rebuild
npm run cap:sync     # Resync
# In Xcode: Product → Clean Build Folder
```

### **Duplicate files in GitHub**
- **Cause:** Manually editing GitHub
- **Fix:** Delete duplicates, only edit in Figma Make

### **Styles not working**
- **DON'T** remove Tailwind (it will break everything!)
- **DO** check that `tailwind.config.js` exists

---

## ⚙️ Critical Settings

### **Tailwind Version**
```json
"tailwindcss": "3.4.1"
```
**DO NOT UPGRADE TO v4!**

### **Build Output**
```javascript
// vite.config.ts
outDir: 'build'

// capacitor.config.ts
webDir: 'build'
```
**Both must match!**

### **Entry Point**
```html
<!-- index.html -->
<script type="module" src="/src/main.tsx"></script>
```
**Points to /src even though file is at root in Figma Make!**

---

## 🆘 When Things Break

1. ✅ Read `/WORKFLOW.md` (detailed guide)
2. ✅ Check this quick start
3. ✅ Nuclear option (last resort):
   ```bash
   rm -rf node_modules package-lock.json build/
   npm install
   npm run build
   npm run cap:sync
   ```

---

## 📝 Test Accounts

| Role     | Email            | Password     |
|----------|------------------|--------------|
| Stylist  | Lissy@sevn.app  | Password123  |
| Customer | Chris@sevn.app  | Password123  |

---

## 🎯 Before Every iOS Build

- [ ] Edited code in Figma Make
- [ ] Pushed to GitHub
- [ ] Pulled to local machine (`git pull`)
- [ ] Installed dependencies (`npm install`)
- [ ] Built successfully (`npm run build`)
- [ ] Synced with Capacitor (`npm run cap:sync`)
- [ ] Ready to open Xcode! 🚀

---

**📖 For complete details, see `/WORKFLOW.md`**

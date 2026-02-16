# SEVN Stylist Admin Interface

A comprehensive stylist admin interface with order-based messaging, client-stylist matching, intake forms, payment processing, and curated selections delivery.

## ⚠️ CRITICAL: File Structure & Workflow

### **Repository Structure**
This repository is built with **Figma Make** and has a specific file organization:

```
/ (GitHub Repository - After Push from Figma Make)
├── src/                         ← ALL app code (auto-organized)
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── supabase/
│   ├── utils/
│   ├── imports/
│   └── styles/
├── index.html                   ← Entry point (references /src/main.tsx)
├── vite.config.ts              ← Already configured for /src structure
├── capacitor.config.ts         ← Already configured for build/ output
├── package.json
└── README.md (this file)
```

### **Development Workflow**

**⚠️ IMPORTANT:** This project is edited in **Figma Make** and uses automated git integration.

1. **Edit code in Figma Make** (web interface only)
2. **Push to GitHub** using Figma Make's "Push to GitHub" button
3. **Pull to local machine** for building/testing
4. **Run all commands locally** (Figma Make has no terminal)

**See `WORKFLOW.md` for complete instructions.**

## 🎯 Overview

SEVN is a complete order lifecycle management system that connects clients with stylists through a structured workflow. The system handles everything from initial intake submission to final curated selections delivery, with integrated payments and real-time messaging.

## 🔄 Order Lifecycle

The system follows a structured order flow:

1. **Intake Submitted** → Client completes intake form
2. **Waitlist** → Order enters stylist queue
3. **Stylist Invites** → Stylist sends invitation to client
4. **Client Pays** → Client pays $100 via payment processing
5. **Stylist Styles** → Stylist curates selections
6. **Selects Delivered** → Client receives curated items

## 👥 User Roles

### Customers
- Complete intake forms with style preferences and images
- View and respond to stylist invitations
- Process payments
- Review curated selections
- Message with assigned stylist

### Stylists
- View waitlisted orders
- Send client invitations
- Create and deliver curated selections
- Manage client conversations
- Access customer intake details

### Admin
- Full system access
- User management
- Order oversight

## 🔐 Authentication

The system uses Supabase authentication with pre-configured test accounts:

### Stylist Account (Lissy)
- **Email:** `Lissy@sevn.app`
- **Password:** `Password123`
- **Username/Handle:** `lissy_roddy`
- **Internal ID:** Supabase UUID (immutable)

### Customer Account (Chris)
- **Email:** `Chris@sevn.app`
- **Password:** `Password123`
- **Username/Handle:** `chris_johnson`

## 🆔 User Identity System

Three-tier ID system for user management:

1. **Internal ID** - Immutable Supabase UUID (never changes)
2. **Username/Handle** - Editable, unique identifier used in URLs (e.g., `/inbox/lissy_roddy`)
3. **Display Name** - Freely editable, non-unique display name

## 🛠 Tech Stack

- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS v3.4.1 (DO NOT upgrade to v4)
- **Backend:** Supabase
  - Database: PostgreSQL with KV Store
  - Auth: Supabase Auth
  - Storage: Supabase Storage (for images/files)
  - Edge Functions: Hono web server
- **Mobile:** Capacitor v6 (iOS + Android)
- **Server Architecture:** Frontend → Server → Database (three-tier)

## 🗄 Database Structure

### Key-Value Store
Primary data storage using `kv_store_b14d984c` table with utility functions:
- `get(key)` - Retrieve single value
- `set(key, value)` - Store single value
- `mget(keys)` - Retrieve multiple values
- `mset(entries)` - Store multiple values
- `getByPrefix(prefix)` - Query by key prefix
- `del(key)` - Delete single value
- `mdel(keys)` - Delete multiple values

### Data Models
- **Users** - Profile data, role assignments
- **Orders** - Intake data, status tracking, stylist assignments
- **Messages** - Conversation threads between clients and stylists
- **Curated Selections** - Stylist-created product recommendations
- **Edits** - Curated content posts

## 🎨 UI Design Patterns

### Global Layout Rules
- **No horizontal scrolling** - Strict constraint across all pages
- **Full-page overlays** - Detailed views use popup overlays
- **Triple-border cards** - Image displays use distinctive triple-border effect

### Inbox Pages (Standardized)
- **Card height:** 480px
- **Border radius:** 12px
- **Typography:** Helvetica Neue Regular
- **Status badges:** 
  - Background: `#E6E6E3`
  - Text: `#8F8F8C`
  - Dimensions: 96px × 28px (waitlisted status)
- **Dividers:** 1px black
- **Stylist name text:** 14px

### Status Badge Styling
Consistent grey badges throughout:
- Waitlisted, In Progress, Completed, etc.
- Uniform styling for visual coherence

## 💰 Payment Integration

- **Amount:** $100 per styling session
- **Flow:** Client pays after accepting stylist invitation
- **Processing:** Integrated payment gateway (implementation ready)

## 📁 Project Structure

```
/
├── App.tsx                          # Main application entry
├── components/                      # Reusable React components
│   └── figma/                      # Protected Figma integration components
├── imports/                         # Figma-imported assets (SVGs, images)
├── styles/
│   └── globals.css                 # Tailwind v4 + custom CSS tokens
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx           # Hono web server
│           └── kv_store.tsx        # KV utilities (protected)
├── utils/
│   └── supabase/
│       └── info.tsx                # Supabase config (protected)
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (pre-configured)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/DovieDov/SEVN_DEV.git
cd SEVN_DEV
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

The following environment variables are pre-configured:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

4. **Run development server**
```bash
npm run dev
```

5. **Build for production**
```bash
npm run build
```

## 📱 Mobile Deployment (Capacitor)

### Setup Capacitor

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init

# Add platforms
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync

# Open in IDE
npx cap open ios    # Opens Xcode
npx cap open android # Opens Android Studio
```

### Development with Live Reload

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run on device with live reload
npx cap run ios --livereload --external
# or
npx cap run android --livereload --external
```

## 🔧 Server Routes

All server routes are prefixed with `/make-server-b14d984c/`

Base URL: `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/`

Example routes:
- `/orders` - Order management
- `/messages` - Messaging system  
- `/users` - User profiles
- `/curated-selections` - Stylist selections

Authorization header: `Bearer ${publicAnonKey}`

## 🖼 Image Handling

### Figma Imported Images
```tsx
// Raster images use figma:asset scheme
import img from "figma:asset/abc123.png"

// SVGs use relative paths
import svgPaths from "./imports/svg-wg56ef214f"
```

### New Images
```tsx
import { ImageWithFallback } from './components/figma/ImageWithFallback'

<ImageWithFallback src={url} alt="Description" />
```

## 📋 Key Features

### ✅ Completed Features
- Customer intake form with image upload
- Stylist waitlist management  
- Order status tracking
- Client-stylist messaging
- Payment flow integration
- Curated selections delivery
- User authentication & profiles
- Responsive design (no horizontal scroll)
- Unified inbox UI across all pages
- Edits feature for curated content

### 🔄 Save-First-Then-Send Flow
All data operations follow save-to-database-first pattern before triggering notifications or state changes.

## 🎯 Testing Accounts

Use these pre-configured accounts for testing:

| Role | Email | Password | Username |
|------|-------|----------|----------|
| Stylist | Lissy@sevn.app | Password123 | lissy_roddy |
| Customer | Chris@sevn.app | Password123 | chris_johnson |

## 📝 Development Guidelines

### Protected Files (Do Not Modify)
- `/components/figma/ImageWithFallback.tsx`
- `/supabase/functions/server/kv_store.tsx`
- `/utils/supabase/info.tsx`

### Code Standards
- TypeScript for all new files
- Tailwind CSS v4 classes
- Functional React components
- Follow existing UI patterns

### UI Consistency
- Maintain 480px card heights on inbox pages
- Use 12px border radius consistently
- Apply Helvetica Neue Regular typography
- Follow triple-border pattern for images
- Ensure no horizontal scrolling

## 🐛 Debugging

### Server Logs
Server errors are logged via console. Check Supabase Edge Function logs.

### Frontend Errors
Check browser console for detailed error messages with contextual information.

### Common Issues
1. **CORS errors** - Verify Supabase allows `capacitor://localhost`
2. **Auth issues** - Confirm environment variables are set
3. **Image loading** - Check `figma:asset` imports don't use path prefixes

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Capacitor Documentation](https://capacitorjs.com)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app)

## 🤝 Contributing

This is a production application under active development. Follow existing patterns and maintain UI consistency.

## 📄 License

Proprietary - Xhibit.ai / SEVN

---

**Last Updated:** February 5, 2026  
**Version:** 1.0.0  
**Maintained by:** Xhibit.ai Team
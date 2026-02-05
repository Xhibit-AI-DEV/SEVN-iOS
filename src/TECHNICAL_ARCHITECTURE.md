# SEVN Stylist Admin - Technical Architecture Documentation

## System Overview

**Application Type:** Stylist Admin Interface  
**Purpose:** Allow stylists to select 7 clothing items for customers based on intake forms and uploaded images  
**Architecture Pattern:** Three-Tier Architecture (Frontend → Backend → Data Layer)

---

## 1. SYSTEM ARCHITECTURE

### Three-Tier Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    TIER 1: FRONTEND                         │
│              React + Tailwind CSS (Vite)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
              HTTPS Requests with Bearer Token
              Authorization: Bearer {publicAnonKey}
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    TIER 2: BACKEND                          │
│        Hono Web Server on Supabase Edge Functions          │
│           Deno Runtime (TypeScript/JavaScript)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
           Supabase Client with SERVICE_ROLE_KEY
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    TIER 3: DATA LAYER                       │
│    Supabase Postgres + Storage + Contentful CMS            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. FRONTEND COMPONENTS

### File Structure
```
/App.tsx                          - Main application entry, customer selection
/components/
  ├── StylistWorkspace.tsx        - Main workspace container
  ├── CustomerList.tsx            - Customer list sidebar (60px wide)
  ├── CustomerIntakePanel.tsx     - Display customer data from Contentful
  ├── AiSearchPanel.tsx           - AI-powered product search
  ├── SelectionsPanel.tsx         - Manage 7 selections, save, send email
  └── TechnicalArchitecture.tsx   - This documentation page
/utils/supabase/info.tsx          - Supabase config (projectId, publicAnonKey)
/styles/globals.css               - Tailwind v4 configuration
```

### Component Responsibilities

**App.tsx**
- Loads customer list from Contentful via backend
- Manages customer selection state
- Renders CustomerList sidebar + StylistWorkspace

**StylistWorkspace.tsx**
- Main workspace layout (3 panels)
- Manages selected items state (up to 7)
- Auto-saves items to backend on change
- Loads items from backend on customer switch

**CustomerList.tsx**
- Displays customers in vertical sidebar
- Shows customer profile images
- Handles customer selection

**CustomerIntakePanel.tsx**
- Displays customer name, email, intake answers
- Shows customer uploaded images from Contentful
- Fetches and displays assigned stylist info

**AiSearchPanel.tsx**
- Voice input and manual URL input
- AI-powered product search using OpenAI + Serper
- Fetches product metadata via backend

**SelectionsPanel.tsx**
- Displays up to 7 selected items with images
- Reorder items via drag-and-drop
- Delete individual items or clear all
- Save selections to backend
- Send email via SendGrid with hosted images

---

## 3. BACKEND SERVICES

### Base URL
```
https://{projectId}.supabase.co/functions/v1/make-server-b14d984c/
```

### Server Configuration

**File:** `/supabase/functions/server/index.tsx`

- **Framework:** Hono (lightweight web framework for Deno)
- **Runtime:** Deno.serve(app.fetch)
- **CORS:** Open CORS headers for all origins
- **Logging:** Console logging via Hono logger middleware
- **Authentication:** Bearer token in Authorization header (publicAnonKey for frontend)

### API Endpoints

#### Contentful Integration
**File:** `/supabase/functions/server/index.tsx` (lines 94-284)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/customers` | GET | List all clients from Contentful (content_type=client) |
| `/customers/:id` | GET | Get single customer by ID |
| `/stylists` | GET | List all stylists from Contentful (content_type=stylist) |
| `/stylists/:id` | GET | Get single stylist by ID (supports sys.id or field queries) |
| `/assets/:id` | GET | Get Contentful asset (images) |

#### Selections Management
**File:** `/supabase/functions/server/selections.tsx`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/selections/save` | POST | Save all selections data to database |
| `/selections/get/:customerId` | GET | Load selections from database |
| `/selections/fetch-metadata` | POST | Scrape product metadata + host image |
| `/selections/migrate-images/:customerId` | POST | Re-host broken images to public bucket |
| `/selections/fix-bucket` | POST | Make storage bucket public |
| `/selections/delete/:customerId` | DELETE | Clear all selections for customer |

**Critical:** The `/selections/fetch-metadata` endpoint:
1. Receives product URL
2. Scrapes metadata (title, price, description, image URL)
3. **Downloads image from external URL**
4. **Uploads image to Supabase Storage (PUBLIC bucket)**
5. **Returns permanent public URL** (NOT original URL)

This is essential for email compatibility - email clients cannot access external/private URLs.

#### Email Integration
**File:** `/supabase/functions/server/sendgrid.tsx`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/sendgrid/send-draft` | POST | Send email via SendGrid dynamic template |

**SendGrid Configuration:**
- Template ID: `d-167e6b7fee4d498fb49335864211eb4e`
- From: `dov@sevn.app`
- Dynamic template data: customer info, stylist info, 7 items with public image URLs

**Email Data Structure:**
```json
{
  "clientName": "John Doe",
  "clientEmail": "customer@example.com",
  "clientImage": "https://images.ctfassets.net/...",
  "stylistName": "Jane Smith",
  "stylistImage": "https://images.ctfassets.net/...",
  "stylingNotes": "Casual style preference with modern minimalist aesthetic...",
  "items": [
    {
      "id": "unique-id",
      "url": "https://product-url.com",
      "image": "https://{projectId}.supabase.co/storage/v1/object/public/...",
      "title": "Product Name",
      "price": "$99.99",
      "description": "Product details"
    }
    // ... up to 7 items
  ]
}
```

The email template renders:
- Client's profile image
- Stylist's profile image and name
- Personalized styling notes from stylist
- All 7 selected product items with images, titles, prices, and links

#### AI Search
**File:** `/supabase/functions/server/ai-search.tsx`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai-search/search` | POST | AI product search using OpenAI GPT-4 + Serper API |

---

## 4. DATA LAYER

### Supabase Postgres Database

**Table:** `kv_store_b14d984c`

**Schema:**
```
key: TEXT (PRIMARY KEY)
value: JSONB
```

**Key Format:**
```
selections:{customerId}
```

**Value Structure (JSON):**
```json
{
  "customerId": "abc123",
  "clientEmail": "customer@example.com",
  "clientName": "John Doe",
  "clientImage": "https://images.ctfassets.net/...",
  "stylistName": "Jane Smith",
  "stylistImage": "https://images.ctfassets.net/...",
  "stylingNotes": "Casual style preference...",
  "intakeAnswers": "Q: Style? A: Modern minimalist...",
  "items": [
    {
      "id": "unique-id-1",
      "url": "https://product-url.com",
      "image": "https://{projectId}.supabase.co/storage/v1/object/public/make-b14d984c-product-images/...",
      "title": "Product Name",
      "price": "$99.99",
      "description": "Product details"
    }
    // ... up to 7 items
  ],
  "updatedAt": "2025-12-08T12:34:56.789Z"
}
```

**Access via:** `/supabase/functions/server/kv_store.tsx` (READ ONLY FILE)

**Available Functions:**
- `get(key)` - Get single value
- `set(key, value)` - Set value
- `mget(keys[])` - Get multiple values
- `mset(keyValuePairs)` - Set multiple values
- `del(key)` - Delete key
- `mdel(keys[])` - Delete multiple keys
- `getByPrefix(prefix)` - Query by key prefix

**Important:** Do NOT modify `kv_store.tsx` file. Do NOT write migration files or DDL statements.

### Supabase Storage

**Bucket Name:** `make-b14d984c-product-images`

**Configuration:**
- **Visibility:** PUBLIC (critical for email images)
- **Purpose:** Permanently host product images with public URLs
- **File Naming:** `{customerId}/{timestamp}-{hash}.jpg`

**Why Public?**
Email clients (Gmail, Outlook, etc.) cannot access:
- Private/signed URLs reliably
- External URLs with authentication
- Short-lived signed URLs

**Image Hosting Flow:**
1. Backend receives product URL
2. Backend scrapes page for image URL
3. Backend downloads image from external site
4. Backend uploads to Supabase Storage (public bucket)
5. Backend returns permanent public URL: `https://{projectId}.supabase.co/storage/v1/object/public/make-b14d984c-product-images/{customerId}/{filename}`
6. Public URL stored in database
7. Public URL used in SendGrid email

### Contentful CMS

**Space ID:** `1inmo0bc6xc9`  
**Environment:** `master`  
**Access Token:** (stored in CONTENTFUL_ACCESS_TOKEN env var)

#### Content Type: `client`

**Fields:**
- `name` (Text) - Client name
- `email` (Rich Text Document) - Client email address
  - Stored as Contentful Rich Text
  - Extracted via `extractTextFromRichText()` helper
- `intake_answers` (Rich Text Document) - Questionnaire responses
  - Multi-paragraph text with questions and answers
  - Extracted and formatted for display
- `stylist_id` (Rich Text Document) - Assigned stylist sys.id
  - References stylist entry
- `images` (Media - Array) - Customer uploaded photos
  - Array of asset references
  - Each: `{ sys: { id: "assetId" } }`

#### Content Type: `stylist`

**Fields:**
- `fullname` (Text) - Stylist full name
- `bio` (Rich Text Document) - Contains title/role (e.g., "STUDIO STYLIST")
- `profile_picture` (Media) - Stylist headshot
  - Single asset reference

**Asset Structure:**
```json
{
  "sys": { "id": "assetId" },
  "fields": {
    "file": {
      "url": "//images.ctfassets.net/...",
      "contentType": "image/jpeg"
    }
  }
}
```

**Note:** Contentful URLs start with `//` - prepend `https:` for full URL

---

## 5. CRITICAL DATA FLOWS

### Flow 1: Add Item to Selections

```
User Action: Paste URL or use AI search
    ↓
Frontend: POST /selections/fetch-metadata
    body: { url: "https://product.com/item" }
    ↓
Backend: Scrape product page
    - Extract title, price, description
    - Extract image URL from og:image meta tag
    ↓
Backend: Download image from external URL
    - Fetch image binary data
    ↓
Backend: Upload to Supabase Storage
    - Bucket: make-b14d984c-product-images
    - Path: {customerId}/{timestamp}-{hash}.jpg
    - Generate public URL
    ↓
Backend: Return metadata with public image URL
    {
      url: "https://product.com/item",
      title: "Product Name",
      price: "$99.99",
      image: "https://{projectId}.supabase.co/storage/v1/object/public/..."
    }
    ↓
Frontend: Add item to selections array
    ↓
Frontend: Auto-save via POST /selections/save
    ↓
Backend: Store in database (kv_store)
    key: selections:{customerId}
    value: { items: [...], ... }
```

### Flow 2: Send Email (Save-First-Then-Send Pattern)

```
User Action: Click "Send" button
    ↓
Frontend: Fetch customer data from Contentful
    GET /customers/{customerId}
    - Extract email from Rich Text
    - Get name, images
    ↓
Frontend: Fetch stylist data from Contentful
    GET /stylists/{stylistId}
    - Extract name from fields
    - Extract title from bio Rich Text
    - Get profile image
    ↓
Frontend: STEP 1 - Save all data to backend
    POST /selections/save
    body: {
      customerId,
      clientEmail,
      clientName,
      clientImage,
      stylistName,
      stylistImage,
      stylingNotes,
      intakeAnswers,
      items: [...]
    }
    ↓
Backend: Store in database
    key: selections:{customerId}
    ↓
Frontend: STEP 2 - Load saved data from backend
    GET /selections/get/{customerId}
    ↓
Backend: Retrieve from database
    Returns complete selections object
    ↓
Frontend: STEP 3 - Send email with backend data
    POST /sendgrid/send-draft
    body: {
      to: clientEmail,
      clientName,
      stylistName,
      items: [7 items with public image URLs]
    }
    ↓
Backend: Call SendGrid API
    - Template: d-167e6b7fee4d498fb49335864211eb4e
    - From: dov@sevn.app
    - Dynamic template data with all customer/stylist/items
    ↓
SendGrid: Send email to customer
    - Email renders with hosted images (public URLs work in email clients)
    ↓
Frontend: Show success message
```

### Flow 3: Re-host Broken Images

```
User Action: Click "Re-host Images" button
    ↓
Frontend: POST /selections/migrate-images/{customerId}
    ↓
Backend: Load existing selections from database
    GET selections:{customerId} from kv_store
    ↓
Backend: For each item in selections.items:
    - Check if image URL is broken/private
    - Download image from current URL or original product URL
    - Upload to public Supabase Storage bucket
    - Generate new public URL
    - Update item.image with new public URL
    ↓
Backend: Save updated selections to database
    SET selections:{customerId} with updated items
    ↓
Backend: Return success with updated items count
    ↓
Frontend: Show success message
    "✅ Re-hosted 7 images successfully! Please refresh the page."
    ↓
User Action: Refresh page (F5)
    ↓
Frontend: Load selections from backend
    - Now has new public image URLs
```

---

## 6. ENVIRONMENT VARIABLES

### Required Environment Variables (Backend)

All environment variables are already configured in the Figma Make environment:

```
# Contentful CMS
CONTENTFUL_SPACE_ID=1inmo0bc6xc9
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_ACCESS_TOKEN={provided}

# SendGrid Email
SENDGRID_API_KEY={provided}

# AI Search
OPENAI_API_KEY={provided}
SERPER_API_KEY={provided}

# Supabase (Auto-configured)
SUPABASE_URL={auto}
SUPABASE_ANON_KEY={auto}
SUPABASE_SERVICE_ROLE_KEY={auto}  # SERVER ONLY - never expose to frontend
SUPABASE_DB_URL={auto}
```

**Security Notes:**
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be sent to frontend
- Frontend uses `publicAnonKey` from `/utils/supabase/info.tsx`
- Backend uses `SERVICE_ROLE_KEY` for admin operations (storage, database)

---

## 7. KNOWN ISSUES & DEBUGGING

### Issue 1: Broken Image URLs

**Symptom:** Product images don't display in selections panel or email

**Cause:** Images uploaded when bucket was private have broken URLs

**Current State:**
- Bucket `make-b14d984c-product-images` is now PUBLIC
- New images upload correctly with public URLs
- Old images still have broken/private URLs

**Solution:**
1. Click "Re-host Images" button in SelectionsPanel
2. Backend downloads and re-uploads all images to public bucket
3. Refresh page to see updated images

**Debug Steps:**
1. Check browser console for image load errors
2. Verify bucket is public:
   - Supabase Dashboard → Storage → make-b14d984c-product-images → Settings → Public bucket = ON
3. Test image URL directly in browser:
   - Should be: `https://{projectId}.supabase.co/storage/v1/object/public/make-b14d984c-product-images/...`
   - Should NOT be: signed URL with token parameter
4. Check backend logs:
   - POST /selections/fetch-metadata should log "Uploading to public bucket"
   - Should return public URL, not signed URL

### Issue 2: Email Images Not Displaying

**Symptom:** Email sends successfully but images are broken

**Cause:** Images are not hosted in public bucket, using external URLs or private URLs

**Solution:**
- All images MUST be hosted in Supabase Storage public bucket
- Re-host images before sending email
- Verify image URLs in database start with: `https://{projectId}.supabase.co/storage/v1/object/public/`

### Issue 3: Page Reload Issues

**Symptom:** Page goes white after certain actions

**Cause:** Automatic page reload after re-hosting images

**Current Fix:** Removed automatic reload, user must manually refresh (F5)

**Better Solution:** Frontend should reload data without full page refresh:
```typescript
// After re-hosting
const loadSelectionsFromBackend = async () => {
  const response = await fetch(`/selections/get/${customerId}`);
  const data = await response.json();
  setSelectedItems(data.items || []);
};
```

### Debugging Checklist

**Frontend Issues:**
1. Open browser DevTools → Console
2. Check for errors in red
3. Check Network tab for failed requests
4. Verify API requests have correct Authorization header

**Backend Issues:**
1. Check Supabase Dashboard → Edge Functions → Logs
2. Look for console.log output from server
3. Check for error responses (status 400, 500)
4. Verify environment variables are set

**Contentful Issues:**
1. Verify Space ID and Access Token are correct
2. Check content type names: "client" and "stylist" (case-sensitive)
3. Verify field names match code (name, email, intake_answers, etc.)
4. Check Rich Text Document fields are being extracted correctly

**Image Hosting Issues:**
1. Verify bucket is PUBLIC in Supabase Dashboard
2. Test image URL directly in browser (should load without auth)
3. Check backend logs for upload errors
4. Verify image URLs in database are public URLs

---

## 8. DEPLOYMENT & SETUP

### Current Deployment
- **Platform:** Figma Make (Vite + Supabase)
- **Frontend:** Automatically built and deployed
- **Backend:** Supabase Edge Functions (auto-deployed)
- **Database:** Supabase Postgres (auto-configured)
- **Storage:** Supabase Storage (auto-configured)

### Setup Steps for New Environment

If deploying to a new environment:

1. **Configure Supabase:**
   - Create Supabase project
   - Note projectId, publicAnonKey, serviceRoleKey
   - Create storage bucket: `make-b14d984c-product-images` (PUBLIC)

2. **Configure Contentful:**
   - Get Space ID, Environment, Access Token
   - Verify content types exist: "client", "stylist"

3. **Configure SendGrid:**
   - Create account and API key
   - Create dynamic template with ID
   - Verify sender email

4. **Configure AI Services:**
   - Get OpenAI API key
   - Get Serper API key

5. **Set Environment Variables:**
   - Add all variables listed in section 6
   - Deploy backend Edge Functions
   - Deploy frontend application

6. **Test:**
   - Load customers from Contentful
   - Add product via URL
   - Verify image hosts in public bucket
   - Send test email
   - Verify email displays images correctly

---

## 9. API REFERENCE QUICK GUIDE

### Contentful API

**Base URL:** `https://cdn.contentful.com/spaces/{spaceId}/environments/{environment}`

**Get Entries:**
```
GET /entries?content_type={contentType}
Authorization: Bearer {accessToken}
```

**Get Single Entry:**
```
GET /entries/{entryId}
Authorization: Bearer {accessToken}
```

**Get Asset:**
```
GET /assets/{assetId}
Authorization: Bearer {accessToken}
```

### Supabase Storage API

**Upload File:**
```typescript
const { data, error } = await supabase.storage
  .from('make-b14d984c-product-images')
  .upload(filePath, fileBuffer, {
    contentType: 'image/jpeg',
    cacheControl: '3600'
  });
```

**Get Public URL:**
```typescript
const { data } = supabase.storage
  .from('make-b14d984c-product-images')
  .getPublicUrl(filePath);
// Returns: { publicUrl: "https://..." }
```

### SendGrid API

**Send Email:**
```typescript
await fetch('https://api.sendgrid.com/v3/mail/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: { email: 'dov@sevn.app' },
    personalizations: [{
      to: [{ email: customerEmail }],
      dynamic_template_data: { /* template data */ }
    }],
    template_id: 'd-167e6b7fee4d498fb49335864211eb4e'
  })
});
```

---

## 10. CODE STYLE & CONVENTIONS

### File Naming
- Components: PascalCase (`CustomerList.tsx`)
- Utilities: camelCase (`kv_store.tsx`)
- Styles: kebab-case (`globals.css`)

### Component Structure
```typescript
// Imports
import { useState } from 'react';

// Interfaces
interface ComponentProps {
  prop: string;
}

// Component
export function Component({ prop }: ComponentProps) {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {}, []);
  
  // Handlers
  const handleAction = () => {};
  
  // Render
  return <div>...</div>;
}
```

### Backend Route Structure
```typescript
// File: /supabase/functions/server/feature.tsx
import { Hono } from 'npm:hono';

const app = new Hono();

app.post('/route', async (c) => {
  try {
    // Logic
    return c.json({ success: true });
  } catch (error) {
    console.error('Error context:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
```

### Error Handling
- Always log errors with context
- Return user-friendly error messages
- Use HTTP status codes correctly
- Log both frontend and backend errors

---

## 11. FUTURE IMPROVEMENTS

### Suggested Enhancements

1. **Real-time Updates:** Use Supabase Realtime for live collaboration
2. **Image Optimization:** Compress/resize images before upload
3. **Caching:** Cache Contentful data to reduce API calls
4. **Batch Operations:** Bulk re-host all customers' images
5. **Analytics:** Track stylist performance, popular items
6. **Customer Preview:** Let customers preview selections before email
7. **Version History:** Track selection changes over time
8. **Mobile Support:** Responsive design for mobile stylists
9. **Image Cropping:** Allow stylists to crop product images
10. **Smart Recommendations:** AI-powered product suggestions based on intake

---

## SUPPORT & CONTACT

For technical issues or questions:
- Review browser console logs
- Check Supabase Edge Function logs
- Verify all environment variables are set
- Test each data flow independently
- Use the "📐 View Architecture" button in the app for interactive documentation

Last Updated: December 8, 2025
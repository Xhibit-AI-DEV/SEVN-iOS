# SEVN SELECTS - Complete Design Flows Documentation

**Last Updated:** January 28, 2026  
**Platform:** Customer-facing interface at sevn.app/lissy + Admin interface

---

## 🎯 Overview

This document maps all user flows, pages, and interactions for the SEVN SELECTS styling platform. The system has two main interfaces:

1. **Customer Interface** (sevn.app/lissy) - Customer sign-in, intake form, and waitlist
2. **Admin Interface** - Stylist workspace for creating edits and managing customers

---

## 📱 CUSTOMER INTERFACE FLOWS

### Design Principles
- **Mobile-first:** All pages optimized for mobile viewport
- **No horizontal scroll:** Strict vertical scrolling only, locked to viewport width
- **Brand colors:** `#fffefd` (cream background), `#1e1709` (dark text/borders)
- **Typography:** Helvetica Neue family with uppercase styling

---

### Flow 1: Authentication

#### 1.1 Landing Page (`/lissy`)
**Component:** `LissyLanding.tsx`

**Layout:**
- Hero section with Lissy branding
- "SIGN IN" button (primary CTA)
- "SIGN UP" link (secondary)

**Actions:**
- Click "SIGN IN" → Navigate to `/lissy/signin`
- Click "SIGN UP" → Navigate to `/lissy/signin` (same page, toggle mode)

---

#### 1.2 Sign In / Sign Up Page (`/lissy/signin`)
**Component:** `SignIn.tsx`

**Features:**
- Toggle between Sign In and Sign Up modes
- Email + Password inputs
- Error handling for:
  - Invalid credentials
  - Duplicate email addresses (sign up)
  - Missing fields

**Sign In Flow:**
1. User enters email and password
2. Click "SIGN IN"
3. System authenticates via Supabase
4. **Success:** Redirect to `/lissy` (home page)
5. **Error:** Display error message

**Sign Up Flow:**
1. User enters name, email, password
2. Click "SIGN UP"
3. System creates account in Supabase
4. Email auto-confirmed (no email server configured)
5. **Success:** Redirect to `/lissy` (home page)
6. **Duplicate email:** Display "Email already registered" error
7. **Error:** Display error message

**Important Notes:**
- NO "Welcome back!" toast notification
- Both sign-in and sign-up redirect to home page (NOT intake form)
- User must manually navigate to intake form from home

---

### Flow 2: Customer Intake Journey

#### 2.1 Home Page After Sign In (`/lissy`)
**Component:** `HomePage.tsx`

**Layout:**
- Welcome message
- Navigation to intake form
- Access to profile and other features

**Action:**
- User clicks "START INTAKE" → Navigate to intake form

---

#### 2.2 Intake Form (`/lissy/intake`)
**Component:** `IntakeForm.tsx`

**Multi-step form with the following sections:**

##### Step 1: Personal Info
- Name
- Email (pre-filled if signed in)
- Phone (optional)

##### Step 2: Style Preferences
- Preferred style aesthetic (dropdown)
- Favorite brands
- Budget range
- Sizes (tops, bottoms, shoes)

##### Step 3: Occasion & Goals
- What occasions are you styling for?
- Style goals (checkboxes)
- Color preferences

##### Step 4: Body & Fit
- Body type
- Fit preferences
- Areas to highlight/avoid

##### Step 5: Image Uploads
- Upload 3-5 photos:
  - Full body shots
  - Current wardrobe
  - Inspiration images
- Image preview with delete option
- Drag & drop or click to upload

##### Step 6: Additional Notes
- Free text area for special requests
- Allergies/sensitivities (fabric)
- Timeline expectations

**Form Behavior:**
- Progress indicator showing current step
- "BACK" and "CONTINUE" navigation
- Validation on each step
- All data saved to Supabase on submit

**Submission Flow:**
1. User completes all steps
2. Click "SUBMIT INTAKE"
3. Data saved with status: `"invited"` linked to stylist
4. ~~Toast notification: "Intake submitted!"~~ **REMOVED**
5. Auto-navigate to waitlist page

---

#### 2.3 Waitlist Page (`/lissy/waitlist`)
**Component:** `WaitlistPage.tsx`

**Two States:**

##### Before Joining Waitlist:
- Lookbook card with triple border effect
- Image carousel/layered images
- "CURATED EDIT → STYLE NOTES" heading
- Description: "7 Item capsule Edit + Styling notes curated by lissy roddy."
- Price: "£100 · Limited availability"
- **"JOIN WAITLIST"** button

##### After Joining Waitlist (or completing intake):
- Reference photo card (396px height)
- Triple border effect (signature style)
- Subtle divider (1px, 12% opacity)
- Text: **"YOU'RE ON THE LIST"** (23px, Helvetica Neue Regular)
- **"INVITE"** button (black background, white text)

**Button Actions:**
- "JOIN WAITLIST" → Show confirmation state
- "INVITE" → Navigate back to home (`/lissy`)

**Future Enhancement:**
- Check icon state for users who have been styled already

---

### Flow 3: Customer Profile & Settings

#### 3.1 Profile Page (`/lissy/profile`)
**Component:** `ProfilePage.tsx`

**Features:**
- View/edit personal information
- View intake form responses
- Sign out button

---

## 🖥️ ADMIN INTERFACE FLOWS

### Flow 4: Stylist Dashboard

#### 4.1 Admin Dashboard (`/admin`)
**Component:** `AdminDashboard.tsx`

**Layout:**
- Customer list with filters
- Status indicators:
  - "invited" (new customers)
  - "in_progress" (being styled)
  - "completed" (edit sent)
- Search functionality
- Quick actions

**Actions:**
- Click customer → Open workspace
- Filter by status
- Search by name/email

---

### Flow 5: Stylist Workspace

#### 5.1 Stylist Workspace (`/stylist/:customerId`)
**Component:** `StylistWorkspace.tsx`

**Three-Panel Layout:**

##### Left Panel: Customer Intake
**Component:** `CustomerIntakePanel.tsx`
- Customer details
- Intake form responses
- Uploaded images
- Style preferences
- Notes

##### Center Panel: Product Selections
**Component:** `SelectionsPanel.tsx`
- 7 product slots
- Add product via:
  - Manual entry (URL, name, price, image)
  - Search integration (coming soon)
- Remove product
- Reorder products
- Style notes for each item

##### Right Panel: GPT Search
**Component:** `GPTSearchPanel.tsx`
- AI-powered product search
- Custom GPT instructions
- Learns Lissy's styling patterns
- Search filters

**Key Features:**
- **Save-first-then-send workflow**
- Auto-save drafts
- Send edit via SendGrid
- Email template with all 7 selects

---

### Flow 6: Creating an Edit

**Step-by-step process:**

1. **Select Customer** from dashboard
2. **Review Intake** in left panel
   - Read style preferences
   - View uploaded images
   - Note special requests
3. **Search for Products** using GPT panel
   - Use AI to find relevant items
   - Consider customer's budget/style
4. **Add 7 Products**
   - Fill all 7 selection slots
   - Add styling notes for each
5. **Save Draft**
   - Auto-saves progress
   - Can resume later
6. **Preview Email**
   - Check product grid
   - Verify links and images
7. **Send to Customer**
   - SendGrid email delivery
   - Customer receives edit
   - Status updates to "completed"

---

## 🗂️ Data Structure

### Customer Record (Supabase)
```json
{
  "id": "uuid",
  "name": "Customer Name",
  "email": "customer@email.com",
  "phone": "optional",
  "stylist_id": "stylist_uuid",
  "status": "invited | in_progress | completed",
  "intake_data": {
    "style_preferences": {},
    "sizes": {},
    "budget": {},
    "goals": [],
    "body_type": {},
    "images": []
  },
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Selection/Edit Record
```json
{
  "id": "uuid",
  "customer_id": "uuid",
  "stylist_id": "uuid",
  "selections": [
    {
      "slot": 1,
      "product_name": "Item Name",
      "product_url": "https://...",
      "price": "£100",
      "image_url": "https://...",
      "styling_note": "Pair with..."
    }
    // ... 7 total
  ],
  "status": "draft | sent",
  "sent_at": "timestamp",
  "created_at": "timestamp"
}
```

---

## 🎨 Design System

### Colors
- **Cream:** `#fffefd` (primary background)
- **Dark:** `#1e1709` (text, borders, buttons)
- **Hover:** `#2a2010` (button hover state)

### Typography
- **Primary:** Helvetica Neue family
- **Weights:** Light (300), Regular (400), Bold (700)
- **Style:** Uppercase with letter-spacing (1-2px)
- **Sizes:**
  - Headings: 20-24px
  - Body: 12-16px
  - Labels: 14px

### Components
- **Buttons:** 52px height, 8px border-radius, uppercase text
- **Cards:** Triple border effect (signature style)
- **Inputs:** Minimal styling, 1px borders
- **Images:** Rounded corners, object-cover fit

### Layout Rules
- **Max width:** 393px (mobile-optimized)
- **Padding:** 4px (1rem) on mobile
- **Spacing:** Consistent 6-24px gaps
- **No horizontal scroll:** Strict overflow-x-hidden

---

## 🔄 Key User Journeys

### New Customer Journey
1. Land on `/lissy` → Sign up
2. Redirect to home → Click "Start Intake"
3. Complete intake form (6 steps)
4. Submit → Auto-navigate to waitlist
5. See "YOU'RE ON THE LIST" confirmation
6. Click "INVITE" → Return home
7. Wait for stylist to create edit
8. Receive email with 7 selects

### Stylist Journey
1. Log into admin dashboard
2. See new customer with "invited" status
3. Click customer → Open workspace
4. Review intake in left panel
5. Use GPT search to find products
6. Add 7 products with styling notes
7. Save draft (auto-saves)
8. Preview email
9. Send to customer
10. Status updates to "completed"

---

## 🚀 Technical Architecture

### Frontend
- **Framework:** React with TypeScript
- **Routing:** React Router
- **Styling:** Tailwind CSS v4
- **State:** React hooks (useState, useEffect)
- **Forms:** Controlled components with validation

### Backend
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (for images)
- **Email:** SendGrid API
- **Server:** Hono web server on Supabase Edge Functions

### Integrations
- **AI Search:** OpenAI GPT (custom instructions)
- **Image Upload:** Supabase Storage with signed URLs
- **Email Templates:** SendGrid dynamic templates

---

## 📋 Component Inventory

### Customer Components
- `LissyLanding.tsx` - Landing page
- `SignIn.tsx` - Authentication (sign in/up)
- `IntakeForm.tsx` - Multi-step intake form
- `WaitlistPage.tsx` - Waitlist confirmation
- `HomePage.tsx` - Customer home
- `ProfilePage.tsx` - Customer profile
- `BottomNavigation.tsx` - Mobile nav bar

### Admin Components
- `AdminDashboard.tsx` - Main dashboard
- `StylistWorkspace.tsx` - Three-panel workspace
- `CustomerIntakePanel.tsx` - Left panel
- `SelectionsPanel.tsx` - Center panel (7 products)
- `GPTSearchPanel.tsx` - Right panel (AI search)
- `CustomerList.tsx` - Filterable customer list
- `CreateEditPage.tsx` - Edit creation flow

### Shared Components
- `ProtectedRoute.tsx` - Auth guard
- `EditCard.tsx` - Product card display
- `EditDetailPage.tsx` - Full edit view

---

## ✅ Completed Features

- ✅ Customer authentication (sign in/up)
- ✅ Error handling for duplicate emails
- ✅ Redirect to home after auth (not intake)
- ✅ Multi-step intake form with validation
- ✅ Image upload to Supabase Storage
- ✅ Waitlist page with two states
- ✅ "INVITE" button (not "EXPLORE EDITS")
- ✅ Removed "Intake submitted!" toast
- ✅ Adjusted "YOU'RE ON THE LIST" text (23px, thinner)
- ✅ Save customer data to Supabase (not Contentful)
- ✅ Stylist workspace with three panels
- ✅ GPT search integration
- ✅ SendGrid email delivery
- ✅ Save-first-then-send workflow

---

## 🔮 Future Enhancements

- Check icon state for styled customers
- Customer view of their received edit
- Re-styling requests
- Rating/feedback system
- Push notifications
- Social login (Google, Facebook)
- Stylist analytics dashboard
- Customer style evolution tracking

---

## 🎯 Current Status

**Ready for Testing:**
- Complete styling flow for Lissy Roddy
- Customer can sign up → fill intake → join waitlist
- Stylist can review intake → create edit → send email

**Next Steps:**
- Test complete flow end-to-end
- Verify email delivery
- Check mobile responsiveness
- Add check icon for completed customers

---

## 📸 Visual Flow Diagram

```
CUSTOMER FLOW:
sevn.app/lissy (Landing)
    ↓
Sign In/Sign Up
    ↓
Home Page
    ↓
Intake Form (6 steps)
    ↓
Waitlist Page ("YOU'RE ON THE LIST")
    ↓
[Wait for stylist]
    ↓
Email with 7 selects

STYLIST FLOW:
Admin Dashboard
    ↓
Select Customer
    ↓
Stylist Workspace (3 panels)
    ↓
Review Intake + Search Products + Add 7 Selects
    ↓
Save Draft
    ↓
Send Email
    ↓
Customer receives edit
```

---

**End of Documentation**

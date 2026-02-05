# SEVN SELECTS - Complete System Flow

**Updated:** January 28, 2026

---

## 🎯 System Overview

SEVN SELECTS is a two-sided platform:
- **Customer Side:** sevn.app/lissy (intake, waitlist, profile)
- **Stylist Side:** Admin interface (messages, workspace, dashboard)

---

## 📱 CUSTOMER JOURNEY (Step-by-Step)

### Step 1: Sign Up / Sign In
**Screen:** `/lissy/signin`

Customer arrives and creates account:
- Enters email + password
- Clicks "SIGN UP"
- Account created via Supabase Auth
- Redirects to home page (`/home`)

---

### Step 2: Home Page
**Screen:** `/home`

Customer sees:
- Welcome message
- Navigation options
- "START INTAKE" button

Action: Click "START INTAKE"

---

### Step 3: Complete Intake Form
**Screen:** `/lissy/intake`

**6-Step Multi-Step Form:**

**Step 1: Personal Info**
- Name, Email, Phone

**Step 2: Style Preferences**
- Style aesthetic
- Favorite brands
- Budget range
- Sizes (tops, bottoms, shoes)

**Step 3: Occasions & Goals**
- Styling occasions
- Style goals
- Color preferences

**Step 4: Body & Fit**
- Body type
- Fit preferences
- Areas to highlight/avoid

**Step 5: Image Uploads**
- Upload main image (full body photo)
- Upload reference images (inspiration, current wardrobe)
- Drag & drop or click to upload
- Preview with delete option

**Step 6: Additional Notes**
- Free text for special requests
- Fabric allergies
- Timeline expectations

**On Submit:**
- All data saves to Supabase KV store
- Status set to: `"invited"`
- Customer linked to stylist (default: "lissy")
- Auto-navigates to waitlist page

---

### Step 4: Waitlist Page
**Screen:** `/lissy/waitlist`

Customer sees confirmation:
- Reference photo card (396px height)
- Triple border effect (signature style)
- Text: **"YOU'RE ON THE LIST"** (23px)
- **"INVITE"** button

Action: Click "INVITE" → Returns to home

**Customer now waits for stylist to create their edit**

---

## 👩‍💼 STYLIST JOURNEY (Step-by-Step)

### Step 1: Messages Page
**Screen:** `/messages` or admin dashboard

Stylist (Lissy) logs in and sees:
- List of customers who completed intake
- Each row shows:
  - Customer photo (60px circle)
  - Customer name
  - Status indicator
  - Check icon

**"Ready to style" header:**
- Shows count of customers waiting
- Black background button
- Navigates to full list

---

### Step 2: Customer Message Detail
**Screen:** `/rory-selects/:customerId`

**What Stylist Sees:**

**📸 Customer's Main Image**
- Triple border card (signature design)
- 286px × 368px
- Customer's uploaded photo

**Customer Name**
- Displayed prominently
- UPPERCASE formatting

**Status Badge**
- Shows: "INVITED" / "IN PROGRESS" / "COMPLETED"

**👤 Lissy's Profile Photo**
- 162px circular photo
- Name badge overlay: "LISSY RODDY"

**📋 Complete Style Intake**
All customer answers displayed:
- Contact info (email, phone)
- Style preferences
- Favorite brands
- Budget range
- Sizes (tops, bottoms, shoes)
- Style goals
- Color preferences
- Body type & fit preferences
- Areas to highlight/avoid
- Additional notes

**🖼️ Additional Uploaded Images**
- Grid layout (2 columns)
- All reference photos customer uploaded
- 227px height per image

**🎯 INVITE Button**
- Large black button
- Text: "INVITE"
- Only shows if status is "invited" or "new"

---

### Step 3: Click INVITE
**What Happens:**

1. Button shows loading state: "INVITING..."
2. Customer status updates to: `"in_progress"`
3. Success toast: `"Started working on {name}'s selections!"`
4. Auto-navigates to: `/stylist-workspace/{customerId}`

---

### Step 4: Stylist Workspace
**Screen:** `/stylist-workspace/:customerId`

**Three-Panel Layout:**

**LEFT PANEL: Customer Intake**
- Scrollable view
- Shows all customer data
- Photos visible
- Quick reference while styling

**CENTER PANEL: Product Selections**
- 7 product slots (must fill all 7)
- Add products by:
  - Manual entry (URL, name, price, image)
  - Search results from right panel
- Add styling notes for each item
- Auto-saves as draft
- Preview button
- Send button

**RIGHT PANEL: GPT Search**
- AI-powered product search
- Uses custom GPT instructions
- Learns Lissy's styling patterns
- Search based on customer intake
- Filters by budget, style, etc.

---

### Step 5: Create 7 Selections
**Stylist's Process:**

1. **Review customer intake** (left panel)
   - Read style preferences
   - View uploaded photos
   - Note budget and sizes
   - Check special requests

2. **Search for products** (right panel)
   - Use AI search: "Modern leather jacket for Sarah"
   - Filter by price range
   - Consider customer's style

3. **Add products** (center panel)
   - Slot 1: Leather Jacket
   - Slot 2: White Button-Up Shirt
   - Slot 3: High-Rise Jeans
   - Slot 4: Ankle Boots
   - Slot 5: Structured Bag
   - Slot 6: Gold Jewelry Set
   - Slot 7: Cashmere Scarf

4. **Add styling notes for each:**
   - "Pair with the high-rise jeans for a polished casual look"
   - "Tuck into trousers for evening sophistication"
   - etc.

5. **Save draft**
   - Auto-saves progress
   - Can return later

---

### Step 6: Send to Customer
**Final Steps:**

1. **Preview Email**
   - Click preview button
   - Check product grid layout
   - Verify all links work
   - Review styling notes

2. **Send Email**
   - Click "SEND TO CUSTOMER"
   - Triggers SendGrid email
   - Customer receives beautiful email with:
     - Lissy's profile photo
     - Personal greeting
     - 7 product selections (images + links)
     - Styling notes for each product
     - Overall styling guidance

3. **Status Updates**
   - Customer status: `"completed"`
   - Timestamp recorded
   - Message detail shows: "EDIT COMPLETED ✓"

---

## 📧 EMAIL STRUCTURE (What Customer Receives)

**Subject:** Your SEVN SELECTS from Lissy Roddy

**Header:**
- SEVN SELECTS logo
- Lissy's profile photo
- Personal greeting: "Hi {Customer Name},"

**Intro:**
- Custom message from Lissy
- Overall styling guidance

**Product Grid:**
- Large featured image (first product)
- 3 rows × 2 columns (remaining 6 products)
- Each product shows:
  - Product image
  - Product name
  - Price
  - "SHOP NOW" link
  - Styling note

**Footer:**
- "GET ANOTHER EDIT" button
- Contact information
- Social links

---

## 🔄 Status Lifecycle

```
NEW
  ↓ (customer signs up)
INVITED
  ↓ (customer completes intake)
INVITED
  ↓ (stylist clicks "INVITE")
IN_PROGRESS
  ↓ (stylist creates selections)
IN_PROGRESS
  ↓ (stylist sends email)
COMPLETED
```

---

## 💾 Data Storage Structure

### Customer Record (Supabase KV Store)
```javascript
{
  id: "user-uuid",
  name: "Sarah Johnson",
  email: "sarah@email.com",
  phone: "+1234567890",
  role: "customer",
  stylist_id: "lissy",
  status: "invited", // or "in_progress", "completed"
  
  // Intake data
  main_image_url: "https://supabase.co/storage/...",
  reference_images: [
    "https://supabase.co/storage/...",
    "https://supabase.co/storage/...",
  ],
  
  intake_answers: {
    style_preferences: "Modern, minimal, elevated basics",
    favorite_brands: "COS, Toteme, The Row",
    budget_range: "£100-300 per item",
    sizes: {
      tops: "UK 10",
      bottoms: "UK 10",
      shoes: "UK 6"
    },
    occasions: "Work, Weekend, Evening",
    style_goals: "Build a capsule wardrobe",
    color_preferences: "Neutrals, earth tones",
    body_type: "Hourglass",
    fit_preferences: "Tailored but comfortable",
    areas_to_highlight: "Waist, shoulders",
    areas_to_avoid: "Too boxy fits",
    additional_notes: "Prefer natural fabrics"
  },
  
  has_intake: true,
  intake_submitted_at: "2026-01-28T10:30:00Z",
  started_at: "2026-01-28T11:00:00Z",
  completed_at: "2026-01-28T14:00:00Z",
  created_at: "2026-01-27T09:00:00Z",
  updated_at: "2026-01-28T14:00:00Z"
}
```

### Selection Record (Supabase KV Store)
```javascript
{
  id: "selection-uuid",
  customer_id: "user-uuid",
  stylist_id: "lissy",
  
  selections: [
    {
      slot: 1,
      product_name: "Leather Biker Jacket",
      product_url: "https://...",
      price: "£295",
      image_url: "https://...",
      styling_note: "The perfect investment piece. Pair with the high-rise jeans for effortless edge."
    },
    // ... 6 more products
  ],
  
  status: "sent",
  created_at: "2026-01-28T11:00:00Z",
  sent_at: "2026-01-28T14:00:00Z"
}
```

---

## 🎨 Design Consistency

### Signature Elements Used Throughout:

**Triple Border Card:**
- Customer photos
- Lookbook displays
- Featured content
- Spacing: 3px between borders
- Colors: `#1e1709` or `#000000`

**Typography:**
- UPPERCASE for headings and labels
- Letter spacing: 1-4px
- Helvetica Neue family
- Line height: 1.3-1.5

**Buttons:**
- Height: 52px
- Background: `#1E1709`
- Hover: `#2a2010`
- Text: White, uppercase, bold
- Border radius: 8px

**Color Palette:**
- Cream: `#fffefd`
- Dark: `#1e1709`
- White: `#ffffff`
- Borders: Black or dark brown

---

## 🔐 Authentication Flow

### Customer Auth:
1. Sign up → Supabase Auth creates user
2. Email auto-confirmed (no verification needed)
3. Access token stored in localStorage
4. Token sent with all API requests
5. Sign out → Clear localStorage

### Protected Routes:
- `/home` - Requires auth
- `/lissy/intake` - Requires auth
- `/lissy/waitlist` - Requires auth
- `/profile` - Requires auth

---

## 🌐 API Endpoints

### Auth Routes:
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Sign in
- `POST /auth/signout` - Sign out

### Customer Routes:
- `GET /customers/list` - All customers
- `GET /customers/:customerId` - Single customer
- `GET /customers/by-stylist/:stylistId` - Stylist's customers
- `GET /customers/check-intake/:userId` - Check intake status
- `POST /customers/submit-intake` - Submit intake form
- `POST /customers/update-status` - Update customer status

### Selection Routes:
- `POST /selections/save` - Save draft selections
- `GET /selections/:customerId` - Get customer's selections
- `POST /selections/send` - Send selections via email

### Upload Routes:
- `POST /upload-image` - Upload to Supabase Storage

### Search Routes:
- `POST /personalized-search/search` - AI-powered product search

---

## ✅ Complete Feature List

### Customer Features:
- ✅ Sign up / Sign in
- ✅ 6-step intake form
- ✅ Image uploads (main + reference)
- ✅ Waitlist confirmation
- ✅ Profile management
- ✅ Receive styled selections via email

### Stylist Features:
- ✅ Messages list (customer queue)
- ✅ Message detail (intake review)
- ✅ INVITE button (start styling)
- ✅ Stylist workspace (3 panels)
- ✅ AI product search (GPT-powered)
- ✅ 7 product selection slots
- ✅ Styling notes per product
- ✅ Draft auto-save
- ✅ Email preview
- ✅ Send via SendGrid
- ✅ Status management

### Admin Features:
- ✅ Customer dashboard
- ✅ Filter by status
- ✅ Search customers
- ✅ View analytics

---

## 🎯 Key User Interactions

### Customer Side:
1. Sign up → 2 minutes
2. Complete intake → 10 minutes
3. Join waitlist → Instant
4. Receive email → When stylist sends
5. Shop products → Click links in email

### Stylist Side:
1. Check messages → Daily
2. Review intake → 5 minutes
3. Click INVITE → Instant
4. Create selections → 20-30 minutes
5. Send to customer → Instant

**Total time from intake to delivery: ~30 minutes of active styling**

---

This is your complete system! Every screen, every button, every interaction documented. 🎨✨

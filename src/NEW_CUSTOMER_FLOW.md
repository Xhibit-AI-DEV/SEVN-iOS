# NEW CUSTOMER FLOW - Supabase-Based System

## 🎯 Complete Flow Architecture

### **Customer Journey:**
1. **Visit /lissy** → Landing page
2. **Click "Get Started"** → Redirects to `/signin`
3. **Sign Up** → Create account with email/password
4. **Auto-redirect to /lissy/intake** → Fill out intake form
5. **Upload main image + reference photos**
6. **Answer intake questions**
7. **Submit** → Saves to Supabase with `status: "invited"`
8. **Redirect to /lissy/waitlist** → Confirmation page

### **Stylist Journey:**
1. **Open Messages/Inbox** → See list of customers
2. **See "Invited" customers** → Customers who completed intake
3. **Click customer** → View their intake + curate products
4. **Save selections** → Auto-saves to Supabase
5. **Send email** → Delivers 7 selects via SendGrid

---

## 📁 New Backend Structure

### **Auth Endpoints** (`/auth/*`)
- `POST /auth/signup` - Create new customer account
- `POST /auth/signin` - Sign in existing customer
- `POST /auth/signout` - Sign out
- `GET /auth/me` - Get current user info

### **Customer Endpoints** (`/customers/*`)
- `GET /customers/list` - Get all customers (for stylist dashboard)
- `GET /customers/get/:userId` - Get specific customer
- `GET /customers/check-intake/:userId` - Check if intake completed
- `POST /customers/submit-intake` - Submit intake form
- `GET /customers/by-stylist/:stylistId` - Get customers for specific stylist
- `POST /customers/update-status` - Update customer status

---

## 💾 Data Storage (Supabase KV)

### **Customer Record Structure:**
```json
{
  "id": "user-uuid-from-auth",
  "email": "customer@example.com",
  "name": "Customer Name",
  "role": "customer",
  "status": "invited", // new -> invited -> in_progress -> completed
  "stylist_id": "lissy",
  "main_image_url": "https://...",
  "reference_images": ["https://...", "https://..."],
  "intake_answers": {
    "style": "Modern minimalist",
    "occasion": "Work",
    "budget": "$200-500",
    "colors": "Black, white, gray",
    ...
  },
  "has_intake": true,
  "created_at": "2026-01-28T12:00:00Z",
  "intake_submitted_at": "2026-01-28T12:30:00Z",
  "updated_at": "2026-01-28T12:30:00Z"
}
```

### **Key Format:**
```
customer:{userId}
```

---

## 🔐 Authentication Flow

### **Sign Up:**
1. Customer enters email, password, name
2. Backend creates Supabase Auth user
3. Backend creates customer record in KV store
4. Returns access token
5. Frontend stores token in localStorage
6. Redirects to intake form

### **Sign In:**
1. Customer enters email, password
2. Backend verifies with Supabase Auth
3. Returns access token + user info
4. Frontend stores token in localStorage
5. Checks if intake completed:
   - **If yes:** Redirect to `/lissy/waitlist` (confirmation page)
   - **If no:** Redirect to `/lissy/intake` (first-time)

### **Token Storage (Frontend):**
```javascript
localStorage.setItem('auth_token', access_token);
localStorage.setItem('user_email', email);
localStorage.setItem('user_name', name);
localStorage.setItem('user_id', user_id);
```

---

## 📝 Intake Form Integration

### **What Changes:**
1. **LissyLanding** → Add "Get Started" button that goes to `/signin`
2. **IntakeForm** → Must require auth token, gets user from localStorage
3. **Submit intake** → Calls `/customers/submit-intake` with auth token
4. **Saves:**
   - Main image URL
   - Reference images (array)
   - Intake answers (object)
   - Links to stylist (stylist_id: "lissy")
   - Sets status to "invited"

---

## 👀 Stylist Dashboard Changes

### **Messages/Inbox:**
```javascript
// Fetch customers for Lissy
GET /customers/by-stylist/lissy

// Returns array of customers:
[
  {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    status: "invited", // Show "Invited" badge
    main_image_url: "https://...",
    intake_submitted_at: "2026-01-28T12:30:00Z"
  }
]
```

### **Status Display:**
- `"invited"` → Show **"Invited"** badge (green/highlighted)
- `"in_progress"` → Stylist is working on selections
- `"completed"` → Email sent, selections delivered

---

## 🔄 Status Workflow

```
new (just signed up)
    ↓
invited (completed intake) ← SHOWS IN MESSAGES
    ↓
in_progress (stylist curating)
    ↓
completed (email sent)
```

---

## ✅ What's Built

### **Frontend Components:**
- ✅ `/components/SignIn.tsx` - Sign in/sign up form
- ✅ Route added: `/signin`

### **Backend Endpoints:**
- ✅ `/supabase/functions/server/auth.tsx` - Auth routes
- ✅ `/supabase/functions/server/customers.tsx` - Customer management
- ✅ Mounted in main server file

### **Auth Integration:**
- ✅ Supabase Auth for user management
- ✅ KV store for customer data
- ✅ Token-based authentication
- ✅ Auto-confirm emails (no email server needed)

---

## 🚧 What Needs to Be Done

### **1. Update LissyLanding:**
- Add "Get Started" button
- Redirect to `/signin` instead of directly to intake

### **2. Update IntakeForm:**
- Check if user is signed in (check localStorage for auth_token)
- Get user info from localStorage
- Call `/customers/submit-intake` with auth token
- Pass intake data (images, answers, stylist_id)

### **3. Update Messages/Inbox:**
- Fetch customers from `/customers/by-stylist/lissy`
- Display "Invited" badge for invited customers
- Click to view customer details

### **4. Update Image Upload:**
- Store images in Supabase Storage
- Return public URLs to save in customer record

---

## 🎨 UI Flow Example

### **Sign In Page:**
```
┌─────────────────────┐
│       SEVN          │
│  Welcome back       │
├─────────────────────┤
│                     │
│ Email: [_________]  │
│ Password: [_____]   │
│                     │
│ [   Sign In   ]     │
│                     │
│ Don't have account? │
│    Sign Up          │
└─────────────────────┘
```

### **Messages (Stylist View):**
```
┌─────────────────────┐
│   MESSAGES          │
├─────────────────────┤
│ 📩 John Doe         │
│    john@example.com │
│    [INVITED] ←←←    │ ← Shows this badge
│    2 hours ago      │
├─────────────────────┤
│ 📩 Jane Smith       │
│    jane@example.com │
│    [IN PROGRESS]    │
│    1 day ago        │
└─────────────────────┘
```

---

## 🔧 Next Steps

1. **Update LissyLanding** - Add sign-in button
2. **Update IntakeForm** - Add auth + API call
3. **Update Messages** - Show invited customers
4. **Test complete flow**:
   - Sign up → Intake → Appears in stylist messages

Ready to continue? Let me know which component to update first!

# SEVN SELECTS - Order-Based Flow Specification

**Updated:** January 28, 2026  
**Status:** Implementation Complete

---

## 🎯 System Architecture

### Key Changes from Previous System

**OLD SYSTEM:**
- Customer → Status (invited, in_progress, completed)
- No payment
- No order tracking
- One styling per customer

**NEW SYSTEM:**
- Customer → Multiple Orders → Each with status lifecycle
- Payment required ($100 USD)
- Order-based tracking
- Multiple stylings per customer
- Notifications at each step

---

## 📊 Data Model

### Order Structure

```javascript
{
  // Order ID
  id: "order_1706401234567_abc123",
  
  // Customer Info
  customer_id: "user-uuid",
  customer_name: "Sarah Johnson",
  customer_email: "sarah@email.com",
  
  // Stylist
  stylist_id: "lissy",
  
  // Status Lifecycle
  status: "waitlist" | "invited" | "paid" | "styling" | "completed" | "cancelled",
  
  // Intake Data
  main_image_url: "https://...",
  reference_images: ["https://...", "https://..."],
  intake_answers: {
    q1: "Everyday wear and work events",
    q2: "Modern and elevated minimal",
    q3: "The Row, Toteme, COS",
    q4: "Avoid anything too trendy",
    q5: "Need outfits by next month",
    q6: "UK 10, prefer relaxed fits",
    q7: "£100-300 per item",
    q8: "Prefer natural fabrics"
  },
  
  // Payment Info
  payment_status: "pending" | "completed" | "failed" | "refunded",
  payment_amount: 100,
  payment_currency: "USD",
  payment_completed_at: "2026-01-28T14:30:00Z",
  payment_transaction_id: "txn_abc123",
  
  // Styling Data
  selections: [
    {
      slot: 1,
      product_name: "Leather Jacket",
      product_url: "https://...",
      price: "£295",
      image_url: "https://...",
      styling_note: "Perfect investment piece..."
    },
    // ... 6 more items
  ],
  styling_notes: "Overall styling guidance from Lissy...",
  
  // Timestamps
  created_at: "2026-01-28T10:00:00Z",
  invited_at: "2026-01-28T12:00:00Z",
  paid_at: "2026-01-28T14:30:00Z",
  styling_started_at: "2026-01-28T15:00:00Z",
  completed_at: "2026-01-28T18:00:00Z",
  
  // Metadata
  platform: "web" | "ios" | "android",
  version: "1.0"
}
```

---

## 🔄 Complete Flow

### STEP 1: Client Submits Intake

**Client Action:**
- Navigates to `/lissy`
- Uploads their photo
- Completes 8 intake questions
- Uploads reference images (optional)
- Clicks "SUBMIT"

**System Behavior:**
```
POST /orders/create
Authorization: Bearer {userToken}

Request Body:
{
  "stylistId": "lissy",
  "mainImageUrl": "https://...",
  "referenceImages": ["https://...", "https://..."],
  "intakeAnswers": {
    "q1": "answer 1",
    "q2": "answer 2",
    ...
  }
}

Response:
{
  "success": true,
  "order_id": "order_1706401234567_abc123",
  "status": "waitlist",
  "message": "Order submitted! Your stylist will review your request soon."
}
```

**What Happens:**
1. Order created with status: `waitlist`
2. Indexed by customer ID
3. Indexed by stylist ID
4. ⏳ TODO: Push notification sent to stylist
5. ⏳ TODO: In-app notification created

**Client Sees:**
- Success toast: "Request submitted!"
- Navigated to waitlist page
- Order appears in their history

---

### STEP 2: Stylist Receives Notification

**Stylist's View:**
- 📱 Push notification: "New styling request from Sarah"
- 🔔 In-app notification badge
- 📧 Messages inbox shows new order with "+INVITE" indicator

**Stylist Opens Messages:**
```
GET /orders/stylist/lissy
Authorization: Bearer {publicAnonKey}

Response:
{
  "orders": [
    {
      "id": "order_...",
      "customer_name": "Sarah Johnson",
      "customer_email": "sarah@email.com",
      "main_image_url": "https://...",
      "status": "waitlist",
      "created_at": "2026-01-28T10:00:00Z"
    },
    ...
  ]
}
```

**Messages UI Shows:**
- Customer photo (60px circle)
- Customer name
- "+INVITE" black button (for status: waitlist)
- Time since submission

---

### STEP 3: Stylist Views Order Details

**Stylist Clicks Customer:**
```
GET /orders/{orderId}

Response:
{
  "order": {
    "id": "order_...",
    "customer_name": "Sarah Johnson",
    "main_image_url": "https://...",
    "reference_images": [...],
    "intake_answers": {...},
    "status": "waitlist",
    "created_at": "..."
  }
}
```

**Order Detail Screen Shows:**
- **Customer's main photo** (triple border card 286×368px)
- **Customer name** (UPPERCASE, 20px)
- **Status badge** ("STATUS: WAITLIST")
- **Lissy's profile** (162px circle, name badge)
- **Complete intake answers** (all 8 questions + answers)
- **Reference images** (2-column grid)
- **INVITE button** (black, 52px height, full width)

---

### STEP 4: Stylist Sends Invite

**Stylist Clicks "INVITE":**
```
POST /orders/{orderId}/invite

Response:
{
  "success": true,
  "order": {
    ...order data with status: "invited"...
  },
  "message": "Invite sent successfully"
}
```

**What Happens:**
1. Order status: `waitlist` → `invited`
2. `invited_at` timestamp recorded
3. ⏳ TODO: Push notification sent to client
4. ⏳ TODO: In-app notification created
5. ⏳ TODO: Payment modal triggered on client's app

**Stylist Sees:**
- Success toast: "Invite sent to Sarah!"
- Button changes to disabled state or "INVITED" badge
- Order moved to "invited" section

**Client Receives:**
- 📱 Push notification: "Lissy is ready to style you!"
- 🔔 In-app notification
- 💳 Payment modal appears automatically

---

### STEP 5: Client Completes Payment

**Client's Payment Modal:**
- Appears over home screen
- Shows: Order details, Lissy's photo, $100 USD
- Options: Apple Pay, Credit Card
- "PAY NOW" button

**On Payment Success:**
```
POST /orders/{orderId}/payment

Request:
{
  "transaction_id": "txn_abc123",
  "amount": 100,
  "currency": "USD"
}

Response:
{
  "success": true,
  "order": {
    ...order data with status: "paid"...
  },
  "message": "Payment completed successfully"
}
```

**What Happens:**
1. Order status: `invited` → `paid`
2. `paid_at` timestamp recorded
3. Payment info saved to order
4. ⏳ TODO: Push notification sent to stylist
5. ⏳ TODO: In-app notification created
6. ⏳ TODO: Receipt emailed to client

**Client Sees:**
- ✅ Payment confirmation
- Order status: "PAID - Being styled"
- Estimated completion time

**Stylist Receives:**
- 📱 Push notification: "Sarah paid! Ready to style"
- 🔔 In-app notification
- Order moved to "READY TO STYLE" section with badge

---

### STEP 6: Stylist Styles Customer

**Stylist Opens Order:**
```
POST /orders/{orderId}/start-styling

Response:
{
  "success": true,
  "order": {
    ...order data with status: "styling"...
  }
}
```

**What Happens:**
1. Order status: `paid` → `styling`
2. `styling_started_at` timestamp recorded
3. Stylist workspace opens with order data

**Stylist Workspace:**
- **Left Panel:** Customer intake + photos
- **Center Panel:** 7 product slots
- **Right Panel:** AI search

**Stylist Creates Selections:**
1. Searches for products using AI
2. Adds 7 products to slots
3. Writes styling notes for each
4. Adds overall styling guidance
5. Saves draft (auto-saves)
6. Previews email
7. Clicks "SEND TO CUSTOMER"

---

### STEP 7: Stylist Completes Order

**Stylist Clicks "SEND":**
```
POST /orders/{orderId}/complete

Request:
{
  "selections": [
    {
      "slot": 1,
      "product_name": "Leather Jacket",
      "product_url": "https://...",
      "price": "£295",
      "image_url": "https://...",
      "styling_note": "Perfect investment piece..."
    },
    // ... 6 more
  ],
  "styling_notes": "Overall guidance from Lissy..."
}

Response:
{
  "success": true,
  "order": {
    ...order data with status: "completed"...
  },
  "message": "Styling completed successfully"
}
```

**What Happens:**
1. Order status: `styling` → `completed`
2. `completed_at` timestamp recorded
3. Selections saved to order
4. ⏳ TODO: Email sent to client with selects
5. ⏳ TODO: Push notification sent to client
6. ⏳ TODO: In-app notification created

**Stylist Sees:**
- Success toast: "Selections sent to Sarah!"
- Order moved to "COMPLETED" section
- Order detail shows "EDIT COMPLETED ✓"

**Client Receives:**
- 📱 Push notification: "Your styling is ready!"
- 📧 Email with 7 selections + styling notes
- 🔔 In-app notification
- Order status: "COMPLETED"

---

## 🎯 Status Lifecycle

```
┌─────────────┐
│  WAITLIST   │ ← Order created (client submitted intake)
└──────┬──────┘
       │
       │ Stylist clicks INVITE
       ↓
┌─────────────┐
│   INVITED   │ ← Waiting for client to pay
└──────┬──────┘
       │
       │ Client completes payment
       ↓
┌─────────────┐
│    PAID     │ ← Ready for stylist to style
└──────┬──────┘
       │
       │ Stylist starts styling
       ↓
┌─────────────┐
│   STYLING   │ ← Stylist is working on selections
└──────┬──────┘
       │
       │ Stylist sends selections
       ↓
┌─────────────┐
│  COMPLETED  │ ← Selections delivered to client
└─────────────┘
```

**Additional Status:**
- `cancelled` - Order cancelled by client or stylist

---

## 🔔 Notifications System

### Notification Types

**1. Push Notifications**
- Delivered via Apple/Google push services
- Shows on lock screen
- Plays sound/vibration
- Action: Opens app to relevant screen

**2. In-App Notifications**
- Badge on messages icon
- Notification list in app
- Action: Navigates to order/message

### Notification Events

| Event | Recipient | Push | In-App | Email |
|-------|-----------|------|--------|-------|
| Intake submitted | Stylist | ✅ | ✅ | — |
| Invite sent | Client | ✅ | ✅ | — |
| Payment completed | Stylist | ✅ | ✅ | ✅ (receipt) |
| Styling complete | Client | ✅ | ✅ | ✅ (selects) |

---

## 🎨 UI Components

### Messages List (Stylist View)

**For status: `waitlist`:**
```
┌────────────────────────────────────┐
│  👤 [Photo]  Sarah Johnson         │
│                            + INVITE │  ← Black button
└────────────────────────────────────┘
```

**For status: `invited`:**
```
┌────────────────────────────────────┐
│  👤 [Photo]  Sarah Johnson         │
│                   AWAITING PAYMENT │  ← Gray badge
└────────────────────────────────────┘
```

**For status: `paid`:**
```
┌────────────────────────────────────┐
│  👤 [Photo]  Sarah Johnson   READY │  ← White button with badge
└────────────────────────────────────┘
```

**For status: `styling`:**
```
┌────────────────────────────────────┐
│  👤 [Photo]  Sarah Johnson         │
│                   STYLING IN PROG…│  ← Blue badge
└────────────────────────────────────┘
```

**For status: `completed`:**
```
┌────────────────────────────────────┐
│  👤 [Photo]  Sarah Johnson      ✓  │  ← Green checkmark
└────────────────────────────────────┘
```

---

### Order Detail Screen (Stylist View)

**Components:**
1. **Header** - "SEVN SELECTS" (centered, 26px)
2. **Back button** - Top left
3. **Customer photo** - Triple border card (286×368px)
4. **Customer name** - UPPERCASE, 20px, centered
5. **Status badge** - "STATUS: WAITLIST" (or current status)
6. **Divider line** - 349px, 1px
7. **Lissy's profile** - 162px circle with name badge
8. **Intake section** - "STYLE INTAKE" header + Q&A
9. **Images section** - "UPLOADED IMAGES" + 2-col grid
10. **Action button** - Status-dependent (see below)

**Action Buttons by Status:**

**WAITLIST:**
```html
<button class="bg-[#1E1709] text-white">
  INVITE
</button>
```

**INVITED:**
```html
<div class="bg-[#1E1709]/20 text-[#1E1709]">
  AWAITING PAYMENT
</div>
```

**PAID:**
```html
<button class="bg-[#1E1709] text-white">
  START STYLING
</button>
```

**STYLING:**
```html
<button class="bg-[#1E1709] text-white">
  CONTINUE STYLING
</button>
```

**COMPLETED:**
```html
<div class="bg-[#1E1709]/20 text-[#1E1709]">
  EDIT COMPLETED ✓
</div>
```

---

## 💳 Payment Integration

### Apple In-App Purchase (iOS)

**Setup Required:**
1. Create In-App Purchase product in App Store Connect
2. Product ID: `com.sevnselects.styling.standard`
3. Price: $99.99 USD
4. Type: Consumable

**Implementation:**
```javascript
// When invite received, show payment modal
import * as InAppPurchases from 'expo-in-app-purchases';

// Initialize
await InAppPurchases.connectAsync();

// Get product
const { results } = await InAppPurchases.getProductsAsync([
  'com.sevnselects.styling.standard'
]);

// Purchase
const purchase = await InAppPurchases.purchaseItemAsync(
  'com.sevnselects.styling.standard'
);

// Verify and complete
if (purchase.acknowledged) {
  // Send to backend
  await completeOrderPayment(orderId, purchase.transactionId);
  
  // Finish transaction
  await InAppPurchases.finishTransactionAsync(purchase, true);
}
```

### Web Payment (Stripe)

**For web testing:**
```javascript
// Use Stripe Checkout
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'SEVN SELECTS Styling Service',
        description: 'Personalized styling by Lissy Roddy',
      },
      unit_amount: 10000, // $100 in cents
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${YOUR_DOMAIN}/payment-success?order_id={orderId}`,
  cancel_url: `${YOUR_DOMAIN}/payment-cancelled`,
  metadata: {
    order_id: orderId,
  },
});
```

---

## 🔐 User Roles & Permissions

### Stylist (Whitelisted Users)

**How to Whitelist:**
```javascript
// In user record
{
  id: "user-uuid",
  email: "lissy@sevnselects.com",
  role: "stylist",
  stylist_id: "lissy",
  permissions: [
    "view_orders",
    "invite_clients",
    "create_selections",
    "send_notifications"
  ]
}
```

**Stylist Can:**
- ✅ View all orders assigned to them
- ✅ View customer intake and images
- ✅ Send invites
- ✅ Access styling workspace
- ✅ Create and send selections
- ✅ View order history

**Stylist Cannot:**
- ❌ View other stylists' orders (unless admin)
- ❌ Process refunds (admin only)
- ❌ Delete orders (admin only)

### Client (Regular Users)

**Client Can:**
- ✅ Submit intake
- ✅ View their order history
- ✅ Complete payment
- ✅ View their selections
- ✅ Reorder/request new styling

**Client Cannot:**
- ❌ View other users' orders
- ❌ Access admin/stylist interface
- ❌ Send invites
- ❌ Create selections

---

## 🚀 API Endpoints

### Orders

```
POST   /orders/create              - Create new order (client submits intake)
GET    /orders/:orderId             - Get order details
GET    /orders/stylist/:stylistId   - Get all orders for a stylist
GET    /orders/customer/:customerId - Get all orders for a customer

POST   /orders/:orderId/invite      - Stylist sends invite (waitlist → invited)
POST   /orders/:orderId/payment     - Client completes payment (invited → paid)
POST   /orders/:orderId/start-styling - Stylist starts styling (paid → styling)
POST   /orders/:orderId/complete    - Stylist completes order (styling → completed)
POST   /orders/:orderId/status      - Admin: Update status directly
```

### Notifications (TODO)

```
GET    /notifications/list          - Get user's notifications
POST   /notifications/mark-read     - Mark notification as read
POST   /notifications/send-push     - Send push notification
```

---

## ✅ Implementation Checklist

### Backend
- ✅ Order data structure created
- ✅ Order CRUD endpoints
- ✅ Status lifecycle management
- ✅ Customer/stylist indexing
- ✅ Invite flow
- ⏳ Payment integration
- ⏳ Push notifications
- ⏳ Email notifications

### Frontend (Client)
- ✅ Intake form creates orders
- ⏳ Payment modal
- ⏳ Order history view
- ⏳ Notification bell
- ⏳ In-app notifications

### Frontend (Stylist)
- ⏳ Messages list with "+INVITE"
- ⏳ Order detail screen
- ⏳ Status-based UI
- ⏳ Styling workspace integration
- ⏳ Notification bell

### Infrastructure
- ⏳ Apple IAP setup
- ⏳ Push notification service
- ⏳ Webhook handlers
- ⏳ Email templates

---

This is the complete specification for the new order-based flow! 🎨✨

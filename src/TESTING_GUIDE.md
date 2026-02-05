# Order & Payment Flow Testing Guide

## Overview
You now have a complete order-based messaging and payment system with role-based authentication. Here's how to test it with two different user accounts.

## User Accounts

### Stylist Account (Admin)
- **Email**: `Lissy@sevn.app`
- **Password**: `Password123`
- **Role**: Stylist (whitelisted)
- **Username**: `lissy_roddy` (must be set in profile)
- **Access**: Can view all orders assigned to them, send invites, and manage styling workflow

### Customer Account (Client)
- **Email**: Any other email (e.g., `testcustomer@example.com`)
- **Role**: Customer
- **Access**: Can submit styling requests, pay for services, and track order status

## Testing Flow

### Step 1: Create Customer Account
1. Sign out if you're currently signed in
2. Go to `/signin`
3. Create an account with any email (NOT Lissy@sevn.app)
4. Password must be at least 6 characters
5. This will be your **customer** account

### Step 2: Submit a Styling Request (as Customer)
1. Navigate to `/lissy`
2. Upload a style reference image
3. Complete the 8-question intake form
4. Submit the form
5. You'll be redirected to `/order/{orderId}` to view your request
6. **Status**: WAITLIST (waiting for stylist to review)

### Step 3: Review Request (as Stylist)
1. Sign out from customer account
2. Sign in with `Lissy@sevn.app` (password: `Password123`)
3. Navigate to `/messages`
4. You should see the customer's request in the "New Requests" section
5. Click on the order to view details
6. Click "+ INVITE" button to send invitation to customer
7. **Status changes**: WAITLIST → INVITED

### Step 4: Mock Payment (as Customer)
1. Sign out from stylist account
2. Sign back in with your customer account
3. Navigate to `/order/{orderId}` (you can find orderId from URL or `/home`)
4. You should see:
   - Status: "Invitation Received!"
   - A blue payment button showing "PAY $100 (MOCK)"
5. Click the "PAY $100 (MOCK)" button
6. **Status changes**: INVITED → PAID
7. A success toast appears: "Payment successful! Your stylist will start styling soon."

### Step 5: View Paid Order (as Stylist)
1. Sign out from customer account
2. Sign back in with `Lissy@sevn.app`
3. Navigate to `/messages`
4. The order should now appear in "Ready to Style" section
5. **Status**: PAID (ready for stylist to start styling)

## Order Status Lifecycle

```
WAITLIST → Customer submitted intake
    ↓ (Stylist sends invite)
INVITED → Customer needs to pay
    ↓ (Customer completes payment)
PAID → Stylist needs to start styling
    ↓ (Stylist starts work)
STYLING → Stylist is curating selections
    ↓ (Stylist delivers selections)
COMPLETED → Selections delivered to customer
```

## Key Features Implemented

### ✅ Role-Based Authentication
- Stylist whitelist in `/supabase/functions/server/auth.tsx`
- Auto-detection of user role based on email
- Role stored in localStorage and session

### ✅ Order Management
- Complete CRUD operations for orders
- Status transitions with timestamps
- Indexed by both customer and stylist for fast retrieval

### ✅ Mock Payment Flow
- Simple one-click payment for testing
- Updates order status and timestamps
- No actual payment processing (mock only)

### ✅ Dynamic Routing
- Stylist view: `/messages` and `/message-detail/:orderId`
- Customer view: `/order/:orderId`
- Automatic email-based stylist ID generation

## Backend Endpoints

### Order Endpoints
- `POST /orders/create` - Create new order (customer)
- `GET /orders/stylist/:stylistId` - Get all orders for stylist
- `GET /orders/:orderId` - Get specific order
- `POST /orders/:orderId/invite` - Send invite (stylist)
- `POST /orders/:orderId/payment` - Process payment (customer)
- `POST /orders/:orderId/start-styling` - Start styling (stylist)
- `POST /orders/:orderId/complete` - Mark complete (stylist)

### Auth Endpoints
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Sign in
- `GET /auth/me` - Get current user
- `POST /auth/signout` - Sign out

## Next Steps (Future Enhancements)

1. **Real Payment Integration**
   - Replace mock payment with Stripe
   - Handle webhooks for payment confirmation
   - Add payment method storage

2. **Real-time Notifications**
   - Add push notifications when order status changes
   - Email notifications for invites and payment receipts
   - In-app notification center

3. **Actual Messaging/Chat**
   - Add text messaging between customer and stylist
   - Image sharing in conversations
   - Typing indicators and read receipts

4. **Selections Delivery**
   - UI for stylist to curate product selections
   - Customer view of delivered selections
   - Like/dislike feedback on selections

5. **Multi-stylist Support**
   - Allow customers to choose their stylist
   - Stylist profiles and portfolios
   - Availability management

## Troubleshooting

### Orders Not Showing Up
- Check that stylist ID matches email prefix (e.g., `dovheichemer@gmail.com` → `dovheichemer`)
- Verify order was created successfully in console logs
- Check localStorage for `user_email` value

### Payment Button Not Working
- Ensure order status is "invited"
- Check browser console for error messages
- Verify orderId in URL is correct

### Sign In Issues
- Password must be at least 6 characters
- Check if account already exists (will auto-switch to sign-in mode)
- Clear localStorage and try again if needed

## Testing Checklist

- [ ] Create customer account
- [ ] Submit intake form with image upload
- [ ] View order as customer (waitlist status)
- [ ] Create/sign in to stylist account (dovheichemer@gmail.com)
- [ ] View order in stylist messages
- [ ] Send invite to customer
- [ ] Sign back in as customer
- [ ] Complete mock payment
- [ ] Verify order appears in "Ready to Style" for stylist

Happy testing! 🎉
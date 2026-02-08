# Unified App with Role-Based Routing

## Overview
The app has been merged from two separate codebases (admin + customer) into ONE unified app with role-based routing.

## Bundle ID
- **Bundle ID**: `com.xhibits`
- **App Name**: SEVN

## User Roles

### Customer Role (`role="customer"`)
Customers can access:
- ✅ Home page with featured stylists and edits
- ✅ Stylist browsing
- ✅ Messages/inbox
- ✅ Profile & settings
- ✅ Intake forms (Lissy, Chris, or universal by username)
- ✅ Waitlist pages
- ✅ Order views
- ✅ Edit/post viewing

### Admin/Stylist Role (`role="admin"` or `role="stylist"`)
Admins and stylists can access everything customers can, PLUS:
- ✅ Admin dashboard (`/admin`, `/admin-dashboard`)
- ✅ Customer inbox (`/customer-inbox`)
- ✅ Customer list and management
- ✅ Blocked accounts management
- ✅ Debug tools (`/debug-orders`)

### Universal Access (All authenticated users)
- ✅ Create/edit posts (`/create-edit`) - ANYONE can upload and create edits
- ✅ View edits/posts (`/edit/:editId`, `/rory-selects/:editId`)

## Key Routes

### Public (No Auth Required)
- `/signin` - Sign in / sign up
- `/password-reset` - Password reset
- `/lissy` - Lissy intake landing page
- `/debug`, `/debug-auth`, `/simple-debug` - Debug tools

### Protected (Auth Required)
- `/home` - Home page
- `/profile` - User profile
- `/messages` - Customer messages
- `/stylists` - Browse stylists
- `/order/:orderId` - View order details
- `/edit/:editId` - View edit/post

### Admin Only (Requires admin/stylist role)
- `/admin` - Admin dashboard
- `/customer-inbox` - Stylist workspace
- `/blocked-accounts` - Manage blocked accounts
- `/debug-orders` - Debug orders

### Universal (All authenticated users can create)
- `/create-edit` - Create new edit/post (ANYONE can create)
- `/create-edit/:editId` - Edit existing post

## How Role-Based Routing Works

```tsx
// ProtectedRoute - Requires ANY authenticated user
<Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

// AdminRoute - Requires admin or stylist role
<Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
```

## Authentication Flow
1. User signs in via `/signin`
2. Server returns `access_token` and `role` (customer, admin, or stylist)
3. Role is stored in `localStorage.getItem('user_role')`
4. App checks role on mount and shows appropriate UI
5. Protected routes check authentication
6. Admin routes check both authentication AND role

## Files Changed
- ✅ `CustomerApp.tsx` - Merged all routes with role-based access
- ✅ `SignIn.tsx` - Fixed iOS safe-area and zoom issues
- ✅ `capacitor.config.ts` - Updated bundle ID to `com.sevn.app`
- ✅ `App.tsx` - Deprecated (kept for backward compatibility)
- ❌ `admin.html` - Deleted

## iOS Build Instructions

```bash
# 1. Clean old iOS folder
rm -rf ios/

# 2. Build the app
npm run build

# 3. Add iOS platform
npx cap add ios

# 4. Open in Xcode
npx cap open ios

# 5. In Xcode, verify:
# - Bundle ID: com.xhibits
# - App Name: SEVN

# 6. Clean & Run
# Product → Clean Build Folder (Cmd+Shift+K)
# Product → Run (Cmd+R)
```

## Testing Different Roles

### Test as Customer
1. Sign up/in with a new account
2. Server automatically assigns `role="customer"`
3. You'll see customer UI only

### Test as Admin/Stylist
1. Manually update user role in Supabase database
2. Set `role="admin"` or `role="stylist"`
3. Sign in again
4. You'll see admin features

## Next Steps
- [ ] Test iOS build with correct bundle ID
- [ ] Test sign in flow works on iOS
- [ ] Test customer features (intake, messages, profile)
- [ ] Test admin features (dashboard, customer inbox, create edit)
- [ ] Verify safe-area padding works correctly
- [ ] Verify no zoom on input fields
# User ID System Documentation

## Three-Tier User Identification System

Our system uses THREE distinct identifiers for users. **It's critical to keep these separate!**

---

## 1. Internal ID (Supabase Auth UUID)

**Field name:** `auth_user_id` (in profiles table)  
**Example:** `"abc-123-def-456-789"` (UUID)  
**Stored in:** Supabase Auth, profile backend, order records  

### Characteristics:
- ❌ **NEVER editable** - Changes would break all associations
- ✅ **Invisible to users** - Only used internally
- ✅ **Used for authentication** - Verified from access tokens
- ✅ **Used for database keys** - `customer_orders:${auth_user_id}`

### Where it's used:
```javascript
// Order creation
order.customer_id = user.id  // This is the Supabase UUID

// Customer indexes
const key = `customer_orders:${user.id}`

// Profile lookup
const profileKey = `profile:${user.id}`

// Authentication
const { data: { user } } = await supabase.auth.getUser(accessToken);
// user.id is the auth_user_id
```

---

## 2. Username/Handle (Public Identifier)

**Field name:** `user_id` (confusing legacy naming, but it means username)  
**Alternative field:** `username` (some older code)  
**Example:** `"collin"`, `"lissy"`, `"alex"`  
**Displayed as:** Profile handle, used in URLs  

### Characteristics:
- ✅ **Editable** - Users can change this anytime
- ✅ **Public-facing** - Shown in URLs and profile
- ✅ **Must be unique** - System validates no duplicates
- ✅ **Lowercase, no spaces** - Auto-sanitized on save

### Where it's used:
```javascript
// Profile URLs
navigate(`/u/${profile.user_id}`)

// Edit Profile Modal
<input value={username} />

// Backend validation
const allProfiles = await kv.getByPrefix('profile:');
const duplicate = allProfiles.find(p => p.user_id === newUsername);
```

### Important Note:
**Backend stores this as `user_id` field (legacy naming).** When editing profiles, we send `user_id` in the API body, but the UI calls it "Username" for clarity.

---

## 3. Display Name (Friendly Name)

**Field name:** `display_name` or `name`  
**Example:** `"Collin Smith"`, `"Lissy"`, `"Alex Johnson"`  
**Displayed as:** Profile name, shown in UI  

### Characteristics:
- ✅ **Freely editable** - No restrictions
- ✅ **Not unique** - Multiple users can have the same display name
- ✅ **Can include spaces** - Any format allowed
- ✅ **Optional** - Can be empty

### Where it's used:
```javascript
// Profile display
<h1>{profile.display_name}</h1>

// Edit Profile Modal
<input 
  label="Display Name"
  value={displayName} 
  placeholder="e.g., Collin Smith"
/>
```

---

## Common Issues & Solutions

### ❌ Problem: "Orders not showing up"
**Cause:** Using username instead of auth_user_id for lookups  
**Fix:** Always use the Supabase auth UUID (`user.id` from access token) for database operations

### ❌ Problem: "Changed username, now nothing works"
**Cause:** Code incorrectly using username as primary identifier  
**Fix:** Ensure all database keys use `auth_user_id`, not `username`

### ❌ Problem: "Can't change username"
**Cause:** Trying to edit the `auth_user_id` instead of `user_id`  
**Fix:** Only edit the `user_id` field (which is the username), never the `auth_user_id`

---

## Backend API Reference

### Profile Update (PUT /profiles/:userId)

```typescript
// ✅ CORRECT - userId param is the auth UUID
PUT /profiles/abc-123-def-456

Body:
{
  display_name: "Collin Smith",  // Display name (editable)
  user_id: "collin",              // Username/handle (editable, must be unique)
  bio: "...",
  website_url: "...",
  avatar_url: "..."
}

// Backend internally stores:
{
  auth_user_id: "abc-123-def-456",  // From URL param (immutable)
  user_id: "collin",                 // Username (editable)
  display_name: "Collin Smith",      // Display name (editable)
  ...
}
```

### Order Lookup (GET /orders/customer/me)

```typescript
// ✅ CORRECT - Backend uses auth token to get real UUID
GET /orders/customer/me
Authorization: Bearer <access_token>

// Backend extracts user.id from token:
const { data: { user } } = await supabase.auth.getUser(accessToken);
const key = `customer_orders:${user.id}`;  // Uses UUID, not username
```

---

## Testing Checklist

When making changes to user identification:

- [ ] Orders still load correctly in customer inbox?
- [ ] Orders still load correctly in stylist messages?
- [ ] Profile editing still works?
- [ ] Username changes don't break order associations?
- [ ] Authentication still works properly?
- [ ] Profile URLs work with new usernames?

---

## Future Improvements

To reduce confusion, we should:

1. **Rename backend field:** Change `user_id` → `username` in profile storage
2. **Add clarity:** Always use `auth_user_id` explicitly instead of just `user_id`
3. **Update docs:** Search codebase for "user_id" and clarify which one is meant

**For now:** System works correctly, but naming is confusing. Just remember:
- `auth_user_id` or `user.id` from Supabase = **Internal UUID** (immutable)
- `user_id` in profiles = **Username/handle** (editable, unique)
- `display_name` = **Display name** (editable, non-unique)

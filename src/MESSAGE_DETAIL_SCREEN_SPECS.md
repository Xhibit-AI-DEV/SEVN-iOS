# MESSAGE DETAIL SCREEN - Complete Specifications

**Screen:** Customer Intake Message Detail (Stylist View)  
**Route:** `/rory-selects/:customerId`  
**Purpose:** Shows stylist the full customer intake submission with images and all form answers, plus INVITE button

---

## 📐 Overall Layout

### Container
- Width: `393px` max
- Min-height: `100vh`
- Background: `#ffffff`
- Overflow X: `hidden`
- Padding bottom: `96px` (for bottom nav)

---

## 🎯 Header Section

### Sticky Header
- Position: `sticky top-0`
- Background: `#ffffff`
- Z-index: `10`
- Padding: `20px 16px 16px` (`pt-5 pb-4`)
- Border bottom: `1px solid rgba(0,0,0,0.7)`

### Back Button
- Position: `absolute left-16px`
- Size: `24px × 24px`
- Icon: `ArrowLeft` from lucide-react
- Color: `#1e1709`
- Stroke width: `1.5px`
- Action: Navigate back to messages list

### Page Title (centered)
- Font: `Helvetica Neue Regular`
- Size: `26px`
- Letter spacing: `3px`
- Text: `"SEVN SELECTS"`
- Transform: `UPPERCASE`
- Color: `#000000`
- Position: Centered in header

---

## 📸 Customer Image Section

### Triple Border Card (Signature Style)
**Card Stack Layout:**
- Total width: `286px`
- Total height: `368px`
- Border radius: `8px`
- Centered horizontally

**Back Card (offset most):**
- Position: `absolute top-8px left-8px`
- Size: `286px × 368px`
- Border: `1px solid #1e1709`
- Border radius: `8px`
- Background: `#ffffff`

**Middle Card (offset less):**
- Position: `absolute top-4px left-4px`
- Size: `286px × 368px`
- Border: `1px solid #1e1709`
- Border radius: `8px`
- Background: `#ffffff`

**Front Card (main image):**
- Position: `relative`
- Size: `286px × 368px`
- Border: `1px solid #000000`
- Border radius: `8px`
- Overflow: `hidden`

**Customer's Main Image:**
- Width: `100%`
- Height: `100%`
- Object fit: `cover`
- Source: `customer.main_image_url`
- Fallback: Gray background with "No image uploaded" text

### Customer Name
- Font: `Helvetica Neue Medium`
- Size: `20px`
- Letter spacing: `2px`
- Text: Customer's name from database
- Transform: `UPPERCASE`
- Color: `#1e1709`
- Text align: `center`
- Width: `361px`
- Margin top: `32px`

### Status Badge
- Font: `Helvetica Neue Regular`
- Size: `14px`
- Letter spacing: `1px`
- Text: `"STATUS: [INVITED/IN PROGRESS/COMPLETED]"`
- Transform: `UPPERCASE`
- Color: `rgba(30, 23, 9, 0.6)`
- Text align: `center`
- Width: `361px`
- Margin top: `8px`

### Divider Line
- Width: `349px`
- Height: `1px`
- Stroke: `#000000`
- Margin top: `20px`

---

## 👤 Stylist Profile Section

### Profile Photo Container
- Size: `162px × 162px`
- Border radius: `50%` (circular)
- Border: `1px solid #1e1709`
- Overflow: `hidden`
- Margin top: `32px`
- Centered horizontally

**Lissy's Photo:**
- Width: `100%`
- Height: `100%`
- Object fit: `cover`

**Name Badge (overlay):**
- Position: `absolute bottom--12px` (overlaps bottom edge)
- Transform: `translateX(-50%)`
- Background: `rgba(255, 254, 253, 0.8)`
- Border: `1px solid #1e1709`
- Border radius: `20px`
- Padding: `0 16px`
- Height: `30px`
- Z-index: `60`

**Badge Text:**
- Font: `Helvetica Neue Medium`
- Size: `14px`
- Line height: `22px`
- Letter spacing: `2px`
- Text: `"LISSY RODDY"`
- Transform: `UPPERCASE`
- Color: `#130326`
- White space: `nowrap`

---

## 📋 Style Intake Section

### Section Header
- Font: `Helvetica Neue Regular`
- Size: `20px`
- Letter spacing: `2px`
- Text: `"STYLE INTAKE"`
- Transform: `UPPERCASE`
- Color: `#1e1709`
- Text align: `center`
- Margin top: `24px`

### Intake Data Container
- Padding: `0 16px`
- Margin top: `24px`
- Space between fields: `16px` (space-y-4)

### Field Group Structure
**Each field displays as:**

**Label:**
- Font: `Helvetica Neue Medium`
- Size: `12px`
- Letter spacing: `1px`
- Transform: `UPPERCASE`
- Color: `#1e1709`
- Margin bottom: `4px`

**Value:**
- Font: `Helvetica Neue Regular`
- Size: `14px`
- Line height: `26px`
- Letter spacing: `0.5px`
- Color: `#1e1709`

### Field List (displayed if data exists):

1. **Contact**
   - Email address
   - Phone number (if provided)

2. **Style Preferences**
   - Customer's style aesthetic description

3. **Favorite Brands**
   - List of preferred brands

4. **Budget Range**
   - Budget range for purchases

5. **Sizes**
   - Tops size
   - Bottoms size
   - Shoes size

6. **Style Goals**
   - What the customer wants to achieve

7. **Color Preferences**
   - Preferred colors and patterns

8. **Body & Fit**
   - Body type
   - Fit preferences
   - Areas to highlight
   - Areas to avoid

9. **Additional Notes**
   - Free text notes from customer
   - Special requests or allergies

---

## 🖼️ Additional Images Section

### Section Header
- Font: `Helvetica Neue Regular`
- Size: `20px`
- Letter spacing: `2px`
- Text: `"UPLOADED IMAGES"`
- Transform: `UPPERCASE`
- Color: `#1e1709`
- Text align: `center`
- Margin bottom: `24px`

### Image Grid
- Display: `grid`
- Grid columns: `2`
- Gap: `16px`
- Padding: `0 16px`

**Each Image Card:**
- Height: `227px`
- Border: `1px solid #000000`
- Border radius: `3px`
- Overflow: `hidden`

**Image:**
- Width: `100%`
- Height: `100%`
- Object fit: `cover`
- Alt text: `"Upload {index}"`

---

## 🎯 Action Button Section

### Three States:

### STATE 1: Customer is "invited" or "new"

**INVITE Button:**
- Width: `100%` (max container width minus padding)
- Height: `52px`
- Background: `#1E1709`
- Border radius: `8px`
- Font: `Helvetica Neue Bold`
- Font size: `18px`
- Text: `"INVITE"`
- Text color: `#ffffff`
- Transform: `UPPERCASE`
- Cursor: `pointer`
- Hover: `background #2a2010`
- Transition: `all`
- Margin: `40px 16px`
- Display: `flex items-center justify-center gap-8px`

**Loading State:**
- Shows spinner icon (Loader2)
- Icon size: `20px`
- Animates spinning
- Text: `"INVITING..."`
- Disabled: `opacity-50, cursor-not-allowed`

**Action:**
- Updates customer status to "in_progress"
- Navigates to stylist workspace
- Shows success toast: `"Started working on {name}'s selections!"`

---

### STATE 2: Customer is "in_progress"

**CONTINUE STYLING Button:**
- Width: `100%`
- Height: `52px`
- Background: `#1E1709`
- Border radius: `8px`
- Font: `Helvetica Neue Bold`
- Font size: `18px`
- Text: `"CONTINUE STYLING"`
- Text color: `#ffffff`
- Transform: `UPPERCASE`
- Cursor: `pointer`
- Hover: `background #2a2010`
- Transition: `all`
- Margin: `40px 16px`

**Action:**
- Navigates to stylist workspace with customer ID
- Allows stylist to continue creating/editing selections

---

### STATE 3: Customer is "completed"

**COMPLETED Badge:**
- Width: `100%`
- Height: `52px`
- Background: `rgba(30, 23, 9, 0.2)`
- Border radius: `8px`
- Font: `Helvetica Neue Bold`
- Font size: `18px`
- Text: `"EDIT COMPLETED ✓"`
- Text color: `#1E1709`
- Transform: `UPPERCASE`
- Display: `flex items-center justify-center`
- Margin: `40px 16px`
- Not clickable (informational only)

---

## 🔄 Data Flow

### On Component Mount:
1. Extract `customerId` from URL params
2. Show loading spinner
3. Fetch customer data from:
   ```
   GET https://{projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/{customerId}
   Authorization: Bearer {publicAnonKey}
   ```
4. Parse response and populate UI
5. Hide loading spinner

### On INVITE Click:
1. Set inviting state to true (show loading)
2. Update customer status:
   ```
   POST https://{projectId}.supabase.co/functions/v1/make-server-b14d984c/customers/update-status
   Authorization: Bearer {publicAnonKey}
   Body: { userId: customerId, status: 'in_progress' }
   ```
3. Show success toast
4. Navigate to: `/stylist-workspace/{customerId}`

### Error Handling:
- Customer not found: Show "Customer not found" message
- Network error: Show toast error
- Auth error: Show toast error

---

## 📱 Loading States

### Full Page Loading
- Center spinner on screen
- Spinner size: `32px × 32px`
- Color: `#1e1709`
- Animation: `spin`

### Empty State
- Text: `"Customer not found"`
- Font: `Helvetica Neue Regular`
- Size: `14px`
- Color: `rgba(30, 23, 9, 0.5)`
- Centered on screen

---

## 🎨 Design System Values

### Colors
- Background: `#ffffff`
- Primary text: `#1e1709`
- Secondary text: `rgba(30, 23, 9, 0.6)`
- Button background: `#1E1709`
- Button hover: `#2a2010`
- Button text: `#ffffff`
- Border: `#1e1709` or `#000000`
- Badge background: `rgba(255, 254, 253, 0.8)`

### Typography
- Helvetica Neue Regular: Body text
- Helvetica Neue Medium: Labels, names
- Helvetica Neue Bold: Buttons

### Spacing
- Section gap: `40px`
- Field gap: `16px`
- Button margin: `40px 16px`
- Container padding: `0 16px`

### Border Radius
- Cards: `8px`
- Images: `3px` or `8px`
- Badges: `20px`
- Buttons: `8px`
- Profile photo: `50%` (circle)

---

## 🧭 Navigation Flow

```
Messages List → Click Customer Row → Message Detail
                                      ↓
                                   Click INVITE
                                      ↓
                               Stylist Workspace
```

---

## ✅ Complete User Journey (Stylist Side)

1. **Customer completes intake** → Status set to "invited"
2. **Stylist opens messages page** → Sees new customer in list
3. **Stylist clicks customer row** → Opens this message detail screen
4. **Stylist reviews:**
   - Customer's photo (triple border card)
   - All intake answers
   - Additional uploaded images
5. **Stylist clicks INVITE** → Status changes to "in_progress"
6. **Navigate to workspace** → Stylist creates 7 product selections
7. **After completing selections** → Status becomes "completed"
8. **Badge shows "EDIT COMPLETED ✓"** → No further action needed

---

## 🎯 Key Features

✅ **Triple border card** - Signature SEVN SELECTS design  
✅ **Dynamic data loading** - Fetches real customer data  
✅ **Status-based UI** - Different buttons for each status  
✅ **Image gallery** - Shows all customer uploads  
✅ **Complete intake view** - All form answers displayed  
✅ **Loading states** - Spinner while fetching  
✅ **Error handling** - Toast messages for errors  
✅ **Navigation** - Smooth flow to workspace  
✅ **Professional layout** - Clean, editorial aesthetic  

---

This is the complete specification for the message detail screen that stylists see when reviewing a customer's intake submission! 🎨✨

# Backend Data Storage Structure

## Complete Storage Schema

All admin selections are now stored in the **Supabase KV Store** with the following comprehensive structure:

### Storage Key
```
selection:{customerId}
```

### Complete Data Object Stored

```typescript
{
  // Customer/Client ID
  customerId: string,                    // Contentful client entry ID
  
  // CLIENT INFORMATION (from Contentful "client" content type)
  clientEmail: string | object,          // Client email from Contentful
  clientImage: string,                   // Client image URL from Contentful assets
  clientName: string,                    // Client name from Contentful
  clientStylingIntake: {                 // All styling intake responses from Contentful
    stylePreferences: string,            // e.g., "casual", "formal", "trendy"
    sizeInfo: string,                    // Size information
    budget: string,                      // Budget range
    occasion: string,                    // Occasion/purpose
    colors: string,                      // Color preferences
    rawIntakeData: object               // Complete Contentful fields object
  },
  
  // STYLIST INFORMATION
  assignedStylistId: string,             // Stylist ID from Contentful (if assigned)
  stylistName: string,                   // Stylist name from Contentful "stylist" entry
  stylistTitle: string,                  // e.g., "Senior Stylist", "Studio Stylist"
  stylistImage: string,                  // Stylist profile picture URL from Contentful
  
  // CLOTHING ITEMS (Selected products in admin)
  items: [
    {
      id: string,                        // Unique item ID
      url: string,                       // Product URL
      title: string,                     // Product name/title
      image: string,                     // Product image URL
      price: string,                     // Product price (e.g., "$99.00")
      source: 'manual' | 'voice',        // How item was added
      timestamp: string                  // ISO timestamp when added
    },
    // ... up to 7 items
  ],
  
  // STYLING NOTES (from admin interface)
  stylingNotes: string,                  // Notes entered by stylist in admin
  
  // METADATA
  updatedAt: string                      // ISO timestamp of last update
}
```

## Data Sources

### 1. Client Information (from Contentful)
- **Content Type:** `client`
- **Fields extracted:**
  - `email` - Client email address
  - `image` (asset) - Client uploaded photo
  - `name` / `firstName` - Client name
  - `stylePreferences` - Style preferences from intake
  - `sizeInfo` / `size` - Size information
  - `budget` - Budget range
  - `occasion` - Occasion/purpose
  - `colors` / `colorPreferences` - Color preferences
  - `stylist` (reference) - Assigned stylist ID
  - ALL other fields stored in `rawIntakeData`

### 2. Stylist Information (from Contentful)
- **Content Type:** `stylist`
- **Fields extracted:**
  - `fullname` - Stylist full name
  - `bio` (rich text) - Extract bold text for title (e.g., "STUDIO STYLIST")
  - `profile_picture` (asset) - Stylist photo

### 3. Clothing Items (from Admin Interface)
- **Product name:** Scraped from product URL via Jina Reader API
- **Product price:** Scraped from product URL metadata
- **Product URL:** Entered manually or via voice/AI
- **Product image:** Scraped from og:image meta tags

### 4. Styling Notes (from Admin Interface)
- Entered by stylist in the admin interface text area

## Data Flow

### When Item is Added (Auto-save)
```
StylistWorkspace.tsx
  ↓
  Add item to selectedItems state
  ↓
  useEffect triggers saveSelectionsToBackend()
  ↓
  Extract all client data from Contentful
  ↓
  Extract stylist data from Contentful (if assigned)
  ↓
  POST /selections/save
  ↓
  Stored in KV store: selection:{customerId}
```

### When "Send" Button Clicked
```
SelectionsPanel.tsx → sendDraft()
  ↓
  STEP 1: Save to backend
    → POST /selections/save with complete data
  ↓
  STEP 2: Load from backend to verify
    → GET /selections/get/{customerId}
  ↓
  STEP 3: Send to SendGrid
    → POST /sendgrid/send-draft with backend data
    → Email sent to client
```

## API Endpoints

### Save Selections
```
POST /make-server-b14d984c/selections/save
Body: {complete data object as shown above}
Returns: { success: true, data: {...} }
```

### Get Selections
```
GET /make-server-b14d984c/selections/get/:customerId
Returns: { success: true, data: {...} }
```

### Delete Selections
```
DELETE /make-server-b14d984c/selections/delete/:customerId
Returns: { success: true, message: "..." }
```

### Get All Selections (Admin)
```
GET /make-server-b14d984c/selections/all
Returns: { success: true, count: number, data: [...] }
```

## Notes

- **Auto-save:** Selections automatically save to backend whenever items are added/removed
- **Client intake:** All intake form responses from Contentful are stored in `clientStylingIntake`
- **Stylist assignment:** If client has assigned stylist in Contentful, stylist info is fetched and stored
- **Product metadata:** Images, prices, titles are scraped from product URLs
- **Persistence:** All data persists across page refreshes
- **Email sending:** Uses verified backend data, not just frontend state

## Debugging

Check console logs for these markers:
- `💾` - Backend save operations
- `📥` - Backend load operations  
- `📧` - Email sending flow
- `✅` - Success messages
- `❌` - Error messages

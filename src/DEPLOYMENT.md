# Deployment Guide

This project contains two separate applications that share the same Supabase backend:

## 1. Customer-Facing App (sevn.app)
**Entry Point:** `/CustomerApp.tsx`

### Routes:
- `/lissy` - Lissy landing page with image upload
- `/lissy/intake` - Customer intake form
- `/lissy/waitlist` - Post-submission waitlist page

### Deployment:
Deploy `CustomerApp.tsx` as the main entry point to **sevn.app**. The app will handle all `/lissy/*` routes.

## 2. Admin Interface
**Entry Point:** `/App.tsx`

### Routes:
- `/` - Customer list view
- `/customer/:id` - Stylist workspace for individual customer

### Deployment:
Deploy `App.tsx` as the main entry point to your admin domain (e.g., admin.sevn.app or current domain).

## Shared Backend

Both apps use the same Supabase backend defined in `/supabase/functions/server/index.tsx`.

### Backend Routes:
- `/make-server-b14d984c/upload-customer-image` - Upload customer outfit photos
- `/make-server-b14d984c/submit-intake` - Submit intake form data
- `/make-server-b14d984c/customers` - Get all customers (admin only)
- `/make-server-b14d984c/customer/:id` - Get customer details
- `/make-server-b14d984c/search-products` - Product search
- `/make-server-b14d984c/save-selects` - Save stylist selections
- `/make-server-b14d984c/send-email` - Send customer email

### CORS Configuration:
The server is configured to accept requests from both domains. If you need to add additional domains, update the CORS settings in `/supabase/functions/server/index.tsx`.

## Environment Variables

Both apps share these Supabase credentials (already configured):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ENVIRONMENT`
- `CONTENTFUL_ACCESS_TOKEN`
- `OPENAI_API_KEY`
- `SERPER_API_KEY`
- `SENDGRID_API_KEY`

## Testing Locally

**Customer App:**
Use `/CustomerApp.tsx` as entry and navigate to `/lissy`

**Admin App:**
Use `/App.tsx` as entry

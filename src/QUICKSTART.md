# 🚀 QUICKSTART - Test Your App Now

## Step 1: Open Customer Experience

**File:** `/customer.html`

Just open this file in your browser to test the full customer flow.

---

## Step 2: Test the Flow

### Page 1: Landing (Upload Photo)
- Should show "SEVN SELECTS" header
- Big "Create" button in center
- Click to upload an outfit photo

### Page 2: Intake Form
- Enter your name
- Enter your email
- Click "CONTINUE"

### Page 3: Waitlist Confirmation
- Should show: "You're on the SEVN SELECTS waitlist."
- Full message about 24-hour claim window
- Shows lookbook image

---

## Step 3: Check It Worked

### Browser Console
1. Press F12 (or Cmd+Option+I on Mac)
2. Look for green checkmarks ✅
3. Check for any red errors ❌

### What You Should See:
```
✅ Image uploaded: [filename]
✅ Upload successful: {...}
✅ Intake form submitted: {...}
✅ Intake submission successful: {...}
```

---

## 🐛 If Something Breaks

### Landing Page Doesn't Show
- Check console for SVG path errors
- May need to simplify LissyLanding component

### Upload Fails
- Check network tab in DevTools
- Verify Supabase backend is running
- Check environment variables are set

### Form Doesn't Submit
- Check console for errors
- Verify backend endpoint is accessible

---

## 📊 Check Your Data

### Where Customer Data is Stored:

**Supabase KV Database:**
- `customer:{customerId}` - Customer profile
- `customer-list` - Array of all customers
- `temp-image:{imageId}` - Uploaded images

### How to View:
1. Go to Supabase Dashboard
2. Open your project
3. Go to Database → Browse KV store
4. Look for keys starting with `customer:`

---

## ✨ Next Steps After Testing

### If Everything Works:
1. Polish any UX issues
2. Connect admin to see new customers
3. Deploy to production

### If Issues Found:
1. Note exactly what breaks
2. Check console errors
3. We'll debug together

---

## 🎯 Expected Behavior

✅ Smooth navigation between pages  
✅ Image uploads successfully  
✅ Form saves to backend  
✅ Confirmation message displays  
✅ No horizontal scrolling  
✅ Mobile-responsive (test on phone!)  

---

**Ready? Open `/customer.html` and let's see it work!** 🎉

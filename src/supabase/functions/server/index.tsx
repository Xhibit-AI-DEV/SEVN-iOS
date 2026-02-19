import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from "./kv_store.tsx";
import openaiRoutes from "./openai.tsx";
import shoppingRoutes from "./shopping.tsx";
import tavilyRoutes from "./tavily-search.tsx";
import jinaRoutes from "./jina-search.tsx";
import gptBrowserRoutes from "./gpt-browser.tsx";
import braveRoutes from "./brave-search.tsx";
import webScraperRoutes from "./web-scraper.tsx";
import serperRoutes from "./serper-search.tsx";
import openaiAssistantRoutes from "./openai-assistant.tsx";
import voiceRoutes from "./voice.tsx";
import sendgridRoutes from "./sendgrid.tsx";
import selectionsRoutes from "./selections.tsx";
import personalizedSearchRoutes from "./personalized-search.tsx";
import authRoutes from "./auth.tsx";
import customersRoutes from "./customers.tsx";
import ordersRoutes from "./orders.tsx";
import likesRoutes from "./likes.tsx";
import profilesRoutes from "./profiles.tsx";
import editsRoutes from "./edits.tsx";
import adminRoutes from "./admin.tsx";
import followsRoutes from "./follows.tsx";
import blocksRoutes from "./blocks.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Mount OpenAI routes
app.route("/make-server-b14d984c/openai", openaiRoutes);

// Mount OpenAI Assistant routes
app.route("/make-server-b14d984c/openai-assistant", openaiAssistantRoutes);

// Mount Voice routes
app.route("/make-server-b14d984c/voice", voiceRoutes);

// Mount Sendgrid routes
app.route("/make-server-b14d984c/sendgrid", sendgridRoutes);

// Mount Selections routes
app.route("/make-server-b14d984c/selections", selectionsRoutes);

// Mount Shopping routes
app.route("/make-server-b14d984c/shopping", shoppingRoutes);

// Mount Serper Search routes (RECOMMENDED - best for fashion products)
app.route("/make-server-b14d984c/serper-search", serperRoutes);

// Mount Personalized Search routes (AI-enhanced search + smart suggestions)
app.route("/make-server-b14d984c/personalized-search", personalizedSearchRoutes);

// Mount Tavily Search routes
app.route("/make-server-b14d984c/tavily-search", tavilyRoutes);

// Mount Jina Search routes
app.route("/make-server-b14d984c/jina-search", jinaRoutes);

// Mount GPT Browser routes
app.route("/make-server-b14d984c/gpt-browser", gptBrowserRoutes);

// Mount Brave Search routes
app.route("/make-server-b14d984c/brave-search", braveRoutes);

// Mount Web Scraper routes
app.route("/make-server-b14d984c/web-scraper", webScraperRoutes);

// Mount Auth routes
app.route("/make-server-b14d984c/auth", authRoutes);

// Mount Customers routes (NEW - replaces Contentful integration)
app.route("/make-server-b14d984c/customers", customersRoutes);

// Mount Orders routes (NEW - for managing customer orders)
app.route("/make-server-b14d984c/orders", ordersRoutes);

// Mount Likes routes (NEW - for managing customer likes)
app.route("/make-server-b14d984c/likes", likesRoutes);

// Mount Profiles routes (NEW - for managing user profiles)
app.route("/make-server-b14d984c/profiles", profilesRoutes);

// Mount Edits routes (NEW - for managing user edits/content)
app.route("/make-server-b14d984c/edits", editsRoutes);

// Mount Admin routes (NEW - for managing admin tasks)
app.route("/make-server-b14d984c/admin", adminRoutes);

// Mount Follows routes (NEW - for managing user follows)
app.route("/make-server-b14d984c/follows", followsRoutes);

// Mount Blocks routes (NEW - for managing user blocks)
app.route("/make-server-b14d984c/blocks", blocksRoutes);

// Upload endpoint (for intake form images)
app.post("/make-server-b14d984c/upload", async (c) => {
  try {
    console.log('📸 Upload request received');
    console.log('📸 Request headers:', Object.fromEntries(c.req.raw.headers.entries()));
    console.log('📸 Content-Type:', c.req.header('Content-Type'));
    
    // Check if this is a JSON request with base64 data
    const contentType = c.req.header('Content-Type') || '';
    if (contentType.includes('application/json')) {
      console.log('📸 Detected JSON request, expecting base64 data');
      const jsonData = await c.req.json();
      
      if (jsonData.base64 && jsonData.fileName && jsonData.fileType) {
        console.log('📸 Processing base64 upload:', jsonData.fileName);
        
        // Remove data URL prefix if present
        const base64Data = jsonData.base64.replace(/^data:[^;]+;base64,/, '');
        
        // Convert base64 to Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log('📸 Decoded base64, size:', bytes.length, 'bytes');
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const bucketName = 'make-b14d984c-customer-images';
        
        // Ensure bucket exists as PUBLIC
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucket = buckets?.find(b => b.name === bucketName);
        
        if (!bucket) {
          console.log('📁 Creating PUBLIC customer images bucket');
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
          
          if (createError && !createError.message?.includes('already exists')) {
            console.error('❌ Failed to create bucket:', createError);
            return c.json({ error: 'Failed to create storage bucket' }, 500);
          }
        }
        
        // Upload image
        const fileExt = jsonData.fileName.split('.').pop() || 'jpg';
        const fileName = `intake-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        console.log('⬆️ Uploading to bucket:', bucketName, 'as:', fileName);
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, bytes, {
            contentType: jsonData.fileType,
            upsert: true,
            cacheControl: '31536000',
          });
        
        if (uploadError) {
          console.error('❌ Upload error:', uploadError);
          return c.json({ error: `Failed to upload image: ${uploadError.message}` }, 500);
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        
        console.log('✅ Image uploaded successfully:', urlData.publicUrl);
        
        // Determine media type from file
        const mediaType = jsonData.fileType.startsWith('video/') ? 'video' : 'image';
        console.log('📹 Media type detected:', mediaType);
        
        return c.json({
          success: true,
          url: urlData.publicUrl,
          fileName: fileName,
          mediaType: mediaType, // Include media type for video support
        });
      }
    }
    
    // Otherwise, handle as FormData
    const formData = await c.req.formData();
    console.log('📸 FormData entries:', Array.from(formData.entries()).map(([k, v]) => `${k}: ${v instanceof File ? `File(${v.name}, ${v.size} bytes)` : v}`));
    
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      console.error('❌ No file provided in form data');
      console.error('❌ FormData keys:', Array.from(formData.keys()));
      console.error('❌ File value:', file);
      return c.json({ error: 'No file provided' }, 400);
    }
    
    console.log('📷 File received:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const bucketName = 'make-b14d984c-customer-images';
    
    // Ensure bucket exists as PUBLIC
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find(b => b.name === bucketName);
    
    if (!bucket) {
      console.log('📁 Creating PUBLIC customer images bucket');
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError && !createError.message?.includes('already exists')) {
        console.error('❌ Failed to create bucket:', createError);
        return c.json({ error: 'Failed to create storage bucket' }, 500);
      }
    }
    
    // Upload image
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `intake-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    console.log('⬆️ Uploading to bucket:', bucketName, 'as:', fileName);
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: true,
        cacheControl: '31536000',
      });
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return c.json({ error: `Failed to upload image: ${uploadError.message}` }, 500);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    console.log('✅ Image uploaded successfully:', urlData.publicUrl);
    
    // Determine media type from file
    const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    console.log('📹 Media type detected:', mediaType);
    
    return c.json({
      success: true,
      url: urlData.publicUrl,
      fileName: fileName,
      mediaType: mediaType, // Include media type for video support
    });
    
  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    return c.json({ error: error.message || 'Failed to upload file' }, 500);
  }
});

// Upload image to Supabase Storage (for intake form)
app.post("/make-server-b14d984c/upload-image", async (c) => {
  try {
    console.log('📸 Image upload request received');
    
    const formData = await c.req.formData();
    const image = formData.get('image');
    const fileName = formData.get('fileName') as string || `image-${Date.now()}`;
    
    if (!image || !(image instanceof File)) {
      return c.json({ error: 'No image file provided' }, 400);
    }
    
    console.log('📷 Image received:', image.name, 'Size:', image.size);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const bucketName = 'make-b14d984c-customer-images';
    
    // Ensure bucket exists as PUBLIC
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find(b => b.name === bucketName);
    
    if (!bucket) {
      console.log('📁 Creating PUBLIC customer images bucket');
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError && !createError.message?.includes('already exists')) {
        console.error('❌ Failed to create bucket:', createError);
      }
    }
    
    // Upload image
    const arrayBuffer = await image.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    const fileExt = image.name.split('.').pop() || 'jpg';
    const finalFileName = `${fileName}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(finalFileName, uint8Array, {
        contentType: image.type,
        upsert: true,
        cacheControl: '31536000',
      });
    
    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return c.json({ error: 'Failed to upload image' }, 500);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(finalFileName);
    
    console.log('✅ Image uploaded successfully:', urlData.publicUrl);
    
    return c.json({
      success: true,
      url: urlData.publicUrl,
      fileName: finalFileName,
    });
    
  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    return c.json({ error: error.message || 'Failed to upload image' }, 500);
  }
});

// Health check endpoint
app.get("/make-server-b14d984c/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to get user info by email
app.get("/make-server-b14d984c/debug/user-by-email/:email", async (c) => {
  try {
    const email = c.req.param('email');
    
    console.log('🔍 Looking up user by email:', email);
    
    // Use the same import pattern
    const { createClient } = await import('jsr:@supabase/supabase-js@2');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get user from Supabase Auth (using SERVICE_ROLE_KEY so no auth needed)
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      return c.json({ error: listError.message }, 500);
    }
    
    const user = listData.users.find(u => u.email === email);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Get customer record
    const customerKey = `customer:${user.id}`;
    const customer = await kv.get(customerKey);
    
    // Get profile record
    const profileKey = `profile:${user.id}`;
    const profile = await kv.get(profileKey);
    
    console.log('✅ Found user:', user.id);
    console.log('📋 Profile:', profile);
    console.log('👤 Customer:', customer);
    
    return c.json({
      auth_user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        user_metadata: user.user_metadata,
      },
      customer_record: customer,
      profile_record: profile,
    });
  } catch (error: any) {
    console.error('❌ Error looking up user:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Test bucket endpoint (no auth required)
app.get("/make-server-b14d984c/test-bucket", async (c) => {
  try {
    // Use the same import pattern as other files
    const { createClient } = await import('jsr:@supabase/supabase-js@2');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    console.log('🧪 Testing bucket configuration...');
    console.log('📍 Supabase URL:', supabaseUrl);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const bucketName = 'make-b14d984c-avatars';
    
    // Check bucket status
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return c.json({
        error: 'Failed to list buckets',
        details: bucketsError.message,
      }, 500);
    }
    
    const bucket = buckets?.find(b => b.name === bucketName);
    
    if (!bucket) {
      console.log('📁 Avatar bucket does not exist, attempting to create...');
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        return c.json({
          error: 'Avatar bucket does not exist and failed to create',
          bucketName,
          createError: createError.message,
          availableBuckets: buckets?.map(b => b.name) || [],
        }, 500);
      }
      
      return c.json({
        success: true,
        message: 'Avatar bucket created successfully',
        bucketName,
      });
    }
    
    console.log('📁 Bucket found:', bucket);
    
    // Try to upload a test file
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = new TextEncoder().encode('Test upload');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
        upsert: true,
      });
    
    if (uploadError) {
      return c.json({
        bucket: {
          name: bucket.name,
          public: bucket.public,
          id: bucket.id,
        },
        testUpload: 'FAILED',
        uploadError: uploadError.message,
        suggestion: 'Check Supabase Storage policies and permissions',
      }, 500);
    }
    
    // Delete test file
    await supabase.storage.from(bucketName).remove([testFileName]);
    
    return c.json({
      success: true,
      bucket: {
        name: bucket.name,
        public: bucket.public,
        id: bucket.id,
      },
      testUpload: 'SUCCESS',
      message: '✅ Avatar bucket is configured correctly and uploads work!',
    });
    
  } catch (error: any) {
    console.error('❌ Error testing bucket:', error);
    return c.json({
      error: error.message || 'Failed to test bucket',
      stack: error.stack,
    }, 500);
  }
});

// Debug endpoint to check environment variables
app.get("/make-server-b14d984c/debug/env", (c) => {
  const spaceId = Deno.env.get("CONTENTFUL_SPACE_ID");
  const environment = Deno.env.get("CONTENTFUL_ENVIRONMENT");
  const accessToken = Deno.env.get("CONTENTFUL_ACCESS_TOKEN");
  
  return c.json({
    hasSpaceId: !!spaceId,
    spaceId: spaceId,
    hasEnvironment: !!environment,
    environment: environment,
    hasAccessToken: !!accessToken,
    accessTokenFirst10: accessToken?.substring(0, 10),
    accessTokenLength: accessToken?.length,
  });
});

// Get all stylists from Contentful
app.get("/make-server-b14d984c/stylists", async (c) => {
  try {
    const spaceId = "1inmo0bc6xc9";
    const environment = "master";
    const accessToken = "phh69ZwGBaYpy40jcTvmtdnXVs2TXRfLXYkPU2EkaiQ";

    console.log("Fetching stylists from Contentful...");

    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=stylist`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Contentful API error: ${response.status} - ${errorText}`);
      return c.json({ error: `Contentful API error: ${response.status}` }, response.status);
    }

    const data = await response.json();
    console.log("✅ Fetched stylists:", data.items?.length || 0);
    return c.json(data);
  } catch (error) {
    console.error("Error fetching stylists from Contentful:", error);
    return c.json({ error: `Failed to fetch stylists: ${error.message}` }, 500);
  }
});

// Get a specific stylist by ID from Contentful
app.get("/make-server-b14d984c/stylists/:id", async (c) => {
  try {
    const stylistId = c.req.param("id");
    const spaceId = "1inmo0bc6xc9";
    const environment = "master";
    const accessToken = "phh69ZwGBaYpy40jcTvmtdnXVs2TXRfLXYkPU2EkaiQ";

    console.log(`Fetching stylist ${stylistId} from Contentful...`);

    // Try to query by sys.id first (if it's a Contentful ID)
    let url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries/${stylistId}`;
    
    let response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // If found by sys.id, return it
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Found stylist by sys.id: ${stylistId}`);
      return c.json(data);
    }

    // Not found by sys.id, try querying by different field names
    console.log(`Not found by sys.id, trying field queries...`);
    
    // Try common field names for stylist identifier (added more options and case-insensitive search)
    const fieldNamesToTry = ['slug', 'id', 'stylistId', 'handle', 'name', 'email', 'username'];
    
    for (const fieldName of fieldNamesToTry) {
      console.log(`Trying field: ${fieldName}...`);
      url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=stylist&fields.${fieldName}[match]=${stylistId}&limit=1`;
      
      response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          console.log(`✅ Found stylist by ${fieldName}: ${stylistId}`);
          return c.json(data.items[0]);
        }
      }
    }
    
    // Still not found - fetch ALL stylists and log their structure to help debug
    console.log(`❌ Stylist not found with any field. Fetching all stylists to debug...`);
    url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=stylist`;
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    
    if (response.ok) {
      const allStylists = await response.json();
      console.log(`📋 Total stylists in Contentful: ${allStylists.items?.length || 0}`);
      
      // Log the field structure of each stylist
      allStylists.items?.forEach((stylist: any, index: number) => {
        console.log(`Stylist ${index + 1}:`, {
          sysId: stylist.sys.id,
          fields: Object.keys(stylist.fields || {}),
          fieldValues: stylist.fields,
        });
      });
      
      // Try to find a match by doing case-insensitive comparison on all string fields
      const matchingStylist = allStylists.items?.find((stylist: any) => {
        const fields = stylist.fields || {};
        return Object.values(fields).some((value: any) => {
          if (typeof value === 'string') {
            return value.toLowerCase() === stylistId.toLowerCase();
          }
          return false;
        });
      });
      
      if (matchingStylist) {
        console.log(`✅ Found stylist by case-insensitive field match!`);
        return c.json(matchingStylist);
      }
    }
    
    // Still not found - return 404 with helpful debug info
    console.log(`❌ Stylist not found: ${stylistId}`);
    return c.json({ 
      error: `Stylist not found: ${stylistId}`,
      details: `Tried sys.id and fields: ${fieldNamesToTry.join(', ')}`,
      hint: 'Check the server logs to see available stylists and their field structure'
    }, 404);
    
  } catch (error) {
    console.error("Error fetching stylist from Contentful:", error);
    return c.json({ error: `Failed to fetch stylist: ${error.message}` }, 500);
  }
});

// Upload customer image (from intake form)
app.post("/make-server-b14d984c/upload-customer-image", async (c) => {
  try {
    console.log('📸 Customer image upload request received');
    
    const formData = await c.req.formData();
    const image = formData.get('image');
    
    if (!image || !(image instanceof File)) {
      return c.json({ error: 'No image file provided' }, 400);
    }
    
    console.log('📷 Image received:', image.name, 'Size:', image.size);
    
    // For now, store the image temporarily in KV with a timestamp
    const imageId = `customer-image-${Date.now()}`;
    const arrayBuffer = await image.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    await kv.set(`temp-image:${imageId}`, {
      name: image.name,
      type: image.type,
      size: image.size,
      data: base64,
      uploadedAt: new Date().toISOString(),
    });
    
    console.log('✅ Image stored temporarily:', imageId);
    
    return c.json({ 
      success: true, 
      imageId,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    console.error('❌ Error uploading customer image:', error);
    return c.json({ error: `Failed to upload image: ${error.message}` }, 500);
  }
});

// Submit customer intake form
app.post("/make-server-b14d984c/submit-intake", async (c) => {
  try {
    console.log('📝 Customer intake submission received');
    
    const formData = await c.req.json();
    console.log('Form data:', formData);
    
    // Generate a unique customer ID
    const customerId = `customer-${Date.now()}`;
    
    // Store customer data in KV
    await kv.set(`customer:${customerId}`, {
      id: customerId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      stylePreferences: formData.stylePreferences || {},
      budget: formData.budget || '',
      occasion: formData.occasion || '',
      imageId: formData.imageId || '',
      submittedAt: new Date().toISOString(),
      status: 'waitlist', // waitlist, invited, active, completed
    });
    
    // Add to customer list
    const customerList = await kv.get('customer-list') || { customers: [] };
    customerList.customers.unshift(customerId); // Add to beginning
    await kv.set('customer-list', customerList);
    
    console.log('✅ Customer data saved:', customerId);
    
    return c.json({ 
      success: true, 
      customerId,
      message: 'Intake form submitted successfully' 
    });
  } catch (error) {
    console.error('❌ Error submitting intake form:', error);
    return c.json({ error: `Failed to submit intake: ${error.message}` }, 500);
  }
});

// Get waitlist users
app.get("/make-server-b14d984c/waitlist-users", async (c) => {
  try {
    console.log('📋 Fetching waitlist users from Contentful');
    
    const spaceId = "1inmo0bc6xc9";
    const environment = "master";
    const accessToken = "phh69ZwGBaYpy40jcTvmtdnXVs2TXRfLXYkPU2EkaiQ";

    const url = `https://cdn.contentful.com/spaces/${spaceId}/environments/${environment}/entries?content_type=client`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error(`Contentful API error: ${response.status}`);
      return c.json({ users: [] });
    }

    const data = await response.json();
    const customers = data.items || [];
    
    console.log(`📊 Found ${customers.length} customers from Contentful`);

    // Transform Contentful customers to waitlist user format
    const users = await Promise.all(customers.map(async (customer: any) => {
      const fields = customer.fields || {};
      
      // Safely extract name as a string FIRST (before using it)
      const name = typeof fields.name === 'string' ? fields.name : 
                   fields.name?.['en-US'] || 
                   fields.firstName || 
                   fields.fullName || 
                   'Unknown Customer';
      
      // Get customer photo from Contentful assets
      let photoUrl = null;
      if (fields.profilePhoto && data.includes?.Asset) {
        const assetId = fields.profilePhoto.sys?.id;
        const asset = data.includes.Asset.find((a: any) => a.sys.id === assetId);
        if (asset?.fields?.file?.url) {
          photoUrl = `https:${asset.fields.file.url}`;
        }
      }
      
      // Determine status based on whether they have selections
      let status = 'waitlist';
      const selectionKey = `selections:${customer.sys.id}`;
      const selections = await kv.get(selectionKey);
      if (selections && selections.items && selections.items.length > 0) {
        status = 'ready';
        console.log(`✅ Customer ${name} has ${selections.items.length} selections - status: READY`);
      } else {
        console.log(`📋 Customer ${name} has no selections - status: WAITLIST (black Invite button)`);
      }
      
      return {
        id: customer.sys.id,
        name: String(name), // Ensure it's always a string
        email: typeof fields.email === 'string' ? fields.email : fields.email?.['en-US'] || '',
        photoUrl,
        status,
        submittedAt: customer.sys.createdAt,
      };
    }));
    
    console.log(`✅ Returning ${users.length} users for SELECTS page`);
    
    return c.json({ users });
  } catch (error) {
    console.error('❌ Error fetching waitlist users:', error);
    return c.json({ users: [] });
  }
});

// Invite a user
app.post("/make-server-b14d984c/invite-user", async (c) => {
  try {
    console.log('💌 User invite request received');
    
    const { userId, userName } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }
    
    // Get customer data
    const customer = await kv.get(`customer:${userId}`);
    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }
    
    // Update customer status
    customer.status = 'invited';
    customer.invitedAt = new Date().toISOString();
    await kv.set(`customer:${userId}`, customer);
    
    console.log(`✅ User ${userId} marked as invited`);
    
    // TODO: Send invite email via SendGrid
    // This can be integrated with the sendgrid routes later
    
    return c.json({ 
      success: true,
      message: `Invite sent to ${userName}` 
    });
  } catch (error) {
    console.error('❌ Error inviting user:', error);
    return c.json({ error: `Failed to invite user: ${error.message}` }, 500);
  }
});

// Seed example waitlist users
app.post("/make-server-b14d984c/seed-waitlist", async (c) => {
  try {
    console.log('🌱 Seeding example waitlist users');
    
    // First, clear any existing example users
    const customerList = await kv.get('customer-list') || { customers: [] };
    const existingExampleIds = ['customer-example-1', 'customer-example-2'];
    
    // Remove example users from the list
    customerList.customers = customerList.customers.filter(
      id => !existingExampleIds.includes(id)
    );
    
    // Delete the old example user data
    for (const id of existingExampleIds) {
      await kv.del(`customer:${id}`);
    }
    
    // Example users data - using exact Figma asset URLs from the design
    const exampleUsers = [
      {
        id: 'customer-example-1',
        name: 'Chris Whyl',
        email: 'chris.whyl@example.com',
        phone: '',
        stylePreferences: {},
        budget: '',
        occasion: '',
        // Chris Whyl's profile image (FENDI sweater image)
        imageUrl: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/6bc222f6f3bf9f614a8a9bd6bb75d6e1b1fb0cbc.png',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'ready', // ready status - shows "READY" button with white background
      },
      {
        id: 'customer-example-2',
        name: 'Lee Thurston',
        email: 'lee.thurston@example.com',
        phone: '',
        stylePreferences: {},
        budget: '',
        occasion: '',
        // Lee Thurston's profile image (store/microphone image)
        imageUrl: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/6a2ccf758bd83df34eb1bdf9d4b3dffc726d093f.png',
        submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        status: 'waitlist', // waitlist status - shows "Invite" button with black background
      },
    ];
    
    // Add example users
    for (const user of exampleUsers) {
      await kv.set(`customer:${user.id}`, user);
      
      // Add to customer list if not already there
      if (!customerList.customers.includes(user.id)) {
        customerList.customers.unshift(user.id);
      }
    }
    
    await kv.set('customer-list', customerList);
    
    console.log('✅ Example waitlist users seeded with Chris Whyl and Lee Thurston');
    
    return c.json({ 
      success: true,
      message: 'Example users added to waitlist',
      users: exampleUsers.map(u => ({ id: u.id, name: u.name, status: u.status }))
    });
  } catch (error) {
    console.error('❌ Error seeding waitlist users:', error);
    return c.json({ error: `Failed to seed users: ${error.message}` }, 500);
  }
});

// Create Chris test account (for testing)
app.post("/make-server-b14d984c/seed-chris-account", async (c) => {
  try {
    console.log('🌱 Creating test accounts (Lissy + Chris + Lewis)...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const accounts = [
      {
        email: 'lissy@sevn.app',
        password: 'Password123',
        name: 'Lissy Roddy',
        username: 'lissy',
        role: 'stylist',
        bio: 'Professional stylist at SEVN',
      },
      {
        email: 'chris@sevn.app',
        password: 'Password123',
        name: 'Chris Whly',
        username: 'chris_whly',
        role: 'stylist',
        bio: 'Professional stylist at SEVN',
      },
      {
        email: 'lewis@sevn.app',
        password: 'Password123',
        name: 'Lewis Bloyce',
        username: 'lewis',
        role: 'stylist',
        bio: 'Professional stylist at SEVN',
      }
    ];
    
    const results = [];
    
    for (const account of accounts) {
      console.log(`\n📝 Processing ${account.email}...`);
      
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === account.email.toLowerCase());
      
      let userId: string;
      
      if (existingUser) {
        console.log(`⚠️ User ${account.email} already exists, using existing profile...`);
        userId = existingUser.id;
        
        // Don't update existing user data - just ensure they exist
      } else {
        console.log(`✅ Creating new user ${account.email}...`);
        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            name: account.name,
            role: account.role,
          },
        });
        
        if (error) {
          console.error(`❌ Failed to create user ${account.email}:`, error);
          results.push({
            email: account.email,
            success: false,
            error: error.message,
          });
          continue;
        }
        
        userId = data.user.id;
      }
      
      // Create/update customer record - only if it doesn't exist
      const customerKey = `customer:${userId}`;
      const existingCustomer = await kv.get(customerKey);
      
      if (!existingCustomer) {
        await kv.set(customerKey, {
          id: userId,
          email: account.email,
          name: account.name,
          username: account.username,
          role: account.role,
          status: 'new',
          created_at: new Date().toISOString(),
          has_intake: false,
        });
      }
      
      // Create/update profile - only if it doesn't exist
      const profileKey = `profile:${userId}`;
      const existingProfile = await kv.get(profileKey);
      
      if (!existingProfile) {
        await kv.set(profileKey, {
          user_id: userId,
          username: account.username,
          display_name: account.name,
          name: account.name,
          bio: account.bio,
          profile_photo_url: '',
          external_link: '',
          location: '',
          created_edits: [],
          liked_edits: [],
          followers_count: 0,
          following_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        console.log(`✅ ${account.email} profile created successfully`);
      } else {
        console.log(`✅ ${account.email} profile already exists, skipping creation`);
      }
      
      console.log(`✅ ${account.email} account created/updated successfully`);
      
      results.push({
        email: account.email,
        success: true,
        user_id: userId,
        username: account.username,
        role: account.role,
      });
    }
    
    console.log('\n✅ All test accounts processed');
    
    return c.json({
      success: true,
      message: 'Test accounts created/updated',
      accounts: results,
      credentials: accounts.map(a => ({
        email: a.email,
        password: a.password,
        role: a.role,
      }))
    });
  } catch (error) {
    console.error('❌ Error creating test accounts:', error);
    return c.json({ error: `Failed to create accounts: ${error.message}` }, 500);
  }
});

// Fetch URL metadata (Open Graph data, title, image)
app.post("/make-server-b14d984c/fetch-url-metadata", async (c) => {
  let requestUrl = '';
  try {
    const body = await c.req.json();
    const url = body.url;
    requestUrl = url;
    
    if (!url) {
      return c.json({ 
        error: "URL is required",
        url: '',
        title: 'Product Link',
        image: null,
        description: '',
        price: '',
      }, 200);
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (urlError) {
      console.log('Invalid URL format:', url);
      return c.json({ 
        error: "Invalid URL format",
        url: url,
        title: 'Product Link',
        image: null,
        description: '',
        price: '',
      }, 200);
    }

    console.log(`Fetching metadata for: ${url}`);

    // Try Jina Reader API first (best for product pages)
    try {
      console.log('Trying Jina Reader API...');
      const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
        headers: {
          'Accept': 'application/json',
          'X-Return-Format': 'json',
          'X-With-Generated-Alt': 'true',
          'X-With-Images-Summary': 'true',
        },
      });

      console.log('Jina response status:', jinaResponse.status);
      
      if (jinaResponse.ok) {
        const jinaData = await jinaResponse.json();
        console.log('✅ Jina response received');
        console.log('Jina data.title:', jinaData.data?.title);
        console.log('Jina data.image:', jinaData.data?.image);
        console.log('Jina data.ogImage:', jinaData.data?.ogImage);

        if (jinaData.data && jinaData.data.title) {
          // Try to get image from multiple sources
          let imageUrl = jinaData.data.image || jinaData.data.ogImage;
          
          // If no direct image, try images array
          if (!imageUrl && jinaData.data.images && jinaData.data.images.length > 0) {
            imageUrl = jinaData.data.images[0];
            console.log('Using first image from images array:', imageUrl);
          }
          
          const result = {
            url,
            title: jinaData.data.title || 'Product Link',
            image: imageUrl || null,
            description: jinaData.data.description?.substring(0, 200) || '',
            price: jinaData.data.price || '',
          };
          console.log('✅ Returning Jina metadata - title:', result.title, 'hasImage:', !!result.image);
          return c.json(result);
        } else {
          console.log('⚠️ Jina returned data but no title');
        }
      } else {
        console.log('⚠️ Jina returned non-OK status:', jinaResponse.status);
      }
    } catch (jinaError) {
      console.log('❌ Jina API error:', jinaError.message);
    }

    // Fallback to HTML scraping
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        console.log(`⚠️ Failed to fetch URL (${response.status}): ${url}`);
        // Return minimal metadata instead of throwing error
        return c.json({
          url,
          title: new URL(url).hostname || 'Product Link',
          image: null,
          description: '',
          price: '',
        });
      }

      const html = await response.text();
      
      // Extract metadata using indexOf (more reliable than regex)
      const getMetaContent = (property) => {
        const searchPatterns = [
          `property="${property}"`,
          `property='${property}'`,
          `name="${property}"`,
          `name='${property}'`,
        ];
        
        for (const searchPattern of searchPatterns) {
          let index = html.toLowerCase().indexOf(searchPattern.toLowerCase());
          if (index === -1) continue;
          
          // Find the meta tag containing this property
          const metaStart = html.lastIndexOf('<meta', index);
          const metaEnd = html.indexOf('>', index);
          if (metaStart === -1 || metaEnd === -1) continue;
          
          const metaTag = html.substring(metaStart, metaEnd + 1);
          
          // Extract content value
          let contentMatch = metaTag.match(/content=["']([^"']+)["']/i);
          if (contentMatch && contentMatch[1]) {
            return contentMatch[1];
          }
        }
        return null;
      };

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = getMetaContent('og:title') || 
                    getMetaContent('twitter:title') || 
                    (titleMatch ? titleMatch[1] : null) ||
                    'Product Link';

      // Extract image - try multiple sources
      let image = getMetaContent('og:image') || 
                    getMetaContent('twitter:image') ||
                    getMetaContent('twitter:image:src') ||
                    getMetaContent('image');
      
      console.log('Raw image value from meta tags:', image);
      
      // If no og:image found, try to find product image in structured data
      if (!image) {
        // Try JSON-LD structured data
        const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/is);
        if (jsonLdMatch && jsonLdMatch[1]) {
          try {
            const structuredData = JSON.parse(jsonLdMatch[1]);
            console.log('Found JSON-LD structured data:', structuredData);
            if (structuredData.image) {
              image = Array.isArray(structuredData.image) ? structuredData.image[0] : structuredData.image;
              console.log('Extracted image from JSON-LD:', image);
            }
          } catch (e) {
            console.log('Failed to parse JSON-LD:', e.message);
          }
        }
      }
      
      console.log('Image after all extraction attempts:', image);
      
      // Make relative URLs absolute
      if (image && !image.startsWith('http')) {
        const urlObj = new URL(url);
        if (image.startsWith('//')) {
          image = `${urlObj.protocol}${image}`;
        } else if (image.startsWith('/')) {
          image = `${urlObj.protocol}//${urlObj.host}${image}`;
        } else {
          image = `${urlObj.protocol}//${urlObj.host}/${image}`;
        }
        console.log('Converted relative URL to:', image);
      }
      
      console.log('📸 Final image URL to return:', image);

      // Extract description
      const description = getMetaContent('og:description') || 
                          getMetaContent('twitter:description') || 
                          getMetaContent('description') ||
                          '';

      // Extract price if available
      let price = getMetaContent('og:price:amount') || 
                    getMetaContent('product:price:amount') ||
                    '';
      
      // Try to find price in JSON-LD structured data if not found in meta tags
      if (!price) {
        const jsonLdMatch = html.match(/<script[^>]*type=[\"']application\/ld\+json[\"'][^>]*>(.*?)<\/script>/is);
        if (jsonLdMatch && jsonLdMatch[1]) {
          try {
            const structuredData = JSON.parse(jsonLdMatch[1]);
            console.log('Checking JSON-LD for price:', structuredData);
            
            // Check for price in different formats
            if (structuredData.offers) {
              const offers = Array.isArray(structuredData.offers) ? structuredData.offers[0] : structuredData.offers;
              if (offers.price) {
                price = offers.priceCurrency ? `${offers.priceCurrency} ${offers.price}` : String(offers.price);
                console.log('Extracted price from JSON-LD offers:', price);
              }
            } else if (structuredData.price) {
              price = String(structuredData.price);
              console.log('Extracted price from JSON-LD root:', price);
            }
          } catch (e) {
            console.log('Failed to parse JSON-LD for price:', e.message);
          }
        }
      }
      
      // If still no price, try to find it in the HTML content
      if (!price) {
        // Look for common price patterns in the HTML
        const pricePatterns = [
          /[\"']price[\"'][\s:]*[\"']?(\$?[\d,]+\.?\d*)[\"']?/i,
          /itemprop=[\"']price[\"'][^>]*content=[\"'](\$?[\d,]+\.?\d*)[\"']/i,
          /<span[^>]*class=[\"'][^\"']*price[^\"']*[\"'][^>]*>[\s]*(\$?[\d,]+\.?\d*)/i,
        ];
        
        for (const pattern of pricePatterns) {
          const match = html.match(pattern);
          if (match && match[1]) {
            price = match[1];
            console.log('Extracted price from HTML pattern:', price);
            break;
          }
        }
      }

      // Extract brand if available
      const brand = getMetaContent('og:brand') || 
                    getMetaContent('product:brand') ||
                    '';

      console.log('Final extracted metadata:', { 
        title, 
        image: image || 'NO IMAGE FOUND', 
        price,
        brand,
        hasImage: !!image 
      });

      return c.json({
        url,
        title,
        image,
        description: description.substring(0, 200), // Limit description length
        price,
        brand,
      });
    } catch (error) {
      console.error("Error fetching URL metadata:", error);
      return c.json({ 
        error: `Failed to fetch metadata: ${error.message}`,
        url: requestUrl,
        title: 'Product Link',
        image: null,
        description: '',
        price: '',
      }, 200); // Return 200 with partial data so the frontend can still add the item
    }
  } catch (error) {
    console.error("Error fetching URL metadata:", error);
    return c.json({ 
      error: `Failed to fetch metadata: ${error.message}`,
      url: requestUrl,
      title: 'Product Link',
      image: null,
      description: '',
      price: '',
    }, 200); // Return 200 with partial data so the frontend can still add the item
  }
});

Deno.serve(app.fetch);
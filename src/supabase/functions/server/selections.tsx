import { Hono } from 'npm:hono@4.0.2';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Initialize Supabase client for storage
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Helper function to download and host an image
async function downloadAndHostImage(imageUrl: string, itemId: string): Promise<string | null> {
  if (!imageUrl || imageUrl === '') {
    console.log('⚠️ No image URL provided, skipping download');
    return null;
  }

  try {
    console.log('📥 Downloading image:', imageUrl);
    
    // ✅ SKIP RESIZING FOR CONTENTFUL IMAGES - they're already optimized!
    const isContentfulImage = imageUrl.includes('images.ctfassets.net');
    if (isContentfulImage) {
      console.log('✅ Contentful image detected - already optimized, returning as-is');
      return imageUrl;
    }
    
    // Validate URL format
    let validUrl: string;
    try {
      validUrl = new URL(imageUrl).toString();
    } catch (e) {
      console.error('❌ Invalid URL format:', imageUrl);
      return imageUrl; // Return as-is if malformed
    }
    
    // Download the image with proper headers
    const response = await fetch(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/png,image/jpeg,image/*,*/*;q=0.8',
        'Referer': 'https://www.google.com/',
      },
    });
    
    if (!response.ok) {
      console.error('❌ Failed to download image:', response.status, response.statusText);
      console.error('❌ Image URL:', imageUrl);
      console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Try to get error body
      try {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText.substring(0, 500));
      } catch (e) {
        // Ignore if can't read error body
      }
      
      return imageUrl; // Return original URL as fallback
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    console.log('📦 Original content type:', contentType);
    
    // Validate it's actually an image
    if (!contentType.startsWith('image/')) {
      console.error('❌ URL does not return an image. Content-Type:', contentType);
      return imageUrl; // Return original URL as fallback
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log('📦 Downloaded image size:', uint8Array.length, 'bytes', `(${(uint8Array.length / 1024).toFixed(1)} KB)`);

    // ✅ Upload as-is without resizing (to avoid format compatibility issues)
    // SendGrid accepts various image sizes, and Contentful images are already optimized
    const finalImageData = uint8Array;
    
    // Determine file extension from content type
    let finalExtension = 'jpg';
    if (contentType.includes('png')) {
      finalExtension = 'png';
    } else if (contentType.includes('webp')) {
      finalExtension = 'webp';
    } else if (contentType.includes('gif')) {
      finalExtension = 'gif';
    }
    
    const finalContentType = contentType;

    // Upload to Supabase Storage
    const supabase = getSupabaseClient();
    const bucketName = 'make-b14d984c-product-images';
    
    // Ensure bucket exists as PUBLIC (no signed URLs needed!)
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find(b => b.name === bucketName);
    
    console.log('📁 Bucket status:', {
      exists: !!bucket,
      isPublic: bucket?.public,
      bucketName,
    });
    
    if (!bucket) {
      console.log('📁 Creating PUBLIC storage bucket:', bucketName);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // ✅ PUBLIC BUCKET - no expiring signed URLs needed!
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (createError) {
        // Check if error is "already exists" - this is OK!
        if (createError.message?.includes('already exists') || createError.message?.includes('resource already exists')) {
          console.log('✅ Bucket already exists (race condition), continuing...');
        } else {
          console.error('❌ Failed to create bucket:', createError);
          // Continue anyway and try to upload
        }
      } else {
        console.log('✅ Created public bucket');
      }
    } else if (!bucket.public) {
      // Bucket exists but is private
      // We can't easily update it in Edge Functions, so we'll log a warning
      console.warn('⚠️ WARNING: Bucket exists but is PRIVATE. Images may not work in emails.');
      console.warn('⚠️ To fix: Delete the bucket in Supabase Dashboard and run this again.');
      console.warn('⚠️ Or manually make the bucket public in Supabase Dashboard > Storage.');
      // Continue with upload attempt anyway
    } else {
      console.log('✅ Bucket is already public');
    }

    // Upload the image with JPG extension for email compatibility
    const fileName = `${itemId}-${Date.now()}.${finalExtension}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, finalImageData, {
        contentType: finalContentType,
        upsert: true,
        cacheControl: '31536000', // Cache for 1 year
      });

    if (uploadError) {
      console.error('❌ Failed to upload image to storage:', uploadError);
      return imageUrl; // Return original URL as fallback
    }

    // Get PUBLIC URL (permanent, no expiration!)
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
      console.error('❌ Failed to get public URL');
      return imageUrl; // Return original URL as fallback
    }

    const finalUrl = publicUrlData.publicUrl;
    console.log('✅ Image hosted successfully:', finalUrl);
    console.log('✅ Testing URL accessibility...');
    
    // Test if the URL is actually accessible
    try {
      const testResponse = await fetch(finalUrl, { method: 'HEAD' });
      if (testResponse.ok) {
        console.log('✅ URL is publicly accessible!');
      } else {
        console.error('❌ URL returned status:', testResponse.status);
        console.error('❌ This means the bucket is NOT actually public!');
        console.error('❌ Falling back to original URL');
        return imageUrl;
      }
    } catch (testError) {
      console.error('❌ Failed to test URL accessibility:', testError);
      return imageUrl;
    }
    
    return finalUrl;

  } catch (error) {
    console.error('❌ Error downloading/hosting image:', error);
    console.error('❌ Failed URL:', imageUrl);
    return imageUrl; // Return original URL as fallback
  }
}

// Save or update customer selections
app.post('/save', async (c) => {
  try {
    const { 
      customerId,
      // Client information from Contentful
      clientEmail,
      clientImage,
      clientStylingIntake,
      assignedStylistId,
      stylistId, // Also accept stylistId (frontend sends this)
      clientName,
      // Stylist information
      stylistName,
      stylistImage,
      // Items and notes
      items,
      stylingNotes,
      intakeAnswers,
    } = await c.req.json();

    console.log('💾 ========== SAVING SELECTIONS ==========');
    console.log('💾 Customer ID:', customerId);
    console.log('💾 Client Email:', clientEmail);
    console.log('💾 Client Name:', clientName);
    console.log('💾 Assigned Stylist ID:', assignedStylistId || stylistId);
    console.log('💾 Stylist Name:', stylistName);
    console.log('💾 Styling Notes:', stylingNotes);
    console.log('💾 Styling Notes Type:', typeof stylingNotes);
    console.log('💾 Styling Notes Length:', stylingNotes?.length);
    console.log('💾 Styling Notes Trimmed:', stylingNotes?.trim());
    console.log('💾 Items count:', items?.length);
    console.log('💾 ==========================================');

    if (!customerId) {
      return c.json({ error: 'Customer ID is required' }, 400);
    }

    // ✅ USE IMAGES AS-IS - Don't process Contentful images
    const processedStylistImage = stylistImage;
    const processedClientImage = clientImage;

    // ✅ Download and host PRODUCT images (from Google Shopping, external sources)
    const processedItems = await Promise.all(
      (items || []).map(async (item: any, index: number) => {
        // Validate item has basic structure
        if (!item || typeof item !== 'object') {
          console.log(`⚠️ Item ${index + 1} is invalid (not an object)`);
          return null; // Skip invalid items
        }
        
        // If no image, return item as-is
        if (!item.image || typeof item.image !== 'string' || item.image.trim() === '') {
          console.log(`⚠️ Item ${index + 1} has no image or invalid image type`);
          return item;
        }
        
        // Skip if already hosted in Supabase
        const isAlreadyHosted = item.image.includes('supabase.co/storage');
        if (isAlreadyHosted) {
          console.log(`✅ Item ${index + 1} already hosted in Supabase, skipping`);
          return item;
        }
        
        // ✅ Download and host ALL external product images (Google Shopping, etc.)
        console.log(`🖼️ Downloading external product image for item ${index + 1}: ${item.title}`);
        console.log(`   URL: ${item.image}`);
        
        try {
          const hostedImageUrl = await downloadAndHostImage(
            item.image, 
            `${customerId}-item${index + 1}`
          );
          
          if (hostedImageUrl && hostedImageUrl !== item.image) {
            console.log(`✅ Successfully hosted item ${index + 1}: ${hostedImageUrl}`);
            return {
              ...item,
              image: hostedImageUrl,
              originalImageUrl: item.image,
            };
          } else {
            console.log(`⚠️ Using original URL for item ${index + 1}: ${item.image}`);
            return item;
          }
        } catch (error) {
          console.error(`❌ Failed to download item ${index + 1}:`, error);
          return item; // Use original URL on error
        }
      })
    );

    console.log('✅ Processed all images');

    // Store selection data with customer ID as key
    const selectionKey = `selection:${customerId}`;
    const selectionData = {
      customerId,
      // Client information from Contentful (with processed images)
      clientEmail,
      clientImage: processedClientImage,
      clientStylingIntake,
      assignedStylistId,
      clientName,
      // Stylist information (with processed image)
      stylistName,
      stylistImage: processedStylistImage,
      // Items (product name, price, product URL for each) with hosted images
      items: processedItems,
      // Styling notes from admin
      stylingNotes,
      // Intake answers
      intakeAnswers,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(selectionKey, selectionData);

    console.log('✅ Selections saved successfully for customer:', customerId);
    console.log('📦 Saved items:', processedItems?.length);
    console.log('📝 Styling notes:', stylingNotes);

    return c.json({
      success: true,
      message: `Saved ${processedItems?.length || 0} items for customer ${customerId}`,
      data: selectionData,
    });

  } catch (error: any) {
    console.error('❌ Error saving selections:', error);
    return c.json({
      error: error.message || 'Failed to save selections',
    }, 500);
  }
});

// Get selections for a customer
app.get('/get/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    
    console.log('📥 Fetching selections for customer:', customerId);

    if (!customerId) {
      return c.json({ error: 'Customer ID is required' }, 400);
    }

    const selectionKey = `selection:${customerId}`;
    const selectionData = await kv.get(selectionKey);

    if (!selectionData) {
      console.log('📭 No selections found for customer:', customerId);
      return c.json({
        success: true,
        data: null,
        message: 'No selections found',
      });
    }

    console.log('✅ Found selections for customer:', customerId);
    console.log('📦 Items count:', selectionData.items?.length);

    return c.json({
      success: true,
      data: selectionData,
    });

  } catch (error: any) {
    console.error('❌ Error fetching selections:', error);
    return c.json({
      error: error.message || 'Failed to fetch selections',
    }, 500);
  }
});

// Delete selections for a customer
app.delete('/delete/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    
    console.log('🗑️ Deleting selections for customer:', customerId);

    if (!customerId) {
      return c.json({ error: 'Customer ID is required' }, 400);
    }

    const selectionKey = `selection:${customerId}`;
    await kv.del(selectionKey);

    console.log('✅ Deleted selections for customer:', customerId);

    return c.json({
      success: true,
      message: `Deleted selections for customer ${customerId}`,
    });

  } catch (error: any) {
    console.error('❌ Error deleting selections:', error);
    return c.json({
      error: error.message || 'Failed to delete selections',
    }, 500);
  }
});

// Test endpoint to check bucket status and image accessibility
app.get('/test-bucket', async (c) => {
  try {
    const supabase = getSupabaseClient();
    const bucketName = 'make-b14d984c-product-images';
    
    console.log('🧪 Testing bucket configuration...');
    
    // Check bucket status
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find(b => b.name === bucketName);
    
    if (!bucket) {
      return c.json({
        error: 'Bucket does not exist',
        bucketName,
      }, 404);
    }
    
    console.log('📁 Bucket found:', bucket);
    
    // List files in bucket
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list('', { limit: 5 });
    
    if (listError) {
      console.error('❌ Error listing files:', listError);
    }
    
    // Test a few image URLs
    const testResults = [];
    if (files && files.length > 0) {
      for (const file of files.slice(0, 3)) {
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.name);
        
        const testUrl = urlData?.publicUrl;
        
        // Test accessibility
        let accessible = false;
        let status = 0;
        try {
          const response = await fetch(testUrl, { method: 'HEAD' });
          status = response.status;
          accessible = response.ok;
        } catch (e) {
          console.error('Failed to test URL:', e);
        }
        
        testResults.push({
          fileName: file.name,
          url: testUrl,
          accessible,
          status,
        });
      }
    }
    
    return c.json({
      bucket: {
        name: bucket.name,
        public: bucket.public,
        id: bucket.id,
      },
      filesCount: files?.length || 0,
      sampleFiles: files?.slice(0, 5).map(f => f.name) || [],
      urlTests: testResults,
    });
    
  } catch (error: any) {
    console.error('❌ Error testing bucket:', error);
    return c.json({
      error: error.message || 'Failed to test bucket',
    }, 500);
  }
});

// MIGRATION ENDPOINT: Re-host all images for a customer
app.post('/migrate-images/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    
    console.log('🔄 ========== MIGRATING IMAGES ==========');
    console.log('🔄 Customer ID:', customerId);

    if (!customerId) {
      return c.json({ error: 'Customer ID is required' }, 400);
    }

    const selectionKey = `selection:${customerId}`;
    const selectionData = await kv.get(selectionKey);

    if (!selectionData) {
      return c.json({ error: 'No selections found for this customer' }, 404);
    }

    console.log('📦 Found', selectionData.items?.length, 'items to process');

    // Re-process items to download and host images
    const processedItems = await Promise.all(
      (selectionData.items || []).map(async (item: any, index: number) => {
        if (!item.image) {
          console.log(`⚠️ Item ${index + 1} has no image, skipping`);
          return item;
        }

        // Determine source URL for re-hosting:
        // 1. If originalImageUrl exists, use it (it's the Google Shopping URL)
        // 2. Otherwise, use current image URL
        const sourceUrl = item.originalImageUrl || item.image;
        
        // Check if source is an external URL that needs hosting
        const isSupabaseUrl = sourceUrl.includes('supabase.co/storage');
        const isContentfulUrl = sourceUrl.includes('images.ctfassets.net');
        
        if (isSupabaseUrl) {
          // This is a deleted Supabase URL - can't re-download
          console.log(`❌ Item ${index + 1} has broken Supabase URL and no original URL saved`);
          return item;
        }
        
        if (isContentfulUrl) {
          // Contentful images work fine, no need to re-host
          console.log(`✅ Item ${index + 1} uses Contentful, no re-hosting needed`);
          return item;
        }

        // For external URLs (Google Shopping, etc.), download and host
        console.log(`🖼️ Re-hosting external image for item ${index + 1}: ${item.title}`);
        console.log(`   Source URL: ${sourceUrl}`);
        
        const hostedImageUrl = await downloadAndHostImage(
          sourceUrl,
          `${customerId}-item${index + 1}`
        );
        
        const finalUrl = hostedImageUrl || sourceUrl;
        console.log(`   New URL: ${finalUrl}`);
        
        return {
          ...item,
          image: finalUrl,
          originalImageUrl: sourceUrl, // Keep track of original URL
        };
      })
    );

    console.log('✅ Processed all images');

    // Update the selection data with new image URLs
    const updatedData = {
      ...selectionData,
      items: processedItems,
      migratedAt: new Date().toISOString(),
    };

    await kv.set(selectionKey, updatedData);

    console.log('✅ Migration complete for customer:', customerId);
    console.log('🔄 ==========================================');

    return c.json({
      success: true,
      message: `Migrated ${processedItems.length} items`,
      data: updatedData,
    });

  } catch (error: any) {
    console.error('❌ Error migrating images:', error);
    return c.json({
      error: error.message || 'Failed to migrate images',
    }, 500);
  }
});

// FIX BUCKET: Delete and recreate as public (ONE-TIME FIX)
app.post('/fix-bucket', async (c) => {
  try {
    console.log('🔧 ========== FIXING BUCKET ==========');
    
    const supabase = getSupabaseClient();
    const bucketName = 'make-b14d984c-product-images';

    // Step 1: Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find(b => b.name === bucketName);
    
    if (bucket) {
      console.log('📁 Bucket exists:', {
        name: bucket.name,
        isPublic: bucket.public,
      });

      if (bucket.public) {
        console.log('✅ Bucket is already public!');
        
        // Test by uploading a test image
        console.log('🧪 Testing bucket with a test upload...');
        const testData = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // Fake JPEG header
        const testFileName = `test-${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(testFileName, testData, {
            contentType: 'image/jpeg',
            upsert: true,
          });
        
        if (uploadError) {
          console.error('❌ Test upload failed:', uploadError);
          return c.json({
            success: false,
            message: 'Bucket is public but uploads are failing!',
            error: uploadError.message,
          }, 500);
        }
        
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(testFileName);
        
        console.log('✅ Test upload successful! Public URL:', urlData.publicUrl);
        
        // Clean up test file
        await supabase.storage.from(bucketName).remove([testFileName]);
        
        return c.json({
          success: true,
          message: 'Bucket is already public and working! Now click "Re-host Images" to update your existing items.',
          testUrl: urlData.publicUrl,
        });
      }

      // Bucket exists but is private - provide manual instructions
      console.log('❌ Bucket is PRIVATE. Cannot be deleted programmatically.');
      return c.json({
        error: 'Bucket is private',
        message: 'Please make the bucket PUBLIC in Supabase Dashboard > Storage > Bucket Settings',
        bucketName,
      }, 400);
    } else {
      console.log('📁 Bucket does not exist, creating new PUBLIC bucket...');
      
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
      });
      
      if (createError) {
        console.error('❌ Failed to create bucket:', createError);
        return c.json({
          error: 'Failed to create bucket',
          details: createError.message,
        }, 500);
      }

      console.log('✅ Created new PUBLIC bucket');
    }

    console.log(' ==========================================');

    return c.json({
      success: true,
      message: 'Bucket is ready! Now click "Re-host Images" to update your items.',
    });

  } catch (error: any) {
    console.error('❌ Error fixing bucket:', error);
    return c.json({
      error: error.message || 'Failed to fix bucket',
    }, 500);
  }
});

export default app;
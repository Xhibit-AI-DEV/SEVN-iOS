import { Hono } from "npm:hono";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Get Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Create or update user profile
app.post('/', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const { name, bio, profile_photo_url, external_link, location } = await c.req.json();
    
    console.log('📝 Creating/updating profile for user:', user.id);
    
    const profileKey = `profile:${user.id}`;
    const existingProfile = await kv.get(profileKey);
    
    const profile = {
      user_id: user.id,
      name: name || existingProfile?.name || '',
      bio: bio || existingProfile?.bio || '',
      profile_photo_url: profile_photo_url || existingProfile?.profile_photo_url || '',
      external_link: external_link || existingProfile?.external_link || '',
      location: location || existingProfile?.location || '',
      created_edits: existingProfile?.created_edits || [],
      liked_edits: existingProfile?.liked_edits || [],
      followers_count: existingProfile?.followers_count || 0,
      following_count: existingProfile?.following_count || 0,
      created_at: existingProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(profileKey, profile);
    
    console.log('✅ Profile saved successfully');
    
    return c.json({ success: true, profile });
  } catch (error: any) {
    console.error('❌ Error saving profile:', error);
    return c.json({ error: error.message || 'Failed to save profile' }, 500);
  }
});

// Get user profile by username
app.get('/username/:username', async (c) => {
  try {
    const { username } = c.req.param();
    
    console.log('📋 Fetching profile for user_id:', username);
    
    // Get all profiles and find the one with matching user_id (formerly username)
    const allProfiles = await kv.getByPrefix('profile:');
    const profile = allProfiles.find((p: any) => p && (p.user_id === username || p.username === username));
    
    if (!profile) {
      return c.json({ 
        error: 'Profile not found'
      }, 404);
    }
    
    return c.json({ profile });
  } catch (error: any) {
    console.error('❌ Error fetching profile by user_id:', error);
    return c.json({ error: error.message || 'Failed to fetch profile' }, 500);
  }
});

// Get current user's profile (using access token)
app.get('/me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    console.log('📋 Fetching profile for current user:', user.id);
    
    const profileKey = `profile:${user.id}`;
    const profile = await kv.get(profileKey);
    
    if (!profile) {
      // Return a basic profile with just the user_id
      return c.json({ 
        profile: {
          user_id: user.id,
          username: null,
          display_name: null,
          bio: null,
          avatar_url: null,
          website_url: null,
          created_edits: [],
          liked_edits: [],
          followers_count: 0,
          following_count: 0,
        }
      });
    }
    
    return c.json({ profile });
  } catch (error: any) {
    console.error('❌ Error fetching current user profile:', error);
    return c.json({ error: error.message || 'Failed to fetch profile' }, 500);
  }
});

// Get user profile
app.get('/:userId', async (c) => {
  try {
    const { userId } = c.req.param();
    
    console.log('📋 Fetching profile for user:', userId);
    
    const profileKey = `profile:${userId}`;
    const profile = await kv.get(profileKey);
    
    if (!profile) {
      return c.json({ 
        error: 'Profile not found',
        profile: {
          user_id: userId,
          name: '',
          bio: '',
          profile_photo_url: '',
          external_link: '',
          location: '',
          created_edits: [],
          liked_edits: [],
          followers_count: 0,
          following_count: 0,
        }
      }, 404);
    }
    
    return c.json({ profile });
  } catch (error: any) {
    console.error('❌ Error fetching profile:', error);
    return c.json({ error: error.message || 'Failed to fetch profile' }, 500);
  }
});

// Update user profile (PUT)
app.put('/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const { userId } = c.req.param();
    
    // Verify user is updating their own profile
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const { display_name, user_id, bio, website_url, avatar_url } = await c.req.json();
    
    console.log('📝 Updating profile for user:', user.id);
    console.log('📝 New username:', user_id);
    
    const profileKey = `profile:${user.id}`;
    const existingProfile = await kv.get(profileKey);
    
    // Sanitize and validate username if provided (backend calls it user_id for legacy reasons)
    let sanitizedUsername = user_id !== undefined ? user_id : (existingProfile?.username || existingProfile?.user_id || '');
    
    if (user_id !== undefined) {
      // Remove spaces and convert to lowercase
      sanitizedUsername = user_id.trim().replace(/\s+/g, '').toLowerCase();
      
      // Validate format
      if (!sanitizedUsername) {
        return c.json({ error: 'Username cannot be empty' }, 400);
      }
      
      if (sanitizedUsername.includes(' ')) {
        return c.json({ error: 'Username cannot contain spaces' }, 400);
      }
      
      // Check if username is already taken by another user (only if changing)
      if (sanitizedUsername !== existingProfile?.username && sanitizedUsername !== existingProfile?.user_id) {
        const allProfiles = await kv.getByPrefix('profile:');
        const duplicate = allProfiles.find((p: any) => 
          p && 
          p.auth_user_id !== user.id && 
          (p.username === sanitizedUsername || p.user_id === sanitizedUsername)
        );
        
        if (duplicate) {
          console.log('❌ Username already taken:', sanitizedUsername);
          return c.json({ error: 'This username is already taken' }, 400);
        }
      }
    }
    
    const profile = {
      auth_user_id: user.id, // Keep the Supabase Auth UUID for internal use (NEVER editable)
      username: sanitizedUsername, // Editable username/handle
      user_id: sanitizedUsername, // DEPRECATED: Keep for backward compatibility, same as username
      display_name: display_name !== undefined ? display_name : (existingProfile?.display_name || ''),
      bio: bio !== undefined ? bio : (existingProfile?.bio || ''),
      avatar_url: avatar_url !== undefined ? avatar_url : (existingProfile?.avatar_url || ''),
      website_url: website_url !== undefined ? website_url : (existingProfile?.website_url || ''),
      created_edits: existingProfile?.created_edits || [],
      liked_edits: existingProfile?.liked_edits || [],
      followers_count: existingProfile?.followers_count || 0,
      following_count: existingProfile?.following_count || 0,
      created_at: existingProfile?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(profileKey, profile);
    
    console.log('✅ Profile updated successfully with username:', profile.username);
    
    return c.json({ success: true, profile });
  } catch (error: any) {
    console.error('❌ Error updating profile:', error);
    return c.json({ error: error.message || 'Failed to update profile' }, 500);
  }
});

// Upload avatar
app.post('/:userId/avatar', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const { userId } = c.req.param();
    
    // Verify user is updating their own profile
    if (user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const formData = await c.req.formData();
    const avatarFile = formData.get('avatar') as File;

    if (!avatarFile) {
      return c.json({ error: 'No avatar file provided' }, 400);
    }

    console.log('📤 Uploading avatar for user:', user.id);

    // Create bucket if it doesn't exist
    const bucketName = 'make-b14d984c-avatars';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (bucketError) {
        console.error('❌ Error creating bucket:', bucketError);
        throw new Error('Failed to create storage bucket');
      }
    }

    // Upload file
    const fileName = `${user.id}-${Date.now()}.${avatarFile.name.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.error('❌ Error uploading avatar:', uploadError);
      throw new Error('Failed to upload avatar');
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (!urlData?.signedUrl) {
      throw new Error('Failed to get avatar URL');
    }

    console.log('✅ Avatar uploaded successfully');

    return c.json({ 
      success: true, 
      avatar_url: urlData.signedUrl 
    });
  } catch (error: any) {
    console.error('❌ Error uploading avatar:', error);
    return c.json({ error: error.message || 'Failed to upload avatar' }, 500);
  }
});

// Update username endpoint
app.post('/update-username', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const { username } = await c.req.json();
    
    if (!username || typeof username !== 'string') {
      return c.json({ error: 'Username is required' }, 400);
    }

    console.log('📝 Updating username for user:', user.id, 'to:', username);
    
    const profileKey = `profile:${user.id}`;
    const existingProfile = await kv.get(profileKey);
    
    if (!existingProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...existingProfile,
      username: username.trim(),
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(profileKey, updatedProfile);
    
    // Also update customer record
    const customerKey = `customer:${user.id}`;
    const existingCustomer = await kv.get(customerKey);
    if (existingCustomer) {
      await kv.set(customerKey, {
        ...existingCustomer,
        username: username.trim(),
      });
    }
    
    console.log('✅ Username updated successfully to:', username);
    
    return c.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    console.error('❌ Error updating username:', error);
    return c.json({ error: error.message || 'Failed to update username' }, 500);
  }
});

export default app;
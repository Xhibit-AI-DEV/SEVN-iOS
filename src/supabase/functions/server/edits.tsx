import { Hono } from "npm:hono";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Get public anon key from environment
const publicAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

// Get Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Create a new edit
app.post('/', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log('❌ Edit creation auth error:', authError?.message);
      
      // Check if it's a JWT expired error
      if (authError?.message?.includes('JWT') || authError?.message?.includes('expired')) {
        return c.json({ 
          code: 401,
          message: 'Your session has expired. Please sign in again.',
          error: 'JWT_EXPIRED',
          hint: 'Token has expired. Please refresh the page and sign in again.'
        }, 401);
      }
      
      return c.json({ 
        code: 401,
        message: 'Invalid or expired token',
        error: authError?.message || 'Authentication failed'
      }, 401);
    }

    const { 
      media_url, 
      media_type, // 'image' or 'video'
      description, 
      tags, 
      external_link,
      product_links, // array of product objects
      is_public 
    } = await c.req.json();
    
    if (!media_url || !media_type) {
      return c.json({ error: 'Media URL and type are required' }, 400);
    }

    if (product_links && product_links.length > 40) {
      return c.json({ error: 'Maximum 40 product links allowed' }, 400);
    }
    
    console.log('📝 Creating edit for user:', user.id);
    
    // Get user's profile for creator name
    const profileKey = `profile:${user.id}`;
    let profile = await kv.get(profileKey);
    
    if (!profile) {
      profile = {
        user_id: user.id,
        display_name: '',
        created_edits: [],
        liked_edits: [],
      };
    }
    
    // Generate unique edit ID
    const editId = `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const edit = {
      id: editId,
      user_id: user.id,
      creator_name: profile.display_name || '',
      media_url,
      media_type,
      description: description || '',
      tags: tags || [],
      external_link: external_link || '',
      product_links: product_links || [],
      is_public: is_public !== false, // default to true
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Save edit
    const editKey = `edit:${editId}`;
    await kv.set(editKey, edit);
    
    // Add to user's created edits list
    profile.created_edits = profile.created_edits || [];
    profile.created_edits.unshift(editId); // Add to beginning
    profile.updated_at = new Date().toISOString();
    
    await kv.set(profileKey, profile);
    
    console.log('✅ Edit created successfully:', editId);
    
    return c.json({ success: true, edit });
  } catch (error: any) {
    console.error('❌ Error creating edit:', error);
    return c.json({ error: error.message || 'Failed to create edit' }, 500);
  }
});

// Get a specific edit
app.get('/:editId', async (c) => {
  try {
    const { editId } = c.req.param();
    
    console.log('📋 Fetching edit:', editId);
    
    const editKey = `edit:${editId}`;
    const edit = await kv.get(editKey);
    
    if (!edit) {
      return c.json({ error: 'Edit not found' }, 404);
    }
    
    // Check if the requesting user has liked this edit (if authenticated)
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (accessToken && accessToken !== publicAnonKey) {
      try {
        const supabase = getSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
        
        if (!authError && user) {
          // Check if this user has liked the edit
          const likeKey = `edit_like:${user.id}:${editId}`;
          const like = await kv.get(likeKey);
          edit.is_liked = !!like;
          console.log(`✅ User ${user.id} has ${like ? 'liked' : 'not liked'} this edit`);
        }
      } catch (err) {
        console.log('⚠️ Could not check like status:', err);
        edit.is_liked = false;
      }
    } else {
      edit.is_liked = false;
    }
    
    return c.json({ edit });
  } catch (error: any) {
    console.error('❌ Error fetching edit:', error);
    return c.json({ error: error.message || 'Failed to fetch edit' }, 500);
  }
});

// Update an edit
app.put('/:editId', async (c) => {
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

    const { editId } = c.req.param();
    const editKey = `edit:${editId}`;
    const existingEdit = await kv.get(editKey);
    
    if (!existingEdit) {
      return c.json({ error: 'Edit not found' }, 404);
    }
    
    // Check ownership
    if (existingEdit.user_id !== user.id) {
      return c.json({ error: 'Unauthorized to edit this content' }, 403);
    }
    
    const updates = await c.req.json();
    
    const updatedEdit = {
      ...existingEdit,
      description: updates.description ?? existingEdit.description,
      tags: updates.tags ?? existingEdit.tags,
      external_link: updates.external_link ?? existingEdit.external_link,
      product_links: updates.product_links ?? existingEdit.product_links,
      is_public: updates.is_public ?? existingEdit.is_public,
      updated_at: new Date().toISOString(),
    };
    
    await kv.set(editKey, updatedEdit);
    
    console.log('✅ Edit updated successfully:', editId);
    
    return c.json({ success: true, edit: updatedEdit });
  } catch (error: any) {
    console.error('❌ Error updating edit:', error);
    return c.json({ error: error.message || 'Failed to update edit' }, 500);
  }
});

// Delete an edit
app.delete('/:editId', async (c) => {
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

    const { editId } = c.req.param();
    const editKey = `edit:${editId}`;
    const edit = await kv.get(editKey);
    
    if (!edit) {
      return c.json({ error: 'Edit not found' }, 404);
    }
    
    // Check ownership
    if (edit.user_id !== user.id) {
      return c.json({ error: 'Unauthorized to delete this content' }, 403);
    }
    
    // Remove from profile
    const profileKey = `profile:${user.id}`;
    const profile = await kv.get(profileKey);
    
    if (profile && profile.created_edits) {
      profile.created_edits = profile.created_edits.filter((id: string) => id !== editId);
      profile.updated_at = new Date().toISOString();
      await kv.set(profileKey, profile);
    }
    
    // Delete edit
    await kv.del(editKey);
    
    console.log('✅ Edit deleted successfully:', editId);
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting edit:', error);
    return c.json({ error: error.message || 'Failed to delete edit' }, 500);
  }
});

// Get user's created edits
app.get('/user/:userId', async (c) => {
  try {
    const { userId } = c.req.param();
    
    console.log('📋 Fetching edits for user:', userId);
    
    const profileKey = `profile:${userId}`;
    const profile = await kv.get(profileKey);
    
    if (!profile || !profile.created_edits || profile.created_edits.length === 0) {
      return c.json({ edits: [], count: 0 });
    }
    
    // Get full details for each edit
    const edits = [];
    for (const editId of profile.created_edits) {
      const editKey = `edit:${editId}`;
      const edit = await kv.get(editKey);
      if (edit) {
        edits.push(edit);
      }
    }
    
    console.log('✅ Returning', edits.length, 'edits');
    
    return c.json({ edits, count: edits.length });
  } catch (error: any) {
    console.error('❌ Error fetching user edits:', error);
    return c.json({ error: error.message || 'Failed to fetch edits' }, 500);
  }
});

// Like an edit
app.post('/:editId/like', async (c) => {
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

    const { editId } = c.req.param();
    
    console.log('❤️ Liking edit:', editId, 'by user:', user.id);
    
    // Check if edit exists
    const editKey = `edit:${editId}`;
    const edit = await kv.get(editKey);
    
    if (!edit) {
      return c.json({ error: 'Edit not found' }, 404);
    }
    
    // Store like
    const likeKey = `edit_like:${user.id}:${editId}`;
    const existingLike = await kv.get(likeKey);
    
    if (existingLike) {
      return c.json({ message: 'Already liked' }, 200);
    }
    
    await kv.set(likeKey, {
      user_id: user.id,
      edit_id: editId,
      liked_at: new Date().toISOString(),
    });
    
    // Update edit likes count
    edit.likes_count = (edit.likes_count || 0) + 1;
    await kv.set(editKey, edit);
    
    // Add to user's liked edits
    const profileKey = `profile:${user.id}`;
    const profile = await kv.get(profileKey) || {
      user_id: user.id,
      created_edits: [],
      liked_edits: [],
    };
    
    profile.liked_edits = profile.liked_edits || [];
    if (!profile.liked_edits.includes(editId)) {
      profile.liked_edits.unshift(editId);
      await kv.set(profileKey, profile);
    }
    
    console.log('✅ Edit liked successfully');
    
    return c.json({ success: true, likes_count: edit.likes_count });
  } catch (error: any) {
    console.error('❌ Error liking edit:', error);
    return c.json({ error: error.message || 'Failed to like edit' }, 500);
  }
});

// Unlike an edit
app.post('/:editId/unlike', async (c) => {
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

    const { editId } = c.req.param();
    
    console.log('💔 Unliking edit:', editId, 'by user:', user.id);
    
    // Remove like
    const likeKey = `edit_like:${user.id}:${editId}`;
    await kv.del(likeKey);
    
    // Update edit likes count
    const editKey = `edit:${editId}`;
    const edit = await kv.get(editKey);
    
    if (edit) {
      edit.likes_count = Math.max(0, (edit.likes_count || 0) - 1);
      await kv.set(editKey, edit);
    }
    
    // Remove from user's liked edits
    const profileKey = `profile:${user.id}`;
    const profile = await kv.get(profileKey);
    
    if (profile && profile.liked_edits) {
      profile.liked_edits = profile.liked_edits.filter((id: string) => id !== editId);
      await kv.set(profileKey, profile);
    }
    
    console.log('✅ Edit unliked successfully');
    
    return c.json({ success: true, likes_count: edit?.likes_count || 0 });
  } catch (error: any) {
    console.error('❌ Error unliking edit:', error);
    return c.json({ error: error.message || 'Failed to unlike edit' }, 500);
  }
});

// Get liked edits for a user
app.get('/liked/:userId', async (c) => {
  try {
    const { userId } = c.req.param();
    
    console.log('📋 Fetching liked edits for user:', userId);
    
    const profileKey = `profile:${userId}`;
    const profile = await kv.get(profileKey);
    
    if (!profile || !profile.liked_edits || profile.liked_edits.length === 0) {
      return c.json({ edits: [], count: 0 });
    }
    
    // Get full details for each liked edit
    const edits = [];
    for (const editId of profile.liked_edits) {
      const editKey = `edit:${editId}`;
      const edit = await kv.get(editKey);
      if (edit) {
        edits.push(edit);
      }
    }
    
    console.log('✅ Returning', edits.length, 'liked edits');
    
    return c.json({ edits, count: edits.length });
  } catch (error: any) {
    console.error('❌ Error fetching liked edits:', error);
    return c.json({ error: error.message || 'Failed to fetch liked edits' }, 500);
  }
});

// Check if user has liked an edit
app.get('/:editId/liked-by/:userId', async (c) => {
  try {
    const { editId, userId } = c.req.param();
    
    const likeKey = `edit_like:${userId}:${editId}`;
    const like = await kv.get(likeKey);
    
    return c.json({ isLiked: !!like });
  } catch (error: any) {
    console.error('❌ Error checking edit like:', error);
    return c.json({ error: error.message || 'Failed to check like' }, 500);
  }
});

export default app;
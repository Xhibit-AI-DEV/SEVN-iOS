import { Hono } from "npm:hono";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Get Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
};

// Follow a user
app.post('/:targetUserId', async (c) => {
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

    const { targetUserId } = c.req.param();
    
    // Can't follow yourself
    if (user.id === targetUserId) {
      return c.json({ error: 'Cannot follow yourself' }, 400);
    }

    console.log(`👥 User ${user.id} following ${targetUserId}`);
    
    // Get both profiles
    const currentUserProfileKey = `profile:${user.id}`;
    const targetUserProfileKey = `profile:${targetUserId}`;
    
    const [currentUserProfile, targetUserProfile] = await Promise.all([
      kv.get(currentUserProfileKey),
      kv.get(targetUserProfileKey)
    ]);
    
    if (!targetUserProfile) {
      return c.json({ error: 'Target user not found' }, 404);
    }
    
    if (!currentUserProfile) {
      return c.json({ error: 'Your profile not found. Please complete signup first.' }, 404);
    }
    
    // Initialize following/followers arrays if they don't exist
    currentUserProfile.following = currentUserProfile.following || [];
    targetUserProfile.followers = targetUserProfile.followers || [];
    
    // Check if already following
    if (currentUserProfile.following.includes(targetUserId)) {
      return c.json({ error: 'Already following this user' }, 400);
    }
    
    // Add to following list
    currentUserProfile.following.push(targetUserId);
    currentUserProfile.following_count = currentUserProfile.following.length;
    currentUserProfile.updated_at = new Date().toISOString();
    
    // Add to followers list
    targetUserProfile.followers.push(user.id);
    targetUserProfile.followers_count = targetUserProfile.followers.length;
    targetUserProfile.updated_at = new Date().toISOString();
    
    // Save both profiles
    await Promise.all([
      kv.set(currentUserProfileKey, currentUserProfile),
      kv.set(targetUserProfileKey, targetUserProfile)
    ]);
    
    console.log(`✅ Follow successful - ${user.id} -> ${targetUserId}`);
    
    return c.json({ 
      success: true,
      follower_count: targetUserProfile.followers_count,
      following_count: currentUserProfile.following_count,
    });
  } catch (error: any) {
    console.error('❌ Error following user:', error);
    return c.json({ error: error.message || 'Failed to follow user' }, 500);
  }
});

// Unfollow a user
app.delete('/:targetUserId', async (c) => {
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

    const { targetUserId } = c.req.param();

    console.log(`👥 User ${user.id} unfollowing ${targetUserId}`);
    
    // Get both profiles
    const currentUserProfileKey = `profile:${user.id}`;
    const targetUserProfileKey = `profile:${targetUserId}`;
    
    const [currentUserProfile, targetUserProfile] = await Promise.all([
      kv.get(currentUserProfileKey),
      kv.get(targetUserProfileKey)
    ]);
    
    if (!targetUserProfile) {
      return c.json({ error: 'Target user not found' }, 404);
    }
    
    if (!currentUserProfile) {
      return c.json({ error: 'Your profile not found. Please complete signup first.' }, 404);
    }
    
    // Initialize following/followers arrays if they don't exist
    currentUserProfile.following = currentUserProfile.following || [];
    targetUserProfile.followers = targetUserProfile.followers || [];
    
    // Remove from following list
    const wasFollowing = currentUserProfile.following.includes(targetUserId);
    currentUserProfile.following = currentUserProfile.following.filter((id: string) => id !== targetUserId);
    currentUserProfile.following_count = currentUserProfile.following.length;
    currentUserProfile.updated_at = new Date().toISOString();
    
    // Remove from followers list
    targetUserProfile.followers = targetUserProfile.followers.filter((id: string) => id !== user.id);
    targetUserProfile.followers_count = targetUserProfile.followers.length;
    targetUserProfile.updated_at = new Date().toISOString();
    
    // Save both profiles
    await Promise.all([
      kv.set(currentUserProfileKey, currentUserProfile),
      kv.set(targetUserProfileKey, targetUserProfile)
    ]);
    
    console.log(`✅ Unfollow successful - ${user.id} -> ${targetUserId} (was following: ${wasFollowing})`);
    
    return c.json({ 
      success: true,
      follower_count: targetUserProfile.followers_count,
      following_count: currentUserProfile.following_count,
    });
  } catch (error: any) {
    console.error('❌ Error unfollowing user:', error);
    return c.json({ error: error.message || 'Failed to unfollow user' }, 500);
  }
});

// Check if current user is following a target user
app.get('/check/:targetUserId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ is_following: false });
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ is_following: false });
    }

    const { targetUserId } = c.req.param();
    
    const currentUserProfileKey = `profile:${user.id}`;
    const currentUserProfile = await kv.get(currentUserProfileKey);
    
    const following = currentUserProfile?.following || [];
    const isFollowing = following.includes(targetUserId);
    
    return c.json({ is_following: isFollowing });
  } catch (error: any) {
    console.error('❌ Error checking follow status:', error);
    return c.json({ is_following: false });
  }
});

export default app;
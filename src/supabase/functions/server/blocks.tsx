import { Hono } from "npm:hono";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Get blocked users for a user
app.get("/", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('Auth error while getting blocked users:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('📋 Getting blocked users for:', user.id);

    // Get blocked user IDs
    const blocksKey = `blocks:${user.id}`;
    const blocksData = await kv.get(blocksKey) || { blocked_users: [] };
    
    // Get profile info for each blocked user
    const blockedUsers = await Promise.all(
      blocksData.blocked_users.map(async (blockedUserId: string) => {
        const profile = await kv.get(`profile:${blockedUserId}`);
        return {
          id: blockedUserId,
          username: profile?.username || 'Unknown User',
          avatar_url: profile?.avatar_url || null,
        };
      })
    );

    console.log('✅ Found', blockedUsers.length, 'blocked users');

    return c.json({ blocked_users: blockedUsers });
  } catch (error: any) {
    console.error('❌ Error getting blocked users:', error);
    return c.json({ error: error.message || 'Failed to get blocked users' }, 500);
  }
});

// Block a user
app.post("/block", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('Auth error while blocking user:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { blocked_user_id } = await c.req.json();

    if (!blocked_user_id) {
      return c.json({ error: 'blocked_user_id is required' }, 400);
    }

    if (blocked_user_id === user.id) {
      return c.json({ error: 'You cannot block yourself' }, 400);
    }

    console.log('🚫 Blocking user:', blocked_user_id, 'by:', user.id);

    // Get or create blocks record
    const blocksKey = `blocks:${user.id}`;
    const blocksData = await kv.get(blocksKey) || { blocked_users: [] };

    // Check if already blocked
    if (blocksData.blocked_users.includes(blocked_user_id)) {
      return c.json({ 
        success: true, 
        message: 'User already blocked' 
      });
    }

    // Add to blocked list
    blocksData.blocked_users.push(blocked_user_id);
    blocksData.updated_at = new Date().toISOString();

    await kv.set(blocksKey, blocksData);

    // Also unfollow the user if following
    const followKey = `follows:${user.id}`;
    const followData = await kv.get(followKey);
    
    if (followData && followData.following && followData.following.includes(blocked_user_id)) {
      followData.following = followData.following.filter((id: string) => id !== blocked_user_id);
      followData.following_count = followData.following.length;
      await kv.set(followKey, followData);

      // Update the blocked user's follower count
      const blockedUserFollowKey = `follows:${blocked_user_id}`;
      const blockedUserFollowData = await kv.get(blockedUserFollowKey);
      
      if (blockedUserFollowData && blockedUserFollowData.followers) {
        blockedUserFollowData.followers = blockedUserFollowData.followers.filter((id: string) => id !== user.id);
        blockedUserFollowData.followers_count = blockedUserFollowData.followers.length;
        await kv.set(blockedUserFollowKey, blockedUserFollowData);
      }
    }

    console.log('✅ User blocked successfully');

    return c.json({ 
      success: true, 
      message: 'User blocked successfully' 
    });
  } catch (error: any) {
    console.error('❌ Error blocking user:', error);
    return c.json({ error: error.message || 'Failed to block user' }, 500);
  }
});

// Unblock a user
app.post("/unblock", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user) {
      console.error('Auth error while unblocking user:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { blocked_user_id } = await c.req.json();

    if (!blocked_user_id) {
      return c.json({ error: 'blocked_user_id is required' }, 400);
    }

    console.log('✅ Unblocking user:', blocked_user_id, 'by:', user.id);

    // Get blocks record
    const blocksKey = `blocks:${user.id}`;
    const blocksData = await kv.get(blocksKey) || { blocked_users: [] };

    // Remove from blocked list
    blocksData.blocked_users = blocksData.blocked_users.filter(
      (id: string) => id !== blocked_user_id
    );
    blocksData.updated_at = new Date().toISOString();

    await kv.set(blocksKey, blocksData);

    console.log('✅ User unblocked successfully');

    return c.json({ 
      success: true, 
      message: 'User unblocked successfully' 
    });
  } catch (error: any) {
    console.error('❌ Error unblocking user:', error);
    return c.json({ error: error.message || 'Failed to unblock user' }, 500);
  }
});

export default app;

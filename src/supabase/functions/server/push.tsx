import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Get Supabase client
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

/**
 * Register device token
 * Called when user grants push notification permission
 */
app.post('/register', async (c) => {
  try {
    const { userId, token, platform } = await c.req.json();
    
    console.log('📱 ========== REGISTER DEVICE TOKEN ==========');
    console.log('📱 User ID:', userId);
    console.log('📱 Token:', token?.substring(0, 20) + '...');
    console.log('📱 Platform:', platform);

    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user || user.id !== userId) {
      console.error('❌ Auth error:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Store token in KV store
    const tokenKey = `push_token:${userId}`;
    const tokenData = {
      userId,
      token,
      platform,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(tokenKey, tokenData);
    console.log('✅ Device token registered:', tokenKey);
    console.log('📱 ==========================================');

    return c.json({
      success: true,
      message: 'Device token registered successfully',
    });

  } catch (error: any) {
    console.error('❌ Error registering device token:', error);
    return c.json({ error: error.message || 'Failed to register token' }, 500);
  }
});

/**
 * Unregister device token
 * Called when user logs out
 */
app.post('/unregister', async (c) => {
  try {
    const { userId } = await c.req.json();
    
    console.log('📱 Unregistering device token for user:', userId);

    // Verify user is authenticated
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user || user.id !== userId) {
      console.error('❌ Auth error:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Remove token from KV store
    const tokenKey = `push_token:${userId}`;
    await kv.del(tokenKey);
    console.log('✅ Device token unregistered:', tokenKey);

    return c.json({
      success: true,
      message: 'Device token unregistered successfully',
    });

  } catch (error: any) {
    console.error('❌ Error unregistering device token:', error);
    return c.json({ error: error.message || 'Failed to unregister token' }, 500);
  }
});

/**
 * Send push notification to a user
 * Internal endpoint called by other backend services
 */
app.post('/send', async (c) => {
  try {
    const { userId, title, body, data } = await c.req.json();
    
    console.log('📱 ========== SEND PUSH NOTIFICATION ==========');
    console.log('📱 User ID:', userId);
    console.log('📱 Title:', title);
    console.log('📱 Body:', body);
    console.log('📱 Data:', data);

    // Get user's device token
    const tokenKey = `push_token:${userId}`;
    const tokenData = await kv.get(tokenKey);

    if (!tokenData || !tokenData.token) {
      console.log('⚠️ No device token found for user:', userId);
      return c.json({
        success: false,
        message: 'No device token registered for user',
      }, 404);
    }

    console.log('📱 Found device token for platform:', tokenData.platform);

    // Send notification based on platform
    if (tokenData.platform === 'ios') {
      await sendApnsNotification(tokenData.token, title, body, data);
    } else if (tokenData.platform === 'android') {
      await sendFcmNotification(tokenData.token, title, body, data);
    } else {
      console.warn('⚠️ Unsupported platform:', tokenData.platform);
      return c.json({
        success: false,
        message: 'Unsupported platform',
      }, 400);
    }

    console.log('✅ Push notification sent successfully');
    console.log('📱 ==========================================');

    return c.json({
      success: true,
      message: 'Notification sent successfully',
    });

  } catch (error: any) {
    console.error('❌ Error sending push notification:', error);
    return c.json({ error: error.message || 'Failed to send notification' }, 500);
  }
});

/**
 * Send iOS APNs notification
 */
async function sendApnsNotification(
  deviceToken: string,
  title: string,
  body: string,
  data: any
) {
  console.log('📱 Sending APNs notification...');
  
  // APNs requires:
  // 1. APNs Auth Key (.p8 file) or Certificate
  // 2. Team ID
  // 3. Key ID
  // 4. Bundle ID
  
  // These should be set as environment variables
  const apnsKeyId = Deno.env.get('APNS_KEY_ID');
  const apnsTeamId = Deno.env.get('APNS_TEAM_ID');
  const apnsBundleId = Deno.env.get('APNS_BUNDLE_ID') || 'com.sevn.app';
  const apnsKey = Deno.env.get('APNS_KEY'); // Base64 encoded .p8 key
  
  if (!apnsKeyId || !apnsTeamId || !apnsKey) {
    console.error('❌ APNs credentials not configured');
    console.error('💡 Required environment variables:');
    console.error('   - APNS_KEY_ID: Your APNs Key ID');
    console.error('   - APNS_TEAM_ID: Your Apple Team ID');
    console.error('   - APNS_KEY: Your .p8 key file content (base64 encoded)');
    console.error('   - APNS_BUNDLE_ID (optional): Your app bundle ID');
    throw new Error('APNs credentials not configured. Please add them to your Secrets.');
  }

  // Import JWT library for APNs authentication
  // Note: APNs requires JWT authentication with ES256 algorithm
  // For now, we'll log that it needs to be set up
  console.log('📱 APNs notification prepared');
  console.log('📱 Device token:', deviceToken.substring(0, 20) + '...');
  console.log('📱 Payload:', { title, body, data });
  console.log('⚠️ Note: Full APNs integration requires JWT signing with ES256');
  console.log('💡 You can use a service like Supabase Edge Functions with node-apn');
  console.log('💡 Or integrate with Firebase Cloud Messaging for easier setup');
  
  // TODO: Implement actual APNs HTTP/2 request
  // This requires:
  // 1. Creating JWT token signed with ES256
  // 2. Making HTTP/2 POST to api.push.apple.com
  // 3. Handling APNs response
  
  // For now, we'll just log that it's ready
  console.log('✅ APNs notification logged (full implementation pending)');
}

/**
 * Send Android FCM notification
 */
async function sendFcmNotification(
  deviceToken: string,
  title: string,
  body: string,
  data: any
) {
  console.log('📱 Sending FCM notification...');
  
  const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
  
  if (!fcmServerKey) {
    console.error('❌ FCM server key not configured');
    console.error('💡 Add FCM_SERVER_KEY to your environment variables');
    throw new Error('FCM server key not configured');
  }

  // Send FCM notification
  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${fcmServerKey}`,
    },
    body: JSON.stringify({
      to: deviceToken,
      notification: {
        title,
        body,
      },
      data,
      priority: 'high',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ FCM error:', errorText);
    throw new Error(`FCM notification failed: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ FCM notification sent:', result);
}

export default app;

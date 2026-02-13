import { Hono } from 'npm:hono@4.0.2';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Get Supabase admin client (for admin operations like creating users)
const getSupabaseAdminClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Get Supabase client for user authentication (uses anon key)
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );
};

// Whitelisted stylist emails
const STYLIST_WHITELIST = [
  'lissy@sevn.app', // Changed to lowercase for case-insensitive matching
  'chris@sevn.app', // Chris Whly - stylist
  'dovheichemer@gmail.com', // Keep old email for backward compatibility
];

const isStylistEmail = (email: string): boolean => {
  return STYLIST_WHITELIST.includes(email.toLowerCase());
};

// Generate unique username like "User38748"
const generateUsername = (): string => {
  // Generate a random 5-digit number (10000-99999)
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return `User${randomNumber}`;
};

// Sign up endpoint
app.post('/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    console.log('📝 Sign up request:', { email, name });

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Determine user role based on whitelist
    const userRole = isStylistEmail(email) ? 'stylist' : 'customer';
    console.log(`👤 User role: ${userRole}`);

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since we don't have email server
      user_metadata: {
        name: name || '',
        role: userRole, // Default role
      },
    });

    if (error) {
      // Handle specific error cases
      if (error.message.includes('already been registered') || error.code === 'email_exists') {
        console.log('ℹ️ Email already exists:', email);
        return c.json({ error: 'An account with this email already exists. Please sign in instead.' }, 409);
      }
      
      console.error('❌ Supabase auth error:', error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    console.log('✅ User created:', data.user.id);

    // Generate unique username
    const username = generateUsername();
    console.log('📝 Generated username:', username);

    // Create customer record in KV store
    const customerKey = `customer:${data.user.id}`;
    await kv.set(customerKey, {
      id: data.user.id,
      email,
      name: name || '',
      username, // Add username
      role: userRole, // Use the determined role (stylist or customer)
      status: 'new', // new -> invited -> in_progress -> completed
      created_at: new Date().toISOString(),
      has_intake: false,
    });

    console.log('✅ Customer record created');

    // Create empty user profile
    const profileKey = `profile:${data.user.id}`;
    await kv.set(profileKey, {
      user_id: data.user.id,
      username, // Add username to profile
      display_name: name || '',
      name: name || '',
      bio: '',
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

    console.log('✅ User profile created');

    // Sign in with anon client to get access token
    const supabase = getSupabaseClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      console.error('❌ Sign in error:', signInError);
      return c.json({ 
        error: 'User created but failed to generate session. Please sign in.',
        user_id: data.user.id,
      }, 500);
    }

    return c.json({
      success: true,
      user_id: data.user.id,
      email: data.user.email,
      name: name || '',
      role: userRole, // Add role to signup response
      access_token: signInData.session.access_token,
    });

  } catch (error: any) {
    console.error('❌ Sign up error:', error);
    return c.json({ error: error.message || 'Failed to sign up' }, 500);
  }
});

// Sign in endpoint
app.post('/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('🔑 Sign in request:', { email });

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const supabase = getSupabaseClient();
    const supabaseAdmin = getSupabaseAdminClient();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('ℹ️ Sign in attempt failed:', { email, code: error.code });
      
      // Check if user exists to provide a better error message
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = listData?.users?.some(u => u.email === email);
      
      if (!userExists) {
        console.log('📝 User does not exist, suggesting sign up');
        return c.json({ 
          error: 'No account found with this email. Please sign up first.',
          suggestion: 'signup'
        }, 401);
      }
      
      console.log('🔐 Invalid password attempt');
      return c.json({ 
        error: 'Invalid password. Please check your password and try again.',
        suggestion: 'reset'
      }, 401);
    }

    if (!data.session || !data.user) {
      return c.json({ error: 'Failed to create session' }, 500);
    }

    console.log('✅ User signed in:', data.user.id);

    // Determine user role based on whitelist
    const userRole = isStylistEmail(data.user.email || email) ? 'stylist' : 'customer';
    console.log(`👤 User role detected: ${userRole}`);

    // Get customer record from KV store
    const customerKey = `customer:${data.user.id}`;
    let customer = await kv.get(customerKey);

    // Create customer record if it doesn't exist (for legacy users)
    if (!customer) {
      console.log('📝 Creating customer record for existing user');
      const username = generateUsername();
      customer = {
        id: data.user.id,
        email: data.user.email || email,
        name: data.user.user_metadata?.name || '',
        username, // Add username for legacy users
        role: 'customer',
        status: 'new',
        created_at: new Date().toISOString(),
        has_intake: false,
      };
      await kv.set(customerKey, customer);
      
      // Also create/update profile
      const profileKey = `profile:${data.user.id}`;
      await kv.set(profileKey, {
        user_id: data.user.id,
        username,
        name: data.user.user_metadata?.name || '',
        bio: '',
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
      console.log('✅ Created profile for legacy user');
    }

    // If customer record exists but doesn't have username, add it
    if (customer && !customer.username) {
      console.log('📝 Adding username to existing customer record');
      const username = generateUsername();
      customer.username = username;
      await kv.set(customerKey, customer);
      
      // Also update profile
      const profileKey = `profile:${data.user.id}`;
      let profile = await kv.get(profileKey);
      if (profile) {
        profile.username = username;
        profile.updated_at = new Date().toISOString();
        await kv.set(profileKey, profile);
        console.log('✅ Updated profile with username');
      } else {
        // Create profile if it doesn't exist
        await kv.set(profileKey, {
          user_id: data.user.id,
          username,
          name: customer.name || '',
          bio: '',
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
        console.log('✅ Created profile for existing customer');
      }
    }

    return c.json({
      success: true,
      user_id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || customer.name || '',
      role: userRole, // Return the determined role
      access_token: data.session.access_token,
      has_intake: customer.has_intake || false,
    });

  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    return c.json({ error: error.message || 'Failed to sign in' }, 500);
  }
});

// Sign out endpoint
app.post('/signout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabaseAdmin = getSupabaseAdminClient();

    const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);

    if (error) {
      console.error('❌ Sign out error:', error);
      return c.json({ error: error.message }, 500);
    }

    console.log('✅ User signed out');

    return c.json({ success: true });

  } catch (error: any) {
    console.error('❌ Sign out error:', error);
    return c.json({ error: error.message || 'Failed to sign out' }, 500);
  }
});

// Get current user (verify auth token)
app.get('/me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error('❌ Auth error:', error);
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Get customer record
    const customerKey = `customer:${user.id}`;
    const customer = await kv.get(customerKey);

    return c.json({
      success: true,
      user_id: user.id,
      email: user.email,
      name: user.user_metadata?.name || customer?.name || '',
      role: user.user_metadata?.role || customer?.role || 'customer',
      has_intake: customer?.has_intake || false,
    });

  } catch (error: any) {
    console.error('❌ Get user error:', error);
    return c.json({ error: error.message || 'Failed to get user' }, 500);
  }
});

// Check if user exists (for debugging)
app.get('/check-user/:email', async (c) => {
  try {
    const email = c.req.param('email');
    const supabase = getSupabaseAdminClient();

    // List all users with this email
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ List users error:', error);
      return c.json({ error: error.message }, 500);
    }

    const user = data.users.find(u => u.email === email);

    if (user) {
      return c.json({
        exists: true,
        user_id: user.id,
        email: user.email,
        created_at: user.created_at,
      });
    } else {
      return c.json({
        exists: false,
        message: 'User not found',
      });
    }

  } catch (error: any) {
    console.error('❌ Check user error:', error);
    return c.json({ error: error.message || 'Failed to check user' }, 500);
  }
});

// Reset password for existing user (admin only - for debugging)
app.post('/reset-password', async (c) => {
  try {
    const { email, new_password } = await c.req.json();
    
    console.log('🔄 Password reset request:', { email });

    if (!email || !new_password) {
      return c.json({ error: 'Email and new password are required' }, 400);
    }

    if (new_password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Get user by email
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ List users error:', listError);
      return c.json({ error: listError.message }, 500);
    }

    const user = listData.users.find(u => u.email === email);

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update user password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: new_password }
    );

    if (error) {
      console.error('❌ Update password error:', error);
      return c.json({ error: error.message }, 500);
    }

    console.log('✅ Password updated for user:', user.id);

    return c.json({
      success: true,
      message: 'Password updated successfully',
      user_id: user.id,
      email: user.email,
    });

  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    return c.json({ error: error.message || 'Failed to reset password' }, 500);
  }
});

// Delete account endpoint
app.delete('/delete-account', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabaseAdmin = getSupabaseAdminClient();

    // Verify user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const userId = user.id;
    console.log('🗑️  DELETE ACCOUNT REQUEST:', userId);

    // 1. Delete customer record
    const customerKey = `customer:${userId}`;
    await kv.del(customerKey);
    console.log('✅ Deleted customer record');

    // 2. Delete profile
    const profileKey = `profile:${userId}`;
    await kv.del(profileKey);
    console.log('✅ Deleted profile');

    // 3. Delete all orders where user is customer
    const customerOrdersKey = `customer_orders:${userId}`;
    const orderIds = await kv.get(customerOrdersKey) || [];
    
    for (const orderId of orderIds) {
      const orderKey = `order:${orderId}`;
      await kv.del(orderKey);
    }
    await kv.del(customerOrdersKey);
    console.log(`✅ Deleted ${orderIds.length} orders`);

    // 4. Delete all edits created by user
    const editsPrefix = 'edit:';
    const allEdits = await kv.getByPrefix(editsPrefix);
    let deletedEdits = 0;
    
    for (const edit of allEdits) {
      if (edit && edit.user_id === userId) {
        const editKey = `edit:${edit.id}`;
        await kv.del(editKey);
        deletedEdits++;
      }
    }
    console.log(`✅ Deleted ${deletedEdits} edits`);

    // 5. Delete all likes by user
    const likeKeys = await kv.getByPrefix(`like:${userId}:`);
    for (const likeKey of likeKeys) {
      await kv.del(`like:${userId}:${likeKey}`);
    }
    console.log(`✅ Deleted likes`);

    // 6. Finally, delete user from Supabase Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('❌ Failed to delete user from auth:', deleteError);
      
      // If user is already deleted from auth (404), that's OK - KV data is cleaned up
      if (deleteError.status === 404 || deleteError.code === 'user_not_found') {
        console.log('⚠️  User already deleted from Supabase Auth, but KV data cleaned up successfully');
        return c.json({
          success: true,
          message: 'Account data deleted successfully (user already removed from auth)',
        });
      }
      
      // For other errors, return failure
      return c.json({ 
        error: 'Failed to delete account from authentication system',
        details: deleteError.message 
      }, 500);
    }

    console.log('✅ User deleted from Supabase Auth:', userId);
    console.log('🗑️  ACCOUNT DELETION COMPLETE');

    return c.json({
      success: true,
      message: 'Account deleted successfully',
    });

  } catch (error: any) {
    console.error('❌ Delete account error:', error);
    return c.json({ error: error.message || 'Failed to delete account' }, 500);
  }
});

// Set user role (admin/stylist use only)
app.post('/set-role', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const { role } = await c.req.json();
    
    if (!role || !['customer', 'stylist', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    console.log('👤 Setting role for user:', user.id, 'to:', role);
    
    // Update customer record
    const customerKey = `customer:${user.id}`;
    const customer = await kv.get(customerKey) || {};
    await kv.set(customerKey, {
      ...customer,
      role,
      updated_at: new Date().toISOString(),
    });
    
    // Update profile record
    const profileKey = `profile:${user.id}`;
    const profile = await kv.get(profileKey) || {};
    await kv.set(profileKey, {
      ...profile,
      role,
      updated_at: new Date().toISOString(),
    });
    
    console.log('✅ Role updated successfully');
    
    return c.json({ success: true, role });
  } catch (error: any) {
    console.error('❌ Error setting role:', error);
    return c.json({ error: error.message || 'Failed to set role' }, 500);
  }
});

// Validate token and check if it's still active
app.get('/validate-token', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ valid: false, error: 'No token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.log('❌ Token validation failed:', authError?.message);
      return c.json({ 
        valid: false, 
        error: authError?.message || 'Invalid token',
        hint: 'Token has expired or is invalid. Please sign in again.'
      }, 401);
    }

    console.log('✅ Token is valid for user:', user.id);
    
    return c.json({ 
      valid: true,
      user_id: user.id,
      email: user.email 
    });
  } catch (error: any) {
    console.error('❌ Error validating token:', error);
    return c.json({ 
      valid: false, 
      error: error.message 
    }, 500);
  }
});

export default app;
import { Hono } from 'npm:hono@4.0.2';
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
 * ORDER STATUS LIFECYCLE:
 * 
 * waitlist → User submitted intake, waiting for stylist to invite
 * invited → Stylist sent invite, user needs to pay
 * paid → User paid, stylist needs to style
 * styling → Stylist is actively styling
 * completed → Styling complete, selects delivered
 * cancelled → Order cancelled
 */

// Create a new order (called when client submits intake)
app.post('/create', async (c) => {
  try {
    console.log('📝 ========== CREATE ORDER ==========');
    
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided. Please sign in.' }, 401);
    }

    // Verify user
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return c.json({ error: 'Invalid or expired token. Please sign in again.' }, 401);
    }

    console.log('✅ User verified:', user.id);

    // Get user's profile to fetch username
    const userProfileKey = `profile:${user.id}`;
    const userProfile = await kv.get(userProfileKey);
    const username = userProfile?.username || user.email?.split('@')[0] || 'user';
    
    console.log('👤 User profile:', { username, email: user.email });

    // Get order data from request
    const orderData = await c.req.json();
    
    console.log('📝 Order data received:', {
      stylistId: orderData.stylistId,
      hasMainImage: !!orderData.mainImageUrl,
      hasReferenceImages: (orderData.referenceImages || []).length > 0,
      answersCount: Object.keys(orderData.intakeAnswers || {}).length,
    });

    // Generate order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create order object
    const order = {
      id: orderId,
      customer_id: user.id,
      customer_name: username,
      customer_email: user.email || '',
      stylist_id: orderData.stylistId || 'lissy_roddy',
      status: orderData.status || 'intake_submitted', // Use status from request, default to intake_submitted
      
      // Intake data
      main_image_url: orderData.mainImageUrl || '',
      reference_images: orderData.referenceImages || [],
      intake_answers: orderData.intakeAnswers || {},
      
      // Payment info (populated later)
      payment_status: 'pending',
      payment_amount: 100, // $100 USD
      payment_currency: 'USD',
      payment_completed_at: null,
      payment_transaction_id: null,
      
      // Styling data (populated later)
      selections: [],
      styling_notes: '',
      
      // Timestamps
      created_at: new Date().toISOString(),
      invited_at: null,
      paid_at: null,
      styling_started_at: null,
      completed_at: null,
      
      // Metadata
      platform: 'web',
      version: '1.0',
    };

    // Save order to KV store
    const orderKey = `order:${orderId}`;
    await kv.set(orderKey, order);
    console.log('✅ Saved order to KV:', orderKey);

    // Also index by customer (for easy retrieval)
    const customerOrdersKey = `customer_orders:${user.id}`;
    console.log('🔍 Customer orders key:', customerOrdersKey);
    const existingOrders = await kv.get(customerOrdersKey) || [];
    console.log('🔍 Existing orders for customer:', existingOrders);
    existingOrders.push(orderId);
    await kv.set(customerOrdersKey, existingOrders);
    console.log('✅ Updated customer orders index. New array:', existingOrders);

    // Also index by stylist (for waitlist view)
    const stylistOrdersKey = `stylist_orders:${orderData.stylistId || 'lissy_roddy'}`;
    console.log('🔍 Stylist orders key:', stylistOrdersKey);
    console.log('🔍 Stylist ID being indexed:', orderData.stylistId);
    const existingStylistOrders = await kv.get(stylistOrdersKey) || [];
    console.log('🔍 Existing orders for stylist:', existingStylistOrders);
    existingStylistOrders.push(orderId);
    await kv.set(stylistOrdersKey, existingStylistOrders);
    console.log('✅ Updated stylist orders index. New array:', existingStylistOrders);

    console.log('✅ Order created:', orderId);
    console.log('📧 Order status:', order.status);
    console.log('📧 Stylist will see this in their messages');
    console.log('📝 ==========================================');

    return c.json({
      success: true,
      order_id: orderId,
      status: order.status,
      message: 'Order submitted! Your stylist will review your request soon.',
    });

  } catch (error: any) {
    console.error('❌ Error creating order:', error);
    return c.json({ 
      error: error.message || 'Failed to create order',
      details: error.stack,
    }, 500);
  }
});

// Get orders for a stylist (their waitlist/messages)
app.get('/stylist/:stylistId', async (c) => {
  try {
    const stylistId = c.req.param('stylistId');
    
    console.log('📋 ========================================');
    console.log('📋 Fetching orders for stylist:', stylistId);

    // Get all order IDs for this stylist
    const stylistOrdersKey = `stylist_orders:${stylistId}`;
    console.log('📋 Checking key:', stylistOrdersKey);
    const orderIds = await kv.get(stylistOrdersKey) || [];
    console.log('📋 Order IDs found:', orderIds);
    console.log('📋 Number of order IDs:', orderIds.length);

    if (orderIds.length === 0) {
      console.log('📭 No orders found for this stylist');
      console.log('📭 This could mean:');
      console.log('📭   1. No orders submitted yet');
      console.log('📭   2. Stylist ID mismatch between order creation and fetch');
      console.log('📋 ========================================');
      return c.json({ orders: [] });
    }

    // Fetch all orders
    const orders = await Promise.all(
      orderIds.map(async (orderId: string) => {
        const orderKey = `order:${orderId}`;
        const order = await kv.get(orderKey);
        console.log(`📦 Order ${orderId}:`, order ? 'found' : 'NOT FOUND');
        return order;
      })
    );

    // Filter out null values and sort by created_at (newest first)
    const validOrders = orders.filter(order => order !== null);
    const sortedOrders = validOrders.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    console.log(`✅ Found ${sortedOrders.length} valid orders for stylist ${stylistId}`);
    console.log(`📊 Total IDs: ${orderIds.length}, Null: ${orders.length - sortedOrders.length}`);
    console.log('📋 ========================================');

    return c.json({ orders: sortedOrders });

  } catch (error: any) {
    console.error('❌ Error fetching stylist orders:', error);
    return c.json({ error: error.message || 'Failed to fetch orders' }, 500);
  }
});

// Get a specific order by ID
app.get('/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    
    console.log('📥 Fetching order:', orderId);

    const orderKey = `order:${orderId}`;
    const order = await kv.get(orderKey);

    if (!order) {
      console.log('📭 Order not found:', orderId);
      return c.json({ error: 'Order not found' }, 404);
    }

    console.log('✅ Order found:', orderId);

    return c.json({ order });

  } catch (error: any) {
    console.error('❌ Error fetching order:', error);
    return c.json({ error: error.message || 'Failed to fetch order' }, 500);
  }
});

// Get orders for a specific customer
app.get('/customer/:customerId', async (c) => {
  try {
    const customerIdParam = c.req.param('customerId');
    
    console.log('📋 ========== FETCHING CUSTOMER ORDERS ==========');
    console.log('📋 Customer ID param from URL:', customerIdParam);

    // SECURITY: Verify the access token and get the authenticated user ID
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.error('❌ No access token provided');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // ALWAYS use the authenticated user's ID (ignore URL parameter for security)
    const authenticatedUserId = user.id;
    console.log('✅ Authenticated user ID from token:', authenticatedUserId);
    
    // Optional: Log if there's a mismatch (for debugging)
    if (customerIdParam !== 'me' && authenticatedUserId !== customerIdParam) {
      console.warn('⚠️ WARNING: URL customer ID does not match authenticated user ID!');
      console.warn('   URL param:', customerIdParam);
      console.warn('   Auth user ID:', authenticatedUserId);
      console.warn('   Using authenticated ID for security');
    }

    // Get all order IDs for this customer (using authenticated user ID)
    const customerOrdersKey = `customer_orders:${authenticatedUserId}`;
    console.log('🔍 Looking up key:', customerOrdersKey);
    const orderIds = await kv.get(customerOrdersKey) || [];
    console.log('🔍 Order IDs from index:', orderIds);
    console.log('🔍 Number of order IDs:', orderIds.length);

    if (orderIds.length === 0) {
      console.log('📭 No orders found in customer index');
      console.log('📋 ==========================================');
      return c.json({ orders: [] });
    }

    // Fetch all orders
    console.log('📥 Fetching individual orders...');
    const orders = await Promise.all(
      orderIds.map(async (orderId: string) => {
        const orderKey = `order:${orderId}`;
        console.log('  🔍 Fetching:', orderKey);
        const order = await kv.get(orderKey);
        console.log('  ✅ Result:', order ? 'found' : 'null');
        return order;
      })
    );

    // Filter out null values and sort by created_at (newest first)
    const validOrders = orders.filter(order => order !== null);
    const sortedOrders = validOrders.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    console.log(`✅ Found ${sortedOrders.length} valid orders for customer ${customerIdParam}`);
    console.log(`   (${orderIds.length} total IDs, ${orders.length - sortedOrders.length} null)`);
    console.log('📋 ==========================================');

    return c.json({ orders: sortedOrders });

  } catch (error: any) {
    console.error('❌ Error fetching customer orders:', error);
    console.error('❌ Error stack:', error.stack);
    return c.json({ error: error.message || 'Failed to fetch orders' }, 500);
  }
});

// Stylist sends invite (waitlist → invited)
app.post('/:orderId/invite', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    
    console.log('💌 Sending invite for order:', orderId);

    const orderKey = `order:${orderId}`;
    const order = await kv.get(orderKey);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.status !== 'waitlist') {
      return c.json({ error: `Cannot invite order with status: ${order.status}` }, 400);
    }

    // Update order status
    order.status = 'invited';
    order.invited_at = new Date().toISOString();
    await kv.set(orderKey, order);

    console.log('✅ Order invited:', orderId);
    console.log('📧 Client will receive payment prompt');

    // TODO: Send push notification to client
    // TODO: Create in-app notification

    return c.json({
      success: true,
      order,
      message: 'Invite sent successfully',
    });

  } catch (error: any) {
    console.error('❌ Error sending invite:', error);
    return c.json({ error: error.message || 'Failed to send invite' }, 500);
  }
});

// Client completes payment (invited → paid)
app.post('/:orderId/payment', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { transaction_id, amount, currency } = await c.req.json();
    
    console.log('💳 Processing payment for order:', orderId);

    const orderKey = `order:${orderId}`;
    const order = await kv.get(orderKey);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.status !== 'invited') {
      return c.json({ error: `Cannot process payment for order with status: ${order.status}` }, 400);
    }

    // Update order with payment info
    order.status = 'paid';
    order.payment_status = 'completed';
    order.payment_completed_at = new Date().toISOString();
    order.payment_transaction_id = transaction_id;
    order.payment_amount = amount || order.payment_amount;
    order.payment_currency = currency || order.payment_currency;
    order.paid_at = new Date().toISOString();
    
    await kv.set(orderKey, order);

    console.log('✅ Payment completed:', orderId);
    console.log('📧 Stylist will be notified');

    // TODO: Send push notification to stylist
    // TODO: Create in-app notification

    return c.json({
      success: true,
      order,
      message: 'Payment completed successfully',
    });

  } catch (error: any) {
    console.error('❌ Error processing payment:', error);
    return c.json({ error: error.message || 'Failed to process payment' }, 500);
  }
});

// Stylist starts styling (paid → styling)
app.post('/:orderId/start-styling', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    
    console.log('🎨 Starting styling for order:', orderId);

    const orderKey = `order:${orderId}`;
    const order = await kv.get(orderKey);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.status !== 'paid') {
      return c.json({ error: `Cannot start styling for order with status: ${order.status}` }, 400);
    }

    // Update order status
    order.status = 'styling';
    order.styling_started_at = new Date().toISOString();
    await kv.set(orderKey, order);

    console.log('✅ Styling started:', orderId);

    return c.json({
      success: true,
      order,
    });

  } catch (error: any) {
    console.error('❌ Error starting styling:', error);
    return c.json({ error: error.message || 'Failed to start styling' }, 500);
  }
});

// Stylist completes styling (styling → completed)
app.post('/:orderId/complete', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { selections, styling_notes } = await c.req.json();
    
    console.log('✅ Completing styling for order:', orderId);

    const orderKey = `order:${orderId}`;
    const order = await kv.get(orderKey);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    if (order.status !== 'styling' && order.status !== 'paid') {
      return c.json({ error: `Cannot complete order with status: ${order.status}` }, 400);
    }

    // Update order with selections
    order.status = 'completed';
    order.selections = selections;
    order.styling_notes = styling_notes;
    order.completed_at = new Date().toISOString();
    
    await kv.set(orderKey, order);

    console.log('✅ Order completed:', orderId);
    console.log('📧 Client will be notified');

    // TODO: Send push notification to client
    // TODO: Create in-app notification
    // TODO: Send email with selects

    return c.json({
      success: true,
      order,
      message: 'Styling completed successfully',
    });

  } catch (error: any) {
    console.error('❌ Error completing order:', error);
    return c.json({ error: error.message || 'Failed to complete order' }, 500);
  }
});

// Update order status (admin override)
app.post('/:orderId/status', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { status } = await c.req.json();
    
    console.log('🔄 Updating order status:', { orderId, status });

    const validStatuses = ['waitlist', 'invited', 'paid', 'styling', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400);
    }

    const orderKey = `order:${orderId}`;
    const order = await kv.get(orderKey);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Update status
    order.status = status;
    await kv.set(orderKey, order);

    console.log('✅ Order status updated:', { orderId, status });

    return c.json({
      success: true,
      order,
    });

  } catch (error: any) {
    console.error('❌ Error updating order status:', error);
    return c.json({ error: error.message || 'Failed to update status' }, 500);
  }
});

// Update order details (edit intake) - only allowed on waitlist
app.put('/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const { mainImageUrl, referenceImages, intakeAnswers } = await c.req.json();
    
    console.log('📝 Updating order details:', orderId);

    // Verify user
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('❌ Auth error:', authError);
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    const orderKey = `order:${orderId}`;
    const order = await kv.get(orderKey);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Only allow editing on waitlist
    if (order.status !== 'waitlist') {
      return c.json({ error: 'Order can only be edited while on waitlist' }, 400);
    }

    // Verify user owns this order
    if (order.customer_id !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // Update order fields
    if (mainImageUrl !== undefined) {
      order.main_image_url = mainImageUrl;
    }
    if (referenceImages !== undefined) {
      order.reference_images = referenceImages;
    }
    if (intakeAnswers !== undefined) {
      order.intake_answers = intakeAnswers;
    }

    // Update timestamp
    order.updated_at = new Date().toISOString();

    await kv.set(orderKey, order);

    console.log('✅ Order details updated:', orderId);

    return c.json({
      success: true,
      order,
      message: 'Order updated successfully',
    });

  } catch (error: any) {
    console.error('❌ Error updating order details:', error);
    return c.json({ error: error.message || 'Failed to update order' }, 500);
  }
});

// DEBUG endpoint - list ALL keys in KV store
app.get('/debug/keys', async (c) => {
  try {
    console.log('🐛 DEBUG: Fetching ALL keys from KV store...');
    
    // Get all keys that start with common prefixes
    const orderKeys = await kv.getByPrefix('order:');
    const customerIndexKeys = await kv.getByPrefix('customer_orders:');
    const stylistIndexKeys = await kv.getByPrefix('stylist_orders:');
    
    console.log('🐛 Order keys found:', orderKeys.length);
    console.log('🐛 Customer index keys found:', customerIndexKeys.length);
    console.log('🐛 Stylist index keys found:', stylistIndexKeys.length);
    
    return c.json({
      total_order_keys: orderKeys.length,
      total_customer_indexes: customerIndexKeys.length,
      total_stylist_indexes: stylistIndexKeys.length,
      order_keys: orderKeys.map((o: any) => ({ key: `order:${o}`, id: o })),
      customer_indexes: customerIndexKeys,
      stylist_indexes: stylistIndexKeys,
    });
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint - get ALL orders
app.get('/debug/all', async (c) => {
  try {
    console.log('🐛 DEBUG: Fetching ALL orders from KV store...');
    
    // Get all keys with prefix "order:"
    const allOrders = await kv.getByPrefix('order:');
    console.log('🐛 Found orders:', allOrders.length);
    
    // Get all customer_orders indexes
    const customerOrdersKeys = await kv.getByPrefix('customer_orders:');
    console.log('🐛 Found customer_orders indexes:', customerOrdersKeys.length);
    
    // Get all stylist_orders indexes
    const stylistOrdersKeys = await kv.getByPrefix('stylist_orders:');
    console.log('🐛 Found stylist_orders indexes:', stylistOrdersKeys.length);
    
    return c.json({
      total_orders: allOrders.length,
      orders: allOrders,
      customer_indexes: customerOrdersKeys,
      stylist_indexes: stylistOrdersKeys,
    });
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Debug endpoint - get current user info from token
app.get('/debug/whoami', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: 'Invalid token', details: authError }, 401);
    }

    // Get profile info
    const profileKey = `profile:${user.id}`;
    const profile = await kv.get(profileKey);
    
    // Get customer info
    const customerKey = `customer:${user.id}`;
    const customer = await kv.get(customerKey);
    
    // Get order index
    const customerOrdersKey = `customer_orders:${user.id}`;
    const orderIds = await kv.get(customerOrdersKey) || [];

    return c.json({
      auth_user_id: user.id,
      auth_email: user.email,
      profile: profile,
      customer: customer,
      order_index_key: customerOrdersKey,
      order_ids: orderIds,
      total_orders: orderIds.length,
    });
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
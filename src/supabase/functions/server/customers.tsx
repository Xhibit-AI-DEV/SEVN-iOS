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

// Health check endpoint
app.get('/health', async (c) => {
  console.log('🏥 Health check called');
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Customers service is running'
  });
});

// Get all customers from Supabase (for stylist dashboard)
app.get('/list', async (c) => {
  try {
    console.log('📋 Fetching all customers from Supabase');

    // Get all customer keys
    const customers = await kv.getByPrefix('customer:');
    
    if (!customers || customers.length === 0) {
      console.log('📭 No customers found');
      return c.json({ customers: [] });
    }

    console.log(`✅ Found ${customers.length} customers`);

    // Sort by created_at (newest first)
    const sortedCustomers = customers.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return c.json({ customers: sortedCustomers });

  } catch (error: any) {
    console.error('❌ Error fetching customers:', error);
    return c.json({ error: error.message || 'Failed to fetch customers' }, 500);
  }
});

// Get customers for a specific stylist (filtered by stylist_id)
// MUST BE BEFORE /:customerId route to avoid conflict
app.get('/by-stylist/:stylistId', async (c) => {
  try {
    const stylistId = c.req.param('stylistId');
    
    console.log('📋 Fetching customers for stylist:', stylistId);

    // Get all customers
    const allCustomers = await kv.getByPrefix('customer:');

    if (!allCustomers || allCustomers.length === 0) {
      console.log('📭 No customers found');
      return c.json({ customers: [] });
    }

    // Filter by stylist_id
    const stylistCustomers = allCustomers.filter(
      customer => customer.stylist_id === stylistId
    );

    console.log(`✅ Found ${stylistCustomers.length} customers for stylist ${stylistId}`);

    // Sort by intake submission date (newest first)
    const sortedCustomers = stylistCustomers.sort((a, b) => {
      const dateA = new Date(a.intake_submitted_at || a.created_at || 0).getTime();
      const dateB = new Date(b.intake_submitted_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return c.json({ customers: sortedCustomers });

  } catch (error: any) {
    console.error('❌ Error fetching customers by stylist:', error);
    return c.json({ error: error.message || 'Failed to fetch customers' }, 500);
  }
});

// Check if user has completed intake
// MUST BE BEFORE /:customerId route to avoid conflict
app.get('/check-intake/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const customerKey = `customer:${userId}`;
    const customer = await kv.get(customerKey);

    if (!customer) {
      return c.json({ hasIntake: false });
    }

    return c.json({ 
      hasIntake: customer.has_intake || false,
      status: customer.status || 'new',
    });

  } catch (error: any) {
    console.error('❌ Error checking intake:', error);
    return c.json({ hasIntake: false }, 500);
  }
});

// Get a specific customer by ID
app.get('/get/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    console.log('📥 Fetching customer:', userId);

    const customerKey = `customer:${userId}`;
    const customer = await kv.get(customerKey);

    if (!customer) {
      console.log('📭 Customer not found:', userId);
      return c.json({ error: 'Customer not found' }, 404);
    }

    console.log('✅ Customer found:', userId);

    return c.json({ customer });

  } catch (error: any) {
    console.error('❌ Error fetching customer:', error);
    return c.json({ error: error.message || 'Failed to fetch customer' }, 500);
  }
});

// Alternate route (same as above but without /get prefix)
// IMPORTANT: This is a catch-all route and must be defined LAST
app.get('/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    
    console.log('📥 Fetching customer:', customerId);

    const customerKey = `customer:${customerId}`;
    const customer = await kv.get(customerKey);

    if (!customer) {
      console.log('📭 Customer not found:', customerId);
      return c.json({ error: 'Customer not found' }, 404);
    }

    console.log('✅ Customer found:', customerId);

    // Transform the data to match the expected format
    const formattedCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      main_image_url: customer.main_image_url || '',
      additional_images: customer.reference_images || [],
      status: customer.status || 'new',
      intake_submitted_at: customer.intake_submitted_at,
      intake_data: {
        style_preferences: customer.intake_answers?.style_preferences || '',
        favorite_brands: customer.intake_answers?.favorite_brands || '',
        budget_range: customer.intake_answers?.budget_range || '',
        sizes: customer.intake_answers?.sizes || {},
        occasions: customer.intake_answers?.occasions || '',
        style_goals: customer.intake_answers?.style_goals || '',
        color_preferences: customer.intake_answers?.color_preferences || '',
        body_type: customer.intake_answers?.body_type || '',
        fit_preferences: customer.intake_answers?.fit_preferences || '',
        areas_to_highlight: customer.intake_answers?.areas_to_highlight || '',
        areas_to_avoid: customer.intake_answers?.areas_to_avoid || '',
        additional_notes: customer.intake_answers?.additional_notes || '',
      },
    };

    return c.json({ customer: formattedCustomer });

  } catch (error: any) {
    console.error('❌ Error fetching customer:', error);
    return c.json({ error: error.message || 'Failed to fetch customer' }, 500);
  }
});

// Submit customer intake form (saves to Supabase)
app.post('/submit-intake', async (c) => {
  try {
    console.log('📝 ========== INTAKE SUBMISSION ==========');
    
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

    // Get intake data from request
    const intakeData = await c.req.json();
    
    console.log('📝 Intake data received:', {
      stylistId: intakeData.stylistId,
      hasMainImage: !!intakeData.mainImageUrl,
      hasReferenceImages: (intakeData.referenceImages || []).length > 0,
      answersCount: Object.keys(intakeData.answers || {}).length,
    });

    // Get existing customer record
    const customerKey = `customer:${user.id}`;
    let customer = await kv.get(customerKey);

    if (!customer) {
      console.log('📝 Creating new customer record');
      customer = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || '',
        role: 'customer',
        status: 'invited', // Set status to invited when they complete intake
        created_at: new Date().toISOString(),
      };
    }

    // Update customer with intake data
    const updatedCustomer = {
      ...customer,
      stylist_id: intakeData.stylistId || 'lissy_roddy', // Default to Lissy
      main_image_url: intakeData.mainImageUrl || '',
      reference_images: intakeData.referenceImages || [],
      intake_answers: intakeData.answers || {},
      has_intake: true,
      status: 'invited', // Mark as invited once intake is complete
      intake_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(customerKey, updatedCustomer);

    console.log('✅ Customer intake saved:', user.id);
    console.log('📧 Customer status set to: invited');
    console.log('📧 Stylist will see this customer in their messages');
    console.log('📝 ==========================================');

    return c.json({
      success: true,
      customer_id: user.id,
      status: 'invited',
      message: 'Intake submitted successfully! Your stylist will review your profile.',
    });

  } catch (error: any) {
    console.error('❌ Error submitting intake:', error);
    return c.json({ 
      error: error.message || 'Failed to submit intake',
      details: error.stack,
    }, 500);
  }
});

// Update customer status (invited -> in_progress -> completed)
app.post('/update-status', async (c) => {
  try {
    const { userId, status } = await c.req.json();
    
    console.log('🔄 Updating customer status:', { userId, status });

    if (!userId || !status) {
      return c.json({ error: 'userId and status are required' }, 400);
    }

    const validStatuses = ['new', 'invited', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, 400);
    }

    const customerKey = `customer:${userId}`;
    const customer = await kv.get(customerKey);

    if (!customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    // Update status
    customer.status = status;
    customer.updated_at = new Date().toISOString();

    if (status === 'in_progress') {
      customer.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      customer.completed_at = new Date().toISOString();
    }

    await kv.set(customerKey, customer);

    console.log('✅ Customer status updated:', { userId, status });

    return c.json({
      success: true,
      customer,
    });

  } catch (error: any) {
    console.error('❌ Error updating customer status:', error);
    return c.json({ error: error.message || 'Failed to update status' }, 500);
  }
});

export default app;
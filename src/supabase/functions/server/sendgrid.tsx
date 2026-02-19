import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Send email draft with 7 selects using SendGrid template
app.post('/send-draft', async (c) => {
  try {
    const { 
      customerEmail, 
      customerImage,
      stylistName, 
      stylistImage,
      stylingNotes,
      ctaLink,
      items = []
    } = await c.req.json();

    console.log('📧 ========== SENDGRID REQUEST DEBUG ==========');
    console.log('📧 Backend received email:', customerEmail, 'Type:', typeof customerEmail);
    console.log('📸 Customer Image:', customerImage);
    console.log('👤 Stylist Name:', stylistName);
    console.log('👤 Stylist Image:', stylistImage);
    console.log('📝 Styling Notes:', stylingNotes);
    console.log('🔗 CTA Link:', ctaLink);
    console.log('📦 Items count:', items?.length);
    console.log('📧 ==========================================');
    
    // Ensure email is a string
    let emailString = customerEmail;
    if (typeof customerEmail === 'object' && customerEmail !== null) {
      emailString = customerEmail.email || customerEmail.value || customerEmail.text || JSON.stringify(customerEmail);
    }
    
    if (typeof emailString !== 'string' || !emailString.includes('@')) {
      return c.json({
        error: 'Invalid email address',
        details: `Received: ${JSON.stringify(customerEmail)}`,
      }, 400);
    }
    
    console.log('📧 Using email string:', emailString);

    const apiKey = Deno.env.get('SENDGRID_API_KEY');
    if (!apiKey) {
      return c.json({
        error: 'SendGrid API key not configured',
        message: 'Please add your SendGrid API key in the Secrets panel to send emails.',
      }, 500);
    }

    // Debug: Check if API key is being read (show first/last few chars only for security)
    console.log('🔑 API Key found:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 8)}` : 'NONE');
    console.log('🔑 API Key length:', apiKey?.length);
    console.log('🔑 API Key starts with SG.:', apiKey?.startsWith('SG.'));

    // Validate we have 7 items (pad with empty if less)
    const paddedItems = [...items];
    while (paddedItems.length < 7) {
      paddedItems.push({
        title: '',
        image: '',
        price: '',
        url: '',
      });
    }

    // Helper function to strip $ from price
    const formatPrice = (price: string) => {
      if (!price) return '';
      return price.replace(/[$,]/g, '').trim();
    };

    // Prepare dynamic template data
    // Map items to template variables (item1, item2, ..., item7)
    const templateData: any = {
      customer_image: customerImage || '',
      stylist_name: stylistName || '',
      stylist_image: stylistImage || '',
      styling_notes: stylingNotes || '',
      cta_link: ctaLink || 'https://sevn.app',
    };

    paddedItems.forEach((item, index) => {
      const num = index + 1;
      templateData[`item${num}_name`] = item.title || '';
      templateData[`item${num}_image`] = item.image || '';
      templateData[`item${num}_price`] = formatPrice(item.price || '');
      templateData[`item${num}_url`] = item.url || '';
      
      // Debug log each item
      console.log(`📦 Item ${num}:`, {
        name: item.title,
        image: item.image,
        price: templateData[`item${num}_price`],
        url: item.url,
        hasImage: !!item.image,
        imageLength: item.image?.length || 0,
      });
    });

    console.log('📧 ========== COMPLETE TEMPLATE DATA ==========');
    console.log(JSON.stringify(templateData, null, 2));
    console.log('📧 ==========================================');

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: emailString }],
            dynamic_template_data: templateData,
          },
        ],
        from: {
          email: 'dov@sevn.app',
          name: 'SEVN Styling Team',
        },
        template_id: 'd-167e6b7fee4d498fb49335864211eb4e', // Your SendGrid template ID
        tracking_settings: {
          click_tracking: {
            enable: false,
            enable_text: false,
          },
        },
      }),
    });

    console.log('📧 ========== SENDGRID FULL PAYLOAD ==========');
    console.log(JSON.stringify({
      personalizations: [
        {
          to: [{ email: emailString }],
          dynamic_template_data: templateData,
        },
      ],
      from: {
        email: 'dov@sevn.app',
        name: 'SEVN Styling Team',
      },
      template_id: 'd-167e6b7fee4d498fb49335864211eb4e',
      tracking_settings: {
        click_tracking: {
          enable: false,
          enable_text: false,
        },
      },
    }, null, 2));
    console.log('📧 ==========================================');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SendGrid API error response:', response.status, errorText);
      
      let errorDetails = errorText;
      let userFriendlyMessage = 'Failed to send email';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = JSON.stringify(errorJson, null, 2);
        console.error('❌ SendGrid error details:', errorJson);
        
        // Check for common SendGrid errors and provide helpful messages
        if (errorJson.errors && Array.isArray(errorJson.errors)) {
          const firstError = errorJson.errors[0];
          
          if (firstError.message?.includes('Maximum credits exceeded')) {
            userFriendlyMessage = 'SendGrid account has exceeded its email credits limit';
            errorDetails = 'Your SendGrid account has run out of email credits. Please:\n' +
                          '1. Check your SendGrid dashboard at https://app.sendgrid.com/\n' +
                          '2. Upgrade your plan or wait for your credits to reset\n' +
                          '3. Or add a different SendGrid API key with available credits';
          } else if (firstError.message?.includes('authorization')) {
            userFriendlyMessage = 'SendGrid API key is invalid or unauthorized';
            errorDetails = 'The SendGrid API key may be incorrect or doesn\'t have permission to send emails.';
          } else if (firstError.message?.includes('does not contain a valid address')) {
            userFriendlyMessage = 'Invalid email address';
            errorDetails = firstError.message;
          }
        }
      } catch (e) {
        // Not JSON, use text as-is
      }
      
      return c.json({
        error: userFriendlyMessage,
        details: errorDetails,
        status: response.status,
      }, response.status);
    }

    console.log('✅ Email sent successfully to:', emailString);

    return c.json({
      success: true,
      message: `Email draft sent to ${emailString}`,
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    return c.json({
      error: error.message,
    }, 500);
  }
});

// New endpoint: Send email using data from Supabase storage (NO Contentful queries)
app.post('/send-from-storage/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    
    console.log('📧 ========== SEND FROM STORAGE ==========');
    console.log('📧 Customer ID:', customerId);
    
    // STEP 1: Read saved data from Supabase (MUST match key from selections.tsx!)
    const key = `selection:${customerId}`;
    const savedData = await kv.get(key);
    
    if (!savedData) {
      console.error('❌ No saved data found for customer:', customerId);
      return c.json({
        error: 'No saved selections found',
        details: `Customer ${customerId} has no saved data. Please save first.`,
      }, 404);
    }
    
    console.log('✅ Loaded saved data from Supabase:', {
      hasClientEmail: !!savedData.clientEmail,
      hasClientName: !!savedData.clientName,
      hasClientImage: !!savedData.clientImage,
      hasStylistName: !!savedData.stylistName,
      hasStylistImage: !!savedData.stylistImage,
      hasStylingNotes: !!savedData.stylingNotes,
      stylingNotesValue: savedData.stylingNotes,
      stylingNotesType: typeof savedData.stylingNotes,
      stylingNotesLength: savedData.stylingNotes?.length,
      itemsCount: savedData.items?.length || 0,
    });
    
    console.log('📝 RAW SAVED DATA:', JSON.stringify(savedData, null, 2));
    
    // STEP 2: Validate ALL required fields for email
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];
    
    // 1. Client Email (required)
    if (!savedData.clientEmail || !savedData.clientEmail.includes('@')) {
      validationErrors.push('Client email is missing or invalid');
    }
    
    // 2. Client Image (optional - will use empty string if missing)
    if (!savedData.clientImage) {
      validationWarnings.push('Client image is missing - email will not include customer photo');
    }
    
    // 3. Stylist Image (optional - will use empty string if missing)
    if (!savedData.stylistImage) {
      validationWarnings.push('Stylist image is missing - email will not include stylist photo');
      console.warn('⚠️ Stylist image is missing, continuing anyway...');
    }
    
    // 4. Stylist Name (optional - will use default if missing)
    if (!savedData.stylistName) {
      validationWarnings.push('Stylist name is missing - will use default');
      console.warn('⚠️ Stylist name is missing, continuing anyway...');
    }
    
    // 5. Style Notes (required)
    if (!savedData.stylingNotes || savedData.stylingNotes.trim() === '') {
      validationErrors.push('Style notes are missing');
    }
    
    // 6. 7 Products (required)
    if (!savedData.items || savedData.items.length < 7) {
      validationErrors.push(`Exactly 7 products required (found ${savedData.items?.length || 0})`);
    }
    
    // Log warnings (non-blocking)
    if (validationWarnings.length > 0) {
      console.warn('⚠️ Validation warnings:', validationWarnings);
    }
    
    // If any validation errors, return them
    if (validationErrors.length > 0) {
      console.error('❌ Validation failed:', validationErrors);
      return c.json({
        error: 'Missing required fields',
        details: validationErrors.join(', '),
        validationErrors,
        validationWarnings, // Include warnings for debugging
      }, 400);
    }
    
    console.log('✅ All required fields validated successfully');
    
    // STEP 3: Prepare data for SendGrid
    const apiKey = Deno.env.get('SENDGRID_API_KEY');
    if (!apiKey) {
      return c.json({
        error: 'SendGrid API key not configured',
        message: 'Please add your SendGrid API key in the Secrets panel to send emails.',
      }, 500);
    }
    
    // Validate we have 7 items (pad with empty if less)
    const paddedItems = [...savedData.items];
    while (paddedItems.length < 7) {
      paddedItems.push({
        title: '',
        image: '',
        price: '',
        url: '',
      });
    }
    
    // Helper function to strip $ from price
    const formatPrice = (price: string) => {
      if (!price) return '';
      return price.replace(/[$,]/g, '').trim();
    };
    
    // Prepare dynamic template data
    const templateData: any = {
      customer_image: savedData.clientImage || '',
      stylist_name: savedData.stylistName || '',
      stylist_image: savedData.stylistImage || '',
      styling_notes: savedData.stylingNotes || '',
      cta_link: 'https://sevn.app',
    };
    
    paddedItems.forEach((item, index) => {
      const num = index + 1;
      templateData[`item${num}_name`] = item.title || '';
      templateData[`item${num}_image`] = item.image || '';
      templateData[`item${num}_price`] = formatPrice(item.price || '');
      templateData[`item${num}_url`] = item.url || '';
      
      console.log(`📦 Item ${num}:`, {
        name: item.title,
        image: item.image,
        price: templateData[`item${num}_price`],
        url: item.url,
        hasImage: !!item.image,
        imageIsPublic: item.image?.includes('/storage/v1/object/public/'),
      });
    });
    
    console.log('📧 Template data prepared:', {
      clientEmail: savedData.clientEmail,
      stylistName: savedData.stylistName,
      itemsCount: savedData.items.length,
    });
    
    // Prepare complete SendGrid payload
    const sendGridPayload = {
      personalizations: [
        {
          to: [{ email: savedData.clientEmail }],
          dynamic_template_data: templateData,
        },
      ],
      from: {
        email: 'dov@sevn.app',
        name: 'SEVN Styling Team',
      },
      template_id: 'd-167e6b7fee4d498fb49335864211eb4e',
      tracking_settings: {
        click_tracking: {
          enable: false,
          enable_text: false,
        },
      },
    };
    
    console.log('📧 ========== COMPLETE SENDGRID PAYLOAD ==========');
    console.log(JSON.stringify(sendGridPayload, null, 2));
    console.log('📧 =================================================');
    
    console.log('📧 ========== TEMPLATE DATA DETAILS ==========');
    console.log('Customer Image:', templateData.customer_image);
    console.log('Customer Image Type:', typeof templateData.customer_image);
    console.log('Customer Image Length:', templateData.customer_image?.length);
    console.log('Customer Image starts with https:', templateData.customer_image?.startsWith('https'));
    console.log('Customer Image starts with http:', templateData.customer_image?.startsWith('http'));
    console.log('Customer Image is Contentful:', templateData.customer_image?.includes('images.ctfassets.net'));
    console.log('Stylist Name:', templateData.stylist_name);
    console.log('Stylist Image:', templateData.stylist_image);
    console.log('Styling Notes:', templateData.styling_notes);
    console.log('CTA Link:', templateData.cta_link);
    for (let i = 1; i <= 7; i++) {
      console.log(`\nItem ${i}:`);
      console.log(`  Name: ${templateData[`item${i}_name`]}`);
      console.log(`  Image: ${templateData[`item${i}_image`]}`);
      console.log(`  Price: ${templateData[`item${i}_price`]}`);
      console.log(`  URL: ${templateData[`item${i}_url`]}`);
    }
    console.log('📧 ==========================================');
    
    // STEP 4: Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(sendGridPayload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ SendGrid API error response:', response.status, errorText);
      
      let errorDetails = errorText;
      let userFriendlyMessage = 'Failed to send email';
      
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = JSON.stringify(errorJson, null, 2);
        console.error('❌ SendGrid error details:', errorJson);
        
        // Check for common SendGrid errors and provide helpful messages
        if (errorJson.errors && Array.isArray(errorJson.errors)) {
          const firstError = errorJson.errors[0];
          
          if (firstError.message?.includes('Maximum credits exceeded')) {
            userFriendlyMessage = 'SendGrid account has exceeded its email credits limit';
            errorDetails = 'Your SendGrid account has run out of email credits. Please:\n' +
                          '1. Check your SendGrid dashboard at https://app.sendgrid.com/\n' +
                          '2. Upgrade your plan or wait for your credits to reset\n' +
                          '3. Or add a different SendGrid API key with available credits';
          } else if (firstError.message?.includes('authorization')) {
            userFriendlyMessage = 'SendGrid API key is invalid or unauthorized';
            errorDetails = 'The SendGrid API key may be incorrect or doesn\'t have permission to send emails.';
          } else if (firstError.message?.includes('does not contain a valid address')) {
            userFriendlyMessage = 'Invalid email address';
            errorDetails = firstError.message;
          }
        }
      } catch (e) {
        // Not JSON, use text as-is
      }
      
      return c.json({
        error: userFriendlyMessage,
        details: errorDetails,
        status: response.status,
      }, response.status);
    }
    
    console.log('✅ Email sent successfully to:', savedData.clientEmail);
    console.log('📧 ==========================================');
    
    return c.json({
      success: true,
      message: `Email sent to ${savedData.clientEmail}`,
      emailSentTo: savedData.clientEmail,
      // DEBUG: Include the complete payload for inspection
      debug: {
        savedData: {
          customerId: savedData.customerId,
          clientEmail: savedData.clientEmail,
          clientName: savedData.clientName,
          stylistName: savedData.stylistName,
          hasStylingNotes: !!savedData.stylingNotes,
          stylingNotes: savedData.stylingNotes,
          itemsCount: savedData.items?.length,
        },
        sendGridPayload,
        templateData,
      },
    });
    
  } catch (error: any) {
    console.error('❌ Error sending email from storage:', error);
    return c.json({
      error: error.message || 'Failed to send email',
      details: error.stack,
    }, 500);
  }
});

export default app;
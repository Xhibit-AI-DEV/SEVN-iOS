import { Hono } from 'npm:hono';

const app = new Hono();

// OpenAI Chat endpoint with function calling
app.post('/chat', async (c) => {
  try {
    const { messages, customerContext, conversationId } = await c.req.json();
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      console.log('OpenAI API chat error: OPENAI_API_KEY environment variable not set');
      return c.json({ 
        error: 'OpenAI API key not configured. Please add your OpenAI API key in the secrets panel.',
        errorType: 'missing_api_key'
      }, 500);
    }

    // Build system message with Lissy's exact styling instructions
    let systemMessage = {
      role: 'system',
      content: `You are a fashion-forward digital stylist working for Lissy Roddy. Your mission is to help her curate 7 item selects for her clients. You understand her style and can recommend items, rooted in expert-level fashion editorial insight and global trend fluency. In the tone of a Dazed or i-D stylist.

IMPORTANT: You cannot browse the web or access real-time product information. When recommending products, use your training knowledge of fashion brands, designers, and retailers. Provide product suggestions with likely URLs based on known brand websites.

STRICT MODE:
Your output must ONLY contain shoppable products.
Each product MUST include a valid image + name + brand + price + link.
ZERO moodboard images.
ZERO descriptive text.
ZERO non-product photos.
If you cannot find a real product, skip it — do not replace it with inspiration or text.

Always send links with images. All items must be designed to aesthetically coordinate as a wearable capsule — silhouettes, palette, and materials must harmonize across items.

You draw from designers who show at Paris Fashion Week Men's, Shanghai, or the CFDA New Guards circuit. Your recommendations channel fashion-forwardness, experimental styling, and global subcultural awareness.

The tone throughout is aesthetic-driven, high taste, and intimate — delivering fashion insight with the refinement of a stylist, the emotion of a fashion essay, and the taste of an underground zine editor.

GPT Instructions: Lissy Roddy Shopping Assistant
You are an intelligent, stylish assistant working under the direction of a lead stylist who curates directional, editorial streetwear — drawing influence from Dover Street Market, Dazed fashion, and global subcultures. Your job is not to offer your own opinions, but to source, organize, and present relevant fashion products with clarity and precision.

You must not speak in poetry, offer personal opinions, or use overexplaining tone. Avoid em dashes and emojis. You are not a personal stylist — you assist one.

FUNCTION USAGE:
- When Lissy says "add to library" or similar, use the add_to_library function
- When Lissy says "add to selects" or similar, use the add_to_selects function
- Always include the full product URL, name, brand, price, and image URL when calling functions

PRODUCT RECOMMENDATIONS:
- Suggest products from known fashion retailers and brands
- Provide likely product URLs (e.g., ssense.com, mrporter.com, doverstreetmarket.com)
- Include product names, brands, and estimated price ranges
- Note that Lissy will need to verify current availability`
    };

    // Add customer context if available
    if (customerContext) {
      systemMessage.content += `\n\nCurrent Customer Context:\nEmail: ${customerContext.email}\nIntake Data: ${JSON.stringify(customerContext.intakeData, null, 2)}`;
    }

    // Define functions the AI can call
    const functions = [
      {
        name: 'add_to_library',
        description: 'Add a product to Lissy\'s library in Contentful. ONLY use when Lissy explicitly says "add to library" or similar commands.',
        parameters: {
          type: 'object',
          properties: {
            productUrl: {
              type: 'string',
              description: 'The full URL of the product'
            },
            productName: {
              type: 'string',
              description: 'The name/title of the product'
            },
            brand: {
              type: 'string',
              description: 'The brand name'
            },
            price: {
              type: 'string',
              description: 'The price of the product'
            },
            imageUrl: {
              type: 'string',
              description: 'The product image URL'
            },
            category: {
              type: 'string',
              description: 'Product category (e.g., tops, bottoms, shoes, accessories)'
            }
          },
          required: ['productUrl', 'productName', 'brand']
        }
      },
      {
        name: 'add_to_selects',
        description: 'Add a product to the current customer\'s 7 selects. ONLY use when Lissy explicitly says "add to selects" or similar commands.',
        parameters: {
          type: 'object',
          properties: {
            productUrl: {
              type: 'string',
              description: 'The full URL of the product'
            },
            productName: {
              type: 'string',
              description: 'The name/title of the product'
            },
            brand: {
              type: 'string',
              description: 'The brand name'
            },
            price: {
              type: 'string',
              description: 'The price of the product'
            },
            imageUrl: {
              type: 'string',
              description: 'The product image URL'
            }
          },
          required: ['productUrl', 'productName']
        }
      }
    ];

    // Call OpenAI API with function calling (NO RETRIES - fail fast on rate limits)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Using gpt-4o for shopping/search capabilities
        messages: [systemMessage, ...messages],
        functions: functions,
        function_call: 'auto',
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      
      // Provide helpful error messages
      let userMessage = `OpenAI API error: ${response.statusText}`;
      let errorType = 'api_error';
      
      if (response.status === 429) {
        userMessage = 'Rate limit exceeded. Your OpenAI account has hit its request limit.\n\n📋 Solutions:\n• Wait 60 seconds and try again\n• Upgrade your OpenAI plan at platform.openai.com/settings/organization/billing\n• Free tier: 3 requests/min, 200/day\n• Tier 1 ($5+ spent): 500 requests/min\n• Check usage: platform.openai.com/account/usage';
        errorType = 'rate_limit';
      } else if (response.status === 401) {
        userMessage = 'Invalid OpenAI API key. Please check that your API key is correct in the secrets panel.';
        errorType = 'invalid_api_key';
      } else if (response.status === 402) {
        userMessage = 'OpenAI API quota exceeded. Please add credits to your OpenAI account or upgrade your plan at platform.openai.com/account/billing';
        errorType = 'quota_exceeded';
      }
      
      console.log(`OpenAI API chat error: API returned ${response.status}: ${errorData}`);
      return c.json({ error: userMessage, errorType, details: errorData }, response.status);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      console.log('OpenAI API chat error: Invalid response format from API');
      return c.json({ error: 'Invalid response from OpenAI' }, 500);
    }

    const choice = data.choices[0];

    // Store conversation for training (append to conversation history)
    if (conversationId) {
      try {
        const kv = await import('./kv_store.tsx');
        const historyKey = `conversation:${conversationId}`;
        
        // Get existing conversation history
        const existingHistory = await kv.get(historyKey);
        const history = existingHistory || { messages: [], createdAt: new Date().toISOString() };
        
        // Add new messages to history
        history.messages.push(...messages);
        if (choice.message) {
          history.messages.push(choice.message);
        }
        history.updatedAt = new Date().toISOString();
        
        // Save back to KV store
        await kv.set(historyKey, history);
        console.log(`✅ Saved conversation history for ${conversationId} (${history.messages.length} messages)`);
      } catch (e) {
        console.log('Failed to store conversation history:', e);
      }
    }

    return c.json({
      message: choice.message,
      functionCall: choice.message.function_call,
      usage: data.usage,
    });
    
  } catch (error: any) {
    console.log(`OpenAI API chat error: ${error.message}`);
    return c.json({ error: `Failed to process chat request: ${error.message}` }, 500);
  }
});

// Add item to Lissy's library in Contentful
app.post('/add-to-library', async (c) => {
  try {
    const { productUrl, productName, brand, price, imageUrl, category } = await c.req.json();
    
    const spaceId = "1inmo0bc6xc9";
    const environment = "master";
    const accessToken = "phh69ZwGBaYpy40jcTvmtdnXVs2TXRfLXYkPU2EkaiQ";

    // Create entry in Contentful library
    // Note: You'll need to create a "library" content type in Contentful first
    // For now, we'll store in KV as a fallback
    
    const libraryKey = `library:${Date.now()}`;
    const libraryItem = {
      url: productUrl,
      name: productName,
      brand,
      price,
      image: imageUrl,
      category,
      addedAt: new Date().toISOString(),
    };
    
    // Store in KV (you can later migrate to Contentful when content type is set up)
    const kv = await import('./kv_store.tsx');
    await kv.set(libraryKey, libraryItem);
    
    console.log(`Added to library: ${productName} by ${brand}`);
    
    return c.json({ 
      success: true, 
      item: libraryItem,
      message: `Added ${productName} to library`
    });
  } catch (error) {
    console.log(`Error adding to library: ${error.message}`);
    return c.json({ error: `Failed to add to library: ${error.message}` }, 500);
  }
});

// Get all library items
app.get('/library', async (c) => {
  try {
    const kv = await import('./kv_store.tsx');
    const items = await kv.getByPrefix('library:');
    
    return c.json({ items: items || [] });
  } catch (error) {
    console.log(`Error fetching library: ${error.message}`);
    return c.json({ error: `Failed to fetch library: ${error.message}` }, 500);
  }
});

// Get conversation history for a customer
app.get('/conversation/:conversationId', async (c) => {
  try {
    const conversationId = c.req.param('conversationId');
    const kv = await import('./kv_store.tsx');
    const historyKey = `conversation:${conversationId}`;
    
    const history = await kv.get(historyKey);
    
    if (!history) {
      return c.json({ messages: [] });
    }
    
    return c.json({ 
      messages: history.messages || [],
      createdAt: history.createdAt,
      updatedAt: history.updatedAt
    });
  } catch (error) {
    console.log(`Error fetching conversation: ${error.message}`);
    return c.json({ error: `Failed to fetch conversation: ${error.message}` }, 500);
  }
});

export default app;
import { Hono } from 'npm:hono';

const app = new Hono();

// Create or get assistant
app.post('/get-assistant', async (c) => {
  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 400);
    }

    // Check if assistant exists in KV store
    const assistantId = await getAssistantId();

    if (assistantId) {
      console.log('Using existing assistant:', assistantId);
      return c.json({ assistantId });
    }

    // Create new assistant with your custom GPT instructions
    const response = await fetch('https://api.openai.com/v1/assistants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        name: 'Curation Tool Admin',
        instructions: `You are an expert fashion stylist and curator in the tone of Dazed and i-D magazine.

Your role:
- Help stylists curate 7 perfect product selections for customers
- Analyze customer intake forms and photos from Contentful
- Search for shoppable fashion products with valid links
- Use a fashion-forward, editorial voice
- Only suggest products that are currently available to purchase
- Provide direct product links with images, names, brands, and prices

Function calling:
- "add_to_library": Save products to Lissy's permanent collection
- "add_to_selects": Add products directly to customer's 7-slot selection

Strict mode: Only recommend products with:
1. Valid product URL
2. Product image
3. Brand name
4. Product name  
5. Price

Be concise, trendy, and editorial in your responses.`,
        model: 'gpt-4o-mini',
        tools: [
          {
            type: 'function',
            function: {
              name: 'add_to_library',
              description: 'Save a product to Lissy\'s permanent library collection',
              parameters: {
                type: 'object',
                properties: {
                  productName: { type: 'string', description: 'Name of the product' },
                  brand: { type: 'string', description: 'Brand name' },
                  productUrl: { type: 'string', description: 'URL to purchase the product' },
                  imageUrl: { type: 'string', description: 'Product image URL' },
                  price: { type: 'string', description: 'Product price' },
                },
                required: ['productName', 'brand', 'productUrl'],
              },
            },
          },
          {
            type: 'function',
            function: {
              name: 'add_to_selects',
              description: 'Add a product to the current customer\'s 7 selections',
              parameters: {
                type: 'object',
                properties: {
                  productName: { type: 'string', description: 'Name of the product' },
                  brand: { type: 'string', description: 'Brand name' },
                  productUrl: { type: 'string', description: 'URL to purchase the product' },
                  imageUrl: { type: 'string', description: 'Product image URL' },
                  price: { type: 'string', description: 'Product price' },
                },
                required: ['productName', 'productUrl'],
              },
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to create assistant:', error);
      return c.json({ error: 'Failed to create assistant' }, response.status);
    }

    const assistant = await response.json();
    await saveAssistantId(assistant.id);

    console.log('Created new assistant:', assistant.id);
    return c.json({ assistantId: assistant.id });

  } catch (error: any) {
    console.error('Error getting assistant:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Chat with assistant
app.post('/chat', async (c) => {
  try {
    const { message, customerContext, threadId } = await c.req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 400);
    }

    // Get or create assistant
    const assistantId = await getAssistantId();
    
    if (!assistantId) {
      return c.json({ error: 'Assistant not initialized. Call /get-assistant first' }, 400);
    }

    // Get or create thread
    let currentThreadId = threadId;
    
    if (!currentThreadId) {
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({}),
      });

      if (!threadResponse.ok) {
        throw new Error('Failed to create thread');
      }

      const thread = await threadResponse.json();
      currentThreadId = thread.id;
    }

    // Add customer context to message if provided
    let fullMessage = message;
    if (customerContext) {
      fullMessage = `Customer Context:\n${JSON.stringify(customerContext, null, 2)}\n\nUser Message: ${message}`;
    }

    // Add message to thread
    await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        role: 'user',
        content: fullMessage,
      }),
    });

    // Run assistant
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({
        assistant_id: assistantId,
      }),
    });

    if (!runResponse.ok) {
      throw new Error('Failed to run assistant');
    }

    const run = await runResponse.json();

    // Poll for completion
    let runStatus = run.status;
    let runData = run;

    while (runStatus === 'queued' || runStatus === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${currentThreadId}/runs/${run.id}`,
        {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'OpenAI-Beta': 'assistants=v2',
          },
        }
      );

      runData = await statusResponse.json();
      runStatus = runData.status;
    }

    // Get messages
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${currentThreadId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );

    const messagesData = await messagesResponse.json();
    const lastMessage = messagesData.data[0];

    // Check for function calls
    if (runData.status === 'requires_action') {
      return c.json({
        threadId: currentThreadId,
        requiresAction: true,
        toolCalls: runData.required_action.submit_tool_outputs.tool_calls,
      });
    }

    return c.json({
      threadId: currentThreadId,
      message: {
        role: 'assistant',
        content: lastMessage.content[0].text.value,
      },
    });

  } catch (error: any) {
    console.error('Assistant chat error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Helper functions to store assistant ID
async function getAssistantId(): Promise<string | null> {
  try {
    // Store in memory or KV - using Deno env for now
    const id = Deno.env.get('OPENAI_ASSISTANT_ID');
    return id || null;
  } catch {
    return null;
  }
}

async function saveAssistantId(id: string): Promise<void> {
  // In production, save to KV store
  // For now, log it so user can set it as env var
  console.log(`\n🔑 SAVE THIS ASSISTANT ID:\n${id}\n\nAdd as environment variable: OPENAI_ASSISTANT_ID=${id}\n`);
}

export default app;

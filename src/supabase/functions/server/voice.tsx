import { Hono } from 'npm:hono';

const app = new Hono();

// Process voice commands with natural language understanding
app.post('/process-command', async (c) => {
  try {
    const { command, lastSearchResults, availableProducts } = await c.req.json();
    
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return c.json({ 
        error: 'OpenAI API key not configured',
        action: 'error',
        response: 'Voice commands require OpenAI API key'
      }, 500);
    }

    // Use OpenAI to understand the intent
    const systemPrompt = `You are a voice command processor for a fashion stylist admin interface. 
Analyze the user's voice command and determine the intent.

Available actions:
- "search": User wants to search for products (e.g., "find black pants", "search for boots", "show me vintage jackets")
- "add_item": User wants to add a product to their selects (e.g., "add this", "add the first one", "add number 3", "select that one")
- "clarify": User's intent is unclear and needs clarification

Context:
- There are currently ${availableProducts} products visible from the last search
- Products are numbered 0-${availableProducts - 1} (but user will say 1-${availableProducts})

For "search" actions, extract the search query.
For "add_item" actions, determine which product index (0-based) the user is referring to.
For "clarify" actions, ask the user for more information.

Respond in JSON format:
{
  "action": "search" | "add_item" | "clarify",
  "searchQuery": "extracted query" (only for search),
  "productIndex": number (only for add_item, 0-based),
  "response": "natural language response to show the user"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: command }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log(`Voice command processing error: ${response.status} - ${errorText}`);
      return c.json({ 
        error: 'Failed to process command',
        action: 'error',
        response: 'Could not understand that command. Try again?'
      }, 500);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    console.log('🎤 Voice command processed:', {
      originalCommand: command,
      detectedAction: result.action,
      searchQuery: result.searchQuery,
      fullResult: result,
    });

    return c.json(result);
    
  } catch (error: any) {
    console.log(`Voice command processing error: ${error.message}`);
    return c.json({ 
      error: error.message,
      action: 'error',
      response: 'Sorry, I could not process that command.'
    }, 500);
  }
});

export default app;
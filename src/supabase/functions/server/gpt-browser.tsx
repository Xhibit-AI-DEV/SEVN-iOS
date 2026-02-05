import { Hono } from 'npm:hono';

const app = new Hono();

// GPT with web browsing using function calling (most ChatGPT-like)
app.post('/search', async (c) => {
  try {
    const { query } = await c.req.json();
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      return c.json({
        error: 'OpenAI API key not configured',
        products: []
      }, 400);
    }

    console.log(`GPT Browser searching for: "${query}"`);

    // Step 1: Ask GPT to generate search URLs for fashion sites
    const searchPrompt = `You are a fashion product search assistant. Generate 8-10 specific product page URLs from popular fashion sites for this search query: "${query}"

Fashion sites to search:
- SSENSE (ssense.com)
- Grailed (grailed.com)
- END Clothing (endclothing.com)
- Mr Porter (mrporter.com)
- GOAT (goat.com)
- StockX (stockx.com)
- Farfetch (farfetch.com)
- Nordstrom (nordstrom.com)

Return ONLY valid product URLs, one per line. Be specific and realistic.`;

    const gptResponse1 = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates real product URLs from fashion websites.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!gptResponse1.ok) {
      throw new Error(`OpenAI API error: ${gptResponse1.status}`);
    }

    const gptData1 = await gptResponse1.json();
    const urlsText = gptData1.choices[0].message.content;
    
    // Extract URLs from GPT response
    const urlMatches = urlsText.match(/https?:\/\/[^\s\n]+/g);
    
    if (!urlMatches || urlMatches.length === 0) {
      return c.json({
        error: 'No product URLs found',
        message: 'Could not find products for this query. Try being more specific.',
        products: []
      });
    }

    console.log(`GPT suggested ${urlMatches.length} URLs, fetching...`);

    // Step 2: Fetch each URL with Jina Reader
    const products = await Promise.all(
      urlMatches.slice(0, 10).map(async (url) => {
        try {
          const jinaUrl = `https://r.jina.ai/${url}`;
          const response = await fetch(jinaUrl, {
            headers: {
              'Accept': 'application/json',
            }
          });

          if (!response.ok) {
            return null;
          }

          const pageData = await response.json();
          const content = pageData.data?.content || pageData.data?.text || '';

          // Extract info
          const titleMatch = content.match(/Title:\s*(.+)/i) || content.match(/^#\s+(.+)$/m);
          const name = titleMatch ? titleMatch[1].trim() : 'Product';

          const priceMatch = content.match(/\$[\d,]+\.?\d{0,2}/);
          const price = priceMatch ? priceMatch[0] : 'See site';

          const imageMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/) ||
                            content.match(/Image:\s*(https?:\/\/[^\s]+)/i);
          const imageUrl = imageMatch ? imageMatch[1] : null;

          const urlHost = new URL(url).hostname.replace('www.', '').split('.')[0];

          return {
            name: cleanText(name),
            price,
            url,
            imageUrl,
            source: capitalizeFirst(urlHost),
            brand: extractBrandFromUrl(url) || capitalizeFirst(urlHost)
          };
        } catch (error) {
          console.log(`Error fetching ${url}:`, error);
          return null;
        }
      })
    );

    const validProducts = products.filter(p => p !== null);

    console.log(`GPT Browser found ${validProducts.length} products`);

    return c.json({
      products: validProducts,
      searchInfo: {
        query,
        totalResults: validProducts.length,
        searchEngine: 'GPT + Web Browsing (ChatGPT-style)'
      }
    });

  } catch (error: any) {
    console.error(`GPT Browser error: ${error.message}`);
    return c.json({
      error: `Failed to search: ${error.message}`,
      products: []
    }, 500);
  }
});

function extractBrandFromUrl(url: string): string | null {
  const brands = ['Nike', 'Adidas', 'Prada', 'Gucci', 'Balenciaga', 'Supreme', 'Bape'];
  const urlLower = url.toLowerCase();
  
  for (const brand of brands) {
    if (urlLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  return null;
}

function cleanText(text: string): string {
  return text.replace(/[#*_\[\]]/g, '').replace(/\s+/g, ' ').trim().substring(0, 200);
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default app;

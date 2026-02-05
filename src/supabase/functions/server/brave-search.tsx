import { Hono } from 'npm:hono';

const app = new Hono();

// Search using Brave Search API (FREE 2000 queries/month) + OpenAI
app.post('/search', async (c) => {
  try {
    const { query, num = 12 } = await c.req.json();
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }

    const braveApiKey = Deno.env.get('BRAVE_SEARCH_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!braveApiKey) {
      return c.json({
        error: 'Brave Search API key not configured',
        message: `🔍 TO ENABLE REAL WEB SEARCH (LIKE CHATGPT):\n\n1. Get FREE API key (2000 searches/month) at:\n   https://brave.com/search/api/\n\n2. Add BRAVE_SEARCH_API_KEY to environment\n\n3. Restart the app\n\n✨ This gives you ChatGPT-level web browsing!`,
        products: [],
        setupUrl: 'https://brave.com/search/api/'
      });
    }

    console.log(`Brave Search for: "${query}"`);

    // Step 1: Search with Brave (web browsing)
    const braveUrl = new URL('https://api.search.brave.com/res/v1/web/search');
    braveUrl.searchParams.append('q', `${query} buy shop product fashion`);
    braveUrl.searchParams.append('count', num.toString());

    const braveResponse = await fetch(braveUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': braveApiKey,
      }
    });

    if (!braveResponse.ok) {
      const errorText = await braveResponse.text();
      console.error(`Brave API error: ${braveResponse.status} - ${errorText}`);
      
      if (braveResponse.status === 401) {
        return c.json({
          error: 'Invalid Brave API key',
          message: 'Please check your Brave Search API key at https://brave.com/search/api/',
          products: []
        }, 401);
      }
      
      throw new Error(`Brave API error: ${braveResponse.status}`);
    }

    const braveData = await braveResponse.json();
    const searchResults = braveData.web?.results || [];

    if (searchResults.length === 0) {
      return c.json({
        error: 'No results found',
        message: `No products found for "${query}". Try different keywords.`,
        products: []
      });
    }

    console.log(`Brave found ${searchResults.length} results`);

    // Step 2: Use Jina Reader to fetch actual product pages
    const products = await Promise.all(
      searchResults.slice(0, num).map(async (result: any) => {
        try {
          const url = result.url;
          
          // Skip non-shopping URLs
          if (!isShoppingUrl(url)) {
            return null;
          }

          // Fetch page with Jina Reader
          const jinaUrl = `https://r.jina.ai/${url}`;
          const jinaResponse = await fetch(jinaUrl, {
            headers: {
              'Accept': 'application/json',
            }
          });

          if (!jinaResponse.ok) {
            // Fallback: use Brave's description
            return extractFromBraveResult(result);
          }

          const jinaData = await jinaResponse.json();
          const content = jinaData.data?.content || jinaData.data?.text || '';

          // Extract product info with AI if OpenAI is available
          if (openaiApiKey && content.length > 100) {
            return await extractWithGPT(content, url, openaiApiKey);
          } else {
            return extractProductInfo(content, url, result.title, result.description);
          }
        } catch (error) {
          console.log(`Error processing ${result.url}:`, error);
          return extractFromBraveResult(result);
        }
      })
    );

    const validProducts = products.filter(p => p !== null);

    console.log(`Found ${validProducts.length} valid products`);

    return c.json({
      products: validProducts,
      searchInfo: {
        query,
        totalResults: validProducts.length,
        searchEngine: 'Brave Search + Web Browsing (ChatGPT-level)'
      }
    });

  } catch (error: any) {
    console.error(`Brave search error: ${error.message}`);
    return c.json({
      error: `Search failed: ${error.message}`,
      products: []
    }, 500);
  }
});

// Check if URL is from a shopping site
function isShoppingUrl(url: string): boolean {
  const shoppingSites = [
    'ssense.com', 'grailed.com', 'endclothing.com', 'mrporter.com',
    'nordstrom.com', 'shopbop.com', 'farfetch.com', 'net-a-porter.com',
    'selfridges.com', 'barneys.com', 'bergdorfgoodman.com',
    'stockx.com', 'goat.com', 'depop.com', 'vestiairecollective.com',
    'therealreal.com', 'rebag.com', 'fashionphile.com'
  ];
  
  const urlLower = url.toLowerCase();
  return shoppingSites.some(site => urlLower.includes(site));
}

// Extract product using GPT (most accurate)
async function extractWithGPT(content: string, url: string, apiKey: string): Promise<any> {
  try {
    const prompt = `Extract product information from this webpage content. Return ONLY valid JSON with this structure:
{
  "name": "product name",
  "price": "$XX.XX or 'See site'",
  "brand": "brand name",
  "imageUrl": "https://... or null",
  "description": "brief description"
}

Content:
${content.substring(0, 3000)}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You extract product information from webpage text. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('GPT extraction failed');
    }

    const data = await response.json();
    const jsonText = data.choices[0].message.content;
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const productData = JSON.parse(jsonMatch[0]);
      const urlHost = new URL(url).hostname.replace('www.', '').split('.')[0];
      
      return {
        name: productData.name || 'Product',
        price: productData.price || 'See site',
        url,
        imageUrl: productData.imageUrl,
        source: capitalizeFirst(urlHost),
        brand: productData.brand || capitalizeFirst(urlHost),
        description: productData.description
      };
    }
    
    return null;
  } catch (error) {
    console.log('GPT extraction error:', error);
    return null;
  }
}

// Extract from webpage content (fallback)
function extractProductInfo(content: string, url: string, title: string, description: string): any {
  const priceMatch = content.match(/\$[\d,]+\.?\d{0,2}/) || description.match(/\$[\d,]+\.?\d{0,2}/);
  const price = priceMatch ? priceMatch[0] : 'See site';

  const imageMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
  const imageUrl = imageMatch ? imageMatch[1] : null;

  const urlHost = new URL(url).hostname.replace('www.', '').split('.')[0];

  return {
    name: cleanText(title),
    price,
    url,
    imageUrl,
    source: capitalizeFirst(urlHost),
    brand: extractBrandFromText(title + ' ' + description) || capitalizeFirst(urlHost),
    description: cleanText(description).substring(0, 150)
  };
}

// Extract from Brave result directly
function extractFromBraveResult(result: any): any {
  const priceMatch = result.description?.match(/\$[\d,]+\.?\d{0,2}/);
  const urlHost = new URL(result.url).hostname.replace('www.', '').split('.')[0];

  return {
    name: cleanText(result.title),
    price: priceMatch ? priceMatch[0] : 'See site',
    url: result.url,
    imageUrl: result.thumbnail?.src || null,
    source: capitalizeFirst(urlHost),
    brand: extractBrandFromText(result.title) || capitalizeFirst(urlHost),
    description: cleanText(result.description || '').substring(0, 150)
  };
}

function extractBrandFromText(text: string): string | null {
  const brands = [
    'Nike', 'Adidas', 'Prada', 'Gucci', 'Balenciaga', 'Versace',
    'Saint Laurent', 'YSL', 'Dior', 'Chanel', 'Louis Vuitton',
    'Burberry', 'Givenchy', 'Off-White', 'Supreme', 'Stone Island',
    'Acne Studios', 'Maison Margiela', 'Rick Owens', 'The Row'
  ];

  const textUpper = text.toUpperCase();
  for (const brand of brands) {
    if (textUpper.includes(brand.toUpperCase())) {
      return brand;
    }
  }
  return null;
}

function cleanText(text: string): string {
  return text.replace(/[#*_\[\]]/g, '').replace(/\s+/g, ' ').trim();
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default app;

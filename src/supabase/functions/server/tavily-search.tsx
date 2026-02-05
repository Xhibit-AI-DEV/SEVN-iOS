import { Hono } from 'npm:hono';

const app = new Hono();

// Search for products using Tavily AI Search
app.post('/search', async (c) => {
  try {
    const { query, num = 12 } = await c.req.json();
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }

    const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
    
    if (!tavilyApiKey) {
      console.log('Tavily API key not found');
      
      return c.json({ 
        error: 'Product search not configured',
        message: `🔍 TO ENABLE REAL PRODUCT SEARCH:\n\n1. Get FREE API key (1000 searches/month) at:\n   https://tavily.com\n\n2. Add TAVILY_API_KEY to environment variables\n\n3. Restart the app\n\n✨ Tavily is built for AI product search and returns real-time results with images!`,
        products: [],
        setupUrl: 'https://tavily.com'
      });
    }

    console.log(`Searching products with Tavily: "${query}"`);

    // Call Tavily Search API
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: `${query} buy online shopping product`,
        search_depth: 'basic',
        include_images: true,
        include_answer: false,
        max_results: num,
        include_domains: [
          'ssense.com',
          'mrporter.com',
          'nordstrom.com',
          'shopbop.com',
          'net-a-porter.com',
          'farfetch.com',
          'selfridges.com',
          'doverstreetmarket.com',
          'endclothing.com',
          'grailed.com',
          'stockx.com',
          'depop.com'
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tavily API error: ${response.status} - ${errorText}`);
      
      if (response.status === 401) {
        return c.json({ 
          error: 'Invalid Tavily API key. Please check your API key at https://tavily.com/settings',
          products: []
        }, 401);
      }
      
      return c.json({ 
        error: `Search API error: ${response.statusText}`,
        details: errorText,
        products: []
      }, response.status);
    }

    const data = await response.json();

    // Parse Tavily results into product format
    const products = (data.results || []).map((item: any) => {
      // Extract price from content if available
      const priceMatch = item.content?.match(/\$[\d,]+(?:\.\d{2})?/);
      const price = priceMatch ? priceMatch[0] : null;
      
      // Extract brand from URL or title
      const urlHost = new URL(item.url).hostname.replace('www.', '').split('.')[0];
      const brand = extractBrandFromText(item.title) || capitalizeFirst(urlHost);

      return {
        name: item.title,
        price: price || 'See site',
        url: item.url,
        imageUrl: data.images?.[0] || null, // Tavily returns images separately
        source: capitalizeFirst(urlHost),
        brand: brand,
        description: item.content?.substring(0, 150)
      };
    });

    console.log(`Found ${products.length} products via Tavily for "${query}"`);

    return c.json({ 
      products,
      searchInfo: {
        query,
        totalResults: products.length,
        searchEngine: 'Tavily AI Search'
      }
    });

  } catch (error: any) {
    console.error(`Tavily search error: ${error.message}`);
    return c.json({ 
      error: `Failed to search products: ${error.message}`,
      products: []
    }, 500);
  }
});

// Helper function to extract brand from text
function extractBrandFromText(text: string): string | null {
  const brands = [
    'Nike', 'Adidas', 'Prada', 'Gucci', 'Balenciaga', 'Versace',
    'Saint Laurent', 'Yves Saint Laurent', 'YSL', 'Dior', 'Chanel',
    'Louis Vuitton', 'Burberry', 'Givenchy', 'Off-White', 'Supreme',
    'Stone Island', 'Acne Studios', 'Maison Margiela', 'Rick Owens',
    'The Row', 'Lemaire', 'Jil Sander', 'Celine', 'Loewe', 'Bottega Veneta',
    'Jacquemus', 'Amiri', 'Fear of God', 'A-COLD-WALL', 'Martine Rose',
    'Raf Simons', 'Helmut Lang', 'Comme des Garçons', 'Issey Miyake',
    'Carhartt', 'Dickies', 'Stussy', 'Palace', 'Bape', 'Neighborhood'
  ];

  const textUpper = text.toUpperCase();
  for (const brand of brands) {
    if (textUpper.includes(brand.toUpperCase())) {
      return brand;
    }
  }

  return null;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default app;

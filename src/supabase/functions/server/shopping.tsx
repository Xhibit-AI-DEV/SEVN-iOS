import { Hono } from 'npm:hono';

const app = new Hono();

// Search Google Shopping for products using SerpAPI
app.post('/search', async (c) => {
  try {
    const { query, num = 10 } = await c.req.json();
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }

    const serpApiKey = Deno.env.get('SERPAPI_KEY');
    
    if (!serpApiKey) {
      console.log('SerpAPI key not found - returning mock products for development');
      
      // Return helpful message about setting up SerpAPI
      return c.json({ 
        error: 'SerpAPI key not configured',
        message: 'To enable real product search:\n1. Get a free API key at serpapi.com (100 free searches/month)\n2. Add SERPAPI_KEY to your environment variables\n3. Restart the app',
        products: []
      });
    }

    // Call SerpAPI Google Shopping
    const serpUrl = new URL('https://serpapi.com/search');
    serpUrl.searchParams.append('engine', 'google_shopping');
    serpUrl.searchParams.append('q', query);
    serpUrl.searchParams.append('api_key', serpApiKey);
    serpUrl.searchParams.append('num', num.toString());
    serpUrl.searchParams.append('location', 'United States');

    console.log(`Searching Google Shopping for: "${query}"`);

    const response = await fetch(serpUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SerpAPI error: ${response.status} - ${errorText}`);
      return c.json({ 
        error: `Search API error: ${response.statusText}`,
        details: errorText 
      }, response.status);
    }

    const data = await response.json();

    // Parse shopping results
    const products = (data.shopping_results || []).map((item: any) => ({
      name: item.title,
      price: item.price || item.extracted_price || 'Price N/A',
      url: item.link,
      imageUrl: item.thumbnail,
      source: item.source || 'Unknown',
      rating: item.rating,
      reviews: item.reviews,
      delivery: item.delivery,
      brand: item.brand || extractBrandFromTitle(item.title),
    }));

    console.log(`Found ${products.length} products for "${query}"`);

    return c.json({ 
      products,
      searchInfo: {
        query,
        totalResults: products.length,
        searchEngine: 'Google Shopping'
      }
    });

  } catch (error: any) {
    console.error(`Shopping search error: ${error.message}`);
    return c.json({ 
      error: `Failed to search products: ${error.message}`,
      products: []
    }, 500);
  }
});

// Helper function to extract brand from product title
function extractBrandFromTitle(title: string): string {
  // Common fashion brands - extract if found at the beginning
  const brands = [
    'Nike', 'Adidas', 'Prada', 'Gucci', 'Balenciaga', 'Versace',
    'Saint Laurent', 'Yves Saint Laurent', 'YSL', 'Dior', 'Chanel',
    'Louis Vuitton', 'Burberry', 'Givenchy', 'Off-White', 'Supreme',
    'Stone Island', 'Acne Studios', 'Maison Margiela', 'Rick Owens',
    'The Row', 'Lemaire', 'Jil Sander', 'Celine', 'Loewe'
  ];

  const titleUpper = title.toUpperCase();
  for (const brand of brands) {
    if (titleUpper.startsWith(brand.toUpperCase())) {
      return brand;
    }
  }

  // Otherwise take first word as potential brand
  const firstWord = title.split(' ')[0];
  return firstWord || 'Unknown';
}

export default app;

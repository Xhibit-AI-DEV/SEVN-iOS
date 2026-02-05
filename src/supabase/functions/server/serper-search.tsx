import { Hono } from 'npm:hono';

const app = new Hono();

// Search Google Shopping for products using Serper API (serper.dev)
// Serper is cheaper and better than SerpAPI - $50 for 10,000 searches
app.post('/search', async (c) => {
  try {
    const { query, num = 10 } = await c.req.json();

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const serperApiKey = Deno.env.get('SERPER_API_KEY');
    
    if (!serperApiKey) {
      console.log('Serper API key not found - product search disabled');
      
      return c.json({ 
        error: 'Serper API key not configured',
        message: 'To enable real product search:\n1. Get API key at serper.dev ($50 for 10,000 searches)\n2. Add SERPER_API_KEY to your environment variables\n3. Restart the app',
        products: []
      });
    }

    console.log(`Searching Google Shopping via Serper for: "${query}"`);

    // Call Serper API for Google Shopping results
    const response = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: num,
        gl: 'us', // United States
        hl: 'en', // English
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Serper API error: ${response.status} - ${errorText}`);
      return c.json({ 
        error: `Serper API error: ${response.statusText}`,
        products: []
      }, response.status);
    }

    const data = await response.json();

    // Serper returns shopping results in the "shopping" array
    const shoppingResults = data.shopping || [];

    console.log(`Serper found ${shoppingResults.length} products`);

    // Transform Serper results to our product format
    const products = shoppingResults.map((item: any) => ({
      name: item.title || '',
      brand: extractBrand(item.title, item.source),
      price: item.price || '',
      link: item.link || '',
      imageUrl: item.imageUrl || item.thumbnail || '',
      source: item.source || '',
      rating: item.rating,
      reviews: item.reviews,
      delivery: item.delivery,
    })).filter((p: any) => p.link && p.imageUrl); // Only include products with valid links and images

    return c.json({
      products,
      searchInfo: {
        query,
        searchEngine: 'Google Shopping (Serper)',
        resultsCount: products.length,
      },
    });

  } catch (error: any) {
    console.error('Serper search error:', error);
    return c.json({ 
      error: error.message || 'Failed to search products',
      products: []
    }, 500);
  }
});

// Helper function to extract brand from title or source
function extractBrand(title: string, source: string): string {
  // Common fashion brands
  const brands = [
    'Nike', 'Adidas', 'Prada', 'Gucci', 'Louis Vuitton', 'Chanel', 
    'Dior', 'Balenciaga', 'Saint Laurent', 'Versace', 'Burberry',
    'Fendi', 'Givenchy', 'Valentino', 'Bottega Veneta', 'Celine',
    'Loewe', 'Alexander McQueen', 'Off-White', 'Acne Studios',
    'Rick Owens', 'Maison Margiela', 'The Row', 'Jacquemus',
    'Reebok', 'New Balance', 'Vans', 'Converse', 'Dr. Martens',
    'Stone Island', 'CP Company', 'A.P.C.', 'AMI Paris',
    'Lemaire', 'Jil Sander', 'Our Legacy', 'Engineered Garments',
  ];

  // Check if any brand is in the title
  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }

  // If no brand found, use source as fallback
  return source || 'Unknown';
}

export default app;

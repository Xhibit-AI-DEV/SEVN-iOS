import { Hono } from 'npm:hono';

const app = new Hono();

// Search using Google Custom Search + Jina AI Reader (like ChatGPT browsing)
app.post('/search', async (c) => {
  try {
    const { query, num = 10 } = await c.req.json();
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }

    console.log(`Searching with Jina AI for: "${query}"`);

    // Step 1: Search Google for product URLs using DuckDuckGo API (free, no key needed)
    const searchQuery = encodeURIComponent(`${query} buy online shop`);
    const ddgResponse = await fetch(`https://api.duckduckgo.com/?q=${searchQuery}&format=json&no_html=1`);
    const ddgData = await ddgResponse.json();

    // Get URLs from DuckDuckGo results
    const searchResults = ddgData.RelatedTopics || [];
    let productUrls: string[] = [];

    // Extract URLs from DuckDuckGo results
    for (const topic of searchResults.slice(0, num)) {
      if (topic.FirstURL) {
        productUrls.push(topic.FirstURL);
      }
    }

    // Fallback: If DuckDuckGo doesn't return results, search specific fashion sites
    if (productUrls.length === 0) {
      console.log('DuckDuckGo returned no results, using direct site search');
      
      // Search fashion sites directly using Jina Search API
      const jinaSearchUrl = `https://s.jina.ai/${encodeURIComponent(query + ' site:ssense.com OR site:grailed.com OR site:endclothing.com')}`;
      
      const jinaSearchResponse = await fetch(jinaSearchUrl);
      const jinaSearchText = await jinaSearchResponse.text();
      
      // Parse URLs from Jina search results
      const urlMatches = jinaSearchText.match(/https?:\/\/[^\s]+/g);
      if (urlMatches) {
        productUrls = urlMatches.slice(0, num);
      }
    }

    if (productUrls.length === 0) {
      return c.json({
        error: 'No products found',
        message: `No results found for "${query}". Try different keywords or use more specific brand names.`,
        products: []
      });
    }

    console.log(`Found ${productUrls.length} product URLs, fetching with Jina Reader...`);

    // Step 2: Use Jina AI Reader to fetch each product page (like ChatGPT browsing)
    const products = await Promise.all(
      productUrls.slice(0, num).map(async (url) => {
        try {
          // Jina AI Reader - converts webpage to LLM-readable markdown
          const jinaUrl = `https://r.jina.ai/${url}`;
          const response = await fetch(jinaUrl, {
            headers: {
              'Accept': 'application/json',
              'X-Return-Format': 'markdown'
            }
          });

          if (!response.ok) {
            console.log(`Failed to fetch ${url}: ${response.status}`);
            return null;
          }

          const pageData = await response.json();
          const content = pageData.data?.content || '';

          // Extract product info from page content
          const product = extractProductInfo(content, url);
          
          return product;
        } catch (error) {
          console.log(`Error fetching ${url}:`, error);
          return null;
        }
      })
    );

    // Filter out null results
    const validProducts = products.filter(p => p !== null);

    console.log(`Successfully extracted ${validProducts.length} products`);

    return c.json({
      products: validProducts,
      searchInfo: {
        query,
        totalResults: validProducts.length,
        searchEngine: 'Jina AI Reader (ChatGPT-style browsing)'
      }
    });

  } catch (error: any) {
    console.error(`Jina search error: ${error.message}`);
    return c.json({
      error: `Failed to search products: ${error.message}`,
      products: []
    }, 500);
  }
});

// Extract product information from webpage content
function extractProductInfo(content: string, url: string): any {
  // Extract product name (usually in title or first heading)
  const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/Title:\s*(.+)/i);
  const name = titleMatch ? titleMatch[1].trim() : 'Product';

  // Extract price (look for $XX.XX patterns)
  const priceMatch = content.match(/\$[\d,]+\.?\d{0,2}/);
  const price = priceMatch ? priceMatch[0] : 'See site';

  // Extract brand from URL or content
  const urlHost = new URL(url).hostname.replace('www.', '').split('.')[0];
  const brandMatch = content.match(/Brand:\s*([^\n]+)/i) || 
                     content.match(/by\s+([A-Z][a-zA-Z\s&-]+)/);
  const brand = brandMatch ? brandMatch[1].trim() : capitalizeFirst(urlHost);

  // Extract image (look for image URLs in markdown)
  const imageMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/);
  let imageUrl = imageMatch ? imageMatch[1] : null;

  // If no image in markdown, look for og:image or other image patterns
  if (!imageUrl) {
    const ogImageMatch = content.match(/og:image.*?(https?:\/\/[^\s\)]+)/i);
    imageUrl = ogImageMatch ? ogImageMatch[1] : null;
  }

  // Extract description
  const descMatch = content.match(/Description:\s*([^\n]+)/i);
  const description = descMatch ? descMatch[1].substring(0, 150) : '';

  return {
    name: cleanText(name),
    price,
    url,
    imageUrl,
    source: capitalizeFirst(urlHost),
    brand: cleanText(brand),
    description: cleanText(description)
  };
}

function cleanText(text: string): string {
  return text
    .replace(/[#*_\[\]]/g, '') // Remove markdown characters
    .replace(/\s+/g, ' ')       // Collapse whitespace
    .trim()
    .substring(0, 200);         // Limit length
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default app;

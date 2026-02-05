import { Hono } from 'npm:hono';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts';

const app = new Hono();

// Search and scrape real product pages (like ChatGPT browsing)
app.post('/search', async (c) => {
  try {
    const { query, num = 12 } = await c.req.json();
    
    if (!query) {
      return c.json({ error: 'Search query is required' }, 400);
    }

    console.log(`Web scraper searching for: "${query}"`);

    // Fashion shopping sites to search
    const sites = [
      { name: 'SSENSE', searchUrl: `https://www.ssense.com/en-us/search?q=${encodeURIComponent(query)}` },
      { name: 'Grailed', searchUrl: `https://www.grailed.com/search?query=${encodeURIComponent(query)}` },
      { name: 'END', searchUrl: `https://www.endclothing.com/us/catalogsearch/result/?q=${encodeURIComponent(query)}` },
    ];

    const allProducts: any[] = [];

    // Search each site
    for (const site of sites) {
      try {
        console.log(`Scraping ${site.name}...`);
        
        const response = await fetch(site.searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        if (!response.ok) {
          console.log(`Failed to fetch ${site.name}: ${response.status}`);
          continue;
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        if (!doc) {
          console.log(`Failed to parse ${site.name}`);
          continue;
        }

        // Extract products based on site
        let products: any[] = [];

        if (site.name === 'SSENSE') {
          products = extractSSENSE(doc, site.name);
        } else if (site.name === 'Grailed') {
          products = extractGrailed(doc, site.name);
        } else if (site.name === 'END') {
          products = extractEND(doc, site.name);
        }

        console.log(`Found ${products.length} products from ${site.name}`);
        allProducts.push(...products);

        if (allProducts.length >= num) {
          break;
        }
      } catch (error) {
        console.log(`Error scraping ${site.name}:`, error);
      }
    }

    const limitedProducts = allProducts.slice(0, num);

    if (limitedProducts.length === 0) {
      return c.json({
        error: 'No products found',
        message: `No products found for "${query}". The sites may have changed their structure or blocked the request.`,
        products: []
      });
    }

    console.log(`Total products found: ${limitedProducts.length}`);

    return c.json({
      products: limitedProducts,
      searchInfo: {
        query,
        totalResults: limitedProducts.length,
        searchEngine: 'Live Web Scraping (ChatGPT-style browsing)'
      }
    });

  } catch (error: any) {
    console.error(`Web scraper error: ${error.message}`);
    return c.json({
      error: `Search failed: ${error.message}`,
      products: []
    }, 500);
  }
});

// Extract products from SSENSE
function extractSSENSE(doc: any, source: string): any[] {
  const products: any[] = [];
  
  // SSENSE uses product cards with class names like 'product-tile'
  const productElements = doc.querySelectorAll('[class*="product"]');
  
  for (const el of Array.from(productElements).slice(0, 10)) {
    try {
      const nameEl = el.querySelector('[class*="name"], [class*="title"], h3, h2');
      const priceEl = el.querySelector('[class*="price"]');
      const imgEl = el.querySelector('img');
      const linkEl = el.querySelector('a');

      if (!nameEl && !imgEl) continue;

      const name = nameEl?.textContent?.trim() || 'Product';
      const price = priceEl?.textContent?.trim() || 'See site';
      const imageUrl = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src');
      const relativeUrl = linkEl?.getAttribute('href');
      const url = relativeUrl?.startsWith('http') 
        ? relativeUrl 
        : `https://www.ssense.com${relativeUrl}`;

      if (name !== 'Product' || imageUrl) {
        products.push({
          name: cleanText(name),
          price: cleanPrice(price),
          url,
          imageUrl: imageUrl?.startsWith('//') ? `https:${imageUrl}` : imageUrl,
          source,
          brand: extractBrand(name)
        });
      }
    } catch (e) {
      // Skip invalid products
    }
  }

  return products;
}

// Extract products from Grailed
function extractGrailed(doc: any, source: string): any[] {
  const products: any[] = [];
  
  const productElements = doc.querySelectorAll('[class*="feed-item"], [class*="listing"]');
  
  for (const el of Array.from(productElements).slice(0, 10)) {
    try {
      const nameEl = el.querySelector('[class*="title"], [class*="name"]');
      const priceEl = el.querySelector('[class*="price"]');
      const imgEl = el.querySelector('img');
      const linkEl = el.querySelector('a');

      if (!nameEl && !imgEl) continue;

      const name = nameEl?.textContent?.trim() || 'Product';
      const price = priceEl?.textContent?.trim() || 'See site';
      const imageUrl = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src');
      const relativeUrl = linkEl?.getAttribute('href');
      const url = relativeUrl?.startsWith('http') 
        ? relativeUrl 
        : `https://www.grailed.com${relativeUrl}`;

      if (name !== 'Product' || imageUrl) {
        products.push({
          name: cleanText(name),
          price: cleanPrice(price),
          url,
          imageUrl: imageUrl?.startsWith('//') ? `https:${imageUrl}` : imageUrl,
          source,
          brand: extractBrand(name)
        });
      }
    } catch (e) {
      // Skip
    }
  }

  return products;
}

// Extract products from END
function extractEND(doc: any, source: string): any[] {
  const products: any[] = [];
  
  const productElements = doc.querySelectorAll('[class*="product"], .item');
  
  for (const el of Array.from(productElements).slice(0, 10)) {
    try {
      const nameEl = el.querySelector('[class*="name"], [class*="title"]');
      const priceEl = el.querySelector('[class*="price"]');
      const imgEl = el.querySelector('img');
      const linkEl = el.querySelector('a');

      if (!nameEl && !imgEl) continue;

      const name = nameEl?.textContent?.trim() || 'Product';
      const price = priceEl?.textContent?.trim() || 'See site';
      const imageUrl = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src');
      const relativeUrl = linkEl?.getAttribute('href');
      const url = relativeUrl?.startsWith('http') 
        ? relativeUrl 
        : `https://www.endclothing.com${relativeUrl}`;

      if (name !== 'Product' || imageUrl) {
        products.push({
          name: cleanText(name),
          price: cleanPrice(price),
          url,
          imageUrl: imageUrl?.startsWith('//') ? `https:${imageUrl}` : imageUrl,
          source,
          brand: extractBrand(name)
        });
      }
    } catch (e) {
      // Skip
    }
  }

  return products;
}

function extractBrand(text: string): string {
  const brands = ['Nike', 'Adidas', 'Prada', 'Gucci', 'Balenciaga', 'Supreme', 'Bape', 'Stone Island'];
  const textUpper = text.toUpperCase();
  
  for (const brand of brands) {
    if (textUpper.includes(brand.toUpperCase())) {
      return brand;
    }
  }
  
  return '';
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().substring(0, 200);
}

function cleanPrice(price: string): string {
  const match = price.match(/\$?[\d,]+\.?\d{0,2}/);
  return match ? (match[0].startsWith('$') ? match[0] : `$${match[0]}`) : price;
}

export default app;

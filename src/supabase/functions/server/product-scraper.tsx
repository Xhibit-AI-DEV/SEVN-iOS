import { Hono } from 'npm:hono';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts';

const app = new Hono();

// Scrape product page metadata using enhanced HTML parsing
app.post('/scrape', async (c) => {
  try {
    const { url } = await c.req.json();
    
    if (!url) {
      return c.json({ 
        error: 'URL is required',
        url: '',
        title: 'Product Link',
        image: null,
        description: '',
        price: ''
      }, 400);
    }

    console.log(`🤖 Enhanced scraping: ${url}`);

    // Fetch page with proper headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    // Helper function to get meta content
    const getMeta = (name: string) => {
      // Try property attribute first (og:, twitter:, etc)
      let meta = doc.querySelector(`meta[property="${name}"]`);
      if (meta) return meta.getAttribute('content');
      
      // Try name attribute
      meta = doc.querySelector(`meta[name="${name}"]`);
      if (meta) return meta.getAttribute('content');
      
      return null;
    };

    // Get title
    let title = 
      getMeta('og:title') ||
      getMeta('twitter:title') ||
      doc.querySelector('title')?.textContent ||
      doc.querySelector('h1')?.textContent ||
      'Product';

    // Get image - try multiple sources
    let image = 
      getMeta('og:image') ||
      getMeta('twitter:image') ||
      getMeta('image');

    // If no meta image, try to find product images
    if (!image) {
      const imgSelectors = [
        'meta[itemprop="image"]',
        'img[class*="product"]',
        'img[class*="Product"]',
        'img[class*="main"]',
        'img[class*="hero"]',
        'img[itemprop="image"]',
        '[class*="product"] img',
        '[class*="Product"] img',
        '[class*="gallery"] img',
        'picture img',
        'main img',
      ];

      for (const selector of imgSelectors) {
        const el = doc.querySelector(selector);
        if (el) {
          const src = el.getAttribute('src') || 
                      el.getAttribute('data-src') || 
                      el.getAttribute('data-lazy-src') ||
                      el.getAttribute('content');
          if (src && !src.includes('placeholder') && !src.includes('logo') && !src.includes('icon')) {
            image = src;
            break;
          }
        }
      }
    }

    // Get description
    const description =
      getMeta('og:description') ||
      getMeta('twitter:description') ||
      getMeta('description') ||
      '';

    // Get price - try multiple methods
    let price = getMeta('product:price:amount') || getMeta('price');

    if (!price) {
      const priceSelectors = [
        '[itemprop="price"]',
        '[class*="price"]',
        '[class*="Price"]',
        '[data-price]',
        'span.price',
        '.product-price',
        '.Price',
      ];

      for (const selector of priceSelectors) {
        const el = doc.querySelector(selector);
        if (el) {
          const text = el.textContent?.trim();
          // Look for dollar signs or price patterns
          if (text && (text.includes('$') || /\d+\.\d{2}/.test(text))) {
            price = text;
            break;
          }
        }
      }
    }

    console.log(`✅ Scraped metadata:`, { title, image: !!image, price });

    // Fix relative image URLs
    let imageUrl = image;
    if (imageUrl) {
      if (imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        const urlObj = new URL(url);
        imageUrl = `${urlObj.protocol}//${urlObj.host}${imageUrl}`;
      } else if (!imageUrl.startsWith('http')) {
        const urlObj = new URL(url);
        imageUrl = `${urlObj.protocol}//${urlObj.host}/${imageUrl}`;
      }
    }

    return c.json({
      url,
      title: title.trim().substring(0, 200) || 'Product',
      image: imageUrl,
      description: description.trim().substring(0, 500),
      price: price?.trim() || '',
    });

  } catch (error: any) {
    console.error(`❌ Scraping error: ${error.message}`);

    return c.json({
      error: `Failed to scrape: ${error.message}`,
      url: '',
      title: 'Product Link',
      image: null,
      description: '',
      price: '',
    }, 500);
  }
});

export default app;
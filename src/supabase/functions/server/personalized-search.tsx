import { Hono } from 'npm:hono';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Lissy Roddy's editorial styling instructions
const LISSY_STYLE_PROMPT = `You are a fashion-forward digital stylist working for Lissy Roddy. Your mission is to help her curate 7 item selects for her clients. You understand her style and can recommend items, rooted in expert-level fashion editorial insight and global trend fluency. In the tone of a Dazed or i-D stylist.

Designed to aesthetically coordinate as a wearable capsule — silhouettes, palette, and materials must harmonize across items. 
You draw from designers who show at Paris Fashion Week Men's, Shanghai, or the CFDA New Guards circuit. Your recommendations channel fashion-forwardness, experimental styling, and global subcultural awareness. 

The tone throughout is aesthetic-driven, high taste, and intimate — delivering fashion insight with the refinement of a stylist, the emotion of a fashion essay, and the taste of an underground zine editor.

You curate directional, editorial streetwear drawing influence from Dover Street Market, Dazed fashion, and global subcultures. Your job is not to offer your own opinions, but to source, organize, and present relevant fashion products with clarity and precision.`;

// Enhanced search with customer context and Lissy's style
app.post('/search', async (c) => {
  try {
    const { query, customerId, num = 20 } = await c.req.json();

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const serperApiKey = Deno.env.get('SERPER_API_KEY');
    
    if (!openaiApiKey || !serperApiKey) {
      return c.json({ 
        error: 'API keys not configured',
        products: []
      }, 500);
    }

    console.log('🎨 ========== PERSONALIZED SEARCH ==========');
    console.log('📝 Query:', query);
    console.log('👤 Customer ID:', customerId);

    let customerContext = '';
    let customerImageUrl = '';

    // Fetch customer data from Contentful if customerId provided
    if (customerId) {
      try {
        const contentfulSpaceId = Deno.env.get('CONTENTFUL_SPACE_ID');
        const contentfulAccessToken = Deno.env.get('CONTENTFUL_ACCESS_TOKEN');
        const contentfulEnvironment = Deno.env.get('CONTENTFUL_ENVIRONMENT') || 'master';

        // Fetch customer from Contentful
        const customerResponse = await fetch(
          `https://cdn.contentful.com/spaces/${contentfulSpaceId}/environments/${contentfulEnvironment}/entries/${customerId}?access_token=${contentfulAccessToken}`,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (customerResponse.ok) {
          const customer = await customerResponse.json();
          console.log('✅ Fetched customer data from Contentful');

          // Extract intake answers
          const intakeField = customer.fields?.intake_answers;
          if (intakeField?.nodeType === 'document' && intakeField.content) {
            const textParts: string[] = [];
            intakeField.content.forEach((paragraph: any) => {
              if (paragraph.content) {
                paragraph.content.forEach((node: any) => {
                  if (node.value) {
                    textParts.push(node.value);
                  }
                });
              }
            });
            customerContext = textParts.join('\n');
            console.log('📋 Customer intake extracted');
          }

          // Get customer image for GPT-4 Vision analysis
          const customerImages = customer.fields?.images;
          if (customerImages && Array.isArray(customerImages) && customerImages.length > 0) {
            const firstImageRef = customerImages[0];
            const assetId = firstImageRef.sys?.id;
            
            if (assetId) {
              try {
                const assetResponse = await fetch(
                  `https://cdn.contentful.com/spaces/${contentfulSpaceId}/environments/${contentfulEnvironment}/assets/${assetId}?access_token=${contentfulAccessToken}`
                );
                if (assetResponse.ok) {
                  const assetData = await assetResponse.json();
                  customerImageUrl = assetData.fields?.file?.url || '';
                  if (customerImageUrl.startsWith('//')) {
                    customerImageUrl = 'https:' + customerImageUrl;
                  }
                  console.log('🖼️ Customer image URL retrieved');
                }
              } catch (error) {
                console.error('Error fetching customer image:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching customer data:', error);
      }
    }

    // Fetch Lissy's recent selections for context
    let historicalContext = '';
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: recentSelections } = await supabase
        .from('kv_store_b14d984c')
        .select('value')
        .like('key', 'customer_selections:%')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (recentSelections && recentSelections.length > 0) {
        const selectionSummary = recentSelections.map((row: any) => {
          try {
            const data = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
            const items = data.items || [];
            const notes = data.stylingNotes || '';
            return `Items: ${items.map((i: any) => i.title).join(', ')}\nNotes: ${notes}`;
          } catch {
            return '';
          }
        }).filter(Boolean).join('\n\n');
        
        historicalContext = selectionSummary;
        console.log('📚 Loaded', recentSelections.length, 'recent selections for context');
      }
    } catch (error) {
      console.error('Error fetching historical selections:', error);
    }

    // Build GPT prompt with all context
    const messages: any[] = [
      {
        role: 'system',
        content: LISSY_STYLE_PROMPT
      },
      {
        role: 'user',
        content: []
      }
    ];

    // Add text context
    let userPrompt = `Search Query: "${query}"\n\n`;
    
    if (customerContext) {
      userPrompt += `CUSTOMER INTAKE:\n${customerContext}\n\n`;
    }
    
    if (historicalContext) {
      userPrompt += `LISSY'S RECENT SELECTIONS (for reference):\n${historicalContext}\n\n`;
    }

    userPrompt += `Based on the customer's needs and Lissy's editorial style, enhance this search query to find the most relevant fashion-forward items. Return ONLY an enhanced search query string that will work well with Google Shopping. Make it specific (include brands, materials, price range if relevant) but concise (under 15 words).`;

    messages[1].content.push({
      type: 'text',
      text: userPrompt
    });

    // Add customer image if available (GPT-4 Vision)
    if (customerImageUrl) {
      messages[1].content.push({
        type: 'image_url',
        image_url: {
          url: customerImageUrl,
          detail: 'low' // Faster and cheaper for style analysis
        }
      });
      console.log('🎨 Added customer image for GPT-4 Vision analysis');
    }

    // Get enhanced query from GPT
    console.log('🤖 Calling GPT-4 for query enhancement...');
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: customerImageUrl ? 'gpt-4-turbo' : 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!gptResponse.ok) {
      console.error('GPT API error:', await gptResponse.text());
      // Fall back to original query if GPT fails
      console.log('⚠️ Falling back to original query');
    }

    let enhancedQuery = query;
    if (gptResponse.ok) {
      const gptData = await gptResponse.json();
      enhancedQuery = gptData.choices[0]?.message?.content?.trim() || query;
      console.log('✨ Enhanced query:', enhancedQuery);
    }

    // Search with enhanced query using Serper
    console.log('🔍 Searching Google Shopping via Serper...');
    const serperResponse = await fetch('https://google.serper.dev/shopping', {
      method: 'POST',
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: enhancedQuery,
        num: num,
        gl: 'us',
        hl: 'en',
      }),
    });

    if (!serperResponse.ok) {
      const errorText = await serperResponse.text();
      console.error(`Serper API error: ${serperResponse.status} - ${errorText}`);
      return c.json({ 
        error: `Serper API error: ${serperResponse.statusText}`,
        products: []
      }, serperResponse.status);
    }

    const serperData = await serperResponse.json();
    const shoppingResults = serperData.shopping || [];
    console.log(`✅ Serper found ${shoppingResults.length} products`);

    // Filter by editorial retailers first
    const filteredResults = filterByEditorialRetailers(shoppingResults);
    console.log(`🎨 Filtered to ${filteredResults.length} editorial retailer products`);

    // Transform results
    const products = filteredResults.map((item: any) => ({
      name: item.title || '',
      brand: extractBrand(item.title, item.source),
      price: item.price || '',
      link: item.link || '',
      imageUrl: item.imageUrl || item.thumbnail || '',
      source: item.source || '',
      rating: item.rating,
      reviews: item.reviews,
      delivery: item.delivery,
    })).filter((p: any) => p.link && p.imageUrl);

    // Optionally rank results with GPT (if we want to filter further)
    // For now, return all results - can add ranking later

    return c.json({
      products,
      searchInfo: {
        originalQuery: query,
        enhancedQuery: enhancedQuery,
        searchEngine: 'Google Shopping (Serper + GPT Enhanced)',
        resultsCount: products.length,
      },
    });

  } catch (error: any) {
    console.error('Personalized search error:', error);
    return c.json({ 
      error: error.message || 'Failed to search products',
      products: []
    }, 500);
  }
});

// Smart pre-suggestions: Auto-generate 7 items for a customer
app.post('/smart-suggest/:customerId', async (c) => {
  try {
    const customerId = c.req.param('customerId');
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const serperApiKey = Deno.env.get('SERPER_API_KEY');
    
    if (!openaiApiKey || !serperApiKey) {
      return c.json({ 
        error: 'API keys not configured',
        suggestions: []
      }, 500);
    }

    console.log('💡 ========== SMART SUGGESTIONS ==========');
    console.log('👤 Customer ID:', customerId);

    // Fetch customer data
    const contentfulSpaceId = '1inmo0bc6xc9';
    const contentfulAccessToken = 'phh69ZwGBaYpy40jcTvmtdnXVs2TXRfLXYkPU2EkaiQ';
    const contentfulEnvironment = 'master';

    console.log('📍 Fetching from Contentful:', contentfulSpaceId);

    const customerResponse = await fetch(
      `https://cdn.contentful.com/spaces/${contentfulSpaceId}/environments/${contentfulEnvironment}/entries/${customerId}?access_token=${contentfulAccessToken}`,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('📡 Customer response status:', customerResponse.status);

    if (!customerResponse.ok) {
      const errorText = await customerResponse.text();
      console.error('❌ Contentful error:', errorText);
      return c.json({ error: `Failed to fetch customer data: ${customerResponse.status}`, suggestions: [] }, 404);
    }

    const customer = await customerResponse.json();
    
    // Extract intake answers
    let customerIntake = '';
    const intakeField = customer.fields?.intake_answers;
    if (intakeField?.nodeType === 'document' && intakeField.content) {
      const textParts: string[] = [];
      intakeField.content.forEach((paragraph: any) => {
        if (paragraph.content) {
          paragraph.content.forEach((node: any) => {
            if (node.value) {
              textParts.push(node.value);
            }
          });
        }
      });
      customerIntake = textParts.join('\n');
    }

    // Get customer image
    let customerImageUrl = '';
    const customerImages = customer.fields?.images;
    if (customerImages && Array.isArray(customerImages) && customerImages.length > 0) {
      const firstImageRef = customerImages[0];
      const assetId = firstImageRef.sys?.id;
      
      if (assetId) {
        try {
          const assetResponse = await fetch(
            `https://cdn.contentful.com/spaces/${contentfulSpaceId}/environments/${contentfulEnvironment}/assets/${assetId}?access_token=${contentfulAccessToken}`
          );
          if (assetResponse.ok) {
            const assetData = await assetResponse.json();
            customerImageUrl = assetData.fields?.file?.url || '';
            if (customerImageUrl.startsWith('//')) {
              customerImageUrl = 'https:' + customerImageUrl;
            }
          }
        } catch (error) {
          console.error('Error fetching customer image:', error);
        }
      }
    }

    // Fetch Lissy's recent selections for context
    let historicalContext = '';
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: recentSelections } = await supabase
        .from('kv_store_b14d984c')
        .select('value')
        .like('key', 'customer_selections:%')
        .order('updated_at', { ascending: false })
        .limit(15);

      if (recentSelections && recentSelections.length > 0) {
        const selectionSummary = recentSelections.map((row: any) => {
          try {
            const data = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
            const items = data.items || [];
            const notes = data.stylingNotes || '';
            return `Items: ${items.map((i: any) => `${i.title} - ${i.price}`).join(', ')}\nNotes: ${notes}`;
          } catch {
            return '';
          }
        }).filter(Boolean).join('\n\n');
        
        historicalContext = selectionSummary;
        console.log('📚 Loaded', recentSelections.length, 'recent selections');
      }
    } catch (error) {
      console.error('Error fetching historical selections:', error);
    }

    // Build GPT prompt for suggestions
    const messages: any[] = [
      {
        role: 'system',
        content: LISSY_STYLE_PROMPT + '\n\nYou are now generating 7 specific search queries for a complete capsule wardrobe for this customer. Each query should be specific enough to find a real product on Google Shopping.'
      },
      {
        role: 'user',
        content: []
      }
    ];

    let userPrompt = `CUSTOMER INTAKE:\n${customerIntake}\n\n`;
    
    if (historicalContext) {
      userPrompt += `LISSY'S RECENT SELECTIONS (for style reference):\n${historicalContext}\n\n`;
    }

    userPrompt += `Based on this customer's needs and Lissy's editorial style, generate 7 specific search queries for a cohesive capsule. Each query should be specific enough to find actual products (include materials, silhouettes, brands when relevant).

${customerImageUrl ? 'CRITICAL: First analyze the customer image provided below. Determine their gender presentation (masculine, feminine, or androgynous) based on their styling, clothing, and overall aesthetic. Then generate searches that match their presentation - if masculine-presenting, search for menswear; if feminine-presenting, search for womenswear; if androgynous, consider unisex or their specific lean. Include "men\'s" or "women\'s" in queries where relevant.' : 'CRITICAL: Pay attention to any style cues in the intake form. Make educated guesses about gender presentation based on context.'}

RETAILER PRIORITY: Focus on editorial retailers that match Dover Street Market aesthetic. Include retailer names in queries when relevant: SSENSE, Grailed, Mr Porter, END., Farfetch, Matches Fashion, Ln-cc, Antonioli. AVOID mainstream retailers (Nordstrom, Macy's, Bloomingdale's).

Return ONLY a JSON array of 7 search query strings, nothing else. Format:
["query 1", "query 2", "query 3", "query 4", "query 5", "query 6", "query 7"]`;

    messages[1].content.push({
      type: 'text',
      text: userPrompt
    });

    // Add customer image if available
    if (customerImageUrl) {
      messages[1].content.push({
        type: 'image_url',
        image_url: {
          url: customerImageUrl,
          detail: 'low'
        }
      });
      console.log('🎨 Added customer image for analysis');
    }

    // Get search queries from GPT
    console.log('🤖 Calling GPT-4 for smart suggestions...');
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: customerImageUrl ? 'gpt-4-turbo' : 'gpt-4',
        messages,
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!gptResponse.ok) {
      const errorText = await gptResponse.text();
      console.error('GPT API error:', errorText);
      return c.json({ error: 'Failed to generate suggestions', suggestions: [] }, 500);
    }

    const gptData = await gptResponse.json();
    const responseText = gptData.choices[0]?.message?.content?.trim() || '';
    
    console.log('📝 GPT response:', responseText);

    // Parse the JSON array of queries
    let searchQueries: string[] = [];
    try {
      searchQueries = JSON.parse(responseText);
      if (!Array.isArray(searchQueries) || searchQueries.length !== 7) {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to parse GPT response:', error);
      return c.json({ error: 'Failed to parse suggestions', suggestions: [] }, 500);
    }

    console.log('✨ Generated queries:', searchQueries);

    // Search for each query and get top result
    const suggestions = [];
    for (let i = 0; i < searchQueries.length; i++) {
      const query = searchQueries[i];
      console.log(`🔍 Searching ${i + 1}/7: "${query}"`);

      try {
        const serperResponse = await fetch('https://google.serper.dev/shopping', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: query,
            num: 3, // Get top 3, take the best one
            gl: 'us',
            hl: 'en',
          }),
        });

        if (serperResponse.ok) {
          const serperData = await serperResponse.json();
          const results = serperData.shopping || [];
          
          // Filter out mainstream retailers
          const filteredResults = filterByEditorialRetailers(results);
          
          if (filteredResults.length > 0) {
            const topResult = filteredResults[0];
            suggestions.push({
              name: topResult.title || '',
              brand: extractBrand(topResult.title, topResult.source),
              price: topResult.price || '',
              link: topResult.link || '',
              imageUrl: topResult.imageUrl || topResult.thumbnail || '',
              source: topResult.source || '',
              searchQuery: query,
            });
            console.log(`  ✅ Found: ${topResult.title}`);
          } else {
            console.log(`  ⚠️ No editorial retailers found for: ${query}`);
          }
        }
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`💡 Generated ${suggestions.length} suggestions`);

    return c.json({
      suggestions,
      customerIntake,
      queriesGenerated: searchQueries,
    });

  } catch (error: any) {
    console.error('Smart suggest error:', error);
    return c.json({ 
      error: error.message || 'Failed to generate suggestions',
      suggestions: []
    }, 500);
  }
});

// Helper function to extract brand
function extractBrand(title: string, source: string): string {
  const brands = [
    // High Fashion / Paris Fashion Week
    'Dries Van Noten', 'Comme des Garçons', 'Yohji Yamamoto', 'Issey Miyake',
    'Rick Owens', 'Maison Margiela', 'Lemaire', 'Jacquemus', 'The Row',
    'Balenciaga', 'Saint Laurent', 'Celine', 'Loewe', 'Acne Studios',
    
    // CFDA / New Guards
    'Off-White', 'Fear of God', 'Heron Preston', 'Ambush', 'Alyx',
    'Marine Serre', 'GmbH', 'Wales Bonner', 'Martine Rose',
    
    // Dover Street Market / Editorial Brands
    'Stüssy', 'Brain Dead', 'Carhartt WIP', 'Stone Island', 'CP Company',
    'Our Legacy', 'Engineered Garments', 'South2 West8', 'Needles',
    'WTAPS', 'visvim', 'Kapital', 'Sasquatchfabrix', 'Needles',
    
    // Contemporary
    'A.P.C.', 'AMI Paris', 'Jil Sander', 'Lemaire', 'Toteme',
    'Ganni', 'Nanushka', 'Gauchere', 'Khaite', 'Proenza Schouler',
    
    // Streetwear
    'Palace', 'Supreme', 'Noah', 'Aimé Leon Dore', 'Awake NY',
    
    // Classics
    'Nike', 'Adidas', 'New Balance', 'Salomon', 'Asics', 'Converse',
  ];

  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return source || 'Unknown';
}

// Helper function to filter results by editorial retailers
function filterByEditorialRetailers(results: any[]): any[] {
  const editorialRetailers = [
    'ssense', 'grailed', 'mr porter', 'mrporter', 'end.', 'end clothing', 
    'farfetch', 'matches', 'ln-cc', 'lncc', 'antonioli', 'dover street market',
    'dsm', 'selfridges', 'browns', 'net-a-porter', 'luisaviaroma',
    'matchesfashion', 'nordstrom.com/brands/designer' // Only designer Nordstrom section
  ];

  const editorialResults = results.filter((result: any) => {
    const source = (result.source || '').toLowerCase();
    const link = (result.link || '').toLowerCase();
    return editorialRetailers.some(retailer => 
      source.includes(retailer) || link.includes(retailer)
    );
  });

  // If we have editorial results, return them. Otherwise return all (better than nothing)
  return editorialResults.length > 0 ? editorialResults : results;
}

export default app;
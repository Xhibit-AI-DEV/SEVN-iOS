export function TechnicalArchitecture() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl mb-8 text-white text-center">SEVN Stylist Admin - Technical Architecture</h1>
        
        {/* Architecture Diagram */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-xl mb-6 text-white">System Architecture</h2>
          
          {/* Three-Tier Architecture */}
          <div className="space-y-8">
            
            {/* TIER 1: Frontend */}
            <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-900/20">
              <h3 className="text-lg mb-4 text-blue-400">TIER 1: Frontend (React + Tailwind)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">App.tsx</h4>
                  <p className="text-xs text-gray-300">Main application entry point</p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">StylistWorkspace.tsx</h4>
                  <p className="text-xs text-gray-300">Main workspace container</p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">CustomerInfo.tsx</h4>
                  <p className="text-xs text-gray-300">Display customer data from Contentful</p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">AiSearchPanel.tsx</h4>
                  <p className="text-xs text-gray-300">AI-powered product search</p>
                </div>
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">SelectionsPanel.tsx</h4>
                  <p className="text-xs text-gray-300">Manage 7 selections, save, send email</p>
                </div>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="text-center text-gray-500">
              <div className="text-2xl">↓</div>
              <p className="text-xs">HTTPS Requests</p>
              <p className="text-xs text-blue-400">Authorization: Bearer {'{publicAnonKey}'}</p>
            </div>

            {/* TIER 2: Backend (Hono Server on Supabase Edge Functions) */}
            <div className="border-2 border-green-500 rounded-lg p-6 bg-green-900/20">
              <h3 className="text-lg mb-4 text-green-400">TIER 2: Backend (Hono Server on Supabase Edge Functions)</h3>
              <p className="text-xs text-gray-300 mb-4">Base URL: https://{'{projectId}'}.supabase.co/functions/v1/make-server-b14d984c/</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded border-l-4 border-purple-500">
                  <h4 className="text-sm mb-2 text-white">index.tsx</h4>
                  <p className="text-xs text-gray-300 mb-2">Main Hono server with CORS</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Deno.serve(app.fetch)</li>
                    <li>• Routes all requests</li>
                    <li>• Logger middleware</li>
                  </ul>
                </div>

                <div className="bg-gray-700 p-4 rounded border-l-4 border-yellow-500">
                  <h4 className="text-sm mb-2 text-white">contentful.tsx</h4>
                  <p className="text-xs text-gray-300 mb-2">Contentful CMS Integration</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• GET /clients - List all clients</li>
                    <li>• GET /clients/:id - Get client by ID</li>
                    <li>• GET /stylists - List all stylists</li>
                    <li>• GET /stylists/:id - Get stylist by ID</li>
                    <li>• GET /assets/:id - Get asset/image</li>
                  </ul>
                </div>

                <div className="bg-gray-700 p-4 rounded border-l-4 border-pink-500">
                  <h4 className="text-sm mb-2 text-white">selections.tsx</h4>
                  <p className="text-xs text-gray-300 mb-2">Core selections logic</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• POST /selections/save - Save selections to DB</li>
                    <li>• GET /selections/get/:id - Load selections</li>
                    <li>• POST /selections/fetch-metadata - Get product info</li>
                    <li>• POST /selections/migrate-images - Re-host images</li>
                    <li>• POST /selections/fix-bucket - Make bucket public</li>
                    <li>• DELETE /selections/delete/:id - Clear all</li>
                    <li>• <strong>Image Hosting:</strong> Downloads external product images, uploads to Supabase Storage, returns public URLs</li>
                  </ul>
                </div>

                <div className="bg-gray-700 p-4 rounded border-l-4 border-red-500">
                  <h4 className="text-sm mb-2 text-white">sendgrid.tsx</h4>
                  <p className="text-xs text-gray-300 mb-2">Email delivery via SendGrid</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• POST /sendgrid/send-draft</li>
                    <li>• Template ID: d-167e6b7fee4d498fb49335864211eb4e</li>
                    <li>• Sender: dov@sevn.app</li>
                    <li>• Dynamic template data with 7 items</li>
                  </ul>
                </div>

                <div className="bg-gray-700 p-4 rounded border-l-4 border-cyan-500">
                  <h4 className="text-sm mb-2 text-white">ai-search.tsx</h4>
                  <p className="text-xs text-gray-300 mb-2">AI-powered product search</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• POST /ai-search/search</li>
                    <li>• Uses OpenAI GPT-4</li>
                    <li>• Searches via Serper API</li>
                    <li>• Returns product URLs</li>
                  </ul>
                </div>

                <div className="bg-gray-700 p-4 rounded border-l-4 border-orange-500">
                  <h4 className="text-sm mb-2 text-white">kv_store.tsx (READ ONLY)</h4>
                  <p className="text-xs text-gray-300 mb-2">Database utilities</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• get(key) - Get single value</li>
                    <li>• set(key, value) - Set value</li>
                    <li>• mget(keys[]) - Get multiple</li>
                    <li>• getByPrefix(prefix) - Query by prefix</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Arrow Down */}
            <div className="text-center text-gray-500">
              <div className="text-2xl">↓</div>
              <p className="text-xs">Supabase Client with SERVICE_ROLE_KEY</p>
            </div>

            {/* TIER 3: Data Layer */}
            <div className="border-2 border-orange-500 rounded-lg p-6 bg-orange-900/20">
              <h3 className="text-lg mb-4 text-orange-400">TIER 3: Data Layer</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">Supabase Postgres</h4>
                  <p className="text-xs text-gray-300 mb-2">Key-Value Store</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Table: kv_store_b14d984c</li>
                    <li>• Columns: key, value</li>
                    <li>• Stores all selections data</li>
                  </ul>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">Supabase Storage</h4>
                  <p className="text-xs text-gray-300 mb-2">Image Hosting</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Bucket: make-b14d984c-product-images</li>
                    <li>• <strong>PUBLIC bucket</strong></li>
                    <li>• Stores product images</li>
                    <li>• Public URLs for email compatibility</li>
                  </ul>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">Contentful CMS</h4>
                  <p className="text-xs text-gray-300 mb-2">Content Source</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Space: 1inmo0bc6xc9</li>
                    <li>• Environment: master</li>
                    <li>• Content Types: client, stylist</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* External Services */}
            <div className="border-2 border-purple-500 rounded-lg p-6 bg-purple-900/20">
              <h3 className="text-lg mb-4 text-purple-400">External Services</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">SendGrid</h4>
                  <p className="text-xs text-gray-300">Email delivery service</p>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">OpenAI GPT-4</h4>
                  <p className="text-xs text-gray-300">AI search intelligence</p>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">Serper API</h4>
                  <p className="text-xs text-gray-300">Google search results</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Flow Documentation */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-xl mb-6 text-white">Data Configuration</h2>
          
          <div className="space-y-6">
            
            {/* Contentful Structure */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="text-lg mb-3 text-yellow-400">Contentful CMS Structure</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">Content Type: "client"</h4>
                  <div className="text-xs text-gray-300 space-y-1 font-mono">
                    <div>• <strong>name</strong>: Text (client name)</div>
                    <div>• <strong>email</strong>: Rich Text Document (client email)</div>
                    <div>• <strong>intake_answers</strong>: Rich Text Document (questionnaire responses)</div>
                    <div>• <strong>stylist_id</strong>: Rich Text Document (assigned stylist ID)</div>
                    <div>• <strong>images</strong>: Media (array of asset references)</div>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded">
                  <h4 className="text-sm mb-2 text-white">Content Type: "stylist"</h4>
                  <div className="text-xs text-gray-300 space-y-1 font-mono">
                    <div>• <strong>fullname</strong>: Text (stylist full name)</div>
                    <div>• <strong>bio</strong>: Rich Text Document (contains title like "STUDIO STYLIST")</div>
                    <div>• <strong>profile_picture</strong>: Media (asset reference)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Database Structure */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="text-lg mb-3 text-green-400">Supabase Database Structure</h3>
              
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="text-sm mb-2 text-white">Table: kv_store_b14d984c</h4>
                <div className="text-xs text-gray-300 mb-3">Key-Value pairs storing all selections data</div>
                
                <div className="text-xs text-gray-300 space-y-2 font-mono">
                  <div className="bg-gray-800 p-3 rounded">
                    <strong>Key Format:</strong> selections:{'{customerId}'}
                  </div>
                  
                  <div className="bg-gray-800 p-3 rounded">
                    <strong>Value Structure (JSON):</strong>
                    <pre className="mt-2 text-xs overflow-x-auto">{`{
  "customerId": "abc123",
  "clientEmail": "customer@example.com",
  "clientName": "John Doe",
  "clientImage": "https://...",
  "stylistName": "Jane Smith",
  "stylistImage": "https://...",
  "stylingNotes": "Casual style...",
  "intakeAnswers": "Q: Style? A: Modern...",
  "items": [
    {
      "id": "unique-id-1",
      "url": "https://product-url.com",
      "image": "https://.../public-hosted-image.jpg",
      "title": "Product Name",
      "price": "$99.99",
      "description": "Product details"
    }
    // ... up to 7 items
  ],
  "updatedAt": "2025-12-08T..."
}`}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Structure */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="text-lg mb-3 text-blue-400">Supabase Storage Structure</h3>
              
              <div className="bg-gray-700 p-4 rounded">
                <h4 className="text-sm mb-2 text-white">Bucket: make-b14d984c-product-images</h4>
                <div className="text-xs text-gray-300 space-y-2">
                  <div>• <strong>Visibility:</strong> PUBLIC (critical for email images)</div>
                  <div>• <strong>File naming:</strong> {'{customerId}'}/{'{timestamp}'}-{'{hash}'}.jpg</div>
                  <div>• <strong>Purpose:</strong> Host product images permanently with public URLs</div>
                  <div>• <strong>Why:</strong> Email clients cannot access private URLs or signed URLs reliably</div>
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="text-lg mb-3 text-red-400">Required Environment Variables</h3>
              
              <div className="bg-gray-700 p-4 rounded text-xs text-gray-300 space-y-2 font-mono">
                <div>• <strong>CONTENTFUL_SPACE_ID</strong>: 1inmo0bc6xc9</div>
                <div>• <strong>CONTENTFUL_ENVIRONMENT</strong>: master</div>
                <div>• <strong>CONTENTFUL_ACCESS_TOKEN</strong>: {'<provided>'}</div>
                <div>• <strong>SENDGRID_API_KEY</strong>: {'<provided>'}</div>
                <div>• <strong>OPENAI_API_KEY</strong>: {'<provided>'}</div>
                <div>• <strong>SERPER_API_KEY</strong>: {'<provided>'}</div>
                <div>• <strong>SUPABASE_URL</strong>: Auto-configured</div>
                <div>• <strong>SUPABASE_ANON_KEY</strong>: Auto-configured</div>
                <div>• <strong>SUPABASE_SERVICE_ROLE_KEY</strong>: Auto-configured (server only)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Flows */}
        <div className="bg-gray-800 rounded-lg p-8">
          <h2 className="text-xl mb-6 text-white">Critical Data Flows</h2>
          
          <div className="space-y-6">
            
            {/* Flow 1: Add Item */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="text-lg mb-3 text-blue-400">1. Add Item Flow</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 min-w-[24px]">→</div>
                  <div>User adds product URL (manual or AI search)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 min-w-[24px]">→</div>
                  <div>Frontend calls POST /selections/fetch-metadata with URL</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 min-w-[24px]">→</div>
                  <div>Backend scrapes product page for metadata (title, price, image)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 min-w-[24px]">→</div>
                  <div><strong>CRITICAL:</strong> Backend downloads product image from external URL</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 min-w-[24px]">→</div>
                  <div><strong>CRITICAL:</strong> Backend uploads image to Supabase Storage (PUBLIC bucket)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 min-w-[24px]">→</div>
                  <div><strong>CRITICAL:</strong> Backend returns permanent public URL (not original URL)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 min-w-[24px]">→</div>
                  <div>Frontend displays item with hosted image</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 min-w-[24px]">→</div>
                  <div>Item automatically saved to database immediately</div>
                </div>
              </div>
            </div>

            {/* Flow 2: Send Email */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="text-lg mb-3 text-green-400">2. Send Email Flow (Save-First-Then-Send)</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="text-green-400 min-w-[24px]">→</div>
                  <div>User clicks "Send" button</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 min-w-[24px]">→</div>
                  <div>Frontend fetches customer data from Contentful (email, name, image, intake)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 min-w-[24px]">→</div>
                  <div>Frontend fetches assigned stylist data from Contentful (name, image)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 min-w-[24px]">→</div>
                  <div><strong>STEP 1:</strong> Frontend saves all data to backend via POST /selections/save</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 min-w-[24px]">→</div>
                  <div><strong>STEP 2:</strong> Frontend loads saved data via GET /selections/get/:id</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 min-w-[24px]">→</div>
                  <div><strong>STEP 3:</strong> Frontend sends email using backend data (with public image URLs)</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 min-w-[24px]">→</div>
                  <div>Backend calls SendGrid API with dynamic template data</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 min-w-[24px]">→</div>
                  <div>SendGrid sends email to customer using template d-167e6b7fee4d498fb49335864211eb4e</div>
                </div>
              </div>
            </div>

            {/* Flow 3: Image Migration */}
            <div className="border border-gray-700 rounded p-4">
              <h3 className="text-lg mb-3 text-orange-400">3. Re-host Images Flow (Fix Broken Images)</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="text-orange-400 min-w-[24px]">→</div>
                  <div>User clicks "Re-host Images" button</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-orange-400 min-w-[24px]">→</div>
                  <div>Frontend calls POST /selections/migrate-images/:customerId</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-orange-400 min-w-[24px]">→</div>
                  <div>Backend loads existing selections from database</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-orange-400 min-w-[24px]">→</div>
                  <div>For each item: download image, upload to public bucket, get new URL</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-orange-400 min-w-[24px]">→</div>
                  <div>Backend updates database with new public URLs</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-orange-400 min-w-[24px]">→</div>
                  <div>Frontend shows success message</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-orange-400 min-w-[24px]">→</div>
                  <div>User refreshes page to see updated images</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Known Issues */}
        <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-8">
          <h2 className="text-xl mb-6 text-red-400">⚠️ Current Issues to Debug</h2>
          
          <div className="space-y-4 text-sm text-gray-300">
            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-white mb-2">1. Image Re-hosting Not Working</h3>
              <div className="space-y-1 text-xs">
                <div>• Bucket is now PUBLIC</div>
                <div>• Old images uploaded when bucket was private have broken URLs</div>
                <div>• Re-host function should download and re-upload images</div>
                <div>• Page reloads causing white screen issue</div>
                <div><strong>Fix needed:</strong> Debug /selections/migrate-images endpoint, check console logs</div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-white mb-2">2. Page Refresh After Re-hosting</h3>
              <div className="space-y-1 text-xs">
                <div>• Automatic page reload removed</div>
                <div>• User must manually refresh (F5) after re-hosting</div>
                <div><strong>Better fix:</strong> Frontend should reload data without full page refresh</div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded">
              <h3 className="text-white mb-2">3. Recommended Debug Steps</h3>
              <div className="space-y-1 text-xs">
                <div>• Check browser console for error logs</div>
                <div>• Check Supabase Storage bucket is truly PUBLIC</div>
                <div>• Test image upload endpoint directly: POST /selections/fetch-metadata</div>
                <div>• Verify image URLs in database match public bucket URLs</div>
                <div>• Test email send with known-good customer data</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

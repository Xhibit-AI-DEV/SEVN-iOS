export function ArchitectureDiagram() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-gray-900">SEVN Stylist Admin</h1>
          <h2 className="text-2xl text-gray-600 mb-2">Technical Architecture</h2>
          <p className="text-gray-500">Three-Tier Architecture - December 2025</p>
        </div>

        {/* Main Architecture Diagram */}
        <div className="bg-gray-50 border-4 border-gray-900 rounded-2xl p-12 mb-12">
          
          {/* TIER 1: Frontend */}
          <div className="mb-8">
            <div className="bg-blue-600 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl text-center">TIER 1: FRONTEND</h3>
              <p className="text-center text-blue-100 text-sm">React + Tailwind CSS (Vite)</p>
            </div>
            <div className="bg-blue-50 border-4 border-blue-600 rounded-b-xl p-6 grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm mb-2 text-gray-900">App.tsx</div>
                <div className="text-xs text-gray-600">Customer selection & routing</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm mb-2 text-gray-900">CustomerList.tsx</div>
                <div className="text-xs text-gray-600">Customer sidebar (60px)</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm mb-2 text-gray-900">StylistWorkspace.tsx</div>
                <div className="text-xs text-gray-600">Main workspace container</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm mb-2 text-gray-900">CustomerIntakePanel.tsx</div>
                <div className="text-xs text-gray-600">Display customer data</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm mb-2 text-gray-900">AiSearchPanel.tsx</div>
                <div className="text-xs text-gray-600">AI product search + voice</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm mb-2 text-gray-900">SelectionsPanel.tsx</div>
                <div className="text-xs text-gray-600">7 selections + email send</div>
              </div>
            </div>
          </div>

          {/* Connection Arrow */}
          <div className="text-center my-8">
            <div className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full">
              <div className="text-sm mb-1">↓ HTTPS Requests ↓</div>
              <div className="text-xs text-gray-300">Authorization: Bearer {'{publicAnonKey}'}</div>
              <div className="text-xs text-gray-400">https://{'{projectId}'}.supabase.co/functions/v1/make-server-b14d984c/</div>
            </div>
          </div>

          {/* TIER 2: Backend */}
          <div className="mb-8">
            <div className="bg-green-600 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl text-center">TIER 2: BACKEND</h3>
              <p className="text-center text-green-100 text-sm">Hono Server on Supabase Edge Functions (Deno)</p>
            </div>
            <div className="bg-green-50 border-4 border-green-600 rounded-b-xl p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                  <div className="text-sm mb-2 text-gray-900">index.tsx</div>
                  <div className="text-xs text-gray-600 mb-2">Main Hono server + CORS</div>
                  <div className="text-xs text-purple-600">Deno.serve(app.fetch)</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                  <div className="text-sm mb-2 text-gray-900">Contentful Routes</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• GET /customers - List clients</div>
                    <div>• GET /stylists - List stylists</div>
                    <div>• GET /assets/:id - Get images</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-pink-500">
                  <div className="text-sm mb-2 text-gray-900">selections.tsx</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• POST /save - Save to DB</div>
                    <div>• GET /get/:id - Load from DB</div>
                    <div>• POST /fetch-metadata</div>
                    <div className="text-pink-600">↳ Image hosting logic</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                  <div className="text-sm mb-2 text-gray-900">sendgrid.tsx</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• POST /send-draft</div>
                    <div>• Template: d-167e6b...</div>
                    <div>• From: dov@sevn.app</div>
                    <div className="text-red-600 mt-2">Email includes:</div>
                    <div className="text-red-600">• Client image & name</div>
                    <div className="text-red-600">• Stylist image & name</div>
                    <div className="text-red-600">• Styling notes</div>
                    <div className="text-red-600">• 7 product items</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-cyan-500">
                  <div className="text-sm mb-2 text-gray-900">ai-search.tsx</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• POST /search</div>
                    <div>• OpenAI GPT-4</div>
                    <div>• Serper API</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Arrow */}
          <div className="text-center my-8">
            <div className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full">
              <div className="text-sm mb-1">↓ Supabase Client ↓</div>
              <div className="text-xs text-gray-300">SERVICE_ROLE_KEY (server only)</div>
            </div>
          </div>

          {/* TIER 3: Data Layer */}
          <div>
            <div className="bg-orange-600 text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-2xl text-center">TIER 3: DATA LAYER</h3>
              <p className="text-center text-orange-100 text-sm">Supabase Postgres + Storage + Contentful CMS</p>
            </div>
            <div className="bg-orange-50 border-4 border-orange-600 rounded-b-xl p-6 grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm mb-2 text-gray-900">Supabase Postgres</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Table: kv_store_b14d984c</div>
                  <div>• key: TEXT</div>
                  <div>• value: JSONB</div>
                  <div className="text-orange-600 mt-2">Stores all selections data</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm mb-2 text-gray-900">Supabase Storage</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Bucket: make-b14d984c-product-images</div>
                  <div className="text-orange-600">✓ PUBLIC bucket</div>
                  <div className="mt-2">Hosts product images</div>
                  <div>Public URLs for email</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-sm mb-2 text-gray-900">Contentful CMS</div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Space: 1inmo0bc6xc9</div>
                  <div>Environment: master</div>
                  <div className="mt-2">Content Types:</div>
                  <div>• client (customers)</div>
                  <div>• stylist (stylists)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* External Services */}
        <div className="bg-purple-50 border-4 border-purple-600 rounded-xl p-6 mb-12">
          <h3 className="text-xl mb-4 text-center text-purple-900">EXTERNAL SERVICES</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-lg mb-2 text-gray-900">SendGrid</div>
              <div className="text-xs text-gray-600">Email delivery service</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-lg mb-2 text-gray-900">OpenAI GPT-4</div>
              <div className="text-xs text-gray-600">AI search intelligence</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-lg mb-2 text-gray-900">Serper API</div>
              <div className="text-xs text-gray-600">Google search results</div>
            </div>
          </div>
        </div>

        {/* Critical Image Hosting Flow */}
        <div className="bg-pink-50 border-4 border-pink-600 rounded-xl p-8">
          <h3 className="text-2xl mb-6 text-center text-pink-900">⚠️ CRITICAL: Image Hosting Flow</h3>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</div>
                <div className="text-sm text-gray-900">User adds product URL (manual or AI search)</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</div>
                <div className="text-sm text-gray-900">Frontend calls <code className="bg-gray-100 px-2 py-1 rounded">POST /selections/fetch-metadata</code></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">3</div>
                <div className="text-sm text-gray-900">Backend scrapes product page for metadata (title, price, image URL)</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">4</div>
                <div className="text-sm text-gray-900">Backend <strong>downloads image</strong> from external URL</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">5</div>
                <div className="text-sm text-gray-900">Backend <strong>uploads image to Supabase Storage</strong> (PUBLIC bucket)</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">6</div>
                <div className="text-sm text-gray-900">Backend returns <strong>permanent public URL</strong> (not original URL!)</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-pink-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">7</div>
                <div className="text-sm text-gray-900">Public URL stored in database and used in email</div>
              </div>
            </div>
            <div className="mt-6 bg-yellow-100 border-2 border-yellow-500 rounded p-4">
              <div className="text-sm text-yellow-900">
                <strong>Why PUBLIC bucket?</strong> Email clients (Gmail, Outlook) cannot access private URLs, signed URLs, or external URLs with authentication. 
                All product images MUST be hosted in a public Supabase Storage bucket for email compatibility.
              </div>
            </div>
          </div>
        </div>

        {/* Key Data Structures */}
        <div className="mt-12 bg-gray-50 border-4 border-gray-900 rounded-xl p-8">
          <h3 className="text-2xl mb-6 text-center text-gray-900">KEY DATA STRUCTURES</h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Database Structure */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="text-lg mb-3 text-gray-900">Database (kv_store)</h4>
              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-xs overflow-x-auto">
                <pre>{`Key: selections:{customerId}

Value (JSON):
{
  "customerId": "abc123",
  "clientEmail": "user@example.com",
  "clientName": "John Doe",
  "stylistName": "Jane Smith",
  "intakeAnswers": "Q: Style? A: ...",
  "items": [
    {
      "id": "unique-id",
      "url": "https://product.com",
      "image": "https://{projectId}
        .supabase.co/storage/v1/
        object/public/...",
      "title": "Product Name",
      "price": "$99.99"
    }
    // ... up to 7 items
  ]
}`}</pre>
              </div>
            </div>

            {/* Contentful Structure */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h4 className="text-lg mb-3 text-gray-900">Contentful Content Types</h4>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-300 rounded p-3">
                  <div className="text-sm mb-2 text-gray-900"><strong>client</strong></div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div>• name (Text)</div>
                    <div>• email (Rich Text Document)</div>
                    <div>• intake_answers (Rich Text Document)</div>
                    <div>• stylist_id (Rich Text Document)</div>
                    <div>• images (Media - Array)</div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-300 rounded p-3">
                  <div className="text-sm mb-2 text-gray-900"><strong>stylist</strong></div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div>• fullname (Text)</div>
                    <div>• bio (Rich Text Document)</div>
                    <div>• profile_picture (Media)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>SEVN Stylist Admin Technical Architecture</p>
          <p>Last Updated: December 8, 2025</p>
          <p className="mt-2">For detailed documentation, see <code className="bg-gray-100 px-2 py-1 rounded">/TECHNICAL_ARCHITECTURE.md</code></p>
        </div>
      </div>
    </div>
  );
}
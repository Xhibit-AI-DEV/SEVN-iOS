# Product Search Providers

Your app has **7 different product search options** integrated. Currently using: **Serper API** (Google Shopping)

## 🏆 ACTIVE: Serper API (RECOMMENDED)
**Cost:** $50 for 10,000 searches  
**Pros:** Real Google Shopping results, accurate pricing, high-quality images, best for fashion  
**Setup:** Add `SERPER_API_KEY` (✅ Already done!)

```tsx
// GPTSearchPanel.tsx line 303
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/serper-search/search`,
```

---

## 🔄 How to Switch Search Providers

Just change the URL in `/components/GPTSearchPanel.tsx` (line ~303):

### 1. **Serper API** - Google Shopping (Current)
```tsx
`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/serper-search/search`
```
**Required:** `SERPER_API_KEY`

### 2. **SerpAPI** - Google Shopping
```tsx
`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/shopping/search`
```
**Required:** `SERPAPI_KEY` (different from Serper!)

### 3. **Tavily Search** - AI-powered product search
```tsx
`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/tavily-search/search`
```
**Required:** `TAVILY_API_KEY` (1000 free searches/month)

### 4. **Brave Search** - Privacy-focused
```tsx
`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/brave-search/search`
```
**Required:** `BRAVE_API_KEY`

### 5. **Web Scraper** - FREE (No API key needed)
```tsx
`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/web-scraper/search`
```
**Required:** Nothing! Scrapes SSENSE, Grailed, etc.

### 6. **Jina Search** - Hybrid approach
```tsx
`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/jina-search/search`
```
**Required:** `JINA_API_KEY` (optional, has fallback)

### 7. **GPT Browser** - AI-powered site search
```tsx
`https://${projectId}.supabase.co/functions/v1/make-server-b14d984c/gpt-browser/search`
```
**Required:** `OPENAI_API_KEY` (✅ Already configured)

---

## 💡 Recommendations

**Best Overall:** Serper API (current) - Real Google Shopping, accurate prices  
**Best Free:** Web Scraper - No API key, works immediately  
**Best for AI:** GPT Browser - Uses your existing OpenAI key  

---

## 🔧 Your Current Setup

✅ **SERPER_API_KEY** - Active  
✅ **OPENAI_API_KEY** - Active  
✅ **Contentful** - Active  

Try searching for "vintage denim jacket" to test Serper!

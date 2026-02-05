# 🎨 Lissy's AI Stylist - Complete Setup

## ✅ What's Been Built

Your AI assistant is now live with Lissy's exact styling voice and capabilities!

---

## 🎯 How It Works

### 1. **AI Personality**
The AI speaks in Lissy's voice:
- Fashion-forward, editorial tone (Dazed/i-D style)
- Expert-level fashion insight
- Global trend fluency
- Draws from Paris Fashion Week, Shanghai, CFDA New Guards
- No poetry, no emojis, just precision

### 2. **Strict Product Mode**
✅ ONLY shoppable products with:
- Valid image
- Product name
- Brand
- Price
- Direct link

❌ ZERO moodboards or inspiration images

### 3. **Smart Commands**

The AI can execute actions when you say:

| Command | What It Does | Example |
|---------|--------------|---------|
| **"add to library"** | Saves product to Lissy's permanent library | "Add this Comme des Garçons jacket to library" |
| **"add to selects"** | Adds product to current customer's 7 selects | "Add to selects" |
| **Normal chat** | Finds and recommends products | "Show me minimal white sneakers under $200" |

---

## 💬 Example Conversations

### Finding Products
**You:** Show me experimental streetwear tops under $300

**AI:** [Lists 5-7 products with images, names, brands, prices, links]

### Adding to Library
**You:** Show me Issey Miyake pleated pants

**AI:** [Shows products]

**You:** Add the second one to library

**AI:** ✅ Added Issey Miyake Pleated Trousers by Issey Miyake to library

### Adding to Customer's Selects
**You:** Find a statement coat for this client

**AI:** [Shows products]

**You:** Add to selects

**AI:** ✅ Added Oversized Wool Coat to this customer's selects

---

## 🧠 Training & Learning

### Current Training Data Collection
- All conversations are stored with `conversationId`
- Tracks what Lissy adds to library
- Records which items she selects for clients
- Logs her preferences and rejections

### Future Training Options

**Option 1: Export Training Data**
- Periodically export conversation history
- Format as OpenAI fine-tuning dataset
- Train custom model on Lissy's taste

**Option 2: Use Library as Taste Profile**
- Items in library = what Lissy approves
- Use this to inform future recommendations
- Build a "Lissy aesthetic" database

**Option 3: Preference Learning**
- Track brands she uses most
- Note price ranges per category
- Learn silhouette preferences
- Identify her "signatures"

---

## 📚 Library System

### What's Stored
When you say "add to library", items are saved with:
- Product URL
- Product name
- Brand
- Price
- Image URL
- Category
- Timestamp

### Accessing Library
Current: Items stored in backend KV store

**To view library items:**
```
GET https://{projectId}.supabase.co/functions/v1/make-server-b14d984c/openai/library
```

### Future: Migrate to Contentful
Create a "library" content type in Contentful with fields:
- productUrl (Text)
- productName (Text)
- brand (Text)
- price (Text)
- imageUrl (Text)
- category (Text)
- addedAt (Date)

Then update `/supabase/functions/server/openai.tsx` to write to Contentful instead of KV.

---

## 🎨 Customizing the AI

### Edit System Prompt
Open `/supabase/functions/server/openai.tsx` and modify the system message:

```typescript
// Add brand preferences
systemMessage.content += `\n\nPreferred Retailers:
- Dover Street Market
- SSENSE
- Matches Fashion
- The Broken Arm
- Totokaelo`;

// Add price guidelines
systemMessage.content += `\n\nPrice Guidelines:
- Tops: $100-$400
- Bottoms: $150-$600
- Outerwear: $300-$1200
- Shoes: $200-$700`;

// Add style rules
systemMessage.content += `\n\nStyling Rules:
- Always include one statement piece
- Neutral palette with one bold accent
- Mix high/low if intentional
- Consider global subcultures`;
```

### Adjust Temperature
More creative: `temperature: 0.9`
More consistent: `temperature: 0.5`
Current: `temperature: 0.7`

---

## 🚀 Usage Tips

### Best Practices
1. **Be specific**: "White Margiela Tabis" > "white shoes"
2. **Use commands clearly**: Say exact phrase "add to library"
3. **Provide context**: Share customer's style in chat
4. **Review before adding**: Check products match aesthetic

### Shortcuts
- Voice input still works for URLs
- Click "+ Add all links" to bulk add from AI response
- Manual paste still available in selections panel

### Customer Context
The AI automatically sees:
- Customer email
- All intake form data
- Uploaded images (referenced in context)

---

## 📊 Next Steps

### Immediate
- [x] AI with Lissy's voice ✅
- [x] Function calling for library/selects ✅
- [x] Conversation tracking ✅

### Short Term
- [ ] Export library to Contentful
- [ ] Build library browser UI
- [ ] Add search/filter to library
- [ ] Track "reject" actions too

### Long Term
- [ ] Export training data for fine-tuning
- [ ] Create custom GPT-4 model
- [ ] Predictive recommendations
- [ ] Auto-capsule generation

---

## 🔧 Technical Details

### Function Calling
The AI uses OpenAI's function calling to trigger actions:
- `add_to_library(productUrl, productName, brand, price, imageUrl, category)`
- `add_to_selects(productUrl, productName, brand, price, imageUrl)`

### Storage
- **Library**: KV store (`library:{timestamp}`)
- **Conversations**: KV store (`conversation:{customerId}`)
- **Selects**: KV store (`selections:{customerId}`)

### API Endpoints
- `POST /openai/chat` - Send messages to AI
- `POST /openai/add-to-library` - Add item to library
- `GET /openai/library` - Get all library items

---

## 💡 Pro Tips

1. **Train over time**: The more you use it, the better the training data
2. **Be consistent**: Use same commands for same actions
3. **Curate library**: Only add items that truly reflect Lissy's taste
4. **Review periodically**: Export and analyze conversation patterns
5. **Iterate system prompt**: Refine based on real usage

---

## 🆘 Troubleshooting

**AI doesn't execute commands?**
- Make sure to say exact phrase: "add to library" or "add to selects"
- Check that product info was included in previous message

**Wrong tone/style?**
- Edit system prompt in `/supabase/functions/server/openai.tsx`
- Be more specific about what NOT to do

**Want different model?**
- Change `model: 'gpt-4o-mini'` to `gpt-4o` or `gpt-4-turbo`
- Note: Mini is faster, cheaper, and has higher rate limits

**Rate limit errors?**
✅ **Automatic retry**: System retries 3 times with delays (1s, 2s, 4s)
✅ **Using gpt-4o-mini**: Faster, cheaper, higher limits than GPT-4
✅ **Solutions if still hitting limits:**
- Wait 60 seconds between requests
- OpenAI free tier: 3 requests/minute, 200 requests/day
- Tier 1 ($5+ spent): 500 requests/minute
- Check usage: platform.openai.com/account/usage
- Upgrade plan: platform.openai.com/settings/organization/billing

---

Ready to curate! 🎨
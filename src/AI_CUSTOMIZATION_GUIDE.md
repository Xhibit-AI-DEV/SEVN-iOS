# AI Stylist Customization Guide

## ✅ Setup Complete!

Your OpenAI API integration is now live. The AI can see customer intake data and help find products.

---

## 🎨 How to Customize the AI's Behavior

### Option 1: Edit System Instructions (Quick & Easy)

Open `/supabase/functions/server/openai.tsx` and modify the `systemMessage.content`:

```typescript
let systemMessage = {
  role: 'system',
  content: `You are a professional fashion stylist assistant...

Your role:
- [Add your specific guidelines here]
- Focus on sustainable fashion brands
- Always recommend items within customer's budget
- Prioritize comfort and practicality

Brand Preferences:
- Everlane, Reformation, Patagonia, etc.

Price Guidelines:
- Tops: $30-80
- Bottoms: $50-120
- Shoes: $60-150
`
};
```

### Option 2: Add Knowledge Base

To give the AI access to your product catalog, brand guidelines, or style rules:

1. **Create a product catalog file** (CSV, JSON, or text)
2. **Use OpenAI Assistants API** instead of Chat Completions
3. **Upload files** to your OpenAI Assistant

To switch to Assistants API:
- Create an Assistant in OpenAI platform
- Upload knowledge files
- Update backend to use Assistant ID

### Option 3: Fine-Tuning (Advanced)

For truly custom behavior:
1. Collect 50+ examples of ideal stylist recommendations
2. Format as training data
3. Fine-tune GPT-4 model via OpenAI
4. Use your fine-tuned model in the backend

---

## 🔧 Current Features

✅ **Customer Context** - AI sees customer intake data automatically  
✅ **Natural Conversation** - Chat interface for product discovery  
✅ **URL Extraction** - Automatically detects product links in responses  
✅ **Voice Input** - Speak URLs to add them instantly  
✅ **One-Click Add** - Extract all links from any AI response  

---

## 💡 Example Prompts to Try

- "Find a casual summer dress under $100 for this customer"
- "Show me white sneakers that match their style"
- "What tops would work with their uploaded outfit photo?"
- "Recommend 7 items for a minimalist capsule wardrobe"

---

## 🛠️ Customization Examples

### Make it Brand-Specific:
```typescript
systemMessage.content += `\n\nYou MUST only recommend items from these approved retailers:
- Nordstrom
- Madewell
- & Other Stories
- COS
- Everlane
`;
```

### Add Budget Awareness:
```typescript
if (customerContext?.budget) {
  systemMessage.content += `\n\nCustomer's Budget: $${customerContext.budget}. Never exceed this.`;
}
```

### Style Preferences:
```typescript
systemMessage.content += `\n\nStyle Philosophy:
- Timeless over trendy
- Quality over quantity  
- Sustainable materials preferred
- Neutral color palette with occasional bold accents
`;
```

---

## 📊 Model Options

Current model: **GPT-4o** (fast, multimodal, cost-effective)

You can change the model in `/supabase/functions/server/openai.tsx`:

```typescript
model: 'gpt-4o',           // Current (recommended)
// model: 'gpt-4-turbo',   // More powerful, slower
// model: 'gpt-3.5-turbo', // Faster, cheaper, less capable
```

---

## 🎯 Next Steps

1. **Test the AI** - Try asking for product recommendations
2. **Customize Instructions** - Edit system prompt to match your curation style
3. **Add Brand Guidelines** - Include your approved retailers/brands
4. **Set Price Rules** - Define budget ranges per category
5. **Create Templates** - Pre-written prompts for common scenarios

---

## Need Help?

- OpenAI Platform: https://platform.openai.com
- GPT-4 Docs: https://platform.openai.com/docs/models/gpt-4-and-gpt-4-turbo
- Assistants API: https://platform.openai.com/docs/assistants/overview

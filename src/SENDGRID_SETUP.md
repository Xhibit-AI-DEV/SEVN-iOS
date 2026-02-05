# SendGrid Email Template Setup Guide

## Overview
This guide will help you set up a SendGrid Dynamic Template to send beautiful email drafts with 7 product selections to your customers.

## Step 1: Get Your SendGrid API Key

1. Go to [SendGrid](https://sendgrid.com/) and sign in (or create a free account)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it "Stylist Admin" and select **Full Access**
5. Copy the API key
6. In Figma Make, add the API key to the **SENDGRID_API_KEY** secret (already created for you)

## Step 2: Verify Your Sender Email

1. In SendGrid, go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Enter your email address (e.g., stylist@yourdomain.com)
4. Fill out the form and click **Create**
5. Check your email and click the verification link

## Step 3: Create the Dynamic Template

1. In SendGrid, go to **Email API** → **Dynamic Templates**
2. Click **Create a Dynamic Template**
3. Name it "7 Selects - Customer Draft"
4. Click on the template to edit it
5. Click **Add Version** → **Blank Template** → **Code Editor**

## Step 4: Template Code

Paste this HTML into the code editor:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #000000;
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .product-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-top: 30px;
    }
    .product-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      display: block;
    }
    .product-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
      background-color: #f9f9f9;
    }
    .product-info {
      padding: 20px;
    }
    .product-name {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 10px 0;
      color: #000000;
    }
    .product-price {
      font-size: 18px;
      font-weight: 700;
      color: #0066cc;
      margin: 0;
    }
    .footer {
      background-color: #000000;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px; letter-spacing: 3px;">YOUR SELECTS</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 16px; margin: 0 0 10px 0;">Hi {{customer_name}},</p>
      <p style="font-size: 14px; color: #666666; line-height: 1.6;">
        We've curated these special pieces just for you based on your style preferences. 
        Click on any item to learn more or make a purchase.
      </p>
      
      <div class="product-grid">
        {{#if item1_url}}
        <a href="{{item1_url}}" class="product-item" target="_blank">
          {{#if item1_image}}
          <img src="{{item1_image}}" alt="{{item1_name}}" class="product-image">
          {{/if}}
          <div class="product-info">
            <h3 class="product-name">{{item1_name}}</h3>
            {{#if item1_price}}
            <p class="product-price">{{item1_price}}</p>
            {{/if}}
          </div>
        </a>
        {{/if}}
        
        {{#if item2_url}}
        <a href="{{item2_url}}" class="product-item" target="_blank">
          {{#if item2_image}}
          <img src="{{item2_image}}" alt="{{item2_name}}" class="product-image">
          {{/if}}
          <div class="product-info">
            <h3 class="product-name">{{item2_name}}</h3>
            {{#if item2_price}}
            <p class="product-price">{{item2_price}}</p>
            {{/if}}
          </div>
        </a>
        {{/if}}
        
        {{#if item3_url}}
        <a href="{{item3_url}}" class="product-item" target="_blank">
          {{#if item3_image}}
          <img src="{{item3_image}}" alt="{{item3_name}}" class="product-image">
          {{/if}}
          <div class="product-info">
            <h3 class="product-name">{{item3_name}}</h3>
            {{#if item3_price}}
            <p class="product-price">{{item3_price}}</p>
            {{/if}}
          </div>
        </a>
        {{/if}}
        
        {{#if item4_url}}
        <a href="{{item4_url}}" class="product-item" target="_blank">
          {{#if item4_image}}
          <img src="{{item4_image}}" alt="{{item4_name}}" class="product-image">
          {{/if}}
          <div class="product-info">
            <h3 class="product-name">{{item4_name}}</h3>
            {{#if item4_price}}
            <p class="product-price">{{item4_price}}</p>
            {{/if}}
          </div>
        </a>
        {{/if}}
        
        {{#if item5_url}}
        <a href="{{item5_url}}" class="product-item" target="_blank">
          {{#if item5_image}}
          <img src="{{item5_image}}" alt="{{item5_name}}" class="product-image">
          {{/if}}
          <div class="product-info">
            <h3 class="product-name">{{item5_name}}</h3>
            {{#if item5_price}}
            <p class="product-price">{{item5_price}}</p>
            {{/if}}
          </div>
        </a>
        {{/if}}
        
        {{#if item6_url}}
        <a href="{{item6_url}}" class="product-item" target="_blank">
          {{#if item6_image}}
          <img src="{{item6_image}}" alt="{{item6_name}}" class="product-image">
          {{/if}}
          <div class="product-info">
            <h3 class="product-name">{{item6_name}}</h3>
            {{#if item6_price}}
            <p class="product-price">{{item6_price}}</p>
            {{/if}}
          </div>
        </a>
        {{/if}}
        
        {{#if item7_url}}
        <a href="{{item7_url}}" class="product-item" target="_blank">
          {{#if item7_image}}
          <img src="{{item7_image}}" alt="{{item7_name}}" class="product-image">
          {{/if}}
          <div class="product-info">
            <h3 class="product-name">{{item7_name}}</h3>
            {{#if item7_price}}
            <p class="product-price">{{item7_price}}</p>
            {{/if}}
          </div>
        </a>
        {{/if}}
      </div>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;">Questions? Reply to this email.</p>
      <p style="margin: 0; color: #666666;">© 2024 Your Stylist Team. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

## Step 5: Add Test Data

In the SendGrid template editor, click "Test Data" and paste this JSON to preview:

```json
{
  "customer_name": "Alex",
  "item1_name": "Vintage Denim Jacket",
  "item1_image": "https://images.unsplash.com/photo-1551028719-00167b16eac5",
  "item1_price": "$89.99",
  "item1_url": "https://example.com/product1",
  "item2_name": "Black Cargo Pants",
  "item2_image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80",
  "item2_price": "$69.99",
  "item2_url": "https://example.com/product2"
}
```

## Step 6: Get Your Template ID

1. Save the template
2. Go back to **Dynamic Templates** list
3. Copy the **Template ID** (e.g., `d-1234567890abcdef`)
4. Update `/supabase/functions/server/sendgrid.tsx`:
   - Replace `YOUR_TEMPLATE_ID` with your actual template ID
   - Replace `stylist@yourdomain.com` with your verified sender email

## Step 7: Test It!

1. Select a customer from your Contentful database
2. Add products to the 7 selects
3. Click the **Send** button
4. Check the customer's email!

## Dynamic Template Variables

The template uses these variables (automatically populated by the app):

- `customer_name` - Customer's name from Contentful
- `item1_name` through `item7_name` - Product titles
- `item1_image` through `item7_image` - Product images
- `item1_price` through `item7_price` - Product prices
- `item1_url` through `item7_url` - Product links

## Troubleshooting

**"SendGrid API key not configured"**
- Make sure you added your API key to the SENDGRID_API_KEY secret in Figma Make

**"Customer email not found"**
- Ensure your Contentful "client" entries have an "email" or "Email" field

**Email not sending**
- Check SendGrid activity logs: **Email API** → **Activity**
- Verify your sender email is verified in SendGrid
- Make sure your template ID is correct in the code

**Images not showing**
- Some email clients block external images by default
- Make sure product URLs return valid Open Graph images
- Test with Gmail/Outlook to verify

## Next Steps

- Customize the template design to match your brand
- Add more personalization (customer preferences, stylist notes, etc.)
- Set up email tracking in SendGrid to see open/click rates

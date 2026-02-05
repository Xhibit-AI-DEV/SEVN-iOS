import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Like a product
app.post('/like', async (c) => {
  try {
    const { userId, productId, productData } = await c.req.json();
    
    console.log('❤️ Liking product:', { userId, productId });
    
    if (!userId || !productId) {
      return c.json({ error: 'userId and productId are required' }, 400);
    }
    
    // Store like with timestamp and product data
    const likeKey = `like:${userId}:${productId}`;
    const likeData = {
      userId,
      productId,
      productData, // Store full product details for easy retrieval
      likedAt: new Date().toISOString(),
    };
    
    await kv.set(likeKey, likeData);
    
    // Also add to user's likes index for easy retrieval
    const userLikesKey = `user_likes:${userId}`;
    const existingLikes = await kv.get(userLikesKey) || { likes: [] };
    
    // Add productId to likes array if not already there
    if (!existingLikes.likes.includes(productId)) {
      existingLikes.likes.unshift(productId); // Add to beginning
      await kv.set(userLikesKey, existingLikes);
    }
    
    console.log('✅ Product liked successfully');
    
    return c.json({ 
      success: true,
      message: 'Product liked',
      like: likeData
    });
  } catch (error: any) {
    console.error('❌ Error liking product:', error);
    return c.json({ error: error.message || 'Failed to like product' }, 500);
  }
});

// Unlike a product
app.post('/unlike', async (c) => {
  try {
    const { userId, productId } = await c.req.json();
    
    console.log('💔 Unliking product:', { userId, productId });
    
    if (!userId || !productId) {
      return c.json({ error: 'userId and productId are required' }, 400);
    }
    
    // Remove like
    const likeKey = `like:${userId}:${productId}`;
    await kv.del(likeKey);
    
    // Remove from user's likes index
    const userLikesKey = `user_likes:${userId}`;
    const existingLikes = await kv.get(userLikesKey) || { likes: [] };
    
    existingLikes.likes = existingLikes.likes.filter((id: string) => id !== productId);
    await kv.set(userLikesKey, existingLikes);
    
    console.log('✅ Product unliked successfully');
    
    return c.json({ 
      success: true,
      message: 'Product unliked'
    });
  } catch (error: any) {
    console.error('❌ Error unliking product:', error);
    return c.json({ error: error.message || 'Failed to unlike product' }, 500);
  }
});

// Check if a product is liked by user
app.get('/check/:userId/:productId', async (c) => {
  try {
    const { userId, productId } = c.req.param();
    
    const likeKey = `like:${userId}:${productId}`;
    const like = await kv.get(likeKey);
    
    return c.json({ 
      isLiked: !!like,
      like: like || null
    });
  } catch (error: any) {
    console.error('❌ Error checking like:', error);
    return c.json({ error: error.message || 'Failed to check like' }, 500);
  }
});

// Get all liked products for a user
app.get('/user/:userId', async (c) => {
  try {
    const { userId } = c.req.param();
    
    console.log('📋 Fetching likes for user:', userId);
    
    // Get user's likes index
    const userLikesKey = `user_likes:${userId}`;
    const userLikes = await kv.get(userLikesKey) || { likes: [] };
    
    console.log('📊 Found likes:', userLikes.likes.length);
    
    // Get full details for each liked product
    const likes = [];
    for (const productId of userLikes.likes) {
      const likeKey = `like:${userId}:${productId}`;
      const like = await kv.get(likeKey);
      if (like) {
        likes.push(like);
      }
    }
    
    console.log('✅ Returning', likes.length, 'likes with full data');
    
    return c.json({ 
      likes,
      count: likes.length
    });
  } catch (error: any) {
    console.error('❌ Error fetching user likes:', error);
    return c.json({ error: error.message || 'Failed to fetch likes' }, 500);
  }
});

// Get like count for a product
app.get('/product/:productId/count', async (c) => {
  try {
    const { productId } = c.req.param();
    
    // Get all likes for this product
    const prefix = `like:`;
    const allLikes = await kv.getByPrefix(prefix);
    
    const productLikes = allLikes.filter((like: any) => 
      like.productId === productId
    );
    
    return c.json({ 
      count: productLikes.length,
      productId
    });
  } catch (error: any) {
    console.error('❌ Error getting product like count:', error);
    return c.json({ error: error.message || 'Failed to get like count' }, 500);
  }
});

export default app;

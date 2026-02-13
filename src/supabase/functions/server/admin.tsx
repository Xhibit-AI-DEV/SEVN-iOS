import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

/**
 * ADMIN CLEANUP ENDPOINT
 * Clears all test data from the KV store
 * 
 * WARNING: This deletes:
 * - All orders
 * - All selections
 * - All conversation history
 * 
 * Use with caution!
 */
app.post("/cleanup-all", async (c) => {
  try {
    console.log('🧹 Starting cleanup of all test data...');

    // Get all keys by prefix
    const orderKeys = await kv.getByPrefix('order:');
    const selectionKeys = await kv.getByPrefix('selections:');
    const conversationKeys = await kv.getByPrefix('openai_conversation:');

    console.log(`📊 Found ${orderKeys.length} orders`);
    console.log(`📊 Found ${selectionKeys.length} selections`);
    console.log(`📊 Found ${conversationKeys.length} conversations`);

    // Delete all orders
    if (orderKeys.length > 0) {
      const orderKeysToDelete = orderKeys.map(item => item.key);
      await kv.mdel(orderKeysToDelete);
      console.log(`✅ Deleted ${orderKeys.length} orders`);
    }

    // Delete all selections
    if (selectionKeys.length > 0) {
      const selectionKeysToDelete = selectionKeys.map(item => item.key);
      await kv.mdel(selectionKeysToDelete);
      console.log(`✅ Deleted ${selectionKeys.length} selections`);
    }

    // Delete all conversations
    if (conversationKeys.length > 0) {
      const conversationKeysToDelete = conversationKeys.map(item => item.key);
      await kv.mdel(conversationKeysToDelete);
      console.log(`✅ Deleted ${conversationKeys.length} conversations`);
    }

    const totalDeleted = orderKeys.length + selectionKeys.length + conversationKeys.length;

    return c.json({
      success: true,
      message: 'All test data cleared successfully',
      deleted: {
        orders: orderKeys.length,
        selections: selectionKeys.length,
        conversations: conversationKeys.length,
        total: totalDeleted,
      },
    });
  } catch (error: any) {
    console.error('❌ Cleanup error:', error);
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to cleanup data',
      },
      500
    );
  }
});

/**
 * PREVIEW CLEANUP
 * Shows what would be deleted without actually deleting
 */
app.get("/cleanup-preview", async (c) => {
  try {
    console.log('👀 Previewing cleanup...');

    // Get all keys by prefix
    const orderKeys = await kv.getByPrefix('order:');
    const selectionKeys = await kv.getByPrefix('selections:');
    const conversationKeys = await kv.getByPrefix('openai_conversation:');

    return c.json({
      success: true,
      preview: {
        orders: {
          count: orderKeys.length,
          keys: orderKeys.map(item => item.key),
          sampleData: orderKeys.slice(0, 3).map(item => ({
            key: item.key,
            value: item.value,
          })),
        },
        selections: {
          count: selectionKeys.length,
          keys: selectionKeys.map(item => item.key),
          sampleData: selectionKeys.slice(0, 3).map(item => ({
            key: item.key,
            value: item.value,
          })),
        },
        conversations: {
          count: conversationKeys.length,
          keys: conversationKeys.map(item => item.key),
        },
        total: orderKeys.length + selectionKeys.length + conversationKeys.length,
      },
    });
  } catch (error: any) {
    console.error('❌ Preview error:', error);
    return c.json(
      {
        success: false,
        error: error.message || 'Failed to preview cleanup',
      },
      500
    );
  }
});

export default app;

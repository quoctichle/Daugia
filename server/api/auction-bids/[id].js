import { connectToDatabase } from '../../utils/db.js';
import { ObjectId } from 'mongodb';

export default defineEventHandler(async (event) => {
  // In Nuxt 3, route params are automatically parsed and available in event.context.params
  const productId = event.context.params.id;

  if (!productId || !ObjectId.isValid(productId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A valid Product ID is required.'
    });
  }

  try {
    // Re-using the connectToDatabase utility from the existing db.js file
    const db = await connectToDatabase();
    
    const bids = await db.collection('bids').find({
      productId: new ObjectId(productId)
    })
    .sort({ createdAt: -1 }) // Sort by most recent bid first
    .toArray();

    return bids;

  } catch (error) {
    console.error(`Error fetching bids for product ${productId}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while fetching bid details.'
    });
  }
});

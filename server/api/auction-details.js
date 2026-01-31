import clientPromise from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'daugia')
    const productsCollection = db.collection('products')

    // This aggregation pipeline is much more efficient than the previous N+1 query approach.
    const details = await productsCollection.aggregate([
      {
        $lookup: {
          from: 'bids',
          localField: '_id',
          foreignField: 'productId',
          as: 'bids'
        }
      }
    ]).toArray();
    return details;
  } catch (error) {
    console.error('Failed to load auction details with aggregation:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load auction details',
      data: error.message
    })
  }
})
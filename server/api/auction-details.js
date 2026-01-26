import clientPromise from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'daugia')
    const productsCollection = db.collection('products')

    // This aggregation pipeline is much more efficient than the previous N+1 query approach.
    const details = await productsCollection.aggregate([
      // Stage 1: Lookup bids for each product
      {
        $lookup: {
          from: 'bids',
          localField: '_id',
          foreignField: 'productId',
          as: 'bids'
        }
      },
      // Stage 2: Unwind the bids array to process each bid
      { $unwind: { path: '$bids', preserveNullAndEmptyArrays: true } },
      // Stage 3: Sort bids by amount descending
      { $sort: { 'bids.amount': -1 } },
      // Stage 4: Group back by product to get sorted bids array
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          winnersCount: { $first: '$winnersCount' },
          bids: { $push: '$bids' }
        }
      },
      // Stage 5: Project the final shape
      {
        $project: {
          _id: 0,
          productId: '$_id',
          productName: '$name',
          // Take the top N bids based on winnersCount
          topBids: { $slice: ['$bids', '$winnersCount'] }
        }
      },
      // Stage 6: Filter out products that had no bids at all
      {
        $match: {
          'topBids.0': { $exists: true }
        }
      },
      // Stage 7: Calculate final winner details
      {
        $project: {
          productId: 1,
          productName: 1,
          highestBid: { $max: '$topBids.amount' },
          lowestWinningBid: { $min: '$topBids.amount' },
          winners: {
            $map: {
              input: '$topBids',
              as: 'bid',
              in: { email: '$$bid.userEmail', amount: '$$bid.amount' }
            }
          }
        }
      }
    ]).toArray()

    return details
  } catch (error) {
    console.error('Failed to load auction details with aggregation:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load auction details',
      data: error.message
    })
  }
})
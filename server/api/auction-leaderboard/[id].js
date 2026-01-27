import { ObjectId } from 'mongodb'
import { connectToDatabase } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const productId = event.context.params.id

  if (!productId || !ObjectId.isValid(productId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A valid Product ID is required.'
    })
  }

  const query = getQuery(event)
  const limitRaw = parseInt(query.limit)
  const skipRaw = parseInt(query.skip)
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 200) : 50
  const skip = Number.isFinite(skipRaw) ? Math.max(skipRaw, 0) : 0

  try {
    const db = await connectToDatabase()
    const bidsCollection = db.collection('bids')

    const leaderboard = await bidsCollection
      .aggregate(
        [
          { $match: { productId: new ObjectId(productId) } },
          {
            $group: {
              _id: '$userEmail',
              highestBid: { $max: '$amount' },
              lastBidAt: { $max: '$createdAt' },
              bidsCount: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              userEmail: '$_id',
              highestBid: 1,
              lastBidAt: 1,
              bidsCount: 1
            }
          },
          { $sort: { highestBid: -1, lastBidAt: 1 } },
          { $skip: skip },
          { $limit: limit }
        ],
        { allowDiskUse: true }
      )
      .toArray()

    return leaderboard
  } catch (error) {
    console.error(`Error building leaderboard for product ${productId}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while building leaderboard.'
    })
  }
})


import { connectToDatabase } from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
    const bidsCollection = db.collection('bids')
    const productsCollection = db.collection('products')

    // Giả lập logic: lấy bids cao nhất cho mỗi product
    const products = await productsCollection.find({}).toArray()
    const details = []

    for (const product of products) {
      const highestBids = await bidsCollection
        .find({ productId: product._id })
        .sort({ amount: -1 })
        .limit(1) // Hoặc limit theo winnersCount
        .toArray()

      if (highestBids.length > 0) {
        details.push({
          productId: product._id,
          productName: product.name,
          highestBid: highestBids[0].amount,
          winners: [highestBids[0].userEmail] // Giả lập 1 winner
        })
      }
    }

    return details
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load auction details',
      data: error.message
    })
  }
})
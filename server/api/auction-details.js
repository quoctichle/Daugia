import clientPromise from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'daugia')
    const bidsCollection = db.collection('bids')
    const productsCollection = db.collection('products')

    const products = await productsCollection.find({}).toArray()
    const details = []

    for (const product of products) {
      const winnersCount = product.winnersCount || 1
      const highestBids = await bidsCollection
        .find({ productId: product._id })
        .sort({ amount: -1 })
        .limit(winnersCount)
        .toArray()

      if (highestBids.length > 0) {
        const winners = highestBids.map(bid => ({ email: bid.userEmail, amount: bid.amount }))
        const lowestWinningBid = highestBids[highestBids.length - 1].amount
        details.push({
          productId: product._id,
          productName: product.name,
          highestBid: highestBids[0].amount,
          lowestWinningBid,
          winners
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
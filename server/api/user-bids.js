import clientPromise from '../utils/db.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const userEmail = query.userEmail

  if (!userEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User email required'
    })
  }

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'daugia')
    const bidsCollection = db.collection('bids')

    // Chỉ lấy những trường cần thiết và sắp xếp để giảm payload + dễ xử lý
    const userBids = await bidsCollection
      .find(
        { userEmail },
        {
          projection: {
            _id: 1,
            productId: 1,
            amount: 1,
            bidNumber: 1,
            createdAt: 1
          }
        }
      )
      .sort({ createdAt: -1 })
      .toArray()

    // Group by productId
    const bidsByProduct = {}
    userBids.forEach(bid => {
      if (!bidsByProduct[bid.productId]) {
        bidsByProduct[bid.productId] = []
      }
      bidsByProduct[bid.productId].push(bid)
    })

    return bidsByProduct
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load user bids',
      data: error.message
    })
  }
})
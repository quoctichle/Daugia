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

    // Thêm phân trang, chỉ trả về trường cần thiết
    const query = getQuery(event)
    const limit = Math.min(parseInt(query.limit) || 50, 200)
    const skip = Math.max(parseInt(query.skip) || 0, 0)
    const userBids = await bidsCollection
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Gợi ý: Đảm bảo đã tạo index cho { userEmail, createdAt }

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
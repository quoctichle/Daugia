import clientPromise from '../utils/db.js'
import { ObjectId } from 'mongodb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { bids } = body

  if (!bids || !Array.isArray(bids) || bids.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Dữ liệu không hợp lệ.'
    })
  }

  const client = await clientPromise
  const db = client.db(process.env.MONGODB_DB || 'daugia')
  const bidsCollection = db.collection('bids')
  const productsCollection = db.collection('products')

  // All bids in the request are for the same product and user
  const sampleBid = bids[0]
  const productId = new ObjectId(sampleBid.productId)
  const userEmail = sampleBid.userEmail

  try {
    // 1. Fetch product once
    const product = await productsCollection.findOne({ _id: productId })
    if (!product) {
      throw createError({ statusCode: 404, statusMessage: `Không tìm thấy sản phẩm.` })
    }

    // 2. Check auction status
    const now = new Date().getTime()
    const startTime = new Date(product.startTime).getTime()
    const endTime = startTime + (product.auctionDuration * 60000)
    if (now < startTime || now > endTime) {
        throw createError({ statusCode: 400, statusMessage: 'Phiên đấu giá không hoạt động.' })
    }

    // 3. Check participation limit
    const maxParticipations = product.maxParticipations || 1
    const existingBidsCount = await bidsCollection.countDocuments({ productId, userEmail })
    
    if (existingBidsCount + bids.length > maxParticipations) {
      throw createError({
        statusCode: 400,
        statusMessage: `Bạn chỉ có thể dự đoán tối đa ${maxParticipations} lần. Bạn đã dự đoán ${existingBidsCount} lần.`
      })
    }

    // 4. Validate bid amounts and add timestamp
    const bidsToInsert = bids.map(bid => {
      const amount = Number(bid.amount)
      if (isNaN(amount) || amount < product.startPrice) {
        throw createError({
          statusCode: 400,
          statusMessage: `Giá dự đoán không hợp lệ. Phải là số và lớn hơn hoặc bằng giá khởi điểm (${product.startPrice.toLocaleString('vi-VN')} VND).`
        })
      }
      return {
        ...bid,
        productId: new ObjectId(bid.productId),
        amount,
        createdAt: new Date()
      }
    })

    // 5. Insert bids
    await bidsCollection.insertMany(bidsToInsert)

    return { success: true, message: 'Dự đoán của bạn đã được gửi thành công.' }

  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Không thể gửi dự đoán.',
      data: error.message
    })
  }
})
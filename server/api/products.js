import { connectToDatabase } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
    const query = getQuery(event)

    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const skip = (page - 1) * limit

    const projection = {
      _id: 1,
      name: 1,
      description: 1,
      startPrice: 1,
      image: 1,
      startTime: 1,
      auctionDuration: 1
    }

    const products = await db.collection('products')
      .find({}, { projection })
      .skip(skip)
      .limit(limit)
      .toArray()
      
    return products
  } catch (error) {
    console.error('❌ GET /api/products error:', error.message)
    // In Nuxt 3, it's recommended to throw errors to let the framework handle them.
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch products: ${error.message}`
    })
  }
})
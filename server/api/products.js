import { connectToDatabase } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
    const query = getQuery(event)

    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 10
    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      db.collection('products')
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('products').countDocuments()
    ])
    return { products, total }
  } catch (error) {
    console.error('❌ GET /api/products error:', error.message)
    // In Nuxt 3, it's recommended to throw errors to let the framework handle them.
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch products: ${error.message}`
    })
  }
})
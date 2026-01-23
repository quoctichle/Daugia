import clientPromise from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'daugia')
    const productsCollection = db.collection('products')
    const products = await productsCollection.find({}).toArray()
    return products
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load products',
      data: error.message
    })
  }
})
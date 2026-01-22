import { connectToDatabase } from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
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
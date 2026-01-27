import { connectToDatabase } from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
    const indexes = await db.collection('products').listIndexes().toArray()
    return indexes
  } catch (error) {
    console.error('❌ GET /api/test-indexes error:', error.message)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch indexes: ${error.message}`
    })
  }
})

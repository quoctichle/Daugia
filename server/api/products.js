import { MongoClient, ObjectId } from 'mongodb'

const uri = "mongodb+srv://quoctichle_db_user:Letich37@cluster0.ol5cjn6.mongodb.net/daugia?retryWrites=true&w=majority"
let cachedClient = null

async function getDB() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
  }
  return cachedClient.db('daugia')
}

export default defineEventHandler(async (event) => {
  try {
    const db = await getDB()
    const products = await db.collection('products').find({}).toArray()
    return products
  } catch (error) {
    console.error('❌ GET /api/products error:', error.message)
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: error.message
    }))
  }
})
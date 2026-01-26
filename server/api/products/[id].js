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
  const { id } = event.context.params

  if (!id || !ObjectId.isValid(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID sản phẩm không hợp lệ'
    })
  }

  try {
    const db = await getDB()
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) })

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy sản phẩm'
      })
    }
    
    return product
  } catch (error) {
    console.error(`❌ GET /api/products/${id} error:`, error.message)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Lỗi máy chủ khi tải sản phẩm.'
    })
  }
})

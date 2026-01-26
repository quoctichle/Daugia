import { MongoClient, ObjectId } from 'mongodb'

// Connection URI should be in environment variables in a real app
const uri = "mongodb+srv://quoctichle_db_user:Letich37@cluster0.ol5cjn6.mongodb.net/daugia?retryWrites=true&w=majority"
let cachedClient = null

// Function to establish connection to the database
async function getDB() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
    console.log('✅ MongoDB connected from api/game-config')
  }
  return cachedClient.db('daugia')
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const db = await getDB()

  // Handle GET request to fetch configuration
  if (method === 'GET') {
    try {
      const config = await db.collection('config').findOne({})
      return config || { title: 'Đấu giá sản phẩm', logo: '', mascot: '', rules: '' }
    } catch (error) {
      console.error('❌ GET /api/game-config error:', error.message)
      throw createError({
        statusCode: 500,
        statusMessage: 'Lỗi máy chủ khi tải cấu hình.'
      })
    }
  }

  // Handle POST request to save configuration and products
  if (method === 'POST') {
    try {
      const body = await readBody(event)
      const { config, products } = body

      if (!config || !products) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Dữ liệu cấu hình hoặc sản phẩm không hợp lệ.'
        })
      }
      
      // 1. Save general config (using upsert to create if it doesn't exist)
      // Make sure not to update the immutable _id field
      const { _id, ...configData } = config;
      await db.collection('config').updateOne(
        {}, // An empty filter will match the first document or create a new one
        { $set: { ...configData, updatedAt: new Date() } },
        { upsert: true }
      )

      // 2. Sync products
      const productIdsFromClient = products.map(p => p._id).filter(id => id && ObjectId.isValid(id)).map(id => new ObjectId(id));
      
      // 2a. Delete products that are no longer in the list
      await db.collection('products').deleteMany({
        _id: { $nin: productIdsFromClient }
      });
      
      // 2b. Bulk update/insert products
      if (products.length > 0) {
        const bulkOperations = products.map(product => {
          const { _id, ...rest } = product
          const filter = _id && ObjectId.isValid(_id) ? { _id: new ObjectId(_id) } : { _id: new ObjectId() };
          
          return {
            updateOne: {
              filter: filter,
              update: { $set: { ...rest, updatedAt: new Date() } },
              upsert: true
            }
          };
        });

        await db.collection('products').bulkWrite(bulkOperations);
      }

      return { success: true, message: 'Cấu hình đã được lưu thành công.' }

    } catch (error) {
      console.error('❌ POST /api/game-config error:', error)
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Lỗi máy chủ khi lưu cấu hình.'
      })
    }
  }

  // Handle other methods
  throw createError({
    statusCode: 405,
    statusMessage: 'Phương thức không được phép'
  })
})
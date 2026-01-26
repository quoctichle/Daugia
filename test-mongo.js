import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || "mongodb+srv://quoctichle_db_user:Letich37@cluster0.ol5cjn6.mongodb.net/daugia?retryWrites=true&w=majority"
const client = new MongoClient(uri)

async function testConnection() {
  try {
    await client.connect()
    console.log('✅ Kết nối MongoDB thành công!')

    const db = client.db('daugia')
    const productsCollection = db.collection('products')

    // Test lấy tất cả products
    const products = await productsCollection.find({}).toArray()
    console.log(`📦 Tìm thấy ${products.length} sản phẩm:`)
    products.forEach(product => {
      console.log(`  - ${product.name}: ${product.startPrice} VND`)
    })

    // Test tạo sản phẩm mới
    const newProduct = {
      name: 'Test Product',
      description: 'Sản phẩm test',
      startPrice: 100000,
      image: '/uploads/test.jpg',
      startTime: new Date(),
      auctionDuration: 3600000, // 1 giờ
      winnersCount: 3,
      maxParticipations: 100,
      createdAt: new Date()
    }

    const result = await productsCollection.insertOne(newProduct)
    console.log('✅ Đã tạo sản phẩm mới với ID:', result.insertedId)

    // Test cập nhật
    await productsCollection.updateOne(
      { _id: result.insertedId },
      { $set: { description: 'Sản phẩm test đã cập nhật' } }
    )
    console.log('✅ Đã cập nhật sản phẩm')

    // Test xóa
    await productsCollection.deleteOne({ _id: result.insertedId })
    console.log('✅ Đã xóa sản phẩm test')

  } catch (error) {
    console.error('❌ Lỗi:', error.message)
  } finally {
    await client.close()
    console.log('🔌 Đã đóng kết nối MongoDB')
  }
}

testConnection()
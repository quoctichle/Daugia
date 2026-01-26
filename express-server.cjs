const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const cors = require('cors')
// const dotenv = require('dotenv')

// dotenv.config()

const app = express()
const port = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb+srv://quoctichle_db_user:Letich37@cluster0.ol5cjn6.mongodb.net/daugia?retryWrites=true&w=majority"
const client = new MongoClient(uri)
let dbConnection = null

async function connectDB() {
  try {
    if (!dbConnection) {
      await client.connect()
      dbConnection = client.db('daugia')
      console.log('✅ Kết nối MongoDB thành công!')
    }
    return dbConnection
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error.message)
    throw error
  }
}

// Routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Express server hoạt động!', timestamp: new Date().toISOString() })
})

app.get('/api/products', async (req, res) => {
  try {
    const db = await connectDB()
    const products = await db.collection('products').find({}).toArray()
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const db = await connectDB()
    const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/submit-bids', async (req, res) => {
  try {
    const { productId, userEmail, bidAmount } = req.body
    const db = await connectDB()

    // Validate product exists
    const product = await db.collection('products').findOne({ _id: new ObjectId(productId) })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check existing bids count for this user on this product
    const existingBidsCount = await db.collection('bids').countDocuments({
      productId: new ObjectId(productId),
      userEmail
    })

    if (existingBidsCount >= product.maxParticipations) {
      return res.status(400).json({ error: 'Maximum participations reached' })
    }

    // Insert bid
    const bid = {
      productId: new ObjectId(productId),
      userEmail,
      bidAmount: parseFloat(bidAmount),
      timestamp: new Date()
    }

    const result = await db.collection('bids').insertOne(bid)
    res.json({ success: true, bidId: result.insertedId })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/user-bids', async (req, res) => {
  try {
    const { email } = req.query
    const db = await connectDB()

    const bids = await db.collection('bids').find({ userEmail: email }).toArray()

    // Group by productId
    const bidsByProduct = {}
    bids.forEach(bid => {
      if (!bidsByProduct[bid.productId]) {
        bidsByProduct[bid.productId] = []
      }
      bidsByProduct[bid.productId].push(bid)
    })

    res.json(bidsByProduct)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/game-config', async (req, res) => {
  try {
    const db = await connectDB()
    const config = await db.collection('config').findOne({}) || {
      logo: '',
      title: 'Đấu giá sản phẩm'
    }
    res.json(config)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body
    const db = await connectDB()

    const admin = await db.collection('admins').findOne({ username, password })
    if (admin) {
      res.json({ success: true, admin })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/auction-details/:productId', async (req, res) => {
  try {
    const db = await connectDB()
    const bids = await db.collection('bids')
      .find({ productId: new ObjectId(req.params.productId) })
      .sort({ bidAmount: -1 })
      .toArray()

    res.json(bids)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Start server
app.listen(port, () => {
  console.log(`🚀 Express server chạy trên http://localhost:${port}`)
  console.log('📊 API endpoints:')
  console.log('  GET  /api/test')
  console.log('  GET  /api/products')
  console.log('  GET  /api/products/:id')
  console.log('  POST /api/submit-bids')
  console.log('  GET  /api/user-bids?email=...')
  console.log('  GET  /api/game-config')
  console.log('  POST /api/admin-login')
  console.log('  GET  /api/auction-details/:productId')
})
const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const cors = require('cors')

const app = express()
const port = 3001

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
const uri = "mongodb+srv://quoctichle_db_user:Letich37@cluster0.ol5cjn6.mongodb.net/daugia?retryWrites=true&w=majority"
const client = new MongoClient(uri)
let db = null

// Initialize DB connection
async function initDB() {
  try {
    if (!db) {
      await client.connect()
      db = client.db('daugia')
      console.log('✅ MongoDB connected')
    }
    return db
  } catch (error) {
    console.error('❌ MongoDB error:', error.message)
    process.exit(1)
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const database = await initDB()
    const products = await database.collection('products').find({}).toArray()
    res.json(products)
  } catch (error) {
    console.error('GET /api/products error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/products/:id', async (req, res) => {
  try {
    const database = await initDB()
    const product = await database.collection('products').findOne({ 
      _id: new ObjectId(req.params.id) 
    })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    console.error('GET /api/products/:id error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Bids endpoints
app.post('/api/submit-bids', async (req, res) => {
  try {
    const { productId, userEmail, bidAmount } = req.body
    const database = await initDB()

    // Validate product
    const product = await database.collection('products').findOne({
      _id: new ObjectId(productId)
    })
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check bid count
    const existingBidsCount = await database.collection('bids').countDocuments({
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

    const result = await database.collection('bids').insertOne(bid)
    res.json({ success: true, bidId: result.insertedId })
  } catch (error) {
    console.error('POST /api/submit-bids error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/user-bids', async (req, res) => {
  try {
    const { email } = req.query
    const database = await initDB()

    const bids = await database.collection('bids')
      .find({ userEmail: email })
      .toArray()

    // Group by productId
    const bidsByProduct = {}
    bids.forEach(bid => {
      const productId = bid.productId.toString()
      if (!bidsByProduct[productId]) {
        bidsByProduct[productId] = []
      }
      bidsByProduct[productId].push(bid)
    })

    res.json(bidsByProduct)
  } catch (error) {
    console.error('GET /api/user-bids error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/auction-details/:productId', async (req, res) => {
  try {
    const database = await initDB()
    const bids = await database.collection('bids')
      .find({ productId: new ObjectId(req.params.productId) })
      .sort({ bidAmount: -1 })
      .toArray()

    res.json(bids)
  } catch (error) {
    console.error('GET /api/auction-details error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Config endpoints
app.get('/api/game-config', async (req, res) => {
  try {
    const database = await initDB()
    const config = await database.collection('config').findOne({})
    res.json(config || { title: 'Đấu giá sản phẩm', logo: '' })
  } catch (error) {
    console.error('GET /api/game-config error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Admin endpoints
app.post('/api/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body
    const database = await initDB()

    const admin = await database.collection('admins').findOne({
      username,
      password
    })

    if (admin) {
      res.json({ success: true, admin })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('POST /api/admin-login error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Start server
const server = app.listen(port, () => {
  console.log('\n' + '='.repeat(60))
  console.log(`🚀 Express API Server running on port ${port}`)
  console.log('='.repeat(60))
  console.log('📊 API Endpoints:')
  console.log('  GET  /health')
  console.log('  GET  /api/products')
  console.log('  GET  /api/products/:id')
  console.log('  POST /api/submit-bids')
  console.log('  GET  /api/user-bids?email=...')
  console.log('  GET  /api/auction-details/:productId')
  console.log('  GET  /api/game-config')
  console.log('  POST /api/admin-login')
  console.log('='.repeat(60) + '\n')
})

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err)
})
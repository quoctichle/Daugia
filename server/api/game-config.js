import { connectToDatabase } from '../utils/db.js'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  if (method === 'GET') {
    try {
      const db = await connectToDatabase()
      const configCollection = db.collection('game_config')
      const config = await configCollection.findOne({})
      return config || {}
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to load game config',
        data: error.message
      })
    }
  } else if (method === 'POST') {
    const body = await readBody(event)
    const { config, products } = body

    try {
      const db = await connectToDatabase()
      const configCollection = db.collection('game_config')
      const productsCollection = db.collection('products')

      // Save config
      const configToSave = { ...config }
      delete configToSave._id
      await configCollection.replaceOne({}, configToSave, { upsert: true })

      // Save products
      await productsCollection.deleteMany({})
      if (products.length > 0) {
        await productsCollection.insertMany(products)
      }

      return { message: 'Config saved successfully' }
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save config',
        data: error.message
      })
    }
  }
})
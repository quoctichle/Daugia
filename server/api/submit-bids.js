import { connectToDatabase } from '../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { bids } = body

  try {
    const db = await connectToDatabase()
    const bidsCollection = db.collection('bids')

    // Insert bids
    await bidsCollection.insertMany(bids)

    return { message: 'Bids submitted successfully' }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to submit bids',
      data: error.message
    })
  }
})
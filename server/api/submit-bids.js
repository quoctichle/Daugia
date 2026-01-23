import clientPromise from '../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { bids } = body

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'daugia')
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
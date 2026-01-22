import { connectToDatabase } from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
    // Test the connection by pinging the database
    await db.admin().ping()
    return { message: 'Successfully connected to MongoDB', database: db.databaseName }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to connect to MongoDB',
      data: error.message
    })
  }
})
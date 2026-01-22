import { connectToDatabase } from '../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  try {
    const db = await connectToDatabase()
    const adminsCollection = db.collection('admins')

    const admin = await adminsCollection.findOne({ email, password })

    if (admin) {
      return { success: true, message: 'Login successful' }
    } else {
      return { success: false, message: 'Invalid credentials' }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Login failed',
      data: error.message
    })
  }
})
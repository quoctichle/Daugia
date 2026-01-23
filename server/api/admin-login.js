import clientPromise from '../utils/db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'daugia')
    const adminsCollection = db.collection('admins')

    // Kiểm tra và tạo admin nếu chưa tồn tại
    let admin = await adminsCollection.findOne({ email: 'admin@sunshine.com' })
    if (!admin) {
      const adminData = {
        email: 'admin@sunshine.com',
        password: 'sunshine@telecom',
        createdAt: new Date()
      }
      await adminsCollection.insertOne(adminData)
      admin = adminData
    }

    if (admin.email === email && admin.password === password) {
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
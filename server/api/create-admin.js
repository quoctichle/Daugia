import { connectToDatabase } from '../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const db = await connectToDatabase()
    const adminsCollection = db.collection('admins')

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await adminsCollection.findOne({ email: 'admin@sunshine.com' })
    if (existingAdmin) {
      return { message: 'Admin account already exists' }
    }

    // Tạo tài khoản admin
    const adminData = {
      email: 'admin@sunshine.com',
      password: 'sunshine@telecom', // Trong thực tế nên hash password
      createdAt: new Date()
    }

    const result = await adminsCollection.insertOne(adminData)
    return { message: 'Admin account created successfully', id: result.insertedId }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create admin account',
      data: error.message
    })
  }
})
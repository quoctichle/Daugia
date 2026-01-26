import clientPromise from '../utils/db.js'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'daugia')
    const adminsCollection = db.collection('admins')

    // Kiểm tra xem admin đã tồn tại chưa
    const existingAdmin = await adminsCollection.findOne({ email: 'admin@sunshine.com' })
    if (existingAdmin) {
      return { message: 'Admin account already exists' }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('sunshine@telecom', 10)

    // Tạo tài khoản admin
    const adminData = {
      email: 'admin@sunshine.com',
      password: hashedPassword, // Save the hashed password
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

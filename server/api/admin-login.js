import clientPromise from '../utils/db.js'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  // Basic validation
  if (!email || !password) {
    return { success: false, message: 'Email and password are required.' }
  }

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || 'daugia')
    const adminsCollection = db.collection('admins')

    const adminEmail = 'admin@sunshine.com';
    const adminPassword = 'sunshine@telecom';

    let admin = await adminsCollection.findOne({ email: adminEmail });

    // If admin does not exist, create it.
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminData = {
        email: adminEmail,
        password: hashedPassword,
        createdAt: new Date()
      };
      await adminsCollection.insertOne(adminData);
      // Use the newly created admin for the current login attempt
      admin = adminData;
    }

    // Now, compare the provided password with the stored hash
    const isValid = await bcrypt.compare(password, admin.password);

    if (admin.email === email && isValid) {
      return { success: true, message: 'Login successful' };
    } else {
      return { success: false, message: 'Invalid credentials' };
    }

  } catch (error) {
    console.error('Admin login error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'An internal server error occurred during login.',
      data: error.message
    })
  }
})
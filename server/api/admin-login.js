import clientPromise from '../utils/db.js'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

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

    if (admin) {
      // If admin exists, check if the password is a valid hash. 
      // If not, it's likely an old plain-text password. Re-hash and update it.
      const isHashed = admin.password && (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'));
      if (!isHashed) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await adminsCollection.updateOne(
          { _id: admin._id },
          { $set: { password: hashedPassword } }
        );
        admin.password = hashedPassword; // Update for the current request
      }
    } else {
      // If admin does not exist, create it with a hashed password.
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminData = {
        email: adminEmail,
        password: hashedPassword,
        createdAt: new Date()
      };
      await adminsCollection.insertOne(adminData);
      admin = adminData;
    }

    // Now, compare the provided password with the stored hash.
    // Ensure admin object and password exist before comparing.
    if (!admin || !admin.password) {
        return { success: false, message: 'Admin account is not configured correctly.' };
    }
    
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
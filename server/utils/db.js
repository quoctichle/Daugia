import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || "mongodb+srv://quoctichle_db_user:Letich37@cluster0.ol5cjn6.mongodb.net/"

let client

export async function connectToDatabase(dbName = 'daugia') {
  try {
    if (!client) {
      client = new MongoClient(uri)
      await client.connect()
      console.log('Connected to MongoDB')
    }
    return client.db(dbName)
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? "mongodb://localhost:27017" : "mongodb+srv://quoctichle_db_user:Letich37@cluster0.ol5cjn6.mongodb.net/daugia?retryWrites=true&w=majority")

if (!uri) {
  throw new Error("Missing MONGODB_URI")
}

let client
let clientPromise

if (!global._mongoClientPromise) {
  client = new MongoClient(uri)
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

export default clientPromise

// For backward compatibility
export async function connectToDatabase(dbName = process.env.MONGODB_DB || 'daugia') {
  const client = await clientPromise
  return client.db(dbName)
}
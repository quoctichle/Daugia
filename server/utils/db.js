import { MongoClient } from 'mongodb'

// WARNING: It is not recommended to store credentials directly in the code.
// Please set the MONGODB_URI environment variable in your hosting provider (e.g., Vercel).
const MONGODB_URI_FALLBACK = "mongodb+srv://quoctichle_db_user:Letich37@cluster0.ol5cjn6.mongodb.net/daugia?retryWrites=true&w=majority";

const uri = process.env.MONGODB_URI || MONGODB_URI_FALLBACK

if (!uri) {
  throw new Error("Missing MONGODB_URI and no fallback URI was provided.")
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
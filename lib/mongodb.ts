import { MongoClient, type Db } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'empanadas'

type GlobalMongoCache = {
  clientPromise?: Promise<MongoClient>
}

const globalForMongo = globalThis as typeof globalThis & GlobalMongoCache

function createClientPromise() {
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

  return new MongoClient(uri, {
    maxPoolSize: 10,
  }).connect()
}

const clientPromise = globalForMongo.clientPromise || createClientPromise()

if (process.env.NODE_ENV !== 'production') {
  globalForMongo.clientPromise = clientPromise
}

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName)
}

import type { Db } from 'mongodb'
import { MongoClient, ServerApiVersion } from 'mongodb'

const connString = process.env.DB_CONN_STRING

if (!connString) {
  const e = 'No DB Connection string provided'
  console.error(e)
  throw new Error(e)
}

const dbClient = new MongoClient(connString, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

let isConnected = false

export async function getDb(): Promise<Db> {
  if (!isConnected) {
    try {
      await dbClient.connect()
      isConnected = true
      return dbClient.db('pool-tracker')
    }
    catch (error) {
      console.error('Failed to connect to MongoDB', error)
      throw error
    }
  }
  return dbClient.db('pool-tracker')
}

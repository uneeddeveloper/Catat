import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

let pool: mysql.Pool | undefined
let db: ReturnType<typeof drizzle<typeof schema, mysql.Pool>> | undefined

export function useDb() {
  if (!db) {
    const config = useRuntimeConfig()
    pool = mysql.createPool({
      uri: config.databaseUrl,
      ssl: { minVersion: 'TLSv1.2' },
      connectionLimit: 5
    })
    db = drizzle(pool, { schema, mode: 'default' })
  }
  return db
}

import 'dotenv/config'
import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import * as schema from './schema'

const DEFAULT_CATEGORIES = ['Makanan', 'Transport', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya']

async function main() {
  const databaseUrl = process.env.TIDB_DATABASE_URL
  if (!databaseUrl) throw new Error('TIDB_DATABASE_URL is not set')

  const pool = mysql.createPool({ uri: databaseUrl, ssl: { minVersion: 'TLSv1.2' } })
  const db = drizzle(pool, { schema, mode: 'default' })

  for (const name of DEFAULT_CATEGORIES) {
    await db.insert(schema.categories)
      .values({ name, isDefault: true })
      .onDuplicateKeyUpdate({ set: { name } })
  }

  console.log(`Seeded ${DEFAULT_CATEGORIES.length} default categories`)
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

import 'dotenv/config'
import mysql, { type RowDataPacket } from 'mysql2/promise'
import { encrypt, decrypt } from '../server/utils/encryption'

// One-off migration: enkripsi data lama yang masih plain text setelah kolom
// diubah ke `text` lewat `npm run db:push`. WAJIB dijalankan SETELAH db:push,
// dan WAJIB backup database dulu sebelum menjalankan ini.
//
// Idempotent & aman dijalankan berkali-kali: tiap field dicoba di-decrypt dulu,
// kalau berhasil (berarti sudah ciphertext) dilewati; kalau gagal (masih
// plaintext legacy) baru dienkripsi dan ditulis balik.
//
// Pakai koneksi mysql2 mentah (bukan lewat db/client.ts + schema.ts) supaya
// tidak melewati customType encrypt/decrypt otomatis di Drizzle - di sini kita
// perlu baca/tulis nilai mentah di database secara langsung.
//
// Jalankan: npx tsx scripts/encrypt-existing-data.ts

const TABLES: Record<string, string[]> = {
  transactions: ['amount', 'merchant', 'description', 'receipt_image_url', 'raw_llm_response'],
  transaction_items: ['name', 'price'],
  chat_users: ['username', 'first_name', 'last_name']
}

async function main() {
  const databaseUrl = process.env.TIDB_DATABASE_URL
  if (!databaseUrl) throw new Error('TIDB_DATABASE_URL is not set')
  if (!process.env.DATA_ENCRYPTION_KEY) throw new Error('DATA_ENCRYPTION_KEY is not set')

  const pool = mysql.createPool({ uri: databaseUrl, ssl: { minVersion: 'TLSv1.2' } })

  let totalUpdated = 0
  let totalSkipped = 0

  for (const [table, columns] of Object.entries(TABLES)) {
    const columnList = columns.map(c => `\`${c}\``).join(', ')
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT id, ${columnList} FROM \`${table}\``)

    for (const row of rows) {
      const setClauses: string[] = []
      const values: string[] = []

      for (const col of columns) {
        const value = row[col]
        if (value == null) continue

        const raw = String(value)
        try {
          decrypt(raw) // sudah ciphertext valid -> lewati
        } catch {
          setClauses.push(`\`${col}\` = ?`)
          values.push(encrypt(raw))
        }
      }

      if (setClauses.length) {
        values.push(row.id)
        await pool.query(`UPDATE \`${table}\` SET ${setClauses.join(', ')} WHERE id = ?`, values)
        totalUpdated++
      } else {
        totalSkipped++
      }
    }

    console.log(`[${table}] ${rows.length} baris diperiksa`)
  }

  console.log(`Selesai. ${totalUpdated} baris dienkripsi, ${totalSkipped} baris sudah terenkripsi sebelumnya.`)
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

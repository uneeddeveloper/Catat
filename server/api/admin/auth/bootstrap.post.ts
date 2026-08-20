import { count } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { admins } from '../../../db/schema'

/**
 * One-time bootstrap: creates the first admin account when the admins
 * table is still empty. Once an admin exists, this route always rejects —
 * use POST /api/admin/admins (session-protected) to add more admins after that.
 */
export default defineEventHandler(async (event) => {
  const db = useDb()
  const [adminCount] = await db.select({ value: count() }).from(admins)

  if ((adminCount?.value ?? 0) > 0) {
    throw createError({ statusCode: 403, statusMessage: 'Admin sudah ada, gunakan halaman login' })
  }

  const { name, email, password } = await readBody<{ name: string, email: string, password: string }>(event)
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Nama, email, dan password (min 8 karakter) wajib diisi' })
  }

  await db.insert(admins).values({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hashPassword(password)
  })

  return { ok: true }
})

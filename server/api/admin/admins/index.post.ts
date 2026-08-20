import { useDb } from '../../../db/client'
import { admins } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)

  const { name, email, password, businessId } = await readBody<{ name: string, email: string, password: string, businessId?: number | null }>(event)
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Nama, email, dan password (min 8 karakter) wajib diisi' })
  }

  const db = useDb()
  await db.insert(admins).values({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: await hashPassword(password),
    businessId: businessId ?? null
  })

  return { ok: true }
})

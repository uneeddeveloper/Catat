import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { admins } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  const { name, email, password, businessId } = await readBody<{ name: string, email: string, password?: string, businessId?: number | null }>(event)

  if (!name?.trim() || !email?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nama dan email wajib diisi' })
  }
  if (password && password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password minimal 8 karakter' })
  }

  const db = useDb()
  await db.update(admins).set({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    businessId: businessId ?? null,
    ...(password ? { passwordHash: await hashPassword(password) } : {})
  }).where(eq(admins.id, id))

  return { ok: true }
})

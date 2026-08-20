import { useDb } from '../../../db/client'
import { categories } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const { name, businessId } = await readBody<{ name: string, businessId?: number | null }>(event)
  if (!name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nama kategori wajib diisi' })
  }

  const db = useDb()
  await db.insert(categories).values({ name: name.trim(), businessId: admin.businessId ?? businessId ?? null })

  return { ok: true }
})

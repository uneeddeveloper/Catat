import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { categories } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  if (admin.businessId) {
    const [row] = await db.select({ businessId: categories.businessId }).from(categories).where(eq(categories.id, id)).limit(1)
    if (!row || row.businessId !== admin.businessId) {
      throw createError({ statusCode: 403, statusMessage: 'Tidak boleh menghapus kategori usaha lain' })
    }
  }

  await db.delete(categories).where(eq(categories.id, id))

  return { ok: true }
})

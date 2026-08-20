import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { chats } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ isActive?: boolean, businessId?: number | null }>(event)

  const db = useDb()

  if (admin.businessId) {
    const [row] = await db.select({ businessId: chats.businessId }).from(chats).where(eq(chats.id, id)).limit(1)
    if (!row || row.businessId !== admin.businessId) {
      throw createError({ statusCode: 403, statusMessage: 'Tidak boleh mengubah chat usaha lain' })
    }
  }

  await db.update(chats).set({
    ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    ...(body.businessId !== undefined && !admin.businessId ? { businessId: body.businessId } : {})
  }).where(eq(chats.id, id))

  return { ok: true }
})

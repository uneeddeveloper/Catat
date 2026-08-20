import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { businesses } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  const { name } = await readBody<{ name: string }>(event)
  if (!name?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nama usaha wajib diisi' })
  }

  const db = useDb()
  await db.update(businesses).set({ name: name.trim() }).where(eq(businesses.id, id))

  return { ok: true }
})

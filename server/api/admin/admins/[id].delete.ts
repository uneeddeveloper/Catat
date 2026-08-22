import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { admins } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const currentAdmin = await requireSuperAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  if (id === currentAdmin.id) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak bisa menghapus akun sendiri' })
  }

  const db = useDb()
  await db.delete(admins).where(eq(admins.id, id))

  return { ok: true }
})

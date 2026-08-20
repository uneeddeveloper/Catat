import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { transactions, chats } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()

  if (admin.businessId) {
    const [row] = await db.select({ businessId: chats.businessId })
      .from(transactions)
      .leftJoin(chats, eq(transactions.chatId, chats.id))
      .where(eq(transactions.id, id))
      .limit(1)
    if (!row || row.businessId !== admin.businessId) {
      throw createError({ statusCode: 403, statusMessage: 'Tidak boleh menghapus transaksi usaha lain' })
    }
  }

  await db.delete(transactions).where(eq(transactions.id, id))

  return { ok: true }
})

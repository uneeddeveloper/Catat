import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { transactions, chats } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ amount?: number, categoryId?: number, description?: string, merchant?: string, type?: 'expense' | 'income' }>(event)

  const db = useDb()

  if (admin.businessId) {
    const [row] = await db.select({ businessId: chats.businessId })
      .from(transactions)
      .leftJoin(chats, eq(transactions.chatId, chats.id))
      .where(eq(transactions.id, id))
      .limit(1)
    if (!row || row.businessId !== admin.businessId) {
      throw createError({ statusCode: 403, statusMessage: 'Tidak boleh mengubah transaksi usaha lain' })
    }
  }

  await db.update(transactions).set({
    ...(body.amount !== undefined ? { amount: String(body.amount) } : {}),
    ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.merchant !== undefined ? { merchant: body.merchant } : {}),
    ...(body.type !== undefined ? { type: body.type } : {})
  }).where(eq(transactions.id, id))

  return { ok: true }
})

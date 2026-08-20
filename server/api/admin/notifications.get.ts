import { eq, desc } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions, categories, chats, businesses } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const db = useDb()

  const rows = await db.select({
    id: transactions.id,
    amount: transactions.amount,
    type: transactions.type,
    description: transactions.description,
    categoryName: categories.name,
    chatTitle: chats.title,
    businessName: businesses.name,
    createdAt: transactions.createdAt
  })
    .from(transactions)
    .leftJoin(chats, eq(transactions.chatId, chats.id))
    .leftJoin(businesses, eq(chats.businessId, businesses.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(admin.businessId ? eq(chats.businessId, admin.businessId) : undefined)
    .orderBy(desc(transactions.createdAt))
    .limit(8)

  return rows
})

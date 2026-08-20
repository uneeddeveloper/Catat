import { and, eq, gte, lte, like, desc } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { transactions, chats, categories, chatUsers, businesses } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)

  const query = getQuery(event)
  const db = useDb()

  const conditions = []
  if (admin.businessId) conditions.push(eq(chats.businessId, admin.businessId))
  if (query.chatId) conditions.push(eq(transactions.chatId, Number(query.chatId)))
  if (query.categoryId) conditions.push(eq(transactions.categoryId, Number(query.categoryId)))
  if (query.type === 'expense' || query.type === 'income') conditions.push(eq(transactions.type, query.type))
  if (query.from) conditions.push(gte(transactions.expenseDate, new Date(String(query.from))))
  if (query.to) conditions.push(lte(transactions.expenseDate, new Date(String(query.to))))
  if (query.search) conditions.push(like(transactions.description, `%${query.search}%`))

  const rows = await db.select({
    id: transactions.id,
    amount: transactions.amount,
    currency: transactions.currency,
    type: transactions.type,
    merchant: transactions.merchant,
    description: transactions.description,
    expenseDate: transactions.expenseDate,
    receiptImageUrl: transactions.receiptImageUrl,
    source: transactions.source,
    createdAt: transactions.createdAt,
    chatId: chats.id,
    chatTitle: chats.title,
    chatType: chats.type,
    businessName: businesses.name,
    categoryId: categories.id,
    categoryName: categories.name,
    senderFirstName: chatUsers.firstName,
    senderUsername: chatUsers.username
  })
    .from(transactions)
    .leftJoin(chats, eq(transactions.chatId, chats.id))
    .leftJoin(businesses, eq(chats.businessId, businesses.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(chatUsers, eq(transactions.senderId, chatUsers.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(transactions.expenseDate))
    .limit(200)

  return rows
})

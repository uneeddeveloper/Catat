import { and, eq, gte, desc } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions, categories, chats, businesses } from '../../db/schema'

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const db = useDb()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const dayOfMonth = now.getDate()

  const monthRows = await db.select({
    amount: transactions.amount,
    type: transactions.type,
    expenseDate: transactions.expenseDate,
    categoryName: categories.name,
    businessId: chats.businessId,
    businessName: businesses.name
  })
    .from(transactions)
    .leftJoin(chats, eq(transactions.chatId, chats.id))
    .leftJoin(businesses, eq(chats.businessId, businesses.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(admin.businessId
      ? and(gte(transactions.expenseDate, startOfMonth), eq(chats.businessId, admin.businessId))
      : gte(transactions.expenseDate, startOfMonth))

  const totalExpense = monthRows.filter(r => r.type === 'expense').reduce((acc, r) => acc + Number(r.amount), 0)
  const totalIncome = monthRows.filter(r => r.type === 'income').reduce((acc, r) => acc + Number(r.amount), 0)

  const byCategory = new Map<string, number>()
  for (const row of monthRows.filter(r => r.type === 'expense')) {
    const name = row.categoryName ?? 'Lainnya'
    byCategory.set(name, (byCategory.get(name) ?? 0) + Number(row.amount))
  }

  const businessMap = new Map<number, { id: number, name: string, income: number, expense: number }>()
  for (const row of monthRows) {
    if (!row.businessId) continue
    const entry = businessMap.get(row.businessId) ?? { id: row.businessId, name: row.businessName ?? 'Usaha', income: 0, expense: 0 }
    if (row.type === 'income') entry.income += Number(row.amount)
    else entry.expense += Number(row.amount)
    businessMap.set(row.businessId, entry)
  }

  const trendMap = new Map<string, number>()
  for (const row of monthRows) {
    if (row.type !== 'expense') continue
    const key = dateKey(new Date(row.expenseDate))
    trendMap.set(key, (trendMap.get(key) ?? 0) + Number(row.amount))
  }
  const dailyTrend: { date: string, total: number }[] = []
  for (let d = new Date(startOfMonth); d <= now; d.setDate(d.getDate() + 1)) {
    dailyTrend.push({ date: dateKey(d), total: trendMap.get(dateKey(d)) ?? 0 })
  }

  const recent = await db.select({
    id: transactions.id,
    amount: transactions.amount,
    type: transactions.type,
    description: transactions.description,
    expenseDate: transactions.expenseDate,
    chatTitle: chats.title,
    businessName: businesses.name,
    categoryName: categories.name
  })
    .from(transactions)
    .leftJoin(chats, eq(transactions.chatId, chats.id))
    .leftJoin(businesses, eq(chats.businessId, businesses.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(admin.businessId ? eq(chats.businessId, admin.businessId) : undefined)
    .orderBy(desc(transactions.expenseDate))
    .limit(10)

  return {
    summary: {
      totalExpenseThisMonth: totalExpense,
      totalIncomeThisMonth: totalIncome,
      transactionCount: monthRows.length,
      averagePerDay: dayOfMonth > 0 ? totalExpense / dayOfMonth : 0,
      byCategory: Array.from(byCategory.entries())
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
    },
    businesses: Array.from(businessMap.values())
      .map(b => ({ ...b, profit: b.income - b.expense }))
      .sort((a, b) => (b.income + b.expense) - (a.income + a.expense)),
    dailyTrend: dailyTrend.slice(-14),
    recent
  }
})

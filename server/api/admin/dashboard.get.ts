import { and, eq, gte, lte, desc } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions, categories, chats, businesses } from '../../db/schema'
import { resolvePeriodRange, type ReportPeriod } from '../../reports/periodRange'

function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const db = useDb()

  const query = getQuery(event)
  const period = (query.period as ReportPeriod) || 'month'
  const { from, to, label } = resolvePeriodRange(period, query.from as string | undefined, query.to as string | undefined)

  const now = new Date()
  const rangeDays = Math.max(1, Math.round((Math.min(to.getTime(), now.getTime()) - from.getTime()) / 86400000) + 1)

  const rangeRows = await db.select({
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
      ? and(gte(transactions.expenseDate, from), lte(transactions.expenseDate, to), eq(chats.businessId, admin.businessId))
      : and(gte(transactions.expenseDate, from), lte(transactions.expenseDate, to)))

  const totalExpense = rangeRows.filter(r => r.type === 'expense').reduce((acc, r) => acc + Number(r.amount), 0)
  const totalIncome = rangeRows.filter(r => r.type === 'income').reduce((acc, r) => acc + Number(r.amount), 0)

  const byCategory = new Map<string, number>()
  for (const row of rangeRows.filter(r => r.type === 'expense')) {
    const name = row.categoryName ?? 'Lainnya'
    byCategory.set(name, (byCategory.get(name) ?? 0) + Number(row.amount))
  }

  const businessMap = new Map<number, { id: number, name: string, income: number, expense: number }>()
  for (const row of rangeRows) {
    if (!row.businessId) continue
    const entry = businessMap.get(row.businessId) ?? { id: row.businessId, name: row.businessName ?? 'Usaha', income: 0, expense: 0 }
    if (row.type === 'income') entry.income += Number(row.amount)
    else entry.expense += Number(row.amount)
    businessMap.set(row.businessId, entry)
  }

  const trendMap = new Map<string, number>()
  for (const row of rangeRows) {
    if (row.type !== 'expense') continue
    const key = dateKey(new Date(row.expenseDate))
    trendMap.set(key, (trendMap.get(key) ?? 0) + Number(row.amount))
  }
  const dailyTrend: { date: string, total: number }[] = []
  const rangeEnd = to < now ? to : now
  for (let d = new Date(from); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
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
    categoryName: categories.name,
    receiptImageUrl: transactions.receiptImageUrl
  })
    .from(transactions)
    .leftJoin(chats, eq(transactions.chatId, chats.id))
    .leftJoin(businesses, eq(chats.businessId, businesses.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(admin.businessId
      ? and(gte(transactions.expenseDate, from), lte(transactions.expenseDate, to), eq(chats.businessId, admin.businessId))
      : and(gte(transactions.expenseDate, from), lte(transactions.expenseDate, to)))
    .orderBy(desc(transactions.expenseDate))
    .limit(10)

  return {
    range: { from: dateKey(from), to: dateKey(to), label },
    summary: {
      totalExpense,
      totalIncome,
      transactionCount: rangeRows.length,
      averagePerDay: totalExpense / rangeDays,
      byCategory: Array.from(byCategory.entries())
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
    },
    businesses: Array.from(businessMap.values())
      .map(b => ({ ...b, profit: b.income - b.expense }))
      .sort((a, b) => (b.income + b.expense) - (a.income + a.expense)),
    dailyTrend,
    recent
  }
})

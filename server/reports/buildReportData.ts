import { and, eq, gte, lte, isNull, desc } from 'drizzle-orm'
import { useDb } from '../db/client'
import { transactions, categories, chatUsers, chats, businesses } from '../db/schema'

export interface ReportRow {
  id: number
  expenseDate: Date
  type: 'expense' | 'income'
  amount: number
  categoryName: string
  merchant: string | null
  description: string | null
  senderName: string
}

export interface ReportData {
  scopeName: string
  from: Date
  to: Date
  periodLabel: string
  totalIncome: number
  totalExpense: number
  profit: number
  byCategory: { name: string, expense: number, income: number }[]
  rows: ReportRow[]
}

export async function buildReportData(params: { businessId: number | null, from: Date, to: Date, periodLabel: string }): Promise<ReportData> {
  const { businessId, from, to, periodLabel } = params
  const db = useDb()

  const scopeName = businessId
    ? (await db.select({ name: businesses.name }).from(businesses).where(eq(businesses.id, businessId)).limit(1))[0]?.name ?? 'Usaha'
    : 'Personal'

  const rows = await db.select({
    id: transactions.id,
    expenseDate: transactions.expenseDate,
    type: transactions.type,
    amount: transactions.amount,
    categoryName: categories.name,
    merchant: transactions.merchant,
    description: transactions.description,
    senderFirstName: chatUsers.firstName,
    senderUsername: chatUsers.username
  })
    .from(transactions)
    .leftJoin(chats, eq(transactions.chatId, chats.id))
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(chatUsers, eq(transactions.senderId, chatUsers.id))
    .where(and(
      businessId ? eq(chats.businessId, businessId) : isNull(chats.businessId),
      gte(transactions.expenseDate, from),
      lte(transactions.expenseDate, to)
    ))
    .orderBy(desc(transactions.expenseDate))

  const reportRows: ReportRow[] = rows.map(r => ({
    id: r.id,
    expenseDate: r.expenseDate,
    type: r.type,
    amount: Number(r.amount),
    categoryName: r.categoryName ?? 'Lainnya',
    merchant: r.merchant,
    description: r.description,
    senderName: r.senderFirstName ?? r.senderUsername ?? 'Seseorang'
  }))

  const totalIncome = reportRows.filter(r => r.type === 'income').reduce((acc, r) => acc + r.amount, 0)
  const totalExpense = reportRows.filter(r => r.type === 'expense').reduce((acc, r) => acc + r.amount, 0)

  const byCategoryMap = new Map<string, { name: string, expense: number, income: number }>()
  for (const row of reportRows) {
    const entry = byCategoryMap.get(row.categoryName) ?? { name: row.categoryName, expense: 0, income: 0 }
    if (row.type === 'income') entry.income += row.amount
    else entry.expense += row.amount
    byCategoryMap.set(row.categoryName, entry)
  }

  return {
    scopeName,
    from,
    to,
    periodLabel,
    totalIncome,
    totalExpense,
    profit: totalIncome - totalExpense,
    byCategory: Array.from(byCategoryMap.values()).sort((a, b) => (b.expense + b.income) - (a.expense + a.income)),
    rows: reportRows
  }
}

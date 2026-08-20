import type { Context } from 'grammy'
import { and, eq, gte } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions } from '../../db/schema'
import { formatRupiah, upsertChat, getBusinessForChat } from '../helpers'

export async function handleRekap(ctx: Context) {
  const chat = await upsertChat(ctx)
  const business = await getBusinessForChat(chat)
  const db = useDb()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthRows = await db.select({ amount: transactions.amount, type: transactions.type, expenseDate: transactions.expenseDate })
    .from(transactions)
    .where(and(eq(transactions.chatId, chat.id), gte(transactions.expenseDate, startOfMonth)))

  type Row = (typeof monthRows)[number]
  const sum = (list: Row[]) => list.reduce((acc, r) => acc + Number(r.amount), 0)

  const income = sum(monthRows.filter(r => r.type === 'income'))
  const expense = sum(monthRows.filter(r => r.type === 'expense'))

  if (business) {
    await ctx.reply(
      [
        `📊 Rekap ${business.name} — bulan ini`,
        `📈 Pemasukan: ${formatRupiah(income)}`,
        `📉 Pengeluaran: ${formatRupiah(expense)}`,
        `💵 Laba: ${formatRupiah(income - expense)}`
      ].join('\n')
    )
    return
  }

  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const expenseRows = monthRows.filter(r => r.type === 'expense')
  const today = sum(expenseRows.filter(r => r.expenseDate >= startOfDay))
  const week = sum(expenseRows.filter(r => r.expenseDate >= startOfWeek))

  const lines = [
    '📊 Rekap pengeluaran',
    `Hari ini: ${formatRupiah(today)}`,
    `Minggu ini: ${formatRupiah(week)}`,
    `Bulan ini: ${formatRupiah(expense)}`
  ]
  if (income > 0) lines.push(`📈 Pemasukan bulan ini: ${formatRupiah(income)}`)

  await ctx.reply(lines.join('\n'))
}

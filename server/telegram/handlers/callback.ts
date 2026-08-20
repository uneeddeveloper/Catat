import type { Context } from 'grammy'
import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions, categories, chatUsers, chats, businesses } from '../../db/schema'
import { getCategories, buildTransactionSummaryText, buildSummaryKeyboard, buildCategoryKeyboard } from '../helpers'
import type { TransactionExtraction } from '../../llm/types'
import { handleReportPeriodCallback, handleReportFormatCallback } from './laporan'
import type { ReportPeriod } from '../../reports/periodRange'
import { handlePanduanCallback } from './panduan'

async function loadTransactionView(transactionId: number) {
  const db = useDb()
  const [row] = await db.select({
    amount: transactions.amount,
    currency: transactions.currency,
    merchant: transactions.merchant,
    description: transactions.description,
    type: transactions.type,
    categoryName: categories.name,
    senderFirstName: chatUsers.firstName,
    senderUsername: chatUsers.username,
    chatBusinessId: chats.businessId,
    businessName: businesses.name
  })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(chatUsers, eq(transactions.senderId, chatUsers.id))
    .leftJoin(chats, eq(transactions.chatId, chats.id))
    .leftJoin(businesses, eq(chats.businessId, businesses.id))
    .where(eq(transactions.id, transactionId))
    .limit(1)

  return row
}

function toExtraction(row: NonNullable<Awaited<ReturnType<typeof loadTransactionView>>>): TransactionExtraction {
  return {
    amount: Number(row.amount),
    type: row.type,
    currency: row.currency,
    merchant: row.merchant,
    description: row.description ?? '',
    category: row.categoryName ?? 'Lainnya',
    date: null,
    items: [],
    confidence: 'high'
  }
}

export async function handleCallback(ctx: Context) {
  const data = ctx.callbackQuery?.data
  if (!data) return
  const db = useDb()

  if (data.startsWith('pnd:')) {
    const section = data.split(':')[1] as 'main' | 'pakai' | 'grup' | 'perintah'
    await handlePanduanCallback(ctx, section)
    return
  }

  if (data.startsWith('rpt:p:')) {
    const period = data.split(':')[2] as ReportPeriod
    await handleReportPeriodCallback(ctx, period)
    return
  }

  if (data.startsWith('rpt:f:')) {
    const [, , period, format] = data.split(':')
    await handleReportFormatCallback(ctx, period as ReportPeriod, format as 'xlsx' | 'pdf')
    return
  }

  if (data.startsWith('del:')) {
    const transactionId = Number(data.split(':')[1])
    await db.delete(transactions).where(eq(transactions.id, transactionId))
    await ctx.editMessageText('❌ Transaksi dihapus')
    await ctx.answerCallbackQuery('Dihapus')
    return
  }

  if (data.startsWith('catmenu:')) {
    const transactionId = Number(data.split(':')[1])
    const row = await loadTransactionView(transactionId)
    const categoryList = await getCategories(row?.chatBusinessId ?? null)
    await ctx.editMessageReplyMarkup({ reply_markup: buildCategoryKeyboard(transactionId, categoryList) })
    await ctx.answerCallbackQuery()
    return
  }

  if (data.startsWith('setcat:')) {
    const [, transactionIdRaw, categoryIdRaw] = data.split(':')
    const transactionId = Number(transactionIdRaw)
    const categoryId = Number(categoryIdRaw)
    await db.update(transactions).set({ categoryId }).where(eq(transactions.id, transactionId))

    const row = await loadTransactionView(transactionId)
    if (row) {
      const senderName = row.senderFirstName ?? row.senderUsername ?? 'Seseorang'
      await ctx.editMessageText(buildTransactionSummaryText(toExtraction(row), row.categoryName ?? 'Lainnya', senderName, row.businessName), {
        reply_markup: buildSummaryKeyboard(transactionId)
      })
    }
    await ctx.answerCallbackQuery('Kategori diubah')
    return
  }

  if (data.startsWith('back:')) {
    const transactionId = Number(data.split(':')[1])
    const row = await loadTransactionView(transactionId)
    if (row) {
      const senderName = row.senderFirstName ?? row.senderUsername ?? 'Seseorang'
      await ctx.editMessageText(buildTransactionSummaryText(toExtraction(row), row.categoryName ?? 'Lainnya', senderName, row.businessName), {
        reply_markup: buildSummaryKeyboard(transactionId)
      })
    }
    await ctx.answerCallbackQuery()
  }
}

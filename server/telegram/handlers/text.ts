import type { Context } from 'grammy'
import { useDb } from '../../db/client'
import { transactions, transactionItems } from '../../db/schema'
import { parseExpenseText } from '../../llm/parseExpenseText'
import { upsertChat, upsertTelegramUser, getBusinessForChat, getCategories, buildTransactionSummaryText, buildSummaryKeyboard } from '../helpers'

export async function handleText(ctx: Context) {
  const text = ctx.message?.text
  if (!text || text.startsWith('/')) return

  const [chat, telegramUser] = await Promise.all([upsertChat(ctx), upsertTelegramUser(ctx)])
  const [business, categoryList] = await Promise.all([getBusinessForChat(chat), getCategories(chat.businessId)])

  const extraction = await parseExpenseText(text, categoryList.map(c => c.name))

  if (!extraction.amount) {
    await ctx.reply('🤔 Aku belum nangkep nominalnya. Coba tulis ulang, misal: "beli kopi 25rb"')
    return
  }

  const category = categoryList.find(c => c.name === extraction.category) ?? categoryList.find(c => c.name === 'Lainnya')

  const db = useDb()
  const [result] = await db.insert(transactions).values({
    chatId: chat.id,
    senderId: telegramUser.id,
    categoryId: category?.id,
    type: extraction.type,
    amount: String(extraction.amount),
    currency: extraction.currency || 'IDR',
    merchant: extraction.merchant,
    description: extraction.description,
    expenseDate: extraction.date ? new Date(extraction.date) : new Date(),
    source: 'text',
    rawLlmResponse: extraction
  })

  if (extraction.items.length) {
    await db.insert(transactionItems).values(extraction.items.map(item => ({
      transactionId: result.insertId,
      name: item.name,
      price: String(item.price)
    })))
  }

  const senderName = ctx.from?.first_name ?? ctx.from?.username ?? 'Seseorang'
  await ctx.reply(buildTransactionSummaryText(extraction, category?.name ?? 'Lainnya', senderName, business?.name), {
    reply_markup: buildSummaryKeyboard(result.insertId)
  })
}

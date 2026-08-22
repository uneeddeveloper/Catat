import type { Context } from 'grammy'
import { useDb } from '../../db/client'
import { transactions, transactionItems } from '../../db/schema'
import { extractReceipt } from '../../llm/extractReceipt'
import { uploadReceiptImage } from '../../storage/r2'
import { resizeReceiptImage } from '../../storage/imageResize'
import { upsertChat, upsertTelegramUser, getBusinessForChat, getCategories, buildTransactionSummaryText, buildSummaryKeyboard } from '../helpers'

export async function handlePhoto(ctx: Context) {
  const photos = ctx.message?.photo
  if (!photos || photos.length === 0) return

  const config = useRuntimeConfig()
  const largest = photos[photos.length - 1]
  if (!largest) return
  const file = await ctx.getFile()
  if (!file.file_path) return

  const fileUrl = `https://api.telegram.org/file/bot${config.telegramBotToken}/${file.file_path}`
  const fileResponse = await fetch(fileUrl)
  const rawBuffer = Buffer.from(await fileResponse.arrayBuffer())
  const buffer = await resizeReceiptImage(rawBuffer)

  const key = `receipts/${Date.now()}-${largest.file_unique_id}.jpg`
  const publicUrl = await uploadReceiptImage(key, buffer, 'image/jpeg')

  const [chat, telegramUser] = await Promise.all([upsertChat(ctx), upsertTelegramUser(ctx)])
  const [business, categoryList] = await Promise.all([getBusinessForChat(chat), getCategories(chat.businessId)])

  const extraction = await extractReceipt(publicUrl, categoryList.map(c => c.name))

  if (!extraction.amount) {
    await ctx.reply('🤔 Aku belum bisa baca nominal totalnya dari struk ini. Coba foto ulang yang lebih jelas, atau ketik manual.')
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
    receiptImageUrl: publicUrl,
    source: 'photo',
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

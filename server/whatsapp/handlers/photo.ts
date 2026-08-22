import { useDb } from '../../db/client'
import { transactions, transactionItems } from '../../db/schema'
import { extractReceipt } from '../../llm/extractReceipt'
import { uploadReceiptImage } from '../../storage/r2'
import { resizeReceiptImage } from '../../storage/imageResize'
import { getBusinessForChat, getCategories, buildTransactionSummaryText } from '../../chat/helpers'
import { sendFonnteMessage } from '../fonnteClient'
import type { WaContext } from '../types'

const FOOTER = 'Balas "ganti <kategori>" buat ganti kategori, "tukar" buat tukar jenis pemasukan/pengeluaran, atau "hapus" buat hapus transaksi ini.'

export async function handlePhoto(ctx: WaContext, mediaUrl: string) {
  const config = useRuntimeConfig()
  const fileResponse = await fetch(mediaUrl, { headers: { Authorization: config.fonnteApiToken } })
  const rawBuffer = Buffer.from(await fileResponse.arrayBuffer())
  const buffer = await resizeReceiptImage(rawBuffer)

  const key = `receipts/${Date.now()}-wa-${ctx.chat.id}.jpg`
  const publicUrl = await uploadReceiptImage(key, buffer, 'image/jpeg')

  const [business, categoryList] = await Promise.all([getBusinessForChat(ctx.chat), getCategories(ctx.chat.businessId)])

  const extraction = await extractReceipt(publicUrl, categoryList.map(c => c.name))

  if (!extraction.amount) {
    await sendFonnteMessage({ target: ctx.target, message: '🤔 Aku belum bisa baca nominal totalnya dari struk ini. Coba foto ulang yang lebih jelas, atau ketik manual.' })
    return
  }

  const category = categoryList.find(c => c.name === extraction.category) ?? categoryList.find(c => c.name === 'Lainnya')

  const db = useDb()
  const [result] = await db.insert(transactions).values({
    chatId: ctx.chat.id,
    senderId: ctx.user.id,
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

  const summary = buildTransactionSummaryText(extraction, category?.name ?? 'Lainnya', ctx.senderName, business?.name)
  await sendFonnteMessage({ target: ctx.target, message: `${summary}\n\n${FOOTER}` })
}

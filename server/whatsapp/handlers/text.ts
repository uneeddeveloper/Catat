import { useDb } from '../../db/client'
import { transactions } from '../../db/schema'
import { parseExpenseText } from '../../llm/parseExpenseText'
import { getBusinessForChat, getCategories, buildTransactionSummaryText } from '../../chat/helpers'
import { sendFonnteMessage } from '../fonnteClient'
import type { WaContext } from '../types'

const FOOTER = 'Balas "ganti <kategori>" buat ganti kategori, atau "hapus" buat hapus transaksi ini.'

export async function handleText(ctx: WaContext, text: string) {
  const [business, categoryList] = await Promise.all([getBusinessForChat(ctx.chat), getCategories(ctx.chat.businessId)])

  const extraction = await parseExpenseText(text, categoryList.map(c => c.name))

  if (!extraction.amount) {
    await sendFonnteMessage({ target: ctx.target, message: '🤔 Aku belum nangkep nominalnya. Coba tulis ulang, misal: "beli kopi 25rb"' })
    return
  }

  const category = categoryList.find(c => c.name === extraction.category) ?? categoryList.find(c => c.name === 'Lainnya')

  const db = useDb()
  await db.insert(transactions).values({
    chatId: ctx.chat.id,
    senderId: ctx.user.id,
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

  const summary = buildTransactionSummaryText(extraction, category?.name ?? 'Lainnya', ctx.senderName, business?.name)
  await sendFonnteMessage({ target: ctx.target, message: `${summary}\n\n${FOOTER}` })
}

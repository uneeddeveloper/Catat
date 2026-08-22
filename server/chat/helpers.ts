import { and, eq, isNull } from 'drizzle-orm'
import { useDb } from '../db/client'
import { chats, chatUsers, categories, businesses } from '../db/schema'
import type { TransactionExtraction } from '../llm/types'

type Platform = 'telegram' | 'whatsapp'
type ChatType = 'private' | 'group' | 'supergroup'

export async function upsertChat(params: { platform: Platform, externalChatId: string, type: ChatType, title: string | null }) {
  const db = useDb()
  const { platform, externalChatId, type, title } = params

  await db.insert(chats)
    .values({ platform, externalChatId, type, title })
    .onDuplicateKeyUpdate({ set: { title, isActive: true } })

  const [row] = await db.select().from(chats)
    .where(and(eq(chats.platform, platform), eq(chats.externalChatId, externalChatId)))
    .limit(1)
  if (!row) throw new Error('Failed to upsert chat')
  return row
}

export async function upsertChatUser(params: { platform: Platform, externalUserId: string, username?: string | null, firstName?: string | null, lastName?: string | null }) {
  const db = useDb()
  const { platform, externalUserId, username, firstName, lastName } = params

  await db.insert(chatUsers)
    .values({ platform, externalUserId, username, firstName, lastName })
    .onDuplicateKeyUpdate({ set: { username, firstName, lastName } })

  const [row] = await db.select().from(chatUsers)
    .where(and(eq(chatUsers.platform, platform), eq(chatUsers.externalUserId, externalUserId)))
    .limit(1)
  if (!row) throw new Error('Failed to upsert chat user')
  return row
}

export async function getBusinessForChat(chat: { businessId: number | null }) {
  if (!chat.businessId) return null
  const db = useDb()
  const [row] = await db.select().from(businesses).where(eq(businesses.id, chat.businessId)).limit(1)
  return row ?? null
}

export async function getCategories(businessId: number | null) {
  const db = useDb()
  return db.select().from(categories)
    .where(businessId ? eq(categories.businessId, businessId) : isNull(categories.businessId))
}

export function formatRupiah(amount: number | string) {
  const value = typeof amount === 'string' ? Number(amount) : amount
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export function buildTransactionSummaryText(extraction: TransactionExtraction, categoryName: string, senderName: string, businessName?: string | null) {
  const isIncome = extraction.type === 'income'
  const lines = [
    isIncome ? `📈 Pemasukan tercatat` : `📉 Pengeluaran tercatat`,
    `💰 ${formatRupiah(extraction.amount ?? 0)}`,
    businessName ? `🏢 ${businessName}` : null,
    `🏷️ ${categoryName}`,
    extraction.merchant ? `🏪 ${extraction.merchant}` : null,
    `📝 ${extraction.description}`,
    extraction.items.length ? extraction.items.map(item => `   • ${item.name}: ${formatRupiah(item.price)}`).join('\n') : null,
    `👤 ${senderName}`
  ].filter(Boolean)
  return lines.join('\n')
}

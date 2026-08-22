import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'
import { upsertChat as upsertChatGeneric, upsertChatUser } from '../chat/helpers'

export { getBusinessForChat, getCategories, formatRupiah, buildTransactionSummaryText } from '../chat/helpers'

export async function upsertChat(ctx: Context) {
  const chat = ctx.chat!
  const type = chat.type === 'private' ? 'private' : chat.type === 'supergroup' ? 'supergroup' : 'group'
  const title = 'title' in chat ? chat.title : `${chat.first_name ?? ''} ${chat.last_name ?? ''}`.trim()

  return upsertChatGeneric({ platform: 'telegram', externalChatId: String(chat.id), type, title: title ?? null })
}

export async function upsertTelegramUser(ctx: Context) {
  const from = ctx.from!
  return upsertChatUser({
    platform: 'telegram',
    externalUserId: String(from.id),
    username: from.username,
    firstName: from.first_name,
    lastName: from.last_name
  })
}

export function buildSummaryKeyboard(transactionId: number) {
  return new InlineKeyboard()
    .text('✏️ Ganti kategori', `catmenu:${transactionId}`)
    .text('🔄 Tukar jenis', `swap:${transactionId}`)
    .row()
    .text('🗑️ Hapus', `del:${transactionId}`)
}

export function buildCategoryKeyboard(transactionId: number, categoryList: { id: number, name: string }[]) {
  const kb = new InlineKeyboard()
  categoryList.forEach((cat, i) => {
    kb.text(cat.name, `setcat:${transactionId}:${cat.id}`)
    if (i % 2 === 1) kb.row()
  })
  kb.row().text('‹ Kembali', `back:${transactionId}`)
  return kb
}

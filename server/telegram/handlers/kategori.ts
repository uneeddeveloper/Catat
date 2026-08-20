import type { Context } from 'grammy'
import { upsertChat, getBusinessForChat, getCategories } from '../helpers'

export async function handleKategori(ctx: Context) {
  const chat = await upsertChat(ctx)
  const business = await getBusinessForChat(chat)
  const categoryList = await getCategories(chat.businessId)

  const title = business ? `🏷️ Kategori usaha ${business.name}:` : '🏷️ Kategori tersedia:'
  await ctx.reply([title, ...categoryList.map(c => `• ${c.name}`)].join('\n'))
}

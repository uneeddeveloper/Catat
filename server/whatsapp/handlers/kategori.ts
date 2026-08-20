import { getBusinessForChat, getCategories } from '../../chat/helpers'
import { sendFonnteMessage } from '../fonnteClient'
import type { WaChat } from '../types'

export async function handleKategori(target: string, chat: WaChat) {
  const business = await getBusinessForChat(chat)
  const categoryList = await getCategories(chat.businessId)

  const title = business ? `🏷️ Kategori usaha ${business.name}:` : '🏷️ Kategori tersedia:'
  await sendFonnteMessage({ target, message: [title, ...categoryList.map(c => `• ${c.name}`)].join('\n') })
}

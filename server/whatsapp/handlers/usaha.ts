import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { chats } from '../../db/schema'
import { createBusinessWithDefaults } from '../../business/createBusiness'
import { sendFonnteMessage } from '../fonnteClient'
import type { WaChat } from '../types'

export async function handleUsaha(target: string, chat: WaChat, rawName: string) {
  if (chat.type === 'private') {
    await sendFonnteMessage({ target, message: 'ℹ️ Perintah "usaha" cuma bisa dipakai di dalam grup. Buat grup baru untuk usahamu, invite bot ini, lalu ketik "usaha <nama>" di sana.' })
    return
  }

  if (!rawName) {
    await sendFonnteMessage({ target, message: 'Tulis nama usahanya, contoh:\nusaha Usaha Pasir' })
    return
  }
  const name = normalizeBusinessName(rawName)

  const db = useDb()
  const business = await findBusinessByName(name) ?? await createBusinessWithDefaults(name)

  await db.update(chats).set({ businessId: business.id }).where(eq(chats.id, chat.id))

  await sendFonnteMessage({
    target,
    message: `✅ Grup ini sekarang tercatat untuk usaha: ${business.name}\n\nSemua transaksi (pemasukan & pengeluaran) yang dicatat di grup ini akan masuk ke usaha tersebut. Ketik "kategori" untuk lihat kategori yang tersedia.`
  })
}

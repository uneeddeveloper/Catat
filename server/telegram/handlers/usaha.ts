import type { Context } from 'grammy'
import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { chats } from '../../db/schema'
import { upsertChat } from '../helpers'
import { createBusinessWithDefaults } from '../../business/createBusiness'

export async function handleUsaha(ctx: Context) {
  const chat = await upsertChat(ctx)

  if (chat.type === 'private') {
    await ctx.reply('ℹ️ Command /usaha cuma bisa dipakai di dalam grup. Buat grup baru untuk usahamu, invite bot ini, lalu jalankan /usaha di sana.')
    return
  }

  const rawName = ctx.match?.toString().trim()
  if (!rawName) {
    await ctx.reply('Tulis nama usahanya, contoh:\n/usaha Usaha Pasir')
    return
  }
  const name = normalizeBusinessName(rawName)

  const db = useDb()
  const business = await findBusinessByName(name) ?? await createBusinessWithDefaults(name)

  await db.update(chats).set({ businessId: business.id }).where(eq(chats.id, chat.id))

  await ctx.reply(`✅ Grup ini sekarang tercatat untuk usaha: ${business.name}\n\nSemua transaksi (pemasukan & pengeluaran) yang dicatat di grup ini akan masuk ke usaha tersebut. Cek /kategori untuk lihat kategori yang tersedia.`)
}

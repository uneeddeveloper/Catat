import { eq } from 'drizzle-orm'
import { useDb } from '../db/client'
import { chats } from '../db/schema'
import { createBusinessWithDefaults } from '../business/createBusiness'
import { upsertChat, upsertChatUser } from '../chat/helpers'
import { handleStart } from './handlers/start'
import { handlePanduan } from './handlers/panduan'
import { handleUsaha } from './handlers/usaha'
import { handleKategori } from './handlers/kategori'
import { handleRekap } from './handlers/rekap'
import { handleLaporan } from './handlers/laporan'
import { handleHapus, handleGantiKategori } from './handlers/edit'
import { handleText } from './handlers/text'
import { handlePhoto } from './handlers/photo'
import type { WaChat, WaContext } from './types'

export interface FonntePayload {
  device?: string
  sender: string
  message?: string
  member?: string
  name?: string
  url?: string
  filename?: string
  extension?: string
}

const START_KEYWORDS = ['mulai', 'start', 'halo', 'hai']

// Fonnte tidak mengirim nama grup WA di payload webhook, jadi grup baru langsung
// dapat usaha sendiri-sendiri secara otomatis (tanpa perlu ketik "usaha ..." dulu),
// dengan nama generik yang bisa di-rename lewat "usaha <nama baru>" atau panel admin.
async function ensureGroupBusiness(chat: WaChat) {
  if (chat.businessId) return chat

  const business = await createBusinessWithDefaults(`Usaha Grup WA #${chat.id}`)
  const db = useDb()
  await db.update(chats).set({ businessId: business.id }).where(eq(chats.id, chat.id))

  return { ...chat, businessId: business.id }
}

export async function handleFonnteMessage(payload: FonntePayload) {
  if (!payload?.sender) return

  const isGroup = !!payload.member
  const externalChatId = payload.sender
  const externalUserId = payload.member || payload.sender
  const target = externalChatId

  const [initialChat, user] = await Promise.all([
    upsertChat({ platform: 'whatsapp', externalChatId, type: isGroup ? 'group' : 'private', title: null }),
    upsertChatUser({ platform: 'whatsapp', externalUserId, username: null, firstName: payload.name ?? null, lastName: null })
  ])

  const chat = isGroup ? await ensureGroupBusiness(initialChat) : initialChat

  const ctx: WaContext = { target, chat, user, senderName: payload.name || 'Seseorang' }

  if (payload.url) {
    await handlePhoto(ctx, payload.url)
    return
  }

  const text = (payload.message ?? '').trim()
  if (!text) return

  const lower = text.toLowerCase()

  if (START_KEYWORDS.includes(lower)) return handleStart(target)
  if (lower === 'panduan' || lower.startsWith('panduan ')) return handlePanduan(target, lower.replace(/^panduan\s*/, '').trim())
  if (lower === 'kategori') return handleKategori(target, chat)
  if (lower === 'rekap') return handleRekap(target, chat)
  if (lower.startsWith('usaha ')) return handleUsaha(target, chat, text.slice('usaha '.length).trim())
  if (lower === 'usaha') return handleUsaha(target, chat, '')
  if (lower === 'laporan' || lower.startsWith('laporan ')) return handleLaporan(target, chat, lower.replace(/^laporan\s*/, '').trim())
  if (lower === 'hapus') return handleHapus(target, chat)
  if (lower.startsWith('ganti ')) return handleGantiKategori(target, chat, text.slice('ganti '.length).trim())

  return handleText(ctx, text)
}

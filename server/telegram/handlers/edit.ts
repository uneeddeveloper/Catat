import type { Context } from 'grammy'
import { eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions } from '../../db/schema'
import { upsertChat, buildTransactionSummaryText, buildSummaryKeyboard, parseAmountInput } from '../helpers'
import { loadTransactionView, toExtraction } from './callback'

type EditField = 'amount' | 'description'

const PROMPT_LABEL: Record<EditField, string> = {
  amount: '💰 Ubah nominal transaksi',
  description: '📝 Ubah keterangan transaksi'
}

// Penanda di teks prompt — dipakai buat mengenali balasan user ke prompt ini (bot webhook tidak menyimpan state)
const PROMPT_PATTERN = /^(💰 Ubah nominal|📝 Ubah keterangan) transaksi #(\d+)/

export async function sendEditPrompt(ctx: Context, field: EditField, transactionId: number) {
  const row = await loadTransactionView(transactionId)
  if (!row) {
    await ctx.reply('Transaksi ini sudah tidak ada.')
    return
  }

  const hint = field === 'amount'
    ? 'Balas pesan ini dengan nominal baru, contoh: 50000 atau 50rb'
    : 'Balas pesan ini dengan keterangan baru, contoh: beli bensin motor'

  await ctx.reply(`${PROMPT_LABEL[field]} #${transactionId}\n${hint}`, {
    reply_markup: { force_reply: true, input_field_placeholder: field === 'amount' ? 'Nominal baru' : 'Keterangan baru' }
  })
}

/** Proses balasan user ke prompt edit. Return true kalau pesan ini memang balasan edit (sudah ditangani). */
export async function handleEditReply(ctx: Context) {
  const reply = ctx.message?.reply_to_message
  const text = ctx.message?.text?.trim()
  if (!reply || !text || reply.from?.id !== ctx.me.id) return false

  const match = reply.text?.match(PROMPT_PATTERN)
  if (!match) return false

  const field: EditField = match[1]!.includes('nominal') ? 'amount' : 'description'
  const transactionId = Number(match[2])

  const [chat, current] = await Promise.all([upsertChat(ctx), loadTransactionView(transactionId)])
  if (!current || current.chatId !== chat.id) {
    await ctx.reply('Transaksi ini sudah tidak ada.')
    return true
  }

  const db = useDb()
  if (field === 'amount') {
    const amount = parseAmountInput(text)
    if (!amount) {
      await ctx.reply('🤔 Nominalnya belum kebaca. Coba lagi lewat tombol "💰 Ubah nominal", tulis angka saja, misal: 50000 atau 50rb')
      return true
    }
    await db.update(transactions).set({ amount: String(amount) }).where(eq(transactions.id, transactionId))
  } else {
    await db.update(transactions).set({ description: text }).where(eq(transactions.id, transactionId))
  }

  await ctx.api.deleteMessage(reply.chat.id, reply.message_id).catch(() => {})

  const row = await loadTransactionView(transactionId)
  if (row) {
    const senderName = row.senderFirstName ?? row.senderUsername ?? 'Seseorang'
    await ctx.reply(`✅ ${field === 'amount' ? 'Nominal' : 'Keterangan'} diperbarui\n\n${buildTransactionSummaryText(toExtraction(row), row.categoryName ?? 'Lainnya', senderName, row.businessName)}`, {
      reply_markup: buildSummaryKeyboard(transactionId)
    })
  }
  return true
}

import { desc, eq } from 'drizzle-orm'
import { useDb } from '../../db/client'
import { transactions, chatUsers, categories } from '../../db/schema'
import { getCategories, getBusinessForChat, buildTransactionSummaryText, swapDescriptionForType, parseAmountInput } from '../../chat/helpers'
import { sendFonnteMessage } from '../fonnteClient'
import type { TransactionExtraction } from '../../llm/types'
import type { WaChat } from '../types'

async function findLatestTransaction(chatId: number) {
  const db = useDb()
  const [row] = await db.select().from(transactions)
    .where(eq(transactions.chatId, chatId))
    .orderBy(desc(transactions.createdAt))
    .limit(1)
  return row ?? null
}

export async function handleHapus(target: string, chat: WaChat) {
  const latest = await findLatestTransaction(chat.id)
  if (!latest) {
    await sendFonnteMessage({ target, message: 'Belum ada transaksi buat dihapus.' })
    return
  }

  const db = useDb()
  await db.delete(transactions).where(eq(transactions.id, latest.id))
  await sendFonnteMessage({ target, message: '❌ Transaksi terakhir dihapus.' })
}

export async function handleTukarJenis(target: string, chat: WaChat) {
  const latest = await findLatestTransaction(chat.id)
  if (!latest) {
    await sendFonnteMessage({ target, message: 'Belum ada transaksi buat ditukar jenisnya.' })
    return
  }

  const newType = latest.type === 'income' ? 'expense' : 'income'
  const newDescription = latest.description ? swapDescriptionForType(latest.description, newType) : latest.description
  const db = useDb()
  await db.update(transactions).set({ type: newType, description: newDescription }).where(eq(transactions.id, latest.id))

  const [business, [senderRow], [categoryRow]] = await Promise.all([
    getBusinessForChat(chat),
    db.select({ firstName: chatUsers.firstName, username: chatUsers.username }).from(chatUsers).where(eq(chatUsers.id, latest.senderId)).limit(1),
    latest.categoryId
      ? db.select({ name: categories.name }).from(categories).where(eq(categories.id, latest.categoryId)).limit(1)
      : Promise.resolve([] as { name: string }[])
  ])
  const senderName = senderRow?.firstName ?? senderRow?.username ?? 'Seseorang'
  const categoryName = categoryRow?.name ?? 'Lainnya'

  const extraction: TransactionExtraction = {
    amount: Number(latest.amount),
    type: newType,
    currency: latest.currency,
    merchant: latest.merchant,
    description: newDescription ?? '',
    sourceOfFunds: latest.sourceOfFunds,
    category: categoryName,
    date: null,
    items: [],
    confidence: 'high'
  }

  await sendFonnteMessage({ target, message: buildTransactionSummaryText(extraction, categoryName, senderName, business?.name) })
}

export async function handleGantiKategori(target: string, chat: WaChat, rawName: string) {
  const latest = await findLatestTransaction(chat.id)
  if (!latest) {
    await sendFonnteMessage({ target, message: 'Belum ada transaksi buat diganti kategorinya.' })
    return
  }

  const wanted = rawName.trim().toLowerCase()
  const categoryList = await getCategories(chat.businessId)
  const category = wanted
    ? categoryList.find(c => c.name.toLowerCase() === wanted) ?? categoryList.find(c => c.name.toLowerCase().startsWith(wanted))
    : undefined

  if (!category) {
    await sendFonnteMessage({
      target,
      message: ['Kategori tidak ketemu. Balas "ganti <nama kategori>" pakai salah satu ini:', ...categoryList.map(c => `• ${c.name}`)].join('\n')
    })
    return
  }

  const db = useDb()
  await db.update(transactions).set({ categoryId: category.id }).where(eq(transactions.id, latest.id))

  const [business, [senderRow]] = await Promise.all([
    getBusinessForChat(chat),
    db.select({ firstName: chatUsers.firstName, username: chatUsers.username }).from(chatUsers).where(eq(chatUsers.id, latest.senderId)).limit(1)
  ])
  const senderName = senderRow?.firstName ?? senderRow?.username ?? 'Seseorang'

  const extraction: TransactionExtraction = {
    amount: Number(latest.amount),
    type: latest.type,
    currency: latest.currency,
    merchant: latest.merchant,
    description: latest.description ?? '',
    sourceOfFunds: latest.sourceOfFunds,
    category: category.name,
    date: null,
    items: [],
    confidence: 'high'
  }

  await sendFonnteMessage({ target, message: buildTransactionSummaryText(extraction, category.name, senderName, business?.name) })
}

async function sendUpdatedSummary(target: string, chat: WaChat, transactionId: number, header: string) {
  const db = useDb()
  const [row] = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1)
  if (!row) return

  const [business, [senderRow], [categoryRow]] = await Promise.all([
    getBusinessForChat(chat),
    db.select({ firstName: chatUsers.firstName, username: chatUsers.username }).from(chatUsers).where(eq(chatUsers.id, row.senderId)).limit(1),
    row.categoryId
      ? db.select({ name: categories.name }).from(categories).where(eq(categories.id, row.categoryId)).limit(1)
      : Promise.resolve([] as { name: string }[])
  ])
  const senderName = senderRow?.firstName ?? senderRow?.username ?? 'Seseorang'
  const categoryName = categoryRow?.name ?? 'Lainnya'

  const extraction: TransactionExtraction = {
    amount: Number(row.amount),
    type: row.type,
    currency: row.currency,
    merchant: row.merchant,
    description: row.description ?? '',
    sourceOfFunds: row.sourceOfFunds,
    category: categoryName,
    date: null,
    items: [],
    confidence: 'high'
  }

  await sendFonnteMessage({ target, message: `${header}

${buildTransactionSummaryText(extraction, categoryName, senderName, business?.name)}` })
}

export async function handleUbahNominal(target: string, chat: WaChat, rawAmount: string) {
  const latest = await findLatestTransaction(chat.id)
  if (!latest) {
    await sendFonnteMessage({ target, message: 'Belum ada transaksi buat diubah nominalnya.' })
    return
  }

  const amount = parseAmountInput(rawAmount)
  if (!amount) {
    await sendFonnteMessage({ target, message: 'Nominalnya belum kebaca. Contoh: "nominal 50000" atau "nominal 50rb"' })
    return
  }

  const db = useDb()
  await db.update(transactions).set({ amount: String(amount) }).where(eq(transactions.id, latest.id))
  await sendUpdatedSummary(target, chat, latest.id, '✅ Nominal transaksi terakhir diperbarui')
}

export async function handleUbahKeterangan(target: string, chat: WaChat, rawDescription: string) {
  const latest = await findLatestTransaction(chat.id)
  if (!latest) {
    await sendFonnteMessage({ target, message: 'Belum ada transaksi buat diubah keterangannya.' })
    return
  }

  const description = rawDescription.trim()
  if (!description) {
    await sendFonnteMessage({ target, message: 'Tulis keterangan barunya. Contoh: "ket beli bensin motor"' })
    return
  }

  const db = useDb()
  await db.update(transactions).set({ description }).where(eq(transactions.id, latest.id))
  await sendUpdatedSummary(target, chat, latest.id, '✅ Keterangan transaksi terakhir diperbarui')
}

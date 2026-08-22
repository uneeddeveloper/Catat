import { useDb } from '../db/client'
import { admins, businesses, chats, chatUsers, categories, transactions, transactionItems } from '../db/schema'

export async function buildDatabaseBackup() {
  const db = useDb()

  const [businessRows, adminRows, chatRows, chatUserRows, categoryRows, transactionRows, itemRows] = await Promise.all([
    db.select().from(businesses),
    db.select().from(admins),
    db.select().from(chats),
    db.select().from(chatUsers),
    db.select().from(categories),
    db.select().from(transactions),
    db.select().from(transactionItems)
  ])

  return {
    generatedAt: new Date().toISOString(),
    tables: {
      businesses: businessRows,
      admins: adminRows,
      chats: chatRows,
      chatUsers: chatUserRows,
      categories: categoryRows,
      transactions: transactionRows,
      transactionItems: itemRows
    }
  }
}

export function backupFilename() {
  const date = new Date().toISOString().slice(0, 10)
  return `catat-backup-${date}.json`
}

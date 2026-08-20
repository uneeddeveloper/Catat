import { desc, eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { chats, businesses } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const db = useDb()
  return db.select({
    id: chats.id,
    platform: chats.platform,
    externalChatId: chats.externalChatId,
    type: chats.type,
    title: chats.title,
    isActive: chats.isActive,
    createdAt: chats.createdAt,
    businessId: chats.businessId,
    businessName: businesses.name
  })
    .from(chats)
    .leftJoin(businesses, eq(chats.businessId, businesses.id))
    .where(admin.businessId ? eq(chats.businessId, admin.businessId) : undefined)
    .orderBy(desc(chats.createdAt))
})

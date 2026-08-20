import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { admins, businesses } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  const db = useDb()
  return db.select({
    id: admins.id,
    name: admins.name,
    email: admins.email,
    createdAt: admins.createdAt,
    businessId: admins.businessId,
    businessName: businesses.name
  })
    .from(admins)
    .leftJoin(businesses, eq(admins.businessId, businesses.id))
})

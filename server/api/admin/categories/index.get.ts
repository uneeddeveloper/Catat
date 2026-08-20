import { isNull, eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { categories } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const query = getQuery(event)
  const db = useDb()

  if (admin.businessId) {
    return db.select().from(categories).where(eq(categories.businessId, admin.businessId)).orderBy(categories.name)
  }

  if (query.businessId === 'all') {
    return db.select().from(categories).orderBy(categories.name)
  }

  const businessId = query.businessId && query.businessId !== 'null' ? Number(query.businessId) : null

  return db.select().from(categories)
    .where(businessId ? eq(categories.businessId, businessId) : isNull(categories.businessId))
    .orderBy(categories.name)
})

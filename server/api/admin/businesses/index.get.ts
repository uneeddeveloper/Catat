import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { businesses } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const db = useDb()

  if (admin.businessId) {
    return db.select().from(businesses).where(eq(businesses.id, admin.businessId))
  }

  return db.select().from(businesses).orderBy(businesses.name)
})

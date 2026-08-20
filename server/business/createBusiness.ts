import { eq } from 'drizzle-orm'
import { useDb } from '../db/client'
import { businesses, categories } from '../db/schema'
import { STARTER_BUSINESS_CATEGORIES } from './starterCategories'

export async function createBusinessWithDefaults(name: string) {
  const db = useDb()
  await db.insert(businesses).values({ name })
  const [created] = await db.select().from(businesses).where(eq(businesses.name, name)).limit(1)
  if (!created) throw new Error('Failed to create business')

  await db.insert(categories).values(
    STARTER_BUSINESS_CATEGORIES.map(catName => ({ businessId: created.id, name: catName }))
  )

  return created
}

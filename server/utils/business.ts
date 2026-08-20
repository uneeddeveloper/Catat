import { sql } from 'drizzle-orm'
import { useDb } from '../db/client'
import { businesses } from '../db/schema'

export function normalizeBusinessName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

export async function findBusinessByName(name: string) {
  const db = useDb()
  const normalized = normalizeBusinessName(name)
  const [existing] = await db.select().from(businesses).where(sql`lower(${businesses.name}) = lower(${normalized})`).limit(1)
  return existing
}

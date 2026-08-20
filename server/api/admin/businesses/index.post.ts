import { useDb } from '../../../db/client'
import { businesses, categories } from '../../../db/schema'
import { STARTER_BUSINESS_CATEGORIES } from '../../../business/starterCategories'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)

  const { name: rawName } = await readBody<{ name: string }>(event)
  if (!rawName?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nama usaha wajib diisi' })
  }
  const name = normalizeBusinessName(rawName)

  const existing = await findBusinessByName(name)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: `Usaha "${existing.name}" sudah ada` })
  }

  const db = useDb()
  const [result] = await db.insert(businesses).values({ name })
  await db.insert(categories).values(
    STARTER_BUSINESS_CATEGORIES.map(catName => ({ businessId: result.insertId, name: catName }))
  )

  return { ok: true }
})

import { eq } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { admins, businesses } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<{ email: string, password: string }>(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email dan password wajib diisi' })
  }

  const db = useDb()
  const [admin] = await db.select({
    id: admins.id,
    name: admins.name,
    email: admins.email,
    passwordHash: admins.passwordHash,
    businessId: admins.businessId,
    businessName: businesses.name
  })
    .from(admins)
    .leftJoin(businesses, eq(admins.businessId, businesses.id))
    .where(eq(admins.email, email.toLowerCase()))
    .limit(1)

  if (!admin || !(await verifyPassword(admin.passwordHash, password))) {
    throw createError({ statusCode: 401, statusMessage: 'Email atau password salah' })
  }

  const user = { id: admin.id, name: admin.name, email: admin.email, businessId: admin.businessId, businessName: admin.businessName }
  await setUserSession(event, { user })

  return user
})

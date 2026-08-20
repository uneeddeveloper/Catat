import type { H3Event } from 'h3'

export async function requireAdmin(event: H3Event) {
  const session = await requireUserSession(event)
  return session.user
}

export async function requireSuperAdmin(event: H3Event) {
  const admin = await requireAdmin(event)
  if (admin.businessId) {
    throw createError({ statusCode: 403, statusMessage: 'Hanya super admin yang bisa melakukan ini' })
  }
  return admin
}

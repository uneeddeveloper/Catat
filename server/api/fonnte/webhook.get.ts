export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  if (query.secret !== config.fonnteWebhookSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
  }

  return { ok: true }
})

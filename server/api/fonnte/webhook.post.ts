import { handleFonnteMessage } from '../../whatsapp/router'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  if (query.secret !== config.fonnteWebhookSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
  }

  const body = await readBody(event)
  console.log('[fonnte] Payload masuk:', JSON.stringify(body))

  try {
    await handleFonnteMessage(body)
  } catch (err) {
    console.error('[fonnte] Error saat proses pesan:', err)
  }

  return { ok: true }
})

import { ensureBotInitialized } from '../../telegram/bot'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secretHeader = getHeader(event, 'x-telegram-bot-api-secret-token')

  if (secretHeader !== config.telegramWebhookSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret' })
  }

  const update = await readBody(event)
  const bot = await ensureBotInitialized()
  await bot.handleUpdate(update)

  return { ok: true }
})

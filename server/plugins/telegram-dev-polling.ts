import { ensureBotInitialized } from '../telegram/bot'

export default defineNitroPlugin(() => {
  if (!import.meta.dev) return

  const config = useRuntimeConfig()
  if (!config.telegramBotToken) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN kosong, polling dev di-skip')
    return
  }

  ensureBotInitialized().then(bot => bot.start({
    drop_pending_updates: true,
    onStart: () => console.log('[telegram] Bot jalan pakai long polling (dev mode)')
  })).catch((err) => {
    console.error('[telegram] Gagal start polling:', err)
  })
})

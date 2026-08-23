import { ensureBotInitialized } from '../telegram/bot'

// Long polling (bot.start()) otomatis menghapus webhook yang aktif, karena
// Telegram cuma izinkan salah satu mode (webhook atau getUpdates) per bot.
// Tanpa restore, webhook produksi di Vercel ikut kehapus begitu dev server
// ini berhenti/restart, dan bot mati total sampai webhook di-set ulang manual.
export default defineNitroPlugin((nitroApp) => {
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

  nitroApp.hooks.hook('close', async () => {
    if (!config.telegramWebhookUrl) return
    try {
      const bot = await ensureBotInitialized()
      await bot.api.setWebhook(config.telegramWebhookUrl, {
        secret_token: config.telegramWebhookSecret
      })
      console.log('[telegram] Dev server berhenti, webhook produksi dipasang balik')
    } catch (err) {
      console.error('[telegram] Gagal restore webhook produksi:', err)
    }
  })
})

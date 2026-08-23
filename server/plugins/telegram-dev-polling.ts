import { getBot, ensureBotInitialized } from '../telegram/bot'

// Long polling (bot.start()) otomatis menghapus webhook yang aktif, karena
// Telegram cuma izinkan salah satu mode (webhook atau getUpdates) per bot.
// Menunggu momen "dev server berhenti" untuk restore webhook production
// ternyata tidak reliable (Ctrl+C di Windows sering langsung mematikan
// process tanpa sempat jalanin cleanup async). Jadi polling dijadikan
// opsional (TELEGRAM_DEV_POLLING=1), dan defaultnya setiap kali dev server
// *nyala* langsung menegaskan ulang webhook production - tidak bergantung
// pada shutdown sama sekali.
export default defineNitroPlugin(() => {
  if (!import.meta.dev) return

  const config = useRuntimeConfig()
  if (!config.telegramBotToken) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN kosong, setup dev di-skip')
    return
  }

  const pollingEnabled = ['1', 'true'].includes((config.telegramDevPolling || '').toLowerCase())

  if (pollingEnabled) {
    ensureBotInitialized().then(bot => bot.start({
      drop_pending_updates: true,
      onStart: () => console.log('[telegram] Bot jalan pakai long polling (dev mode) - webhook produksi nonaktif selama ini')
    })).catch((err) => {
      console.error('[telegram] Gagal start polling:', err)
    })
    return
  }

  if (!config.telegramWebhookUrl) return

  getBot().api.setWebhook(config.telegramWebhookUrl, {
    secret_token: config.telegramWebhookSecret
  }).then(() => {
    console.log('[telegram] Webhook produksi ditegaskan aktif (dev mode, polling nonaktif)')
  }).catch((err) => {
    console.error('[telegram] Gagal menegaskan webhook produksi:', err)
  })
})

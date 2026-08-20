import { Bot, GrammyError, HttpError } from 'grammy'
import { handleStart } from './handlers/start'
import { handleText } from './handlers/text'
import { handlePhoto } from './handlers/photo'
import { handleRekap } from './handlers/rekap'
import { handleKategori } from './handlers/kategori'
import { handleUsaha } from './handlers/usaha'
import { handleCallback } from './handlers/callback'
import { handleLaporan } from './handlers/laporan'
import { handlePanduan } from './handlers/panduan'

const BOT_COMMANDS = [
  { command: 'start', description: 'Mulai & lihat info bot' },
  { command: 'panduan', description: 'Menu bantuan & cara pakai' },
  { command: 'usaha', description: 'Daftarkan grup ke usaha (khusus grup)' },
  { command: 'kategori', description: 'Lihat daftar kategori' },
  { command: 'rekap', description: 'Ringkasan transaksi bulan ini' },
  { command: 'laporan', description: 'Unduh laporan Excel/PDF' }
]

let bot: Bot | undefined
let initialized = false

export function getBot() {
  if (!bot) {
    const config = useRuntimeConfig()
    bot = new Bot(config.telegramBotToken)

    bot.command('start', handleStart)
    bot.command('rekap', handleRekap)
    bot.command('kategori', handleKategori)
    bot.command('usaha', handleUsaha)
    bot.command('laporan', handleLaporan)
    bot.command(['panduan', 'help'], handlePanduan)
    bot.on('message:photo', handlePhoto)
    bot.on('message:text', handleText)
    bot.on('callback_query:data', handleCallback)

    bot.catch((err) => {
      const ctx = err.ctx
      const cause = err.error instanceof GrammyError || err.error instanceof HttpError
        ? err.error.message
        : err.error
      console.error(`[telegram] Error saat proses update ${ctx.update.update_id}:`, cause)
      ctx.reply('⚠️ Ups, ada gangguan pas memproses ini. Coba kirim ulang.').catch(() => {})
    })
  }
  return bot
}

export async function ensureBotInitialized() {
  const instance = getBot()
  if (!initialized) {
    await instance.init()
    await instance.api.setMyCommands(BOT_COMMANDS)
    initialized = true
  }
  return instance
}

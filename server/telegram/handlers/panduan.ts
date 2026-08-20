import type { Context } from 'grammy'
import { InlineKeyboard } from 'grammy'

type Section = 'main' | 'pakai' | 'grup' | 'perintah'

const MENU_KEYBOARD = new InlineKeyboard()
  .text('📝 Cara mencatat transaksi', 'pnd:pakai').row()
  .text('👥 Cara tambah bot ke grup', 'pnd:grup').row()
  .text('📋 Daftar semua perintah', 'pnd:perintah')

const BACK_KEYBOARD = new InlineKeyboard().text('‹ Kembali ke menu', 'pnd:main')

const SECTIONS: Record<Section, string> = {
  main: [
    '📖 *Panduan Bot Catat*',
    '',
    'Pilih topik di bawah ini:'
  ].join('\n'),

  pakai: [
    '📝 *Cara mencatat transaksi*',
    '',
    'Tulis langsung dalam bahasa sehari-hari, tidak perlu format khusus:',
    '• `beli kopi 25rb`',
    '• `bayar listrik 350000`',
    '• `jual pasir 2 truk 3jt` (otomatis kebaca pemasukan)',
    '',
    'Atau kirim *foto struk/nota* — bot baca nominal & kategorinya otomatis.',
    '',
    'Setelah tercatat, ada tombol untuk ganti kategori atau hapus kalau salah.',
    '',
    '💬 *Personal vs grup*',
    'Di chat pribadi, catatan jadi pengeluaran personal kamu sendiri. Di dalam grup yang sudah didaftarkan lewat /usaha, catatan masuk ke usaha itu dan bisa dilihat semua anggota grup.'
  ].join('\n'),

  grup: [
    '👥 *Cara tambah bot ke grup usaha*',
    '',
    '1️⃣ Buka grup → nama grup → *Add Member* → cari `@catatttbot` → tambahkan',
    '',
    '2️⃣ Matikan privacy mode (wajib, supaya bot bisa baca pesan bebas bukan cuma command):',
    'Chat @BotFather → `/mybots` → pilih bot ini → *Bot Settings* → *Group Privacy* → *Turn off*',
    '',
    '⚠️ Kalau bot sudah kadung ada di grup sebelum langkah ini, keluarkan dulu lalu invite ulang.',
    '',
    '3️⃣ Daftarkan grup ke usaha, contoh:',
    '`/usaha Usaha Pasir`',
    '',
    'Selesai — semua yang dicatat di grup itu otomatis masuk ke usaha tersebut.'
  ].join('\n'),

  perintah: [
    '📋 *Daftar perintah*',
    '',
    '`/usaha <nama>` — daftarkan grup ini ke usaha tertentu (khusus grup)',
    '`/kategori` — lihat daftar kategori yang tersedia',
    '`/rekap` — ringkasan pemasukan & pengeluaran',
    '`/laporan` — unduh laporan Excel/PDF per periode',
    '`/panduan` — buka menu bantuan ini lagi'
  ].join('\n')
}

export async function handlePanduan(ctx: Context) {
  await ctx.reply(SECTIONS.main, { parse_mode: 'Markdown', reply_markup: MENU_KEYBOARD })
}

export async function handlePanduanCallback(ctx: Context, section: Section) {
  const keyboard = section === 'main' ? MENU_KEYBOARD : BACK_KEYBOARD
  await ctx.editMessageText(SECTIONS[section] ?? SECTIONS.main, { parse_mode: 'Markdown', reply_markup: keyboard })
  await ctx.answerCallbackQuery()
}

import { sendFonnteMessage } from '../fonnteClient'

const SECTIONS: Record<string, string> = {
  main: [
    '📖 *Panduan Bot Catat*',
    '',
    'Ketik salah satu untuk lihat topik:',
    '• panduan pakai — cara mencatat transaksi',
    '• panduan grup — cara tambah bot ke grup usaha',
    '• panduan perintah — daftar semua perintah'
  ].join('\n'),

  pakai: [
    '📝 *Cara mencatat transaksi*',
    '',
    'Tulis langsung dalam bahasa sehari-hari, tidak perlu format khusus:',
    '• beli kopi 25rb',
    '• bayar listrik 350000',
    '• jual pasir 2 truk 3jt (otomatis kebaca pemasukan)',
    '',
    'Atau kirim *foto struk/nota* — bot baca nominal & kategorinya otomatis.',
    '',
    'Setelah tercatat, balas "ganti <kategori>" buat ganti kategori, atau "hapus" buat hapus transaksi terakhir.',
    '',
    '💬 *Personal vs grup*',
    'Di chat pribadi, catatan jadi pengeluaran personal kamu sendiri. Di dalam grup, catatan otomatis kegolong ke usaha khusus grup itu (dibuat otomatis begitu grup mulai kirim transaksi) dan bisa dilihat semua anggota grup.'
  ].join('\n'),

  grup: [
    '👥 *Cara tambah bot ke grup usaha*',
    '',
    '1️⃣ Simpan nomor WhatsApp bot ini sebagai kontak, lalu buka grup → tambah anggota → pilih kontak bot tersebut',
    '',
    '2️⃣ Langsung kirim transaksi — grup otomatis dapat usaha sendiri, nggak perlu command apa-apa.',
    '',
    '💡 Mau ganti nama usahanya, atau gabungkan beberapa grup jadi satu usaha yang sama? Ketik:',
    'usaha Nama Usaha'
  ].join('\n'),

  perintah: [
    '📋 *Daftar perintah*',
    '',
    'usaha <nama> — daftarkan grup ini ke usaha tertentu (khusus grup)',
    'kategori — lihat daftar kategori yang tersedia',
    'rekap — ringkasan pemasukan & pengeluaran',
    'laporan <periode> [format] — unduh laporan, mis. "laporan bulan pdf"',
    'hapus — hapus transaksi terakhir',
    'ganti <kategori> — ganti kategori transaksi terakhir',
    'panduan — buka menu bantuan ini lagi'
  ].join('\n')
}

export async function handlePanduan(target: string, topic: string) {
  const section = SECTIONS[topic] ?? SECTIONS.main!
  await sendFonnteMessage({ target, message: section })
}

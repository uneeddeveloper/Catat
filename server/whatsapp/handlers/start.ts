import { sendFonnteMessage } from '../fonnteClient'

export async function handleStart(target: string) {
  const lines = [
    '👋 Halo! Aku bot pencatat transaksi keuangan.',
    '',
    'Ketik langsung, misal: "beli kopi 25rb", atau kirim foto struk/nota — aku catat otomatis.',
    '',
    'Aku bisa dipakai di chat pribadi (catatan pribadi) maupun di grup usaha untuk pantau pemasukan & pengeluaran bareng tim.',
    '',
    '📖 Ketik "panduan" untuk menu bantuan lengkap & cara tambah bot ke grup.'
  ]
  await sendFonnteMessage({ target, message: lines.join('\n') })
}

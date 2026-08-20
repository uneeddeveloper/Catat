<script setup lang="ts">
definePageMeta({ layout: false })

const waCommands = [
  { cmd: 'mulai', desc: 'Info singkat & cara pakai bot' },
  { cmd: 'panduan [topik]', desc: 'Buka menu bantuan (topik: pakai, grup, perintah)' },
  { cmd: 'usaha <nama>', desc: 'Ganti nama usaha grup ini, atau gabung ke usaha lain (khusus grup)' },
  { cmd: 'kategori', desc: 'Lihat daftar kategori yang tersedia' },
  { cmd: 'rekap', desc: 'Ringkasan pemasukan & pengeluaran bulan ini' },
  { cmd: 'laporan <periode> [format]', desc: 'Unduh laporan, mis. "laporan bulan pdf"' },
  { cmd: 'hapus', desc: 'Hapus transaksi terakhir di chat ini' },
  { cmd: 'ganti <kategori>', desc: 'Ganti kategori transaksi terakhir' }
]

const tgCommands = [
  { cmd: '/start', desc: 'Mulai & lihat info bot' },
  { cmd: '/panduan', desc: 'Menu bantuan & cara pakai (lewat tombol)' },
  { cmd: '/usaha <nama>', desc: 'Daftarkan grup ke usaha (khusus grup)' },
  { cmd: '/kategori', desc: 'Lihat daftar kategori' },
  { cmd: '/rekap', desc: 'Ringkasan transaksi bulan ini' },
  { cmd: '/laporan', desc: 'Unduh laporan Excel/PDF lewat tombol pilihan' }
]
</script>

<template>
  <NuxtLayout name="default">
    <template #header>
      <AppTopbar
        title="Panduan"
        subtitle="Cara pakai bot Catat lewat WhatsApp & Telegram"
      />
    </template>

    <div class="max-w-3xl flex flex-col gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <div class="size-8 rounded-lg bg-linear-to-br from-primary-500 to-rose-500 flex items-center justify-center shrink-0 shadow-sm shadow-primary-500/30">
              <UIcon
                name="i-lucide-message-square"
                class="size-4 text-white"
              />
            </div>
            <p class="font-medium">
              Cara mencatat transaksi
            </p>
          </div>
        </template>

        <div class="flex flex-col gap-3 text-sm">
          <p>Tulis langsung dalam bahasa sehari-hari, tidak perlu format khusus:</p>
          <ul class="list-disc list-inside flex flex-col gap-1 text-muted">
            <li><code>beli kopi 25rb</code></li>
            <li><code>bayar listrik 350000</code></li>
            <li><code>jual pasir 2 truk 3jt</code> — otomatis kebaca pemasukan</li>
          </ul>
          <p>
            Atau kirim <strong>foto struk/nota</strong> — bot baca nominal & kategorinya otomatis.
          </p>
          <p class="text-muted">
            💬 Di chat pribadi, catatan jadi pengeluaran personal kamu sendiri. Di dalam grup, catatan masuk ke usaha yang terhubung ke grup itu dan bisa dilihat semua anggota.
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <div class="size-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0">
              <UIcon
                name="i-simple-icons-whatsapp"
                class="size-4 text-green-700 dark:text-green-300"
              />
            </div>
            <p class="font-medium">
              Bot WhatsApp
            </p>
          </div>
        </template>

        <div class="flex flex-col gap-4 text-sm">
          <div>
            <p class="font-medium mb-1">
              Cara tambah ke grup usaha
            </p>
            <ol class="list-decimal list-inside flex flex-col gap-1 text-muted">
              <li>Simpan nomor WhatsApp bot sebagai kontak, lalu invite ke grup seperti kontak biasa</li>
              <li>Langsung kirim transaksi — grup otomatis dapat usaha sendiri, tidak perlu command apa-apa</li>
              <li>Mau ganti nama usaha atau gabungkan beberapa grup jadi satu usaha? Ketik <code>usaha Nama Usaha</code></li>
            </ol>
          </div>

          <div>
            <p class="font-medium mb-2">
              Daftar perintah
            </p>
            <div class="flex flex-col divide-y divide-default rounded-lg ring-1 ring-default overflow-hidden">
              <div
                v-for="c in waCommands"
                :key="c.cmd"
                class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-3 py-2"
              >
                <code class="shrink-0 sm:w-56 text-xs font-medium text-primary-700 dark:text-primary-300">{{ c.cmd }}</code>
                <span class="text-muted">{{ c.desc }}</span>
              </div>
            </div>
          </div>

          <p class="text-muted">
            Tidak ada tombol interaktif seperti Telegram — balas <code>ganti &lt;kategori&gt;</code> atau <code>hapus</code> untuk ubah transaksi terakhir di chat itu.
          </p>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <div class="size-8 rounded-lg bg-sky-100 dark:bg-sky-900 flex items-center justify-center shrink-0">
              <UIcon
                name="i-simple-icons-telegram"
                class="size-4 text-sky-700 dark:text-sky-300"
              />
            </div>
            <p class="font-medium">
              Bot Telegram
            </p>
          </div>
        </template>

        <div class="flex flex-col gap-4 text-sm">
          <div>
            <p class="font-medium mb-1">
              Cara tambah ke grup usaha
            </p>
            <ol class="list-decimal list-inside flex flex-col gap-1 text-muted">
              <li>Buka grup → nama grup → Add Member → cari bot → tambahkan</li>
              <li>Matikan privacy mode (wajib): chat @BotFather → /mybots → pilih bot ini → Bot Settings → Group Privacy → Turn off</li>
              <li>Kalau bot sudah kadung ada di grup sebelum langkah ini, keluarkan dulu lalu invite ulang</li>
              <li>Daftarkan grup ke usaha, contoh: <code>/usaha Usaha Pasir</code></li>
            </ol>
          </div>

          <div>
            <p class="font-medium mb-2">
              Daftar perintah
            </p>
            <div class="flex flex-col divide-y divide-default rounded-lg ring-1 ring-default overflow-hidden">
              <div
                v-for="c in tgCommands"
                :key="c.cmd"
                class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 px-3 py-2"
              >
                <code class="shrink-0 sm:w-56 text-xs font-medium text-primary-700 dark:text-primary-300">{{ c.cmd }}</code>
                <span class="text-muted">{{ c.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </NuxtLayout>
</template>

# Catat

Bot Telegram pencatatan pengeluaran + panel admin. Bot bisa dipasang di chat personal maupun grup, menerima input teks bebas atau foto struk, lalu mengekstrak & mengategorikan pengeluaran otomatis pakai GPT-4o-mini. Semua data bisa dipantau lewat panel admin.

**Stack**: Nuxt 3 (deploy ke Vercel) · TiDB Cloud (Drizzle ORM) · Cloudflare R2 (foto struk) · grammY (bot Telegram) · GPT-4o-mini (ekstraksi teks & vision)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Salin `.env.example` ke `.env` dan isi semua kredensial (TiDB, Telegram, OpenAI, R2, session secret). Lihat komentar di masing-masing variabel.

3. Buat tabel di TiDB Cloud sesuai `server/db/schema.ts`:

   ```bash
   npm run db:push
   ```

4. Seed kategori default (Makanan, Transport, Belanja, dst):

   ```bash
   npm run db:seed
   ```

5. Jalankan dev server:

   ```bash
   npm run dev
   ```

6. Buka `http://localhost:3000/bootstrap` untuk membuat akun admin pertama.

## Menghubungkan bot Telegram

Webhook Telegram butuh URL publik (server lokal tidak bisa dipakai langsung). Setelah deploy ke Vercel dan environment variables sudah diisi:

```bash
curl -X POST "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://<domain-vercel-anda>/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

Lalu invite bot ke grup/chat yang diinginkan dan kirim `/start`.

## Menghubungkan bot WhatsApp (Fonnte)

Bot WhatsApp jalan lewat [Fonnte](https://fonnte.com) (WA gateway, bukan API resmi Meta), berbasis webhook HTTP sama seperti Telegram.

1. Isi `FONNTE_API_TOKEN` (token device dari dashboard Fonnte) dan `FONNTE_WEBHOOK_SECRET` (string acak bebas) di `.env`.
2. Setelah deploy ke Vercel, buka dashboard Fonnte → device → edit, lalu set webhook URL ke:

   ```
   https://<domain-vercel-anda>/api/fonnte/webhook?secret=<FONNTE_WEBHOOK_SECRET>
   ```

3. Pastikan opsi **auto read** di pengaturan device dinyalakan — kalau mati, webhook tidak akan terpanggil.
4. Simpan nomor WA bot sebagai kontak, lalu invite ke grup usaha seperti kontak biasa. Di dalam grup, ketik `usaha <nama usaha>` untuk mendaftarkannya.

Fonnte tidak punya tombol interaktif seperti Telegram, jadi ganti kategori/hapus transaksi dilakukan lewat balasan teks (`ganti <kategori>`, `hapus`) yang merujuk ke transaksi terakhir di chat itu. Ketik `panduan` ke bot untuk daftar perintah lengkap.

Karena Fonnte butuh webhook publik (tidak ada mode polling untuk dev lokal), testing paling gampang dilakukan setelah deploy — atau pakai tunnel (ngrok/cloudflared) kalau mau test dari localhost.

## Scripts

| Script | Keterangan |
| --- | --- |
| `npm run dev` | Jalankan dev server |
| `npm run build` | Build untuk production |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run db:generate` | Generate migration SQL dari `server/db/schema.ts` |
| `npm run db:push` | Terapkan schema langsung ke TiDB (tanpa file migration, cocok untuk dev) |
| `npm run db:seed` | Isi kategori pengeluaran default |

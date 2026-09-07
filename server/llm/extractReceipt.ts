import { useOpenAi, EXPENSE_MODEL } from './openaiClient'
import { transactionJsonSchema, type TransactionExtraction } from './types'
import { logAiUsage } from './usageLog'

export async function extractReceipt(imageUrl: string, categoryNames: string[], caption?: string | null): Promise<TransactionExtraction> {
  const openai = useOpenAi()

  const userContent: Array<{ type: 'text', text: string } | { type: 'image_url', image_url: { url: string } }> = [
    { type: 'text', text: 'Ekstrak data transaksi dari struk/nota ini.' },
    { type: 'image_url', image_url: { url: imageUrl } }
  ]
  if (caption?.trim()) {
    userContent.push({ type: 'text', text: `Pengirim menyertakan catatan bersama foto ini: "${caption.trim()}". Catatan ini eksplisit dari pengirim, jadi utamakan isinya untuk mengisi description dan sourceOfFunds (dan detail lain yang relevan) dibanding hanya menebak dari foto struknya saja.` })
  }

  const response = await openai.chat.completions.create({
    model: EXPENSE_MODEL,
    messages: [
      {
        role: 'system',
        content: `Kamu mengekstrak data transaksi dari foto struk/nota Indonesia. Baca total nominal, nama merchant/pihak lain, tanggal transaksi, dan daftar item jika terbaca. Kebanyakan struk adalah pengeluaran (type: "expense"), tapi kalau nota itu jelas nota PENJUALAN/invoice yang diterbitkan sendiri (uang MASUK), set type: "income".

Kalau fotonya adalah bukti transfer bank/e-wallet (m-Transfer, BI-FAST, mobile banking, dompet digital, dsb) alih-alih struk belanja: cari kata penanda arah transfer. Kalau ada "Ke"/"Kepada"/"Tujuan"/"Penerima" diikuti nama pihak lain, uang KELUAR dari rekening pengirim, set type: "expense" dan merchant diisi nama pihak yang menerima (bukan nama bank/aplikasinya). Kalau ada "Dari"/"Pengirim"/"Sumber Dana", uang MASUK, set type: "income" dan merchant diisi nama pihak yang mengirim. Kalau tidak ada penanda arah sama sekali, asumsikan type: "expense" (transfer keluar) karena itu kasus paling umum.

Pilih category paling sesuai dari daftar yang diberikan. Jika ada beberapa nominal, pakai TOTAL akhir (bukan subtotal). Tulis description singkat dalam Bahasa Indonesia.

Field "sourceOfFunds": isi kalau ada info sumber dana internal secara eksplisit (mis. dibayar pakai "kas toko", "uang pribadi", "dari dek/Decky"), baik itu disebut di struk/nota ATAU di catatan tambahan yang menyertai foto (kalau ada). Untuk bukti transfer bank/e-wallet TANPA catatan tambahan, biarkan sourceOfFunds null karena label "Sumber Dana"/nomor rekening di struk itu dipakai untuk menentukan arah transaksi di atas, bukan berarti itu sumber dana internal si pencatat.`
      },
      {
        role: 'user',
        content: userContent
      }
    ],
    response_format: { type: 'json_schema', json_schema: transactionJsonSchema(categoryNames) }
  })

  if (response.usage) {
    await logAiUsage({
      model: EXPENSE_MODEL,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
      source: 'photo'
    })
  }

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('OpenAI returned empty response')
  return JSON.parse(content) as TransactionExtraction
}

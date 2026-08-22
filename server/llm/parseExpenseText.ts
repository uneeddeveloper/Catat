import { useOpenAi, EXPENSE_MODEL } from './openaiClient'
import { transactionJsonSchema, type TransactionExtraction } from './types'
import { logAiUsage } from './usageLog'

export async function parseExpenseText(text: string, categoryNames: string[]): Promise<TransactionExtraction> {
  const openai = useOpenAi()

  const response = await openai.chat.completions.create({
    model: EXPENSE_MODEL,
    messages: [
      {
        role: 'system',
        content: `Kamu mengekstrak data transaksi keuangan dari pesan bebas berbahasa Indonesia, termasuk teks hasil salin dari notifikasi transfer bank/e-wallet. Bisa berupa pengeluaran (contoh: "beli kopi 25rb", "bayar listrik 350000 tadi pagi", "transfer ke Yoyon 363rb") atau pemasukan (contoh: "jual pasir 2 truk 3jt", "terima pembayaran dari Budi 500rb", "transfer masuk dari Budi 1.5jt"). Tentukan "type": "income" kalau uang MASUK/diterima, "expense" kalau uang KELUAR/dibayarkan/ditransfer. Untuk transfer: kata "ke"/"kepada"/"tujuan" menandakan uang KELUAR (expense) dan nama setelahnya jadi merchant; kata "dari"/"pengirim" menandakan uang MASUK (income) dan nama setelahnya jadi merchant. Nominal "rb"/"ribu" berarti dikali 1000, "jt"/"juta" berarti dikali 1000000. Jika tidak ada tanggal disebut, kembalikan date null. Pilih category paling sesuai dari daftar yang diberikan.`
      },
      { role: 'user', content: text }
    ],
    response_format: { type: 'json_schema', json_schema: transactionJsonSchema(categoryNames) }
  })

  if (response.usage) {
    await logAiUsage({
      model: EXPENSE_MODEL,
      promptTokens: response.usage.prompt_tokens,
      completionTokens: response.usage.completion_tokens,
      totalTokens: response.usage.total_tokens,
      source: 'text'
    })
  }

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('OpenAI returned empty response')
  return JSON.parse(content) as TransactionExtraction
}

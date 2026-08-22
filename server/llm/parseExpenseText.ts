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
        content: `Kamu mengekstrak data transaksi keuangan dari pesan bebas berbahasa Indonesia. Bisa berupa pengeluaran (contoh: "beli kopi 25rb", "bayar listrik 350000 tadi pagi") atau pemasukan (contoh: "jual pasir 2 truk 3jt", "terima pembayaran dari Budi 500rb"). Tentukan "type": "income" kalau uang MASUK/diterima, "expense" kalau uang KELUAR/dibayarkan. Nominal "rb"/"ribu" berarti dikali 1000, "jt"/"juta" berarti dikali 1000000. Jika tidak ada tanggal disebut, kembalikan date null. Pilih category paling sesuai dari daftar yang diberikan.`
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

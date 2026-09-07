export interface TransactionExtraction {
  amount: number | null
  type: 'expense' | 'income'
  currency: string
  merchant: string | null
  category: string
  description: string
  sourceOfFunds: string | null
  date: string | null
  items: { name: string, price: number }[]
  confidence: 'high' | 'medium' | 'low'
}

export function transactionJsonSchema(categoryNames: string[]) {
  return {
    name: 'transaction_extraction',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        amount: { type: ['number', 'null'], description: 'Transaction amount, numeric only, no currency symbols' },
        type: { type: 'string', enum: ['expense', 'income'], description: '"income" if money is received (e.g. sale, payment received), "expense" if money is spent (e.g. purchase, bill)' },
        currency: { type: 'string', description: 'ISO currency code, default IDR' },
        merchant: { type: ['string', 'null'], description: 'Store/counterparty name if identifiable' },
        category: { type: 'string', enum: categoryNames },
        description: { type: 'string', description: 'Short human-readable summary of the transaction' },
        sourceOfFunds: { type: ['string', 'null'], description: 'Only for expenses: who/what internal account funded this purchase if explicitly stated, e.g. "dari dek", "kas toko", "tabungan pribadi", "kartu kredit". This is NOT the merchant/counterparty receiving the money. Null if not mentioned or if type is income.' },
        date: { type: ['string', 'null'], description: 'Date of the transaction in YYYY-MM-DD format if identifiable' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              price: { type: 'number' }
            },
            required: ['name', 'price']
          }
        },
        confidence: { type: 'string', enum: ['high', 'medium', 'low'] }
      },
      required: ['amount', 'type', 'currency', 'merchant', 'category', 'description', 'sourceOfFunds', 'date', 'items', 'confidence']
    }
  } as const
}

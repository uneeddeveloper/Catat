export interface ModelPricing {
  inputPerMillion: number
  outputPerMillion: number
}

// Harga per 1 juta token (USD), mengikuti daftar model di dashboard Sumopod.
export const MODEL_PRICING: Record<string, ModelPricing> = {
  'gpt-4.1': { inputPerMillion: 2.00, outputPerMillion: 8.00 },
  'gpt-4.1-mini': { inputPerMillion: 0.40, outputPerMillion: 1.60 },
  'gpt-4.1-nano': { inputPerMillion: 0.10, outputPerMillion: 0.40 },
  'gpt-4o': { inputPerMillion: 2.50, outputPerMillion: 10.00 },
  'gpt-4o-mini': { inputPerMillion: 0.15, outputPerMillion: 0.60 }
}

export function estimateCostUsd(model: string, promptTokens: number, completionTokens: number): number | null {
  const pricing = MODEL_PRICING[model]
  if (!pricing) return null
  return (promptTokens * pricing.inputPerMillion + completionTokens * pricing.outputPerMillion) / 1_000_000
}

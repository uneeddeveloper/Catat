import OpenAI from 'openai'

let client: OpenAI | undefined

export function useOpenAi() {
  if (!client) {
    const config = useRuntimeConfig()
    client = new OpenAI({ apiKey: config.openaiApiKey, baseURL: config.openaiBaseUrl || undefined })
  }
  return client
}

export const EXPENSE_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

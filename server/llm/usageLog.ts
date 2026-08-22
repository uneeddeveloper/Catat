import { useDb } from '../db/client'
import { aiUsageLogs } from '../db/schema'

export async function logAiUsage(params: { model: string, promptTokens: number, completionTokens: number, totalTokens: number, source: 'text' | 'photo' }) {
  try {
    const db = useDb()
    await db.insert(aiUsageLogs).values(params)
  } catch (err) {
    console.error('Failed to log AI usage', err)
  }
}

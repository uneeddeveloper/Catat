import { and, gte, lte } from 'drizzle-orm'
import { useDb } from '../../../db/client'
import { aiUsageLogs } from '../../../db/schema'
import { resolvePeriodRange } from '../../../reports/periodRange'
import { estimateCostUsd } from '../../../llm/pricing'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)

  const db = useDb()
  const { from, to } = resolvePeriodRange('month')

  const rows = await db.select().from(aiUsageLogs)
    .where(and(gte(aiUsageLogs.createdAt, from), lte(aiUsageLogs.createdAt, to)))

  const byModelMap = new Map<string, { model: string, promptTokens: number, completionTokens: number, totalTokens: number }>()
  for (const row of rows) {
    const entry = byModelMap.get(row.model) ?? { model: row.model, promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    entry.promptTokens += row.promptTokens
    entry.completionTokens += row.completionTokens
    entry.totalTokens += row.totalTokens
    byModelMap.set(row.model, entry)
  }

  const byModel = Array.from(byModelMap.values())
    .map(entry => ({ ...entry, estimatedCostUsd: estimateCostUsd(entry.model, entry.promptTokens, entry.completionTokens) }))
    .sort((a, b) => b.totalTokens - a.totalTokens)

  return {
    periodLabel: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    totalTokens: byModel.reduce((sum, m) => sum + m.totalTokens, 0),
    promptTokens: byModel.reduce((sum, m) => sum + m.promptTokens, 0),
    completionTokens: byModel.reduce((sum, m) => sum + m.completionTokens, 0),
    estimatedCostUsd: byModel.reduce((sum, m) => sum + (m.estimatedCostUsd ?? 0), 0),
    hasUnpriced: byModel.some(m => m.estimatedCostUsd === null),
    byModel
  }
})

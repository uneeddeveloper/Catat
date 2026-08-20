export type ReportPeriod = 'day' | 'week' | 'month' | 'year' | 'custom'

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  day: 'Harian',
  week: 'Mingguan',
  month: 'Bulanan',
  year: 'Tahunan',
  custom: 'Custom'
}

export function resolvePeriodRange(period: ReportPeriod, customFrom?: string, customTo?: string) {
  const now = new Date()

  if (period === 'custom') {
    const from = customFrom ? new Date(customFrom) : new Date(now.getFullYear(), now.getMonth(), 1)
    const to = customTo ? new Date(customTo) : now
    to.setHours(23, 59, 59, 999)
    return { from, to, label: `${from.toLocaleDateString('id-ID')} – ${to.toLocaleDateString('id-ID')}` }
  }

  if (period === 'day') {
    const from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return { from, to: now, label: `Hari ini, ${from.toLocaleDateString('id-ID')}` }
  }

  if (period === 'week') {
    const from = new Date(now)
    from.setDate(now.getDate() - now.getDay())
    from.setHours(0, 0, 0, 0)
    return { from, to: now, label: `Minggu ini (mulai ${from.toLocaleDateString('id-ID')})` }
  }

  if (period === 'year') {
    const from = new Date(now.getFullYear(), 0, 1)
    return { from, to: now, label: `Tahun ${now.getFullYear()}` }
  }

  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  return { from, to: now, label: `${now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}` }
}

export function periodLabel(period: ReportPeriod) {
  return PERIOD_LABELS[period]
}

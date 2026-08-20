import { buildReportData } from '../../reports/buildReportData'
import { buildReportExcel, reportFilename } from '../../reports/toExcel'
import { buildReportPdf } from '../../reports/toPdf'
import { resolvePeriodRange, periodLabel, type ReportPeriod } from '../../reports/periodRange'
import { uploadReportFile } from '../../storage/r2'
import { sendFonnteDocument, sendFonnteMessage } from '../fonnteClient'
import type { WaChat } from '../types'

const PERIOD_KEYWORDS: Record<string, ReportPeriod> = {
  hari: 'day',
  harian: 'day',
  minggu: 'week',
  mingguan: 'week',
  bulan: 'month',
  bulanan: 'month',
  tahun: 'year',
  tahunan: 'year'
}

export async function handleLaporan(target: string, chat: WaChat, argsRaw: string) {
  const args = argsRaw.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const period = args[0] ? PERIOD_KEYWORDS[args[0]] : undefined

  if (!period) {
    await sendFonnteMessage({
      target,
      message: 'Format: laporan <periode> [format]\nPeriode: hari / minggu / bulan / tahun\nFormat: excel (default) / pdf\n\nContoh: laporan bulan pdf'
    })
    return
  }

  const format: 'xlsx' | 'pdf' = args[1] === 'pdf' ? 'pdf' : 'xlsx'

  const { from, to, label } = resolvePeriodRange(period)
  const data = await buildReportData({ businessId: chat.businessId, from, to, periodLabel: `${periodLabel(period)} · ${label}` })
  const buffer = format === 'pdf' ? await buildReportPdf(data) : await buildReportExcel(data)
  const filename = reportFilename(data.scopeName, format)
  const key = `reports/${Date.now()}-${filename}`
  const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  const url = await uploadReportFile(key, buffer, contentType)

  await sendFonnteDocument({ target, url, filename, message: `📊 Laporan ${data.scopeName} — ${data.periodLabel}` })
}

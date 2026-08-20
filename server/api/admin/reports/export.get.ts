import { buildReportData } from '../../../reports/buildReportData'
import { buildReportExcel, reportFilename } from '../../../reports/toExcel'
import { buildReportPdf } from '../../../reports/toPdf'
import { resolvePeriodRange, periodLabel, type ReportPeriod } from '../../../reports/periodRange'

const VALID_PERIODS: ReportPeriod[] = ['day', 'week', 'month', 'year', 'custom']

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const query = getQuery(event)

  const period = VALID_PERIODS.includes(query.period as ReportPeriod) ? (query.period as ReportPeriod) : 'month'
  const format = query.format === 'pdf' ? 'pdf' : 'xlsx'

  const businessId = admin.businessId
    ? admin.businessId
    : (query.businessId && query.businessId !== 'personal' ? Number(query.businessId) : null)

  const { from, to, label } = resolvePeriodRange(period, query.from as string | undefined, query.to as string | undefined)
  const data = await buildReportData({ businessId, from, to, periodLabel: period === 'custom' ? label : `${periodLabel(period)} · ${label}` })

  const filename = reportFilename(data.scopeName, format)

  if (format === 'pdf') {
    const buffer = await buildReportPdf(data)
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
    return buffer
  }

  const buffer = await buildReportExcel(data)
  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  return buffer
})

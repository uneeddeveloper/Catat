import type { Context } from 'grammy'
import { InlineKeyboard, InputFile } from 'grammy'
import { upsertChat } from '../helpers'
import { buildReportData } from '../../reports/buildReportData'
import { buildReportExcel, reportFilename } from '../../reports/toExcel'
import { buildReportPdf } from '../../reports/toPdf'
import { resolvePeriodRange, periodLabel, type ReportPeriod } from '../../reports/periodRange'

const PERIOD_BUTTONS: { code: ReportPeriod, label: string }[] = [
  { code: 'day', label: 'Hari ini' },
  { code: 'week', label: 'Minggu ini' },
  { code: 'month', label: 'Bulan ini' },
  { code: 'year', label: 'Tahun ini' }
]

export async function handleLaporan(ctx: Context) {
  await upsertChat(ctx)
  const kb = new InlineKeyboard()
  PERIOD_BUTTONS.forEach((p, i) => {
    kb.text(p.label, `rpt:p:${p.code}`)
    if (i % 2 === 1) kb.row()
  })
  await ctx.reply('📊 Mau laporan periode apa?', { reply_markup: kb })
}

export async function handleReportPeriodCallback(ctx: Context, period: ReportPeriod) {
  const kb = new InlineKeyboard()
    .text('📊 Excel', `rpt:f:${period}:xlsx`)
    .text('📄 PDF', `rpt:f:${period}:pdf`)
  await ctx.editMessageText(`Format laporan ${periodLabel(period)}?`, { reply_markup: kb })
  await ctx.answerCallbackQuery()
}

export async function handleReportFormatCallback(ctx: Context, period: ReportPeriod, format: 'xlsx' | 'pdf') {
  await ctx.answerCallbackQuery('Menyiapkan laporan...')
  const chat = await upsertChat(ctx)
  const { from, to, label } = resolvePeriodRange(period)
  const data = await buildReportData({ businessId: chat.businessId, from, to, periodLabel: `${periodLabel(period)} · ${label}` })
  const buffer = format === 'pdf' ? await buildReportPdf(data) : await buildReportExcel(data)
  const filename = reportFilename(data.scopeName, format)
  await ctx.replyWithDocument(new InputFile(buffer, filename), { caption: `📊 Laporan ${data.scopeName} — ${data.periodLabel}` })
}

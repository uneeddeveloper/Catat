import ExcelJS from 'exceljs'
import type { ReportData, ReportRow } from './buildReportData'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

const COLOR = {
  title: 'FF0F172A',
  muted: 'FF64748B',
  border: 'FFCBD5E1',
  band: 'FFF8FAFC',
  income: 'FF15803D',
  incomeBg: 'FFDCFCE7',
  expense: 'FFB91C1C',
  expenseBg: 'FFFEE2E2',
  white: 'FFFFFFFF',
  itemText: 'FF94A3B8'
}

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: COLOR.border } },
  bottom: { style: 'thin', color: { argb: COLOR.border } },
  left: { style: 'thin', color: { argb: COLOR.border } },
  right: { style: 'thin', color: { argb: COLOR.border } }
}

export async function buildReportExcel(data: ReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Catat'
  workbook.created = new Date()

  buildSummarySheet(workbook, data)
  buildTransactionsSheet(workbook, data)

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

function buildSummarySheet(workbook: ExcelJS.Workbook, data: ReportData) {
  const summary = workbook.addWorksheet('Ringkasan', { views: [{ showGridLines: false }] })
  summary.columns = [{ width: 30 }, { width: 22 }, { width: 22 }]

  summary.mergeCells('A1:C1')
  const title = summary.getCell('A1')
  title.value = `Laporan Keuangan — ${data.scopeName}`
  title.font = { bold: true, size: 16, color: { argb: COLOR.title } }
  summary.getRow(1).height = 26

  summary.mergeCells('A2:C2')
  const subtitle = summary.getCell('A2')
  subtitle.value = data.periodLabel
  subtitle.font = { italic: true, size: 11, color: { argb: COLOR.muted } }

  let r = 4
  const statCards: { label: string, value: number, color: string }[] = [
    { label: 'Total Pemasukan', value: data.totalIncome, color: COLOR.income },
    { label: 'Total Pengeluaran', value: data.totalExpense, color: COLOR.expense },
    { label: 'Laba / Rugi', value: data.profit, color: data.profit >= 0 ? COLOR.income : COLOR.expense }
  ]
  for (const stat of statCards) {
    const labelCell = summary.getCell(`A${r}`)
    labelCell.value = stat.label
    labelCell.font = { bold: true, color: { argb: COLOR.title } }
    labelCell.border = THIN_BORDER
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.band } }

    summary.mergeCells(`B${r}:C${r}`)
    const valueCell = summary.getCell(`B${r}`)
    valueCell.value = stat.value
    valueCell.numFmt = '"Rp" #,##0'
    valueCell.font = { bold: true, size: 12, color: { argb: stat.color } }
    valueCell.alignment = { horizontal: 'right' }
    valueCell.border = THIN_BORDER
    r++
  }

  r += 1
  summary.mergeCells(`A${r}:C${r}`)
  const catTitle = summary.getCell(`A${r}`)
  catTitle.value = 'Rekap per Kategori'
  catTitle.font = { bold: true, size: 12, color: { argb: COLOR.title } }
  r++

  const catHeaderRow = summary.getRow(r)
  catHeaderRow.values = ['Kategori', 'Pengeluaran', 'Pemasukan']
  styleHeaderRow(catHeaderRow, COLOR.title, COLOR.white)
  r++

  const catStartRow = r
  for (const cat of data.byCategory) {
    const row = summary.getRow(r)
    row.values = [cat.name, cat.expense, cat.income]
    row.getCell(2).numFmt = '#,##0'
    row.getCell(3).numFmt = '#,##0'
    banding(row, r - catStartRow)
    row.eachCell((cell) => {
      cell.border = THIN_BORDER
    })
    r++
  }
}

function buildTransactionsSheet(workbook: ExcelJS.Workbook, data: ReportData) {
  const sheet = workbook.addWorksheet('Transaksi', {
    views: [{ showGridLines: false, state: 'frozen', ySplit: 2 }]
  })
  sheet.columns = [
    { width: 20 },
    { width: 22 },
    { width: 18 },
    { width: 22 },
    { width: 32 },
    { width: 20 }
  ]

  sheet.mergeCells('A1:F1')
  const title = sheet.getCell('A1')
  title.value = `Rincian Transaksi — ${data.scopeName}`
  title.font = { bold: true, size: 16, color: { argb: COLOR.title } }
  sheet.getRow(1).height = 26

  sheet.mergeCells('A2:F2')
  const subtitle = sheet.getCell('A2')
  subtitle.value = data.periodLabel
  subtitle.font = { italic: true, size: 11, color: { argb: COLOR.muted } }

  let r = 4
  const incomeRows = data.rows.filter(row => row.type === 'income')
  const expenseRows = data.rows.filter(row => row.type === 'expense')

  r = addTransactionSection(sheet, r, {
    label: 'PEMASUKAN',
    accent: COLOR.income,
    accentBg: COLOR.incomeBg,
    rows: incomeRows,
    total: data.totalIncome
  })

  r += 2

  addTransactionSection(sheet, r, {
    label: 'PENGELUARAN',
    accent: COLOR.expense,
    accentBg: COLOR.expenseBg,
    rows: expenseRows,
    total: data.totalExpense
  })
}

function addTransactionSection(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  section: { label: string, accent: string, accentBg: string, rows: ReportRow[], total: number }
) {
  let r = startRow

  sheet.mergeCells(`A${r}:F${r}`)
  const bar = sheet.getCell(`A${r}`)
  bar.value = `${section.label}  (${section.rows.length} transaksi)`
  bar.font = { bold: true, size: 12, color: { argb: COLOR.white } }
  bar.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: section.accent } }
  bar.alignment = { vertical: 'middle', indent: 1 }
  sheet.getRow(r).height = 20
  r++

  const headerRow = sheet.getRow(r)
  headerRow.values = ['Tanggal', 'Kategori', 'Nominal (Rp)', 'Merchant', 'Deskripsi', 'Dicatat oleh']
  styleHeaderRow(headerRow, section.accent, COLOR.white)
  r++

  const bodyStartRow = r
  for (const row of section.rows) {
    const dataRow = sheet.getRow(r)
    dataRow.values = [
      row.expenseDate.toLocaleString('id-ID'),
      row.categoryName,
      row.amount,
      row.merchant ?? '—',
      row.description ?? '—',
      row.senderName
    ]
    dataRow.getCell(3).numFmt = '#,##0'
    dataRow.getCell(3).font = { bold: true, color: { argb: section.accent } }
    banding(dataRow, r - bodyStartRow)
    dataRow.eachCell((cell) => {
      cell.border = THIN_BORDER
    })
    r++

    for (const item of row.items) {
      const itemRow = sheet.getRow(r)
      itemRow.values = [null, `      • ${item.name}`, item.price, null, null, null]
      itemRow.getCell(2).font = { italic: true, size: 10, color: { argb: COLOR.itemText } }
      itemRow.getCell(3).font = { italic: true, size: 10, color: { argb: COLOR.itemText } }
      itemRow.getCell(3).numFmt = '#,##0'
      itemRow.eachCell((cell) => {
        cell.border = { left: THIN_BORDER.left, right: THIN_BORDER.right }
      })
      r++
    }
  }

  if (section.rows.length === 0) {
    sheet.mergeCells(`A${r}:F${r}`)
    const empty = sheet.getCell(`A${r}`)
    empty.value = 'Tidak ada transaksi pada periode ini.'
    empty.font = { italic: true, color: { argb: COLOR.muted } }
    empty.alignment = { indent: 1 }
    r++
  }

  const totalRow = sheet.getRow(r)
  sheet.mergeCells(`A${r}:B${r}`)
  totalRow.getCell(1).value = `Total ${section.label === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'}`
  totalRow.getCell(1).font = { bold: true, color: { argb: COLOR.title } }
  totalRow.getCell(3).value = section.total
  totalRow.getCell(3).numFmt = '"Rp" #,##0'
  totalRow.getCell(3).font = { bold: true, color: { argb: section.accent } }
  totalRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.border = { top: { style: 'medium', color: { argb: section.accent } } }
    if (!cell.fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: section.accentBg } }
  })
  for (let col = 1; col <= 6; col++) {
    const cell = totalRow.getCell(col)
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: section.accentBg } }
  }

  return r
}

function styleHeaderRow(row: ExcelJS.Row, bg: string, fg: string) {
  row.font = { bold: true, color: { argb: fg } }
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }
    cell.alignment = { vertical: 'middle' }
    cell.border = THIN_BORDER
  })
  row.height = 18
}

function banding(row: ExcelJS.Row, index: number) {
  if (index % 2 === 1) {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.band } }
    })
  }
}

export function reportFilename(scopeName: string, ext: 'xlsx' | 'pdf') {
  const safe = scopeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `laporan-${safe}-${date}.${ext}`
}

export { formatRupiah }

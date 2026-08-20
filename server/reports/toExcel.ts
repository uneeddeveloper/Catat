import ExcelJS from 'exceljs'
import type { ReportData } from './buildReportData'

function formatRupiah(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export async function buildReportExcel(data: ReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Catat'
  workbook.created = new Date()

  const summary = workbook.addWorksheet('Ringkasan')
  summary.columns = [{ width: 28 }, { width: 20 }]
  summary.addRow([`Laporan ${data.scopeName}`]).font = { bold: true, size: 14 }
  summary.addRow([data.periodLabel])
  summary.addRow([])
  summary.addRow(['Total Pemasukan', data.totalIncome]).getCell(2).numFmt = '#,##0'
  summary.addRow(['Total Pengeluaran', data.totalExpense]).getCell(2).numFmt = '#,##0'
  summary.addRow(['Laba/Rugi', data.profit]).getCell(2).numFmt = '#,##0'
  summary.addRow([])
  const catHeader = summary.addRow(['Kategori', 'Pengeluaran', 'Pemasukan'])
  catHeader.font = { bold: true }
  for (const cat of data.byCategory) {
    summary.addRow([cat.name, cat.expense, cat.income])
  }
  summary.getColumn(2).numFmt = '#,##0'
  summary.getColumn(3).numFmt = '#,##0'

  const detail = workbook.addWorksheet('Transaksi')
  detail.columns = [
    { header: 'Tanggal', key: 'date', width: 20 },
    { header: 'Jenis', key: 'type', width: 12 },
    { header: 'Kategori', key: 'category', width: 18 },
    { header: 'Nominal', key: 'amount', width: 16 },
    { header: 'Merchant', key: 'merchant', width: 20 },
    { header: 'Deskripsi', key: 'description', width: 30 },
    { header: 'Dicatat oleh', key: 'sender', width: 18 }
  ]
  detail.getRow(1).font = { bold: true }

  for (const row of data.rows) {
    detail.addRow({
      date: row.expenseDate.toLocaleString('id-ID'),
      type: row.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      category: row.categoryName,
      amount: row.amount,
      merchant: row.merchant ?? '',
      description: row.description ?? '',
      sender: row.senderName
    })
  }
  detail.getColumn('amount').numFmt = '#,##0'

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

export function reportFilename(scopeName: string, ext: 'xlsx' | 'pdf') {
  const safe = scopeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `laporan-${safe}-${date}.${ext}`
}

export { formatRupiah }

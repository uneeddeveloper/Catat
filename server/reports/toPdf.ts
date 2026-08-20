import PDFDocument from 'pdfkit'
import type { ReportData } from './buildReportData'
import { formatRupiah } from './toExcel'

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

const COLUMNS = [
  { key: 'date', label: 'Tanggal', width: 85 },
  { key: 'type', label: 'Jenis', width: 50 },
  { key: 'category', label: 'Kategori', width: 75 },
  { key: 'amount', label: 'Nominal', width: 90 },
  { key: 'description', label: 'Deskripsi', width: 160 }
] as const

export function buildReportPdf(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.fontSize(18).text(`Laporan ${data.scopeName}`)
    doc.fontSize(11).fillColor('#555').text(data.periodLabel)
    doc.moveDown()

    doc.fillColor('#000').fontSize(12)
    doc.text(`Total Pemasukan: ${formatRupiah(data.totalIncome)}`)
    doc.text(`Total Pengeluaran: ${formatRupiah(data.totalExpense)}`)
    doc.font('Helvetica-Bold').text(`Laba/Rugi: ${formatRupiah(data.profit)}`)
    doc.font('Helvetica')
    doc.moveDown()

    if (data.byCategory.length) {
      doc.fontSize(13).text('Per Kategori', { underline: true })
      doc.moveDown(0.3)
      for (const cat of data.byCategory) {
        doc.fontSize(10).text(`${cat.name}  —  Pengeluaran ${formatRupiah(cat.expense)}  ·  Pemasukan ${formatRupiah(cat.income)}`)
      }
      doc.moveDown()
    }

    doc.fontSize(13).text('Detail Transaksi', { underline: true })
    doc.moveDown(0.3)

    const startX = doc.page.margins.left
    const tableWidth = COLUMNS.reduce((sum, c) => sum + c.width, 0)
    const pageBottom = doc.page.height - doc.page.margins.bottom

    function drawHeader() {
      let x = startX
      doc.font('Helvetica-Bold').fontSize(9)
      for (const col of COLUMNS) {
        doc.text(col.label, x, doc.y, { width: col.width })
        x += col.width
      }
      doc.font('Helvetica')
      doc.moveDown(0.5)
      doc.moveTo(startX, doc.y).lineTo(startX + tableWidth, doc.y).strokeColor('#ccc').stroke()
      doc.moveDown(0.3)
    }

    drawHeader()

    if (!data.rows.length) {
      doc.fontSize(10).fillColor('#777').text('Belum ada transaksi di periode ini.')
    }

    for (const row of data.rows) {
      if (doc.y > pageBottom - 30) {
        doc.addPage()
        drawHeader()
      }
      const y = doc.y
      let x = startX
      const values = [
        row.expenseDate.toLocaleDateString('id-ID'),
        row.type === 'income' ? 'Masuk' : 'Keluar',
        truncate(row.categoryName, 16),
        formatRupiah(row.amount),
        truncate(row.description ?? '', 40)
      ]
      doc.fillColor('#000').fontSize(9)
      values.forEach((val, i) => {
        const col = COLUMNS[i]!
        doc.text(val, x, y, { width: col.width })
        x += col.width
      })
      doc.moveDown(0.4)
    }

    doc.end()
  })
}

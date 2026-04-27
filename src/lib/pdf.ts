import type { Invoice, Quote, Client, Settings } from '@/types'
import { subtotal, taxAmount, total, formatCurrency, formatDate } from './calc'

type Document = Invoice | Quote

function isInvoice(doc: Document): doc is Invoice {
  return 'status' in doc && ['draft', 'sent', 'paid', 'overdue'].includes((doc as Invoice).status)
}

export async function exportPDF(doc: Document, client: Client, settings: Settings) {
  const { default: JsPDF } = await import('jspdf')
  const pdf = new JsPDF({ unit: 'pt', format: 'letter' })

  const margin = 48
  const pageW = pdf.internal.pageSize.getWidth()
  let y = margin

  // Header
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(22)
  pdf.text(settings.businessName, margin, y)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(100)
  if (settings.businessAddress) pdf.text(settings.businessAddress, margin, (y += 16))
  if (settings.businessEmail) pdf.text(settings.businessEmail, margin, (y += 12))
  if (settings.businessPhone) pdf.text(settings.businessPhone, margin, (y += 12))

  // Document type label
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  pdf.setTextColor(40)
  const label = isInvoice(doc) ? 'INVOICE' : 'QUOTE'
  pdf.text(label, pageW - margin - pdf.getTextWidth(label), margin)

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(100)
  pdf.text(doc.number, pageW - margin - pdf.getTextWidth(doc.number), margin + 20)
  pdf.text(
    `Date: ${formatDate(doc.createdAt)}`,
    pageW - margin - pdf.getTextWidth(`Date: ${formatDate(doc.createdAt)}`),
    margin + 34,
  )
  if (isInvoice(doc)) {
    const dueLine = `Due: ${formatDate(doc.dueDate)}`
    pdf.text(dueLine, pageW - margin - pdf.getTextWidth(dueLine), margin + 48)
  }

  // Bill to
  y = Math.max(y, margin + 70) + 24
  pdf.setDrawColor(220)
  pdf.line(margin, y, pageW - margin, y)
  y += 16

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(120)
  pdf.text('BILL TO', margin, y)
  y += 14

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(40)
  pdf.text(client.name, margin, y)
  if (client.email) pdf.text(client.email, margin, (y += 13))
  if (client.phone) pdf.text(client.phone, margin, (y += 13))
  if (client.address) {
    client.address.split('\n').forEach((line) => pdf.text(line, margin, (y += 13)))
  }

  // Line items table
  y += 28
  pdf.setDrawColor(220)
  pdf.line(margin, y, pageW - margin, y)
  y += 14

  const cols = { desc: margin, qty: 310, unit: 390, tax: 460, amount: pageW - margin }

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(120)
  pdf.text('DESCRIPTION', cols.desc, y)
  pdf.text('QTY', cols.qty, y)
  pdf.text('UNIT PRICE', cols.unit, y)
  pdf.text('TAX', cols.tax, y)
  pdf.text('AMOUNT', cols.amount, y, { align: 'right' })

  y += 10
  pdf.line(margin, y, pageW - margin, y)
  y += 14

  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(40)
  pdf.setFontSize(9)

  for (const item of doc.lineItems) {
    const lineTotal = item.quantity * item.unitPrice
    pdf.text(item.description, cols.desc, y, { maxWidth: 250 })
    pdf.text(String(item.quantity), cols.qty, y)
    pdf.text(formatCurrency(item.unitPrice), cols.unit, y)
    pdf.text(item.taxable ? 'Yes' : '—', cols.tax, y)
    pdf.text(formatCurrency(lineTotal), cols.amount, y, { align: 'right' })
    y += 18
  }

  // Totals
  y += 8
  pdf.setDrawColor(220)
  pdf.line(margin, y, pageW - margin, y)
  y += 16

  const sub = subtotal(doc.lineItems)
  const tax = taxAmount(doc.lineItems, doc.taxRate)
  const tot = total(doc.lineItems, doc.taxRate)

  const totX = pageW - margin - 140
  pdf.setFontSize(9)
  pdf.setTextColor(100)
  pdf.text('Subtotal', totX, y)
  pdf.text(formatCurrency(sub), pageW - margin, y, { align: 'right' })
  y += 14

  if (doc.taxRate > 0) {
    pdf.text(`Tax (${doc.taxRate}%)`, totX, y)
    pdf.text(formatCurrency(tax), pageW - margin, y, { align: 'right' })
    y += 14
  }

  pdf.setDrawColor(200)
  pdf.line(totX, y, pageW - margin, y)
  y += 14

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(11)
  pdf.setTextColor(40)
  pdf.text('Total', totX, y)
  pdf.text(formatCurrency(tot), pageW - margin, y, { align: 'right' })

  // Notes
  if (doc.notes) {
    y += 36
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(8)
    pdf.setTextColor(120)
    pdf.text('NOTES', margin, y)
    y += 12
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(80)
    pdf.text(doc.notes, margin, y, { maxWidth: pageW - margin * 2 })
  }

  // Footer
  const pageH = pdf.internal.pageSize.getHeight()
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(160)
  pdf.text('Thank you for your business.', pageW / 2, pageH - 30, { align: 'center' })

  pdf.save(`${doc.number}.pdf`)
}

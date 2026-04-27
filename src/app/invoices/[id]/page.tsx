'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { db, getSettings } from '@/lib/db'
import type { Invoice, Client, Settings, InvoiceStatus } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency, formatDate, subtotal, taxAmount, total } from '@/lib/calc'
import { exportPDF } from '@/lib/pdf'
import DocumentForm from '@/components/DocumentForm'

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const invoiceId = Number(id)
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [editing, setEditing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    load()
  }, [invoiceId])

  async function load() {
    const inv = await db.invoices.get(invoiceId)
    if (!inv) {
      setLoaded(true)
      return
    }
    const [cl, s] = await Promise.all([db.clients.get(inv.clientId), getSettings()])
    setInvoice(inv)
    setClient(cl ?? null)
    setSettings(s)
    setLoaded(true)
  }

  async function setStatus(status: InvoiceStatus) {
    if (!invoice) return
    const update: Partial<Invoice> = { status }
    if (status === 'paid' && !invoice.paidAt) update.paidAt = new Date()
    if (status === 'sent' && !invoice.sentAt) update.sentAt = new Date()
    await db.invoices.update(invoice.id!, update)
    load()
  }

  async function remove() {
    if (!confirm('Delete this invoice?')) return
    await db.invoices.delete(invoiceId)
    router.push('/invoices')
  }

  async function downloadPDF() {
    if (!invoice || !client || !settings) return
    await exportPDF(invoice, client, settings)
  }

  if (!loaded) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
  if (!invoice) return <p>Invoice not found. <Link href="/invoices">Back to invoices</Link></p>

  if (editing) return <DocumentForm type="invoice" initial={invoice} />

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {invoice.number} <StatusBadge status={invoice.status} />
          </h1>
          <p className="page-subtitle">
            Created {formatDate(invoice.createdAt)} · Due {formatDate(invoice.dueDate)}
            {invoice.recurringFrequency && ` · 🔁 ${invoice.recurringFrequency}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-ghost" onClick={downloadPDF}>Export PDF</button>
          <button className="btn btn-danger" onClick={remove}>Delete</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">Status</div>
        <div className="card-body" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['draft', 'sent', 'paid', 'overdue'] as const).map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${invoice.status === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatus(s)}
              style={{ textTransform: 'capitalize' }}
            >
              {s}
            </button>
          ))}
          {invoice.paidAt && (
            <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: '0.85rem', color: 'var(--success)' }}>
              ✓ Paid on {formatDate(invoice.paidAt)}
            </span>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">Bill To</div>
        <div className="card-body">
          {client ? (
            <>
              <div style={{ fontWeight: 500, fontSize: '1rem' }}>{client.name}</div>
              {client.email && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{client.email}</div>}
              {client.phone && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{client.phone}</div>}
              {client.address && <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4, whiteSpace: 'pre-line' }}>{client.address}</div>}
            </>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Client not found</span>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">Line Items</div>
        <div className="card-body">
          <table className="line-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'center' }}>Tax</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, i) => (
                <tr key={i}>
                  <td>{item.description || <em style={{ color: 'var(--text-subtle)' }}>(no description)</em>}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ textAlign: 'center' }}>{item.taxable ? '✓' : '—'}</td>
                  <td className="line-total">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals-section">
            <table className="totals-table">
              <tbody>
                <tr>
                  <td style={{ color: 'var(--text-muted)' }}>Subtotal</td>
                  <td>{formatCurrency(subtotal(invoice.lineItems))}</td>
                </tr>
                {invoice.taxRate > 0 && (
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>Tax ({invoice.taxRate}%)</td>
                    <td>{formatCurrency(taxAmount(invoice.lineItems, invoice.taxRate))}</td>
                  </tr>
                )}
                <tr className="total-row">
                  <td>Total</td>
                  <td>{formatCurrency(total(invoice.lineItems, invoice.taxRate))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="card">
          <div className="card-header">Notes</div>
          <div className="card-body" style={{ whiteSpace: 'pre-line', color: 'var(--text-muted)' }}>{invoice.notes}</div>
        </div>
      )}
    </>
  )
}

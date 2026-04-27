'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Pencil,
  Download,
  Trash2,
  FileText,
  Plus,
} from 'lucide-react'
import { db, getSettings } from '@/lib/db'
import type { Quote, Client, Settings, QuoteStatus } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency, formatDate, subtotal, taxAmount, total } from '@/lib/calc'
import { exportPDF } from '@/lib/pdf'
import DocumentForm from '@/components/DocumentForm'

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const quoteId = Number(id)
  const router = useRouter()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [editing, setEditing] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    load()
  }, [quoteId])

  async function load() {
    const q = await db.quotes.get(quoteId)
    if (!q) {
      setLoaded(true)
      return
    }
    const [cl, s] = await Promise.all([db.clients.get(q.clientId), getSettings()])
    setQuote(q)
    setClient(cl ?? null)
    setSettings(s)
    setLoaded(true)
  }

  async function setStatus(status: QuoteStatus) {
    if (!quote) return
    const update: Partial<Quote> = { status }
    if (status === 'sent' && !quote.sentAt) update.sentAt = new Date()
    await db.quotes.update(quote.id!, update)
    load()
  }

  async function remove() {
    if (!confirm('Delete this quote?')) return
    await db.quotes.delete(quoteId)
    router.push('/quotes')
  }

  async function downloadPDF() {
    if (!quote || !client || !settings) return
    await exportPDF(quote, client, settings)
  }

  if (!loaded) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
  if (!quote) return <p>Quote not found. <Link href="/quotes">Back to quotes</Link></p>

  if (editing) return <DocumentForm type="quote" initial={quote} />

  return (
    <>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <Link href="/quotes" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              <ArrowLeft size={16} />
            </Link>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <FileText size={22} strokeWidth={2} />
              {quote.number}
            </h1>
            <StatusBadge status={quote.status} />
          </div>
          <p className="page-subtitle">Created {formatDate(quote.createdAt)}</p>
        </div>
        <div className="detail-actions">
          <button className="btn btn-ghost" onClick={() => setEditing(true)}>
            <Pencil size={15} strokeWidth={2} />
            Edit
          </button>
          <button className="btn btn-ghost" onClick={downloadPDF}>
            <Download size={15} strokeWidth={2} />
            Export PDF
          </button>
          <Link href={`/invoices/new?fromQuote=${quote.id}`} className="btn btn-primary">
            <Plus size={15} strokeWidth={2.5} />
            Convert to Invoice
          </Link>
          <button className="btn btn-danger" onClick={remove}>
            <Trash2 size={15} strokeWidth={2} />
            Delete
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">Status</div>
        <div className="card-body">
          <div className="status-buttons">
            {(['draft', 'sent', 'accepted', 'declined'] as const).map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${quote.status === s ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatus(s)}
                style={{ textTransform: 'capitalize' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">Quote For</div>
        <div className="card-body">
          {client ? (
            <div style={{ display: 'grid', gap: 4 }}>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--navy)' }}>{client.name}</div>
              {client.email && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>📧 {client.email}</div>}
              {client.phone && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>📞 {client.phone}</div>}
              {client.address && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4, whiteSpace: 'pre-line' }}>{client.address}</div>}
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Client not found</span>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
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
              {quote.lineItems.map((item, i) => (
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
                  <td>{formatCurrency(subtotal(quote.lineItems))}</td>
                </tr>
                {quote.taxRate > 0 && (
                  <tr>
                    <td style={{ color: 'var(--text-muted)' }}>Tax ({quote.taxRate}%)</td>
                    <td>{formatCurrency(taxAmount(quote.lineItems, quote.taxRate))}</td>
                  </tr>
                )}
                <tr className="total-row">
                  <td>Total</td>
                  <td>{formatCurrency(total(quote.lineItems, quote.taxRate))}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {quote.notes && (
        <div className="card">
          <div className="card-header">Notes</div>
          <div className="card-body" style={{ whiteSpace: 'pre-line', color: 'var(--text-muted)', lineHeight: 1.7 }}>{quote.notes}</div>
        </div>
      )}
    </>
  )
}

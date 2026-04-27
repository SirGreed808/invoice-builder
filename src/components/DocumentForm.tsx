'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { db, getSettings, nextInvoiceNumber, nextQuoteNumber } from '@/lib/db'
import type { Client, Invoice, Quote, LineItem, RecurringFrequency } from '@/types'
import LineItemEditor from './LineItemEditor'
import { nextRecurringDate } from '@/lib/recurring'

interface Props {
  type: 'invoice' | 'quote'
  initial?: Invoice | Quote
  initialClientId?: number
  initialFromQuote?: Quote
}

export default function DocumentForm({ type, initial, initialClientId, initialFromQuote }: Props) {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState<number | ''>(initial?.clientId ?? initialClientId ?? initialFromQuote?.clientId ?? '')
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initial?.lineItems ?? initialFromQuote?.lineItems ?? [{ description: '', quantity: 1, unitPrice: 0, taxable: false }],
  )
  const [taxRate, setTaxRate] = useState(initial?.taxRate ?? initialFromQuote?.taxRate ?? 0)
  const [notes, setNotes] = useState(initial?.notes ?? initialFromQuote?.notes ?? '')
  const [dueDate, setDueDate] = useState(() => {
    if (initial && 'dueDate' in initial) return new Date(initial.dueDate).toISOString().slice(0, 10)
    const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
  })
  const [recurring, setRecurring] = useState<RecurringFrequency | ''>(
    initial && 'recurringFrequency' in initial ? initial.recurringFrequency ?? '' : '',
  )
  const [recurringEndDate, setRecurringEndDate] = useState(() => {
    if (initial && 'recurringEndDate' in initial && initial.recurringEndDate)
      return new Date(initial.recurringEndDate).toISOString().slice(0, 10)
    return ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    db.clients.orderBy('name').toArray().then(setClients)
  }, [])

  useEffect(() => {
    if (initial) return
    if (clientId === '') return
    const client = clients.find((c) => c.id === clientId)
    if (client && client.defaultTaxRate > 0 && taxRate === 0) {
      setTaxRate(client.defaultTaxRate)
    }
  }, [clientId, clients, initial, taxRate])

  async function save(closeAfter = true) {
    if (!clientId) {
      alert('Please select a client')
      return
    }
    if (lineItems.length === 0) {
      alert('Add at least one line item')
      return
    }
    setSaving(true)
    try {
      if (initial?.id) {
        // update
        if (type === 'invoice') {
          const data: Partial<Invoice> = {
            clientId: Number(clientId),
            lineItems,
            taxRate,
            notes,
            dueDate: new Date(dueDate),
            recurringFrequency: recurring || undefined,
            recurringNextDate: recurring ? nextRecurringDate(new Date(dueDate), recurring) : undefined,
            recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : undefined,
          }
          await db.invoices.update(initial.id, data)
        } else {
          const data: Partial<Quote> = { clientId: Number(clientId), lineItems, taxRate, notes }
          await db.quotes.update(initial.id, data)
        }
        if (closeAfter) router.push(`/${type}s/${initial.id}`)
      } else {
        // create
        if (type === 'invoice') {
          const number = await nextInvoiceNumber()
          const data: Invoice = {
            clientId: Number(clientId),
            quoteId: initialFromQuote?.id,
            number,
            lineItems,
            taxRate,
            notes,
            status: 'draft',
            dueDate: new Date(dueDate),
            createdAt: new Date(),
            recurringFrequency: recurring || undefined,
            recurringNextDate: recurring ? nextRecurringDate(new Date(dueDate), recurring) : undefined,
            recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : undefined,
          }
          const id = await db.invoices.add(data)
          if (initialFromQuote?.id) {
            await db.quotes.update(initialFromQuote.id, { status: 'accepted' })
          }
          router.push(`/invoices/${id}`)
        } else {
          const number = await nextQuoteNumber()
          const data: Quote = {
            clientId: Number(clientId),
            number,
            lineItems,
            taxRate,
            notes,
            status: 'draft',
            createdAt: new Date(),
          }
          const id = await db.quotes.add(data)
          router.push(`/quotes/${id}`)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {initial ? `Edit ${type}` : `New ${type}`}
            {initialFromQuote && ` (from ${initialFromQuote.number})`}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/${type}s`} className="btn btn-ghost">Cancel</Link>
          <button className="btn btn-primary" onClick={() => save()} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Client *</label>
              <select className="form-select" value={clientId} onChange={(e) => setClientId(e.target.value === '' ? '' : Number(e.target.value))}>
                <option value="">— Select client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {clients.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  No clients yet — <Link href="/clients">add one</Link>.
                </p>
              )}
            </div>
            {type === 'invoice' && (
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tax Rate (%)</label>
              <input className="form-input" type="number" min="0" max="100" step="0.1" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} style={{ maxWidth: 140 }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">Line Items</div>
        <div className="card-body">
          <LineItemEditor items={lineItems} taxRate={taxRate} onChange={setLineItems} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">Notes</div>
        <div className="card-body">
          <textarea className="form-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, thank-you note, anything else…" rows={4} />
        </div>
      </div>

      {type === 'invoice' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">Recurring (optional)</div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <select className="form-select" value={recurring} onChange={(e) => setRecurring(e.target.value as RecurringFrequency | '')}>
                  <option value="">No recurrence</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              {recurring && (
                <div className="form-group">
                  <label className="form-label">End Date (optional)</label>
                  <input className="form-input" type="date" value={recurringEndDate} onChange={(e) => setRecurringEndDate(e.target.value)} />
                </div>
              )}
            </div>
            {recurring && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                A new draft invoice will appear in your inbox each {recurring.replace('ly', '')} starting after the due date.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

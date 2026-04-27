'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, ArrowRight } from 'lucide-react'
import { db } from '@/lib/db'
import type { Invoice, Client } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency, formatDate, total } from '@/lib/calc'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [filter, setFilter] = useState<'all' | Invoice['status']>('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function load() {
      const [invs, cls] = await Promise.all([db.invoices.toArray(), db.clients.toArray()])
      setInvoices(invs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setClients(cls)
    }
    load()
  }, [])

  const clientMap = Object.fromEntries(clients.map((c) => [c.id!, c]))
  const filtered = filter === 'all' ? invoices : invoices.filter((i) => i.status === filter)

  const counts = {
    all: invoices.length,
    draft: invoices.filter((i) => i.status === 'draft').length,
    sent: invoices.filter((i) => i.status === 'sent').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{invoices.length} total</p>
        </div>
        <Link href="/invoices/new" className="btn btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          New Invoice
        </Link>
      </div>

      <div className="filter-tabs">
        {(['all', 'draft', 'sent', 'paid', 'overdue'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`btn ${filter === status ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            style={{ textTransform: 'capitalize' }}
          >
            {status} <span style={{ opacity: 0.7, marginLeft: 4 }}>({counts[status]})</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: 'var(--accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--teal)',
              }}>
                <FileText size={24} strokeWidth={2} />
              </div>
              <div className="empty-state-title">
                No invoices {filter !== 'all' ? `with status "${filter}"` : 'yet'}
              </div>
              {filter === 'all' && (
                <>
                  <div className="empty-state-desc">Create your first invoice to get started.</div>
                  <Link href="/invoices/new" className="btn btn-primary">
                    <Plus size={16} strokeWidth={2.5} />
                    New Invoice
                  </Link>
                </>
              )}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Client</th>
                  <th>Created</th>
                  <th>Due</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Recurring</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr key={inv.id} onClick={() => (window.location.href = `/invoices/${inv.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', fontWeight: 600 }}>{inv.number}</td>
                    <td style={{ fontWeight: 500 }}>{clientMap[inv.clientId]?.name ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(inv.createdAt)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(inv.dueDate)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{formatCurrency(total(inv.lineItems, inv.taxRate))}</td>
                    <td><StatusBadge status={inv.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {inv.recurringFrequency ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: '0.9rem' }}>↻</span> {inv.recurringFrequency}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { getDueRecurringInvoices, nextRecurringDate } from '@/lib/recurring'
import { formatCurrency, formatDate, total } from '@/lib/calc'
import type { Invoice, Client } from '@/types'
import StatusBadge from '@/components/StatusBadge'

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [recurringDue, setRecurringDue] = useState<Invoice[]>([])

  useEffect(() => {
    async function load() {
      const [invs, cls] = await Promise.all([db.invoices.toArray(), db.clients.toArray()])
      setInvoices(invs)
      setClients(cls)
      setRecurringDue(getDueRecurringInvoices(invs))
    }
    load()
  }, [])

  const clientMap = Object.fromEntries(clients.map((c) => [c.id!, c]))

  const outstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + total(i.lineItems, i.taxRate), 0)

  const overdueCount = invoices.filter((i) => i.status === 'overdue').length

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyRevenue = invoices
    .filter((i) => i.status === 'paid' && new Date(i.paidAt!) >= monthStart)
    .reduce((sum, i) => sum + total(i.lineItems, i.taxRate), 0)

  const recent = [...invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  async function generateRecurring(inv: Invoice) {
    const { nextInvoiceNumber } = await import('@/lib/db')
    const number = await nextInvoiceNumber()
    const newInv: Invoice = {
      ...inv,
      id: undefined,
      number,
      status: 'draft',
      createdAt: new Date(),
      sentAt: undefined,
      paidAt: undefined,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }
    const newId = await db.invoices.add(newInv)
    await db.invoices.update(inv.id!, {
      recurringNextDate: nextRecurringDate(new Date(inv.recurringNextDate!), inv.recurringFrequency!),
    })
    setRecurringDue((prev) => prev.filter((i) => i.id !== inv.id))
    const updated = await db.invoices.toArray()
    setInvoices(updated)
    window.location.href = `/invoices/${newId}`
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/quotes/new" className="btn btn-ghost">New Quote</Link>
          <Link href="/invoices/new" className="btn btn-primary">New Invoice</Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className={`stat-value${outstanding > 0 ? ' warning' : ''}`}>{formatCurrency(outstanding)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className={`stat-value${overdueCount > 0 ? ' danger' : ''}`}>{overdueCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue This Month</div>
          <div className="stat-value success">{formatCurrency(monthlyRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{clients.length}</div>
        </div>
      </div>

      {recurringDue.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div
            className="card-header"
            style={{ background: 'var(--warning-light)', borderRadius: 'var(--radius) var(--radius) 0 0' }}
          >
            🔁 Recurring invoices ready to send ({recurringDue.length})
          </div>
          <div className="card" style={{ borderRadius: '0 0 var(--radius) var(--radius)' }}>
            <div className="card-body" style={{ padding: '12px 16px' }}>
              {recurringDue.map((inv) => (
                <div className="recurring-item" key={inv.id}>
                  <div className="recurring-item-info">
                    <div className="recurring-item-title">{clientMap[inv.clientId]?.name ?? 'Unknown client'}</div>
                    <div className="recurring-item-sub">
                      {inv.number} · {inv.recurringFrequency} · due {formatDate(inv.recurringNextDate!)}
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => generateRecurring(inv)}>
                    Generate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent Invoices</span>
          <Link href="/invoices" style={{ fontSize: '0.8rem', fontWeight: 400 }}>View all →</Link>
        </div>
        <div className="table-wrap">
          {recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-title">No invoices yet</div>
              <div className="empty-state-desc">Create your first invoice to get started.</div>
              <Link href="/invoices/new" className="btn btn-primary">New Invoice</Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => (window.location.href = `/invoices/${inv.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem' }}>{inv.number}</td>
                    <td>{clientMap[inv.clientId]?.name ?? '—'}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{formatCurrency(total(inv.lineItems, inv.taxRate))}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(inv.dueDate)}</td>
                    <td><StatusBadge status={inv.status} /></td>
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

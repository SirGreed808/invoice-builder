'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Users,
  FileText,
  Quote,
  ArrowRight,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { db } from '@/lib/db'
import { getDueRecurringInvoices, nextRecurringDate } from '@/lib/recurring'
import { formatCurrency, formatDate, total } from '@/lib/calc'
import type { Invoice, Client } from '@/types'
import StatusBadge from '@/components/StatusBadge'

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [recurringDue, setRecurringDue] = useState<Invoice[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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

  const stats = [
    {
      label: 'Outstanding',
      value: formatCurrency(outstanding),
      icon: TrendingUp,
      tone: outstanding > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'Overdue',
      value: String(overdueCount),
      icon: AlertTriangle,
      tone: overdueCount > 0 ? 'danger' : 'neutral',
    },
    {
      label: 'Revenue This Month',
      value: formatCurrency(monthlyRevenue),
      icon: DollarSign,
      tone: 'success',
    },
    {
      label: 'Total Clients',
      value: String(clients.length),
      icon: Users,
      tone: 'neutral',
    },
  ]

  return (
    <>
      {/* Animated background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="blob-float"
          style={{
            position: 'absolute',
            top: '-5%',
            right: '-3%',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(194, 102, 45, 0.1) 0%, rgba(232, 133, 74, 0.06) 100%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="blob-float"
          style={{
            position: 'absolute',
            top: '15%',
            left: '-5%',
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(42, 122, 114, 0.08) 0%, rgba(61, 155, 145, 0.05) 100%)',
            filter: 'blur(50px)',
            animationDelay: '-4s',
          }}
        />
        <div
          className="blob-float"
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '5%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(194, 102, 45, 0.06) 0%, rgba(42, 122, 114, 0.08) 100%)',
            filter: 'blur(60px)',
            animationDelay: '-8s',
          }}
        />
        <div
          className="diamond-spin"
          style={{
            position: 'absolute',
            top: '40%',
            right: '8%',
            width: 60,
            height: 60,
            borderRadius: 14,
            background: 'rgba(194, 102, 45, 0.08)',
          }}
        />
        <div
          className="diamond-spin"
          style={{
            position: 'absolute',
            bottom: '25%',
            left: '3%',
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(42, 122, 114, 0.1)',
            animationDelay: '-10s',
          }}
        />
      </div>

      {/* Page content */}
      <div className="relative" style={{ zIndex: 1 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Overview</h1>
            <p className="page-subtitle">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/quotes/new" className="btn btn-ghost">
              <Quote size={16} strokeWidth={2} />
              New Quote
            </Link>
            <Link href="/invoices/new" className="btn btn-primary">
              <Plus size={16} strokeWidth={2.5} />
              New Invoice
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="stat-grid">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="stat-card"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  opacity: mounted ? undefined : 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: stat.tone === 'danger' ? 'var(--danger-light)' : stat.tone === 'warning' ? 'var(--warning-light)' : stat.tone === 'success' ? 'var(--success-light)' : 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.tone === 'danger' ? 'var(--danger)' : stat.tone === 'warning' ? 'var(--warning)' : stat.tone === 'success' ? 'var(--success)' : 'var(--teal)',
                    }}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </div>
                </div>
                <div className="stat-label">{stat.label}</div>
                <div className={`stat-value ${stat.tone === 'danger' ? 'danger' : stat.tone === 'warning' ? 'warning' : stat.tone === 'success' ? 'success' : ''}`}>
                  {stat.value}
                </div>
              </div>
            )
          })}
        </div>

        {/* Recurring invoices */}
        {recurringDue.length > 0 && (
          <div className="slide-up" style={{ marginBottom: 32 }}>
            <div
              className="card-header"
              style={{
                background: 'linear-gradient(135deg, var(--warning-light) 0%, #FEF9C3 100%)',
                borderRadius: 'var(--radius) var(--radius) 0 0',
                color: 'var(--warning)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={16} strokeWidth={2} />
                Recurring invoices ready to send ({recurringDue.length})
              </span>
            </div>
            <div className="card" style={{ borderRadius: '0 0 var(--radius) var(--radius)', borderTop: 'none' }}>
              <div className="card-body" style={{ padding: '14px 18px' }}>
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

        {/* Recent invoices */}
        <div className="card slide-up">
          <div className="card-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={17} strokeWidth={2} />
              Recent Invoices
            </span>
            <Link href="/invoices" style={{ fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="table-wrap">
            {recent.length === 0 ? (
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
                <div className="empty-state-title">No invoices yet</div>
                <div className="empty-state-desc">Create your first invoice to get started.</div>
                <Link href="/invoices/new" className="btn btn-primary">
                  <Plus size={16} strokeWidth={2.5} />
                  New Invoice
                </Link>
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
                      <td style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', fontWeight: 600 }}>{inv.number}</td>
                      <td style={{ fontWeight: 500 }}>{clientMap[inv.clientId]?.name ?? '—'}</td>
                      <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{formatCurrency(total(inv.lineItems, inv.taxRate))}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(inv.dueDate)}</td>
                      <td><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

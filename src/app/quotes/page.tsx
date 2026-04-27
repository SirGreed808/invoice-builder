'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Quote as QuoteIcon, ArrowRight } from 'lucide-react'
import { db } from '@/lib/db'
import type { Quote, Client } from '@/types'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency, formatDate, total } from '@/lib/calc'

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [clients, setClients] = useState<Client[]>([])

  useEffect(() => {
    async function load() {
      const [qs, cls] = await Promise.all([db.quotes.toArray(), db.clients.toArray()])
      setQuotes(qs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setClients(cls)
    }
    load()
  }, [])

  const clientMap = Object.fromEntries(clients.map((c) => [c.id!, c]))

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quotes</h1>
          <p className="page-subtitle">{quotes.length} total</p>
        </div>
        <Link href="/quotes/new" className="btn btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          New Quote
        </Link>
      </div>

      <div className="card">
        <div className="table-wrap">
          {quotes.length === 0 ? (
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
                <QuoteIcon size={24} strokeWidth={2} />
              </div>
              <div className="empty-state-title">No quotes yet</div>
              <div className="empty-state-desc">Create a quote to send to a potential client.</div>
              <Link href="/quotes/new" className="btn btn-primary">
                <Plus size={16} strokeWidth={2.5} />
                New Quote
              </Link>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Client</th>
                  <th>Created</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} onClick={() => (window.location.href = `/quotes/${q.id}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '0.82rem', fontWeight: 600 }}>{q.number}</td>
                    <td style={{ fontWeight: 500 }}>{clientMap[q.clientId]?.name ?? '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(q.createdAt)}</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{formatCurrency(total(q.lineItems, q.taxRate))}</td>
                    <td><StatusBadge status={q.status} /></td>
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

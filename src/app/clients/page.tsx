'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, Trash2, Mail, Phone } from 'lucide-react'
import { db, getSettings } from '@/lib/db'
import { assertUnderLimit, DEMO_LIMITS } from '@/lib/limits'
import type { Client } from '@/types'
import { formatDate } from '@/lib/calc'

const blank = (): Omit<Client, 'id' | 'createdAt'> => ({
  name: '',
  email: '',
  phone: '',
  address: '',
  defaultTaxRate: 0,
})

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [modal, setModal] = useState<'new' | number | null>(null)
  const [form, setForm] = useState(blank())
  const [defaultTax, setDefaultTax] = useState(0)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const [cls, settings] = await Promise.all([db.clients.orderBy('name').toArray(), getSettings()])
    setClients(cls)
    setDefaultTax(settings.defaultTaxRate)
  }

  function openNew() {
    setForm({ ...blank(), defaultTaxRate: defaultTax })
    setModal('new')
  }

  function openEdit(client: Client) {
    setForm({ name: client.name, email: client.email, phone: client.phone, address: client.address, defaultTaxRate: client.defaultTaxRate })
    setModal(client.id!)
  }

  async function save() {
    if (!form.name.trim()) return
    try {
      if (modal === 'new') {
        await assertUnderLimit('clients', DEMO_LIMITS.MAX_CLIENTS)
        await db.clients.add({ ...form, createdAt: new Date() })
      } else {
        await db.clients.update(modal as number, form)
      }
      setModal(null)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Could not save client.')
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this client?')) return
    await db.clients.delete(id)
    load()
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          <Plus size={16} strokeWidth={2.5} />
          New Client
        </button>
      </div>

      <div className="card">
        <div className="table-wrap">
          {clients.length === 0 ? (
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
                <Users size={24} strokeWidth={2} />
              </div>
              <div className="empty-state-title">No clients yet</div>
              <div className="empty-state-desc">Add your first client to start creating invoices.</div>
              <button className="btn btn-primary" onClick={openNew}>
                <Plus size={16} strokeWidth={2.5} />
                New Client
              </button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Default Tax</th>
                  <th>Added</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} style={{ cursor: 'pointer' }} onClick={() => openEdit(client)}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{client.name}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {client.email && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={12} /> {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={12} /> {client.phone}
                          </span>
                        )}
                        {!client.email && !client.phone && <span style={{ color: 'var(--text-subtle)', fontSize: '0.82rem' }}>—</span>}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
                      {client.defaultTaxRate > 0 ? `${client.defaultTaxRate}%` : '—'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatDate(client.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => { e.stopPropagation(); remove(client.id!) }}
                        style={{ color: 'var(--text-subtle)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal !== null && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modal === 'new' ? 'New Client' : 'Edit Client'}</span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus maxLength={80} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={254} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} maxLength={500} />
              </div>
              <div className="form-group">
                <label className="form-label">Default Tax Rate (%)</label>
                <input className="form-input" type="number" min="0" max="100" step="0.1" value={form.defaultTaxRate} onChange={(e) => setForm({ ...form, defaultTaxRate: parseFloat(e.target.value) || 0 })} style={{ maxWidth: 120 }} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save Client</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

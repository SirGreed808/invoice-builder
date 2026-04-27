'use client'

import { useEffect, useState } from 'react'
import { Settings, Save, Trash2, AlertTriangle } from 'lucide-react'
import { db, getSettings } from '@/lib/db'
import type { Settings as SettingsType } from '@/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  function update<K extends keyof SettingsType>(field: K, value: SettingsType[K]) {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
    setSaved(false)
  }

  async function save() {
    if (!settings?.id) return
    await db.settings.update(settings.id, settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function resetData() {
    if (!confirm('This will permanently delete ALL invoices, quotes, clients, and settings. Continue?')) return
    if (!confirm('Are you absolutely sure? This cannot be undone.')) return
    await db.delete()
    window.location.reload()
  }

  if (!settings) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">All data lives in this browser — install the app to use offline.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {saved && (
            <span style={{ alignSelf: 'center', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              ✓ Saved
            </span>
          )}
          <button className="btn btn-primary" onClick={save}>
            <Save size={16} strokeWidth={2} />
            Save Settings
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={17} strokeWidth={2} />
            Business Info
          </span>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Business Name *</label>
            <input className="form-input" value={settings.businessName} onChange={(e) => update('businessName', e.target.value)} maxLength={80} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={settings.businessEmail} onChange={(e) => update('businessEmail', e.target.value)} maxLength={254} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" type="tel" value={settings.businessPhone} onChange={(e) => update('businessPhone', e.target.value)} maxLength={20} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" value={settings.businessAddress} onChange={(e) => update('businessAddress', e.target.value)} rows={3} maxLength={500} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">Defaults</div>
        <div className="card-body">
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Default Tax Rate (%)</label>
              <input className="form-input" type="number" min="0" max="100" step="0.1" value={settings.defaultTaxRate} onChange={(e) => update('defaultTaxRate', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-select" value={settings.currency} onChange={(e) => update('currency', e.target.value)}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">Numbering</div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Invoice Prefix</label>
              <input className="form-input" value={settings.invoicePrefix} onChange={(e) => update('invoicePrefix', e.target.value)} maxLength={10} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: 6 }}>
                Next: <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{settings.invoicePrefix}-{String(settings.nextInvoiceNumber).padStart(4, '0')}</span>
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Quote Prefix</label>
              <input className="form-input" value={settings.quotePrefix} onChange={(e) => update('quotePrefix', e.target.value)} maxLength={10} />
              <p style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: 6 }}>
                Next: <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{settings.quotePrefix}-{String(settings.nextQuoteNumber).padStart(4, '0')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={17} strokeWidth={2} />
          Danger Zone
        </div>
        <div className="card-body">
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Permanently delete all data stored in this browser. This cannot be undone.
          </p>
          <button className="btn btn-danger" onClick={resetData}>
            <Trash2 size={16} strokeWidth={2} />
            Reset All Data
          </button>
        </div>
      </div>
    </>
  )
}

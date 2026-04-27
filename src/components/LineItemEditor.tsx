'use client'

import type { LineItem } from '@/types'
import { subtotal, taxAmount, total, formatCurrency } from '@/lib/calc'

interface Props {
  items: LineItem[]
  taxRate: number
  onChange: (items: LineItem[]) => void
}

const blank = (): LineItem => ({ description: '', quantity: 1, unitPrice: 0, taxable: false })

export default function LineItemEditor({ items, taxRate, onChange }: Props) {
  function update(index: number, field: keyof LineItem, value: string | number | boolean) {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    onChange(next)
  }

  function addRow() {
    onChange([...items, blank()])
  }

  function removeRow(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="table-wrap">
        <table className="line-items-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Description</th>
              <th style={{ width: '80px' }}>Qty</th>
              <th style={{ width: '120px' }}>Unit Price</th>
              <th style={{ width: '60px', textAlign: 'center' }}>Tax</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Total</th>
              <th style={{ width: '36px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>
                  <input
                    className="form-input"
                    value={item.description}
                    onChange={(e) => update(i, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </td>
                <td>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => update(i, 'quantity', parseFloat(e.target.value) || 0)}
                    style={{ textAlign: 'right' }}
                  />
                </td>
                <td>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => update(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                    style={{ textAlign: 'right' }}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={item.taxable}
                    onChange={(e) => update(i, 'taxable', e.target.checked)}
                    style={{ accentColor: 'var(--accent)', width: 15, height: 15, cursor: 'pointer' }}
                  />
                </td>
                <td className="line-total">{formatCurrency(item.quantity * item.unitPrice)}</td>
                <td>
                  <button className="remove-btn" type="button" onClick={() => removeRow(i)}>×</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '20px', fontStyle: 'italic' }}>
                  No items yet — add one below
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 10 }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={addRow}>
          + Add line item
        </button>
      </div>

      {items.length > 0 && (
        <div className="totals-section">
          <table className="totals-table">
            <tbody>
              <tr>
                <td style={{ color: 'var(--text-muted)' }}>Subtotal</td>
                <td>{formatCurrency(subtotal(items))}</td>
              </tr>
              {taxRate > 0 && (
                <tr>
                  <td style={{ color: 'var(--text-muted)' }}>Tax ({taxRate}%)</td>
                  <td>{formatCurrency(taxAmount(items, taxRate))}</td>
                </tr>
              )}
              <tr className="total-row">
                <td>Total</td>
                <td>{formatCurrency(total(items, taxRate))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import type { LineItem } from '@/types'

export function subtotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export function taxAmount(items: LineItem[], taxRate: number): number {
  return items
    .filter((i) => i.taxable)
    .reduce((sum, i) => sum + i.quantity * i.unitPrice * (taxRate / 100), 0)
}

export function total(items: LineItem[], taxRate: number): number {
  return subtotal(items) + taxAmount(items, taxRate)
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

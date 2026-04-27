import type { Invoice, RecurringFrequency } from '@/types'

export function nextRecurringDate(from: Date, frequency: RecurringFrequency): Date {
  const d = new Date(from)
  switch (frequency) {
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
    case 'quarterly':
      d.setMonth(d.getMonth() + 3)
      break
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1)
      break
  }
  return d
}

export function getDueRecurringInvoices(invoices: Invoice[]): Invoice[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return invoices.filter((inv) => {
    if (!inv.recurringFrequency || !inv.recurringNextDate) return false
    if (inv.recurringEndDate && new Date(inv.recurringEndDate) < today) return false
    return new Date(inv.recurringNextDate) <= today
  })
}

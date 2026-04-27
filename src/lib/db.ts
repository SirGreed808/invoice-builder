import Dexie, { type EntityTable } from 'dexie'
import type { Client, Quote, Invoice, Settings } from '@/types'

class InvoiceDB extends Dexie {
  clients!: EntityTable<Client, 'id'>
  quotes!: EntityTable<Quote, 'id'>
  invoices!: EntityTable<Invoice, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor() {
    super('InvoiceBuilderDB')
    this.version(1).stores({
      clients: '++id, name, email, createdAt',
      quotes: '++id, clientId, number, status, createdAt',
      invoices: '++id, clientId, quoteId, number, status, dueDate, createdAt, recurringNextDate',
      settings: '++id',
    })
  }
}

export const db = new InvoiceDB()

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.toCollection().first()
  if (existing) return existing
  const defaults: Settings = {
    businessName: 'Your Business',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    defaultTaxRate: 0,
    invoicePrefix: 'INV',
    quotePrefix: 'Q',
    nextInvoiceNumber: 1,
    nextQuoteNumber: 1,
    currency: 'USD',
  }
  await db.settings.add(defaults)
  return defaults
}

export async function nextInvoiceNumber(): Promise<string> {
  const settings = await getSettings()
  const num = String(settings.nextInvoiceNumber).padStart(4, '0')
  await db.settings.update(settings.id!, { nextInvoiceNumber: settings.nextInvoiceNumber + 1 })
  return `${settings.invoicePrefix}-${num}`
}

export async function nextQuoteNumber(): Promise<string> {
  const settings = await getSettings()
  const num = String(settings.nextQuoteNumber).padStart(4, '0')
  await db.settings.update(settings.id!, { nextQuoteNumber: settings.nextQuoteNumber + 1 })
  return `${settings.quotePrefix}-${num}`
}

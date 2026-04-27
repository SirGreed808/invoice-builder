export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined'
export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  taxable: boolean
}

export interface Client {
  id?: number
  name: string
  email: string
  phone: string
  address: string
  defaultTaxRate: number
  createdAt: Date
}

export interface Quote {
  id?: number
  clientId: number
  number: string
  lineItems: LineItem[]
  taxRate: number
  notes: string
  status: QuoteStatus
  createdAt: Date
  sentAt?: Date
}

export interface Invoice {
  id?: number
  clientId: number
  quoteId?: number
  number: string
  lineItems: LineItem[]
  taxRate: number
  notes: string
  status: InvoiceStatus
  dueDate: Date
  createdAt: Date
  sentAt?: Date
  paidAt?: Date
  recurringFrequency?: RecurringFrequency
  recurringNextDate?: Date
  recurringEndDate?: Date
}

export interface Settings {
  id?: number
  businessName: string
  businessEmail: string
  businessPhone: string
  businessAddress: string
  defaultTaxRate: number
  invoicePrefix: string
  quotePrefix: string
  nextInvoiceNumber: number
  nextQuoteNumber: number
  currency: string
}

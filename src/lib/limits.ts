import { db } from './db'

export const DEMO_LIMITS = {
  MAX_INVOICES: 25,
  MAX_QUOTES: 25,
  MAX_CLIENTS: 10,
  MAX_LINE_ITEMS: 20,
} as const

export async function assertUnderLimit(table: 'invoices' | 'quotes' | 'clients', max: number): Promise<void> {
  const count = await db[table].count()
  if (count >= max) {
    const noun: Record<string, string> = {
      invoices: `${max} invoice`,
      quotes: `${max} quote`,
      clients: `${max} client`,
    }
    throw new Error(
      `Demo limit: ${noun[table]}s max. This is a portfolio demo — clear browser data to reset.`
    )
  }
}

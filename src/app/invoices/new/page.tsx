'use client'

import { Suspense } from 'react'
import NewInvoiceContent from './NewInvoiceContent'

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<p style={{ color: 'var(--text-muted)' }}>Loading…</p>}>
      <NewInvoiceContent />
    </Suspense>
  )
}

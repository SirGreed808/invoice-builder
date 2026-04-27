'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import DocumentForm from '@/components/DocumentForm'
import { db } from '@/lib/db'
import type { Quote } from '@/types'

export default function NewInvoicePage() {
  const searchParams = useSearchParams()
  const fromQuoteId = searchParams.get('fromQuote')
  const [fromQuote, setFromQuote] = useState<Quote | null>(null)
  const [loaded, setLoaded] = useState(!fromQuoteId)

  useEffect(() => {
    if (fromQuoteId) {
      db.quotes.get(Number(fromQuoteId)).then((q) => {
        if (q) setFromQuote(q)
        setLoaded(true)
      })
    }
  }, [fromQuoteId])

  if (!loaded) return <p style={{ color: 'var(--text-muted)' }}>Loading…</p>

  return <DocumentForm type="invoice" initialFromQuote={fromQuote ?? undefined} />
}

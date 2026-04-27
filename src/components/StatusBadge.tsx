import type { InvoiceStatus, QuoteStatus } from '@/types'

type Status = InvoiceStatus | QuoteStatus

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${status}`}>{status}</span>
}

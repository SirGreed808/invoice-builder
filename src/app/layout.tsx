import type { Metadata, Viewport } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  metadataBase: new URL('https://invoices.honestdev808.com'),
  title: 'Invoice Builder — Honest Dev',
  description: 'A portfolio demo: local-first invoicing with PDF export. Built by Honest Dev Consulting.',
  manifest: '/manifest.json',
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Invoice Builder — Honest Dev',
    description: 'Local-first invoicing demo with PDF export. Data stays in your browser.',
    url: 'https://invoices.honestdev808.com',
    siteName: 'Invoice Builder',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Invoice Builder — Honest Dev',
    description: 'Local-first invoicing demo with PDF export.',
  },
}

export const viewport: Viewport = {
  themeColor: '#C2662D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="grain-overlay" />
        <div className="demo-banner">
          <strong>Demo</strong> · Data stays in your browser · Not for production use ·{' '}
          <a href="https://honestdev808.com" target="_blank" rel="noopener noreferrer">Honest Dev →</a>
        </div>
        <div className="app-shell">
          <Sidebar />
          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  )
}

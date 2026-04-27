# Invoice Builder

A local-first PWA for freelancers and contractors. Create invoices, quotes, and manage clients — all in the browser with no login required. Data stays on your device, works offline, and exports to PDF.

## Features

- **Dashboard** — Outstanding balance, overdue count, monthly revenue, total clients at a glance
- **Invoices** — Create, edit, send, track. Support for recurring invoices (weekly, monthly, quarterly, yearly)
- **Quotes** — Same flow as invoices with a "Convert to Invoice" action
- **Clients** — Client directory with default tax rates
- **PDF Export** — Clean, professional invoice PDFs generated client-side
- **Offline First** — All data stored locally via IndexedDB (Dexie.js). Works without internet
- **PWA** — Installable on desktop and mobile, standalone app experience

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Dexie.js (IndexedDB wrapper)
- jsPDF (PDF generation)
- Custom CSS (no Tailwind, no component library)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Static export configured for deployment to any static host.

## Data Storage

All data is stored locally in the browser via IndexedDB. No server, no accounts, no cloud sync. Clear your browser data = clear your invoices. Export PDFs as backup.

---

Built by [Honest Dev Consulting](https://honestdev808.com)

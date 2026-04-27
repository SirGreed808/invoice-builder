# Invoice Builder → Kimi Design Brief

## What
Local-first PWA. Freelancers/contractors. Invoices + quotes + clients + PDF export. No login. Browser storage. Works offline. White-labeled.

## Mood
Quiet. Refined. Trustworthy. Tool disappears, work stays. Accounting software done right.

## Lane
Cream/warm-neutral bg. Tight type. Restrained color. Monospace on $$$ + invoice numbers. Generous whitespace.
Inspo: Linear settings, Stripe Dashboard, Notion editor.
Avoid: dark mode, heavy gradients, bubbly consumer fintech.

---

## Pages

**Dashboard**
- 4 stat cards: Outstanding ($) / Overdue (count) / Revenue This Month ($) / Total Clients
- $ values = monospace
- Optional recurring-invoice alert strip below stats
- Recent invoices table (5 rows): Number, Client, Amount, Due, Status badge
- Top right: New Quote (secondary) + New Invoice (primary)

**Invoices List**
- Filter tabs: All / Draft / Sent / Paid / Overdue w/ counts
- Table: Number, Client, Created, Due, Amount, Status badge, Recurring indicator

**Invoice Detail**
- Header: number + status badge. Subtitle: created/due/recurring.
- Actions top right: Edit, Export PDF, Delete
- Status card: row of state buttons (Draft/Sent/Paid/Overdue), selected = highlighted. If paid → "Paid on [date]" inline.
- Bill To card: name, email, phone, address
- Line items table: Description / Qty / Unit Price / Tax (y/n) / Total
- Right-aligned totals: Subtotal → Tax → **Total** (larger, bold)
- Notes card (if any)

**New/Edit Invoice (Form)**
- Row: Client dropdown + Due Date
- Tax Rate (small, right-aligned)
- Editable line items table: Description, Qty, Unit Price, Tax checkbox, computed Total, Remove (×)
- "Add line item" below table
- Live totals right-aligned
- Notes textarea
- Recurring card: frequency select (None/Weekly/Monthly/Quarterly/Yearly) + optional end date
- Top right: Cancel + Save

**Quotes List** — same as Invoices. Statuses: All/Draft/Sent/Accepted/Declined

**Quote Detail** — same as Invoice Detail. Statuses: Draft/Sent/Accepted/Declined. Extra CTA: "Convert to Invoice" (primary, most prominent).

**New/Edit Quote** — same form as invoice, minus Due Date + Recurring card.

**Clients**
- Table: Name, Email, Phone, Default Tax%, Added, Delete btn
- New/edit via modal (not new page): Name, Email, Phone, Address (textarea), Default Tax Rate

**Settings**
- Business Info: Name, Email, Phone, Address
- Defaults: Tax Rate, Currency dropdown
- Numbering: Invoice Prefix + preview ("Next: INV-0001"), Quote Prefix + preview
- Danger Zone: Reset All Data (destructive/red)
- Top right: Save + inline "Saved ✓" on success

**Sidebar (persistent left, ~220px)**
- Logo/wordmark top
- Nav groups: Main → Overview / Documents → Invoices, Quotes, Clients / Account → Settings
- Active item: accent color + left border indicator

---

## Components

| Component | Notes |
|---|---|
| Status badge | 4 states: Draft (neutral), Sent (blue), Paid/Accepted (green), Overdue/Declined (red). Not traffic-light cliché. |
| Stat card | Small uppercase label + large monospace value + optional danger/warning/success color |
| Buttons | Primary, Ghost/secondary, Danger (destructive) |
| Form inputs | text, select, textarea, number, date, checkbox. Focus state required. |
| Modal | Overlay + dialog. Used for client CRUD. |
| Table rows | Hover state. Pointer cursor on clickable rows. |
| Recurring strip | Alert-style banner, list of due items + Generate button each |

---

## Technical Constraints

- No Tailwind. No component library. Pure CSS only → globals.css.
- CSS vars already defined (Kimi updates values, doesn't rename):
  `--bg, --surface, --border, --border-strong, --text, --text-muted, --text-subtle, --accent, --accent-light, --success, --success-light, --warning, --warning-light, --danger, --danger-light, --mono, --radius, --shadow, --shadow-md`
- Existing CSS class names must stay (or provide rename map if changing).
- Font via Google Fonts (CDN import in globals.css is fine).
- No React or TypeScript changes — visual layer only.

---

## Deliverables from Kimi

1. Complete replacement `globals.css`
2. Font pairing (heading + body, or single family at weights) + Google Fonts import line
3. Updated CSS variable values (colors, radii, shadows, etc.)
4. New or renamed classes if needed + mapping note
5. Brief design rationale: color logic, type choices, mood alignment

---

## Distinctness Note (3 portfolio pieces total)

This is Item A of 3. Item B (car detailing booking widget) = premium/dark/automotive. Item C (reputation tracker) = data-rich/warm/approachable. Item A must be visually distinct from both — quieter and more refined than either.

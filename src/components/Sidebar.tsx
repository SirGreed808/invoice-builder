'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Overview', href: '/', group: 'Main' },
  { label: 'Invoices', href: '/invoices', group: 'Documents' },
  { label: 'Quotes', href: '/quotes', group: 'Documents' },
  { label: 'Clients', href: '/clients', group: 'Documents' },
  { label: 'Settings', href: '/settings', group: 'Account' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const groups = Array.from(new Set(navItems.map((i) => i.group)))

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        Invoice<span>Builder</span>
      </div>
      <nav className="sidebar-nav">
        {groups.map((group) => (
          <div className="nav-group" key={group}>
            <div className="nav-group-label">{group}</div>
            {navItems
              .filter((i) => i.group === group)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) ? ' active' : ''}`}
                >
                  {item.label}
                </Link>
              ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

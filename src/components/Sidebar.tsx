'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Quote,
  Users,
  Settings,
} from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/', group: 'Main', icon: LayoutDashboard },
  { label: 'Invoices', href: '/invoices', group: 'Documents', icon: FileText },
  { label: 'Quotes', href: '/quotes', group: 'Documents', icon: Quote },
  { label: 'Clients', href: '/clients', group: 'Documents', icon: Users },
  { label: 'Settings', href: '/settings', group: 'Account', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  const groups = Array.from(new Set(navItems.map((i) => i.group)))

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <FileText size={18} strokeWidth={2.5} />
        </div>
        Invoice<span>Builder</span>
      </div>
      <nav className="sidebar-nav">
        {groups.map((group) => (
          <div className="nav-group" key={group}>
            <div className="nav-group-label">{group}</div>
            {navItems
              .filter((i) => i.group === group)
              .map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link${isActive ? ' active' : ''}`}
                  >
                    <Icon size={17} strokeWidth={2} />
                    {item.label}
                  </Link>
                )
              })}
          </div>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-strong)', fontSize: '0.72rem', color: 'var(--text-subtle)', textAlign: 'center' }}>
        Built by Honest Dev
      </div>
    </aside>
  )
}

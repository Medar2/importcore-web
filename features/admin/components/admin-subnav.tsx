'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ADMIN_SECTIONS } from '../admin-sections'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { can } from '@/features/auth/utils/permissions'

const hub = { label: 'Inicio', href: '/admin' }

export function AdminSubnav() {
  const path = usePathname()
  const { user } = useCurrentUser()
  const items = [hub, ...ADMIN_SECTIONS.filter((s) => can(user, s.permission))]

  return (
    <nav aria-label="Administración" className="flex gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2">
      {items.map((item) => {
        const active =
          item.href === '/admin' ? path === '/admin' : path === item.href || path.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

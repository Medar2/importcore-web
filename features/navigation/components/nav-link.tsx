'use client'

import Link from 'next/link'
import type { NavItem } from '../types'

interface NavLinkProps {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}

export function NavLink({ item, active, collapsed, onNavigate }: NavLinkProps) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-lg text-sm font-medium transition ${
        collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
      } ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
      }`}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}

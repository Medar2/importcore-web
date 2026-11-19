'use client'

import { Menu } from 'lucide-react'
import { NavLink } from './nav-link'
import { isNavItemActive } from '../utils/visible-navigation'
import type { NavBadgeKey, NavItem, NavSection } from '../types'

interface MobileBottomNavProps {
  sections: NavSection[]
  badges?: Partial<Record<NavBadgeKey, number>>
  onOpenMenu: () => void
  pathname: string
}

/** Módulos prioritarios para la barra inferior; se completan con los primeros visibles. */
const PREFERRED_IDS = ['dashboard', 'quotes', 'orders', 'customers']
const MAX_ITEMS = 4

function flatten(sections: NavSection[]): NavItem[] {
  return sections.flatMap((s) =>
    s.items.flatMap((i) => [i, ...(i.children ?? [])]),
  )
}

export function MobileBottomNav({ sections, badges = {}, onOpenMenu, pathname }: MobileBottomNavProps) {
  const all = flatten(sections)
  const byId = new Map(all.map((i) => [i.id, i]))
  const picked: NavItem[] = []
  for (const id of PREFERRED_IDS) {
    const item = byId.get(id)
    if (item && picked.length < MAX_ITEMS) picked.push(item)
  }
  for (const item of all) {
    if (picked.length >= MAX_ITEMS) break
    if (!picked.includes(item)) picked.push(item)
  }

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {picked.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={isNavItemActive(pathname, item.href)}
            stacked
            badge={item.badgeKey ? badges[item.badgeKey] : undefined}
          />
        ))}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menú completo"
          className="flex flex-1 flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium text-muted-foreground transition hover:text-foreground"
        >
          <Menu className="size-5" />
          Menú
        </button>
      </div>
    </nav>
  )
}

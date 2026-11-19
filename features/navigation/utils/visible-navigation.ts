import { can, canAny } from '@/features/auth/utils/permissions'
import type { CurrentUser } from '@/features/auth/types'
import { NAV_SECTIONS } from '../nav.config'
import type { NavItem, NavSection } from '../types'

function itemVisible(user: CurrentUser | null, item: NavItem): boolean {
  if (item.anyOf?.length) return canAny(user, item.anyOf)
  if (item.permission) return can(user, item.permission)
  return true
}

function filterItem(user: CurrentUser | null, item: NavItem): NavItem | null {
  if (!itemVisible(user, item)) return null
  if (!item.children) return item
  const children = item.children.filter((child) => itemVisible(user, child))
  // Un padre con hijos pero ninguno visible igual enlaza a su índice (/admin).
  return { ...item, children: children.length ? children : undefined }
}

/** Secciones del menú visibles para el usuario; las vacías se eliminan. */
export function visibleNavigation(user: CurrentUser | null): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items
      .map((item) => filterItem(user, item))
      .filter((item): item is NavItem => item !== null),
  })).filter((section) => section.items.length > 0)
}

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

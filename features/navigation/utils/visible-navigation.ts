import { can, canAny } from '@/features/auth/utils/permissions'
import type { CurrentUser } from '@/features/auth/types'
import { NAV_SECTIONS } from '../nav.config'
import type { NavItem, NavSection } from '../types'

function itemVisible(user: CurrentUser | null, item: NavItem): boolean {
  if (item.anyOf?.length) return canAny(user, item.anyOf)
  if (item.permission) return can(user, item.permission)
  return true
}

/** Secciones del menú visibles para el usuario; las vacías se eliminan. */
export function visibleNavigation(user: CurrentUser | null): NavSection[] {
  return NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => itemVisible(user, item)),
  })).filter((section) => section.items.length > 0)
}

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

import type { ElementType } from 'react'

export type NavBadgeKey = 'quotes-draft' | 'receivables-overdue' | 'containers-active'

export interface NavItem {
  id: string
  href: string
  label: string
  icon: ElementType
  /** Permiso único requerido; si falta, el ítem es visible para todo usuario autenticado. */
  permission?: string
  /** Basta con uno de estos permisos. */
  anyOf?: string[]
  /** Contador opcional resuelto por `useNavBadges`. */
  badgeKey?: NavBadgeKey
  /** Sub-ítems (p. ej. secciones de Administración). */
  children?: NavItem[]
}

export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

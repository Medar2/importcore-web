import type { ElementType } from 'react'

export interface NavItem {
  id: string
  href: string
  label: string
  icon: ElementType
  /** Permiso único requerido; si falta, el ítem es visible para todo usuario autenticado. */
  permission?: string
  /** Basta con uno de estos permisos. */
  anyOf?: string[]
}

export interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

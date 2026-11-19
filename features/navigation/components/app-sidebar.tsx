'use client'

import Link from 'next/link'
import { Calculator, ChevronsLeft, ChevronsRight, Star, X } from 'lucide-react'
import { isNavItemActive } from '../utils/visible-navigation'
import { NavLink } from './nav-link'
import type { NavBadgeKey, NavItem, NavSection } from '../types'

interface AppSidebarProps {
  sections: NavSection[]
  collapsed?: boolean
  variant?: 'desktop' | 'mobile'
  className?: string
  badges?: Partial<Record<NavBadgeKey, number>>
  favoriteIds?: string[]
  onToggleFavorite?: (id: string) => void
  onToggle?: () => void
  onClose?: () => void
  onNavigate?: () => void
  pathname: string
}

function allNavItems(sections: NavSection[]): NavItem[] {
  return sections.flatMap((s) => s.items.flatMap((i) => [i, ...(i.children ?? [])]))
}

export function AppSidebar({
  sections,
  collapsed = false,
  variant = 'desktop',
  className = '',
  badges = {},
  favoriteIds = [],
  onToggleFavorite,
  onToggle,
  onClose,
  onNavigate,
  pathname,
}: AppSidebarProps) {
  const isMobile = variant === 'mobile'
  const itemsById = new Map(allNavItems(sections).map((item) => [item.id, item]))
  const favoriteItems = favoriteIds
    .map((id) => itemsById.get(id))
    .filter((item): item is NavItem => Boolean(item))

  const renderItem = (item: NavItem, nested = false) => {
    const childActive = item.children?.some((c) => isNavItemActive(pathname, c.href)) ?? false
    const active = isNavItemActive(pathname, item.href) && !childActive
    return (
      <div key={item.id}>
        <NavLink
          item={item}
          active={active}
          collapsed={collapsed}
          nested={nested}
          badge={item.badgeKey ? badges[item.badgeKey] : undefined}
          favorite={favoriteIds.includes(item.id)}
          onToggleFavorite={onToggleFavorite}
          onNavigate={onNavigate}
        />
        {!collapsed && item.children && (
          <div className="mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <NavLink
                key={child.id}
                item={child}
                active={isNavItemActive(pathname, child.href)}
                collapsed={false}
                nested
                favorite={favoriteIds.includes(child.id)}
                onToggleFavorite={onToggleFavorite}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className={`flex h-full flex-col bg-card ${className}`}>
      <div
        className={`flex h-14 shrink-0 items-center border-b border-border ${
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2"
          aria-label="ImportCore RD"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Calculator className="size-4" />
          </span>
          {!collapsed && <span className="text-sm font-bold">ImportCore RD</span>}
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            aria-expanded={!collapsed}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Navegación principal">
        {favoriteItems.length > 0 && (
          <div className={collapsed ? '' : 'mb-1'}>
            {!collapsed && (
              <p className="flex items-center gap-1 px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                <Star className="size-3 fill-current" /> Favoritos
              </p>
            )}
            <div className="space-y-1">
              {favoriteItems.map((item) =>
                renderItem({ ...item, children: undefined }),
              )}
            </div>
          </div>
        )}
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className={sectionIndex > 0 || favoriteItems.length > 0 ? 'mt-2' : ''}>
            {!collapsed && (
              <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

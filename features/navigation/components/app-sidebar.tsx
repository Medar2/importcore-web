'use client'

import Link from 'next/link'
import { Calculator, ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import { isNavItemActive } from '../utils/visible-navigation'
import { NavLink } from './nav-link'
import type { NavSection } from '../types'

interface AppSidebarProps {
  sections: NavSection[]
  collapsed?: boolean
  variant?: 'desktop' | 'mobile'
  className?: string
  onToggle?: () => void
  onClose?: () => void
  onNavigate?: () => void
  pathname: string
}

export function AppSidebar({
  sections,
  collapsed = false,
  variant = 'desktop',
  className = '',
  onToggle,
  onClose,
  onNavigate,
  pathname,
}: AppSidebarProps) {
  const isMobile = variant === 'mobile'

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
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className={sectionIndex > 0 ? 'mt-2' : ''}>
            {!collapsed && (
              <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.id}
                  item={item}
                  active={isNavItemActive(pathname, item.href)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

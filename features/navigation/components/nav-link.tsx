'use client'

import Link from 'next/link'
import { Star } from 'lucide-react'
import type { NavItem } from '../types'

interface NavLinkProps {
  item: NavItem
  active: boolean
  collapsed?: boolean
  nested?: boolean
  stacked?: boolean
  badge?: number
  favorite?: boolean
  onToggleFavorite?: (id: string) => void
  onNavigate?: () => void
}

const linkCls = (active: boolean, collapsed: boolean, nested: boolean, stacked: boolean) =>
  `group/nav relative flex items-center rounded-lg font-medium transition ${
    stacked
      ? 'flex-1 flex-col gap-0.5 px-2 py-1.5 text-[10px]'
      : collapsed
        ? 'justify-center gap-3 px-2 py-2 text-sm'
        : `gap-3 px-3 py-2 text-sm ${nested ? 'ml-5' : ''}`
  } ${
    active
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
  }`

export function NavLink({
  item,
  active,
  collapsed = false,
  nested = false,
  stacked = false,
  badge,
  favorite = false,
  onToggleFavorite,
  onNavigate,
}: NavLinkProps) {
  const Icon = item.icon
  return (
    <div className={stacked ? 'relative flex flex-1' : 'group relative'}>
      <Link
        href={item.href}
        onClick={onNavigate}
        title={collapsed && !stacked ? item.label : undefined}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className={linkCls(active, collapsed, nested, stacked)}
      >
        <span className="relative">
          <Icon className={stacked ? 'size-5' : 'size-4 shrink-0'} />
          {stacked && badge != null && badge > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </span>
        {(!collapsed || stacked) && <span className="truncate">{item.label}</span>}
        {!collapsed && !stacked && badge != null && badge > 0 && (
          <span
            className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
              active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/10 text-primary'
            }`}
          >
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        {collapsed && badge != null && badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </Link>
      {onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleFavorite(item.id)
          }}
          aria-label={favorite ? `Quitar ${item.label} de favoritos` : `Marcar ${item.label} como favorito`}
          aria-pressed={favorite}
          className={`absolute z-10 flex size-5 items-center justify-center rounded-full transition ${
            favorite
              ? 'text-amber-500 opacity-100'
              : 'text-muted-foreground opacity-0 hover:bg-secondary hover:text-foreground group-hover/nav:opacity-100'
          } ${collapsed ? '-right-1 -top-1' : `${badge != null && badge > 0 ? 'right-8' : 'right-1.5'} top-1/2 -translate-y-1/2`}`}
        >
          <Star className={`size-3.5 ${favorite ? 'fill-current' : ''}`} />
        </button>
      )}
    </div>
  )
}

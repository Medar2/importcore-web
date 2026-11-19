'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  CornerDownLeft,
  FileText,
  Package,
  Search,
  Users,
} from 'lucide-react'
import type { ElementType } from 'react'
import { useCurrentUser } from '@/features/auth/hooks/use-current-user'
import { IMPORTCORE_PERMS, can } from '@/features/auth/utils/permissions'
import { customersService } from '@/features/customers/services/customers.service'
import { productsService } from '@/features/products/services/products.service'
import { vendorsService } from '@/features/vendors/services/vendors.service'
import type { Customer } from '@/features/customers/types'
import type { Product } from '@/features/products/types'
import type { Vendor } from '@/features/vendors/types'
import type { NavItem, NavSection } from '../types'

interface PaletteResult {
  id: string
  label: string
  hint?: string
  icon: ElementType
  href: string
  group: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  sections: NavSection[]
}

interface EntityCache {
  customers: Customer[]
  products: Product[]
  vendors: Vendor[]
}

const GROUP_LABELS: Record<string, string> = {
  modules: 'Ir a',
  customers: 'Clientes',
  products: 'Productos',
  vendors: 'Proveedores',
}

export function CommandPalette({ open, onClose, sections }: CommandPaletteProps) {
  const router = useRouter()
  const { user } = useCurrentUser()
  const [query, setQuery] = useState('')
  const [entities, setEntities] = useState<EntityCache | null>(null)
  const [entitiesLoading, setEntitiesLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canSearchCustomers = can(user, IMPORTCORE_PERMS.CUSTOMERS_READ)
  const canSearchProducts = can(user, IMPORTCORE_PERMS.PRODUCTS_READ)
  const canSearchVendors = can(user, IMPORTCORE_PERMS.VENDORS_READ)

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    setEntities(null)
    inputRef.current?.focus()
  }, [open])

  // Carga perezosa de catálogos la primera vez que se busca una entidad.
  useEffect(() => {
    if (!open || entities || entitiesLoading || query.trim().length < 2) return
    let cancelled = false
    setEntitiesLoading(true)
    Promise.all([
      canSearchCustomers ? customersService.list().catch(() => [] as Customer[]) : Promise.resolve([] as Customer[]),
      canSearchProducts ? productsService.list().catch(() => [] as Product[]) : Promise.resolve([] as Product[]),
      canSearchVendors ? vendorsService.list().catch(() => [] as Vendor[]) : Promise.resolve([] as Vendor[]),
    ]).then(([customers, products, vendors]) => {
      if (!cancelled) setEntities({ customers, products, vendors })
    }).finally(() => {
      if (!cancelled) setEntitiesLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [open, query, entities, entitiesLoading, canSearchCustomers, canSearchProducts, canSearchVendors])

  const results = useMemo<PaletteResult[]>(() => {
    const term = query.trim().toLowerCase()
    const out: PaletteResult[] = []

    const flatItems: NavItem[] = sections.flatMap((s) =>
      s.items.flatMap((i) => [i, ...(i.children ?? [])]),
    )
    for (const item of flatItems) {
      if (term && !item.label.toLowerCase().includes(term)) continue
      out.push({
        id: `nav-${item.id}`,
        label: item.label,
        hint: 'Módulo',
        icon: item.icon,
        href: item.href,
        group: 'modules',
      })
    }

    if (term.length >= 2 && entities) {
      for (const c of entities.customers) {
        if (`${c.name} ${c.taxId}`.toLowerCase().includes(term)) {
          out.push({
            id: `customer-${c.id}`,
            label: c.name,
            hint: c.taxId || 'Cliente',
            icon: Users,
            href: `/customers/${c.id}`,
            group: 'customers',
          })
        }
      }
      for (const p of entities.products) {
        if (`${p.sku} ${p.description}`.toLowerCase().includes(term)) {
          out.push({
            id: `product-${p.id}`,
            label: p.description,
            hint: p.sku,
            icon: Package,
            href: `/products/${p.id}`,
            group: 'products',
          })
        }
      }
      for (const v of entities.vendors) {
        if (`${v.name} ${v.tradeName ?? ''}`.toLowerCase().includes(term)) {
          out.push({
            id: `vendor-${v.id}`,
            label: v.name,
            hint: v.tradeName || v.countryCode || 'Proveedor',
            icon: Building2,
            href: `/vendors/${v.id}`,
            group: 'vendors',
          })
        }
      }
    }
    return out.slice(0, 30)
  }, [query, sections, entities])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  function go(result: PaletteResult | undefined) {
    if (!result) return
    onClose()
    router.push(result.href)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, Math.min(i + 1, results.length - 1)))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      go(results[activeIndex])
    }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  if (!open) return null

  let flatIndex = -1
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[12vh]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Búsqueda global"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar módulos, clientes, productos, proveedores…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
          {entitiesLoading && (
            <p className="px-3 py-2 text-xs text-muted-foreground">Buscando en catálogos…</p>
          )}
          {!entitiesLoading && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              {query.trim() ? 'Sin resultados para esa búsqueda.' : 'Escribe para buscar en catálogos.'}
            </p>
          )}
          {(() => {
            let lastGroup = ''
            return results.map((result) => {
              flatIndex += 1
              const index = flatIndex
              const showHeader = result.group !== lastGroup
              lastGroup = result.group
              const Icon = result.icon
              return (
                <div key={result.id}>
                  {showHeader && (
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {GROUP_LABELS[result.group] ?? result.group}
                    </p>
                  )}
                  <button
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(result)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                      index === activeIndex ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate font-medium">{result.label}</span>
                    {result.hint && (
                      <span className={`shrink-0 text-xs ${index === activeIndex ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {result.hint}
                      </span>
                    )}
                    {index === activeIndex && <CornerDownLeft className="size-3.5 shrink-0" />}
                  </button>
                </div>
              )
            })
          })()}
        </div>
        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="rounded border border-border px-1">↑↓</kbd> navegar</span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-border px-1">↵</kbd> abrir</span>
          <span className="ml-auto flex items-center gap-1"><FileText className="size-3" /> ImportCore RD</span>
        </div>
      </div>
    </div>
  )
}

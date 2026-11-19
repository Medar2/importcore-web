'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react'
import { ordersService } from '@/features/orders/services/orders.service'
import type { OrderPage } from '@/features/orders/services/orders.service'
import { ORDER_STEPS, STATUS_LABEL, statusLabel } from '@/features/orders/utils/order-status'
import { withPermission } from '@/features/auth/components/permission-gate'
import { IMPORTCORE_PERMS } from '@/features/auth/utils/permissions'

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  CONFIRMED: 'bg-info/15 text-info',
  IN_TRANSIT: 'bg-warning/15 text-warning',
  ARRIVED: 'bg-primary/15 text-primary',
  READY: 'bg-success/15 text-success',
  DISPATCHED: 'bg-success text-success-foreground',
  CANCELLED: 'bg-destructive/15 text-destructive',
}

const STATUS_OPTIONS = [...ORDER_STEPS, 'CANCELLED' as const]
const PAGE_SIZES = [10, 20, 50]

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

function OrdersPageContent() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [data, setData] = useState<OrderPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ordersService
      .list({ search: debouncedSearch, status, page, pageSize })
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, status, page, pageSize])

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <main className="min-h-dvh bg-background">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Pedidos</h1>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número, cliente, RNC o notas…"
              className={`${inputCls} pl-9`}
            />
          </label>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className={`${inputCls} sm:w-48`}
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando…
          </p>
        )}
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {!loading && data && data.items.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {debouncedSearch || status
              ? 'Sin pedidos para esos filtros.'
              : 'Sin pedidos. En Cotizaciones, marque una como aceptada y pulse Crear pedido.'}
          </p>
        )}

        {data?.items.map((o) => (
          <article
            key={o.id}
            className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link href={`/orders/${o.id}`} className="font-semibold text-primary hover:underline">
                  {o.orderNumber}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {o.customer?.id ? (
                    <Link href={`/customers/${o.customer.id}`} className="text-primary hover:underline">
                      {o.customer.name}
                    </Link>
                  ) : (
                    o.customer?.name ?? 'Sin cliente'
                  )}{' '}
                  · {o.createdAt.slice(0, 10)}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLE[o.status] ?? ''}`}>
                {statusLabel(o.status)}
              </span>
            </div>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Total: </span>
              <b>${Number(o.totalUsd).toFixed(2)}</b>
            </p>
          </article>
        ))}

        {data && data.total > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {data.total} pedido(s) · página {data.page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="rounded-lg border border-input bg-background px-2 py-1.5 text-xs outline-none"
                aria-label="Pedidos por página"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} / página
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                <ChevronLeft className="size-3.5" /> Anterior
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                Siguiente <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default withPermission([IMPORTCORE_PERMS.ORDERS_READ], OrdersPageContent)

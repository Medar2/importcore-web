'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { ordersService } from '@/features/orders/services/orders.service'
import type { Order } from '@/features/orders/services/orders.service'
import { statusLabel } from '@/features/orders/utils/order-status'

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  CONFIRMED: 'bg-info/15 text-info',
  IN_TRANSIT: 'bg-warning/15 text-warning',
  ARRIVED: 'bg-primary/15 text-primary',
  READY: 'bg-success/15 text-success',
  DISPATCHED: 'bg-success text-success-foreground',
  CANCELLED: 'bg-destructive/15 text-destructive',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ordersService
      .list()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-dvh bg-background">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Pedidos</h1>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando…
          </p>
        )}
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {!loading && orders.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Sin pedidos. En Cotizaciones, marque una como aceptada y pulse Crear pedido.
          </p>
        )}

        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/orders/${o.id}`}
            className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  {o.customer?.name ?? 'Sin cliente'} · {o.createdAt.slice(0, 10)}
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
          </Link>
        ))}
      </div>
    </main>
  )
}

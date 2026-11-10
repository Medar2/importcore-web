'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Plus } from 'lucide-react'
import { purchasesService } from '@/features/purchases/services/purchases.service'
import type { PurchaseOrder } from '@/features/purchases/types'
import { NewPurchaseForm } from '@/features/purchases/components/new-purchase-form'
import {
  PURCHASE_STATUS_STYLE,
  purchaseStatusLabel,
} from '@/features/purchases/utils/purchase-status'

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  function load() {
    purchasesService
      .list()
      .then(setPurchases)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">Compras</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Nueva OC
        </button>
      </header>

      <div className="mx-auto max-w-3xl space-y-3 p-4">
        {showForm && (
          <NewPurchaseForm
            onCreated={() => {
              setShowForm(false)
              setError(null)
              load()
            }}
            onError={setError}
          />
        )}

        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Cargando…
          </p>
        )}
        {!loading && purchases.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Sin órdenes de compra. Crea la primera con “Nueva OC”.
          </p>
        )}

        {purchases.map((p) => (
          <Link
            key={p.id}
            href={`/purchases/${p.id}`}
            className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{p.poNumber}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.vendor?.name ?? 'Sin proveedor'} · {p.createdAt.slice(0, 10)}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${PURCHASE_STATUS_STYLE[p.status] ?? ''}`}>
                {purchaseStatusLabel(p.status)}
              </span>
            </div>
            <p className="mt-2 text-sm">
              <span className="text-muted-foreground">Total: </span>
              <b>${Number(p.totalUsd).toFixed(2)}</b>
              {p.expectedDate && (
                <span className="text-muted-foreground"> · Esperada {p.expectedDate}</span>
              )}
            </p>
          </Link>
        ))}
      </div>
    </main>
  )
}

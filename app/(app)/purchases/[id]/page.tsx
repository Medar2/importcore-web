'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { purchasesService } from '@/features/purchases/services/purchases.service'
import type { PurchaseBalance, PurchaseOrder } from '@/features/purchases/types'
import { PurchasePaymentForm } from '@/features/purchases/components/purchase-payment-form'
import {
  isPurchaseClosed,
  nextPurchaseStatuses,
  purchaseStatusLabel,
} from '@/features/purchases/utils/purchase-status'

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [po, setPo] = useState<PurchaseOrder | null>(null)
  const [balance, setBalance] = useState<PurchaseBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  function load() {
    Promise.all([purchasesService.get(id), purchasesService.balance(id)])
      .then(([p, b]) => {
        setPo(p)
        setBalance(b)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [id])

  async function changeStatus(to: string) {
    if (to === 'CANCELLED' && !window.confirm('¿Cancelar esta orden de compra?')) return
    setSaving(to)
    setError(null)
    try {
      await purchasesService.setStatus(id, to)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    )
  }
  if (!po) {
    return <main className="p-6 text-sm text-destructive">{error ?? 'Orden de compra no encontrada'}</main>
  }

  const pending = balance ? Number(balance.balanceUsd) >= 0.01 : false

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">{po.poNumber}</h1>
        <p className="text-xs text-muted-foreground">
          {po.vendor?.name} · {purchaseStatusLabel(po.status)}
          {po.order && (
            <>
              {' · Pedido '}
              <Link href={`/orders/${po.order.id}`} className="underline">{po.order.orderNumber}</Link>
            </>
          )}
        </p>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 p-4">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        {balance && (
          <section className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-4 text-center">
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Total</p>
              <p className="font-bold">${Number(balance.totalUsd).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Pagado</p>
              <p className="font-bold text-success">${Number(balance.paidUsd).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-muted-foreground">Por pagar</p>
              <p className={`font-bold ${pending ? 'text-warning' : 'text-success'}`}>
                ${Number(balance.balanceUsd).toFixed(2)}
              </p>
            </div>
          </section>
        )}

        {nextPurchaseStatuses(po.status).length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {nextPurchaseStatuses(po.status).map((to) => (
              <button
                key={to}
                onClick={() => changeStatus(to)}
                disabled={saving !== null}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60 ${
                  to === 'CANCELLED' ? 'border border-destructive/40 text-destructive' : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {saving === to && <Loader2 className="size-4 animate-spin" />}
                {to === 'CANCELLED' ? 'Cancelar OC' : `Pasar a: ${purchaseStatusLabel(to)}`}
              </button>
            ))}
          </div>
        )}

        {!isPurchaseClosed(po.status) && (
          <PurchasePaymentForm purchaseId={id} onPaid={load} onError={setError} />
        )}

        {po.notes && (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">{po.notes}</p>
        )}
      </div>
    </main>
  )
}

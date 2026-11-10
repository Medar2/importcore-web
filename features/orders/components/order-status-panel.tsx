'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ordersService } from '../services/orders.service'
import { ORDER_STEPS, nextStatuses, statusLabel } from '../utils/order-status'

interface Props {
  orderId: string
  status: string
  onChanged: () => void
  onError: (message: string) => void
}

export function OrderStatusPanel({ orderId, status, onChanged, onError }: Props) {
  const [saving, setSaving] = useState<string | null>(null)
  const currentIdx = ORDER_STEPS.indexOf(status as (typeof ORDER_STEPS)[number])
  const next = nextStatuses(status)

  async function advance(to: string) {
    let notes: string | undefined
    if (to === 'CANCELLED') {
      const reason = window.prompt('Motivo de la cancelación:')
      if (!reason) return
      notes = reason
    }
    setSaving(to)
    try {
      await ordersService.setStatus(orderId, to, notes)
      onChanged()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo cambiar el estado')
    } finally {
      setSaving(null)
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Etapa del pedido</h2>

      {status === 'CANCELLED' ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
          Pedido cancelado
        </p>
      ) : (
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ORDER_STEPS.map((step, i) => {
            const done = i < currentIdx
            const current = i === currentIdx
            return (
              <li
                key={step}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] leading-tight',
                  current && 'border-primary bg-primary/10 font-semibold text-primary',
                  done && 'border-success/40 text-success',
                  !done && !current && 'border-border text-muted-foreground',
                )}
              >
                {done && <Check className="size-3 shrink-0" />}
                {statusLabel(step)}
              </li>
            )
          })}
        </ol>
      )}

      {next.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          {next.map((to) => (
            <button
              key={to}
              onClick={() => advance(to)}
              disabled={saving !== null}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-60',
                to === 'CANCELLED'
                  ? 'border border-destructive/40 text-destructive'
                  : 'bg-secondary text-secondary-foreground',
              )}
            >
              {saving === to && <Loader2 className="size-4 animate-spin" />}
              {to === 'CANCELLED' ? 'Cancelar pedido' : `Pasar a: ${statusLabel(to)}`}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

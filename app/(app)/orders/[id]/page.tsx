'use client'

import { use, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Lock, Navigation, Send, Ship } from 'lucide-react'
import { ordersService } from '@/features/orders/services/orders.service'
import type { Order, OrderBalance, OrderTrackingResult } from '@/features/orders/services/orders.service'
import { OrderStatusPanel } from '@/features/orders/components/order-status-panel'
import { statusLabel } from '@/features/orders/utils/order-status'
import { OrderInvoicePanel } from '@/features/fiscal/components/order-invoice-panel'
import { apiGet } from '@/lib/api'

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [balance, setBalance] = useState<OrderBalance | null>(null)
  const [tracking, setTracking] = useState<OrderTrackingResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [rate, setRate] = useState('')
  const [method, setMethod] = useState('TRANSFER')
  const [reference, setReference] = useState('')
  const [paying, setPaying] = useState(false)
  const [dispatching, setDispatching] = useState(false)

  function load() {
    Promise.all([
      apiGet<Order>(`/orders/${id}`),
      ordersService.balance(id),
      ordersService.tracking(id).catch(() => null),
    ])
      .then(([o, b, t]) => {
        setOrder(o)
        setBalance(b)
        setTracking(t)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  async function pay(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPaying(true)
    try {
      await ordersService.pay(id, {
        amount,
        currency,
        exchangeRateToUsd: currency !== 'USD' ? rate : undefined,
        method,
        reference: reference || undefined,
      })
      setAmount('')
      setRate('')
      setReference('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar pago')
    } finally {
      setPaying(false)
    }
  }

  async function dispatch() {
    if (balance?.dispatchLocked) {
      const reason = window.prompt('Hay balance pendiente. Motivo del override (obligatorio):')
      if (!reason) return
      setDispatching(true)
      try {
        await ordersService.dispatch(id, reason)
        load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Despacho bloqueado')
      } finally {
        setDispatching(false)
      }
    } else {
      setDispatching(true)
      try {
        await ordersService.dispatch(id)
        load()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error')
      } finally {
        setDispatching(false)
      }
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    )
  }
  if (!order) {
    return <main className="p-6 text-sm text-destructive">{error ?? 'Pedido no encontrado'}</main>
  }

  const canDispatch = order.status === 'READY'

  return (
    <main className="min-h-dvh bg-background pb-10">
      <header className="sticky top-14 z-10 border-b border-border bg-card px-4 py-3">
        <h1 className="font-bold">{order.orderNumber}</h1>
        <p className="text-xs text-muted-foreground">{order.customer?.name} · {statusLabel(order.status)}</p>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 p-4">
        {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

        <OrderStatusPanel
          orderId={id}
          status={order.status}
          onChanged={() => {
            setError(null)
            load()
          }}
          onError={setError}
        />

        {/* Panel de Tracking Marítimo y Liberación Aduanal */}
        <section className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold">
              <Ship className="size-4 text-primary" /> Tracking Marítimo & Liberación
            </h2>
            {tracking?.container && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {tracking.container.containerNumber} ({tracking.container.containerType})
              </span>
            )}
          </div>

          {/* Mensaje de Liberación / Aviso Financiero */}
          {tracking?.liberationMessage && (
            <div
              className={`flex items-start gap-2.5 rounded-lg p-3 text-xs ${
                order.status === 'ARRIVED' && balance?.dispatchLocked
                  ? 'border border-destructive/40 bg-destructive/10 text-destructive'
                  : order.status === 'ARRIVED' && !balance?.dispatchLocked
                    ? 'border border-success/40 bg-success/10 text-success'
                    : 'border border-primary/30 bg-primary/5 text-foreground'
              }`}
            >
              {order.status === 'ARRIVED' && balance?.dispatchLocked ? (
                <AlertCircle className="size-4 shrink-0 text-destructive" />
              ) : order.status === 'ARRIVED' ? (
                <CheckCircle2 className="size-4 shrink-0 text-success" />
              ) : (
                <Navigation className="size-4 shrink-0 text-primary" />
              )}
              <div className="flex-1 leading-relaxed">
                <p className="font-semibold">
                  {order.status === 'ARRIVED' && balance?.dispatchLocked
                    ? 'Acción requerida para liberación'
                    : order.status === 'ARRIVED'
                      ? 'Liberación autorizada'
                      : 'Estado del envío'}
                </p>
                <p className="mt-0.5">{tracking.liberationMessage}</p>
              </div>
            </div>
          )}

          {/* Fechas Logísticas del Contenedor */}
          {tracking?.container ? (
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/30 p-2.5 text-center text-xs">
              <div>
                <span className="block text-[10px] uppercase text-muted-foreground">Zarpe (ETD)</span>
                <span className="font-semibold">{tracking.container.etd ?? '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-muted-foreground">Arribo Estimado (ETA)</span>
                <span className="font-semibold text-primary">{tracking.container.eta ?? '—'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase text-muted-foreground">Arribo Real (ATA)</span>
                <span className="font-semibold">{tracking.container.ata ?? '—'}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Pendiente de asignación a contenedor marítimo en origen (China).
            </p>
          )}
        </section>

        <OrderInvoicePanel orderId={id} orderStatus={order.status} onError={setError} />

        {balance && (
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Total</p>
                <p className="font-bold">${Number(balance.totalUsd).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Pagado</p>
                <p className="font-bold text-success">${Number(balance.paidUsd).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">Balance</p>
                <p className={`font-bold ${balance.dispatchLocked ? 'text-destructive' : 'text-success'}`}>
                  ${Number(balance.balanceUsd).toFixed(2)}
                </p>
              </div>
            </div>
            {balance.dispatchLocked && (
              <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <Lock className="size-3.5" /> Despacho bloqueado por saldo pendiente (BR-003)
              </p>
            )}
          </section>
        )}

        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Registrar pago / anticipo</h2>
          <form onSubmit={pay} className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            <select className={inputCls} value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="DOP">DOP</option>
              <option value="CNY">CNY</option>
            </select>
            {currency !== 'USD' && (
              <input className={`${inputCls} col-span-2`} placeholder="Tasa a USD (ej. 60.5)" value={rate} onChange={(e) => setRate(e.target.value)} required />
            )}
            <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
              {['TRANSFER', 'CASH', 'CHECK', 'CARD', 'OTHER'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input className={inputCls} placeholder="Referencia" value={reference} onChange={(e) => setReference(e.target.value)} />
            <button
              type="submit"
              disabled={paying}
              className="col-span-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {paying ? 'Registrando…' : 'Registrar pago'}
            </button>
          </form>
        </section>

        {canDispatch && (
          <button
            onClick={dispatch}
            disabled={dispatching}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {dispatching ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Autorizar despacho
          </button>
        )}
        {order.status === 'DISPATCHED' && (
          <p className="rounded-xl bg-success/15 px-4 py-3 text-center text-sm font-semibold text-success">
            Pedido despachado
          </p>
        )}
      </div>
    </main>
  )
}

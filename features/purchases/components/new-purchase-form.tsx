'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { ordersService } from '@/features/orders/services/orders.service'
import type { Order } from '@/features/orders/services/orders.service'
import { purchasesService } from '../services/purchases.service'

interface VendorOption {
  id: string
  name: string
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

const EMPTY = { vendorId: '', orderId: '', totalUsd: '', expectedDate: '', notes: '' }

interface Props {
  onCreated: () => void
  onError: (message: string) => void
}

export function NewPurchaseForm({ onCreated, onError }: Props) {
  const [vendors, setVendors] = useState<VendorOption[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([apiGet<VendorOption[]>('/vendors'), ordersService.list()])
      .then(([v, o]) => {
        setVendors(v)
        setOrders(o.filter((x) => !['DISPATCHED', 'CANCELLED'].includes(x.status)))
      })
      .catch((e) => onError(e.message))
  }, [onError])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await purchasesService.create({
        vendorId: form.vendorId,
        orderId: form.orderId || undefined,
        totalUsd: form.totalUsd,
        expectedDate: form.expectedDate || undefined,
        notes: form.notes || undefined,
      })
      setForm(EMPTY)
      onCreated()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al crear la OC')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Nueva orden de compra</h2>
      <div className="grid grid-cols-2 gap-2">
        <select className={`${inputCls} col-span-2`} value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })} required>
          <option value="">Proveedor *</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
        <select className={`${inputCls} col-span-2`} value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })}>
          <option value="">Sin pedido asociado</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>{o.orderNumber} · {o.customer?.name ?? 'Sin cliente'}</option>
          ))}
        </select>
        <input className={inputCls} placeholder="Total USD *" inputMode="decimal" pattern="\d+(\.\d{1,4})?" value={form.totalUsd} onChange={(e) => setForm({ ...form, totalUsd: e.target.value })} required />
        <input className={inputCls} type="date" aria-label="Fecha esperada" value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} />
        <input className={`${inputCls} col-span-2`} placeholder="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
      <button type="submit" disabled={saving} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
        {saving ? 'Guardando…' : 'Crear orden de compra'}
      </button>
    </form>
  )
}

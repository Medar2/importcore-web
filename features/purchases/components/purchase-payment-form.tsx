'use client'

import { useState } from 'react'
import { purchasesService } from '../services/purchases.service'

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring'

const METHODS = ['TRANSFER', 'CASH', 'CHECK', 'CARD', 'OTHER']

interface Props {
  purchaseId: string
  onPaid: () => void
  onError: (message: string) => void
}

/** Pago a proveedor multi-moneda (BR-004): DOP/CNY exigen tasa a USD. */
export function PurchasePaymentForm({ purchaseId, onPaid, onError }: Props) {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [rate, setRate] = useState('')
  const [method, setMethod] = useState('TRANSFER')
  const [reference, setReference] = useState('')
  const [paying, setPaying] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPaying(true)
    try {
      await purchasesService.pay(purchaseId, {
        amount,
        currency,
        exchangeRateToUsd: currency !== 'USD' ? rate : undefined,
        method,
        reference: reference || undefined,
      })
      setAmount('')
      setRate('')
      setReference('')
      onPaid()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al registrar pago')
    } finally {
      setPaying(false)
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Registrar pago al proveedor</h2>
      <form onSubmit={submit} className="grid grid-cols-2 gap-2">
        <input className={inputCls} placeholder="Monto" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <select className={inputCls} value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="USD">USD</option>
          <option value="DOP">DOP</option>
          <option value="CNY">CNY</option>
        </select>
        {currency !== 'USD' && (
          <input className={`${inputCls} col-span-2`} placeholder={`Tasa ${currency} por USD (ej. 60.5)`} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} required />
        )}
        <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value)}>
          {METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input className={inputCls} placeholder="Referencia" value={reference} onChange={(e) => setReference(e.target.value)} />
        <button type="submit" disabled={paying} className="col-span-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
          {paying ? 'Registrando…' : 'Registrar pago'}
        </button>
      </form>
    </section>
  )
}

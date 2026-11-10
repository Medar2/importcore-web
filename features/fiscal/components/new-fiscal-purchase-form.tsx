'use client'

import { useState } from 'react'
import { fiscalService } from '../services/fiscal.service'
import type { FiscalCatalogs } from '../types'
import { inputCls } from '../utils'

const EMPTY = {
  supplierTaxId: '', supplierName: '', goodsServicesType: '02', ncf: '', invoiceDate: '', paymentDate: '',
  servicesAmount: '', goodsAmount: '', itbisBilled: '', itbisWithheld: '', isrWithholdingType: '',
  isrWithheld: '', paymentMethod: '02',
}

interface Props {
  catalogs: FiscalCatalogs | null
  onCreated: () => void
  onError: (m: string) => void
}

export function NewFiscalPurchaseForm({ catalogs, onCreated, onError }: Props) {
  const [f, setF] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: e.target.value })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, v || undefined]))
      await fiscalService.createPurchase(body)
      setF(EMPTY)
      onCreated()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo registrar la compra')
    } finally {
      setSaving(false)
    }
  }

  const options = (c?: Record<string, string>) =>
    Object.entries(c ?? {}).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Registrar comprobante de compra (DOP)</h2>
      <div className="grid grid-cols-2 gap-2">
        <input className={inputCls} placeholder="RNC/cédula proveedor *" value={f.supplierTaxId} onChange={set('supplierTaxId')} required />
        <input className={inputCls} placeholder="NCF (B01… / E31…) *" value={f.ncf} onChange={set('ncf')} required />
        <input className={`${inputCls} col-span-2`} placeholder="Nombre del proveedor *" value={f.supplierName} onChange={set('supplierName')} required />
        <select className={`${inputCls} col-span-2`} value={f.goodsServicesType} onChange={set('goodsServicesType')}>{options(catalogs?.goodsServicesTypes)}</select>
        <label className="text-xs text-muted-foreground">Fecha comprobante *<input type="date" className={inputCls} value={f.invoiceDate} onChange={set('invoiceDate')} required /></label>
        <label className="text-xs text-muted-foreground">Fecha de pago<input type="date" className={inputCls} value={f.paymentDate} onChange={set('paymentDate')} /></label>
        <input className={inputCls} inputMode="decimal" placeholder="Monto servicios" value={f.servicesAmount} onChange={set('servicesAmount')} />
        <input className={inputCls} inputMode="decimal" placeholder="Monto bienes" value={f.goodsAmount} onChange={set('goodsAmount')} />
        <input className={inputCls} inputMode="decimal" placeholder="ITBIS facturado" value={f.itbisBilled} onChange={set('itbisBilled')} />
        <input className={inputCls} inputMode="decimal" placeholder="ITBIS retenido" value={f.itbisWithheld} onChange={set('itbisWithheld')} />
        <select className={inputCls} value={f.isrWithholdingType} onChange={set('isrWithholdingType')}>
          <option value="">Sin retención ISR</option>
          {options(catalogs?.isrWithholdingTypes)}
        </select>
        <input className={inputCls} inputMode="decimal" placeholder="ISR retenido" value={f.isrWithheld} onChange={set('isrWithheld')} />
        <select className={`${inputCls} col-span-2`} value={f.paymentMethod} onChange={set('paymentMethod')}>{options(catalogs?.purchasePaymentMethods)}</select>
      </div>
      <button type="submit" disabled={saving} className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">
        {saving ? 'Guardando…' : 'Registrar compra'}
      </button>
    </form>
  )
}

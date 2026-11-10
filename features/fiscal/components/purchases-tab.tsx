'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { fiscalService } from '../services/fiscal.service'
import type { FiscalCatalogs, FiscalPurchase } from '../types'
import { dop, fromMonthInput, inputCls, toMonthInput } from '../utils'
import { NewFiscalPurchaseForm } from './new-fiscal-purchase-form'

interface Props {
  period: string
  onPeriodChange: (p: string) => void
  catalogs: FiscalCatalogs | null
  onError: (m: string) => void
}

export function PurchasesTab({ period, onPeriodChange, catalogs, onError }: Props) {
  const [rows, setRows] = useState<FiscalPurchase[]>([])
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(() => {
    fiscalService.purchases(period).then(setRows).catch((e) => onError(e.message))
  }, [period, onError])
  useEffect(load, [load])

  async function remove(id: string) {
    if (!window.confirm('¿Eliminar este comprobante de compra?')) return
    try {
      await fiscalService.removePurchase(id)
      load()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'No se pudo eliminar')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input type="month" className={`${inputCls} max-w-48`} value={toMonthInput(period)} onChange={(e) => e.target.value && onPeriodChange(fromMonthInput(e.target.value))} />
        <button onClick={() => setShowForm((v) => !v)} className="ml-auto flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Compra
        </button>
      </div>

      {showForm && (
        <NewFiscalPurchaseForm catalogs={catalogs} onError={onError} onCreated={() => { setShowForm(false); load() }} />
      )}

      {rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Sin compras en este período. Registre las facturas locales (naviera, agente aduanal, transporte…).
        </p>
      )}

      {rows.map((r) => (
        <article key={r.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div className="min-w-0">
            <p className="truncate font-semibold">{r.supplierName}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-mono">{r.ncf}</span> · {r.invoiceDate} · {catalogs?.goodsServicesTypes[r.goodsServicesType] ?? r.goodsServicesType}
            </p>
            <p className="mt-1 text-sm">
              <b>{dop(String(Number(r.servicesAmount) + Number(r.goodsAmount)))}</b>
              <span className="text-muted-foreground"> · ITBIS {dop(r.itbisBilled)}</span>
            </p>
          </div>
          <button onClick={() => remove(r.id)} aria-label="Eliminar" className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-destructive">
            <Trash2 className="size-4" />
          </button>
        </article>
      ))}
    </div>
  )
}
